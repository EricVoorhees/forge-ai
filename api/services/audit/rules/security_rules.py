"""
FORGE Audit - Security Rules
Professional-grade security rules inspired by Semgrep.
"""

from .base import Rule, RuleSet, Severity, Confidence, Category


# =============================================================================
# INJECTION RULES
# =============================================================================

SQL_INJECTION_PYTHON = Rule(
    id="python.security.sql-injection.string-concat",
    message="SQL query constructed using string concatenation with user input. Use parameterized queries instead.",
    severity=Severity.CRITICAL,
    confidence=Confidence.HIGH,
    languages=["python"],
    patterns=[
        r'(?:execute|executemany|raw)\s*\(\s*["\'](?:SELECT|INSERT|UPDATE|DELETE|DROP|CREATE|ALTER).*["\'].*%.*%',
        r'(?:execute|executemany|raw)\s*\(\s*f["\'](?:SELECT|INSERT|UPDATE|DELETE)',
        r'cursor\.\w+\s*\(\s*["\'].*["\']\s*%\s*\(',
    ],
    pattern_not=[
        r'%s',  # Parameterized placeholder is safe
        r'\?',  # SQLite parameterized
    ],
    cwe="CWE-89",
    owasp="A03:2021-Injection",
    category=Category.SECURITY,
    fix="Use parameterized queries: cursor.execute('SELECT * FROM users WHERE id = %s', (user_id,))",
    references=[
        "https://cheatsheetseries.owasp.org/cheatsheets/SQL_Injection_Prevention_Cheat_Sheet.html",
        "https://cwe.mitre.org/data/definitions/89.html"
    ]
)

SQL_INJECTION_JS = Rule(
    id="javascript.security.sql-injection.string-concat",
    message="SQL query constructed using string concatenation or template literals with user input.",
    severity=Severity.CRITICAL,
    confidence=Confidence.HIGH,
    languages=["javascript", "typescript"],
    patterns=[
        r'(?:query|execute|raw)\s*\(\s*`(?:SELECT|INSERT|UPDATE|DELETE).*\$\{',
        r'(?:query|execute|raw)\s*\(\s*["\'](?:SELECT|INSERT|UPDATE|DELETE).*["\']\s*\+',
        r'\.query\s*\(\s*["\'].*["\']\s*\+\s*(?:req\.|request\.|params\.|body\.)',
    ],
    pattern_not=[
        r'\$\d+',  # PostgreSQL parameterized
        r'\?',     # MySQL parameterized
    ],
    cwe="CWE-89",
    owasp="A03:2021-Injection",
    category=Category.SECURITY,
    references=[
        "https://cheatsheetseries.owasp.org/cheatsheets/SQL_Injection_Prevention_Cheat_Sheet.html"
    ]
)

COMMAND_INJECTION_PYTHON = Rule(
    id="python.security.command-injection.subprocess",
    message="Command constructed with user input passed to subprocess. Use shell=False and pass arguments as list.",
    severity=Severity.CRITICAL,
    confidence=Confidence.HIGH,
    languages=["python"],
    patterns=[
        r'subprocess\.(?:call|run|Popen)\s*\([^)]*shell\s*=\s*True',
        r'os\.system\s*\(\s*f["\']',
        r'os\.system\s*\(\s*["\'].*["\']\s*%',
        r'os\.popen\s*\(',
        r'commands\.getoutput\s*\(',
    ],
    pattern_not=[
        r'shell\s*=\s*False',
    ],
    cwe="CWE-78",
    owasp="A03:2021-Injection",
    category=Category.SECURITY,
    fix="Use subprocess.run(['cmd', 'arg1', 'arg2'], shell=False) with a list of arguments",
    references=[
        "https://cwe.mitre.org/data/definitions/78.html"
    ]
)

