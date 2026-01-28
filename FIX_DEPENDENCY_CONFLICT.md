# Fixing Dependency Conflict: @nestjs/axios

## Problem

The `@nestjs/axios@3.1.3` package doesn't support NestJS v11. It only supports NestJS v7-v10, but your project uses NestJS v11.

**Error:**
```
peer @nestjs/common@"^7.0.0 || ^8.0.0 || ^9.0.0 || ^10.0.0" from @nestjs/axios@3.1.3
Found: @nestjs/common@11.1.12
```

## Solution

### Option 1: Update @nestjs/axios (Recommended)

I've updated `backend/package.json` to use `@nestjs/axios@^4.0.1`, which should support NestJS v11.

**To apply:**
```bash
cd backend
pnpm install
# or
npm install
```

### Option 2: Use --legacy-peer-deps (Temporary)

If updating doesn't work, the workflows have been updated to use `--legacy-peer-deps` flag. This tells npm to ignore peer dependency conflicts.

**Already applied in:**
- `.github/workflows/backend-ci-cd.yml` - All `npm ci` commands
- `.github/workflows/security-scan.yml` - Backend dependency installation

## Running Checks in Parallel

Yes! You can run different checks in separate terminal shells:

**Terminal 1:**
```bash
cd /Users/solenoid/Documents/Development/Personal/chioma
act pull_request -j lint-and-format \
  -W .github/workflows/backend-ci-cd.yml \
  --container-architecture linux/amd64
```

**Terminal 2:**
```bash
cd /Users/solenoid/Documents/Development/Personal/chioma
act pull_request -j dependency-scan \
  -W .github/workflows/security-scan.yml \
  --container-architecture linux/amd64
```

## Next Steps

1. **Update dependencies locally:**
   ```bash
   cd backend
   pnpm install
   ```

2. **Test locally:**
   ```bash
   cd backend
   pnpm run lint
   pnpm run format -- --check
   ```

3. **Re-run the checks with act:**
   ```bash
   # Terminal 1
   act pull_request -j lint-and-format \
     -W .github/workflows/backend-ci-cd.yml \
     --container-architecture linux/amd64
   
   # Terminal 2 (in another terminal)
   act pull_request -j dependency-scan \
     -W .github/workflows/security-scan.yml \
     --container-architecture linux/amd64
   ```

## If @nestjs/axios@4.0.1 Still Has Issues

If updating to v4.0.1 doesn't work, you can:

1. **Check if there's a newer version:**
   ```bash
   npm view @nestjs/axios versions --json
   ```

2. **Use --legacy-peer-deps locally:**
   ```bash
   cd backend
   npm install --legacy-peer-deps
   ```

3. **Or remove @nestjs/axios if not needed:**
   - Check if you're actually using it in your code
   - If not, remove it from `package.json`

## Verification

After fixing, verify the installation works:

```bash
cd backend
pnpm install
pnpm run build  # Should succeed
```
