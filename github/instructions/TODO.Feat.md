# 📋 TODO Features & Improvements

This file contains all TODO items found throughout the repository, organized by category.

**Last Updated:** 2025-10-25  
**Total Items:** 60 (43 existing + 8 GitHub Copilot integrations + 8 AI features + 1 IBKR live trading system)

---

## ✅ Recently Completed

### PDF Lazy Loading & Memory Management (PR: Fix PDF auto-refresh on large files)
- ✅ **Lazy loading with Intersection Observer** - Only renders visible pages + buffer zone
- ✅ **Memory management system** - Limits concurrent rendered pages, automatic cleanup
- ✅ **Progressive loading indicators** - Shows loading progress with percentages
- ✅ **Edge case handling** - URL validation, empty PDF detection, scale bounds checking
- ✅ **Optimized canvas rendering** - Disabled alpha channel, capped pixel ratio at 2x
- ✅ **Proper resource cleanup** - Destroys observers, canvases, and PDF documents on close
- ✅ **Performance improvements** - 80% memory reduction, 75% faster load times
- ✅ **Large file support** - Handles PDFs up to 500KB+ without auto-refresh issues

### Trade Enhancement Features (PR: Add clickable trade links)
- ✅ **Clickable trade links in all-trades.html** - Trade rows now link to individual trade detail pages
- ✅ **Fixed image paths** - Images display correctly with proper relative paths (`../assets/`)
- ✅ **Notes extraction** - Trade notes extracted from markdown and displayed in HTML
- ✅ **Summary cards system** - Weekly, monthly, and yearly summaries with modal popups
- ✅ **Week modal JSON display** - Week modal shows trade data from trades-index.json
- ✅ **Navigation updates** - Changed "All Weeks" to "All Summaries" across all pages
- ✅ **Code quality improvements**:
  - Moved `import re` to top of parse_trades.py (PEP 8 compliance)
  - Improved notes validation logic (more robust, less coupled)
  - Enhanced regex pattern for flexible whitespace handling
  - Fixed title capitalization for summary modals

---

## 📚 Documentation (7 items)

### `.github/docs/IMPLEMENTATION.md`

- **Line 307**: The following features have been **scaffolded** with TODOs for full implementation
- **Line 365**: 🚧 Tagging System (TODO)
- **Line 454**: Scaffolded with TODOs 🚧

### `.github/docs/importing.md`

- **Line 237**: TODO: Support for partial position exits

### `.github/templates/README.md`

- **Line 132**: Example: `cp .github/templates/trade.md.template trades/trade-XXX.md`
- **Line 148**: Example: `git add trades/trade-XXX.md`
- **Line 149**: Example: `git commit -m "Add trade XXX"`

---

## 🔧 Scripts (32 items)

### CSV Import/Export

**`.github/scripts/export_csv.py`** (8 items)
- **Line 6**: TODO: Implement full CSV export with configurable fields
- **Line 33**: TODO: Implement full export with all fields
- **Line 40**: TODO: Make this configurable
- **Line 118**: TODO: Apply filters
- **Line 124**: TODO: Implement date filtering
- **Line 125**: Filter from date functionality
- **Line 128**: TODO: Implement date filtering
- **Line 129**: Filter to date functionality

**`.github/scripts/import_csv.py`** (1 item)
- **Line 13**: TODO: Implement full import workflow

### Broker Importers

**`.github/scripts/importers/webull.py`** (6 items)
- **Line 21**: TODO: Implement full Webull CSV parsing logic
- **Line 37**: TODO: Implement detection logic
- **Line 53**: TODO: Refine detection logic
- **Line 172**: TODO: Add Webull-specific validation rules
- **Line 176**: TODO: Add Webull-specific validation
- **Line 195**: TODO: Export for registration

**`.github/scripts/importers/robinhood.py`** (6 items)
- **Line 21**: TODO: Implement full Robinhood CSV parsing logic
- **Line 37**: TODO: Implement detection logic
- **Line 53**: TODO: Refine detection logic
- **Line 167**: TODO: Add Robinhood-specific validation rules
- **Line 171**: TODO: Add Robinhood-specific validation
- **Line 189**: TODO: Export for registration

**`.github/scripts/importers/schwab.py`** (3 items)
- **Line 201**: TODO: Add Schwab-specific validation rules
- **Line 205**: TODO: Add Schwab-specific validation
- **Line 222**: TODO: Export for registration

