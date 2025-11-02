# Pull Request Template

## Overview
Please provide a brief summary of the changes in this pull request.

- [ ] Bugfix  
- [ ] Feature  
- [ ] Code Refactor  
- [ ] Documentation Update  
- [ ] Broker Integration Enhancement
- [ ] Analytics/Metrics Enhancement
- [ ] UI/UX Improvement
- [ ] Performance Optimization
- [ ] Trading Strategy/Framework Update
- [ ] Automation/Workflow Improvement
- [ ] Other (describe below)

## Description
Explain the motivation and context behind this change. Include relevant issues, design decisions, or links to documentation.

## Related Issues
Closes #[issue-number]  
Depends on #[dependency-issue-number]

## Changes Made
- [ ] Frontend changes (HTML/CSS/Vanilla JavaScript)
- [ ] Python automation scripts
- [ ] GitHub Actions workflows
- [ ] Trading templates (trade.md, weekly-summary.md)
- [ ] Analytics/chart generation
- [ ] CSV import/export functionality
- [ ] Broker integration (IBKR/Schwab/Robinhood/Webull)
- [ ] Documentation updates
- [ ] Configuration changes

## Testing Checklist
- [ ] JavaScript builds successfully (`npm run build`)
- [ ] Python scripts run without errors
- [ ] Local development server works (`python -m http.server 8000`)
- [ ] Application loads at http://localhost:8000/index.directory/
- [ ] GitHub Pages deployment tested (if applicable)
- [ ] Core functionality tested manually in browser
- [ ] Trade submission and processing verified
- [ ] Analytics calculations verified (if applicable)
- [ ] CSV import/export tested (if applicable)
- [ ] Mobile responsive design verified
- [ ] PWA installation tested (if applicable)

## Screenshots / Evidence
> If your changes affect the UI, please provide screenshots or videos demonstrating the changes.

## Broker Integration Impact
- [ ] No broker integration changes
- [ ] Enhanced broker CSV import
- [ ] New broker support added
- [ ] Broker parsing improvements
- [ ] Multi-broker compatibility maintained

## Analytics Impact
- [ ] No analytics changes
- [ ] New metrics added
- [ ] Chart visualization improvements
- [ ] Calculation accuracy improvements
- [ ] Performance metrics updates

## Breaking Changes
- [ ] No breaking changes
- [ ] Breaking changes (describe below)

If breaking changes, describe:
- What breaks
- Migration steps for existing trades/data
- Backwards compatibility considerations
- Schema changes required

## Additional Notes
Any additional information for reviewers:
- Performance considerations
- Security implications (PAT, sensitive data handling)
- Dependencies added/removed
- Configuration changes required
- Impact on existing trades or data
- Trading strategy implications

---

**Reviewer Checklist:**
- [ ] Code follows project standards (PEP 8 for Python, vanilla JS best practices)
- [ ] Changes are well-documented
- [ ] No sensitive data exposed (PATs, account numbers, API keys)
- [ ] Trade data integrity maintained
- [ ] Analytics calculations are mathematically correct
- [ ] UI changes are responsive and accessible
- [ ] Mobile PWA functionality preserved
- [ ] GitHub Actions workflows validated