# Event Bus Integration Guide

## Overview

The SFTi-Pennies trading journal uses a reactive event system to keep all data synchronized in real-time. This document explains how the event bus works and how to integrate trade workflows.

## Trade Pipeline Integration

### Trade Submission & CSV Import

**The existing trade pipeline workflows are preserved and integrated with the event bus!**

The trade submission and CSV import processes already work through GitHub Actions workflows:

```
User submits trade / uploads CSV
  ↓
GitHub Actions workflow triggered
  ↓
Python scripts process trades:
  - parse_trades.py
  - generate_analytics.py
  - generate_charts.py
  ↓
Updates: trades-index.json, analytics-data.json
  ↓
User navigates/refreshes page
  ↓
StateManager loads updated data
  ↓
EventBus emits: trades:updated, analytics:updated
  ↓
All components refresh automatically ✨
```

**No duplication!** The event bus complements the existing workflow by:
1. ✅ Providing real-time updates for client-side changes (balance, deposits)
2. ✅ Automatically refreshing UI when workflow-processed data loads
3. ✅ Keeping all components synchronized

## Quick Start

```javascript
// Listen for trades being updated (from workflow or page load)
window.SFTiEventBus.on('trades:updated', (data) => {
  console.log('Trades updated:', data);
  refreshMyCharts();
});

// Emit event when user changes balance
window.SFTiEventBus.emit('account:balance-updated', {
  starting_balance: 2000
});
```

## Available Events

### Account Events (Client-Side)
- `account:balance-updated` - Starting balance changed
- `account:deposit-added` - Deposit added
- `account:updated` - Any account data changed

### Trade Events (Workflow + Client)
- `trades:loaded` - Trades initially loaded from JSON
- `trades:updated` - Trades data refreshed (workflow completed)
- `trades:csv-downloaded` - CSV export/import initiated

### Analytics Events (Workflow + Client)
- `analytics:updated` - Analytics recalculated and refreshed

### State Events
- `state:initialized` - App fully initialized
- `state:refreshed` - All data reloaded

## Integration Points

### ✅ Manual Trade Entry (Existing Workflow)
**No changes needed!** The event bus complements the existing flow:

1. User fills form on `add-trade.html`
2. Submits → Creates PR/commit (existing workflow)
3. GitHub Actions processes trade (existing workflow)
4. Next page load → StateManager detects updates
5. EventBus emits `trades:updated`
6. UI refreshes automatically

### ✅ CSV Import (Existing Workflow)
**No changes needed!** The event bus enhances the existing flow:

1. User uploads CSV on `import.html`
2. Frontend validates (existing feature)
3. User commits CSV to `import/` directory (existing workflow)
4. GitHub Actions processes CSV (existing workflow)
5. Next page load → StateManager detects updates
6. EventBus emits `trades:updated`
7. UI refreshes automatically

### ✨ NEW: Real-Time Balance/Deposit Updates
**Brand new feature!** No workflow needed:

1. User clicks balance → edits inline
2. accountManager saves to localStorage
3. EventBus emits `account:balance-updated`
4. Homepage, analytics page update INSTANTLY
5. All percentages recalculate in real-time
6. No page reload! ✨

## Reactive Components

All components listen to events and auto-update:

- **Homepage** (`index.html`)
  - Updates portfolio value instantly
  - Refreshes return percentages
  - Syncs with account changes

- **Analytics Page** (`analytics.html`)
  - Reloads all charts
  - Recalculates percentage metrics
  - Updates on any data change

- **Account Manager**  
  - Emits events on balance/deposit changes
  - Triggers cascading updates everywhere

## Best Practices

### 1. Don't Duplicate Workflows
✅ Use existing GitHub Actions for trade processing
✅ Use EventBus for client-side reactivity

### 2. Emit Events When Data Changes
```javascript
// After updating local data
this.saveConfig();
eventBus.emit('account:updated', this.config);
```

### 3. Listen to Refresh Components
```javascript
eventBus.on('trades:updated', () => {
  this.loadLatestTrades();
});
```

## Mobile-First, GitHub Pages, FREE! 🎯

✅ **Zero duplication** - Works with existing workflows
✅ **Real-time updates** - For client-side changes
✅ **No backend needed** - Pure client-side reactivity
✅ **GitHub Pages ready** - Free hosting
✅ **Production ready** - Professional trading journal

---

**The trade pipeline workflow is preserved and enhanced with real-time reactivity!** 🚀
