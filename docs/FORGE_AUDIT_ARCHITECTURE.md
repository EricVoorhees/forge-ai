# FORGE Audit - System Architecture

## Platform Hierarchy

```
OpenFrame
    └── FORGE Platform
            ├── Models
            │   ├── Forge Coder (671B MoE)
            │   └── Forge Mini (120B)
            │
            └── Capabilities
                    └── FORGE Audit
                            └── AI-driven security auditing for software repositories
```

## Positioning Statement

**FORGE Audit** is an AI-assisted security analysis capability built on the FORGE platform. It combines traditional static analysis with LLM-powered semantic reasoning to detect vulnerabilities that pattern-based tools miss.

> ⚠️ **Important Limitation**: AI vulnerability detection produces false positives, false negatives, and occasionally hallucinated vulnerabilities. FORGE Audit is positioned as **AI-assisted security analysis**, not a replacement for human security engineers.

---

## Core Capabilities

### 1. Repository Ingestion
Multiple input methods for flexibility:

| Input Type | Description | Implementation |
|------------|-------------|----------------|
| GitHub | Connect via OAuth or URL | GitHub API + clone |
| GitLab | Connect via OAuth or URL | GitLab API + clone |
| ZIP Archive | Upload compressed project | Server-side extraction |
| Paste Code | Quick single-file analysis | Direct text input |
| CI/CD | Automated pipeline integration | GitHub Actions, GitLab CI, Jenkins |

**Ingestion Process:**
```
Input Source
    ↓
Clone/Extract Repository
    ↓
Map File Structure
    ↓
Identify Languages (polyglot detection)
    ↓
Build Dependency Graph
    ↓
Create Analysis Context
```

### 2. Static Vulnerability Scanning
Combine traditional scanners with FORGE reasoning:

**Detection Categories:**
- SQL Injection
- Command Injection  
- Cross-Site Scripting (XSS)
- Cross-Site Request Forgery (CSRF)
- Authentication Flaws
- Authorization Bypass
- Cryptographic Misuse
- Unsafe Deserialization
- Path Traversal
- Server-Side Request Forgery (SSRF)
- Insecure Direct Object References
- Security Misconfiguration
- Sensitive Data Exposure
- Hardcoded Secrets/Credentials

### 3. Dependency Vulnerability Analysis
Scan libraries against CVE databases:

**Data Sources:**
- National Vulnerability Database (NVD)
- GitHub Advisory Database
- OSV (Open Source Vulnerabilities)
- Snyk Vulnerability Database

**Output Example:**
```json
{
  "dependency": "lodash",
  "version": "4.17.19",
  "vulnerability": "Prototype Pollution",
  "cve": "CVE-2021-23337",
  "severity": "high",
  "cvss": 7.2,
  "recommendation": "Upgrade to 4.17.21 or later",
  "affected_files": ["package.json", "package-lock.json"]
}
```

### 4. Exploit Reasoning (LLM-Powered)
The model answers: **"How could this vulnerability be exploited?"**

**Example Output:**
```
Vulnerability: SQL Injection in auth.ts:45

Exploit Analysis:
User input from the 'username' parameter reaches the SQL query 
without sanitization. An attacker could inject arbitrary SQL 
commands by submitting a crafted username like:

  ' OR '1'='1' --

This would bypass authentication, allowing unauthorized access 
to any user account. In severe cases, the attacker could:
- Exfiltrate entire database contents
- Modify or delete data
- Escalate privileges to admin
- Execute stored procedures
```

### 5. Patch Generation
Provide actionable, code-level fixes:

**Example:**
```diff
// auth.ts:45 - SQL Injection Fix

- const query = `SELECT * FROM users WHERE username = '${username}'`;
- const result = await db.query(query);
+ const query = 'SELECT * FROM users WHERE username = $1';
+ const result = await db.query(query, [username]);
```

### 6. Security Report Generation
Professional audit reports for stakeholders:

**Report Structure:**
1. **Executive Summary** - High-level findings for management
2. **Critical Vulnerabilities** - Immediate action required
3. **High-Severity Issues** - Address within 24-48 hours
4. **Medium-Severity Issues** - Address within 1-2 weeks
5. **Low-Severity Issues** - Address in next sprint
6. **Dependency Audit** - Third-party library risks
7. **Recommended Fixes** - Prioritized remediation plan
8. **Compliance Notes** - OWASP, CWE, SANS mappings

