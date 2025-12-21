# Component Mapping Documentation

This document provides a comprehensive mapping of all customizable UI components across the SFTi-Pennies Trade Journal application. Each component is tagged with data attributes to enable future customization features.

## Data Attribute Convention

All customizable components use the following data attributes:

| Attribute | Description | Example Values |
|-----------|-------------|----------------|
| `data-page` | Identifies the page (on `<body>` element) | `home`, `add-trade`, `analytics`, etc. |
| `data-component-type` | The type/category of component | `background`, `header`, `section`, `main-content`, `card`, `card-grid`, `form`, `form-field`, `form-row`, `button`, `button-group`, `modal`, `modal-content`, `chart`, `chart-container`, `icon` |
| `data-component-id` | Unique identifier for the component | `page-title`, `hero-section`, `btn-submit` |
| `data-customizable` | Marks the component as customizable | `true` |

## Component Types

### 1. Background (`background`)
Animated canvas backgrounds used throughout the application.

| Page | Component ID | Description |
|------|--------------|-------------|
| All pages | `particle-canvas` | Animated particle background effect |

### 2. Headers (`header`)
Page titles, section headers, and modal headers.

| Page | Component ID | Description |
|------|--------------|-------------|
| index.html | `hero-title` | Main hero section title |
| index.html | `performance-header` | Performance section header |
| index.html | `modal-portfolio-header` | Portfolio modal header |
| index.html | `modal-total-return-header` | Total return modal header |
| index.html | `modal-withdrawal-header` | Withdrawal modal header |
| index.html | `modal-deposit-header` | Deposit modal header |
| index.html | `modal-trade-pnl-header` | Trade P&L modal header |
| index.html | `modal-avg-pnl-header` | Average P&L modal header |
| add-trade.html | `page-title` | Page title |
| add-trade.html | `header-trade-id` | Trade identification section header |
| add-trade.html | `header-entry` | Entry details section header |
| add-trade.html | `header-exit` | Exit details section header |
| add-trade.html | `header-position` | Position details section header |
| add-trade.html | `header-risk` | Risk management section header |
| add-trade.html | `header-tags` | Tags section header |
| add-trade.html | `header-auto-calc` | Auto-calculated results header |
| add-trade.html | `header-screenshots` | Screenshots section header |
| add-trade.html | `header-notes` | Notes section header |
| add-note.html | `page-title` | Page title |
| add-note.html | `instructions-header` | Instructions section header |
| add-pdf.html | `page-title` | Page title |
| add-pdf.html | `instructions-header` | Instructions section header |
| all-weeks.html | `page-title` | Page title |
| all-weeks.html | `summaries-header` | Summaries section header |
| all-weeks.html | `weeks-header` | Weeks section header |
| analytics.html | `page-title` | Page title |
| analytics.html | `performance-header` | Performance metrics header |
| analytics.html | `advanced-risk-header` | Advanced risk metrics header |
| analytics.html | `strategy-table-header` | Strategy table header |
| books.html | `page-title` | Page title |
| notes.html | `page-title` | Page title |
| review.html | `page-title` | Page title |
| import.html | `page-title` | Page title |

### 3. Cards (`card`)
Information containers, stat cards, and content panels.

