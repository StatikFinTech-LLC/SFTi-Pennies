# SFTi-Pennies System Architecture

Complete system diagram showing all components, workflows, and data flow.

## 🏗️ High-Level Architecture

```mermaid
graph TB
    subgraph "User Interface Layer - PWA"
        UI[Mobile/Desktop PWA]
        Pages[HTML Pages]
        Assets[CSS/JS/Icons]
    end
    
    subgraph "Client-Side State Management"
        EventBus[Event Bus]
        StateManager[State Manager]
        AccountMgr[Account Manager]
        LocalStorage[localStorage]
    end
    
    subgraph "GitHub Repository"
        Trades[Trade Files .md]
        Config[account-config.json]
        DataFiles[JSON Data Files]
        Assets2[Charts & Media]
    end
    
    subgraph "GitHub Actions CI/CD"
        Pipeline[trade_pipeline.yml]
        Scripts[Python Scripts]
        Optimization[Image Optimization]
    end
    
    subgraph "Generated Output"
        Analytics[analytics-data.json]
        TradesIndex[trades-index.json]
        Charts[PNG Charts]
        HTMLPages[Generated HTML]
    end
    
    UI --> EventBus
    EventBus --> StateManager
    StateManager --> LocalStorage
    StateManager --> AccountMgr
    
    UI -->|commits| Config
    UI -->|commits| Trades
    
    Config -->|triggers| Pipeline
    Trades -->|triggers| Pipeline
    
    Pipeline --> Scripts
    Scripts --> Analytics
    Scripts --> TradesIndex
    Scripts --> Charts
    Scripts --> HTMLPages
    
    Analytics --> UI
    TradesIndex --> UI
    Charts --> UI
```

## 📊 Complete Data Flow

```mermaid
flowchart TD
    Start([User Action])
    
    subgraph "1. User Interactions"
        AddTrade[Add Trade Form]
        EditBalance[Edit Account Balance]
        AddDeposit[Add Deposit]
        ImportCSV[Import CSV]
    end
    
    subgraph "2. Client-Side Processing"
        ValidateLocal[Validate Input]
        SaveLocal[Save to localStorage]
        EmitEvent[Emit Event Bus Event]
        UpdateUI[Update UI Instantly]
    end
    
    subgraph "3. Repository Update"
        CommitAPI[GitHub API Commit]
        CreateFile[Create/Update File]
        PushTrigger[Push Event Triggered]
    end
    
    subgraph "4. GitHub Actions Workflow"
        WorkflowStart[trade_pipeline.yml]
        ParseTrades[parse_trades.py]
        GenAnalytics[generate_analytics.py]
        GenCharts[generate_charts.py]
        Optimize[optimize_images.sh]
        CommitResults[Commit & Push Results]
    end
    
    subgraph "5. Backend Processing"
        LoadConfig[Load account-config.json]
        ProcessTrades[Process Trade Files]
        CalcMetrics[Calculate Analytics]
        DrawCharts[Generate Charts]
        WriteJSON[Write JSON Files]
    end
    
    subgraph "6. Data Synchronization"
        Reload[Page Reload/Refresh]
        FetchData[Fetch Updated JSON]
        StateLoad[StateManager Loads Data]
        EventEmit[Emit trades:updated]
        ComponentRefresh[All Components Refresh]
    end
    
    Start --> AddTrade
    Start --> EditBalance
    Start --> AddDeposit
    Start --> ImportCSV
    
    AddTrade --> ValidateLocal
    EditBalance --> ValidateLocal
    AddDeposit --> ValidateLocal
    ImportCSV --> ValidateLocal
    
    ValidateLocal --> SaveLocal
    SaveLocal --> EmitEvent
    EmitEvent --> UpdateUI
    SaveLocal --> CommitAPI
    
    CommitAPI --> CreateFile
    CreateFile --> PushTrigger
    
    PushTrigger --> WorkflowStart
    WorkflowStart --> ParseTrades
    WorkflowStart --> LoadConfig
    
    ParseTrades --> ProcessTrades
    LoadConfig --> ProcessTrades
    ProcessTrades --> CalcMetrics
    
    CalcMetrics --> GenAnalytics
    GenAnalytics --> WriteJSON
    
    CalcMetrics --> GenCharts
    GenCharts --> DrawCharts
    DrawCharts --> Optimize
    
    WriteJSON --> CommitResults
    Optimize --> CommitResults
    
    CommitResults --> Reload
    Reload --> FetchData
    FetchData --> StateLoad
    StateLoad --> EventEmit
    EventEmit --> ComponentRefresh
    
    ComponentRefresh --> UpdateUI
```