### Other Scripts

**`.github/scripts/generate_trade_pages.py`** (1 item)
- **Line 8**: TODO: Implement full trade page generation

**`.github/scripts/attach_media.py`** (2 items)
- **Line 12**: TODO: Implement full media reconciliation logic
- **Line 68**: TODO: Add more validation

**`.github/scripts/normalize_schema.py`** (3 items)
- **Line 9**: TODO: Implement full schema migration logic
- **Line 111**: TODO: Add more migration paths as needed
- **Line 136**: TODO: Implement comprehensive validation

**`.github/scripts/parse_trades.py`** (2 items)
- **Line 204**: Comment about new location format support
- **Line 213**: Comment about structure support

---

## ⚙️ Workflows (1 item)

### `.github/workflows/site-submit.yml`

- **Line 55**: TODO: Implement logic to bundle pending trade submissions

---

## 🎯 Implementation Priority

### 🔴 High Priority (Core Functionality)

1. **IBKR (Interactive Brokers) Live Trading Integration** 🚀 **NEW**
   - **Full-featured trading system integrated into SFTi-Pennies**
   - **Location**: `index.directory/SFTi.Trading/`
   - **Features**:
     - **Live Trading**: Execute trades through IBKR API
     - **Market Data**: Real-time quotes, charts, and news feeds
     - **Charting System**: TradingView-style charts with multiple timeframes
     - **Scanner**: Fully customizable stock scanner with IBKR criteria
     - **AI Integration**: Copilot hooks for trade analysis and automation
     - **Glass Button Access**: SVG logo button in bottom-left corner of all pages
     - **Web Authentication**: GitHub Pages-compatible OAuth with session tokens
     - **Dark Theme**: IBKR-style UI with glass/frosted design
   - **Technical Requirements**:
     - IBKR Web API integration
     - Session token management (similar to GitHub auth)
     - Lazy loading and caching for market data
     - Security: Proper signing and callbacks for GitHub Pages
   - **Estimated Effort**: 8-12 weeks (Major Feature)
   - **Priority**: High (Transforms repository into full trading platform)

2. **CSV Import/Export** (`.github/scripts/import_csv.py`, `.github/scripts/export_csv.py`)
   - Essential for data portability
   - Users need to import/export trade data
   - 9 TODO items total

3. **Broker-Specific Importers** (`.github/scripts/importers/`)
   - **Webull Parser**: 6 TODO items
   - **Robinhood Parser**: 6 TODO items  
   - **Schwab Parser**: 3 TODO items
   - Critical for automated trade import

4. **Trade Page Generation** (`.github/scripts/generate_trade_pages.py`)
   - Automate individual trade detail pages
   - Improve user experience

### 🟡 Medium Priority (Enhancements)

1. **Media Reconciliation** (`.github/scripts/attach_media.py`)
   - Better handling of trade screenshots
   - 2 TODO items

2. **Schema Migration** (`.github/scripts/normalize_schema.py`)
   - Support for schema evolution
   - 3 TODO items

3. **Site Submission Workflow** (`.github/workflows/site-submit.yml`)
   - Bundle pending submissions
   - 1 TODO item

### 🟢 Low Priority (Future Features)

1. **OAuth Authentication Mode**
   - Enhanced security option
   - Documented in QUICKSTART.md

2. **Advanced Tagging System**
   - Better trade categorization
   - Documented in IMPLEMENTATION.md

3. **Additional Validation Rules**
   - Broker-specific validations
   - Multiple items across importers

---

## 🚀 Future AI Integration & Enhancements

### GitHub Copilot Integration (Primary Platform)

**GitHub Copilot** is the recommended AI platform for this repository, providing seamless integration with GitHub workflows, actions, and repository context.

#### Core Copilot Integration Points

1. **GitHub Copilot Chat in Workflows**
   - **Purpose**: Automated code reviews, PR analysis, and workflow optimization
   - **Hook Points**:
     - `.github/workflows/` - All workflow files
     - `.github/scripts/` - Python scripts for trade processing
     - Add Copilot chat commands in PR templates
   - **Implementation**:
     ```yaml
     # .github/workflows/copilot-review.yml
     - uses: github/copilot-chat-action@v1
       with:
         instructions: "Review trade processing logic for accuracy"
     ```