| Page | Component ID | Description |
|------|--------------|-------------|
| index.html | `stat-card-portfolio` | Portfolio value stat card |
| index.html | `stat-card-return` | Total return stat card |
| index.html | `stat-card-trades` | Total trades stat card |
| index.html | `stat-card-winrate` | Win rate stat card |
| index.html | `stat-card-pnl` | Trade P&L stat card |
| index.html | `stat-card-avg-pnl` | Average P&L stat card |
| index.html | `stat-best-month` | Best month stat card |
| index.html | `stat-worst-month` | Worst month stat card |
| index.html | `stat-avg-monthly` | Average monthly stat card |
| index.html | `stat-positive-months` | Positive months stat card |
| index.html | `card-avg-win` | Average win card |
| index.html | `card-avg-loss` | Average loss card |
| index.html | `card-win-loss-ratio` | Win/loss ratio card |
| add-trade.html | `card-trade-identification` | Trade identification card |
| add-trade.html | `card-entry-details` | Entry details card |
| add-trade.html | `card-exit-details` | Exit details card |
| add-trade.html | `card-position-details` | Position details card |
| add-trade.html | `card-risk-management` | Risk management card |
| add-trade.html | `card-tags` | Tags card |
| add-trade.html | `card-auto-calculated` | Auto-calculated results card |
| add-trade.html | `card-screenshots` | Screenshots card |
| add-trade.html | `card-notes` | Notes card |
| add-note.html | `mode-selector-card` | Mode selector card |
| add-note.html | `instructions-card` | Instructions card |
| add-pdf.html | `instructions-card` | Instructions card |
| analytics.html | `search-nav-card` | Search navigation card |
| analytics.html | `performance-card` | Performance summary card |
| analytics.html | `advanced-risk-card` | Advanced risk metrics card |
| analytics.html | `strategy-table-card` | Strategy breakdown card |
| books.html | `books-grid` | Books grid container |
| notes.html | `notes-grid` | Notes grid container |
| review.html | `week-selector-card` | Week selector card |
| review.html | `summary-section` | Summary section card |
| import.html | `upload-card` | CSV upload card |
| import.html | `broker-card` | Broker selection card |
| import.html | `preview-card` | Preview card |
| import.html | `actions-card` | Actions card |
| import.html | `status-card` | Implementation status card |

### 4. Card Grids (`card-grid`)
Grid layouts for displaying multiple cards.

| Page | Component ID | Description |
|------|--------------|-------------|
| index.html | `stats-grid` | Hero stats grid |
| index.html | `trades-grid` | Recent trades grid |
| index.html | `heatmap-stats-grid` | Heatmap stats grid |
| index.html | `avg-pnl-comparison-grid` | Average P&L comparison grid |
| add-trade.html | `auto-calc-grid` | Auto-calculated results grid |
| analytics.html | `performance-grid` | Performance metrics grid |
| analytics.html | `advanced-risk-grid` | Advanced risk metrics grid |
| all-weeks.html | `weeks-grid` | Trading weeks grid |
| review.html | `stats-grid` | Week stats grid |

### 5. Charts (`chart`)
Chart containers and visualizations.

| Page | Component ID | Description |
|------|--------------|-------------|
| index.html | `charts-wrapper` | Main charts container |
| index.html | `chart-equity-curve` | Equity curve chart |
| index.html | `chart-win-loss-ratio` | Win/loss ratio chart |
| index.html | `chart-performance-day` | Performance by day chart |
| index.html | `chart-ticker-performance` | Ticker performance chart |
| index.html | `chart-time-of-day` | Time of day chart |
| index.html | `chart-strategy` | Strategy performance chart |
| index.html | `chart-setup` | Setup performance chart |
| index.html | `chart-winrate` | Win rate chart |
| index.html | `chart-drawdown` | Drawdown chart |
| index.html | `chart-return-initial` | Return from initial chart |
| index.html | `chart-r-multiple` | R-Multiple distribution chart |
| index.html | `modal-portfolio-chart` | Portfolio modal chart |
| index.html | `modal-return-chart` | Return modal chart |
| index.html | `chart-monthly-heatmap` | Monthly returns heatmap |
| analytics.html | `chart-win-loss-ratio` | Win/Loss ratio by strategy chart |
| analytics.html | `chart-r-multiple` | R-Multiple distribution chart |
| analytics.html | `chart-strategy` | Performance by strategy chart |
| analytics.html | `chart-setup` | Performance by setup chart |
| analytics.html | `chart-win-rate` | Win rate analysis chart |
| analytics.html | `chart-drawdown` | Drawdown chart (classic $) |
| analytics.html | `chart-drawdown-percent` | Max drawdown (% from peak) chart |
| analytics.html | `chart-return-initial` | Return from initial capital chart |
| analytics.html | `chart-performance-day` | Performance by day of week chart |
| analytics.html | `chart-ticker` | Ticker performance chart |
| analytics.html | `chart-time-of-day` | Time of day performance chart |
| analytics.html | `chart-equity-curve` | Equity curve chart |
| analytics.html | `chart-portfolio-day` | Portfolio value - day chart |
| analytics.html | `chart-portfolio-week` | Portfolio value - week chart |

