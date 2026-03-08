"""
FORGE Audit - Triage Service
Manage finding lifecycle: open, reviewing, to_fix, ignored, fixed, removed.
"""

from enum import Enum
from typing import Optional, List, Dict, Any
from datetime import datetime
from dataclasses import dataclass


class TriageStatus(str, Enum):
    """Finding triage statuses (Semgrep-inspired)."""
    OPEN = "open"           # New finding, not yet reviewed
    REVIEWING = "reviewing" # Under review
    TO_FIX = "to_fix"       # Acknowledged, scheduled for fix
    IGNORED = "ignored"     # Intentionally ignored
    FIXED = "fixed"         # Fixed in code
    REMOVED = "removed"     # No longer detected (rule changed, file deleted, etc.)


class IgnoreReason(str, Enum):
    """Reasons for ignoring a finding."""
    FALSE_POSITIVE = "false_positive"       # Not actually a vulnerability
    ACCEPTABLE_RISK = "acceptable_risk"     # Risk accepted by team
    TEST_CODE = "test_code"                 # In test file, not production
    WILL_NOT_FIX = "will_not_fix"           # Won't be fixed for other reasons
    DUPLICATE = "duplicate"                 # Duplicate of another finding
    MITIGATED = "mitigated"                 # Mitigated by other controls


class ComponentTag(str, Enum):
    """Component tags for categorizing findings."""
    AUTH = "auth"                   # Authentication related
    PAYMENTS = "payments"           # Payment processing
    INFRASTRUCTURE = "infrastructure"  # Infrastructure/DevOps
    API = "api"                     # API endpoints
    DATABASE = "database"           # Database operations
    CRYPTO = "crypto"               # Cryptography
    USER_INPUT = "user_input"       # User input handling
    FILE_SYSTEM = "file_system"     # File system operations
    NETWORK = "network"             # Network operations
    LOGGING = "logging"             # Logging/monitoring


@dataclass
class TriageAction:
    """A triage action to apply to a finding."""
    status: TriageStatus
    reason: Optional[IgnoreReason] = None
    comment: Optional[str] = None
    user_id: Optional[str] = None


@dataclass
class FindingComparison:
    """Comparison result between two scans."""
    new_findings: List[str]         # Finding IDs that are new
    fixed_findings: List[str]       # Finding IDs that were fixed
    unchanged_findings: List[str]   # Finding IDs that are unchanged
    reintroduced_findings: List[str]  # Finding IDs that came back


def infer_component_tags(
    file_path: str,
    finding_type: str,
    code_snippet: str
) -> List[str]:
    """
    Automatically infer component tags based on context.
    
    Args:
        file_path: Path to the file
        finding_type: Type of finding (sql_injection, etc.)
        code_snippet: The code that triggered the finding
    
    Returns:
        List of component tag strings
    """
    tags = []
    
    # Infer from file path
    path_lower = file_path.lower()
    
    if any(x in path_lower for x in ['auth', 'login', 'session', 'jwt', 'oauth']):
        tags.append(ComponentTag.AUTH.value)
    
    if any(x in path_lower for x in ['payment', 'billing', 'stripe', 'checkout', 'order']):
        tags.append(ComponentTag.PAYMENTS.value)
    
    if any(x in path_lower for x in ['infra', 'deploy', 'docker', 'k8s', 'terraform', 'config']):
        tags.append(ComponentTag.INFRASTRUCTURE.value)
    
    if any(x in path_lower for x in ['api', 'route', 'endpoint', 'controller', 'handler']):
        tags.append(ComponentTag.API.value)
    
    if any(x in path_lower for x in ['db', 'database', 'model', 'repository', 'query']):
        tags.append(ComponentTag.DATABASE.value)
    
    # Infer from finding type
    if finding_type in ['sql_injection', 'nosql_injection']:
        if ComponentTag.DATABASE.value not in tags:
            tags.append(ComponentTag.DATABASE.value)
    
    if finding_type in ['xss', 'command_injection', 'path_traversal']:
        if ComponentTag.USER_INPUT.value not in tags:
            tags.append(ComponentTag.USER_INPUT.value)
    
    if finding_type in ['weak_hash_md5', 'weak_hash_sha1', 'insecure_random', 'crypto_misuse']:
        if ComponentTag.CRYPTO.value not in tags:
            tags.append(ComponentTag.CRYPTO.value)
    
    if finding_type in ['ssrf']:
        if ComponentTag.NETWORK.value not in tags:
            tags.append(ComponentTag.NETWORK.value)
    
    if finding_type in ['hardcoded_secret', 'jwt_no_verification']:
        if ComponentTag.AUTH.value not in tags:
            tags.append(ComponentTag.AUTH.value)
    
    # Infer from code snippet
    code_lower = code_snippet.lower() if code_snippet else ""
    
    if any(x in code_lower for x in ['password', 'token', 'secret', 'credential']):
        if ComponentTag.AUTH.value not in tags:
            tags.append(ComponentTag.AUTH.value)
    
    if any(x in code_lower for x in ['log.', 'logger.', 'console.log', 'print(']):
        if ComponentTag.LOGGING.value not in tags:
            tags.append(ComponentTag.LOGGING.value)
    
    return tags


