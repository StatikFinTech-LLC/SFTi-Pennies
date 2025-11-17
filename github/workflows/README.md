# GitHub Actions Workflows

**📁 Location:** `/.github/workflows`

## Overview

This directory contains GitHub Actions workflow definitions that automate the SFTi-Pennies trading journal system. Workflows handle data processing, content generation, image optimization, and site deployment whenever trades are submitted or content is updated.

## Workflows

### `trade_pipeline.yml`
**Main automation pipeline for trade processing and site deployment**

#### Purpose
Automatically processes new trades, generates analytics, creates visualizations, and deploys the updated trading journal to GitHub Pages.

#### Trigger Conditions

The workflow runs when:

1. **Push events** to:
   - `trades/**` - Legacy trade directory
   - `SFTi.Tradez/**` - New trade directory structure
   - `index.directory/**` - Content updates
   - `.github/assets/**` - Asset uploads
   - `.github/scripts/**` - Script updates
   - `.github/workflows/**` - Workflow changes

2. **Manual trigger** via:
   - GitHub Actions UI (workflow_dispatch)
   - API or CLI trigger

#### Workflow Steps

```yaml
1. Checkout Repository
   ↓
2. Set up Python 3.11
   ↓
3. Install Python Dependencies
   ↓
4. Parse Trades
   ↓
5. Generate Books Index
   ↓
6. Generate Notes Index
   ↓
7. Generate Summaries
   ↓
8. Generate Index
   ↓
9. Generate Charts
   ↓
10. Generate Analytics
   ↓
11. Generate Trade Detail Pages
   ↓
12. Generate Week Summaries
   ↓
13. Update Homepage
   ↓
14. Optimize Images
   ↓
15. Commit Changes
   ↓
16. Upload Artifacts
```

**Note:** GitHub Pages automatically builds and deploys from the branch after changes are committed.

#### Step Details

**1. Checkout Repository**
```yaml
- uses: actions/checkout@v4
```
Clones the repository with full history for processing.

**2. Set up Python**
```yaml
- uses: actions/setup-python@v4
  with:
    python-version: '3.11'
```
Installs Python 3.11 for running processing scripts.

**3. Install Dependencies**
```yaml
- name: Install Python dependencies
  run: |
    pip install pyyaml matplotlib
```
Installs required Python packages for data processing and chart generation.

**4. Parse Trades**
```yaml
- name: Parse trades
  run: python .github/scripts/parse_trades.py
```
Extracts trade data from markdown files into JSON index.

**5. Generate Books Index**
```yaml
- name: Generate books index
  run: python .github/scripts/generate_books_index.py
```
Creates searchable index of PDF trading books.

**6. Generate Notes Index**
```yaml
- name: Generate notes index
  run: python .github/scripts/generate_notes_index.py
```
Creates searchable index of markdown trading notes.

**7. Generate Summaries**
```yaml
- name: Generate summaries
  run: python .github/scripts/generate_summaries.py
```
Creates weekly, monthly, and yearly performance summaries.

**8. Generate Index**
```yaml
- name: Generate index
  run: python .github/scripts/generate_index.py
```
Creates master trade index and all-trades.html page.

**9. Generate Charts**
```yaml
- name: Generate charts
  run: python .github/scripts/generate_charts.py
```
Generates equity curves and performance visualizations.

**10. Update Homepage**
```yaml
- name: Update homepage
  run: python .github/scripts/update_homepage.py
```
Ensures homepage has access to latest trade data.

**11. Optimize Images**
```yaml
- name: Optimize images
  run: |
    sudo apt-get update
    sudo apt-get install -y optipng jpegoptim
    bash .github/scripts/optimize_images.sh
```
Installs optimization tools and processes images.

**12. Commit Changes**
```yaml
- name: Commit changes
  run: |
    git config --local user.email "action@github.com"
    git config --local user.name "GitHub Action"
    git add -A
    git diff --quiet && git diff --staged --quiet || git commit -m "Auto: update journal data and charts"
    git push
```
Commits generated files back to repository. GitHub Pages automatically builds and deploys from the branch.

