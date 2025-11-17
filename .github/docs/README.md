# 📚 Documentation Hub

**📁 Location:** `/.github/docs`

## Overview

This directory contains essential documentation for the SFTi-Pennies trading journal system. The documentation covers setup guides, technical architecture, and feature implementation details.

## 📖 Documentation Categories

### 🚀 Getting Started

**For New Users:**
- [**QUICKSTART.md**](./QUICKSTART.md) - Get up and running in 5 minutes
  - Enable GitHub Pages
  - Configure Actions
  - Generate PAT
  - Submit first trade

**For Developers:**
- [**README-DEV.md**](./README-DEV.md) - Complete developer documentation
  - System architecture
  - Setup instructions
  - Authentication options
  - Local development
  - Customization guide
  - Troubleshooting

### 🏗️ Architecture & Design

**System Documentation:**
- [**STRUCTURE.md**](./STRUCTURE.md) - Repository structure overview
  - Directory tree
  - File organization
  - Component relationships
  
- [**TRADE_PIPELINE.md**](./TRADE_PIPELINE.md) - Automated processing pipeline
  - Workflow triggers
  - Processing steps
  - Data transformations
  - Deployment process

**Implementation Details:**
- [**IMPLEMENTATION.md**](./IMPLEMENTATION.md) - System features and capabilities
  - Features built
  - Technical stack
  - Statistics
  - Performance metrics

- [**BOOKS-NOTES-IMPLEMENTATION.md**](./BOOKS-NOTES-IMPLEMENTATION.md) - Books & Notes feature
  - PDF viewer implementation
  - Markdown renderer
  - JSON indices
  - GitHub Actions integration

### 📊 Import & Analytics

**CSV Import System:**
- [**importing.md**](./importing.md) - Complete CSV import guide
  - Supported brokers (IBKR, Schwab, Robinhood, Webull)
  - Export instructions
  - Import methods (Web, CLI, Workflow)
  - Field mapping
  - Troubleshooting

**Analytics Engine:**
- [**ANALYTICS.md**](./ANALYTICS.md) - Analytics system documentation
  - Core metrics (Expectancy, Profit Factor, Kelly Criterion)
  - Win/Loss streaks
  - Maximum drawdown
  - Tag aggregations
  - Visualization system

## 📋 Quick Reference

### Common Tasks

**I want to...**
- **Get started quickly** → [QUICKSTART.md](./QUICKSTART.md)
- **Understand the architecture** → [README-DEV.md](./README-DEV.md) + [STRUCTURE.md](./STRUCTURE.md)
- **Learn about the automation** → [TRADE_PIPELINE.md](./TRADE_PIPELINE.md)
- **Import trades from broker** → [importing.md](./importing.md)
- **Understand analytics metrics** → [ANALYTICS.md](./ANALYTICS.md)
- **Learn about features** → [IMPLEMENTATION.md](./IMPLEMENTATION.md)

### For Different Roles

**End Users:**
1. Start: [QUICKSTART.md](./QUICKSTART.md)
2. Reference: [README-DEV.md](./README-DEV.md) (Usage sections)

**Developers:**
1. Start: [README-DEV.md](./README-DEV.md)
2. Architecture: [STRUCTURE.md](./STRUCTURE.md), [TRADE_PIPELINE.md](./TRADE_PIPELINE.md)
3. Reference: [IMPLEMENTATION.md](./IMPLEMENTATION.md), [BOOKS-NOTES-IMPLEMENTATION.md](./BOOKS-NOTES-IMPLEMENTATION.md)

**Data Import Users:**
1. CSV Import: [importing.md](./importing.md)
2. Analytics: [ANALYTICS.md](./ANALYTICS.md)

## 🗂️ Documentation Structure

```
.github/docs/
├── README.md                              # This file - Documentation index
│
├── 🚀 Getting Started
│   ├── QUICKSTART.md                      # 5-minute setup guide
│   └── README-DEV.md                      # Complete developer guide
│
├── 🏗️ Architecture
│   ├── STRUCTURE.md                       # Repository structure
│   ├── TRADE_PIPELINE.md                  # Automation pipeline
│   ├── IMPLEMENTATION.md                  # System features
│   └── BOOKS-NOTES-IMPLEMENTATION.md      # Books/Notes features
│
└── 📊 Import & Analytics
    ├── importing.md                       # CSV import guide
    └── ANALYTICS.md                       # Analytics documentation
```