## 🔄 Event Bus Architecture

```mermaid
graph LR
    subgraph "Event Publishers"
        AccountMgr[Account Manager]
        StateMgr[State Manager]
        UserAction[User Actions]
    end
    
    subgraph "Event Bus Core"
        EventBus[Event Bus<br/>Publisher-Subscriber]
        Events[Event Types<br/>- account:*<br/>- trades:*<br/>- analytics:*<br/>- state:*]
    end
    
    subgraph "Event Subscribers"
        HomePage[index.html]
        AnalyticsPage[analytics.html]
        AllTrades[all-trades.html]
        Charts[Chart Components]
    end
    
    AccountMgr -->|emit| EventBus
    StateMgr -->|emit| EventBus
    UserAction -->|emit| EventBus
    
    EventBus --> Events
    
    Events -->|listen| HomePage
    Events -->|listen| AnalyticsPage
    Events -->|listen| AllTrades
    Events -->|listen| Charts
    
    HomePage -->|refreshStats| HomePage
    AnalyticsPage -->|reloadCharts| AnalyticsPage
    AllTrades -->|updateList| AllTrades
    Charts -->|redraw| Charts
```

## 💾 Data Storage & Persistence

```mermaid
graph TD
    subgraph "Client-Side Storage"
        LS[localStorage]
        LSConfig[account-config]
        LSAuth[auth-token]
        LSCache[data-cache]
    end
    
    subgraph "Repository Files"
        RepoConfig[account-config.json]
        TradeFiles[SFTi.Tradez/*.md]
        JSONData[trades-index.json<br/>analytics-data.json]
    end
    
    subgraph "Service Worker Cache"
        SWStatic[Static Assets<br/>HTML/CSS/JS]
        SWData[Data Files<br/>JSON/Images]
        SWOffline[Offline Fallback]
    end
    
    User[User Edits]
    
    User -->|immediate| LS
    LS --> LSConfig
    LS --> LSAuth
    LS --> LSCache
    
    LSConfig -->|GitHub API| RepoConfig
    User -->|commits| TradeFiles
    
    RepoConfig -->|workflow generates| JSONData
    TradeFiles -->|workflow generates| JSONData
    
    JSONData -->|fetched by| SWData
    SWStatic -->|cache-first| User
    SWData -->|network-first| User
```

## 🎯 Trade Processing Pipeline

```mermaid
sequenceDiagram
    participant User
    participant UI as Web Interface
    participant GH as GitHub API
    participant Repo as Repository
    participant Actions as GitHub Actions
    participant Scripts as Python Scripts
    participant Output as Generated Files
    
    User->>UI: Fill Trade Form
    UI->>UI: Validate Input
    UI->>GH: Commit Trade MD via API
    GH->>Repo: Push to SFTi.Tradez/
    
    Repo->>Actions: Trigger workflow (push event)
    Actions->>Scripts: Run parse_trades.py
    Scripts->>Scripts: Parse YAML frontmatter
    Scripts->>Scripts: Calculate P&L
    Scripts->>Scripts: Load account-config.json
    Scripts->>Output: Generate trades-index.json
    
    Actions->>Scripts: Run generate_analytics.py
    Scripts->>Scripts: Calculate returns metrics
    Scripts->>Scripts: Calculate drawdown
    Scripts->>Scripts: Calculate Kelly Criterion
    Scripts->>Output: Generate analytics-data.json
    
    Actions->>Scripts: Run generate_charts.py
    Scripts->>Output: Generate equity-curve.png
    Scripts->>Output: Generate distribution charts
    
    Actions->>Repo: Commit generated files
    Repo-->>UI: Updated data available
    UI->>UI: Fetch updated JSON
    UI->>User: Display updated analytics
```