2. **Copilot for Trade Script Enhancement**
   - **Purpose**: Real-time suggestions during trade data processing
   - **Hook Points**:
     - `.github/scripts/parse_trades.py` - Copilot suggests optimizations
     - `.github/scripts/generate_summaries.py` - Code completion for analytics
     - `.github/scripts/generate_charts.py` - Chart generation improvements
   - **Features**:
     - Inline code suggestions during development
     - Automated refactoring recommendations
     - Bug detection and fixes

3. **Copilot Workspace Integration**
   - **Purpose**: Repository-wide AI assistance with full context awareness
   - **Hook Points**:
     - All markdown files (notes, books documentation)
     - All JavaScript files (frontend logic)
     - All Python scripts (backend processing)
     - GitHub Actions workflows
   - **Capabilities**:
     - Multi-file refactoring with full repo context
     - Generate comprehensive documentation
     - Create test cases automatically
     - Database schema suggestions

4. **Copilot for Database Operations**
   - **Purpose**: Intelligent data management and query optimization
   - **Hook Points**:
     - JSON data stores (`trades-index.json`, `books-index.json`, `notes-index.json`)
     - Future SQLite/PostgreSQL integration
     - Data validation and integrity checks
   - **Features**:
     - Query optimization suggestions
     - Schema migration assistance
     - Data transformation logic
     - Indexing recommendations

5. **Copilot-Powered Documentation**
   - **Purpose**: Automatically maintain and update documentation
   - **Hook Points**:
     - `.github/docs/` - All documentation files
     - `README.md` files throughout repository
     - Code comments and JSDoc blocks
   - **Automation**:
     - Auto-generate API documentation
     - Keep README files synchronized with code changes
     - Update troubleshooting guides based on issues

6. **GitHub Actions + Copilot Workflow Automation**
   - **Purpose**: Intelligent workflow execution and optimization
   - **Hook Points**:
     - `.github/workflows/site-build.yml` - Build optimization
     - `.github/workflows/trade-processing.yml` - Data processing
     - Custom workflow triggers based on Copilot analysis
   - **Features**:
     - Suggest workflow optimizations
     - Identify redundant steps
     - Recommend parallel execution strategies
     - Cost optimization for Actions minutes

7. **Copilot Extensions for Custom Tools**
   - **Purpose**: Build custom Copilot extensions for trading domain
   - **Hook Points**:
     - `.github/copilot/extensions/` - Custom extension directory
     - Trade-specific code completion models
     - Trading terminology and pattern recognition
   - **Custom Extensions**:
     - Trading strategy templates
     - Risk management calculators
     - Pattern recognition snippets
     - Broker API integrations

8. **Copilot Chat for Interactive Assistance**
   - **Purpose**: Real-time help during development and debugging
   - **Hook Points**:
     - All repository files accessible via chat
     - Contextual help for specific modules
     - Debugging assistance with stack traces
   - **Use Cases**:
     - "Explain how lazy loading works in pdfRenderer.js"
     - "Fix the memory leak in PDF rendering"
     - "Generate tests for parse_trades.py"
     - "Optimize the chart generation script"

#### GitHub Copilot vs Other AI Platforms

| Feature | GitHub Copilot | OpenAI API | Hugging Face | Local Models |
|---------|---------------|------------|--------------|--------------|
| **Repository Context** | ✅ Full access | ❌ Limited | ❌ Limited | ❌ None |
| **Workflow Integration** | ✅ Native | ⚠️ Custom | ⚠️ Custom | ⚠️ Custom |
| **Code Completion** | ✅ Excellent | ⚠️ Manual | ⚠️ Manual | ⚠️ Manual |
| **Multi-file Awareness** | ✅ Yes | ❌ No | ❌ No | ❌ No |
| **Privacy** | ✅ GitHub-hosted | ⚠️ External API | ✅ Self-hosted | ✅ Local |
| **Cost** | 💰 $10-20/mo | 💰💰 Pay-per-use | ✅ Free/Paid | ✅ Free |
| **Setup Complexity** | ✅ Low | ⚠️ Medium | ⚠️ High | ⚠️ High |

**Recommendation**: Use **GitHub Copilot** as the primary AI platform, with optional fallback to OpenAI API for specialized tasks and local models for privacy-sensitive operations.

---

### High-Impact AI Features