---

## System Architecture

### High-Level Flow

```
┌─────────────────────────────────────────────────────────────────┐
│                        FORGE Audit Pipeline                      │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│   ┌──────────────┐                                               │
│   │ Repo Input   │ GitHub / GitLab / ZIP / Paste / CI           │
│   └──────┬───────┘                                               │
│          ↓                                                       │
│   ┌──────────────┐                                               │
│   │ Ingestion    │ Clone, extract, map structure                 │
│   └──────┬───────┘                                               │
│          ↓                                                       │
│   ┌──────────────┐                                               │
│   │ AST Parsing  │ Language-specific parsers                     │
│   └──────┬───────┘                                               │
│          ↓                                                       │
│   ┌──────────────────────────────────────────────────┐          │
│   │              Analysis Layer                       │          │
│   │  ┌────────────────┐  ┌────────────────────────┐  │          │
│   │  │ Static Tools   │  │ Dependency Scanner     │  │          │
│   │  │ (Semgrep, etc) │  │ (NVD, OSV, Snyk)       │  │          │
│   │  └───────┬────────┘  └───────────┬────────────┘  │          │
│   │          └──────────┬────────────┘               │          │
│   └─────────────────────┼────────────────────────────┘          │
│                         ↓                                        │
│   ┌──────────────────────────────────────────────────┐          │
│   │           FORGE Reasoning Engine                  │          │
│   │  ┌────────────────────────────────────────────┐  │          │
│   │  │ Forge Coder / Forge Mini                   │  │          │
│   │  │ - Semantic vulnerability analysis          │  │          │
│   │  │ - Exploit reasoning                        │  │          │
│   │  │ - Patch generation                         │  │          │
│   │  │ - False positive filtering                 │  │          │
│   │  └────────────────────────────────────────────┘  │          │
│   └──────────────────────┬───────────────────────────┘          │
│                          ↓                                       │
│   ┌──────────────┐                                               │
│   │ Classification│ Severity scoring (CVSS-like)                 │
│   └──────┬───────┘                                               │
│          ↓                                                       │
│   ┌──────────────┐                                               │
│   │ Report Gen   │ PDF, JSON, SARIF, Markdown                    │
│   └──────────────┘                                               │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

### Component Breakdown

#### 1. Ingestion Service (`/api/services/audit/ingestion.py`)
```python
class IngestionService:
    async def ingest_github(repo_url: str, branch: str = "main") -> AuditContext
    async def ingest_gitlab(repo_url: str, branch: str = "main") -> AuditContext
    async def ingest_zip(file: UploadFile) -> AuditContext
    async def ingest_code(code: str, language: str) -> AuditContext
    
    # Internal methods
    async def _clone_repo(url: str, branch: str) -> Path
    async def _map_structure(path: Path) -> FileTree
    async def _detect_languages(path: Path) -> List[Language]
    async def _build_dependency_graph(path: Path) -> DependencyGraph
```

#### 2. Static Analysis Service (`/api/services/audit/static_analysis.py`)
```python
class StaticAnalysisService:
    async def run_semgrep(context: AuditContext) -> List[Finding]
    async def run_bandit(context: AuditContext) -> List[Finding]  # Python
    async def run_eslint_security(context: AuditContext) -> List[Finding]  # JS/TS
    async def run_gosec(context: AuditContext) -> List[Finding]  # Go
    async def run_brakeman(context: AuditContext) -> List[Finding]  # Ruby
    
    async def aggregate_findings(findings: List[List[Finding]]) -> List[Finding]
```

#### 3. Dependency Scanner (`/api/services/audit/dependency_scanner.py`)
```python
class DependencyScanner:
    async def scan_npm(package_json: Path) -> List[DependencyVuln]
    async def scan_pip(requirements: Path) -> List[DependencyVuln]
    async def scan_cargo(cargo_toml: Path) -> List[DependencyVuln]
    async def scan_go_mod(go_mod: Path) -> List[DependencyVuln]
    
    async def query_nvd(cpe: str) -> List[CVE]
    async def query_osv(package: str, ecosystem: str) -> List[Advisory]
