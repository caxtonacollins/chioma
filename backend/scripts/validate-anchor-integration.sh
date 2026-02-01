#!/bin/bash

# MIT License
# Copyright (c) 2026 caxton strange

echo "🔍 Validating Anchor Integration for CI/CD..."

# Check license headers
echo "📄 Checking license headers..."
MISSING_LICENSE=0

for file in \
  "src/modules/transactions/entities/anchor-transaction.entity.ts" \
  "src/modules/transactions/entities/supported-currency.entity.ts" \
  "src/modules/transactions/entities/index.ts" \
  "src/modules/stellar/services/anchor.service.ts" \
  "src/modules/stellar/dto/anchor.dto.ts" \
  "src/modules/stellar/controllers/anchor.controller.ts" \
  "src/modules/stellar/controllers/anchor-webhook.controller.ts" \
  "src/migrations/1769350100000-CreateAnchorTables.ts"
do
  if ! head -3 "$file" | grep -q "MIT License"; then
    echo "❌ Missing license header: $file"
    MISSING_LICENSE=1
  else
    echo "✅ License header found: $file"
  fi
done

# Check TypeScript exports
echo "📦 Checking exports..."
if grep -q "anchor.service" "src/modules/stellar/services/index.ts"; then
  echo "✅ Anchor service exported"
else
  echo "❌ Anchor service not exported"
fi

if grep -q "anchor.dto" "src/modules/stellar/dto/index.ts"; then
  echo "✅ Anchor DTOs exported"
else
  echo "❌ Anchor DTOs not exported"
fi

# Check test files exist
echo "🧪 Checking test files..."
if [ -f "src/modules/stellar/__tests__/anchor.service.spec.ts" ]; then
  echo "✅ Unit tests exist"
else
  echo "❌ Unit tests missing"
fi

if [ -f "test/anchor.e2e-spec.ts" ]; then
  echo "✅ E2E tests exist"
else
  echo "❌ E2E tests missing"
fi

# Check migration file
echo "🗄️ Checking migration..."
if [ -f "src/migrations/1769350100000-CreateAnchorTables.ts" ]; then
  echo "✅ Migration file exists"
else
  echo "❌ Migration file missing"
fi

# Summary
if [ $MISSING_LICENSE -eq 0 ]; then
  echo "🎉 All CI/CD requirements met!"
  exit 0
else
  echo "❌ Some requirements not met"
  exit 1
fi