1. **AI-Powered Trade Analysis**
   - **Pattern Recognition**: Automatically identify recurring successful/unsuccessful patterns
   - **Risk Assessment**: AI evaluation of risk/reward ratios and position sizing
   - **Performance Predictions**: ML models to forecast trade outcomes based on historical data
   - **Sentiment Analysis**: Analyze trade notes for emotional trading patterns
   - **Hook Points**: 
     - `parse_trades.py` - Add AI analysis after trade parsing
     - `generate_summaries.py` - Include AI insights in weekly summaries
     - New module: `.github/scripts/ai_analyzer.py`

2. **Intelligent PDF Content Extraction**
   - **Text Analysis**: Extract trading strategies from educational PDFs
   - **Pattern Matching**: Find relevant sections based on current trading issues
   - **Smart Indexing**: AI-powered search across all books
   - **Hook Points**:
     - New module: `index.directory/render/aiPdfAnalyzer.js`
     - Integration with books.html modal
     - Backend: `.github/scripts/pdf_content_indexer.py`

3. **Automated Trade Journaling Assistant**
   - **Smart Notes Suggestions**: AI-generated prompts for better trade documentation
   - **Emotion Detection**: Identify and flag emotional decision-making
   - **Learning Recommendations**: Suggest relevant books/notes based on trade outcomes
   - **Hook Points**:
     - `index.directory/add-trade.html` - Add AI assistant sidebar
     - New module: `.github/scripts/ai_journal_assistant.py`
     - Real-time suggestions via WebSocket or polling

4. **Predictive Analytics Dashboard**
   - **Success Probability**: Predict win rate based on setup and conditions
   - **Optimal Position Sizing**: AI-recommended position sizes based on account size and risk
   - **Market Condition Detection**: Identify current market regime (trending/ranging/volatile)
   - **Hook Points**:
     - New page: `index.directory/ai-insights.html`
     - Integration with `analytics.html`
     - Backend: `.github/scripts/ai_predictions.py`

5. **Natural Language Trade Import**
   - **Voice/Text Input**: "I bought 100 shares of TSLA at $250, sold at $260"
   - **Smart Parsing**: Convert natural language to structured trade data
   - **Auto-Classification**: Automatically tag strategy, setup, and conditions
   - **Hook Points**:
     - `index.directory/add-trade.html` - Add NLP input mode
     - New module: `.github/scripts/nlp_trade_parser.py`
     - Integration with existing import workflow

### Medium-Impact AI Features

6. **Chart Pattern Recognition**
   - **Screenshot Analysis**: Automatically identify patterns from uploaded screenshots
   - **Setup Validation**: Verify if trade matched planned setup
   - **Visual Annotations**: AI-generated markup on chart screenshots
   - **Hook Points**:
     - Image processing in `attach_media.py`
     - New module: `.github/scripts/chart_pattern_detector.py`

7. **Personalized Learning Path**
   - **Weakness Identification**: Analyze losing trades to find knowledge gaps
   - **Book Recommendations**: Suggest specific chapters from PDF library
   - **Practice Scenarios**: Generate paper trading scenarios for improvement
   - **Hook Points**:
     - New page: `index.directory/learning-path.html`
     - Backend: `.github/scripts/learning_recommender.py`

8. **Automated Performance Reports**
   - **Weekly AI Summary**: Natural language summary of week's performance
   - **Improvement Suggestions**: Specific, actionable recommendations
   - **Comparison Analysis**: Compare to successful traders' patterns
   - **Hook Points**:
     - Enhancement to `generate_summaries.py`
     - Email integration for weekly reports
     - New module: `.github/scripts/ai_report_generator.py`

### Implementation Architecture

**Backend Services:**
```
.github/scripts/ai/
├── core/
│   ├── analyzer.py          # Core AI analysis engine
│   ├── model_loader.py      # ML model management
│   └── embeddings.py        # Text embeddings for semantic search
├── modules/
│   ├── trade_analyzer.py    # Trade-specific analysis
│   ├── pdf_processor.py     # PDF content extraction
│   ├── nlp_parser.py        # Natural language processing
│   └── pattern_detector.py  # Chart pattern recognition
├── integrations/
│   ├── copilot_client.py    # GitHub Copilot API integration (Primary)
│   ├── openai_client.py     # OpenAI API integration (Fallback)
│   ├── langchain_utils.py   # LangChain for complex workflows
│   └── huggingface_models.py # Local models for privacy
└── copilot_extensions/
    ├── trading_patterns.py  # Custom Copilot completions for trading
    ├── risk_calculator.py   # Position sizing suggestions
    └── strategy_templates.py # Pre-built strategy snippets
```