```

#### 4. FORGE Reasoning Engine (`/api/services/audit/reasoning.py`)
```python
class ForgeReasoningEngine:
    def __init__(self, model: str = "forge-coder"):
        self.model = model
    
    async def analyze_vulnerability(
        finding: Finding, 
        code_context: str
    ) -> EnrichedFinding:
        """
        Use FORGE to:
        1. Validate if the finding is a true positive
        2. Explain the vulnerability in context
        3. Describe potential exploit scenarios
        4. Generate patch recommendations
        """
    
    async def generate_exploit_reasoning(finding: Finding) -> ExploitAnalysis
    async def generate_patch(finding: Finding, code: str) -> PatchSuggestion
    async def filter_false_positives(findings: List[Finding]) -> List[Finding]
```

#### 5. Report Generator (`/api/services/audit/report.py`)
```python
class ReportGenerator:
    async def generate_json(audit: AuditResult) -> dict
    async def generate_sarif(audit: AuditResult) -> dict  # GitHub/IDE compatible
    async def generate_markdown(audit: AuditResult) -> str
    async def generate_pdf(audit: AuditResult) -> bytes
    async def generate_executive_summary(audit: AuditResult) -> str
```

---

## API Design

### Endpoints

```
POST   /v1/audit/scan              # Start a new audit
GET    /v1/audit/scan/{scan_id}    # Get scan status/results
GET    /v1/audit/scans             # List user's scans
DELETE /v1/audit/scan/{scan_id}    # Delete a scan

POST   /v1/audit/analyze           # Quick single-file analysis
POST   /v1/audit/explain           # Explain a specific vulnerability
POST   /v1/audit/patch             # Generate patch for a vulnerability

GET    /v1/audit/report/{scan_id}  # Get full report
GET    /v1/audit/report/{scan_id}/pdf      # Download PDF report
GET    /v1/audit/report/{scan_id}/sarif    # Download SARIF format
```

### Request/Response Examples

#### Start Audit Scan
```bash
POST /v1/audit/scan
Authorization: Bearer sk-forge-xxx

{
  "source": "github",
  "repo_url": "https://github.com/user/repo",
  "branch": "main",
  "options": {
    "include_dependencies": true,
    "severity_threshold": "medium",
    "languages": ["javascript", "typescript", "python"],
    "exclude_paths": ["node_modules", "vendor", "dist"]
  }
}
```

**Response:**
```json
{
  "scan_id": "aud_abc123xyz",
  "status": "queued",
  "created_at": "2024-01-15T10:30:00Z",
  "estimated_duration": "2-5 minutes",
  "webhook_url": "https://api.openframe.co/v1/audit/scan/aud_abc123xyz"
}
```

#### Get Scan Results
```json
{
  "scan_id": "aud_abc123xyz",
  "status": "completed",
  "repository": "github.com/user/repo",
  "branch": "main",
  "completed_at": "2024-01-15T10:32:45Z",
  "summary": {
    "total_findings": 12,
    "critical": 1,
    "high": 3,
    "medium": 5,
    "low": 3,
    "files_scanned": 156,
    "lines_of_code": 24500,
    "dependencies_scanned": 89
  },
  "findings": [
    {
      "id": "vuln_001",
      "type": "sql_injection",
      "severity": "critical",
      "confidence": "high",
      "file": "src/auth/login.ts",
      "line": 45,
      "column": 12,
      "code_snippet": "const query = `SELECT * FROM users WHERE id = '${userId}'`;",
      "description": "User input directly interpolated into SQL query without sanitization",
      "exploit_reasoning": "An attacker could inject SQL commands via the userId parameter...",
      "suggested_fix": {
        "description": "Use parameterized queries",
        "diff": "- const query = `SELECT * FROM users WHERE id = '${userId}'`;\n+ const query = 'SELECT * FROM users WHERE id = $1';\n+ const result = await db.query(query, [userId]);"
      },
      "references": [
        "CWE-89",
        "OWASP A03:2021"
      ]
    }
  ],
  "dependencies": [
    {
      "name": "lodash",
      "version": "4.17.19",
      "vulnerabilities": [
        {
          "cve": "CVE-2021-23337",
          "severity": "high",
          "title": "Prototype Pollution",
          "fixed_in": "4.17.21"
        }
      ]
    }
  ],
  "usage": {
    "tokens_used": 45000,
    "cost": 0.085
  }
}
```

#### Quick Analysis (Single File)
```bash
POST /v1/audit/analyze
Authorization: Bearer sk-forge-xxx

