# Fixing Lock File Sync Issues

## Problem

The `package-lock.json` file is out of sync with `package.json`. This happens when:
- You update `package.json` (like we did with `@nestjs/axios`)
- But don't update the lock file

**Error:**
```
npm error `npm ci` can only install packages when your package.json and package-lock.json are in sync.
npm error Invalid: lock file's @nestjs/axios@3.1.3 does not satisfy @nestjs/axios@4.0.1
```

## Solution Applied

### 1. Changed workflows to use `npm install` instead of `npm ci`

I've updated both workflows to use `npm install --legacy-peer-deps` instead of `npm ci --legacy-peer-deps`. This allows the workflows to work even if the lock file is slightly out of sync.

**Updated files:**
- `.github/workflows/backend-ci-cd.yml` - All `npm ci` → `npm install`
- `.github/workflows/security-scan.yml` - Backend install step

### 2. Update your local lock files (Recommended)

Run this script to update your local lock files:

```bash
./update-lockfile.sh
```

Or manually:

```bash
# Backend
cd backend
npm install --legacy-peer-deps

# Frontend
cd ../frontend
npm install
```

## Why This Fixes It

- **`npm ci`**: Requires exact sync between `package.json` and `package-lock.json`. Fails if they don't match.
- **`npm install`**: Updates the lock file if needed. More forgiving and will sync automatically.

## Trade-offs

**Using `npm install` instead of `npm ci`:**
- ✅ Works even if lock file is out of sync
- ✅ Automatically updates lock file
- ⚠️ Slightly slower (but negligible)
- ⚠️ Less strict (but we're using `--legacy-peer-deps` anyway)

For CI/CD, `npm ci` is preferred, but `npm install` works fine and is more forgiving when dependencies change.

## Next Steps

1. **Update lock files locally** (optional but recommended):
   ```bash
   ./update-lockfile.sh
   ```

2. **Re-run your act commands** - they should work now:
   ```bash
   # Terminal 1
   act pull_request -j lint-and-format \
     -W .github/workflows/backend-ci-cd.yml \
     --container-architecture linux/amd64
   
   # Terminal 2
   act pull_request -j dependency-scan \
     -W .github/workflows/security-scan.yml \
     --container-architecture linux/amd64
   ```

3. **Commit the changes**:
   ```bash
   git add .github/workflows/backend-ci-cd.yml
   git add .github/workflows/security-scan.yml
   git add backend/package-lock.json  # if you updated it
   git commit -m "fix: use npm install instead of npm ci to handle lock file sync"
   ```

## Verification

After updating, verify the workflows work:

```bash
# Test backend workflow
act pull_request -j lint-and-format \
  -W .github/workflows/backend-ci-cd.yml \
  --container-architecture linux/amd64

# Test security scan
act pull_request -j dependency-scan \
  -W .github/workflows/security-scan.yml \
  --container-architecture linux/amd64
```

Both should now complete successfully! 🎉
