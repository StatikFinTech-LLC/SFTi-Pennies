# Analytics System Documentation

Complete guide for the analytics calculation engine and visualization system in SFTi-Pennies.

## Overview

The analytics system computes advanced trading metrics and generates visualizations from your trade data. It provides insights into:

- Overall trading performance
- Strategy effectiveness
- Risk management metrics
- Drawdown analysis
- Position sizing recommendations

## Architecture

### Components

```
Trade Data (trades-index.json)
        ↓
generate_analytics.py
        ↓
analytics-data.json
        ↓
analytics.js (frontend)
        ↓
Charts & Visualizations
```

### Data Flow

1. **Trade Parsing**: `parse_trades.py` creates `trades-index.json`
2. **Analytics Generation**: `generate_analytics.py` computes metrics
3. **Output**: Saves to `analytics-data.json`
4. **Frontend Loading**: `analytics.js` fetches and displays data
5. **Visualization**: Chart.js renders interactive charts

## Core Metrics

### 1. Expectancy

**Definition:** Average profit/loss per trade

**Formula:**
```
Expectancy = (Win% × Avg Win) - (Loss% × Avg Loss)
```

**Calculation:**
```python
def calculate_expectancy(trades: List[Dict]) -> float:
    if not trades:
        return 0.0
    
    winners = [t for t in trades if t.get('pnl_usd', 0) > 0]
    losers = [t for t in trades if t.get('pnl_usd', 0) < 0]
    
    total = len(trades)
    win_rate = len(winners) / total if total > 0 else 0
    loss_rate = len(losers) / total if total > 0 else 0
    
    avg_win = sum(t.get('pnl_usd', 0) for t in winners) / len(winners) if winners else 0
    avg_loss = abs(sum(t.get('pnl_usd', 0) for t in losers) / len(losers)) if losers else 0
    
    expectancy = (win_rate * avg_win) - (loss_rate * avg_loss)
    return round(expectancy, 2)
```

**Interpretation:**
- **Positive**: System has positive edge
- **Negative**: System loses money on average
- **Zero**: Break-even system

**Example:**
- 60% win rate, $100 avg win, $50 avg loss
- Expectancy = (0.6 × $100) - (0.4 × $50) = $40 per trade

### 2. Profit Factor

**Definition:** Ratio of gross profit to gross loss

**Formula:**
```
Profit Factor = Gross Profit / Gross Loss
```

**Calculation:**
```python
def calculate_profit_factor(trades: List[Dict]) -> float:
    if not trades:
        return 0.0
    
    gross_profit = sum(t.get('pnl_usd', 0) for t in trades if t.get('pnl_usd', 0) > 0)
    gross_loss = abs(sum(t.get('pnl_usd', 0) for t in trades if t.get('pnl_usd', 0) < 0))
    
    if gross_loss == 0:
        return 0.0 if gross_profit == 0 else float('inf')
    
    return round(gross_profit / gross_loss, 2)
```

**Interpretation:**
- **> 2.0**: Excellent system
- **1.5 - 2.0**: Good system
- **1.0 - 1.5**: Marginal system
- **< 1.0**: Losing system

**Example:**
- Gross profit: $5,000
- Gross loss: $2,500
- Profit Factor = 5,000 / 2,500 = 2.0

### 3. Win/Loss Streaks

**Definition:** Maximum consecutive wins or losses

**Calculation:**
```python
def calculate_streaks(trades: List[Dict]) -> Tuple[int, int]:
    if not trades:
        return 0, 0
    
    current_win_streak = 0
    current_loss_streak = 0
    max_win_streak = 0
    max_loss_streak = 0
    
    for trade in trades:
        pnl = trade.get('pnl_usd', 0)
        
        if pnl > 0:
            current_win_streak += 1
            current_loss_streak = 0
            max_win_streak = max(max_win_streak, current_win_streak)
        elif pnl < 0:
            current_loss_streak += 1
            current_win_streak = 0
            max_loss_streak = max(max_loss_streak, current_loss_streak)
    
    return max_win_streak, max_loss_streak
```

**Interpretation:**
- Helps understand consistency
- High loss streaks indicate system volatility
- Plan capital for worst-case scenarios

### 4. Maximum Drawdown

**Definition:** Largest peak-to-trough decline in equity

**Calculation:**
```python
def calculate_drawdown_series(trades: List[Dict]) -> Dict:
    if not trades:
        return {'labels': [], 'values': []}
    
    labels = []
    drawdowns = []
    cumulative_pnl = []
    running_total = 0
    
    for trade in trades:
        pnl = trade.get('pnl_usd', 0)
        running_total += pnl
        cumulative_pnl.append(running_total)
        
        # Date label
        date_str = trade.get('exit_date', trade.get('entry_date', ''))
        try:
            date_obj = datetime.fromisoformat(str(date_str).split('T')[0])
            labels.append(date_obj.strftime('%m/%d'))
        except:
            labels.append(date_str)
    
    # Calculate drawdown from peak
    peak = cumulative_pnl[0] if cumulative_pnl else 0
    for value in cumulative_pnl:
        if value > peak:
            peak = value
        drawdown = value - peak
        drawdowns.append(round(drawdown, 2))
    
    return {'labels': labels, 'values': drawdowns}
```

