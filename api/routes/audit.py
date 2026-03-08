"""
FORGE Audit API Routes
Security scanning and analysis endpoints.
"""

import json
import uuid
from datetime import datetime
from typing import List, Optional
from decimal import Decimal

from fastapi import APIRouter, Depends, HTTPException, status, BackgroundTasks
from pydantic import BaseModel, Field
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, desc

from db.database import get_db
from db.models import AuditScan, AuditFinding, AuditDependency, Subscription, User
from auth.api_key import ApiKeyData, validate_api_key
from auth.dependencies import get_current_user
from services.audit.analyzer import AuditAnalyzer, AnalysisContext, Finding
from services.audit.reasoning import ForgeReasoningEngine
from services.pricing import calculate_cost
from services.usage import log_usage

router = APIRouter(prefix="/v1/audit", tags=["Audit"])

# Initialize services
analyzer = AuditAnalyzer()


# =============================================================================
# Request/Response Models
# =============================================================================

class ScanOptions(BaseModel):
    include_dependencies: bool = True
    severity_threshold: str = "low"  # Only report findings >= this severity
    languages: Optional[List[str]] = None
    exclude_paths: Optional[List[str]] = None
    use_llm_analysis: bool = True  # Use FORGE for deep analysis
    model: str = "forge-coder"  # Model to use for analysis


class StartScanRequest(BaseModel):
    source: str = Field(..., description="Source type: paste, github, gitlab, zip")
    code: Optional[str] = Field(None, description="Code content for paste source")
    repo_url: Optional[str] = Field(None, description="Repository URL for github/gitlab")
    branch: str = "main"
    language: Optional[str] = None
    options: ScanOptions = Field(default_factory=ScanOptions)


class QuickAnalyzeRequest(BaseModel):
    code: str = Field(..., description="Code to analyze")
    language: Optional[str] = None
    context: Optional[str] = Field(None, description="Additional context about the code")
    model: str = "forge-coder"


class ExplainRequest(BaseModel):
    finding_id: str
    model: str = "forge-coder"


class PatchRequest(BaseModel):
    finding_id: str
    model: str = "forge-coder"


class FindingResponse(BaseModel):
    id: str
    type: str
    severity: str
    confidence: str
    file: str
    line: int
    column: int
    code_snippet: str
    description: str
    exploit_reasoning: Optional[str] = None
    suggested_fix: Optional[dict] = None
    cwe_id: Optional[str] = None
    owasp_category: Optional[str] = None
    references: List[str] = []


class ScanSummary(BaseModel):
    total_findings: int
    critical: int
    high: int
    medium: int
    low: int
    files_scanned: int
    lines_of_code: int


class ScanResponse(BaseModel):
    scan_id: str
    status: str
    source_type: str
    repo_url: Optional[str] = None
    branch: Optional[str] = None
    created_at: str
    completed_at: Optional[str] = None
    summary: Optional[ScanSummary] = None
    findings: Optional[List[FindingResponse]] = None
    usage: Optional[dict] = None


class ScanListItem(BaseModel):
    scan_id: str
    status: str
    source_type: str
    repo_url: Optional[str] = None
    created_at: str
    summary: Optional[ScanSummary] = None


# =============================================================================
# Helper Functions
# =============================================================================

def finding_to_response(finding: AuditFinding) -> FindingResponse:
    """Convert database finding to API response."""
    suggested_fix = None
    if finding.suggested_fix:
        try:
            suggested_fix = json.loads(finding.suggested_fix)
        except:
            suggested_fix = {"description": finding.suggested_fix}
    
    references = []
    if finding.references:
        try:
            references = json.loads(finding.references)
        except:
            references = []
    
    return FindingResponse(
        id=str(finding.id),
        type=finding.finding_type,
        severity=finding.severity,
        confidence=finding.confidence,
        file=finding.file_path,
        line=finding.line_number or 0,
        column=finding.column_number or 0,
        code_snippet=finding.code_snippet or "",
        description=finding.description,
        exploit_reasoning=finding.exploit_reasoning,
        suggested_fix=suggested_fix,
        cwe_id=finding.cwe_id,
        owasp_category=finding.owasp_category,
        references=references
    )