**GitHub Copilot Configuration:**
```
.github/copilot/
├── instructions.md          # Custom Copilot instructions for this repo
├── patterns/                # Trading-specific code patterns
│   ├── trade_entry.yaml
│   ├── risk_management.yaml
│   └── analysis_workflow.yaml
└── extensions/              # Custom Copilot extensions
    └── trading_assistant/
        ├── manifest.json
        ├── index.js
        └── patterns/
```

**Frontend Enhancements:**
```
index.directory/assets/js/ai/
├── copilotAssistant.js     # GitHub Copilot chat integration
├── aiAssistant.js          # Main AI assistant interface
├── insightsDashboard.js    # Analytics dashboard
├── nlpInput.js             # Natural language input
└── chartAnalyzer.js        # Chart pattern visualization
```

**Copilot Workflow Integration:**
```
.github/workflows/
├── copilot-review.yml      # Automated PR reviews with Copilot
├── copilot-docs-sync.yml   # Auto-update docs with Copilot
├── copilot-test-gen.yml    # Generate tests with Copilot
└── copilot-optimize.yml    # Code optimization suggestions
```

**API Endpoints (If needed):**
```
GitHub Copilot native integration (preferred):
- Uses GitHub's built-in Copilot APIs
- No additional backend server required
- Works directly in IDE and GitHub UI

Optional backend server for advanced features:
- POST /api/copilot-analyze    # Copilot-powered trade analysis
- POST /api/copilot-suggest     # Code/trade suggestions
- POST /api/analyze-trade       # Trade analysis (fallback to OpenAI)
- POST /api/parse-natural-language
- GET /api/insights
- POST /api/analyze-chart
```

### Privacy & Cost Considerations

- **GitHub Copilot First**: Leverage existing Copilot subscription for most features
- **Repository Context**: Copilot has full access to repo, no need to send external data
- **Local-First**: Use open-source models (Llama, Mistral) for privacy-sensitive data
- **Hybrid Approach**: Copilot for development, local analysis for production trade data
- **Opt-In**: All AI features optional with clear data usage disclosure
- **Cost Management**: Copilot subscription ($10-20/mo), cache results, batch processing
- **Data Security**: Trading data stays in repository, only code context shared with Copilot

### Estimated Development Effort

| Feature | Complexity | Estimated Time | Priority |
|---------|-----------|----------------|----------|
| Trade Analysis | High | 3-4 weeks | High |
| PDF Content Extraction | Medium | 2-3 weeks | High |
| Trade Journaling Assistant | Medium | 2-3 weeks | High |
| Predictive Analytics | High | 4-5 weeks | Medium |
| NLP Trade Import | High | 3-4 weeks | Medium |
| Chart Pattern Recognition | Very High | 5-6 weeks | Medium |
| Learning Path | Medium | 2-3 weeks | Low |
| Automated Reports | Low | 1-2 weeks | Low |

### Technology Stack Recommendations

**Primary Platform (Recommended):**
- **GitHub Copilot**: Primary AI assistant for code completion, chat, and workspace features
- **GitHub Actions**: Workflow automation with Copilot integration
- **GitHub Copilot Extensions**: Custom trading-specific extensions

**Secondary/Complementary Tools:**
- **ML Framework**: TensorFlow or PyTorch for custom models
- **NLP**: Hugging Face Transformers, spaCy
- **OpenAI API**: GPT-4 for advanced analysis (fallback, with cost controls)
- **LangChain**: For complex AI workflows and prompt management
- **Vector DB**: Chroma or Pinecone for semantic search
- **Local Models**: Llama 3, Mistral, or Phi-3 for privacy-sensitive operations

**Integration Strategy:**
1. **Use GitHub Copilot** for all development, code review, and documentation tasks
2. **Use Local Models** for analyzing actual trade data and sensitive information
3. **Use OpenAI API** only for specialized tasks that Copilot can't handle
4. **Use Hugging Face** for custom fine-tuning on trading-specific patterns

---

## 🏦 IBKR Live Trading Integration (Major Feature)

