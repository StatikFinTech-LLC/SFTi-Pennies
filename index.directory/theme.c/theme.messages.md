---
component: messages
updated: 2026-01-01T18:52:00Z
author: system
version: 1.0
index: "Welcome to Your Trading Journal"
dashboard: "Welcome to Your Trading Journal"
add_trade: "Add New Trade"
add_note: "Add New Note"
add_pdf: "Upload Trade PDF"
all_trades: "All Trades"
all_weeks: "Weekly Performance"
analytics: "Analytics Dashboard"
books: "Trading Books Library"
notes: "Trading Notes"
review: "Trade Review"
import: "Import Trading Data"
customization: "Customize Your Journal"
---

# Theme: Top Page Messages

Customizable welcome/title messages displayed at the top of each page.

## Message Configuration

Each page can have a personalized message (max 100 characters).

| Page | Message | Character Limit |
|------|---------|----------------|
| Home/Dashboard | Welcome to Your Trading Journal | 100 |
| Add Trade | Add New Trade | 100 |
| Add Note | Add New Note | 100 |
| Add PDF | Upload Trade PDF | 100 |
| All Trades | All Trades | 100 |
| Weekly Performance | Weekly Performance | 100 |
| Analytics | Analytics Dashboard | 100 |
| Books | Trading Books Library | 100 |
| Notes | Trading Notes | 100 |
| Review | Trade Review | 100 |
| Import | Import Trading Data | 100 |
| Customization | Customize Your Journal | 100 |

## Usage

Messages are automatically loaded by the theme parser and applied to:
- Static HTML files (via inject_theme_to_static_html.py)
- Python-generated pages (via generate_index.py, generate_trade_pages.py)

## Customization

Users can customize these messages via the customization.html interface:
1. Navigate to Settings > Customize > Top Messages
2. Edit any message (100 char limit)
3. Click "Save" to commit changes
4. Changes auto-trigger theme update workflow

## Examples

**Default Messages:**
- "Welcome to Your Trading Journal"
- "Add New Trade"
- "Analytics Dashboard"

**Custom Messages:**
- "Let's crush it today!"
- "Time to log another winner 🚀"
- "Review and improve your trading"
- "Your journey to consistent profits"

## Technical Notes

- Messages are stored in YAML front matter
- Maximum 100 characters per message
- HTML entities are automatically escaped
- Data attribute: `data-page-message="true"` marks customizable headers
- Falls back to default if message not set
