# Issue Templates

**📁 Location:** `/.github/ISSUE_TEMPLATE`

## Overview

This directory contains issue templates for the SFTi-Pennies trading journal repository. These templates help contributors and users submit well-structured bug reports, feature requests, and other types of issues.

## Available Templates

### 1. Bug Report (`bug-report.md`)
Use this template when you encounter problems, errors, or unexpected behavior in the trading journal system.

**When to use:**
- Website not loading or displaying incorrectly
- Form submission failures
- GitHub Actions workflow errors
- Data processing issues
- Chart generation problems
- CSV import/export errors
- Authentication failures
- Mobile responsiveness issues

**What to include:**
- Clear description of the bug
- Steps to reproduce
- Expected vs actual behavior
- Screenshots or error messages
- Browser/device information
- Relevant logs from GitHub Actions

### 2. Feature Request (`feature-request.md`)
Use this template to propose new features, enhancements, or improvements to the trading journal.

**When to use:**
- Suggesting new functionality
- Proposing UI/UX improvements
- Requesting new chart types or analytics
- Suggesting automation enhancements
- Proposing workflow improvements

**What to include:**
- Clear description of the proposed feature
- Use case and motivation
- Expected behavior
- Potential implementation approach
- Alternative solutions considered
- Additional context or mockups

### 3. Documentation Issue (`documentation.md`)
Use this template to report missing, unclear, or incorrect documentation.

**When to use:**
- Documentation is missing for a feature
- Instructions are unclear or confusing
- Information is outdated or incorrect
- Broken links or missing examples
- Typos or grammatical errors

**What to include:**
- Location of the documentation issue
- Current state vs desired state
- Who would benefit from the fix
- Suggestions for improvement

### 4. Question or Help (`question.md`)
Use this template to ask questions or request help with the trading journal system.

**When to use:**
- Need clarification on how to use a feature
- Troubleshooting setup or configuration
- Understanding automation scripts
- General questions about workflows

**What to include:**
- Clear question
- What you've already tried
- Context of what you're trying to accomplish
- Environment details if relevant

### 5. Broker Integration Request (`broker-integration.md`)
Use this template to propose or request support for a new broker's CSV import format.

**When to use:**
- Want to import trades from an unsupported broker
- Have broker CSV format documentation
- Can provide sample data for testing

**What to include:**
- Broker name and why it's needed
- CSV format information
- Sample data structure (sanitized)
- Export process from broker
- Willingness to help test/document

### 6. Analytics Feature Request (`analytics-feature.md`)
Use this template specifically for suggesting new analytics, metrics, or visualizations.

**When to use:**
- Proposing new trading metrics
- Suggesting chart types or visualizations
- Requesting statistical calculations
- Analytics dashboard enhancements

**What to include:**
- Metric or visualization description
- Trading value and use case
- Calculation formula if applicable
- Visualization preferences
- Data requirements

## How to Use

### Creating a New Issue

1. **Navigate to Issues Tab**
   - Go to the repository's Issues tab
   - Click "New Issue"

2. **Choose a Template**
   - GitHub will present available templates
   - Select the most appropriate one
   - Click "Get Started"

3. **Fill Out the Template**
   - Complete all required sections (marked with *)
   - Provide as much detail as possible
   - Add labels, assignees if you have permissions

4. **Submit**
   - Review your issue
   - Click "Submit new issue"

### Best Practices

#### For Bug Reports
✅ **DO:**
- Provide step-by-step reproduction instructions
- Include screenshots or error messages
- Specify browser and device information
- Check if the issue already exists
- Test on latest version before reporting

❌ **DON'T:**
- Report multiple unrelated bugs in one issue
- Skip reproduction steps
- Provide vague descriptions
- Include sensitive information (PATs, credentials)

#### For Feature Requests
✅ **DO:**
- Explain the use case and benefits
- Consider implementation complexity
- Suggest alternative solutions
- Link to related issues or discussions
- Be open to feedback and alternatives

❌ **DON'T:**
- Request breaking changes without justification
- Propose features that conflict with project goals
- Expect immediate implementation
- Duplicate existing feature requests

