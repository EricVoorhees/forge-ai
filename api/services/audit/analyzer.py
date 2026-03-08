"""
FORGE Audit Analyzer
Core analysis engine for security scanning.
"""

import re
import json
from typing import List, Dict, Optional, Tuple
from dataclasses import dataclass, field
from enum import Enum


class Severity(str, Enum):
    CRITICAL = "critical"
    HIGH = "high"
    MEDIUM = "medium"
    LOW = "low"


class FindingType(str, Enum):
    SQL_INJECTION = "sql_injection"
    COMMAND_INJECTION = "command_injection"
    XSS = "xss"
    CSRF = "csrf"
    AUTH_BYPASS = "auth_bypass"
    CRYPTO_MISUSE = "crypto_misuse"
    UNSAFE_DESERIALIZATION = "unsafe_deserialization"
    PATH_TRAVERSAL = "path_traversal"
    SSRF = "ssrf"
    IDOR = "idor"
    HARDCODED_SECRET = "hardcoded_secret"
    SENSITIVE_DATA_EXPOSURE = "sensitive_data_exposure"
    SECURITY_MISCONFIGURATION = "security_misconfiguration"


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
    cwe_id: Optional[str] = None
    owasp_category: Optional[str] = None
    exploit_reasoning: Optional[str] = None
    suggested_fix: Optional[Dict] = None
    references: List[str] = field(default_factory=list)


@dataclass
class AnalysisContext:
    """Context for code analysis."""
    code: str
    language: str
    file_path: str = "input.txt"
    context_description: Optional[str] = None


# Security patterns for static analysis
SECURITY_PATTERNS = {
    "sql_injection": {
        "patterns": [
            # String interpolation in SQL
            r'(?:execute|query|raw|exec)\s*\(\s*[f"\'].*\{.*\}.*["\']',
            r'(?:execute|query|raw|exec)\s*\(\s*["\'].*\$\{.*\}.*["\']',
            r'(?:execute|query|raw|exec)\s*\(\s*`.*\$\{.*\}`',
            # String concatenation in SQL
            r'(?:SELECT|INSERT|UPDATE|DELETE|FROM|WHERE).*\+\s*(?:req\.|request\.|params\.|query\.)',
            r'(?:SELECT|INSERT|UPDATE|DELETE|FROM|WHERE).*\+\s*["\']?\s*\+',
            # f-strings with SQL
            r'f["\'](?:SELECT|INSERT|UPDATE|DELETE).*\{',
        ],
        "severity": Severity.CRITICAL,
        "cwe": "CWE-89",
        "owasp": "A03:2021-Injection",
        "description": "Potential SQL injection vulnerability. User input may be directly interpolated into SQL query.",
    },
    "command_injection": {
        "patterns": [
            r'(?:exec|spawn|system|popen|subprocess\.call|subprocess\.run|os\.system)\s*\([^)]*\+',
            r'(?:exec|spawn|system|popen)\s*\(\s*[f"\'].*\{.*\}',
            r'child_process\.\w+\s*\([^)]*\+',
            r'eval\s*\(\s*(?:req\.|request\.|params\.|input)',
        ],
        "severity": Severity.CRITICAL,
        "cwe": "CWE-78",
        "owasp": "A03:2021-Injection",
        "description": "Potential command injection vulnerability. User input may be passed to system command execution.",
    },
    "xss": {
        "patterns": [
            r'innerHTML\s*=\s*(?:req\.|request\.|params\.|query\.)',
            r'document\.write\s*\([^)]*(?:req\.|request\.|params\.)',
            r'dangerouslySetInnerHTML\s*=\s*\{',
            r'v-html\s*=\s*["\'][^"\']*(?:user|input|data)',
        ],
        "severity": Severity.HIGH,
        "cwe": "CWE-79",
        "owasp": "A03:2021-Injection",
        "description": "Potential Cross-Site Scripting (XSS) vulnerability. User input may be rendered as HTML without sanitization.",
    },
    "hardcoded_secret": {
        "patterns": [
            r'(?:api[_-]?key|apikey|secret|password|passwd|pwd|token|auth)\s*[=:]\s*["\'][A-Za-z0-9+/=_-]{16,}["\']',
            r'(?:AWS|aws)[_-]?(?:SECRET|secret)[_-]?(?:ACCESS|access)[_-]?(?:KEY|key)\s*[=:]\s*["\'][^"\']+["\']',
            r'-----BEGIN (?:RSA |DSA |EC )?PRIVATE KEY-----',
            r'(?:ghp|gho|ghu|ghs|ghr)_[A-Za-z0-9_]{36,}',
            r'sk-[A-Za-z0-9]{48,}',
        ],
        "severity": Severity.CRITICAL,
        "cwe": "CWE-798",
        "owasp": "A07:2021-Identification and Authentication Failures",
        "description": "Hardcoded secret or credential detected. Secrets should be stored in environment variables or secret management systems.",
    },
    "path_traversal": {
        "patterns": [
            r'(?:readFile|readFileSync|open|fopen)\s*\([^)]*(?:req\.|request\.|params\.)',
            r'(?:path\.join|path\.resolve)\s*\([^)]*(?:req\.|request\.|params\.)',
            r'\.\./',
        ],
        "severity": Severity.HIGH,
        "cwe": "CWE-22",
        "owasp": "A01:2021-Broken Access Control",
        "description": "Potential path traversal vulnerability. User input may be used to access files outside intended directory.",
    },
    "crypto_misuse": {
        "patterns": [
            r'(?:MD5|md5|SHA1|sha1)\s*\(',
            r'(?:DES|des|RC4|rc4)\s*\(',
            r'(?:ECB|ecb)\s*(?:mode|MODE)',
            r'random\(\)|Math\.random\(\)',
        ],
        "severity": Severity.MEDIUM,
        "cwe": "CWE-327",
        "owasp": "A02:2021-Cryptographic Failures",
        "description": "Weak or deprecated cryptographic algorithm detected. Use modern algorithms like SHA-256, AES-GCM.",
    },
    "unsafe_deserialization": {
        "patterns": [
            r'pickle\.loads?\s*\(',
            r'yaml\.load\s*\([^)]*(?!Loader)',
            r'unserialize\s*\(',
            r'JSON\.parse\s*\([^)]*(?:req\.|request\.)',
        ],
        "severity": Severity.HIGH,
        "cwe": "CWE-502",
        "owasp": "A08:2021-Software and Data Integrity Failures",
        "description": "Potential unsafe deserialization. Deserializing untrusted data can lead to remote code execution.",
    },
    "ssrf": {
        "patterns": [
            r'(?:fetch|axios|request|http\.get|urllib)\s*\([^)]*(?:req\.|request\.|params\.|query\.)',
            r'(?:fetch|axios|request)\s*\(\s*[f"\'].*\{.*\}',
        ],
        "severity": Severity.HIGH,
        "cwe": "CWE-918",
        "owasp": "A10:2021-Server-Side Request Forgery",
        "description": "Potential Server-Side Request Forgery (SSRF). User input may control the destination of server-side HTTP requests.",
    },
}

