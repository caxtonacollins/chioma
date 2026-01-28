# Setting Up Docker and Act on macOS

This guide will help you install Docker Desktop and `act` on your Mac so you can run GitHub Actions workflows locally.

## Step 1: Install Docker Desktop

### Option A: Using Homebrew (Recommended)

```bash
# Install Docker Desktop via Homebrew
brew install --cask docker

# Start Docker Desktop
open -a Docker
```

### Option B: Manual Installation

1. Download Docker Desktop for Mac from: https://www.docker.com/products/docker-desktop/
2. Choose the correct version:
   - **Apple Silicon (M1/M2/M3)**: Download "Docker Desktop for Mac with Apple Silicon"
   - **Intel Mac**: Download "Docker Desktop for Mac with Intel chip"
3. Open the downloaded `.dmg` file
4. Drag Docker to your Applications folder
5. Launch Docker from Applications
6. Follow the setup wizard (you may need to enter your password)

### Verify Docker Installation

```bash
# Check Docker version
docker --version

# Test Docker with a simple container
docker run hello-world
```

If you see "Hello from Docker!" message, Docker is working correctly.

## Step 2: Install Act

Act is a tool that runs GitHub Actions workflows locally using Docker.

```bash
# Install act using Homebrew
brew install act
```

### Verify Act Installation

```bash
# Check act version
act --version
```

## Step 3: Configure Act (Optional)

Act needs to download GitHub Actions runner images. You can configure the image size:

```bash
# Use smaller images (faster, but may have compatibility issues)
act --version

# Or create a .actrc file in your home directory
echo "-P ubuntu-latest=catthehacker/ubuntu:act-latest" > ~/.actrc
```

## Step 4: Test Your Setup

Navigate to your project directory and test act:

```bash
cd /Users/solenoid/Documents/Development/Personal/chioma

# List all available workflows
act -l

# Run a specific workflow (dry-run first)
act -n -W .github/workflows/contract-ci-cd.yml

# Run a specific job
act -j contract-ci -W .github/workflows/contract-ci-cd.yml
```

## Common Act Commands

```bash
# List all workflows and jobs
act -l

# Run all workflows (dry-run)
act -n

# Run a specific workflow
act -W .github/workflows/backend-ci-cd.yml

# Run a specific job from a workflow
act -j lint-and-format -W .github/workflows/backend-ci-cd.yml

# Run with environment variables
act --env-file .env

# Run with secrets (create .secrets file)
act --secret-file .secrets

# Use a specific event
act push

# Run with verbose output
act -v
```

## Troubleshooting

### Docker Desktop Not Starting

1. **Check if Docker is running:**
   ```bash
   docker ps
   ```
   If you get an error, Docker Desktop may not be running.

2. **Start Docker Desktop manually:**
   ```bash
   open -a Docker
   ```

3. **Check Docker Desktop status:**
   - Look for the Docker whale icon in your menu bar
   - It should be green/active, not gray

### Act Can't Find Docker

If act says Docker is not available:

```bash
# Verify Docker is accessible
docker ps

# If Docker works but act doesn't, try:
which docker
which act

# Reinstall act
brew reinstall act
```

### Permission Issues

If you get permission errors:

```bash
# Add your user to the docker group (if needed)
sudo dseditgroup -o edit -a $(whoami) -t user docker

# Or ensure Docker Desktop has proper permissions in System Settings
# System Settings > Privacy & Security > Full Disk Access
```

### Large Image Downloads

Act needs to download GitHub Actions runner images (several GB). First run may take time:

```bash
# Check downloaded images
docker images

# Use smaller images
echo "-P ubuntu-latest=catthehacker/ubuntu:act-latest" > ~/.actrc
```

### Workflow Fails with "Service not found"

Some workflows use services (like PostgreSQL). Act has limited service support:

```bash
# For workflows with services, you may need to:
# 1. Run services manually with Docker
docker run -d --name postgres-test \
  -e POSTGRES_USER=test \
  -e POSTGRES_PASSWORD=test \
  -e POSTGRES_DB=chioma_test \
  -p 5432:5432 \
  postgres:15

# 2. Then run act with --container-options
act -j test --container-options "--network host"
```

## Example: Running Contract CI Workflow

```bash
# Navigate to project root
cd /Users/solenoid/Documents/Development/Personal/chioma

# List contract workflow jobs
act -l -W .github/workflows/contract-ci-cd.yml

# Run the contract CI workflow
act -W .github/workflows/contract-ci-cd.yml

# Or run a specific job
act -j contract-ci -W .github/workflows/contract-ci-cd.yml
```

## Example: Running Backend CI Workflow

```bash
# Start PostgreSQL service first (if needed)
docker run -d --name postgres-test \
  -e POSTGRES_USER=test \
  -e POSTGRES_PASSWORD=test \
  -e POSTGRES_DB=chioma_test \
  -p 5432:5432 \
  postgres:15

# Run backend workflow
act -W .github/workflows/backend-ci-cd.yml

# Or run specific job
act -j lint-and-format -W .github/workflows/backend-ci-cd.yml
```

## Docker Desktop Settings

Recommended Docker Desktop settings for development:

1. **Resources:**
   - Memory: At least 4GB (8GB recommended)
   - CPUs: At least 2 cores
   - Disk: At least 20GB free

2. **General:**
   - ✅ Start Docker Desktop when you log in
   - ✅ Use Docker Compose V2

3. **Resources > Advanced:**
   - Enable file sharing for your project directory

## Next Steps

Once Docker and act are set up:

1. Test with a simple workflow:
   ```bash
   act -n -W .github/workflows/contract-ci-cd.yml
   ```

2. Read the [TESTING_LOCALLY.md](./TESTING_LOCALLY.md) guide for more details

3. Create a `.secrets` file if your workflows need secrets:
   ```bash
   # .secrets (add to .gitignore!)
   SECRET_KEY=your-secret-value
   ```

## Additional Resources

- [Docker Desktop Documentation](https://docs.docker.com/desktop/)
- [Act Documentation](https://github.com/nektos/act)
- [GitHub Actions Documentation](https://docs.github.com/en/actions)

## Quick Reference

```bash
# Check Docker status
docker ps

# Check act version
act --version

# List workflows
act -l

# Run workflow (dry-run)
act -n -W .github/workflows/workflow-name.yml

# Run workflow (actual execution)
act -W .github/workflows/workflow-name.yml

# Run specific job
act -j job-name -W .github/workflows/workflow-name.yml

# Clean up Docker
docker system prune -a
```
