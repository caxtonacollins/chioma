# Fixing Security Vulnerabilities

This guide helps you fix the vulnerabilities found in the audit scans.

## Summary of Vulnerabilities

### Backend (4 vulnerabilities)
1. **High**: `tar` - Arbitrary File Overwrite (needs >=7.5.3)
2. **High**: `tar` - Race Condition (needs >=7.5.4)
3. **Moderate**: `lodash` - Prototype Pollution (needs >=4.17.23)
4. **Low**: (1 additional)

### Frontend (1 vulnerability)
1. **Moderate**: `next` - DoS via Image Optimizer (needs >=16.1.5)

## Fixing the Vulnerabilities

### 1. Frontend: Update Next.js

The frontend has Next.js 16.1.3, which needs to be updated to 16.1.5 or higher.

```bash
cd frontend

# Update Next.js to latest patch version
pnpm update next@latest

# Or update to a specific version
pnpm add next@16.1.5

# Verify the update
pnpm audit --audit-level=moderate
```

**Current version**: 16.1.3  
**Required version**: >=16.1.5  
**Recommended**: Update to latest 16.x version

### 2. Backend: Fix Transitive Dependencies

The backend vulnerabilities are in transitive dependencies (dependencies of dependencies).

#### Option A: Use npm/pnpm overrides (Recommended)

Create or update `package.json` to force newer versions:

```json
{
  "overrides": {
    "tar": ">=7.5.4",
    "lodash": ">=4.17.23"
  }
}
```

Or if using pnpm, add to `package.json`:

```json
{
  "pnpm": {
    "overrides": {
      "tar": ">=7.5.4",
      "lodash": ">=4.17.23"
    }
  }
}
```

Then reinstall:

```bash
cd backend
pnpm install
pnpm audit --audit-level=moderate
```

#### Option B: Update Parent Dependencies

The vulnerabilities come from:
- `tar`: `bcrypt > @mapbox/node-pre-gyp > tar`
- `lodash`: `@nestjs/cli > node-emoji > lodash`

Try updating the parent packages:

```bash
cd backend

# Update bcrypt (may pull in newer tar)
pnpm update bcrypt@latest

# Update @nestjs/cli (may pull in newer lodash)
pnpm update @nestjs/cli@latest

# Reinstall to update lock file
pnpm install

# Check if vulnerabilities are resolved
pnpm audit --audit-level=moderate
```

#### Option C: Use resolutions (if using npm/yarn)

If you're using npm or yarn, add to `package.json`:

```json
{
  "resolutions": {
    "tar": ">=7.5.4",
    "lodash": ">=4.17.23"
  }
}
```

## Step-by-Step Fix Process

### Step 1: Fix Frontend (Easiest)

```bash
cd /Users/solenoid/Documents/Development/Personal/chioma/frontend

# Update Next.js
pnpm add next@latest

# Verify fix
pnpm audit --audit-level=moderate
```

### Step 2: Fix Backend

```bash
cd /Users/solenoid/Documents/Development/Personal/chioma/backend

# Add overrides to package.json (see below)
# Then reinstall
pnpm install

# Verify fix
pnpm audit --audit-level=moderate
```

### Step 3: Update package.json with Overrides

Edit `backend/package.json` and add the overrides section:

```json
{
  "name": "backend",
  "version": "0.0.1",
  ...
  "pnpm": {
    "overrides": {
      "tar": ">=7.5.4",
      "lodash": ">=4.17.23"
    }
  }
}
```

Or if using npm:

```json
{
  "name": "backend",
  "version": "0.0.1",
  ...
  "overrides": {
    "tar": ">=7.5.4",
    "lodash": ">=4.17.23"
  }
}
```

## Verification

After applying fixes, verify they're resolved:

```bash
# Backend
cd backend
pnpm audit --audit-level=moderate

# Frontend
cd ../frontend
pnpm audit --audit-level=moderate
```

## Understanding the Vulnerabilities

### tar Vulnerabilities (High Severity)

- **Issue**: Arbitrary file overwrite and symlink poisoning
- **Impact**: An attacker could overwrite files or create symlinks
- **Fix**: Update to tar >=7.5.4
- **Source**: Comes from `bcrypt > @mapbox/node-pre-gyp > tar`

### lodash Vulnerability (Moderate Severity)

- **Issue**: Prototype pollution in `_.unset` and `_.omit`
- **Impact**: Could allow modification of object prototypes
- **Fix**: Update to lodash >=4.17.23
- **Source**: Comes from `@nestjs/cli > node-emoji > lodash`

### Next.js Vulnerability (Moderate Severity)

- **Issue**: DoS via Image Optimizer remotePatterns
- **Impact**: Denial of service attack vector
- **Fix**: Update to Next.js >=16.1.5
- **Source**: Direct dependency

## If Overrides Don't Work

If package overrides don't resolve the issues, you may need to:

1. **Wait for parent package updates**: The maintainers of `bcrypt` or `@nestjs/cli` may release updates that pull in fixed versions.

2. **Use npm-force-resolutions** (npm only):
   ```bash
   npm install --save-dev npm-force-resolutions
   ```

3. **Contact package maintainers**: Report the vulnerabilities to:
   - `bcrypt` maintainers (for tar issue)
   - `@nestjs/cli` maintainers (for lodash issue)

## After Fixing

1. Run the full audit again:
   ```bash
   ./run-checks.sh
   ```

2. Commit the changes:
   ```bash
   git add backend/package.json frontend/package.json
   git add backend/pnpm-lock.yaml frontend/pnpm-lock.yaml  # or package-lock.json
   git commit -m "fix: resolve security vulnerabilities in dependencies"
   ```

3. Push and verify in GitHub Actions that the security scans pass.