#### For Documentation Issues
✅ **DO:**
- Specify exact location of the issue
- Provide constructive suggestions
- Consider the target audience
- Check if docs have been recently updated

❌ **DON'T:**
- Report multiple unrelated doc issues in one ticket
- Provide vague "needs improvement" feedback
- Expect documentation for every edge case

#### For Broker Integration Requests
✅ **DO:**
- Research broker's CSV export format first
- Provide sample data (sanitized)
- Consider security implications
- Offer to help test or document
- Check if broker is already supported

❌ **DON'T:**
- Share actual trading data with account numbers
- Request proprietary broker API integrations
- Expect support for brokers with no CSV export

## Template Maintenance

### Updating Templates

When modifying templates:
1. Ensure all required fields are clearly marked
2. Provide helpful examples and guidance
3. Keep templates concise but comprehensive
4. Test templates before committing changes
5. Document template changes in commit messages

### Adding New Templates

To add a new issue template:
1. Create a new `.md` file in this directory
2. Follow GitHub's issue template syntax
3. Include clear instructions and sections
4. Update this README with the new template
5. Test the template in GitHub's issue creation flow

## Template Structure

Each template should include:

```yaml
---
name: Template Name
about: Brief description
title: '[PREFIX] '
labels: label1, label2
assignees: ''
---

## Description
Clear instructions...

## Required Information
- Field 1
- Field 2

## Additional Context
Optional information...
```

## Issue Labels

Common labels used with these templates:

- `bug` - Something isn't working
- `enhancement` - New feature or request
- `documentation` - Documentation improvements
- `integration` - Broker or third-party integrations
- `analytics` - Analytics, metrics, or visualization features
- `question` - Further information requested
- `help wanted` - Extra attention needed
- `good first issue` - Good for newcomers

## Support

### Getting Help

If you're unsure which template to use:
1. Check existing issues for similar problems
2. Review [CONTRIBUTING.md](../CONTRIBUTING.md) guidelines
3. Start with the most relevant template
4. For general questions, use the Question template

### Issue Triage

Maintainers will:
1. Review new issues within 48-72 hours
2. Add appropriate labels
3. Request additional information if needed
4. Assign to milestones or projects
5. Close duplicates or invalid issues

## Related Documentation

- [Contributing Guidelines](../CONTRIBUTING.md)
- [Code of Conduct](../CODE_OF_CONDUCT.md)
- [Pull Request Template](../PULL_REQUEST_TEMPLATE.md)
- [Security Policy](../SECURITY.md)

## Examples

### Good Bug Report
```
Title: [BUG] CSV import fails with Schwab files
Description: When importing Schwab CSV files with options trades...
Steps to reproduce: 1. Go to import.html, 2. Select Schwab, 3. Upload CSV...
Expected: Trades imported successfully
Actual: Error: "Invalid column format"
Screenshots: [attached]
Environment: Chrome 120, Windows 11, Python 3.11
```

### Good Feature Request
```
Title: [FEATURE] Add Sharpe ratio to analytics
Description: Add Sharpe ratio metric to measure risk-adjusted returns...
Use case: Better understand performance relative to risk taken...
Benefits: Industry-standard metric for portfolio evaluation...
Implementation: Calculate using daily returns and standard deviation...
Alternatives: Consider Sortino ratio which focuses on downside risk...
```

### Good Documentation Issue
```
Title: [DOCS] CSV import instructions unclear for Robinhood
Description: QUICKSTART.md mentions Robinhood CSV import but doesn't explain...
Location: QUICKSTART.md, line 45
Current: "Export from Robinhood"
Desired: Step-by-step instructions with screenshots showing where to find export...
Affected: New users trying to import Robinhood trades
```

### Good Broker Integration Request
```
Title: [BROKER] Add support for E*TRADE CSV import
Description: E*TRADE provides CSV exports in their "Transactions" section...
Sample CSV headers: Date,Symbol,Action,Quantity,Price,Commission,Total
Export process: Account → Transactions → Download → CSV
Complexity: Simple, similar to existing brokers
Willingness: Can provide test data and help with testing
```

---

**Last Updated:** November 2025  
**Template Count:** 6  
**Purpose:** Standardized issue reporting for SFTi-Pennies Trading Journal