**13. Upload Artifacts**
```yaml
- name: Upload artifacts
  uses: actions/upload-artifact@v4
  with:
    name: trade-data
    path: |
      index.directory/trades-index.json
      index.directory/books-index.json
      index.directory/notes-index.json
      index.directory/assets/charts/
      index.directory/all-trades.html
      index.directory/trades/
      index.directory/analytics.html
```
Uploads generated artifacts for workflow visibility and debugging.

#### Execution Time
- **Total Duration:** ~3-5 minutes
- **Fastest:** 2 minutes (minimal changes)
- **Slowest:** 8 minutes (many images to optimize)

#### Permissions Required

```yaml
permissions:
  contents: write      # For committing generated files
```

GitHub Pages builds automatically from the branch, so no additional permissions are needed.

## Workflow Configuration

### Environment Variables

Currently no custom environment variables required. The workflow uses:
- `GITHUB_TOKEN` - Automatically provided by GitHub Actions
- `GITHUB_WORKSPACE` - Repository working directory

### Secrets

**For trade_pipeline.yml and import.yml**: No custom secrets required. Uses built-in `GITHUB_TOKEN`.

**For site-submit.yml**: Requires a repository secret named `PAT_GITHUB`. This is a Personal Access Token with `repo` scope, needed for the `peter-evans/create-pull-request` action to create PRs that trigger other workflows. See [README-DEV.md](../docs/README-DEV.md#2-required-secrets) for setup instructions.

### Concurrency

```yaml
concurrency:
  group: ${{ github.workflow }}-${{ github.ref }}
  cancel-in-progress: true
```

Prevents multiple workflow runs from interfering with each other.

## Monitoring Workflows

### Viewing Workflow Runs

1. **Navigate to Actions Tab**
   - Go to repository → Actions
   - View all workflow runs

2. **Check Run Status**
   - ✅ Green checkmark - Success
   - ❌ Red X - Failed
   - 🟡 Yellow circle - In progress

3. **View Logs**
   - Click on a workflow run
   - Expand steps to see detailed logs
   - Download logs for offline review

### Common Workflow States

- **Queued** - Waiting for runner availability
- **In Progress** - Currently executing
- **Success** - Completed without errors
- **Failure** - Encountered errors during execution
- **Cancelled** - Manually stopped or cancelled

## Troubleshooting

### Workflow Failures

#### Parse Trades Fails
**Symptom:** Error in parse_trades.py step

**Causes:**
- Invalid YAML in trade markdown
- Missing required fields
- Malformed date/time formats

**Solution:**
```bash
# Run locally to see detailed error
python .github/scripts/parse_trades.py

# Check trade markdown files for errors
# Fix YAML frontmatter
# Ensure all required fields present
```

#### Generate Charts Fails
**Symptom:** Error in generate_charts.py step

**Causes:**
- matplotlib installation issue
- Invalid data in trades-index.json
- Memory constraints

**Solution:**
```bash
# Test locally
pip install matplotlib
python .github/scripts/generate_charts.py

# Check trades-index.json validity
# Reduce chart complexity if needed
```

#### Image Optimization Fails
**Symptom:** Error in optimize_images.sh step

**Causes:**
- optipng/jpegoptim not installed
- Invalid image files
- Permission issues

**Solution:**
```bash
# Install tools locally
sudo apt-get install optipng jpegoptim

# Test script
bash .github/scripts/optimize_images.sh

# Check image file integrity
```

#### GitHub Pages Issues
**Symptom:** Site not updating after workflow completes

**Causes:**
- GitHub Pages not enabled in repository settings
- Incorrect Pages source configuration
- Jekyll build errors

**Solution:**
1. Go to repository Settings → Pages
2. Ensure Pages is enabled
3. Set source to "Deploy from a branch"
4. Select branch: main (or your default branch)
5. Select folder: / (root)
6. Check for Jekyll build errors in the Pages build logs
7. Verify `_config.yml` is correctly configured in `index.directory/`

### Performance Issues

**Slow Workflow Execution:**
- Optimize scripts for speed
- Reduce image sizes before upload
- Consider parallel processing where possible
- Use caching for dependencies

**Resource Limits:**
- GitHub Actions free tier: 2000 minutes/month
- Storage: 500 MB for artifacts
- Single workflow: 6 hours max
- Single job: 6 hours max

## Best Practices

### Workflow Design
- Keep steps atomic and focused
- Use descriptive step names
- Add comments for complex logic
- Handle errors gracefully
- Log progress and results

### Error Handling
- Use `continue-on-error` sparingly
- Validate inputs before processing
- Provide clear error messages
- Log debugging information
- Fail fast on critical errors

### Security
- Never commit secrets or tokens
- Use GitHub secrets for sensitive data
- Limit workflow permissions to minimum required
- Audit workflow runs regularly
- Review workflow changes carefully

### Optimization
- Cache dependencies when possible
- Run independent steps in parallel
- Skip unnecessary steps
- Optimize script performance
- Clean up temporary files

## Adding New Workflows

### Steps to Create a New Workflow

1. **Create workflow file:**
   ```bash
   touch .github/workflows/new-workflow.yml
   ```

2. **Define workflow:**
   ```yaml
   name: New Workflow
   on:
     push:
       paths:
         - 'specific/path/**'
   jobs:
     job-name:
       runs-on: ubuntu-latest
       steps:
         - uses: actions/checkout@v4
         - name: Do something
           run: echo "Hello"
   ```

3. **Test workflow:**
   - Commit and push
   - Monitor in Actions tab
   - Verify expected behavior

4. **Document workflow:**
   - Add to this README
   - Explain purpose and triggers
   - Document any secrets/variables needed

### Workflow Naming Convention

```
{purpose}-{action}.yml
```

Examples:
- `trade_pipeline.yml` - Main trade processing pipeline
- `deploy.yml` - Deployment workflow
- `test.yml` - Test automation
- `backup.yml` - Backup workflow

## Workflow Templates

### Basic Workflow Structure

```yaml
name: Workflow Name
on:
  push:
    paths:
      - 'relevant/path/**'
jobs:
  job-name:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout
        uses: actions/checkout@v4
      
      - name: Setup
        run: |
          # Setup commands
      
      - name: Execute
        run: |
          # Main commands
      
      - name: Cleanup
        if: always()
        run: |
          # Cleanup commands
```

### With Python

```yaml
steps:
  - uses: actions/checkout@v4
  
  - name: Set up Python
    uses: actions/setup-python@v4
    with:
      python-version: '3.11'
  
  - name: Install dependencies
    run: |
      pip install -r requirements.txt
  
  - name: Run script
    run: python script.py
```

### With Artifacts

```yaml
steps:
  - name: Generate files
    run: python generate.py
  
  - name: Upload artifacts
    uses: actions/upload-artifact@v3
    with:
      name: generated-files
      path: output/
```

## Related Documentation

- [Scripts Documentation](../scripts/README.md) - Scripts called by workflows
- [Trade Pipeline](../docs/TRADE_PIPELINE.md) - Pipeline details
- [Developer Guide](../docs/README-DEV.md) - Development setup
- [GitHub Actions Docs](https://docs.github.com/en/actions) - Official documentation

## Workflow Status

Current workflows:
- ✅ `trade_pipeline.yml` - Active and functional

Planned workflows:
- 🔄 `backup.yml` - Automated backups
- 🔄 `test.yml` - Automated testing
- 🔄 `deploy-preview.yml` - Preview deployments

---

**Last Updated:** October 2025  
**Workflow Count:** 1  
**Purpose:** Automated processing and deployment