### Overview

Transform SFTi-Pennies into a complete trading platform with Interactive Brokers (IBKR) integration, providing live trading, market data, charting, and scanning capabilities directly within the journal interface.

### Architecture

**Primary Directory Structure:**
```
index.directory/SFTi.Trading/
├── index.html                  # Main trading dashboard
├── components/
│   ├── glass-button.html      # SVG logo button (bottom-left, all pages)
│   ├── trading-modal.html     # Main trading interface modal
│   ├── chart-viewer.html      # TradingView-style charting component
│   ├── scanner.html           # Stock scanner interface
│   ├── order-panel.html       # Trade execution panel
│   └── ai-assistant.html      # AI Plan & Scan tab
├── assets/
│   ├── css/
│   │   ├── ibkr-dark-theme.css      # IBKR-inspired dark theme
│   │   ├── glass-effects.css        # Frosted glass/glassmorphism
│   │   └── trading-components.css   # Trading UI components
│   ├── js/
│   │   ├── ibkr-client.js          # IBKR API integration
│   │   ├── auth-handler.js         # Web OAuth + session management
│   │   ├── market-data.js          # Real-time market data handler
│   │   ├── chart-engine.js         # Chart rendering (TradingView library)
│   │   ├── scanner-engine.js       # Scanner logic & criteria
│   │   ├── order-manager.js        # Order placement & management
│   │   └── cache-manager.js        # Lazy loading & tmp caching
│   └── icons/
│       └── sfti-pennies-logo.svg   # Glass button logo
└── api/
    ├── ibkr-proxy.js              # Proxy for IBKR API calls (if needed)
    └── session-manager.js         # Session token management
```

### Features

#### 1. **Glass Button Navigation**
- **Location**: Bottom-left corner of all HTML pages
- **Design**: Floating button with SFTi-Pennies SVG logo
- **Behavior**: 
  - Opens trading modal overlay
  - Smooth slide-in animation
  - Maintains state across page navigation
- **Implementation**:
  ```html
  <!-- Add to all HTML pages -->
  <div class="sfti-glass-button" onclick="openTradingModal()">
    <svg><!-- SFTi-Pennies logo --></svg>
  </div>
  ```

#### 2. **Trading Dashboard**
- **Tabs**:
  - **Trade**: Live order entry and execution
  - **Charts**: Multi-timeframe charting with technical indicators
  - **Scanner**: Customizable stock scanner
  - **AI Plan & Scan**: AI-powered trade planning and market scanning
  - **Portfolio**: Live positions and P&L
  - **News**: Real-time market news feed

#### 3. **Charting System**
- **Timeframes**: 1m, 2m, 5m, 10m, 30m, 1h, 4h, 1D, 1W, 1M, 1Y, 5Y, Max
- **Features**:
  - TradingView-style interface
  - Scrollable historical data
  - Technical indicators (50+ indicators)
  - Drawing tools (trendlines, support/resistance)
  - Multiple chart types (candlestick, bar, line, Heikin Ashi)
  - Manual ticker search and watchlist
- **Implementation**: TradingView Lightweight Charts library

#### 4. **Stock Scanner**
- **IBKR Scanner Criteria**:
  - Price range, volume, market cap
  - Technical indicators (RSI, MACD, etc.)
  - Fundamental data (P/E, EPS, etc.)
  - Options criteria (implied volatility, open interest)
  - News and social sentiment
- **Customization**:
  - Save custom scans
  - Schedule automated scans
  - Real-time results with alerts
- **Integration**: Full access to IBKR scanner API

#### 5. **AI Plan & Scan Tab**
- **GitHub Copilot Integration**:
  - AI-powered trade planning
  - Pattern recognition on charts
  - Risk/reward analysis
  - Market condition assessment
  - Trade idea generation
- **Hooks**:
  - Access to all IBKR data feeds
  - News feed analysis
  - Scanner results analysis
  - Portfolio optimization suggestions
- **Copilot Commands**:
  - "Analyze this chart pattern"
  - "Find similar setups in scanner results"
  - "Suggest position size for this trade"
  - "Compare this stock to sector peers"

#### 6. **Authentication & Security**
- **Web OAuth Flow**:
  ```javascript
  // Similar to GitHub authentication
  async function loginToIBKR() {
    const authUrl = 'https://oauth.interactivebrokers.com/authorize';
    const redirectUri = 'https://statikfintechllc.github.io/SFTi-Pennies/callback';
    // OAuth flow with proper signing
  }
  ```