def scan_to_response(scan: AuditScan, include_findings: bool = False) -> ScanResponse:
    """Convert database scan to API response."""
    summary = ScanSummary(
        total_findings=scan.total_findings or 0,
        critical=scan.critical_count or 0,
        high=scan.high_count or 0,
        medium=scan.medium_count or 0,
        low=scan.low_count or 0,
        files_scanned=scan.files_scanned or 0,
        lines_of_code=scan.lines_of_code or 0
    )
    
    findings = None
    if include_findings and scan.findings:
        findings = [finding_to_response(f) for f in scan.findings]
    
    return ScanResponse(
        scan_id=str(scan.id),
        status=scan.status,
        source_type=scan.source_type,
        repo_url=scan.repo_url,
        branch=scan.branch,
        created_at=scan.created_at.isoformat() if scan.created_at else "",
        completed_at=scan.completed_at.isoformat() if scan.completed_at else None,
        summary=summary if scan.status == "completed" else None,
        findings=findings,
        usage={
            "tokens_used": scan.tokens_used or 0,
            "cost": float(scan.cost or 0)
        } if scan.status == "completed" else None
    )


async def run_analysis(
    scan_id: uuid.UUID,
    code: str,
    language: str,
    options: ScanOptions,
    api_key: ApiKeyData,
    db: AsyncSession
):
    """Background task to run the actual analysis."""
    try:
        # Get the scan record
        result = await db.execute(select(AuditScan).where(AuditScan.id == scan_id))
        scan = result.scalar_one_or_none()
        if not scan:
            return
        
        # Update status to running
        scan.status = "running"
        scan.started_at = datetime.utcnow()
        await db.commit()
        
        # Run static analysis
        context = AnalysisContext(
            code=code,
            language=language,
            file_path="input.txt"
        )
        
        findings = analyzer.analyze_code(context)
        
        # Filter by severity threshold
        severity_order = {"critical": 0, "high": 1, "medium": 2, "low": 3}
        threshold = severity_order.get(options.severity_threshold, 3)
        findings = [f for f in findings if severity_order.get(f.severity, 3) <= threshold]
        
        total_tokens = 0
        
        # Optionally enrich with LLM analysis
        if options.use_llm_analysis and findings:
            reasoning_engine = ForgeReasoningEngine(model=options.model)
            
            for finding in findings[:10]:  # Limit to 10 findings for cost control
                enriched = await reasoning_engine.analyze_vulnerability(
                    finding=finding,
                    code_context=finding.code_snippet,
                    language=language
                )
                finding.exploit_reasoning = enriched.exploit_reasoning
                finding.suggested_fix = enriched.suggested_fix
                total_tokens += 2000  # Estimate per analysis
        
        # Save findings to database
        severity_counts = {"critical": 0, "high": 0, "medium": 0, "low": 0}
        
        for finding in findings:
            severity_counts[finding.severity] = severity_counts.get(finding.severity, 0) + 1
            
            db_finding = AuditFinding(
                scan_id=scan_id,
                finding_type=finding.finding_type,
                severity=finding.severity,
                confidence=finding.confidence,
                file_path=finding.file_path,
                line_number=finding.line_number,
                column_number=finding.column_number,
                code_snippet=finding.code_snippet,
                description=finding.description,
                exploit_reasoning=finding.exploit_reasoning,
                suggested_fix=json.dumps(finding.suggested_fix) if finding.suggested_fix else None,
                cwe_id=finding.cwe_id,
                owasp_category=finding.owasp_category,
                references=json.dumps(finding.references) if finding.references else None
            )
            db.add(db_finding)
        
        # Calculate cost
        cost = calculate_cost(options.model, api_key.plan, total_tokens, total_tokens // 2)
        
        # Update scan with results
        scan.status = "completed"
        scan.completed_at = datetime.utcnow()
        scan.total_findings = len(findings)
        scan.critical_count = severity_counts["critical"]
        scan.high_count = severity_counts["high"]
        scan.medium_count = severity_counts["medium"]
        scan.low_count = severity_counts["low"]
        scan.files_scanned = 1
        scan.lines_of_code = analyzer.count_lines(code)
        scan.tokens_used = total_tokens
        scan.cost = cost
        scan.model = options.model
        
        # Deduct credits
        if api_key.plan != "metered":
            sub_result = await db.execute(
                select(Subscription).where(Subscription.user_id == api_key.user_id)
            )
            subscription = sub_result.scalar_one_or_none()
            if subscription:
                subscription.credit_balance = max(Decimal("0"), subscription.credit_balance - cost)
        
        # Log usage
        await log_usage(db, api_key.user_id, total_tokens, total_tokens // 2, cost=float(cost))
        
        await db.commit()
        
    except Exception as e:
        # Update scan with error
        result = await db.execute(select(AuditScan).where(AuditScan.id == scan_id))
        scan = result.scalar_one_or_none()
        if scan:
            scan.status = "failed"
            scan.error_message = str(e)
            await db.commit()


# =============================================================================
# API Endpoints
# =============================================================================

@router.post("/scan", response_model=ScanResponse)
async def start_scan(
    request: StartScanRequest,
    background_tasks: BackgroundTasks,
    api_key: ApiKeyData = Depends(validate_api_key),
    db: AsyncSession = Depends(get_db)
):
    """
    Start a new security audit scan.
    
    Supports multiple input sources:
    - paste: Direct code input
    - github: GitHub repository URL (coming soon)
    - gitlab: GitLab repository URL (coming soon)
    - zip: Uploaded ZIP archive (coming soon)
    """
    # Validate source
    if request.source == "paste":
        if not request.code:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Code content required for paste source"
            )
        code = request.code
        language = request.language or analyzer.detect_language(code)
        
    elif request.source in ["github", "gitlab"]:
        raise HTTPException(
            status_code=status.HTTP_501_NOT_IMPLEMENTED,
            detail=f"{request.source} integration coming soon. Use 'paste' source for now."
        )
    else:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid source type: {request.source}"
        )
    
    # Create scan record
    scan = AuditScan(
        user_id=api_key.user_id,
        source_type=request.source,
        repo_url=request.repo_url,
        branch=request.branch,
        status="queued",
        languages=json.dumps([language]) if language else None,
        model=request.options.model
    )
    db.add(scan)
    await db.commit()
    await db.refresh(scan)
    
    # Run analysis in background
    background_tasks.add_task(
        run_analysis,
        scan.id,
        code,
        language,
        request.options,
        api_key,
        db
    )
    
    return scan_to_response(scan)


