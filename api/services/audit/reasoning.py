"""
FORGE Reasoning Engine for Audit
Uses FORGE models for semantic vulnerability analysis.
"""

import json
from typing import List, Dict, Optional
from dataclasses import dataclass

from ..inference import inference_client
from .analyzer import Finding


@dataclass
class EnrichedFinding:
    """A finding enriched with LLM analysis."""
    original: Finding
    is_true_positive: bool
    confidence_score: float
    exploit_reasoning: str
    suggested_fix: Dict
    severity_justification: str


@dataclass
class PatchSuggestion:
    """A suggested code patch."""
    description: str
    diff: str
    explanation: str


SYSTEM_PROMPT = """You are FORGE Audit, an AI security analyst specializing in code vulnerability detection.
Your role is to analyze code for security vulnerabilities with precision and provide actionable remediation advice.

When analyzing vulnerabilities:
1. Determine if the finding is a true positive or false positive
2. Explain how the vulnerability could be exploited in practice
3. Provide specific, working code fixes
4. Reference relevant CWE/OWASP standards

Be concise but thorough. Focus on practical security impact."""


class ForgeReasoningEngine:
    """
    LLM-powered reasoning engine for security analysis.
    Uses FORGE models to enrich static analysis findings.
    """
    
    def __init__(self, model: str = "forge-coder"):
        self.model = model
        self.system_prompt = SYSTEM_PROMPT
    
    async def analyze_vulnerability(
        self,
        finding: Finding,
        code_context: str,
        language: str = "unknown"
    ) -> EnrichedFinding:
        """
        Use FORGE to deeply analyze a vulnerability finding.
        
        Args:
            finding: The static analysis finding to analyze
            code_context: Surrounding code for context
            language: Programming language
            
        Returns:
            EnrichedFinding with LLM analysis
        """
        prompt = f"""Analyze this potential security vulnerability:

**Type:** {finding.finding_type}
**Severity:** {finding.severity}
**File:** {finding.file_path}:{finding.line_number}
**Language:** {language}

**Code:**
```{language}
{code_context}
```

**Initial Description:** {finding.description}

Please provide:
1. **True Positive Assessment**: Is this a real vulnerability? (yes/no with confidence 0-100)
2. **Exploit Scenario**: How could an attacker exploit this? Be specific.
3. **Severity Justification**: Is the severity rating appropriate? Why?
4. **Recommended Fix**: Provide the exact code change needed.

Respond in JSON format:
{{
  "is_true_positive": true/false,
  "confidence": 0-100,
  "exploit_reasoning": "detailed explanation",
  "severity_justification": "explanation",
  "suggested_fix": {{
    "description": "what to change",
    "diff": "- old code\\n+ new code"
  }}
}}"""

        try:
            response = await inference_client.chat_completion(
                messages=[
                    {"role": "system", "content": self.system_prompt},
                    {"role": "user", "content": prompt}
                ],
                model=self.model,
                temperature=0.3,
                max_tokens=1500
            )
            
            content = response.get("choices", [{}])[0].get("message", {}).get("content", "{}")
            
            # Parse JSON from response
            try:
                # Try to extract JSON from markdown code blocks
                if "```json" in content:
                    content = content.split("```json")[1].split("```")[0]
                elif "```" in content:
                    content = content.split("```")[1].split("```")[0]
                
                analysis = json.loads(content.strip())
            except json.JSONDecodeError:
                # Fallback to basic analysis
                analysis = {
                    "is_true_positive": True,
                    "confidence": 70,
                    "exploit_reasoning": finding.description,
                    "severity_justification": f"Severity {finding.severity} based on vulnerability type",
                    "suggested_fix": {
                        "description": "Review and fix the identified vulnerability",
                        "diff": ""
                    }
                }
            
            return EnrichedFinding(
                original=finding,
                is_true_positive=analysis.get("is_true_positive", True),
                confidence_score=analysis.get("confidence", 70) / 100,
                exploit_reasoning=analysis.get("exploit_reasoning", ""),
                suggested_fix=analysis.get("suggested_fix", {}),
                severity_justification=analysis.get("severity_justification", "")
            )
            
        except Exception as e:
            # Return original finding with minimal enrichment on error
            return EnrichedFinding(
                original=finding,
                is_true_positive=True,
                confidence_score=0.5,
                exploit_reasoning=f"Analysis error: {str(e)}",
                suggested_fix={"description": "Manual review required", "diff": ""},
                severity_justification="Unable to analyze"
            )
    
    async def generate_exploit_reasoning(
        self,
        finding: Finding,
        code_context: str
    ) -> str:
        """
        Generate detailed exploit reasoning for a vulnerability.
        """
        prompt = f"""Explain how this vulnerability could be exploited:

**Vulnerability Type:** {finding.finding_type}
**Location:** {finding.file_path}:{finding.line_number}

**Vulnerable Code:**
```
{code_context}
```

Provide a step-by-step explanation of:
1. What the vulnerability is
2. How an attacker would discover it
3. What payload or technique they would use
4. What damage could result

Be specific and technical, but concise."""

        try:
            response = await inference_client.chat_completion(
                messages=[
                    {"role": "system", "content": self.system_prompt},
                    {"role": "user", "content": prompt}
                ],
                model=self.model,
                temperature=0.4,
                max_tokens=800
            )
            
            return response.get("choices", [{}])[0].get("message", {}).get("content", "")
            
        except Exception as e:
            return f"Unable to generate exploit reasoning: {str(e)}"
    
    async def generate_patch(
        self,
        finding: Finding,
        code: str,
        language: str = "unknown"
    ) -> PatchSuggestion:
        """
        Generate a code patch to fix a vulnerability.
        """
        prompt = f"""Generate a secure code fix for this vulnerability:

**Vulnerability:** {finding.finding_type}
**Description:** {finding.description}
**Language:** {language}

**Current Code:**
```{language}
{code}
```

Provide:
1. A brief description of the fix
2. The exact diff (using - for removed lines, + for added lines)
3. An explanation of why this fix works

Respond in JSON:
{{
  "description": "brief fix description",
  "diff": "- old line\\n+ new line",
  "explanation": "why this fixes the issue"
}}"""

        try:
            response = await inference_client.chat_completion(
                messages=[
                    {"role": "system", "content": self.system_prompt},
                    {"role": "user", "content": prompt}
                ],
                model=self.model,
                temperature=0.2,
                max_tokens=1000
            )
            
            content = response.get("choices", [{}])[0].get("message", {}).get("content", "{}")
            
            try:
                if "```json" in content:
                    content = content.split("```json")[1].split("```")[0]
                elif "```" in content:
                    content = content.split("```")[1].split("```")[0]
                
                patch_data = json.loads(content.strip())
            except json.JSONDecodeError:
                patch_data = {
                    "description": "Manual fix required",
                    "diff": "",
                    "explanation": content
                }
            
            return PatchSuggestion(
                description=patch_data.get("description", ""),
                diff=patch_data.get("diff", ""),
                explanation=patch_data.get("explanation", "")
            )
            
        except Exception as e:
            return PatchSuggestion(
                description="Unable to generate patch",
                diff="",
                explanation=str(e)
            )
    
    async def filter_false_positives(
        self,
        findings: List[Finding],
        code_context: Dict[str, str]
    ) -> List[Finding]:
        """
        Filter out likely false positives from findings.
        Uses LLM to assess each finding's validity.
        
        Args:
            findings: List of findings to filter
            code_context: Dict mapping file paths to code content
            
        Returns:
            Filtered list of likely true positives
        """
        filtered = []
        
        for finding in findings:
            context = code_context.get(finding.file_path, finding.code_snippet)
            
            enriched = await self.analyze_vulnerability(
                finding=finding,
                code_context=context
            )
            
            # Keep findings with >50% confidence of being true positives
            if enriched.is_true_positive and enriched.confidence_score > 0.5:
                # Update finding with enriched data
                finding.exploit_reasoning = enriched.exploit_reasoning
                finding.suggested_fix = enriched.suggested_fix
                filtered.append(finding)
        
        return filtered
    
    async def generate_executive_summary(
        self,
        findings: List[Finding],
        repo_name: str = "repository"
    ) -> str:
        """
        Generate an executive summary of the audit findings.
        """
        severity_counts = {"critical": 0, "high": 0, "medium": 0, "low": 0}
        for f in findings:
            if f.severity in severity_counts:
                severity_counts[f.severity] += 1
        
        finding_types = list(set(f.finding_type for f in findings))
        
        prompt = f"""Generate a brief executive summary for a security audit:

**Repository:** {repo_name}
**Total Findings:** {len(findings)}
**Critical:** {severity_counts['critical']}
**High:** {severity_counts['high']}
**Medium:** {severity_counts['medium']}
**Low:** {severity_counts['low']}

**Vulnerability Types Found:** {', '.join(finding_types)}

Write a 2-3 paragraph executive summary suitable for management that:
1. Summarizes the overall security posture
2. Highlights the most critical issues
3. Provides a high-level remediation recommendation

Keep it professional and concise."""

        try:
            response = await inference_client.chat_completion(
                messages=[
                    {"role": "system", "content": "You are a professional security auditor writing executive summaries."},
                    {"role": "user", "content": prompt}
                ],
                model=self.model,
                temperature=0.5,
                max_tokens=500
            )
            
            return response.get("choices", [{}])[0].get("message", {}).get("content", "")
            
        except Exception as e:
            return f"Security audit completed with {len(findings)} findings. Manual review recommended."