### 6. Modals (`modal`)
Popup dialogs and overlay windows.

| Page | Component ID | Description |
|------|--------------|-------------|
| index.html | `modal-portfolio` | Portfolio value modal |
| index.html | `modal-total-return` | Total return modal |
| index.html | `modal-withdrawal` | Withdrawal form modal |
| index.html | `modal-deposit` | Deposit form modal |
| index.html | `modal-trade-pnl` | Trade P&L heatmap modal |
| index.html | `modal-avg-pnl` | Average P&L modal |
| all-weeks.html | `modal-week-detail` | Week detail modal |
| all-weeks.html | `modal-summary-detail` | Summary detail modal |
| books.html | `modal-pdf-viewer` | PDF viewer modal |
| notes.html | `modal-note-viewer` | Note viewer modal |
| review.html | `screenshots-modal` | Screenshots modal |

### 7. Forms (`form`)
Form containers and form field groups.

| Page | Component ID | Description |
|------|--------------|-------------|
| index.html | `chart-selector-desktop` | Desktop chart selector |
| index.html | `chart-selector-mobile` | Mobile chart selector |
| index.html | `form-withdrawal` | Withdrawal form |
| index.html | `form-deposit` | Deposit form |
| index.html | `modal-portfolio-controls` | Portfolio controls form |
| index.html | `modal-return-controls` | Return controls form |
| add-trade.html | `trade-form` | Main trade form |
| add-note.html | `note-write-form` | Note write form |
| add-note.html | `note-upload-form` | Note upload form |
| add-pdf.html | `pdf-upload-form` | PDF upload form |
| analytics.html | `search-form` | Analytics search form |
| all-weeks.html | `summary-dropdowns` | Summary dropdown selectors |
| review.html | `review-form` | Review reflection form |

### 8. Buttons (`button`)
Interactive buttons throughout the application.

| Page | Component ID | Description |
|------|--------------|-------------|
| index.html | `chart-selector-button` | Chart type selector button |
| index.html | `btn-timeframe-*` | Timeframe selection buttons |
| index.html | `btn-edit-balance` | Edit balance button |
| index.html | `btn-add-withdrawal` | Add withdrawal button |
| index.html | `btn-add-deposit` | Add deposit button |
| index.html | `btn-*-cancel` | Cancel buttons |
| index.html | `btn-*-submit` | Submit buttons |
| index.html | `modal-*-close` | Modal close buttons |
| add-trade.html | `btn-cancel` | Cancel button |
| add-trade.html | `btn-submit` | Submit trade button |
| add-note.html | `btn-write-mode` | Write mode button |
| add-note.html | `btn-upload-mode` | Upload mode button |
| add-note.html | `btn-preview` | Preview button |
| add-note.html | `btn-edit` | Edit button |
| add-note.html | `btn-save-note` | Save note button |
| add-pdf.html | `btn-cancel` | Cancel button |
| add-pdf.html | `btn-upload-pdf` | Upload PDF button |
| analytics.html | `btn-search` | Search button |
| analytics.html | `btn-quick-nav` | Quick navigation button |
| analytics.html | `btn-recent-searches` | Recent searches button |
| all-weeks.html | `btn-close-week-modal` | Close week modal button |
| all-weeks.html | `btn-close-summary-modal` | Close summary modal button |
| books.html | `btn-close-pdf` | Close PDF button |
| notes.html | `btn-close-note` | Close note button |
| review.html | `btn-close-screenshots` | Close screenshots button |
| review.html | `btn-continue` | Continue button |
| review.html | `btn-save-summary` | Save summary button |
| import.html | `btn-export-csv` | Export CSV button |
| import.html | `btn-clear-csv` | Clear CSV button |
| import.html | `btn-validate` | Validate trades button |
| import.html | `btn-import` | Import trades button |
| import.html | `btn-download-mapping` | Download mapping button |