{
  "code": "const query = `SELECT * FROM users WHERE id = '${req.params.id}'`;",
  "language": "javascript",
  "context": "Express.js route handler"
}
```

---

## Pricing Model

FORGE Audit uses the same credit-based system as the chat API, with pricing based on:
1. **Lines of code analyzed** (converted to token equivalent)
2. **LLM reasoning calls** (for exploit analysis, patch generation)
3. **Report generation**

### Pricing Tiers

| Operation | Token Equivalent | Forge Coder Rate | Forge Mini Rate |
|-----------|------------------|------------------|-----------------|
| Code Ingestion | 1 token / 4 chars | Standard | Standard |
| Static Analysis | 100 tokens / file | N/A (free) | N/A (free) |
| LLM Analysis | Actual tokens | $0.98/$1.87 per 1M | $0.08/$0.37 per 1M |
| Patch Generation | Actual tokens | $0.98/$1.87 per 1M | $0.08/$0.37 per 1M |
| Report Generation | 500 tokens flat | Standard | Standard |

### Estimated Costs

| Repository Size | Est. Tokens | Forge Coder Cost | Forge Mini Cost |
|-----------------|-------------|------------------|-----------------|
| Small (< 5K LOC) | ~50K | ~$0.10 | ~$0.02 |
| Medium (5-50K LOC) | ~200K | ~$0.40 | ~$0.08 |
| Large (50-200K LOC) | ~800K | ~$1.50 | ~$0.30 |
| Enterprise (200K+ LOC) | ~2M+ | ~$4.00 | ~$0.80 |

---

## Database Schema

### Tables

```sql
-- Audit scans
CREATE TABLE audit_scans (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id),
    
    -- Source info
    source_type VARCHAR(20) NOT NULL,  -- github, gitlab, zip, paste
    repo_url TEXT,
    branch VARCHAR(255),
    commit_sha VARCHAR(40),
    
    -- Status
    status VARCHAR(20) NOT NULL DEFAULT 'queued',  -- queued, running, completed, failed
    started_at TIMESTAMP,
    completed_at TIMESTAMP,
    error_message TEXT,
    
    -- Results summary
    total_findings INTEGER DEFAULT 0,
    critical_count INTEGER DEFAULT 0,
    high_count INTEGER DEFAULT 0,
    medium_count INTEGER DEFAULT 0,
    low_count INTEGER DEFAULT 0,
    
    -- Metadata
    files_scanned INTEGER DEFAULT 0,
    lines_of_code INTEGER DEFAULT 0,
    languages JSONB,
    
    -- Usage tracking
    tokens_used INTEGER DEFAULT 0,
    cost DECIMAL(10, 6) DEFAULT 0,
    
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Individual findings
CREATE TABLE audit_findings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    scan_id UUID NOT NULL REFERENCES audit_scans(id) ON DELETE CASCADE,
    
    -- Finding details
    finding_type VARCHAR(50) NOT NULL,  -- sql_injection, xss, etc.
    severity VARCHAR(20) NOT NULL,  -- critical, high, medium, low
    confidence VARCHAR(20) NOT NULL,  -- high, medium, low
    
    -- Location
    file_path TEXT NOT NULL,
    line_number INTEGER,
    column_number INTEGER,
    code_snippet TEXT,
    
    -- Analysis
    description TEXT NOT NULL,
    exploit_reasoning TEXT,
    suggested_fix JSONB,  -- { description, diff }
    
    -- References
    cwe_id VARCHAR(20),
    owasp_category VARCHAR(50),
    references JSONB,
    
    -- Status
    status VARCHAR(20) DEFAULT 'open',  -- open, acknowledged, fixed, false_positive
    
    created_at TIMESTAMP DEFAULT NOW()
);

-- Dependency vulnerabilities
CREATE TABLE audit_dependencies (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    scan_id UUID NOT NULL REFERENCES audit_scans(id) ON DELETE CASCADE,
    
    package_name VARCHAR(255) NOT NULL,
    package_version VARCHAR(50),
    ecosystem VARCHAR(50),  -- npm, pip, cargo, go
    
    -- Vulnerability info
    cve_id VARCHAR(20),
    severity VARCHAR(20),
    cvss_score DECIMAL(3, 1),
    title TEXT,
    description TEXT,
    fixed_in VARCHAR(50),
    
    created_at TIMESTAMP DEFAULT NOW()
);

