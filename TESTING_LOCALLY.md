# Testing CI Pipeline Locally

This guide explains how to test your GitHub Actions CI pipeline locally before pushing.

## Quick Start

Use the provided script to run all checks:

```bash
./test-local.sh
```

Or run specific checks:

```bash
./test-local.sh --backend    # Backend only
./test-local.sh --frontend   # Frontend only
./test-local.sh --contract   # Smart contracts only
./test-local.sh --security   # Security scans only
```

## Method 1: Using the Test Script (Recommended)

The `test-local.sh` script simulates the CI pipeline checks:

### Prerequisites
- Node.js 20+ installed
- npm or pnpm installed
- Rust toolchain (for contract tests)
- PostgreSQL (for backend E2E tests)

### Usage

```bash
# Make script executable (first time only)
chmod +x test-local.sh

# Run all checks
./test-local.sh

# Run specific checks
./test-local.sh --backend
./test-local.sh --frontend
./test-local.sh --contract
./test-local.sh --security
```

## Method 2: Manual Commands (Matches CI Exactly)

### Backend CI Pipeline

The backend CI runs these steps in order:

#### 1. Lint and Format Check
```bash
cd backend
npm ci                    # Install dependencies (matches CI)
npm run lint              # ESLint
npm run format -- --check # Format check
```

#### 2. Unit Tests (with PostgreSQL)
```bash
# Start PostgreSQL (if not running)
docker run -d \
  --name postgres-test \
  -e POSTGRES_USER=test \
  -e POSTGRES_PASSWORD=test \
  -e POSTGRES_DB=chioma_test \
  -p 5432:5432 \
  postgres:15

# Set environment variables
export NODE_ENV=test
export DB_HOST=localhost
export DB_PORT=5432
export DB_USERNAME=test
export DB_PASSWORD=test
export DB_NAME=chioma_test
export JWT_SECRET=test-jwt-secret-for-ci
export JWT_REFRESH_SECRET=test-refresh-secret-for-ci

# Run tests
npm run test:cov          # With coverage
# OR
npm run test              # Without coverage
```

#### 3. E2E Tests
```bash
npm run test:e2e
```

#### 4. Build
```bash
npm run build
```

#### 5. Security Scan
```bash
npm audit --audit-level=high
```

### Frontend CI Pipeline

#### 1. Lint and Format
```bash
cd frontend
npm ci
npm run lint
npx prettier --check "**/*.{js,jsx,ts,tsx,json,css,md}"
```

#### 2. Tests (if configured)
```bash
npm test -- --coverage
```

#### 3. Build
```bash
npm run build
```

### Contract CI Pipeline

#### 1. Format Check
```bash
cd contract
cargo fmt --all -- --check
```

#### 2. Build
```bash
cargo build --locked
```

#### 3. Tests
```bash
cargo test --locked
```

#### 4. Clippy (Linting)
```bash
cargo clippy --all-targets --all-features -- -D warnings
```

## Method 3: Using `act` (Run Actual GitHub Actions)

`act` allows you to run GitHub Actions workflows locally using Docker.

### Installation

```bash
# macOS
brew install act

# Linux
curl https://raw.githubusercontent.com/nektos/act/master/install.sh | sudo bash

# Windows (via Chocolatey)
choco install act-cli
```

### Usage

```bash
# List available workflows
act -l

# Run a specific workflow
act -W .github/workflows/backend-ci-cd.yml

# Run a specific job
act -j lint-and-format -W .github/workflows/backend-ci-cd.yml

# Run with secrets (create .secrets file)
act --secret-file .secrets
```

### Limitations

- Requires Docker
- Some actions may not work locally
- Services (like PostgreSQL) need to be configured manually

## Method 4: Docker Compose (Full Environment)

Create a `docker-compose.test.yml` to replicate the CI environment:

```yaml
version: '3.8'
services:
  postgres:
    image: postgres:15
    environment:
      POSTGRES_USER: test
      POSTGRES_PASSWORD: test
      POSTGRES_DB: chioma_test
    ports:
      - "5432:5432"
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U test"]
      interval: 10s
      timeout: 5s
      retries: 5
```

Run tests:

```bash
docker-compose -f docker-compose.test.yml up -d
# Run your tests
docker-compose -f docker-compose.test.yml down
```

## Troubleshooting

### Backend Tests Fail

1. **PostgreSQL not running**: Start PostgreSQL or use Docker
2. **Database connection errors**: Check environment variables
3. **Port conflicts**: Change DB_PORT if 5432 is in use

### Frontend Build Fails

1. **Missing dependencies**: Run `npm ci` (not `npm install`)
2. **Type errors**: Run `npm run lint` first
3. **Memory issues**: Increase Node memory: `NODE_OPTIONS=--max-old-space-size=4096 npm run build`

### Contract Tests Fail

1. **Rust not installed**: Install via rustup
2. **Soroban CLI missing**: `cargo install soroban-cli --locked`
3. **Format issues**: Run `cargo fmt --all`

## CI vs Local Differences

| Aspect | CI | Local |
|--------|----|----|
| Package Manager | npm | npm or pnpm |
| Database | Docker service | Local or Docker |
| Node Version | 20 (exact) | Your version |
| Environment | Isolated | Your machine |
| Secrets | GitHub Secrets | Local .env |

## Pre-Push Checklist

Before pushing, ensure:

- [ ] `./test-local.sh --all` passes
- [ ] All linting passes
- [ ] All tests pass
- [ ] Build succeeds
- [ ] No security vulnerabilities (high/critical)
- [ ] Code is formatted

## Additional Resources

- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- [act Documentation](https://github.com/nektos/act)
- [Docker Compose Documentation](https://docs.docker.com/compose/)
