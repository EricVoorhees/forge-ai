"""
FORGE Audit Rules - Base Classes
Semgrep-inspired rule definitions.
"""

import re
from enum import Enum
from typing import List, Dict, Optional, Any, Pattern
from dataclasses import dataclass, field


class Severity(str, Enum):
    CRITICAL = "critical"
    HIGH = "high"
    MEDIUM = "medium"
    LOW = "low"
    INFO = "info"


class Confidence(str, Enum):
    HIGH = "high"
    MEDIUM = "medium"
    LOW = "low"


class Category(str, Enum):
    SECURITY = "security"
    CORRECTNESS = "correctness"
    BEST_PRACTICE = "best-practice"
    PERFORMANCE = "performance"


@dataclass
class RuleMatch:
    """A match from a rule pattern."""
    rule_id: str
    line_number: int
    column_start: int
    column_end: int
    matched_text: str
    metavariables: Dict[str, str] = field(default_factory=dict)


@dataclass
class Rule:
    """
    A security rule definition.
    Inspired by Semgrep's YAML rule format.
    """
    id: str
    message: str
    severity: Severity
    languages: List[str]
    
    # Pattern matching
    patterns: List[str] = field(default_factory=list)
    pattern_either: List[str] = field(default_factory=list)
    pattern_not: List[str] = field(default_factory=list)
    pattern_inside: List[str] = field(default_factory=list)
    pattern_not_inside: List[str] = field(default_factory=list)
    
    # Taint mode (data flow)
    mode: str = "search"  # "search" or "taint"
    pattern_sources: List[str] = field(default_factory=list)
    pattern_sinks: List[str] = field(default_factory=list)
    pattern_sanitizers: List[str] = field(default_factory=list)
    
    # Metadata
    confidence: Confidence = Confidence.MEDIUM
    category: Category = Category.SECURITY
    cwe: Optional[str] = None
    owasp: Optional[str] = None
    references: List[str] = field(default_factory=list)
    
    # Fix suggestion
    fix: Optional[str] = None
    fix_regex: Optional[Dict[str, str]] = None
    
    # Options
    options: Dict[str, Any] = field(default_factory=dict)
    
    # Compiled patterns (cached)
    _compiled_patterns: List[Pattern] = field(default_factory=list, repr=False)
    _compiled_pattern_not: List[Pattern] = field(default_factory=list, repr=False)
    
    def __post_init__(self):
        """Compile regex patterns for performance."""
        self._compiled_patterns = [
            re.compile(p, re.IGNORECASE | re.MULTILINE) 
            for p in (self.patterns or self.pattern_either)
        ]
        self._compiled_pattern_not = [
            re.compile(p, re.IGNORECASE | re.MULTILINE) 
            for p in self.pattern_not
        ]
    
    def matches_language(self, language: str) -> bool:
        """Check if rule applies to the given language."""
        if not self.languages:
            return True
        return language.lower() in [l.lower() for l in self.languages]
    
    def find_matches(self, code: str, file_path: str = "") -> List[RuleMatch]:
        """
        Find all matches of this rule in the code.
        Returns list of RuleMatch objects.
        """
        matches = []
        lines = code.split('\n')
        
        # For pattern-either, any pattern matching is a hit
        # For patterns (AND), all must match (simplified: we treat as OR for now)
        for compiled_pattern in self._compiled_patterns:
            for line_num, line in enumerate(lines, 1):
                for match in compiled_pattern.finditer(line):
                    # Check pattern-not exclusions
                    excluded = False
                    for not_pattern in self._compiled_pattern_not:
                        if not_pattern.search(line):
                            excluded = True
                            break
                    
                    if not excluded:
                        # Extract metavariables if present
                        metavars = {}
                        for key, value in match.groupdict().items():
                            if value:
                                metavars[f"${key.upper()}"] = value
                        
                        matches.append(RuleMatch(
                            rule_id=self.id,
                            line_number=line_num,
                            column_start=match.start() + 1,
                            column_end=match.end() + 1,
                            matched_text=match.group(0),
                            metavariables=metavars
                        ))
        
        return matches


@dataclass
class RuleSet:
    """A collection of rules, typically organized by category or language."""
    name: str
    description: str
    rules: List[Rule] = field(default_factory=list)
    
    def get_rules_for_language(self, language: str) -> List[Rule]:
        """Get all rules applicable to a language."""
        return [r for r in self.rules if r.matches_language(language)]
    
    def get_rules_by_severity(self, severity: Severity) -> List[Rule]:
        """Get all rules of a specific severity."""
        return [r for r in self.rules if r.severity == severity]
    
    def get_rules_by_category(self, category: Category) -> List[Rule]:
        """Get all rules in a category."""
        return [r for r in self.rules if r.category == category]
