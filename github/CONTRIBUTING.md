# Contributing to SFTi-Pennies Trading Journal

First off: thank you for being interested in contributing to the SFTi-Pennies trading journal project!

This is a comprehensive, automated trading journal system built with GitHub Pages, GitHub Actions, and modern web technologies. It provides traders with a complete platform for tracking, analyzing, and improving their trading performance.

## 🔧 Technical Requirements

- **Python 3.11+** for automation scripts
- **Node.js 18+** and npm for JavaScript bundling
- **Git** for version control
- Basic understanding of:
  - HTML/CSS/JavaScript (Vanilla JS, no frameworks)
  - Python scripting and YAML
  - GitHub Actions workflows
  - Trading concepts (helpful but not required)

## 🚀 Getting Started

### Setup
1. Fork and clone the repository
   ```bash
   git clone https://github.com/YOUR_USERNAME/SFTi-Pennies.git
   cd SFTi-Pennies
   ```

2. Install Node.js dependencies:
   ```bash
   npm install
   ```

3. Install Python dependencies:
   ```bash
   pip install pyyaml matplotlib
   ```

4. Build JavaScript bundles:
   ```bash
   npm run build
   ```

5. Test locally with a simple HTTP server:
   ```bash
   python -m http.server 8000
   # Visit http://localhost:8000/index.directory/
   ```

### Development Workflow
- Main HTML pages are in `index.directory/`
- JavaScript source files are in `index.directory/assets/js/`
- Python automation scripts are in `.github/scripts/`
- Documentation is in `.github/docs/`
- The system uses GitHub Actions for automated processing
- Changes to trades trigger the trade_pipeline.yml workflow

## 📝 How to Contribute

### Bug Reports
- Open an issue using the bug report template
- Include relevant error messages and browser console logs
- Specify your environment (OS, browser, Python/Node versions)
- Provide steps to reproduce the issue
- Be clear and concise

### Feature Requests
- Open an issue describing the feature and its benefits
- Explain how it improves the trading journal experience
- Consider backward compatibility and data migration needs
- Provide examples or mockups if applicable

### Code Contributions

1. **Fork the repo**
2. **Create a branch**: `git checkout -b feature/your-feature-name`
3. **Make focused changes** following existing patterns
4. **Test thoroughly**:
   - Test HTML pages in browser (Chrome, Firefox, Safari)
   - Run Python scripts locally to verify they work
   - Check GitHub Actions workflow if you modified automation
5. **Update documentation** if you add features or change behavior
6. **Submit a PR** using the provided template

### Code Style Guide

#### Python
- Follow PEP 8 style guidelines
- Use type hints where appropriate
- Add docstrings to all functions and classes
- Include error handling and logging
- Keep functions focused and single-purpose

#### JavaScript
- Use modern ES6+ syntax
- Follow existing code patterns (no frameworks, vanilla JS)
- Add JSDoc comments for functions and classes
- Use meaningful variable and function names
- Handle errors gracefully with user feedback

#### HTML/CSS
- Maintain semantic HTML5 structure
- Use existing CSS classes and variables
- Follow the dark terminal theme aesthetic
- Ensure mobile-responsive design
- Test on multiple devices and browsers

#### Documentation
- Use clear, concise language
- Include code examples where helpful
- Update README files when adding directories or major features
- Keep documentation in sync with code changes
- Use markdown formatting consistently

### Testing Guidelines

This project doesn't have automated tests, so manual testing is critical:

#### Frontend Testing
- **Test in multiple browsers**: Chrome, Firefox, Safari, Edge
- **Test responsive design**: Mobile, tablet, desktop views
- **Test all form interactions**: Add trade, add note, add PDF, import CSV
- **Verify navigation**: All links work, dropdowns function correctly
- **Check console**: No JavaScript errors or warnings

#### Backend Testing
- **Run Python scripts locally**: Verify they execute without errors
- **Test with sample data**: Use test trades to verify parsing and generation
- **Check generated files**: Verify JSON indices and charts are created correctly
- **Test GitHub Actions**: Trigger workflow manually to verify automation

#### Integration Testing
- **Test the complete flow**: Submit trade → workflow runs → data appears on site
- **Verify image uploads**: Screenshots appear correctly in trades
- **Check analytics**: Stats update correctly with new trades
- **Test import/export**: CSV import and export functions work

## 🏗️ Project Structure

