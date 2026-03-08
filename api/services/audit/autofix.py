"""
FORGE Audit - Autofix Engine
Generate code fixes for security findings.
"""

import re
from typing import Optional, Dict, List
from dataclasses import dataclass


@dataclass
class AutofixResult:
    """Result of an autofix generation."""
    available: bool
    original_code: str
    fixed_code: str
    description: str
    diff: Optional[str] = None
    confidence: str = "medium"  # high, medium, low


# Autofix patterns: rule_id -> (pattern, replacement, description)
AUTOFIX_PATTERNS: Dict[str, Dict] = {
    # SQL Injection fixes
    "python.security.sql-injection.string-concat": {
        "patterns": [
            {
                "match": r'cursor\.execute\s*\(\s*f["\'](.+?)["\']',
                "replace": lambda m: f'cursor.execute("{_parameterize_sql(m.group(1))}", (/* params */,))',
                "description": "Use parameterized queries instead of f-strings"
            },
            {
                "match": r'cursor\.execute\s*\(\s*["\'](.+?)["\']\s*%\s*\((.+?)\)',
                "replace": lambda m: f'cursor.execute("{m.group(1).replace("%s", "?")}", ({m.group(2)},))',
                "description": "Use parameterized queries with proper placeholders"
            }
        ]
    },
    
    # XSS fixes
    "javascript.security.xss.dangerously-set-inner-html": {
        "patterns": [
            {
                "match": r'dangerouslySetInnerHTML\s*=\s*\{\s*\{\s*__html:\s*(.+?)\s*\}\s*\}',
                "replace": lambda m: f'dangerouslySetInnerHTML={{{{ __html: DOMPurify.sanitize({m.group(1)}) }}}}',
                "description": "Sanitize HTML content with DOMPurify before rendering"
            }
        ]
    },
    
    # Weak crypto fixes
    "generic.security.crypto.weak-hash-md5": {
        "patterns": [
            {
                "match": r'hashlib\.md5\s*\(',
                "replace": lambda m: 'hashlib.sha256(',
                "description": "Replace MD5 with SHA-256"
            },
            {
                "match": r'createHash\s*\(\s*["\']md5["\']\s*\)',
                "replace": lambda m: "createHash('sha256')",
                "description": "Replace MD5 with SHA-256"
            }
        ]
    },
    "generic.security.crypto.weak-hash-sha1": {
        "patterns": [
            {
                "match": r'hashlib\.sha1\s*\(',
                "replace": lambda m: 'hashlib.sha256(',
                "description": "Replace SHA-1 with SHA-256"
            },
            {
                "match": r'createHash\s*\(\s*["\']sha1["\']\s*\)',
                "replace": lambda m: "createHash('sha256')",
                "description": "Replace SHA-1 with SHA-256"
            }
        ]
    },
    
    # Unsafe deserialization fixes
    "python.security.deserialization.yaml-load": {
        "patterns": [
            {
                "match": r'yaml\.load\s*\(\s*([^,\)]+)\s*\)',
                "replace": lambda m: f'yaml.safe_load({m.group(1)})',
                "description": "Use yaml.safe_load() instead of yaml.load()"
            },
            {
                "match": r'yaml\.load\s*\(\s*([^,]+),\s*Loader\s*=\s*yaml\.Loader\s*\)',
                "replace": lambda m: f'yaml.safe_load({m.group(1)})',
                "description": "Use yaml.safe_load() instead of yaml.load() with unsafe Loader"
            }
        ]
    },
    
    # Insecure random fixes
    "generic.security.crypto.insecure-random": {
        "patterns": [
            {
                "match": r'random\.random\s*\(\s*\)',
                "replace": lambda m: 'secrets.token_hex(16)',
                "description": "Use secrets module for cryptographic randomness"
            },
            {
                "match": r'Math\.random\s*\(\s*\)',
                "replace": lambda m: 'crypto.randomBytes(16).toString("hex")',
                "description": "Use crypto.randomBytes for cryptographic randomness"
            }
        ]
    },
    
    # JWT fixes
    "generic.security.auth.jwt-no-verification": {
        "patterns": [
            {
                "match": r'jwt\.decode\s*\(\s*([^,]+),\s*verify\s*=\s*False\s*\)',
                "replace": lambda m: f'jwt.decode({m.group(1)}, SECRET_KEY, algorithms=["HS256"])',
                "description": "Enable JWT signature verification"
            },
            {
                "match": r'jsonwebtoken\.decode\s*\(\s*([^)]+)\s*\)',
                "replace": lambda m: f'jsonwebtoken.verify({m.group(1)}, SECRET_KEY)',
                "description": "Use jwt.verify() instead of jwt.decode() to validate signatures"
            }
        ]
    }
}


