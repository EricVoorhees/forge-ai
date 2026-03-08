"""
FORGE Audit - Finding Fingerprinting
Semgrep-inspired fingerprinting for deduplication across scans.
"""

import hashlib
import re
from typing import Optional
from dataclasses import dataclass


@dataclass
class FindingFingerprint:
    """Fingerprints for a finding."""
    match_based_id: str
    syntactic_id: str


def generate_match_based_id(
    file_path: str,
    rule_id: str,
    matched_text: str,
    index: int = 0
) -> str:
    """
    Generate a match_based_id for a finding.
    
    This ID is stable across code changes that don't affect the matched pattern.
    Based on Semgrep's approach:
    - file_path: The path to the file
    - rule_id: The rule that matched
    - matched_text: The pattern with metavariables substituted
    - index: The occurrence index (0-based) for multiple matches of same pattern
    
    Returns a hash string like "abc123_0"
    """
    # Normalize the matched text (remove whitespace variations)
    normalized_text = normalize_code(matched_text)
    
    # Create the base hash
    content = f"{file_path}:{rule_id}:{normalized_text}"
    base_hash = hashlib.sha256(content.encode()).hexdigest()[:16]
    
    # Append the index
    return f"{base_hash}_{index}"


def generate_syntactic_id(
    file_path: str,
    rule_id: str,
    code_snippet: str,
    line_number: int,
    index: int = 0
) -> str:
    """
    Generate a syntactic_id for a finding.
    
    This ID is based on the literal code that matched.
    More specific than match_based_id - changes if code changes.
    
    Returns a hash string like "def456_0"
    """
    # Include line number for more specificity
    content = f"{file_path}:{rule_id}:{line_number}:{code_snippet}"
    base_hash = hashlib.sha256(content.encode()).hexdigest()[:16]
    
    return f"{base_hash}_{index}"


def normalize_code(code: str) -> str:
    """
    Normalize code for comparison.
    - Remove extra whitespace
    - Normalize line endings
    - Strip leading/trailing whitespace
    """
    # Normalize line endings
    code = code.replace('\r\n', '\n').replace('\r', '\n')
    
    # Collapse multiple spaces/tabs to single space
    code = re.sub(r'[ \t]+', ' ', code)
    
    # Collapse multiple newlines to single newline
    code = re.sub(r'\n+', '\n', code)
    
    # Strip each line
    lines = [line.strip() for line in code.split('\n')]
    
    return '\n'.join(lines).strip()


def generate_fingerprints(
    file_path: str,
    rule_id: str,
    matched_text: str,
    code_snippet: str,
    line_number: int,
    index: int = 0
) -> FindingFingerprint:
    """
    Generate both fingerprints for a finding.
    """
    return FindingFingerprint(
        match_based_id=generate_match_based_id(file_path, rule_id, matched_text, index),
        syntactic_id=generate_syntactic_id(file_path, rule_id, code_snippet, line_number, index)
    )


def are_findings_same(
    fingerprint1: FindingFingerprint,
    fingerprint2: FindingFingerprint,
    strict: bool = False
) -> bool:
    """
    Check if two findings are the same.
    
    Args:
        fingerprint1: First finding's fingerprints
        fingerprint2: Second finding's fingerprints
        strict: If True, both IDs must match. If False, match_based_id is enough.
    
    Returns:
        True if findings are considered the same
    """
    if strict:
        return (
            fingerprint1.match_based_id == fingerprint2.match_based_id and
            fingerprint1.syntactic_id == fingerprint2.syntactic_id
        )
    
    # Non-strict: match_based_id is enough (handles code movement)
    # Extract base hash (without index) for comparison
    base1 = fingerprint1.match_based_id.rsplit('_', 1)[0]
    base2 = fingerprint2.match_based_id.rsplit('_', 1)[0]
    
    return base1 == base2