# Language detection patterns
LANGUAGE_PATTERNS = {
    "javascript": [r'\.js$', r'\.jsx$', r'\.mjs$', r'const\s+\w+\s*=', r'let\s+\w+\s*=', r'function\s+\w+\s*\('],
    "typescript": [r'\.ts$', r'\.tsx$', r':\s*(?:string|number|boolean|any)\b', r'interface\s+\w+'],
    "python": [r'\.py$', r'def\s+\w+\s*\(', r'import\s+\w+', r'from\s+\w+\s+import'],
    "go": [r'\.go$', r'func\s+\w+\s*\(', r'package\s+\w+'],
    "rust": [r'\.rs$', r'fn\s+\w+\s*\(', r'let\s+mut\s+'],
    "java": [r'\.java$', r'public\s+class', r'private\s+\w+\s+\w+'],
    "ruby": [r'\.rb$', r'def\s+\w+', r'class\s+\w+\s*<'],
    "php": [r'\.php$', r'<\?php', r'\$\w+\s*='],
    "solidity": [r'\.sol$', r'pragma\s+solidity', r'contract\s+\w+'],
}


class AuditAnalyzer:
    """
    Static code analyzer for security vulnerabilities.
    Combines pattern matching with contextual analysis.
    """
    
    def __init__(self):
        self.patterns = SECURITY_PATTERNS
    
    def detect_language(self, code: str, file_path: str = "") -> str:
        """Detect the programming language of the code."""
        # Check file extension first
        for lang, patterns in LANGUAGE_PATTERNS.items():
            for pattern in patterns:
                if pattern.startswith(r'\.') and re.search(pattern, file_path):
                    return lang
        
        # Fall back to content analysis
        for lang, patterns in LANGUAGE_PATTERNS.items():
            for pattern in patterns:
                if not pattern.startswith(r'\.') and re.search(pattern, code):
                    return lang
        
        return "unknown"
    
    def analyze_code(self, context: AnalysisContext) -> List[Finding]:
        """
        Analyze code for security vulnerabilities using pattern matching.
        Returns a list of findings.
        """
        findings = []
        lines = context.code.split('\n')
        
        for vuln_type, config in self.patterns.items():
            for pattern in config["patterns"]:
                for line_num, line in enumerate(lines, 1):
                    matches = list(re.finditer(pattern, line, re.IGNORECASE))
                    for match in matches:
                        # Get surrounding context (3 lines before and after)
                        start_line = max(0, line_num - 4)
                        end_line = min(len(lines), line_num + 3)
                        snippet_lines = lines[start_line:end_line]
                        code_snippet = '\n'.join(snippet_lines)
                        
                        finding = Finding(
                            finding_type=vuln_type,
                            severity=config["severity"].value,
                            confidence="medium",
                            file_path=context.file_path,
                            line_number=line_num,
                            column_number=match.start() + 1,
                            code_snippet=code_snippet,
                            description=config["description"],
                            cwe_id=config.get("cwe"),
                            owasp_category=config.get("owasp"),
                            references=[
                                f"https://cwe.mitre.org/data/definitions/{config.get('cwe', '').replace('CWE-', '')}.html"
                            ] if config.get("cwe") else []
                        )
                        findings.append(finding)
        
        # Deduplicate findings on same line
        seen = set()
        unique_findings = []
        for f in findings:
            key = (f.finding_type, f.file_path, f.line_number)
            if key not in seen:
                seen.add(key)
                unique_findings.append(f)
        
        return unique_findings
    
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
    
    def to_sarif(self, findings: List[Finding], tool_name: str = "forge-audit") -> Dict:
        """Convert findings to SARIF format for GitHub/IDE integration."""
        return {
            "$schema": "https://raw.githubusercontent.com/oasis-tcs/sarif-spec/master/Schemata/sarif-schema-2.1.0.json",
            "version": "2.1.0",
            "runs": [{
                "tool": {
                    "driver": {
                        "name": tool_name,
                        "version": "1.0.0",
                        "informationUri": "https://openframe.co/audit",
                        "rules": self._get_sarif_rules(findings)
                    }
                },
                "results": [self._finding_to_sarif_result(f) for f in findings]
            }]
        }
    
    def _get_sarif_rules(self, findings: List[Finding]) -> List[Dict]:
        """Generate SARIF rule definitions from findings."""
        rules = {}
        for f in findings:
            if f.finding_type not in rules:
                config = self.patterns.get(f.finding_type, {})
                rules[f.finding_type] = {
                    "id": f.finding_type,
                    "name": f.finding_type.replace("_", " ").title(),
                    "shortDescription": {"text": config.get("description", f.description)[:100]},
                    "fullDescription": {"text": config.get("description", f.description)},
                    "helpUri": f"https://cwe.mitre.org/data/definitions/{f.cwe_id.replace('CWE-', '')}.html" if f.cwe_id else None,
                    "properties": {
                        "security-severity": self._severity_to_score(f.severity)
                    }
                }
        return list(rules.values())
    
    def _finding_to_sarif_result(self, finding: Finding) -> Dict:
        """Convert a finding to SARIF result format."""
        return {
            "ruleId": finding.finding_type,
            "level": self._severity_to_sarif_level(finding.severity),
            "message": {"text": finding.description},
            "locations": [{
                "physicalLocation": {
                    "artifactLocation": {"uri": finding.file_path},
                    "region": {
                        "startLine": finding.line_number,
                        "startColumn": finding.column_number
                    }
                }
            }]
        }
    
    def _severity_to_sarif_level(self, severity: str) -> str:
        """Convert severity to SARIF level."""
        mapping = {
            "critical": "error",
            "high": "error",
            "medium": "warning",
            "low": "note"
        }
        return mapping.get(severity, "warning")
    
    def _severity_to_score(self, severity: str) -> str:
        """Convert severity to security-severity score."""
        mapping = {
            "critical": "9.0",
            "high": "7.0",
            "medium": "5.0",
            "low": "3.0"
        }
        return mapping.get(severity, "5.0")