## 📱 Account Balance Update Flow

```mermaid
sequenceDiagram
    participant User
    participant PWA as Mobile PWA
    participant LS as localStorage
    participant EventBus
    participant UI as All Pages
    participant API as GitHub API
    participant Workflow as trade_pipeline.yml
    participant Analytics as Analytics Scripts
    
    User->>PWA: Click balance → Edit to $140
    PWA->>PWA: Validate input
    
    Note over PWA,LS: Instant Local Update
    PWA->>LS: Save config
    PWA->>EventBus: emit('account:balance-updated')
    EventBus->>UI: notify all subscribers
    UI->>UI: Update displays instantly ✨
    
    Note over PWA,API: Backend Synchronization
    PWA->>API: PUT account-config.json
    API->>API: Commit: "Adjusted account base total"
    API-->>Workflow: Push event triggers workflow
    
    Workflow->>Analytics: generate_analytics.py
    Analytics->>Analytics: Load account-config.json ($140)
    Analytics->>Analytics: Recalculate all metrics
    Analytics->>Analytics: total_return % = pnl / $140
    Analytics->>Analytics: max_drawdown % = dd / $140
    
    Workflow->>Workflow: Commit analytics-data.json
    
    Note over User,Analytics: After 1-5 minutes
    User->>PWA: Refresh or navigate
    PWA->>PWA: Fetch updated analytics
    PWA->>EventBus: emit('analytics:updated')
    EventBus->>UI: Refresh all components
    UI->>User: Show updated percentages
```

## 🔐 Authentication & API Flow

```mermaid
graph TD
    subgraph "User Setup"
        User[User]
        GenToken[Generate GitHub PAT]
        StoreToken[Store in localStorage]
    end
    
    subgraph "GitHubAuth Class"
        Auth[GitHubAuth]
        Check[isAuthenticated]
        Headers[getAuthHeaders]
    end
    
    subgraph "API Operations"
        ReadFile[GET /contents/file]
        WriteFile[PUT /contents/file]
        TriggerWorkflow[POST /actions/workflows/*/dispatches]
    end
    
    subgraph "Fallback"
        NoAuth[No Auth Available]
        ShowWarning[Show Manual Instructions]
    end
    
    User --> GenToken
    GenToken --> StoreToken
    StoreToken --> Auth
    
    Auth --> Check
    Check -->|yes| Headers
    Check -->|no| NoAuth
    
    Headers --> ReadFile
    Headers --> WriteFile
    Headers --> TriggerWorkflow
    
    NoAuth --> ShowWarning
```

## 📊 Analytics Calculation Flow

```mermaid
flowchart TD
    Start([generate_analytics.py])
    
    LoadConfig[Load account-config.json]
    LoadTrades[Load trades-index.json]
    
    Start --> LoadConfig
    Start --> LoadTrades
    
    LoadConfig --> StartBalance[starting_balance = 140]
    LoadConfig --> Deposits[total_deposits = sum]
    
    LoadTrades --> TotalPnL[total_pnl = sum all trades]
    
    subgraph "Portfolio Metrics"
        CalcPortfolio[portfolio = balance + deposits + pnl]
    end
    
    subgraph "Return Metrics"
        TotalReturn[total_return % = pnl / initial_capital × 100]
        AvgReturn[avg_return % = pnl / trades / capital × 100]
    end
    
    subgraph "Risk Metrics"
        MaxDD[max_drawdown = min of cumulative]
        MaxDDPercent[max_dd % = drawdown / capital × 100]
        AvgRisk[avg_risk % = avg loss / capital × 100]
    end
    
    subgraph "Performance Metrics"
        Expectancy[expectancy = avgWin×winRate - avgLoss×lossRate]
        ProfitFactor[profit_factor = gross_profit / gross_loss]
        Kelly[kelly % = winRate - lossRate / avgWin÷avgLoss]
    end
    
    subgraph "Output"
        WriteJSON[Write analytics-data.json]
        GenCharts[Generate charts]
    end
    
    StartBalance --> CalcPortfolio
    Deposits --> CalcPortfolio
    TotalPnL --> CalcPortfolio
    
    TotalPnL --> TotalReturn
    TotalPnL --> AvgReturn
    TotalPnL --> MaxDD
    MaxDD --> MaxDDPercent
    
    LoadTrades --> Expectancy
    LoadTrades --> ProfitFactor
    LoadTrades --> Kelly
    
    CalcPortfolio --> WriteJSON
    TotalReturn --> WriteJSON
    AvgReturn --> WriteJSON
    MaxDD --> WriteJSON
    MaxDDPercent --> WriteJSON
    AvgRisk --> WriteJSON
    Expectancy --> WriteJSON
    ProfitFactor --> WriteJSON
    Kelly --> WriteJSON
    
    WriteJSON --> GenCharts
```

