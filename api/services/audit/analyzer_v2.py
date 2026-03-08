"""
FORGE Audit Analyzer V2
Improved analysis engine with Semgrep-inspired rule system.
"""

import re
from typing import List, Dict, Optional, Any
from dataclasses import dataclass, field

from .rules.base import Rule, RuleMatch, Severity, Confidence
from .rules.loader import RuleLoader
from .fingerprint import generate_fingerprints
from .autofix import AutofixEngine
from .triage import infer_component_tags


@dataclass
class Finding:
    """A security finding from analysis."""
    finding_type: str
    severity: str
    confidence: str
    file_path: str
    line_number: int
    column_number: int
    code_snippet: str
    description: str
    rule_id: str
    cwe_id: Optional[str] = None
    owasp_category: Optional[str] = None
    exploit_reasoning: Optional[str] = None
    suggested_fix: Optional[Dict] = None
    references: List[str] = field(default_factory=list)
    matched_text: Optional[str] = None
    metavariables: Dict[str, str] = field(default_factory=dict)
    # Fingerprinting
    match_based_id: Optional[str] = None
    syntactic_id: Optional[str] = None
    # Autofix
    autofix_available: bool = False
    autofix_code: Optional[str] = None
    autofix_description: Optional[str] = None
    # Component tags
    component_tags: List[str] = field(default_factory=list)


@dataclass
class AnalysisContext:
    """Context for code analysis."""
    code: str
    language: str
    file_path: str = "input.txt"
    context_description: Optional[str] = None


@dataclass
class ScanOptions:
    """Options for controlling the scan."""
    rule_sets: Optional[List[str]] = None
    severity_filter: Optional[List[str]] = None
    exclude_rules: Optional[List[str]] = None
    include_rules: Optional[List[str]] = None
    max_findings_per_rule: int = 10
    include_low_confidence: bool = True


# Language detection patterns
LANGUAGE_PATTERNS = {
    "javascript": [r'\.js$', r'\.jsx$', r'\.mjs$', r'const\s+\w+\s*=', r'let\s+\w+\s*=', r'function\s+\w+\s*\(', r'=>'],
    "typescript": [r'\.ts$', r'\.tsx$', r':\s*(?:string|number|boolean|any)\b', r'interface\s+\w+', r'type\s+\w+\s*='],
    "python": [r'\.py$', r'def\s+\w+\s*\(', r'import\s+\w+', r'from\s+\w+\s+import', r'class\s+\w+:'],
    "go": [r'\.go$', r'func\s+\w+\s*\(', r'package\s+\w+', r':='],
    "rust": [r'\.rs$', r'fn\s+\w+\s*\(', r'let\s+mut\s+', r'impl\s+'],
    "java": [r'\.java$', r'public\s+class', r'private\s+\w+\s+\w+', r'@Override'],
    "ruby": [r'\.rb$', r'def\s+\w+', r'class\s+\w+\s*<', r'end$'],
    "php": [r'\.php$', r'<\?php', r'\$\w+\s*=', r'function\s+\w+\s*\('],
    "solidity": [r'\.sol$', r'pragma\s+solidity', r'contract\s+\w+'],
    "yaml": [r'\.ya?ml$', r'^\s*\w+:\s*'],
}