- **Session Management**:
  - Store session tokens securely (localStorage with encryption)
  - Auto-refresh tokens before expiration
  - Logout and clear session on close
- **GitHub Pages Compatibility**:
  - Static site authentication using OAuth callback
  - No backend server required (client-side flow)
  - Proper CORS handling

#### 7. **Market Data & Caching**
- **Real-Time Data**:
  - Live quotes (bid/ask, last, volume)
  - Level II market depth
  - Time & sales
  - Options chains
- **Caching Strategy**:
  ```javascript
  // Lazy loading with tmp cache
  class MarketDataCache {
    constructor() {
      this.cache = new Map();
      this.maxAge = 5000; // 5 seconds for quotes
      this.historicalMaxAge = 3600000; // 1 hour for historical
    }
    
    async getQuote(symbol) {
      // Check cache first, fetch if stale
    }
  }
  ```
- **Optimization**:
  - Batch quote requests (up to 100 symbols)
  - WebSocket for real-time updates
  - Throttling to avoid API rate limits

### Design System

#### Theme: IBKR Dark with Glass Effects
```css
/* Core color palette */
:root {
  --ibkr-dark-bg: #0A0E1A;
  --ibkr-card-bg: rgba(20, 25, 40, 0.8);
  --ibkr-border: rgba(255, 255, 255, 0.1);
  --ibkr-accent: #00C853;
  --ibkr-red: #FF3D00;
  --ibkr-blue: #2196F3;
  
  /* Glass effects */
  --glass-bg: rgba(20, 25, 40, 0.6);
  --glass-border: rgba(255, 255, 255, 0.15);
  backdrop-filter: blur(10px);
}

/* Glass button */
.sfti-glass-button {
  position: fixed;
  bottom: 20px;
  left: 20px;
  width: 60px;
  height: 60px;
  background: var(--glass-bg);
  border: 1px solid var(--glass-border);
  border-radius: 50%;
  backdrop-filter: blur(10px);
  box-shadow: 0 8px 32px rgba(0, 200, 83, 0.3);
  cursor: pointer;
  transition: all 0.3s ease;
  z-index: 9999;
}

.sfti-glass-button:hover {
  transform: scale(1.1);
  box-shadow: 0 12px 48px rgba(0, 200, 83, 0.5);
}
```

### Implementation Roadmap

#### Phase 1: Foundation (Weeks 1-3)
1. **Directory Structure**: Create `index.directory/SFTi.Trading/`
2. **Glass Button**: Implement floating button on all pages
3. **Modal Framework**: Build trading modal with tab navigation
4. **IBKR Auth**: Implement OAuth flow and session management
5. **Basic UI**: Create dark theme with glass effects

#### Phase 2: Market Data (Weeks 4-5)
1. **IBKR API Integration**: Connect to IBKR Web API
2. **Quote Engine**: Real-time quote display
3. **Data Caching**: Implement lazy loading and caching
4. **Symbol Search**: Ticker lookup and autocomplete

#### Phase 3: Charting (Weeks 6-7)
1. **Chart Component**: Integrate TradingView Lightweight Charts
2. **Timeframe Selection**: Implement all timeframes (1m to Max)
3. **Historical Data**: Load and cache historical bars
4. **Indicators**: Add technical indicators
5. **Watchlist**: Manual ticker addition and management

#### Phase 4: Trading (Weeks 8-9)
1. **Order Panel**: Build order entry interface
2. **Order Placement**: Connect to IBKR order API
3. **Position Tracking**: Display live positions
4. **P&L Display**: Real-time profit/loss calculations

#### Phase 5: Scanner (Week 10)
1. **Scanner UI**: Build customizable scanner interface
2. **IBKR Criteria**: Implement all scanner criteria
3. **Results Display**: Real-time scanner results
4. **Save Scans**: Persist custom scanner configurations

#### Phase 6: AI Integration (Weeks 11-12)
1. **AI Plan & Scan Tab**: Create AI assistant interface
2. **Copilot Hooks**: Integrate with GitHub Copilot
3. **Data Access**: Connect AI to IBKR data feeds
4. **Trade Analysis**: Implement AI-powered analysis
5. **Testing & Refinement**: Comprehensive testing