-- Audit reports (cached)
CREATE TABLE audit_reports (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    scan_id UUID NOT NULL REFERENCES audit_scans(id) ON DELETE CASCADE,
    
    format VARCHAR(20) NOT NULL,  -- json, sarif, markdown, pdf
    content BYTEA,
    
    created_at TIMESTAMP DEFAULT NOW()
);
```

---

## CI/CD Integration

### GitHub Actions

```yaml
name: FORGE Security Audit
on: [push, pull_request]

jobs:
  security-audit:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      
      - name: Run FORGE Audit
        uses: openframe/forge-audit-action@v1
        with:
          api-key: ${{ secrets.FORGE_API_KEY }}
          fail-on: critical,high
          model: forge-mini  # or forge-coder for deeper analysis
          
      - name: Upload SARIF
        uses: github/codeql-action/upload-sarif@v2
        with:
          sarif_file: forge-audit-results.sarif
```

### GitLab CI

```yaml
forge-audit:
  image: openframe/forge-audit:latest
  script:
    - forge-audit scan . --format sarif --output gl-sast-report.json
  artifacts:
    reports:
      sast: gl-sast-report.json
  variables:
    FORGE_API_KEY: $FORGE_API_KEY
```

### CLI Tool

```bash
# Install
npm install -g @openframe/forge-audit

# Authenticate
forge-audit auth --key sk-forge-xxx

# Scan local directory
forge-audit scan ./src --severity medium --format json

# Scan GitHub repo
forge-audit scan github:user/repo --branch main

# Generate report
forge-audit report aud_abc123 --format pdf --output report.pdf
```

---

## Implementation Phases

### Phase 1: Core Infrastructure (Week 1-2)
- [ ] Database schema and migrations
- [ ] Basic API endpoints (scan, status, results)
- [ ] Ingestion service (paste code, ZIP upload)
- [ ] Basic static analysis integration (Semgrep)

### Phase 2: LLM Integration (Week 3-4)
- [ ] FORGE reasoning engine
- [ ] Exploit reasoning generation
- [ ] Patch suggestion generation
- [ ] False positive filtering

### Phase 3: Advanced Features (Week 5-6)
- [ ] GitHub/GitLab integration
- [ ] Dependency scanning (NVD, OSV)
- [ ] Report generation (JSON, SARIF, PDF)
- [ ] Webhook notifications

### Phase 4: CI/CD & Polish (Week 7-8)
- [ ] GitHub Action
- [ ] GitLab CI template
- [ ] CLI tool
- [ ] Dashboard improvements
- [ ] Documentation

---

## Security Considerations

1. **Code Isolation**: All repository analysis runs in isolated containers
2. **Data Retention**: Code is deleted after analysis (configurable retention)
3. **API Key Scoping**: Audit-specific API keys with limited permissions
4. **Rate Limiting**: Prevent abuse of expensive LLM operations
5. **Audit Logging**: All scans logged for compliance

---

## Research Opportunity

Publish technical benchmarks:

**"FORGE Audit: AI-Assisted Vulnerability Detection in Software Repositories"**

Evaluate against:
- OWASP Benchmark Project
- Juliet Test Suite (NIST)
- Known CVE reproductions
- Real-world vulnerable applications (DVWA, WebGoat)

Metrics:
- True Positive Rate
- False Positive Rate
- Detection latency
- Cost per vulnerability found

---

## Website Integration

Update site hierarchy:

```
FORGE Platform
├── Models
│   ├── Forge Coder (671B) → /research/model
│   └── Forge Mini (120B) → /research/mini
│
├── Capabilities
│   └── FORGE Audit → /audit
│       ├── Landing page → /audit
│       ├── Documentation → /audit-docs
│       └── Dashboard → /dashboard/audit
│
└── Research
    ├── Model Benchmarks → /research/benchmarks
    └── Security Analysis → /research/audit (future)
```

This positions FORGE as a **programmable intelligence platform** with specialized capabilities, not just a chatbot API.