COMMAND_INJECTION_JS = Rule(
    id="javascript.security.command-injection.child-process",
    message="Command constructed with user input passed to child_process. Validate and sanitize input.",
    severity=Severity.CRITICAL,
    confidence=Confidence.HIGH,
    languages=["javascript", "typescript"],
    patterns=[
        r'child_process\.exec\s*\(\s*`.*\$\{',
        r'child_process\.exec\s*\([^)]*\+',
        r'exec\s*\(\s*`.*\$\{.*(?:req\.|request\.|params\.)',
        r'execSync\s*\(\s*`.*\$\{',
    ],
    pattern_not=[
        r'execFile',  # execFile is safer
        r'spawn',     # spawn with array is safer
    ],
    cwe="CWE-78",
    owasp="A03:2021-Injection",
    category=Category.SECURITY,
    references=[
        "https://cwe.mitre.org/data/definitions/78.html"
    ]
)

# =============================================================================
# XSS RULES
# =============================================================================

XSS_REACT = Rule(
    id="javascript.security.xss.dangerously-set-inner-html",
    message="dangerouslySetInnerHTML can lead to XSS if the content is not properly sanitized.",
    severity=Severity.HIGH,
    confidence=Confidence.MEDIUM,
    languages=["javascript", "typescript", "jsx", "tsx"],
    patterns=[
        r'dangerouslySetInnerHTML\s*=\s*\{\s*\{',
    ],
    pattern_not=[
        r'DOMPurify\.sanitize',
        r'sanitize\(',
        r'escape\(',
    ],
    cwe="CWE-79",
    owasp="A03:2021-Injection",
    category=Category.SECURITY,
    fix="Use DOMPurify.sanitize() to sanitize HTML content before rendering",
    references=[
        "https://cheatsheetseries.owasp.org/cheatsheets/Cross_Site_Scripting_Prevention_Cheat_Sheet.html"
    ]
)

XSS_INNERHTML = Rule(
    id="javascript.security.xss.innerhtml-assignment",
    message="Direct innerHTML assignment with user input can lead to XSS.",
    severity=Severity.HIGH,
    confidence=Confidence.MEDIUM,
    languages=["javascript", "typescript"],
    patterns=[
        r'\.innerHTML\s*=\s*(?![\'"]\s*[\'"])',
        r'\.outerHTML\s*=\s*(?![\'"]\s*[\'"])',
        r'document\.write\s*\(',
    ],
    pattern_not=[
        r'\.innerHTML\s*=\s*["\']["\']',  # Empty string is safe
        r'textContent',
        r'innerText',
    ],
    cwe="CWE-79",
    owasp="A03:2021-Injection",
    category=Category.SECURITY,
    references=[
        "https://cwe.mitre.org/data/definitions/79.html"
    ]
)

# =============================================================================
# HARDCODED SECRETS
# =============================================================================

HARDCODED_AWS_KEY = Rule(
    id="generic.security.secrets.aws-access-key",
    message="AWS Access Key ID detected. Remove and rotate this credential immediately.",
    severity=Severity.CRITICAL,
    confidence=Confidence.HIGH,
    languages=["python", "javascript", "typescript", "go", "java", "ruby"],
    patterns=[
        r'(?:A3T[A-Z0-9]|AKIA|AGPA|AIDA|AROA|AIPA|ANPA|ANVA|ASIA)[A-Z0-9]{16}',
    ],
    pattern_not=[
        r'EXAMPLE',
        r'example',
        r'AKIAIOSFODNN7EXAMPLE',  # AWS example key
    ],
    cwe="CWE-798",
    owasp="A07:2021-Identification and Authentication Failures",
    category=Category.SECURITY,
    references=[
        "https://docs.aws.amazon.com/IAM/latest/UserGuide/id_credentials_access-keys.html"
    ]
)

HARDCODED_GITHUB_TOKEN = Rule(
    id="generic.security.secrets.github-token",
    message="GitHub token detected. Remove and rotate this token immediately.",
    severity=Severity.CRITICAL,
    confidence=Confidence.HIGH,
    languages=["python", "javascript", "typescript", "go", "java", "ruby", "yaml"],
    patterns=[
        r'ghp_[A-Za-z0-9_]{36,}',  # Personal access token
        r'gho_[A-Za-z0-9_]{36,}',  # OAuth access token
        r'ghu_[A-Za-z0-9_]{36,}',  # User-to-server token
        r'ghs_[A-Za-z0-9_]{36,}',  # Server-to-server token
        r'ghr_[A-Za-z0-9_]{36,}',  # Refresh token
    ],
    cwe="CWE-798",
    owasp="A07:2021-Identification and Authentication Failures",
    category=Category.SECURITY,
    references=[
        "https://docs.github.com/en/authentication/keeping-your-account-and-data-secure/about-authentication-to-github"
    ]
)

