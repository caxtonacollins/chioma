#!/bin/bash

# Script to update package-lock.json files to match package.json
# This fixes the "lock file out of sync" errors

set -e

echo "🔄 Updating Lock Files"
echo "======================"
echo ""

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Backend
echo -e "${YELLOW}Updating backend/package-lock.json...${NC}"
cd backend
if [ -f "package-lock.json" ]; then
    echo "Found package-lock.json, updating..."
    npm install --legacy-peer-deps
    echo -e "${GREEN}✅ Backend lock file updated${NC}"
else
    echo "No package-lock.json found, generating..."
    npm install --legacy-peer-deps
    echo -e "${GREEN}✅ Backend lock file created${NC}"
fi
cd ..

# Frontend
echo ""
echo -e "${YELLOW}Updating frontend/package-lock.json...${NC}"
cd frontend
if [ -f "package-lock.json" ]; then
    echo "Found package-lock.json, updating..."
    npm install
    echo -e "${GREEN}✅ Frontend lock file updated${NC}"
else
    echo "No package-lock.json found, generating..."
    npm install
    echo -e "${GREEN}✅ Frontend lock file created${NC}"
fi
cd ..

echo ""
echo -e "${GREEN}✅ All lock files updated!${NC}"
echo ""
echo "Next steps:"
echo "1. Commit the updated lock files:"
echo "   git add backend/package-lock.json frontend/package-lock.json"
echo "   git commit -m 'chore: update package-lock.json files'"
echo ""
echo "2. Re-run your act commands - they should work now!"