```
SFTi-Pennies/
│
├── index.directory/              # Main application directory
│   ├── *.html                   # Web interface pages
│   ├── assets/                  # Static assets
│   │   ├── css/                # Stylesheets
│   │   ├── js/                 # JavaScript files
│   │   ├── icons/              # PWA icons
│   │   ├── charts/             # Generated performance charts
│   │   ├── sfti.notez.assets/  # Trading framework images
│   │   └── sfti.tradez.assets/ # Trade screenshots
│   ├── SFTi.Tradez/            # Trade journal entries
│   │   └── week.YYYY.WW/       # Weekly trade directories
│   ├── SFTi.Notez/             # Trading strategies and notes
│   ├── Informational.Bookz/     # PDF education library
│   ├── summaries/              # Generated performance summaries
│   ├── trades/                 # Legacy trade entries
│   ├── trades-index.json       # Generated trade data index
│   ├── books-index.json        # Generated books index
│   └── notes-index.json        # Generated notes index
│
├── .github/                     # GitHub configuration
│   ├── scripts/                # Python automation scripts
│   │   ├── parse_trades.py
│   │   ├── generate_*.py
│   │   ├── import_csv.py
│   │   └── importers/          # Broker CSV importers
│   ├── workflows/              # GitHub Actions CI/CD
│   │   └── trade_pipeline.yml
│   ├── docs/                   # Comprehensive documentation
│   │   ├── README-DEV.md
│   │   ├── QUICKSTART.md
│   │   ├── STRUCTURE.md
│   │   └── TRADE_PIPELINE.md
│   └── templates/              # Content templates
│
├── package.json                # Node.js dependencies
├── README.md                   # Main repository documentation
└── manifest.json              # PWA manifest
```

## 🎯 Key Components

### Frontend (HTML/CSS/JS)
- **Trade Submission**: Form-based trade entry with auto-calculations
- **Analytics Dashboard**: Advanced performance metrics and charts
- **Import/Export**: CSV import from brokers, export trades to CSV
- **Review System**: Weekly trade review and summary completion
- **Books Library**: PDF viewer for educational materials
- **Notes System**: Markdown viewer for trading strategies
- **All Trades/Weeks**: Comprehensive trade listing and weekly summaries

### Backend (Python Scripts)
- **parse_trades.py**: Extract trade data from markdown to JSON
- **generate_charts.py**: Create equity curves and performance charts
- **generate_analytics.py**: Calculate advanced metrics (expectancy, Kelly, etc.)
- **generate_summaries.py**: Create weekly/monthly/yearly summaries
- **import_csv.py**: Import trades from broker CSV files
- **generate_week_summaries.py**: Generate weekly master.trade.md files
- **Importers**: Broker-specific CSV parsers (IBKR, Schwab, Robinhood, Webull)

### Automation (GitHub Actions)
- Triggers on: Trade file changes, image uploads, manual dispatch
- Parses trades and generates JSON indices
- Creates charts and analytics
- Optimizes images
- Commits results and deploys to GitHub Pages

## 🐛 Debugging Tips

- **Browser console**: Check for JavaScript errors and network issues
- **Python scripts**: Run locally to test before committing
- **GitHub Actions**: Check workflow logs in the Actions tab
- **File paths**: Ensure paths are correct relative to repository root
- **JSON validation**: Use a JSON validator to check generated indices
- **Image optimization**: Verify optipng and jpegoptim are available in workflow

## 📋 Pull Request Process

1. Use the PR template provided
2. Ensure your code builds: `npm run build` (for JavaScript changes)
3. Test Python scripts locally if you modified them
4. Test manually in browser (all affected pages)
5. Update relevant documentation
6. Link related issues in your PR description
7. Add screenshots for UI changes

## 🎯 Areas Where Help is Needed

- **CSV Import Enhancements**: Additional broker support, better error handling
- **Analytics Features**: New metrics and visualizations
- **Mobile Experience**: Improved responsive design and touch interactions
- **Documentation**: More examples, tutorials, and screenshots
- **Testing**: Help establish testing practices and patterns
- **Performance**: Optimization opportunities
- **Accessibility**: ARIA labels, keyboard navigation, screen reader support

## 📞 Getting Help

- Open an issue for questions or discussions
- Check existing issues and PRs for similar topics
- Review the comprehensive documentation in `.github/docs/`
- Reach out via GitHub Discussions
- Contact maintainers: Ascend.Gremlin@gmail.com

## 🚫 What NOT to Do

- Don't break existing trade data formats or file structures
- Don't remove backward compatibility without discussion
- Don't commit sensitive data (API keys, personal trading data, PATs)
- Don't modify the GitHub Actions workflow without testing
- Don't change core calculations without verification
- Don't submit PRs with merge conflicts - rebase first

## 💡 Best Practices

1. **Start small**: Make focused, single-purpose PRs
2. **Communicate early**: Open an issue before major changes
3. **Test thoroughly**: Manual testing is essential
4. **Document changes**: Update relevant docs and add inline comments
5. **Follow conventions**: Match existing code style and patterns
6. **Ask questions**: Better to ask than make incorrect assumptions

---

**Remember**: This is a real trading journal system. Accuracy, reliability, and data integrity are paramount.

Thank you for contributing to SFTi-Pennies! 🚀📈