HARDCODED_PRIVATE_KEY = Rule(
    id="generic.security.secrets.private-key",
    message="Private key detected in source code. Store keys securely outside of version control.",
    severity=Severity.CRITICAL,
    confidence=Confidence.HIGH,
    languages=["python", "javascript", "typescript", "go", "java", "ruby", "yaml"],
    patterns=[
        r'-----BEGIN\s+(?:RSA\s+)?PRIVATE\s+KEY-----',
        r'-----BEGIN\s+EC\s+PRIVATE\s+KEY-----',
        r'-----BEGIN\s+DSA\s+PRIVATE\s+KEY-----',
        r'-----BEGIN\s+OPENSSH\s+PRIVATE\s+KEY-----',
    ],
    cwe="CWE-798",
    owasp="A07:2021-Identification and Authentication Failures",
    category=Category.SECURITY,
    references=[
        "https://cwe.mitre.org/data/definitions/798.html"
    ]
)

HARDCODED_API_KEY = Rule(
    id="generic.security.secrets.api-key-assignment",
    message="Potential hardcoded API key or secret. Use environment variables instead.",
    severity=Severity.HIGH,
    confidence=Confidence.MEDIUM,
    languages=["python", "javascript", "typescript", "go", "java", "ruby"],
    patterns=[
        r'(?:api[_-]?key|apikey|api_secret|secret[_-]?key)\s*[=:]\s*["\'][A-Za-z0-9+/=_-]{20,}["\']',
        r'(?:password|passwd|pwd)\s*[=:]\s*["\'][^"\']{8,}["\']',
        r'(?:auth[_-]?token|access[_-]?token)\s*[=:]\s*["\'][A-Za-z0-9+/=_-]{20,}["\']',
    ],
    pattern_not=[
        r'process\.env',
        r'os\.environ',
        r'os\.getenv',
        r'ENV\[',
        r'config\.',
        r'settings\.',
        r'\$\{',
        r'<.*>',  # Placeholder
        r'YOUR_',
        r'your_',
        r'REPLACE',
        r'example',
        r'EXAMPLE',
    ],
    cwe="CWE-798",
    owasp="A07:2021-Identification and Authentication Failures",
    category=Category.SECURITY,
    fix="Use environment variables: os.environ.get('API_KEY') or process.env.API_KEY",
    references=[
        "https://12factor.net/config"
    ]
)

# =============================================================================
# CRYPTOGRAPHY RULES
# =============================================================================

WEAK_HASH_MD5 = Rule(
    id="generic.security.crypto.weak-hash-md5",
    message="MD5 is cryptographically broken. Use SHA-256 or stronger for security purposes.",
    severity=Severity.MEDIUM,
    confidence=Confidence.HIGH,
    languages=["python", "javascript", "typescript", "go", "java", "ruby", "php"],
    patterns=[
        r'(?:hashlib\.)?md5\s*\(',
        r'MD5\s*\(',
        r'createHash\s*\(\s*["\']md5["\']',
        r'Digest::MD5',
        r'MessageDigest\.getInstance\s*\(\s*["\']MD5["\']',
    ],
    pattern_not=[
        r'# nosec',
        r'// nosec',
        r'checksum',  # Non-security use case
        r'etag',
    ],
    cwe="CWE-327",
    owasp="A02:2021-Cryptographic Failures",
    category=Category.SECURITY,
    fix="Use hashlib.sha256() or crypto.createHash('sha256') instead",
    references=[
        "https://cwe.mitre.org/data/definitions/327.html"
    ]
)