## 🌐 PWA Architecture

```mermaid
graph TB
    subgraph "PWA Components"
        Manifest[manifest.json]
        ServiceWorker[sw.js]
        AppShell[HTML/CSS/JS]
    end
    
    subgraph "Service Worker Strategies"
        CacheFirst[Cache-First<br/>Static Assets]
        NetworkFirst[Network-First<br/>Data Files]
        CacheOnly[Cache-Only<br/>Offline Mode]
    end
    
    subgraph "Offline Capabilities"
        ViewTrades[View Cached Trades]
        EditBalance[Edit Balance Offline]
        ViewAnalytics[View Cached Analytics]
        BrowsePages[Browse All Pages]
    end
    
    subgraph "Installation"
        AddToHome[Add to Home Screen]
        Standalone[Runs as App]
        FullScreen[No Browser UI]
    end
    
    Manifest --> ServiceWorker
    ServiceWorker --> CacheFirst
    ServiceWorker --> NetworkFirst
    ServiceWorker --> CacheOnly
    
    CacheFirst --> AppShell
    NetworkFirst --> ViewTrades
    CacheOnly --> ViewAnalytics
    
    AppShell --> AddToHome
    AddToHome --> Standalone
    Standalone --> FullScreen
    
    ViewTrades --> EditBalance
    EditBalance --> BrowsePages
```

## 🔄 Workflow Trigger Paths

```mermaid
graph LR
    subgraph "Watch Paths"
        TradeFiles[SFTi.Tradez/**]
        AssetFiles[sfti.tradez.assets/**]
        BookFiles[Informational.Bookz/**]
        NoteFiles[SFTi.Notez/**]
        AccountConfig[account-config.json]
        Scripts[.github/scripts/**]
        WorkflowFile[.github/workflows/**]
    end
    
    subgraph "Trigger Type"
        Push[Push Event]
        Dispatch[workflow_dispatch]
    end
    
    subgraph "Workflow"
        Pipeline[trade_pipeline.yml]
    end
    
    TradeFiles -->|push| Push
    AssetFiles -->|push| Push
    BookFiles -->|push| Push
    NoteFiles -->|push| Push
    AccountConfig -->|push| Push
    Scripts -->|push| Push
    WorkflowFile -->|push| Push
    
    Dispatch --> Pipeline
    Push --> Pipeline
```

## 📈 Analytics Dashboard Components

```mermaid
graph TD
    subgraph "Analytics Page Components"
        LoadData[Load analytics-data.json]
        
        subgraph "Account Section"
            StartBalance[Starting Balance]
            TotalDeposits[Total Deposits]
            PortfolioValue[Portfolio Value]
            TotalReturn[Total Return %]
        end
        
        subgraph "Performance Metrics"
            Expectancy[Expectancy $]
            ProfitFactor[Profit Factor]
            WinRate[Win Rate %]
            AvgReturn[Avg Return %]
        end
        
        subgraph "Risk Metrics"
            MaxDD[Max Drawdown $]
            MaxDDPercent[Max Drawdown %]
            AvgRisk[Avg Risk %]
            AvgPosition[Avg Position Size %]
        end
        
        subgraph "Strategy Metrics"
            Kelly[Kelly %]
            WinStreak[Max Win Streak]
            LossStreak[Max Loss Streak]
        end
        
        subgraph "Charts"
            EquityCurve[Equity Curve Chart]
            Distribution[Win/Loss Distribution]
            Drawdown[Drawdown Chart]
        end
    end
    
    LoadData --> StartBalance
    LoadData --> TotalDeposits
    LoadData --> PortfolioValue
    LoadData --> TotalReturn
    
    LoadData --> Expectancy
    LoadData --> ProfitFactor
    LoadData --> WinRate
    LoadData --> AvgReturn
    
    LoadData --> MaxDD
    LoadData --> MaxDDPercent
    LoadData --> AvgRisk
    LoadData --> AvgPosition
    
    LoadData --> Kelly
    LoadData --> WinStreak
    LoadData --> LossStreak
    
    LoadData --> EquityCurve
    LoadData --> Distribution
    LoadData --> Drawdown
```