### 9. Button Groups (`button-group`)
Groups of related buttons.

| Page | Component ID | Description |
|------|--------------|-------------|
| index.html | `portfolio-timeframe-buttons` | Portfolio timeframe buttons |
| index.html | `return-timeframe-buttons` | Return timeframe buttons |
| index.html | `withdrawal-form-buttons` | Withdrawal form buttons |
| index.html | `deposit-form-buttons` | Deposit form buttons |
| add-trade.html | `form-buttons` | Form action buttons |
| add-note.html | `mode-buttons` | Mode selection buttons |
| add-note.html | `preview-buttons` | Preview action buttons |
| add-note.html | `write-form-buttons` | Write form buttons |
| add-note.html | `upload-form-buttons` | Upload form buttons |
| add-pdf.html | `form-buttons` | Form action buttons |
| analytics.html | `nav-buttons` | Navigation buttons |
| review.html | `modal-actions` | Modal action buttons |
| review.html | `form-buttons` | Form action buttons |
| import.html | `action-buttons` | Import action buttons |

### 10. Icons (`icon`)
SVG icons used throughout the application.

| Page | Component ID | Description |
|------|--------------|-------------|
| index.html | `hero-icon` | Hero section icon |
| index.html | `chart-selector-arrow` | Chart selector arrow icon |
| index.html | `modal-*-icon` | Modal header icons |
| index.html | `modal-*-close-icon` | Modal close icons |
| index.html | `icon-*` | Various interface icons |
| add-trade.html | `icon-tags` | Tags section icon |
| add-trade.html | `icon-auto-calc` | Auto-calc section icon |
| add-trade.html | `icon-screenshots` | Screenshots section icon |
| add-trade.html | `icon-notes` | Notes section icon |
| add-note.html | `page-icon` | Page title icon |
| add-note.html | `icon-save` | Save button icon |
| add-note.html | `icon-info` | Info section icon |
| add-pdf.html | `page-icon` | Page title icon |
| add-pdf.html | `icon-upload` | Upload button icon |
| add-pdf.html | `icon-info` | Info section icon |
| all-weeks.html | `page-icon` | Page title icon |
| all-weeks.html | `summaries-icon` | Summaries section icon |
| all-weeks.html | `weeks-icon` | Weeks section icon |
| analytics.html | `icon-search` | Search icon |
| analytics.html | `icon-nav` | Navigation icon |
| analytics.html | `icon-recent` | Recent searches icon |
| books.html | `page-icon` | Page title icon |
| notes.html | `page-icon` | Page title icon |
| review.html | `page-icon` | Page title icon |
| review.html | `icon-continue` | Continue button icon |
| review.html | `icon-save` | Save button icon |
| import.html | `icon-upload` | Upload section icon |
| import.html | `icon-broker` | Broker section icon |
| import.html | `icon-preview` | Preview section icon |
| import.html | `icon-document` | Document placeholder icon |
| import.html | `icon-status` | Status section icon |

### 11. Sections (`section`)
Major page sections.

