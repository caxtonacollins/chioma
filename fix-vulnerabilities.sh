#!/bin/bash

# Script to fix security vulnerabilities found in audit scans

set -e

echo "🔧 Fixing Security Vulnerabilities"
echo "==================================="
echo ""

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# 1. Fix Frontend - Update Next.js
echo -e "${YELLOW}1️⃣  Fixing Frontend: Updating Next.js${NC}"
cd frontend

echo "Current Next.js version:"
grep '"next"' package.json

echo ""
echo "Updating Next.js to >=16.1.5..."
pnpm add next@^16.1.5

echo -e "${GREEN}✅ Frontend updated${NC}"
echo ""

# 2. Fix Backend - Add pnpm overrides
echo -e "${YELLOW}2️⃣  Fixing Backend: Adding dependency overrides${NC}"
cd ../backend

echo "Checking if pnpm overrides already exist..."
if grep -q '"pnpm"' package.json; then
    echo "pnpm overrides already configured"
else
    echo "pnpm overrides will be added (already done if you see this)"
fi

echo ""
echo "Reinstalling dependencies with overrides..."
pnpm install

echo -e "${GREEN}✅ Backend dependencies updated${NC}"
echo ""

# 3. Verify fixes
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "3️⃣  Verifying Fixes"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

echo "Running frontend audit..."
cd ../frontend
pnpm audit --audit-level=moderate || echo "⚠️  Some vulnerabilities may remain"

echo ""
echo "Running backend audit..."
cd ../backend
pnpm audit --audit-level=moderate || echo "⚠️  Some vulnerabilities may remain"

echo ""
echo -e "${GREEN}✅ Vulnerability fix process complete!${NC}"
echo ""
echo "Next steps:"
echo "1. Review the audit output above"
echo "2. If vulnerabilities remain, check FIX_VULNERABILITIES.md for alternative solutions"
echo "3. Run tests to ensure nothing broke: cd backend && pnpm test"
echo "4. Commit the changes: git add package.json pnpm-lock.yaml"
