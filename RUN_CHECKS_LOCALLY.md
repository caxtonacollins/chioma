# Running GitHub Actions Checks Locally with Act

This guide walks you through running the failing checks from your PR locally.

## Quick Reference

Based on your images, here are the checks to run:

### Failing Checks:
1. **Backend CI/CD / Lint and Format Check** → `lint-and-format` job
2. **CodeQL Analysis** → `codeql-analysis` job  
3. **Security Scanning / Dependency Vulnerability Scan** → `dependency-scan` job
4. **Security Scanning / OWASP Dependency Check** → `owasp-dependency-check` job

## Step-by-Step Instructions

### 1. Backend CI/CD - Lint and Format Check

This is the first failing check. You have two options:

#### Option A: Using Act (may have dependency issues)

```bash
cd /Users/solenoid/Documents/Development/Personal/chioma

# Run the lint and format check
act pull_request -j lint-and-format \
  -W .github/workflows/backend-ci-cd.yml \
  --container-architecture linux/amd64
```

**Note:** If you see dependency conflicts (like `@nestjs/axios` peer dependency issues), use Option B instead.

#### Option B: Run Manually (Recommended)

This is faster and will show you the actual errors:

```bash
cd /Users/solenoid/Documents/Development/Personal/chioma/backend

# Install dependencies (use --legacy-peer-deps if needed)
npm install --legacy-peer-deps

# Run ESLint
npm run lint

# Check Prettier formatting
npm run format -- --check
```

**To fix formatting issues:**
```bash
npm run format  # This will auto-fix formatting
```

**What this does:**
- Runs ESLint to check code quality
- Checks Prettier formatting
- Installs dependencies and validates code style

### 2. CodeQL Analysis

**Note:** CodeQL has limited support in act and requires GitHub's infrastructure. 

#### Option A: Using Act (Limited)

```bash
act pull_request -j codeql-analysis \
  -W .github/workflows/security-scan.yml \
  --container-architecture linux/amd64
```

**This will likely fail** because CodeQL requires GitHub's analysis infrastructure.

#### Option B: Manual Security Checks (Recommended)

Since CodeQL checks for security vulnerabilities, you can run similar checks:

```bash
# Install CodeQL CLI locally (optional)
brew install codeql

# Or run npm audit which checks for known vulnerabilities
cd backend
npm audit --audit-level=moderate

cd ../frontend
npm audit --audit-level=moderate
```

**Note:** The actual CodeQL analysis needs to run on GitHub Actions. The errors shown are from GitHub's CodeQL analysis, not something you can fully replicate locally.

### 3. Dependency Vulnerability Scan

#### Option A: Using Act

```bash
act pull_request -j dependency-scan \
  -W .github/workflows/security-scan.yml \
  --container-architecture linux/amd64
```

#### Option B: Run Manually (Recommended - Faster)

```bash
# Backend dependency scan
cd /Users/solenoid/Documents/Development/Personal/chioma/backend
npm install --legacy-peer-deps
npm audit --audit-level=moderate

# Frontend dependency scan
cd /Users/solenoid/Documents/Development/Personal/chioma/frontend
npm install
npm audit --audit-level=moderate
```

**What this does:**
- Scans `package-lock.json` files for known vulnerabilities
- Shows severity levels (low, moderate, high, critical)
- Lists affected packages and recommended fixes

### 4. OWASP Dependency Check

#### Option A: Using Act

```bash
act pull_request -j owasp-dependency-check \
  -W .github/workflows/security-scan.yml \
  --container-architecture linux/amd64
```

**Note:** OWASP Dependency Check uses a Docker action that may not work perfectly in act.

#### Option B: Run npm audit (Recommended)

OWASP Dependency Check is similar to npm audit but more comprehensive. For local testing, npm audit is sufficient:

```bash
# Backend
cd /Users/solenoid/Documents/Development/Personal/chioma/backend
npm install --legacy-peer-deps
npm audit --audit-level=moderate

# Frontend  
cd /Users/solenoid/Documents/Development/Personal/chioma/frontend
npm install
npm audit --audit-level=moderate
```

**To see detailed vulnerability info:**
```bash
npm audit --json > audit-report.json  # Save detailed report
```

## Quick Start: Run All Checks Manually

Here's the fastest way to run all the checks locally:

```bash
# Navigate to project root
cd /Users/solenoid/Documents/Development/Personal/chioma

# 1. Backend Lint and Format Check
cd backend
npm install --legacy-peer-deps
npm run lint
npm run format -- --check

# 2. Backend Dependency Scan
npm audit --audit-level=moderate

# 3. Frontend Dependency Scan
cd ../frontend
npm install
npm audit --audit-level=moderate

# 4. Frontend Lint (if you want to check frontend too)
npm run lint
```

## Running All Checks with Act

You can run multiple jobs, but some have dependencies. Here's the recommended order:

```bash
# 1. Lint and Format (must pass first)
act pull_request -j lint-and-format -W .github/workflows/backend-ci-cd.yml --container-architecture linux/amd64

# 2. Dependency scans (can run in parallel)
act pull_request -j dependency-scan -W .github/workflows/security-scan.yml --container-architecture linux/amd64
act pull_request -j owasp-dependency-check -W .github/workflows/security-scan.yml --container-architecture linux/amd64

# 3. CodeQL (may have limitations in act)
act pull_request -j codeql-analysis -W .github/workflows/security-scan.yml --container-architecture linux/amd64
```

## Alternative: Run Checks Manually

If act has issues with certain actions, you can run the checks manually:

### Backend Lint and Format

```bash
cd backend
npm ci
npm run lint
npm run format -- --check
```

### Dependency Vulnerability Scan

```bash
# Backend
cd backend
npm ci
npm audit --audit-level=moderate

# Frontend
cd frontend
npm ci
npm audit --audit-level=moderate
```

### Security Headers Check

```bash
# Only runs if PRODUCTION_URL is set
# Skip this if you don't have a production URL configured
```

## Troubleshooting

### Act fails with architecture errors

Always use `--container-architecture linux/amd64` on Apple Silicon Macs:

```bash
act --container-architecture linux/amd64 -j <job-name> -W <workflow-file>
```

### Some actions don't work in act

Some GitHub Actions (like CodeQL, OWASP) may not work perfectly in act. In that case:
1. Run the underlying commands manually (see "Alternative" section above)
2. Or push to a branch and let GitHub Actions run them

### Services (PostgreSQL) not available

For jobs that need PostgreSQL (like `test` or `e2e-test`), start PostgreSQL first:

```bash
docker run -d \
  --name postgres-test \
  -e POSTGRES_USER=test \
  -e POSTGRES_PASSWORD=test \
  -e POSTGRES_DB=chioma_test \
  -p 5432:5432 \
  postgres:15

# Then run the job with network access
act -j test -W .github/workflows/backend-ci-cd.yml \
  --container-architecture linux/amd64 \
  --container-options "--network host"
```

### Verbose output for debugging

Add `-v` or `-vv` for more detailed output:

```bash
act -vv -j lint-and-format -W .github/workflows/backend-ci-cd.yml --container-architecture linux/amd64
```

## Expected Results

After running the checks, you should see:

✅ **Lint and Format Check**: Should show any ESLint errors or formatting issues
✅ **Dependency Scan**: Should show npm audit results with vulnerability counts
✅ **OWASP Check**: Should generate a dependency check report
⚠️ **CodeQL**: May not work fully in act, but you'll see if it starts

## Next Steps

1. Fix any issues found by the lint/format check
2. Address any high/critical vulnerabilities from dependency scans
3. Review CodeQL results (if available) for security issues
4. Re-run the checks to verify fixes