@router.get("/scan/{scan_id}", response_model=ScanResponse)
async def get_scan(
    scan_id: str,
    api_key: ApiKeyData = Depends(validate_api_key),
    db: AsyncSession = Depends(get_db)
):
    """Get the status and results of a scan."""
    try:
        scan_uuid = uuid.UUID(scan_id)
    except ValueError:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid scan ID format"
        )
    
    result = await db.execute(
        select(AuditScan)
        .where(AuditScan.id == scan_uuid)
        .where(AuditScan.user_id == api_key.user_id)
    )
    scan = result.scalar_one_or_none()
    
    if not scan:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Scan not found"
        )
    
    return scan_to_response(scan, include_findings=True)


@router.get("/scans", response_model=List[ScanListItem])
async def list_scans(
    limit: int = 20,
    offset: int = 0,
    api_key: ApiKeyData = Depends(validate_api_key),
    db: AsyncSession = Depends(get_db)
):
    """List user's audit scans."""
    result = await db.execute(
        select(AuditScan)
        .where(AuditScan.user_id == api_key.user_id)
        .order_by(desc(AuditScan.created_at))
        .limit(limit)
        .offset(offset)
    )
    scans = result.scalars().all()
    
    return [
        ScanListItem(
            scan_id=str(s.id),
            status=s.status,
            source_type=s.source_type,
            repo_url=s.repo_url,
            created_at=s.created_at.isoformat() if s.created_at else "",
            summary=ScanSummary(
                total_findings=s.total_findings or 0,
                critical=s.critical_count or 0,
                high=s.high_count or 0,
                medium=s.medium_count or 0,
                low=s.low_count or 0,
                files_scanned=s.files_scanned or 0,
                lines_of_code=s.lines_of_code or 0
            ) if s.status == "completed" else None
        )
        for s in scans
    ]


@router.delete("/scan/{scan_id}")
async def delete_scan(
    scan_id: str,
    api_key: ApiKeyData = Depends(validate_api_key),
    db: AsyncSession = Depends(get_db)
):
    """Delete a scan and its findings."""
    try:
        scan_uuid = uuid.UUID(scan_id)
    except ValueError:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid scan ID format"
        )
    
    result = await db.execute(
        select(AuditScan)
        .where(AuditScan.id == scan_uuid)
        .where(AuditScan.user_id == api_key.user_id)
    )
    scan = result.scalar_one_or_none()
    
    if not scan:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Scan not found"
        )
    
    await db.delete(scan)
    await db.commit()
    
    return {"status": "deleted", "scan_id": scan_id}


