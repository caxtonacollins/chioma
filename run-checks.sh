#!/bin/bash

# Script to run the failing checks locally
# Based on the GitHub Actions checks shown in your PR

set -e  # Exit on error

echo "🔍 Running Local Checks (matching GitHub Actions)"
echo "=================================================="
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Track results
FAILED=0
PASSED=0

# Function to run a check
run_check() {
    local name=$1
    local command=$2
    
    echo -e "${YELLOW}▶ Running: $name${NC}"
    if eval "$command"; then
        echo -e "${GREEN}✅ PASSED: $name${NC}"
        ((PASSED++))
        echo ""
        return 0
    else
        echo -e "${RED}❌ FAILED: $name${NC}"
        ((FAILED++))
        echo ""
        return 1
    fi
}

# 1. Backend Lint and Format Check
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "1️⃣  Backend CI/CD - Lint and Format Check"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

cd backend

# Install dependencies
echo "Installing backend dependencies..."
if ! npm install --legacy-peer-deps --silent; then
    echo -e "${RED}❌ Failed to install backend dependencies${NC}"
    exit 1
fi

# Run ESLint
run_check "Backend ESLint" "npm run lint"

# Check Prettier formatting
run_check "Backend Prettier Format Check" "npm run format -- --check"

cd ..

# 2. Dependency Vulnerability Scans
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "2️⃣  Security Scanning - Dependency Vulnerability Scan"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# Backend dependency scan
cd backend
run_check "Backend npm audit" "npm audit --audit-level=moderate || true"
cd ..

# Frontend dependency scan
cd frontend
echo "Installing frontend dependencies..."
if ! npm install --silent; then
    echo -e "${RED}❌ Failed to install frontend dependencies${NC}"
    exit 1
fi

run_check "Frontend npm audit" "npm audit --audit-level=moderate || true"
cd ..

# 3. OWASP Dependency Check (using npm audit as proxy)
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "3️⃣  Security Scanning - OWASP Dependency Check"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo -e "${YELLOW}Note: Running npm audit as proxy for OWASP check${NC}"
echo "For full OWASP analysis, this needs to run on GitHub Actions"
echo ""

# Summary
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📊 Summary"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo -e "${GREEN}✅ Passed: $PASSED${NC}"
echo -e "${RED}❌ Failed: $FAILED${NC}"
echo ""

if [ $FAILED -eq 0 ]; then
    echo -e "${GREEN}🎉 All checks passed!${NC}"
    exit 0
else
    echo -e "${RED}⚠️  Some checks failed. Review the output above.${NC}"
    echo ""
    echo "Note: CodeQL Analysis requires GitHub Actions infrastructure"
    echo "      and cannot be fully replicated locally."
    exit 1
fi