def compare_scans(
    current_findings: List[Dict[str, Any]],
    previous_findings: List[Dict[str, Any]]
) -> FindingComparison:
    """
    Compare findings between two scans to identify new, fixed, and unchanged.
    
    Args:
        current_findings: List of findings from current scan (with match_based_id)
        previous_findings: List of findings from previous scan (with match_based_id)
    
    Returns:
        FindingComparison with categorized finding IDs
    """
    # Build sets of match_based_id bases (without index)
    def get_base_id(match_based_id: str) -> str:
        return match_based_id.rsplit('_', 1)[0] if match_based_id else ""
    
    current_ids = {
        get_base_id(f.get("match_based_id", "")): f.get("id")
        for f in current_findings
        if f.get("match_based_id")
    }
    
    previous_ids = {
        get_base_id(f.get("match_based_id", "")): f.get("id")
        for f in previous_findings
        if f.get("match_based_id")
    }
    
    current_bases = set(current_ids.keys())
    previous_bases = set(previous_ids.keys())
    
    # New: in current but not in previous
    new_bases = current_bases - previous_bases
    new_findings = [current_ids[b] for b in new_bases if b]
    
    # Fixed: in previous but not in current
    fixed_bases = previous_bases - current_bases
    fixed_findings = [previous_ids[b] for b in fixed_bases if b]
    
    # Unchanged: in both
    unchanged_bases = current_bases & previous_bases
    unchanged_findings = [current_ids[b] for b in unchanged_bases if b]
    
    # Reintroduced: would need historical data, skip for now
    reintroduced_findings = []
    
    return FindingComparison(
        new_findings=new_findings,
        fixed_findings=fixed_findings,
        unchanged_findings=unchanged_findings,
        reintroduced_findings=reintroduced_findings
    )


def calculate_fix_rate(
    total_findings: int,
    fixed_findings: int,
    ignored_findings: int
) -> float:
    """
    Calculate the fix rate for a project.
    
    Fix rate = (fixed + ignored) / total * 100
    """
    if total_findings == 0:
        return 100.0
    
    return ((fixed_findings + ignored_findings) / total_findings) * 100


def prioritize_findings(findings: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
    """
    Prioritize findings for triage.
    
    Priority order:
    1. Critical severity
    2. High severity with auth/payments tags
    3. High severity
    4. Medium severity
    5. Low severity
    
    Within each level, sort by:
    - High confidence first
    - Newer findings first
    """
    def priority_key(f: Dict[str, Any]) -> tuple:
        severity_order = {"critical": 0, "high": 1, "medium": 2, "low": 3, "info": 4}
        confidence_order = {"high": 0, "medium": 1, "low": 2}
        
        severity = severity_order.get(f.get("severity", "medium"), 2)
        confidence = confidence_order.get(f.get("confidence", "medium"), 1)
        
        # Boost priority for auth/payments
        tags = f.get("component_tags", [])
        if isinstance(tags, str):
            import json
            try:
                tags = json.loads(tags)
            except:
                tags = []
        
        has_critical_tag = any(t in tags for t in ["auth", "payments"])
        tag_boost = 0 if has_critical_tag else 1
        
        return (severity, tag_boost, confidence)
    
    return sorted(findings, key=priority_key)