| Page | Component ID | Description |
|------|--------------|-------------|
| index.html | `hero-section` | Hero section with stats |
| index.html | `recent-trades-section` | Recent trades section |
| index.html | `performance-section` | Performance charts section |
| add-trade.html | `add-trade-section` | Add trade section |
| add-note.html | `add-note-section` | Add note section |
| add-pdf.html | `add-pdf-section` | Add PDF section |
| all-weeks.html | `all-weeks-section` | All weeks section |
| all-weeks.html | `summaries-section` | Summaries section |
| analytics.html | `analytics-section` | Analytics section |
| books.html | `hero-section` | Hero section |
| books.html | `books-section` | Books grid section |
| notes.html | `hero-section` | Hero section |
| notes.html | `notes-section` | Notes grid section |
| review.html | `review-section` | Review section |
| import.html | `import-section` | Import section |

### 12. Main Content (`main-content`)
Main content containers.

| Page | Component ID | Description |
|------|--------------|-------------|
| All pages | `main-container` | Main content container |

## Usage Example

To select all customizable buttons:
```javascript
document.querySelectorAll('[data-component-type="button"][data-customizable="true"]');
```

To select a specific component:
```javascript
document.querySelector('[data-component-id="hero-title"]');
```

To select all components on the home page:
```javascript
document.querySelectorAll('[data-page="home"] [data-customizable="true"]');
```

## Files Modified

The following HTML files contain data attributes for customization:

1. `index.html` - Main dashboard page
2. `index.directory/add-trade.html` - Add new trade form
3. `index.directory/add-note.html` - Add new note form
4. `index.directory/add-pdf.html` - Add new PDF book form
5. `index.directory/all-weeks.html` - All trading weeks view
6. `index.directory/analytics.html` - Advanced analytics page
7. `index.directory/books.html` - Trading books library
8. `index.directory/notes.html` - Trading notes library
9. `index.directory/review.html` - Weekly trade review
10. `index.directory/import.html` - CSV import page

## Additional Component Types

The following component types are used in the HTML with `data-customizable="true"` and are therefore part of the customizable component surface:

### `form-field`

Represents an individual labeled input or control inside a form (for example, a single text input, select, textarea, toggle, or date picker).

**Usage examples:**

- `index.directory/add-trade.html` – trade detail inputs (ticker, entry/exit, notes, etc.)
- `index.directory/add-note.html` – note title and body fields
- `index.directory/add-pdf.html` – book metadata fields
- `index.directory/import.html` – CSV import configuration fields
- `index.directory/analytics.html` – filter and parameter controls
- `index.html` – dashboard filters and quick‑entry fields

Components of this type should be tagged with `data-component-type="form-field"` along with a unique `data-component-id` for each field.

### `form-row`

Represents a horizontal group or row of related `form-field` components, typically used to align multiple fields on the same line within a form.

**Usage examples:**

- `index.directory/add-trade.html` – grouped inputs that are displayed in a single row (for example, side‑by‑side price or date fields).

Components of this type should be tagged with `data-component-type="form-row"` in addition to any nested `form-field` components.

### `chart-container`

Represents a high‑level container for one or more chart visualizations on the dashboard or analytics pages. The container may include the chart canvas itself, its title, and any surrounding UI specific to that chart section.

**Usage examples:**

- `index.html` – main dashboard charts (e.g., performance over time, win/loss breakdown).

Components of this type should be tagged with `data-component-type="chart-container"` and a unique `data-component-id` per chart section.

## Structural Containers (Non-customizable)

Some elements are used purely as structural or layout containers and are not intended to be directly customizable. These elements are **not** marked with `data-customizable="true"` in the HTML and are therefore intentionally omitted from the customizable component mapping above.

Examples of structural containers include:

- `modal-content` – inner wrapper providing the layout for modal dialogs.
- `main-content` – primary page layout container that holds the main content area.

Since these containers do not have `data-customizable="true"`, they are out of scope for per‑component customization but may still contain nested components that are customizable.
**Note:** `index.directory/all-trades.html` is excluded as specified in the issue (edits go in Python files for another issue).
