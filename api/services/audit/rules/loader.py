"""
FORGE Audit - Rule Loader
Load and manage security rules.
"""

from typing import List, Optional, Dict
from .base import Rule, RuleSet, Severity, Category
from .security_rules import (
    ALL_SECURITY_RULES,
    INJECTION_RULES,
    SECRETS_RULES,
    CRYPTO_RULES,
    DESERIALIZATION_RULES,
    PATH_TRAVERSAL_RULES,
    SSRF_RULES,
    AUTH_RULES,
)


class RuleLoader:
    """
    Load and filter security rules.
    Supports filtering by language, severity, category, and rule sets.
    """
    
    # Available rule sets
    RULE_SETS: Dict[str, RuleSet] = {
        "all": ALL_SECURITY_RULES,
        "security": ALL_SECURITY_RULES,
        "injection": INJECTION_RULES,
        "secrets": SECRETS_RULES,
        "crypto": CRYPTO_RULES,
        "deserialization": DESERIALIZATION_RULES,
        "path-traversal": PATH_TRAVERSAL_RULES,
        "ssrf": SSRF_RULES,
        "auth": AUTH_RULES,
    }
    
    def __init__(self):
        self.all_rules = ALL_SECURITY_RULES.rules
    
    def get_rules(
        self,
        language: Optional[str] = None,
        severity: Optional[List[Severity]] = None,
        categories: Optional[List[str]] = None,
        rule_sets: Optional[List[str]] = None,
        exclude_rules: Optional[List[str]] = None,
        include_rules: Optional[List[str]] = None,
    ) -> List[Rule]:
        """
        Get rules matching the specified filters.
        
        Args:
            language: Filter by programming language
            severity: Filter by severity levels
            categories: Filter by category names (e.g., "injection", "secrets")
            rule_sets: Specific rule sets to include
            exclude_rules: Rule IDs to exclude
            include_rules: Only include these rule IDs (overrides other filters)
        
        Returns:
            List of matching Rule objects
        """
        # Start with all rules or specific rule sets
        if rule_sets:
            rules = []
            for rs_name in rule_sets:
                if rs_name in self.RULE_SETS:
                    rules.extend(self.RULE_SETS[rs_name].rules)
            # Deduplicate
            seen_ids = set()
            unique_rules = []
            for r in rules:
                if r.id not in seen_ids:
                    seen_ids.add(r.id)
                    unique_rules.append(r)
            rules = unique_rules
        else:
            rules = self.all_rules.copy()
        
        # Filter by include_rules (if specified, only these rules)
        if include_rules:
            rules = [r for r in rules if r.id in include_rules]
            return rules
        
        # Filter by language
        if language:
            rules = [r for r in rules if r.matches_language(language)]
        
        # Filter by severity
        if severity:
            rules = [r for r in rules if r.severity in severity]
        
        # Filter by categories (rule set names)
        if categories:
            category_rules = []
            for cat in categories:
                if cat in self.RULE_SETS:
                    category_rules.extend(self.RULE_SETS[cat].rules)
            # Intersect with current rules
            category_ids = {r.id for r in category_rules}
            rules = [r for r in rules if r.id in category_ids]
        
        # Exclude specific rules
        if exclude_rules:
            rules = [r for r in rules if r.id not in exclude_rules]
        
        return rules
    
    def get_rule_by_id(self, rule_id: str) -> Optional[Rule]:
        """Get a specific rule by its ID."""
        for rule in self.all_rules:
            if rule.id == rule_id:
                return rule
        return None
    
    def list_rule_sets(self) -> List[str]:
        """List available rule set names."""
        return list(self.RULE_SETS.keys())
    
    def get_rule_set(self, name: str) -> Optional[RuleSet]:
        """Get a rule set by name."""
        return self.RULE_SETS.get(name)
    
    def get_stats(self) -> Dict:
        """Get statistics about available rules."""
        stats = {
            "total_rules": len(self.all_rules),
            "by_severity": {},
            "by_language": {},
            "rule_sets": list(self.RULE_SETS.keys()),
        }
        
        for rule in self.all_rules:
            # Count by severity
            sev = rule.severity.value
            stats["by_severity"][sev] = stats["by_severity"].get(sev, 0) + 1
            
            # Count by language
            for lang in rule.languages:
                stats["by_language"][lang] = stats["by_language"].get(lang, 0) + 1
        
        return stats