@router.post("/analyze")
async def quick_analyze(
    request: QuickAnalyzeRequest,
    api_key: ApiKeyData = Depends(validate_api_key),
    db: AsyncSession = Depends(get_db)
):
    """
    Quick single-file analysis without creating a persistent scan.
    Returns findings immediately.
    """
    language = request.language or analyzer.detect_language(request.code)
    
    context = AnalysisContext(
        code=request.code,
        language=language,
        file_path="input.txt",
        context_description=request.context
    )
    
    # Run static analysis
    findings = analyzer.analyze_code(context)
    
    # Optionally enrich with LLM
    total_tokens = 0
    if findings:
        reasoning_engine = ForgeReasoningEngine(model=request.model)
        
        for finding in findings[:5]:  # Limit for quick analysis
            enriched = await reasoning_engine.analyze_vulnerability(
                finding=finding,
                code_context=finding.code_snippet,
                language=language
            )
            finding.exploit_reasoning = enriched.exploit_reasoning
            finding.suggested_fix = enriched.suggested_fix
            total_tokens += 1500
    
    # Calculate and log usage
    cost = calculate_cost(request.model, api_key.plan, total_tokens, total_tokens // 2)
    
    if api_key.plan != "metered":
        sub_result = await db.execute(
            select(Subscription).where(Subscription.user_id == api_key.user_id)
        )
        subscription = sub_result.scalar_one_or_none()
        if subscription:
            subscription.credit_balance = max(Decimal("0"), subscription.credit_balance - cost)
    
    await log_usage(db, api_key.user_id, total_tokens, total_tokens // 2, cost=float(cost))
    await db.commit()
    
    severity_counts = analyzer.get_severity_counts(findings)
    
    return {
        "language": language,
        "lines_of_code": analyzer.count_lines(request.code),
        "summary": {
            "total_findings": len(findings),
            **severity_counts
        },
        "findings": [
            {
                "type": f.finding_type,
                "severity": f.severity,
                "confidence": f.confidence,
                "line": f.line_number,
                "column": f.column_number,
                "code_snippet": f.code_snippet,
                "description": f.description,
                "exploit_reasoning": f.exploit_reasoning,
                "suggested_fix": f.suggested_fix,
                "cwe_id": f.cwe_id,
                "owasp_category": f.owasp_category
            }
            for f in findings
        ],
        "usage": {
            "tokens_used": total_tokens,
            "cost": float(cost)
        }
    }


class TryAuditRequest(BaseModel):
    code: str = Field(..., description="Code to analyze")
    language: Optional[str] = None
    model: str = "forge-coder"
    save: bool = Field(False, description="Save results to dashboard")


@router.post("/try")
async def try_audit(
    request: TryAuditRequest,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Try It Now - Quick analysis for signed-in users (no paid subscription required).
    Limited to static analysis only (no LLM enrichment) for free users.
    Optionally saves results to user's dashboard.
    """
    language = request.language or analyzer.detect_language(request.code)
    
    context = AnalysisContext(
        code=request.code,
        language=language,
        file_path="input.txt",
        context_description=None
    )
    
    # Run static analysis
    findings = analyzer.analyze_code(context)
    
    # Check if user has a subscription for LLM enrichment
    # Default to "testing" plan for free usage during development
    sub_result = await db.execute(
        select(Subscription).where(Subscription.user_id == user.id)
    )
    subscription = sub_result.scalar_one_or_none()
    plan = subscription.plan if subscription and subscription.status == "active" else "testing"
    
    total_tokens = 0
    
    # Only enrich with LLM if user has paid subscription or testing plan
    if plan not in ["free"] and findings:
        reasoning_engine = ForgeReasoningEngine(model=request.model)
        
        for finding in findings[:3]:  # Limit for try feature
            enriched = await reasoning_engine.analyze_vulnerability(
                finding=finding,
                code_context=finding.code_snippet,
                language=language
            )
            finding.exploit_reasoning = enriched.exploit_reasoning
            finding.suggested_fix = enriched.suggested_fix
            total_tokens += 1000
        
        # Deduct credits for paid users
        if subscription:
            cost = calculate_cost(request.model, plan, total_tokens, total_tokens // 2)
            subscription.credit_balance = max(Decimal("0"), subscription.credit_balance - cost)
            await log_usage(db, str(user.id), total_tokens, total_tokens // 2, cost=float(cost))
    
    severity_counts = analyzer.get_severity_counts(findings)
    scan_id = None
    
    # Optionally save to dashboard
    if request.save:
        scan = AuditScan(
            user_id=user.id,
            source_type="paste",
            status="completed",
            completed_at=datetime.utcnow(),
            total_findings=len(findings),
            critical_count=severity_counts.get("critical", 0),
            high_count=severity_counts.get("high", 0),
            medium_count=severity_counts.get("medium", 0),
            low_count=severity_counts.get("low", 0),
            files_scanned=1,
            lines_of_code=analyzer.count_lines(request.code),
            languages=json.dumps([language]) if language else None,
            tokens_used=total_tokens,
            model=request.model
        )
        db.add(scan)
        await db.flush()
        
        # Save findings
        for f in findings:
            db_finding = AuditFinding(
                scan_id=scan.id,
                finding_type=f.finding_type,
                severity=f.severity,
                confidence=f.confidence,
                file_path=f.file_path,
                line_number=f.line_number,
                column_number=f.column_number,
                code_snippet=f.code_snippet,
                description=f.description,
                exploit_reasoning=f.exploit_reasoning,
                suggested_fix=json.dumps(f.suggested_fix) if f.suggested_fix else None,
                cwe_id=f.cwe_id,
                owasp_category=f.owasp_category
            )
            db.add(db_finding)
        
        scan_id = str(scan.id)
    
    await db.commit()
    
    return {
        "scan_id": scan_id,
        "language": language,
        "lines_of_code": analyzer.count_lines(request.code),
        "plan": plan,
        "summary": {
            "total_findings": len(findings),
            **severity_counts
        },
        "findings": [
            {
                "type": f.finding_type,
                "severity": f.severity,
                "confidence": f.confidence,
                "line": f.line_number,
                "column": f.column_number,
                "code_snippet": f.code_snippet,
                "description": f.description,
                "exploit_reasoning": f.exploit_reasoning,
                "suggested_fix": f.suggested_fix,
                "cwe_id": f.cwe_id,
                "owasp_category": f.owasp_category
            }
            for f in findings
        ],
        "usage": {
            "tokens_used": total_tokens,
            "cost": 0 if plan == "free" else float(calculate_cost(request.model, plan, total_tokens, total_tokens // 2))
        }
    }


# =============================================================================
# Dashboard Endpoints (JWT Auth)
# =============================================================================

@router.get("/dashboard/scans")
async def dashboard_list_scans(
    limit: int = 20,
    offset: int = 0,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """List user's audit scans for dashboard (JWT auth)."""
    result = await db.execute(
        select(AuditScan)
        .where(AuditScan.user_id == user.id)
        .order_by(desc(AuditScan.created_at))
        .limit(limit)
        .offset(offset)
    )
    scans = result.scalars().all()
    
    return [
        {
            "scan_id": str(s.id),
            "status": s.status,
            "source_type": s.source_type,
            "repo_url": s.repo_url,
            "created_at": s.created_at.isoformat() if s.created_at else "",
            "summary": {
                "total_findings": s.total_findings or 0,
                "critical": s.critical_count or 0,
                "high": s.high_count or 0,
                "medium": s.medium_count or 0,
                "low": s.low_count or 0,
            } if s.status == "completed" else None
        }
        for s in scans
    ]


@router.get("/dashboard/scan/{scan_id}")
async def dashboard_get_scan(
    scan_id: str,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Get scan details for dashboard (JWT auth)."""
    try:
        scan_uuid = uuid.UUID(scan_id)
    except ValueError:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid scan ID format"
        )
    
    result = await db.execute(
        select(AuditScan)
        .where(AuditScan.id == scan_uuid)
        .where(AuditScan.user_id == user.id)
    )
    scan = result.scalar_one_or_none()
    
    if not scan:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Scan not found"
        )
    
    # Get findings
    findings_result = await db.execute(
        select(AuditFinding)
        .where(AuditFinding.scan_id == scan.id)
        .order_by(
            # Order by severity
            AuditFinding.severity.desc()
        )
    )
    findings = findings_result.scalars().all()
    
    return {
        "scan_id": str(scan.id),
        "status": scan.status,
        "source_type": scan.source_type,
        "repo_url": scan.repo_url,
        "created_at": scan.created_at.isoformat() if scan.created_at else "",
        "completed_at": scan.completed_at.isoformat() if scan.completed_at else None,
        "summary": {
            "total_findings": scan.total_findings or 0,
            "critical": scan.critical_count or 0,
            "high": scan.high_count or 0,
            "medium": scan.medium_count or 0,
            "low": scan.low_count or 0,
            "files_scanned": scan.files_scanned or 0,
            "lines_of_code": scan.lines_of_code or 0,
        },
        "findings": [
            {
                "id": str(f.id),
                "type": f.finding_type,
                "severity": f.severity,
                "confidence": f.confidence,
                "file_path": f.file_path,
                "line": f.line_number,
                "column": f.column_number,
                "code_snippet": f.code_snippet,
                "description": f.description,
                "exploit_reasoning": f.exploit_reasoning,
                "suggested_fix": json.loads(f.suggested_fix) if f.suggested_fix else None,
                "cwe_id": f.cwe_id,
                "owasp_category": f.owasp_category,
                "status": f.finding_status
            }
            for f in findings
        ],
        "usage": {
            "tokens_used": scan.tokens_used or 0,
            "cost": float(scan.cost or 0)
        }
    }


@router.post("/explain")
async def explain_vulnerability(
    request: ExplainRequest,
    api_key: ApiKeyData = Depends(validate_api_key),
    db: AsyncSession = Depends(get_db)
):
    """Generate detailed exploit reasoning for a specific finding."""
    try:
        finding_uuid = uuid.UUID(request.finding_id)
    except ValueError:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid finding ID format"
        )
    
    # Get the finding
    result = await db.execute(
        select(AuditFinding)
        .join(AuditScan)
        .where(AuditFinding.id == finding_uuid)
        .where(AuditScan.user_id == api_key.user_id)
    )
    db_finding = result.scalar_one_or_none()
    
    if not db_finding:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Finding not found"
        )
    
    # Generate explanation
    reasoning_engine = ForgeReasoningEngine(model=request.model)
    
    finding = Finding(
        finding_type=db_finding.finding_type,
        severity=db_finding.severity,
        confidence=db_finding.confidence,
        file_path=db_finding.file_path,
        line_number=db_finding.line_number or 0,
        column_number=db_finding.column_number or 0,
        code_snippet=db_finding.code_snippet or "",
        description=db_finding.description
    )
    
    explanation = await reasoning_engine.generate_exploit_reasoning(
        finding=finding,
        code_context=db_finding.code_snippet or ""
    )
    
    # Update finding with explanation
    db_finding.exploit_reasoning = explanation
    await db.commit()
    
    # Log usage
    tokens = 1000
    cost = calculate_cost(request.model, api_key.plan, tokens, tokens)
    await log_usage(db, api_key.user_id, tokens, tokens, cost=float(cost))
    
    return {
        "finding_id": request.finding_id,
        "exploit_reasoning": explanation,
        "usage": {
            "tokens_used": tokens * 2,
            "cost": float(cost)
        }
    }


@router.post("/patch")
async def generate_patch(
    request: PatchRequest,
    api_key: ApiKeyData = Depends(validate_api_key),
    db: AsyncSession = Depends(get_db)
):
    """Generate a code patch to fix a specific vulnerability."""
    try:
        finding_uuid = uuid.UUID(request.finding_id)
    except ValueError:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid finding ID format"
        )
    
    # Get the finding
    result = await db.execute(
        select(AuditFinding)
        .join(AuditScan)
        .where(AuditFinding.id == finding_uuid)
        .where(AuditScan.user_id == api_key.user_id)
    )
    db_finding = result.scalar_one_or_none()
    
    if not db_finding:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Finding not found"
        )
    
    # Generate patch
    reasoning_engine = ForgeReasoningEngine(model=request.model)
    
    finding = Finding(
        finding_type=db_finding.finding_type,
        severity=db_finding.severity,
        confidence=db_finding.confidence,
        file_path=db_finding.file_path,
        line_number=db_finding.line_number or 0,
        column_number=db_finding.column_number or 0,
        code_snippet=db_finding.code_snippet or "",
        description=db_finding.description
    )
    
    patch = await reasoning_engine.generate_patch(
        finding=finding,
        code=db_finding.code_snippet or "",
        language="unknown"
    )
    
    # Update finding with patch
    db_finding.suggested_fix = json.dumps({
        "description": patch.description,
        "diff": patch.diff,
        "explanation": patch.explanation
    })
    await db.commit()
    
    # Log usage
    tokens = 1200
    cost = calculate_cost(request.model, api_key.plan, tokens, tokens)
    await log_usage(db, api_key.user_id, tokens, tokens, cost=float(cost))
    
    return {
        "finding_id": request.finding_id,
        "patch": {
            "description": patch.description,
            "diff": patch.diff,
            "explanation": patch.explanation
        },
        "usage": {
            "tokens_used": tokens * 2,
            "cost": float(cost)
        }
    }


@router.get("/report/{scan_id}")
async def get_report(
    scan_id: str,
    format: str = "json",
    api_key: ApiKeyData = Depends(validate_api_key),
    db: AsyncSession = Depends(get_db)
):
    """
    Get a formatted security report for a scan.
    
    Formats:
    - json: Full JSON report
    - sarif: SARIF format for GitHub/IDE integration
    - markdown: Human-readable markdown
    """
    try:
        scan_uuid = uuid.UUID(scan_id)
    except ValueError:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid scan ID format"
        )
    
    result = await db.execute(
        select(AuditScan)
        .where(AuditScan.id == scan_uuid)
        .where(AuditScan.user_id == api_key.user_id)
    )
    scan = result.scalar_one_or_none()
    
    if not scan:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Scan not found"
        )
    
    if scan.status != "completed":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Scan not completed. Current status: {scan.status}"
        )
    
    # Convert findings to Finding objects
    findings = [
        Finding(
            finding_type=f.finding_type,
            severity=f.severity,
            confidence=f.confidence,
            file_path=f.file_path,
            line_number=f.line_number or 0,
            column_number=f.column_number or 0,
            code_snippet=f.code_snippet or "",
            description=f.description,
            cwe_id=f.cwe_id,
            owasp_category=f.owasp_category,
            exploit_reasoning=f.exploit_reasoning
        )
        for f in scan.findings
    ]
    
    if format == "sarif":
        return analyzer.to_sarif(findings)
    
    elif format == "markdown":
        # Generate markdown report
        md = f"""# FORGE Audit Security Report

**Scan ID:** {scan_id}
**Date:** {scan.completed_at.isoformat() if scan.completed_at else 'N/A'}
**Source:** {scan.source_type}
**Repository:** {scan.repo_url or 'Direct input'}

## Summary

| Severity | Count |
|----------|-------|
| Critical | {scan.critical_count} |
| High | {scan.high_count} |
| Medium | {scan.medium_count} |
| Low | {scan.low_count} |
| **Total** | **{scan.total_findings}** |

## Findings

"""
        for i, f in enumerate(findings, 1):
            md += f"""### {i}. {f.finding_type.replace('_', ' ').title()} [{f.severity.upper()}]

**File:** `{f.file_path}:{f.line_number}`
**CWE:** {f.cwe_id or 'N/A'}

{f.description}

```
{f.code_snippet}
```

"""
            if f.exploit_reasoning:
                md += f"**Exploit Scenario:** {f.exploit_reasoning}\n\n"
        
        return {"format": "markdown", "content": md}
    
    else:  # json
        return {
            "scan_id": scan_id,
            "completed_at": scan.completed_at.isoformat() if scan.completed_at else None,
            "source_type": scan.source_type,
            "repo_url": scan.repo_url,
            "summary": {
                "total_findings": scan.total_findings,
                "critical": scan.critical_count,
                "high": scan.high_count,
                "medium": scan.medium_count,
                "low": scan.low_count,
                "files_scanned": scan.files_scanned,
                "lines_of_code": scan.lines_of_code
            },
            "findings": [
                {
                    "type": f.finding_type,
                    "severity": f.severity,
                    "confidence": f.confidence,
                    "file": f.file_path,
                    "line": f.line_number,
                    "description": f.description,
                    "exploit_reasoning": f.exploit_reasoning,
                    "cwe_id": f.cwe_id,
                    "owasp_category": f.owasp_category
                }
                for f in findings
            ]
        }