**Interpretation:**
- Maximum drawdown is the minimum value in series
- Indicates worst losing period
- Used for risk management and position sizing

**Example:**
- Peak equity: $10,000
- Lowest point: $7,500
- Max Drawdown: -$2,500 (25%)

### 5. Kelly Criterion

**Definition:** Optimal position size based on edge

**Formula:**
```
Kelly % = W - [(1 - W) / R]

Where:
- W = Win rate
- R = Average Win / Average Loss ratio
```

**Calculation:**
```python
def calculate_kelly_criterion(trades: List[Dict]) -> float:
    if not trades:
        return 0.0
    
    winners = [t for t in trades if t.get('pnl_usd', 0) > 0]
    losers = [t for t in trades if t.get('pnl_usd', 0) < 0]
    
    if not winners or not losers:
        return 0.0
    
    win_rate = len(winners) / len(trades)
    avg_win = sum(t.get('pnl_usd', 0) for t in winners) / len(winners)
    avg_loss = abs(sum(t.get('pnl_usd', 0) for t in losers) / len(losers))
    
    if avg_loss == 0:
        return 0.0
    
    r_ratio = avg_win / avg_loss
    kelly = win_rate - ((1 - win_rate) / r_ratio)
    
    return round(kelly * 100, 1)
```

**Interpretation:**
- **Positive**: System has edge, can size positions
- **Negative**: No edge, don't trade
- **> 20%**: Use fractional Kelly (25-50% of calculated value)

**Example:**
- 60% win rate
- 2:1 reward/risk ratio
- Kelly = 0.6 - (0.4 / 2) = 0.4 = 40%
- Recommended: Use 10-20% (1/4 to 1/2 Kelly)

## Tag Aggregations

### Strategy Breakdown

Groups trades by strategy tag and calculates metrics for each:

```python
def aggregate_by_tag(trades: List[Dict], tag_field: str) -> Dict:
    aggregates = {}
    
    for trade in trades:
        tag_value = trade.get(tag_field)
        if not tag_value or tag_value == '':
            tag_value = 'Unclassified'
        
        if tag_value not in aggregates:
            aggregates[tag_value] = {
                'trades': [],
                'total_trades': 0,
                'winning_trades': 0,
                'losing_trades': 0,
                'win_rate': 0,
                'total_pnl': 0,
                'avg_pnl': 0,
                'expectancy': 0
            }
        
        aggregates[tag_value]['trades'].append(trade)
    
    # Calculate stats for each tag
    for tag_value, data in aggregates.items():
        tag_trades = data['trades']
        
        data['total_trades'] = len(tag_trades)
        data['winning_trades'] = len([t for t in tag_trades if t.get('pnl_usd', 0) > 0])
        data['losing_trades'] = len([t for t in tag_trades if t.get('pnl_usd', 0) < 0])
        data['win_rate'] = round((data['winning_trades'] / data['total_trades'] * 100) if data['total_trades'] > 0 else 0, 1)
        data['total_pnl'] = round(sum(t.get('pnl_usd', 0) for t in tag_trades), 2)
        data['avg_pnl'] = round(data['total_pnl'] / data['total_trades'] if data['total_trades'] > 0 else 0, 2)
        data['expectancy'] = calculate_expectancy(tag_trades)
        
        del data['trades']
    
    return aggregates
```

**Supported Tags:**
- `strategy`: Trading strategy (Breakout, Reversal, etc.)
- `setup`: Trade setup (Morning Gap, VWAP Hold, etc.)
- `session`: Trading session (Premarket, Open, Close, etc.)

**Output Format:**
```json
{
  "by_strategy": {
    "Breakout": {
      "total_trades": 15,
      "win_rate": 66.7,
      "avg_pnl": 45.50,
      "total_pnl": 682.50,
      "expectancy": 45.50
    }
  }
}
```

## Data Format

### Input: trades-index.json

```json
{
  "trades": [
    {
      "trade_number": 1,
      "ticker": "AAPL",
      "entry_date": "2025-01-15",
      "exit_date": "2025-01-16",
      "pnl_usd": 255.00,
      "strategy": "Breakout",
      "setup": "Morning Gap"
    }
  ]
}
```

### Output: analytics-data.json

```json
{
  "expectancy": 25.50,
  "profit_factor": 1.85,
  "max_win_streak": 5,
  "max_loss_streak": 3,
  "max_drawdown": -425.00,
  "kelly_criterion": 12.5,
  "by_strategy": {
    "Breakout": {
      "total_trades": 15,
      "win_rate": 66.7,
      "avg_pnl": 45.50,
      "total_pnl": 682.50,
      "expectancy": 45.50
    }
  },
  "by_setup": {},
  "by_session": {},
  "drawdown_series": {
    "labels": ["01/15", "01/16", "01/17"],
    "values": [0, -50, -120]
  },
  "generated_at": "2025-10-20T02:50:25.124883"
}
```

## Usage

### Command Line

```bash
# Generate analytics from trades
python .github/scripts/generate_analytics.py
```