def _parameterize_sql(sql: str) -> str:
    """Convert f-string SQL to parameterized query."""
    # Replace {variable} with %s
    return re.sub(r'\{[^}]+\}', '%s', sql)


def generate_autofix(
    rule_id: str,
    matched_text: str,
    code_snippet: str,
    language: str
) -> Optional[AutofixResult]:
    """
    Generate an autofix for a finding.
    
    Args:
        rule_id: The rule that triggered the finding
        matched_text: The exact text that matched
        code_snippet: The surrounding code context
        language: The programming language
    
    Returns:
        AutofixResult if a fix is available, None otherwise
    """
    if rule_id not in AUTOFIX_PATTERNS:
        return None
    
    rule_fixes = AUTOFIX_PATTERNS[rule_id]
    
    for fix_pattern in rule_fixes.get("patterns", []):
        match = re.search(fix_pattern["match"], matched_text)
        if match:
            try:
                fixed_text = fix_pattern["replace"](match)
                fixed_code = code_snippet.replace(matched_text, fixed_text)
                
                # Generate a simple diff
                diff = generate_simple_diff(matched_text, fixed_text)
                
                return AutofixResult(
                    available=True,
                    original_code=matched_text,
                    fixed_code=fixed_text,
                    description=fix_pattern["description"],
                    diff=diff,
                    confidence="high" if len(fix_pattern["match"]) > 20 else "medium"
                )
            except Exception:
                continue
    
    return None


def generate_simple_diff(original: str, fixed: str) -> str:
    """Generate a simple unified diff-like output."""
    lines = []
    lines.append(f"- {original}")
    lines.append(f"+ {fixed}")
    return "\n".join(lines)


def get_fix_imports(rule_id: str, language: str) -> List[str]:
    """
    Get any imports needed for the fix.
    
    Returns list of import statements to add.
    """
    imports = {
        "generic.security.crypto.insecure-random": {
            "python": ["import secrets"],
            "javascript": ["const crypto = require('crypto');"],
            "typescript": ["import crypto from 'crypto';"]
        },
        "javascript.security.xss.dangerously-set-inner-html": {
            "javascript": ["import DOMPurify from 'dompurify';"],
            "typescript": ["import DOMPurify from 'dompurify';"]
        }
    }
    
    if rule_id in imports and language in imports[rule_id]:
        return imports[rule_id][language]
    
    return []


class AutofixEngine:
    """Engine for generating and applying autofixes."""
    
    def __init__(self):
        self.patterns = AUTOFIX_PATTERNS
    
    def can_fix(self, rule_id: str) -> bool:
        """Check if we have an autofix for this rule."""
        return rule_id in self.patterns
    
    def generate_fix(
        self,
        rule_id: str,
        matched_text: str,
        code_snippet: str,
        language: str
    ) -> Optional[AutofixResult]:
        """Generate a fix for the finding."""
        return generate_autofix(rule_id, matched_text, code_snippet, language)
    
    def get_available_fixes(self) -> List[str]:
        """Get list of rule IDs that have autofixes."""
        return list(self.patterns.keys())