## 🎯 Complete Feature Map

```mermaid
mindmap
  root((SFTi-Pennies<br/>Trading Journal))
    Core Features
      Trade Management
        Add Manual Trades
        CSV Import
        Trade Templates
        Broker Integration
      Analytics
        Max Drawdown Fixed
        Kelly Criterion
        Expectancy
        Profit Factor
        Win/Loss Streaks
      Account Tracking
        Starting Balance
        Deposits
        Portfolio Value
        Percentage Returns
    Technical Implementation
      Frontend
        PWA with Manifest
        Service Worker
        Offline Support
        Event Bus
        State Manager
      Backend
        GitHub Actions
        Python Scripts
        Automatic Processing
        Chart Generation
      Data Flow
        localStorage
        GitHub API
        JSON Files
        Reactive Updates
    User Experience
      Mobile First
        Responsive Design
        Touch Optimized
        Add to Home
      Real-time Updates
        Instant UI Refresh
        No Page Reload
        Live Calculations
      Automation
        Auto Commit
        Auto Workflow
        Auto Analytics
```

## 🔧 Script Dependencies

```mermaid
graph TD
    subgraph "Core Processing Scripts"
        ParseTrades[parse_trades.py]
        GenAnalytics[generate_analytics.py]
        GenCharts[generate_charts.py]
    end
    
    subgraph "Index Generators"
        GenIndex[generate_index.py]
        GenBooks[generate_books_index.py]
        GenNotes[generate_notes_index.py]
    end
    
    subgraph "Summary Scripts"
        GenSummaries[generate_summaries.py]
        GenWeekSummaries[generate_week_summaries.py]
    end
    
    subgraph "Content Generators"
        GenTradePages[generate_trade_pages.py]
        UpdateHomepage[update_homepage.py]
    end
    
    subgraph "Utilities"
        AttachMedia[attach_media.py]
        NormalizeSchema[normalize_schema.py]
        OptimizeImages[optimize_images.sh]
    end
    
    subgraph "Input Files"
        TradesMD[Trade .md Files]
        AccountCfg[account-config.json]
    end
    
    subgraph "Output Files"
        TradesJSON[trades-index.json]
        AnalyticsJSON[analytics-data.json]
        ChartPNG[Charts .png]
    end
    
    TradesMD --> ParseTrades
    AccountCfg --> ParseTrades
    ParseTrades --> TradesJSON
    
    TradesJSON --> GenAnalytics
    AccountCfg --> GenAnalytics
    GenAnalytics --> AnalyticsJSON
    
    AnalyticsJSON --> GenCharts
    GenCharts --> ChartPNG
    
    ParseTrades --> GenIndex
    ParseTrades --> GenSummaries
    GenSummaries --> GenWeekSummaries
```

---

## 📝 Summary

This system architecture diagram shows:

1. **Complete data flow** from user actions to backend processing to UI updates
2. **Event-driven architecture** with reactive state management
3. **PWA capabilities** with offline support and caching strategies
4. **GitHub Actions integration** for automated processing
5. **Account balance tracking** with automatic synchronization
6. **Analytics pipeline** with corrected calculations (Max Drawdown, Kelly, Expectancy)
7. **Real-time UI updates** without page reloads
8. **Mobile-first design** with GitHub Pages hosting

The system is **production-ready** and designed for **zero-cost deployment** on GitHub Pages with **full offline PWA capabilities** for mobile users.