**Output:**
```
Generating analytics...
Processing 45 trades...
Analytics written to index.directory/assets/charts/analytics-data.json
Expectancy: $25.50
Profit Factor: 1.85
Kelly Criterion: 12.5%
```

### Integration with Workflow

Analytics are automatically generated by the trade pipeline:

```yaml
- name: Generate Analytics
  run: python .github/scripts/generate_analytics.py
```

### Frontend Display

The analytics page loads and displays the data:

```javascript
// Load analytics data
const response = await fetch('assets/charts/analytics-data.json');
const analyticsData = await response.json();

// Update metrics
document.getElementById('metric-expectancy').textContent = 
  `$${analyticsData.expectancy.toFixed(2)}`;

// Render charts
renderStrategyChart(analyticsData);
renderDrawdownChart(analyticsData);
```

## Visualizations

### 1. Strategy Performance Chart

**Type:** Bar chart  
**Data:** Total P&L per strategy  
**Colors:** Green for profit, Red for loss

```javascript
function renderStrategyChart(data) {
  const strategies = Object.keys(data.by_strategy);
  const pnls = strategies.map(s => data.by_strategy[s].total_pnl);
  
  new Chart(ctx, {
    type: 'bar',
    data: {
      labels: strategies,
      datasets: [{
        label: 'Total P&L ($)',
        data: pnls,
        backgroundColor: pnls.map(p => 
          p >= 0 ? 'rgba(0, 255, 136, 0.8)' : 'rgba(255, 71, 87, 0.8)'
        )
      }]
    }
  });
}
```

### 2. Win Rate Chart

**Type:** Bar chart  
**Data:** Win rate % per strategy  
**Color:** Yellow/Gold

### 3. Drawdown Chart

**Type:** Line chart  
**Data:** Cumulative drawdown over time  
**Color:** Red, filled area

### 4. Strategy Table

**Type:** Data table  
**Columns:**
- Strategy name
- Total trades
- Win rate %
- Average P&L
- Total P&L
- Expectancy

## Best Practices

### 1. Minimum Trade Count

Wait for sufficient data before making decisions:
- **< 10 trades**: Not statistically significant
- **10-30 trades**: Early indicators
- **30-100 trades**: Reasonable confidence
- **> 100 trades**: High confidence

### 2. Tag Your Trades

For meaningful aggregations:
- Consistently use strategy tags
- Define setups clearly
- Track session times
- Use market condition tags

### 3. Regular Updates

Regenerate analytics after:
- Adding new trades
- Editing existing trades
- Fixing data issues
- Adding new tags

### 4. Interpretation

Consider context when analyzing:
- Market conditions during period
- Position sizing changes
- Risk management adjustments
- Strategy modifications

## Troubleshooting

### Issue: Analytics Show Zero

**Cause:** No trades in index or empty trades-index.json

**Solution:**
```bash
# Regenerate trade index
python .github/scripts/parse_trades.py

# Then generate analytics
python .github/scripts/generate_analytics.py
```

### Issue: Missing Strategy Breakdown

**Cause:** Trades don't have strategy tags

**Solution:**
1. Add strategy field to trade markdown files
2. Regenerate index
3. Regenerate analytics

### Issue: Charts Not Displaying

**Cause:** 
- analytics-data.json not loaded
- Chart.js library not loaded
- JavaScript errors

**Solution:**
1. Check browser console for errors
2. Verify analytics-data.json exists
3. Check CDN links for Chart.js
4. Use browser dev tools to debug

## Future Enhancements

Planned features:

- [ ] Monte Carlo simulation
- [ ] Sharpe ratio calculation
- [ ] Maximum Adverse Excursion (MAE)
- [ ] Maximum Favorable Excursion (MFE)
- [ ] Win/Loss distribution histograms
- [ ] Equity curve with trendlines
- [ ] Correlation analysis
- [ ] Time-based analytics (by day of week, time of day)
- [ ] Comparative analytics (month over month)
- [ ] Risk-adjusted returns

## References

### Academic

- [Kelly Criterion](https://en.wikipedia.org/wiki/Kelly_criterion)
- [Expectancy Theory](https://www.investopedia.com/terms/e/expectancy.asp)
- [Sharpe Ratio](https://www.investopedia.com/terms/s/sharperatio.asp)

### Books

- "Trade Your Way to Financial Freedom" by Van K. Tharp
- "The New Trading for a Living" by Dr. Alexander Elder
- "Market Wizards" series by Jack D. Schwager

### Tools

- [Chart.js Documentation](https://www.chartjs.org/)
- [Python datetime](https://docs.python.org/3/library/datetime.html)
- [NumPy for calculations](https://numpy.org/)

## Support

For issues or questions:
1. Check [GitHub Issues](https://github.com/statikfintechllc/SFTi-Pennies/issues)
2. Review [Trade Pipeline docs](TRADE_PIPELINE.md)
3. Open new issue with:
   - Analytics output
   - Number of trades
   - Expected vs actual results
   - Screenshots

---

**Last Updated:** 2025-10-20  
**Version:** 1.0.0  
**Status:** Production Ready