WEAK_HASH_SHA1 = Rule(
    id="generic.security.crypto.weak-hash-sha1",
    message="SHA-1 is deprecated for security purposes. Use SHA-256 or stronger.",
    severity=Severity.MEDIUM,
    confidence=Confidence.MEDIUM,
    languages=["python", "javascript", "typescript", "go", "java", "ruby", "php"],
    patterns=[
        r'(?:hashlib\.)?sha1\s*\(',
        r'SHA1\s*\(',
        r'createHash\s*\(\s*["\']sha1["\']',
        r'Digest::SHA1',
        r'MessageDigest\.getInstance\s*\(\s*["\']SHA-?1["\']',
    ],
    pattern_not=[
        r'# nosec',
        r'// nosec',
        r'git',  # Git uses SHA-1
    ],
    cwe="CWE-327",
    owasp="A02:2021-Cryptographic Failures",
    category=Category.SECURITY,
    references=[
        "https://cwe.mitre.org/data/definitions/327.html"
    ]
)

INSECURE_RANDOM = Rule(
    id="generic.security.crypto.insecure-random",
    message="Math.random() or random.random() is not cryptographically secure. Use crypto.randomBytes() or secrets module.",
    severity=Severity.MEDIUM,
    confidence=Confidence.MEDIUM,
    languages=["python", "javascript", "typescript"],
    patterns=[
        r'Math\.random\s*\(\s*\)',
        r'random\.random\s*\(\s*\)',
        r'random\.randint\s*\(',
    ],
    pattern_not=[
        r'secrets\.',
        r'crypto\.',
        r'# nosec',
    ],
    cwe="CWE-330",
    owasp="A02:2021-Cryptographic Failures",
    category=Category.SECURITY,
    fix="Use secrets.token_hex() in Python or crypto.randomBytes() in Node.js",
    references=[
        "https://cwe.mitre.org/data/definitions/330.html"
    ]
)

# =============================================================================
# DESERIALIZATION RULES
# =============================================================================

UNSAFE_PICKLE = Rule(
    id="python.security.deserialization.pickle-load",
    message="pickle.load() on untrusted data can lead to arbitrary code execution.",
    severity=Severity.CRITICAL,
    confidence=Confidence.HIGH,
    languages=["python"],
    patterns=[
        r'pickle\.loads?\s*\(',
        r'cPickle\.loads?\s*\(',
        r'_pickle\.loads?\s*\(',
    ],
    cwe="CWE-502",
    owasp="A08:2021-Software and Data Integrity Failures",
    category=Category.SECURITY,
    fix="Use JSON or other safe serialization formats for untrusted data",
    references=[
        "https://cwe.mitre.org/data/definitions/502.html"
    ]
)

UNSAFE_YAML = Rule(
    id="python.security.deserialization.yaml-load",
    message="yaml.load() without SafeLoader can execute arbitrary code. Use yaml.safe_load() instead.",
    severity=Severity.HIGH,
    confidence=Confidence.HIGH,
    languages=["python"],
    patterns=[
        r'yaml\.load\s*\([^)]*\)',
    ],
    pattern_not=[
        r'Loader\s*=\s*(?:yaml\.)?SafeLoader',
        r'Loader\s*=\s*(?:yaml\.)?BaseLoader',
        r'safe_load',
    ],
    cwe="CWE-502",
    owasp="A08:2021-Software and Data Integrity Failures",
    category=Category.SECURITY,
    fix="Use yaml.safe_load() or yaml.load(data, Loader=yaml.SafeLoader)",
    references=[
        "https://cwe.mitre.org/data/definitions/502.html"
    ]
)

# =============================================================================
# PATH TRAVERSAL RULES
# =============================================================================