class AuditAnalyzerV2:
    """
    Improved static code analyzer for security vulnerabilities.
    Uses Semgrep-inspired rule system with better selectivity.
    """
    
    def __init__(self):
        self.rule_loader = RuleLoader()
        self.autofix_engine = AutofixEngine()
    
    def detect_language(self, code: str, file_path: str = "") -> str:
        """Detect the programming language of the code."""
        # Check file extension first
        for lang, patterns in LANGUAGE_PATTERNS.items():
            for pattern in patterns:
                if pattern.startswith(r'\.') and re.search(pattern, file_path, re.IGNORECASE):
                    return lang
        
        # Fall back to content analysis
        for lang, patterns in LANGUAGE_PATTERNS.items():
            matches = 0
            for pattern in patterns:
                if not pattern.startswith(r'\.') and re.search(pattern, code):
                    matches += 1
            if matches >= 2:  # Require at least 2 pattern matches
                return lang
        
        return "unknown"
    
    def analyze_code(
        self, 
        context: AnalysisContext,
        options: Optional[ScanOptions] = None
    ) -> List[Finding]:
        """
        Analyze code for security vulnerabilities using the rule system.
        Returns a list of findings.
        """
        options = options or ScanOptions()
        findings = []
        lines = context.code.split('\n')
        
        # Get applicable rules
        severity_filter = None
        if options.severity_filter:
            severity_filter = [
                Severity(s) for s in options.severity_filter 
                if s in [sev.value for sev in Severity]
            ]
        
        rules = self.rule_loader.get_rules(
            language=context.language,
            severity=severity_filter,
            rule_sets=options.rule_sets,
            exclude_rules=options.exclude_rules,
            include_rules=options.include_rules,
        )
        
        # Track findings per rule for limiting
        findings_per_rule: Dict[str, int] = {}
        
        for rule in rules:
            if rule.id in findings_per_rule and findings_per_rule[rule.id] >= options.max_findings_per_rule:
                continue
            
            # Skip low confidence if not included
            if not options.include_low_confidence and rule.confidence == Confidence.LOW:
                continue
            
            # Find matches
            matches = rule.find_matches(context.code, context.file_path)
            
            for match in matches:
                if findings_per_rule.get(rule.id, 0) >= options.max_findings_per_rule:
                    break
                
                # Get code snippet with context
                start_line = max(0, match.line_number - 3)
                end_line = min(len(lines), match.line_number + 2)
                snippet_lines = lines[start_line:end_line]
                code_snippet = '\n'.join(snippet_lines)
                
                # Build fix suggestion if available
                suggested_fix = None
                if rule.fix:
                    suggested_fix = {
                        "description": rule.fix,
                        "diff": None
                    }
                
                # Generate fingerprints for deduplication
                finding_index = findings_per_rule.get(rule.id, 0)
                fingerprints = generate_fingerprints(
                    file_path=context.file_path,
                    rule_id=rule.id,
                    matched_text=match.matched_text,
                    code_snippet=code_snippet,
                    line_number=match.line_number,
                    index=finding_index
                )
                
                # Try to generate autofix
                autofix_available = False
                autofix_code = None
                autofix_description = None
                
                autofix_result = self.autofix_engine.generate_fix(
                    rule_id=rule.id,
                    matched_text=match.matched_text,
                    code_snippet=code_snippet,
                    language=context.language
                )
                if autofix_result:
                    autofix_available = True
                    autofix_code = autofix_result.fixed_code
                    autofix_description = autofix_result.description
                    # Override suggested_fix with actual autofix
                    suggested_fix = {
                        "description": autofix_result.description,
                        "diff": autofix_result.diff,
                        "fixed_code": autofix_result.fixed_code,
                        "confidence": autofix_result.confidence
                    }
                
                # Infer component tags
                finding_type = self._extract_finding_type(rule.id)
                component_tags = infer_component_tags(
                    file_path=context.file_path,
                    finding_type=finding_type,
                    code_snippet=code_snippet
                )
                
                finding = Finding(
                    finding_type=finding_type,
                    severity=rule.severity.value,
                    confidence=rule.confidence.value,
                    file_path=context.file_path,
                    line_number=match.line_number,
                    column_number=match.column_start,
                    code_snippet=code_snippet,
                    description=rule.message,
                    rule_id=rule.id,
                    cwe_id=rule.cwe,
                    owasp_category=rule.owasp,
                    references=rule.references,
                    suggested_fix=suggested_fix,
                    matched_text=match.matched_text,
                    metavariables=match.metavariables,
                    # New fields
                    match_based_id=fingerprints.match_based_id,
                    syntactic_id=fingerprints.syntactic_id,
                    autofix_available=autofix_available,
                    autofix_code=autofix_code,
                    autofix_description=autofix_description,
                    component_tags=component_tags,
                )
                findings.append(finding)
                findings_per_rule[rule.id] = findings_per_rule.get(rule.id, 0) + 1
        
        # Deduplicate findings on same line with same rule
        seen = set()
        unique_findings = []
        for f in findings:
            key = (f.rule_id, f.file_path, f.line_number)
            if key not in seen:
                seen.add(key)
                unique_findings.append(f)
        
        # Sort by severity (critical first)
        severity_order = {"critical": 0, "high": 1, "medium": 2, "low": 3, "info": 4}
        unique_findings.sort(key=lambda f: (severity_order.get(f.severity, 5), f.line_number))
        
        return unique_findings
    
    def _extract_finding_type(self, rule_id: str) -> str:
        """Extract a finding type from the rule ID."""
        # Rule IDs are like "python.security.sql-injection.string-concat"
        parts = rule_id.split('.')
        if len(parts) >= 3:
            return parts[2].replace('-', '_')
        return rule_id.replace('.', '_').replace('-', '_')
    
    def analyze_files(
        self,
        files: Dict[str, str],
        options: Optional[ScanOptions] = None
    ) -> List[Finding]:
        """
        Analyze multiple files.
        
        Args:
            files: Dict mapping file paths to file contents
            options: Scan options
        
        Returns:
            List of all findings across files
        """
        all_findings = []
        
        for file_path, code in files.items():
            language = self.detect_language(code, file_path)
            context = AnalysisContext(
                code=code,
                language=language,
                file_path=file_path
            )
            findings = self.analyze_code(context, options)
            all_findings.extend(findings)
        
        return all_findings
    
    def count_lines(self, code: str) -> int:
        """Count non-empty lines of code."""
        return len([line for line in code.split('\n') if line.strip()])
    
    def get_severity_counts(self, findings: List[Finding]) -> Dict[str, int]:
        """Count findings by severity."""
        counts = {"critical": 0, "high": 0, "medium": 0, "low": 0}
        for finding in findings:
            if finding.severity in counts:
                counts[finding.severity] += 1
        return counts
    
    def get_available_rule_sets(self) -> List[str]:
        """Get list of available rule sets."""
        return self.rule_loader.list_rule_sets()
    
    def get_rule_stats(self) -> Dict:
        """Get statistics about available rules."""
        return self.rule_loader.get_stats()
    
    def to_sarif(self, findings: List[Finding], tool_name: str = "forge-audit") -> Dict:
        """Convert findings to SARIF format for GitHub/IDE integration."""
        rules_map = {}
        results = []
        
        for f in findings:
            # Build rule definition
            if f.rule_id not in rules_map:
                rules_map[f.rule_id] = {
                    "id": f.rule_id,
                    "name": f.finding_type.replace("_", " ").title(),
                    "shortDescription": {"text": f.description[:100]},
                    "fullDescription": {"text": f.description},
                    "helpUri": f.references[0] if f.references else None,
                    "properties": {
                        "security-severity": self._severity_to_score(f.severity),
                        "tags": ["security"]
                    }
                }
            
            # Build result
            results.append({
                "ruleId": f.rule_id,
                "level": self._severity_to_sarif_level(f.severity),
                "message": {"text": f.description},
                "locations": [{
                    "physicalLocation": {
                        "artifactLocation": {"uri": f.file_path},
                        "region": {
                            "startLine": f.line_number,
                            "startColumn": f.column_number,
                            "snippet": {"text": f.matched_text or ""}
                        }
                    }
                }],
                "fingerprints": {
                    "primaryLocationLineHash": f"{f.rule_id}:{f.file_path}:{f.line_number}"
                }
            })
        
        return {
            "$schema": "https://raw.githubusercontent.com/oasis-tcs/sarif-spec/master/Schemata/sarif-schema-2.1.0.json",
            "version": "2.1.0",
            "runs": [{
                "tool": {
                    "driver": {
                        "name": tool_name,
                        "version": "2.0.0",
                        "informationUri": "https://openframe.co/audit",
                        "rules": list(rules_map.values())
                    }
                },
                "results": results
            }]
        }
    
    def _severity_to_sarif_level(self, severity: str) -> str:
        """Convert severity to SARIF level."""
        mapping = {
            "critical": "error",
            "high": "error",
            "medium": "warning",
            "low": "note",
            "info": "note"
        }
        return mapping.get(severity, "warning")
    
    def _severity_to_score(self, severity: str) -> str:
        """Convert severity to security-severity score."""
        mapping = {
            "critical": "9.0",
            "high": "7.0",
            "medium": "5.0",
            "low": "3.0",
            "info": "1.0"
        }
        return mapping.get(severity, "5.0")