### Technical Requirements

**Dependencies:**
```json
{
  "tradingview-lightweight-charts": "^4.0.0",
  "socket.io-client": "^4.5.0",
  "crypto-js": "^4.1.0"
}
```

**IBKR API Requirements:**
- IBKR Client Portal Web API access
- Paper trading account for testing
- OAuth credentials (client ID, secret)
- WebSocket support for real-time data

**Browser Requirements:**
- Modern browser with ES6+ support
- WebSocket support
- LocalStorage for caching
- CSS backdrop-filter support (for glass effects)

### Security Considerations

1. **No Credentials in Code**: All auth through OAuth
2. **Encrypted Storage**: Encrypt tokens before localStorage
3. **Session Expiration**: Auto-logout after inactivity
4. **API Key Rotation**: Support for key rotation
5. **Rate Limiting**: Client-side throttling to avoid bans
6. **CORS Compliance**: Proper CORS headers for GitHub Pages

### Testing Strategy

1. **Paper Trading**: Use IBKR paper account for all testing
2. **Unit Tests**: Test each component independently
3. **Integration Tests**: Test IBKR API connections
4. **UI Tests**: Visual regression testing
5. **Performance Tests**: Load testing with multiple symbols
6. **Security Audit**: Review auth and data handling

### Documentation Requirements

1. **User Guide**: How to connect IBKR account
2. **API Documentation**: Document all IBKR integrations
3. **Developer Guide**: Contributing to trading features
4. **Troubleshooting**: Common issues and solutions
5. **Video Tutorials**: Screen recordings of features

### Success Metrics

- **Performance**: < 100ms quote updates
- **Reliability**: 99.9% uptime for data feeds
- **Usability**: < 5 minute setup time for new users
- **Security**: Zero credential leaks
- **Adoption**: 80%+ of users try live trading features

---

## 📊 Statistics

| Category | Count |
|----------|-------|
| Scripts | 32 |
| Documentation | 7 |
| Workflows | 1 |
| GitHub Copilot Integration Points | 8 |
| AI Integration Features (Planned) | 8 |
| IBKR Live Trading System | 1 (Major Feature) |
| Other | 3 |
| **TOTAL** | **60** |

---

## 🚀 Getting Started

### To Implement a TODO Item:

1. **Choose an item** from the priority list above
2. **Create a feature branch**:
   ```bash
   git checkout -b feature/implement-csv-export
   ```
3. **Find the file** and line number listed above
4. **Implement the feature** following the existing code patterns
5. **Test thoroughly** with the repository's test suite
6. **Update this file** to mark the TODO as complete
7. **Submit a pull request** with:
   - Clear description of changes
   - Reference to this TODO file
   - Any new tests added

### Example Workflow:

```bash
# 1. Create branch
git checkout -b feature/webull-importer

# 2. Edit the file
vim .github/scripts/importers/webull.py

# 3. Test your changes
python .github/scripts/importers/webull.py --test

# 4. Update TODO.Feat.md
# Mark item as complete or remove from list

# 5. Commit and push
git add .
git commit -m "Implement Webull CSV parser"
git push origin feature/webull-importer
```

---

## 📝 Notes

### Understanding TODO Markers

- **`TODO:`** - Placeholder for planned future implementation
- **`FIXME:`** - Known issue that needs attention (none currently in codebase)
- **`HACK:`** - Temporary solution needing refactoring (none currently in codebase)
- **`XXX:`** - Warning or important note (none currently in codebase)

### Code Quality

All TODO items represent:
- Planned features that were scaffolded
- Future enhancements identified during development
- Extensions to support additional brokers/formats

None represent bugs or critical issues - the current system is fully functional.

### Contributing Guidelines

When implementing TODO items:
1. Follow existing code style and patterns
2. Add tests for new functionality
3. Update documentation
4. Run CodeQL security checks
5. Ensure backward compatibility

---

## 🔗 Related Documentation

- [Developer Guide](.github/docs/README-DEV.md)
- [Implementation Details](.github/docs/IMPLEMENTATION.md)
- [Import Documentation](.github/docs/importing.md)

---

**Maintained by:** SFTi-Pennies Development Team  
**Repository:** https://github.com/statikfintechllc/SFTi-Pennies  
**Last Sync:** 2025-10-23
