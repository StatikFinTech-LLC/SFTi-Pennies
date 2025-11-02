# Security Policy

## Supported Versions

We support the current stable version and actively maintained development branches.

| Version | Supported          |
| ------- | ------------------ |
| latest  | ✅                 |
| dev     | ⚠️ Use with caution |
| < 1.0   | ❌                |

## Reporting Vulnerabilities

Security is critical for financial applications. If you discover a security vulnerability in SFTi-Pennies Trading Journal:

### 🚨 For Critical Security Issues
- **DO NOT** create a public issue
- Email directly: **Ascend.Gremlin@gmail.com**
- Use subject line: "[SECURITY] SFTi-Pennies Vulnerability Report"
- Include detailed information about the vulnerability

### 📧 What to Include
- Description of the vulnerability
- Steps to reproduce the issue
- Potential impact assessment
- Suggested fix (if you have one)
- Your contact information for follow-up

### ⏱️ Response Timeline
- **Initial response**: Within 72 hours
- **Vulnerability assessment**: Within 1 week
- **Fix timeline**: Depends on severity (critical issues prioritized)

### 🛡️ Security Considerations

This application handles sensitive trading data and broker integrations:

- **GitHub Personal Access Tokens (PATs)**: Never commit or expose PATs in client-side code
- **Trading Data**: Protect personal trade records, P&L information, and account details
- **Broker CSV Files**: Handle imported trade data securely, never commit sensitive CSV files
- **Local/Browser Storage**: Be careful with sensitive data in browser localStorage
- **API Communications**: Ensure GitHub API calls use proper authentication and HTTPS

### 🔒 Best Practices for Contributors

- Use environment variables or secure configuration for sensitive data
- Validate all user inputs, especially trade data and financial parameters
- Implement proper error handling that doesn't leak sensitive information
- Follow secure coding practices for financial applications
- Keep dependencies updated to avoid known vulnerabilities
- Never commit actual trade data with account numbers or sensitive information
- Sanitize CSV imports before including in documentation or examples

### 📋 Common Security Areas

- GitHub API integration and PAT handling
- Browser localStorage and data persistence
- User authentication via GitHub OAuth (if implemented)
- Trading data processing, storage, and display
- CSV import/export functionality
- Python script execution and file handling
- GitHub Actions workflow security and secrets management

### 🏆 Recognition

We appreciate security researchers who help keep SFTi-Pennies Trading Journal secure:
- Acknowledged contributors will be credited (with permission)
- Significant vulnerabilities may be eligible for recognition
- We believe in responsible disclosure and will work with you on timing

### 📞 Contact Information

For security-related questions or concerns:
- **Primary**: Ascend.Gremlin@gmail.com
- **Alternative**: Open a private security advisory via GitHub

Thank you for helping keep SFTi-Pennies Trading Journal and its users secure.