## 🎯 Key Features Documented

### Trade Management
- Web form submission
- Manual trade creation
- GitHub API integration
- Image upload and optimization
- Trade data structure (YAML frontmatter)

### Automation Pipeline
- GitHub Actions workflows
- Python processing scripts
- Data parsing and validation
- Summary generation
- Chart creation
- Image optimization
- Site deployment

### Content Systems
- PDF book viewer (PDF.js)
- Markdown note renderer (Marked.js)
- Syntax highlighting (Highlight.js)
- JSON indices generation
- Modal viewers

### Import & Analytics
- CSV import from 4 major brokers (IBKR, Schwab, Robinhood, Webull)
- Broker auto-detection
- Entry/exit transaction matching (FIFO)
- Trade validation and duplicate detection
- Advanced analytics engine (Expectancy, Profit Factor, Kelly Criterion)
- Win/Loss streak tracking
- Maximum drawdown calculation
- Strategy/setup/session aggregations
- Interactive Chart.js visualizations

### UI/UX
- Dark terminal theme
- Mobile-first responsive design
- PWA capabilities
- Chart visualizations
- Form calculations
- Authentication flow

## 📝 Contributing to Documentation

### Documentation Guidelines

**When adding new documentation:**

1. **Choose the right location:**
   - Getting Started → User-facing guides
   - Architecture → Technical/design docs
   - Import & Analytics → Feature-specific docs

2. **Follow naming conventions:**
   - Use UPPERCASE for main docs
   - Use descriptive names
   - Include `.md` extension

3. **Structure your document:**
   ```markdown
   # Title
   
   ## Overview
   Brief description
   
   ## Main Content
   Detailed information with examples
   
   ## Related Documentation
   Links to related docs
   ```

4. **Update this README:**
   - Add to appropriate category
   - Update quick reference
   - Update structure diagram

5. **Cross-reference:**
   - Link to related docs
   - Reference from other docs
   - Update navigation

### Best Practices

**Do's ✅**
- Use clear, concise language
- Provide examples and code snippets
- Include troubleshooting in README-DEV.md
- Add screenshots where helpful
- Keep docs up to date
- Test procedures before documenting
- Link to related documentation

**Don'ts ❌**
- Don't duplicate information (link instead)
- Don't create patch-specific documentation (integrate into main docs)
- Don't forget to update the index (this file)
- Don't include sensitive information
- Don't use outdated screenshots
- Don't make assumptions about user knowledge

## 🔍 Search Tips

### Finding Information

**By Topic:**
- **Setup** → QUICKSTART.md, README-DEV.md
- **Architecture** → STRUCTURE.md, TRADE_PIPELINE.md
- **Features** → IMPLEMENTATION.md, BOOKS-NOTES-IMPLEMENTATION.md
- **Import** → importing.md
- **Analytics** → ANALYTICS.md

**By File Type:**
- **Configuration** → README-DEV.md (setup section)
- **Scripts** → TRADE_PIPELINE.md, [scripts/README.md](../scripts/README.md)
- **Workflows** → TRADE_PIPELINE.md, [workflows/README.md](../workflows/README.md)

## 🔗 Related Documentation

### In Repository
- [Root README](../../README.md) - Project overview
- [Scripts Documentation](../scripts/README.md) - Automation scripts
- [Workflows Documentation](../workflows/README.md) - GitHub Actions
- [Templates Documentation](../templates/README.md) - Content templates

### In Application
- [Assets README](../../index.directory/assets/README.md) - Asset organization

## 📊 Documentation Statistics

- **Total Documents:** 9 (streamlined for clarity)
- **Getting Started:** 2 documents
- **Architecture:** 4 documents
- **Import & Analytics:** 2 documents
- **Index:** 1 document (this file)

## 🔄 Maintenance

### Regular Updates
- Review docs after major changes
- Update screenshots if UI changes
- Verify all links still work
- Keep version info current

### Document Lifecycle
1. **Active** - Current, referenced documentation
2. **Deprecated** - Outdated, needs update or removal

### Version Control
- All docs tracked in git
- Major changes = new commit
- Use descriptive commit messages
- Document breaking changes

---

**Last Updated:** October 2025  
**Document Count:** 9  
**Purpose:** Essential system documentation and guides
