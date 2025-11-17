---
name: Broker Integration Request
about: Propose or request support for a new broker CSV import
title: "[BROKER] "
labels: enhancement, integration
assignees: statikfintechllc

---

## 🏦 Broker Integration Request

### Broker Name
Which broker would you like to see supported?

### Currently Supported
SFTi-Pennies currently supports CSV imports from:
- Interactive Brokers (IBKR)
- Charles Schwab / TD Ameritrade
- Robinhood
- Webull

### Use Case
Why is this broker important for you or the community?

### CSV Format Information
If you have access to this broker's CSV export:
- [ ] I can provide a sample CSV (with sensitive data removed)
- [ ] I know the CSV column headers and format
- [ ] I have documentation links for the broker's export format

### Sample Data Structure
Describe or paste the CSV headers and a sample row (remove all personal/sensitive data):
```csv
Date,Ticker,Type,Quantity,Price,Total
```

### Export Process
How do users export trade data from this broker?
1. Step 1
2. Step 2
3. Step 3

### API Availability
Does this broker offer an API for automated data retrieval?
- [ ] Yes, public API available
- [ ] Yes, but requires approval
- [ ] No API available
- [ ] Unknown

### Complexity Estimate
- [ ] Simple (similar to existing brokers)
- [ ] Moderate (some unique fields or formatting)
- [ ] Complex (very different structure or multiple files)
- [ ] Unknown

### Additional Context
Add any other context, documentation links, or screenshots about this broker integration request.

### Willingness to Help
- [ ] I can provide sample CSV files for testing
- [ ] I can help test the integration
- [ ] I can help with documentation
- [ ] I'd like to contribute code (see CONTRIBUTING.md)