PATH_TRAVERSAL_PYTHON = Rule(
    id="python.security.path-traversal.open-file",
    message="File path constructed from user input may allow path traversal attacks.",
    severity=Severity.HIGH,
    confidence=Confidence.MEDIUM,
    languages=["python"],
    patterns=[
        r'open\s*\(\s*(?:request\.|req\.|params\.|args\.)',
        r'open\s*\(\s*f["\'].*\{.*(?:request|req|params|args)',
        r'Path\s*\(\s*(?:request\.|req\.|params\.)',
    ],
    pattern_not=[
        r'os\.path\.basename',
        r'secure_filename',
        r'\.resolve\(\)\.relative_to',
    ],
    cwe="CWE-22",
    owasp="A01:2021-Broken Access Control",
    category=Category.SECURITY,
    fix="Use os.path.basename() to extract filename and validate against allowed paths",
    references=[
        "https://cwe.mitre.org/data/definitions/22.html"
    ]
)

PATH_TRAVERSAL_JS = Rule(
    id="javascript.security.path-traversal.fs-read",
    message="File path constructed from user input may allow path traversal attacks.",
    severity=Severity.HIGH,
    confidence=Confidence.MEDIUM,
    languages=["javascript", "typescript"],
    patterns=[
        r'(?:readFile|readFileSync|createReadStream)\s*\([^)]*(?:req\.|request\.|params\.)',
        r'(?:readFile|readFileSync)\s*\(\s*`.*\$\{.*(?:req|request|params)',
        r'path\.join\s*\([^)]*(?:req\.|request\.|params\.)',
    ],
    pattern_not=[
        r'path\.basename',
        r'\.normalize\(',
        r'\.startsWith\(',
    ],
    cwe="CWE-22",
    owasp="A01:2021-Broken Access Control",
    category=Category.SECURITY,
    references=[
        "https://cwe.mitre.org/data/definitions/22.html"
    ]
)

# =============================================================================
# SSRF RULES
# =============================================================================

SSRF_PYTHON = Rule(
    id="python.security.ssrf.requests-user-input",
    message="HTTP request URL constructed from user input may allow SSRF attacks.",
    severity=Severity.HIGH,
    confidence=Confidence.MEDIUM,
    languages=["python"],
    patterns=[
        r'requests\.(?:get|post|put|delete|patch)\s*\(\s*(?:request\.|req\.|params\.)',
        r'requests\.(?:get|post|put|delete|patch)\s*\(\s*f["\'].*\{.*(?:request|req|params)',
        r'urllib\.request\.urlopen\s*\([^)]*(?:request\.|req\.)',
        r'httpx\.(?:get|post)\s*\(\s*(?:request\.|req\.)',
    ],
    pattern_not=[
        r'validate_url',
        r'is_safe_url',
        r'urlparse',
    ],
    cwe="CWE-918",
    owasp="A10:2021-Server-Side Request Forgery",
    category=Category.SECURITY,
    fix="Validate and whitelist allowed URLs/domains before making requests",
    references=[
        "https://cwe.mitre.org/data/definitions/918.html"
    ]
)

SSRF_JS = Rule(
    id="javascript.security.ssrf.fetch-user-input",
    message="HTTP request URL constructed from user input may allow SSRF attacks.",
    severity=Severity.HIGH,
    confidence=Confidence.MEDIUM,
    languages=["javascript", "typescript"],
    patterns=[
        r'fetch\s*\(\s*(?:req\.|request\.|params\.)',
        r'fetch\s*\(\s*`.*\$\{.*(?:req|request|params)',
        r'axios\.(?:get|post)\s*\(\s*(?:req\.|request\.)',
        r'axios\.(?:get|post)\s*\(\s*`.*\$\{',
    ],
    pattern_not=[
        r'validateUrl',
        r'isValidUrl',
        r'URL\(',
    ],
    cwe="CWE-918",
    owasp="A10:2021-Server-Side Request Forgery",
    category=Category.SECURITY,
    references=[
        "https://cwe.mitre.org/data/definitions/918.html"
    ]
)

# =============================================================================
# AUTHENTICATION RULES
# =============================================================================

JWT_NO_VERIFY = Rule(
    id="generic.security.auth.jwt-no-verification",
    message="JWT decoded without signature verification. Always verify JWT signatures.",
    severity=Severity.CRITICAL,
    confidence=Confidence.HIGH,
    languages=["python", "javascript", "typescript"],
    patterns=[
        r'jwt\.decode\s*\([^)]*verify\s*=\s*False',
        r'jwt\.decode\s*\([^)]*options\s*:\s*\{[^}]*verify\s*:\s*false',
        r'jsonwebtoken\.decode\s*\(',  # decode() doesn't verify
    ],
    pattern_not=[
        r'jwt\.verify',
        r'verify\s*=\s*True',
    ],
    cwe="CWE-347",
    owasp="A07:2021-Identification and Authentication Failures",
    category=Category.SECURITY,
    fix="Use jwt.verify() instead of jwt.decode() to validate signatures",
    references=[
        "https://cwe.mitre.org/data/definitions/347.html"
    ]
)

HARDCODED_JWT_SECRET = Rule(
    id="generic.security.auth.hardcoded-jwt-secret",
    message="JWT secret appears to be hardcoded. Use environment variables for secrets.",
    severity=Severity.HIGH,
    confidence=Confidence.MEDIUM,
    languages=["python", "javascript", "typescript"],
    patterns=[
        r'jwt\.(?:encode|sign)\s*\([^)]*["\'][A-Za-z0-9+/=]{16,}["\']',
        r'(?:JWT_SECRET|SECRET_KEY)\s*[=:]\s*["\'][A-Za-z0-9+/=]{16,}["\']',
    ],
    pattern_not=[
        r'process\.env',
        r'os\.environ',
        r'os\.getenv',
        r'config\.',
    ],
    cwe="CWE-798",
    owasp="A07:2021-Identification and Authentication Failures",
    category=Category.SECURITY,
    references=[
        "https://cwe.mitre.org/data/definitions/798.html"
    ]
)


# =============================================================================
# RULE SETS
# =============================================================================

INJECTION_RULES = RuleSet(
    name="injection",
    description="SQL injection, command injection, and other injection vulnerabilities",
    rules=[
        SQL_INJECTION_PYTHON,
        SQL_INJECTION_JS,
        COMMAND_INJECTION_PYTHON,
        COMMAND_INJECTION_JS,
        XSS_REACT,
        XSS_INNERHTML,
    ]
)

SECRETS_RULES = RuleSet(
    name="secrets",
    description="Hardcoded secrets, API keys, and credentials",
    rules=[
        HARDCODED_AWS_KEY,
        HARDCODED_GITHUB_TOKEN,
        HARDCODED_PRIVATE_KEY,
        HARDCODED_API_KEY,
    ]
)

CRYPTO_RULES = RuleSet(
    name="crypto",
    description="Cryptographic misuse and weak algorithms",
    rules=[
        WEAK_HASH_MD5,
        WEAK_HASH_SHA1,
        INSECURE_RANDOM,
    ]
)

DESERIALIZATION_RULES = RuleSet(
    name="deserialization",
    description="Unsafe deserialization vulnerabilities",
    rules=[
        UNSAFE_PICKLE,
        UNSAFE_YAML,
    ]
)

PATH_TRAVERSAL_RULES = RuleSet(
    name="path-traversal",
    description="Path traversal and file access vulnerabilities",
    rules=[
        PATH_TRAVERSAL_PYTHON,
        PATH_TRAVERSAL_JS,
    ]
)

SSRF_RULES = RuleSet(
    name="ssrf",
    description="Server-Side Request Forgery vulnerabilities",
    rules=[
        SSRF_PYTHON,
        SSRF_JS,
    ]
)

AUTH_RULES = RuleSet(
    name="auth",
    description="Authentication and authorization vulnerabilities",
    rules=[
        JWT_NO_VERIFY,
        HARDCODED_JWT_SECRET,
    ]
)

# All security rules combined
ALL_SECURITY_RULES = RuleSet(
    name="security",
    description="All security rules",
    rules=(
        INJECTION_RULES.rules +
        SECRETS_RULES.rules +
        CRYPTO_RULES.rules +
        DESERIALIZATION_RULES.rules +
        PATH_TRAVERSAL_RULES.rules +
        SSRF_RULES.rules +
        AUTH_RULES.rules
    )
)
