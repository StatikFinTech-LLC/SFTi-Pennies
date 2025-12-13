#!/usr/bin/env python3
"""
Generate Index Script
Consolidates all parsed trade data and generates the master trades index
This is essentially a wrapper that ensures parse_trades.py output is in the right place
"""

import html
import json
import os
import shutil
from navbar_template import get_navbar_html


def main():
    """Main execution function"""
    print("Generating master trade index...")

    # Check if trades-index.json exists
    if not os.path.exists("index.directory/trades-index.json"):
        print("Warning: index.directory/trades-index.json not found")
        print("This file should be created by parse_trades.py")
        return

    # Load the index
    with open("index.directory/trades-index.json", "r", encoding="utf-8") as f:
        index_data = json.load(f)

    trades = index_data.get("trades", [])
    stats = index_data.get("statistics", {})

    print(f"Master index contains {len(trades)} trade(s)")
    print(f"Total P&L: ${stats.get('total_pnl', 0)}")
    print(f"Win Rate: {stats.get('win_rate', 0)}%")

    # Ensure the file is in place for GitHub Pages
    # (it's already at index.directory/, which is correct)
    print("Master index is ready at index.directory/trades-index.json")

    # Create a simple trade list HTML for easy browsing (optional)
    create_trade_list_html(trades)


def create_trade_list_html(trades):
    """
    Create a simple HTML page listing all trades

    Args:
        trades (list): List of trade dictionaries
    """
    # Generate table rows
    rows = []

    if trades:
        # Sort by date (most recent first), then by trade number (descending)
        # Sort by entry_date descending (most recent first), then by trade_number descending (highest number first for same date)
        sorted_trades = sorted(
            trades, key=lambda t: (t.get("entry_date", ""), t.get("trade_number", 0)), reverse=True
        )

        for trade in sorted_trades:
            pnl = trade.get("pnl_usd", 0)
            pnl_class = "positive" if pnl >= 0 else "negative"
            pnl_sign = "+" if pnl >= 0 else ""

            # Generate trade page link
            trade_number = trade.get("trade_number", 0)
            ticker = trade.get("ticker", "UNKNOWN")
            trade_link = f"trades/trade-{trade_number:03d}-{ticker}.html"

            # Collect all tags for search
            strategy_tags = ",".join(trade.get("strategy_tags", []))
            setup_tags = ",".join(trade.get("setup_tags", []))
            session_tags = ",".join(trade.get("session_tags", []))
            market_tags = ",".join(trade.get("market_condition_tags", []))

            rows.append(
                f"""
        <tr style="cursor: pointer;" onclick="window.location.href='{trade_link}'" 
            data-ticker="{html.escape(trade.get('ticker', 'N/A'), quote=True)}"
            data-strategy="{html.escape(trade.get('strategy', 'N/A'), quote=True)}"
            data-strategy-tags="{html.escape(strategy_tags, quote=True)}"
            data-setup-tags="{html.escape(setup_tags, quote=True)}"
            data-session-tags="{html.escape(session_tags, quote=True)}"
            data-market-tags="{html.escape(market_tags, quote=True)}"
            data-direction="{html.escape(trade.get('direction', 'N/A'), quote=True)}"
            data-date="{html.escape(trade.get('entry_date', 'N/A'), quote=True)}">
            <td>{trade.get('entry_date', 'N/A')}</td>
            <td><a href="{trade_link}" style="color: inherit; text-decoration: none;">#{trade.get('trade_number', 'N/A')}</a></td>
            <td><a href="{trade_link}" style="color: inherit; text-decoration: none;"><strong>{trade.get('ticker', 'N/A')}</strong></a></td>
            <td>{trade.get('direction', 'N/A')}</td>
            <td>${trade.get('entry_price', 0):.4f}</td>
            <td>${trade.get('exit_price', 0):.4f}</td>
            <td>{trade.get('position_size', 0):,}</td>
            <td class="{pnl_class}">{pnl_sign}${abs(pnl):.2f}</td>
            <td>{trade.get('strategy', 'N/A')}</td>
        </tr>
        """
            )
    else:
        # Show empty state message
        rows.append(
            """
        <tr>
            <td colspan="9" style="text-align: center; padding: 3rem; color: var(--text-secondary);">
                No trades recorded yet. Add your first trade to get started!
            </td>
        </tr>
        """
        )

    html_content = f"""<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0, viewport-fit=cover">
    <meta name="description" content="Complete list of all recorded trades">
    <meta name="theme-color" content="#00ff88">
    
    <title>All Trades - SFTi-Pennies</title>
    
    <!-- Fonts -->
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500;600;700&display=swap" rel="stylesheet">
    
    <!-- Tailwind CDN -->
    <script src="https://cdn.tailwindcss.com"></script>
    
    <!-- Custom Styles -->
    <link rel="stylesheet" href="assets/css/main.css">
    <link rel="stylesheet" href="assets/css/glass-effects.css">
    <link rel="stylesheet" href="assets/css/review-trades.css">
    <link rel="stylesheet" href="assets/css/glowing-bubbles.css">
    
    <!-- PWA Manifest -->
    <link rel="manifest" href="../manifest.json">
    
    <!-- Icons -->
    <link rel="icon" type="image/png" sizes="192x192" href="assets/icons/icon-192.png">
    
    <style>
        table {{
            width: 100%;
            border-collapse: collapse;
            background-color: var(--bg-secondary);
            border: 1px solid var(--border-color);
            border-radius: 8px;
            overflow: hidden;
        }}
        th, td {{
            padding: 1rem;
            text-align: left;
            border-bottom: 1px solid var(--border-color);
        }}
        th {{
            background-color: var(--bg-tertiary);
            font-weight: 600;
            color: var(--accent-green);
            text-transform: uppercase;
            font-size: 0.875rem;
            letter-spacing: 0.05em;
        }}
        tr:hover {{
            background-color: var(--bg-tertiary);
            cursor: pointer;
        }}
        tr a {{
            display: block;
            width: 100%;
            height: 100%;
        }}
        .positive {{
            color: var(--accent-green);
            font-weight: 600;
        }}
        .negative {{
            color: var(--accent-red);
            font-weight: 600;
        }}
    </style>
</head>
<body>
    <canvas id="bg-canvas"></canvas>
    
{get_navbar_html("directory")}
    
    <main class="container">
        <h1>All Trades</h1>
        <p style="color: var(--text-secondary); margin-bottom: 2rem;">
            Complete list of all recorded trades
        </p>
        
        <!-- Search and Filter Section -->
        <div class="glass-stat" style="padding: 1.5rem; margin-bottom: 1.5rem;">
            <div style="display: flex; gap: 1rem; flex-wrap: wrap; align-items: flex-end;">
                <div style="flex: 1; min-width: 250px;">
                    <label for="search-input" style="display: block; margin-bottom: 0.5rem; font-size: 0.875rem; color: var(--text-secondary);">
                        Search by Ticker, Strategy, or Tags
                    </label>
                    <div style="position: relative; display: flex; align-items: center;">
                        <input 
                            type="text" 
                            id="search-input" 
                            placeholder="e.g., Breakout, Morning, ..."
                            style="width: 100%; padding: 0.75rem 52px 0.75rem 0.75rem; background: var(--bg-tertiary); border: 1px solid var(--border-color); border-radius: var(--glass-radius-md); color: var(--text-primary); font-size: 0.875rem; transition: all 0.3s ease;"
                            onfocus="this.style.borderColor='var(--glass-border-bright)'; this.style.boxShadow='0 0 0 3px rgba(0, 255, 136, 0.1)';"
                            onblur="this.style.borderColor='var(--border-color)'; this.style.boxShadow='none';"
                        />
                        <button 
                            id="send-search"
                            aria-label="Send Search"
                            style="position: absolute; right: 8px; display: flex; align-items: center; justify-content: center; min-width: 36px; width: 36px; min-height: 36px; height: 36px; background: linear-gradient(135deg, rgba(0, 255, 136, 0.15) 0%, rgba(0, 200, 108, 0.08) 100%); backdrop-filter: blur(10px); border: 2px solid rgba(0, 255, 136, 0.3); border-radius: 50%; cursor: pointer; transition: all 0.3s ease; box-shadow: 0 4px 24px rgba(0, 255, 136, 0.2); padding: 0; flex-shrink: 0;"
                            onmouseover="this.style.transform='scale(1.1)'; this.style.borderColor='rgba(0, 255, 136, 0.6)'; this.style.boxShadow='0 6px 32px rgba(0, 255, 136, 0.4)';"
                            onmouseout="this.style.transform='scale(1)'; this.style.borderColor='rgba(0, 255, 136, 0.3)'; this.style.boxShadow='0 4px 24px rgba(0, 255, 136, 0.2)';"
                        >
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--accent-green)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                <line x1="22" y1="2" x2="11" y2="13"></line>
                                <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
                            </svg>
                        </button>
                    </div>
                </div>
            </div>
            <div style="display: flex; gap: 1rem; margin-top: 1rem; flex-wrap: wrap;">
                <div style="flex: 1; min-width: 250px; position: relative; display: flex; align-items: center;">
                    <select 
                        id="filter-type"
                        style="width: 100%; padding: 0.75rem 60px 0.75rem 0.75rem; background: var(--bg-tertiary); border: 1px solid var(--border-color); border-radius: var(--glass-radius-md); color: var(--text-primary); font-size: 0.875rem; cursor: pointer; transition: all 0.3s ease;"
                        onfocus="this.style.borderColor='var(--glass-border-bright)'; this.style.boxShadow='0 0 0 3px rgba(0, 255, 136, 0.1)';"
                        onblur="this.style.borderColor='var(--border-color)'; this.style.boxShadow='none';"
                    >
                        <option value="all">All Fields</option>
                        <option value="ticker">Ticker</option>
                        <option value="strategy">Strategy</option>
                        <option value="strategy-tags">Strategy Tags</option>
                        <option value="setup-tags">Setup Tags</option>
                        <option value="session-tags">Session Tags</option>
                        <option value="market-tags">Market Condition Tags</option>
                        <option value="direction">Direction</option>
                    </select>
                    <button 
                        id="clear-search"
                        aria-label="Clear Filters"
                        style="position: absolute; right: 8px; display: flex; align-items: center; justify-content: center; min-width: 36px; width: 36px; min-height: 36px; height: 36px; background: linear-gradient(135deg, rgba(245, 158, 11, 0.15) 0%, rgba(217, 119, 6, 0.08) 100%); backdrop-filter: blur(10px); border: 2px solid rgba(245, 158, 11, 0.3); border-radius: 50%; cursor: pointer; transition: all 0.3s ease; box-shadow: 0 4px 24px rgba(245, 158, 11, 0.2); padding: 0; flex-shrink: 0;"
                        onmouseover="this.style.transform='scale(1.1)'; this.style.borderColor='rgba(245, 158, 11, 0.6)'; this.style.boxShadow='0 6px 32px rgba(245, 158, 11, 0.4)';"
                        onmouseout="this.style.transform='scale(1)'; this.style.borderColor='rgba(245, 158, 11, 0.3)'; this.style.boxShadow='0 4px 24px rgba(245, 158, 11, 0.2)';"
                    >
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="rgba(245, 158, 11, 1)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                            <circle cx="12" cy="12" r="10"></circle>
                            <line x1="15" y1="9" x2="9" y2="15"></line>
                            <line x1="9" y1="9" x2="15" y2="15"></line>
                        </svg>
                    </button>
                </div>
            </div>
            <div id="filter-stats" style="margin-top: 1rem; font-size: 0.875rem; color: var(--text-secondary);">
                Showing <span id="visible-count">0</span> of <span id="total-count">0</span> trades
            </div>
        </div>
        
        <div style="overflow-x: auto;">
            <table id="trades-table">
                <thead>
                    <tr>
                        <th>Date</th>
                        <th>Trade #</th>
                        <th>Ticker</th>
                        <th>Direction</th>
                        <th>Entry</th>
                        <th>Exit</th>
                        <th>Size</th>
                        <th>P&L</th>
                        <th>Strategy</th>
                    </tr>
                </thead>
                <tbody>
                    {''.join(rows)}
                </tbody>
            </table>
        </div>
    </main>
    
    <!-- Footer - Generated by footer.js -->
    
    <!-- Load shared utilities first -->
    <script src="assets/js/utils.js"></script>
    <script src="assets/js/chartConfig.js"></script>
    
    <!-- Application scripts -->
    <script src="assets/js/navbar.js"></script>
    <script src="assets/js/footer.js"></script>
    <script src="assets/js/background.js"></script>
    <script src="assets/js/auth.js"></script>
    <script src="assets/js/app.js"></script>
    <script src="assets/js/glowing-bubbles.js"></script>
    
    <!-- Trade Search and Filter Script -->
    <script>
        document.addEventListener('DOMContentLoaded', function() {{
            const searchInput = document.getElementById('search-input');
            const filterType = document.getElementById('filter-type');
            const clearButton = document.getElementById('clear-search');
            const tradesTable = document.getElementById('trades-table');
            const tbody = tradesTable.querySelector('tbody');
            const rows = Array.from(tbody.querySelectorAll('tr'));
            const visibleCount = document.getElementById('visible-count');
            const totalCount = document.getElementById('total-count');
            
            // Set initial count
            totalCount.textContent = rows.length;
            visibleCount.textContent = rows.length;
            
            function filterTrades() {{
                const searchTerm = searchInput.value.toLowerCase().trim();
                const filterBy = filterType.value;
                let visible = 0;
                
                rows.forEach(row => {{
                    let shouldShow = true;
                    
                    if (searchTerm) {{
                        const ticker = (row.dataset.ticker || '').toLowerCase();
                        const strategy = (row.dataset.strategy || '').toLowerCase();
                        const strategyTags = (row.dataset.strategyTags || '').toLowerCase();
                        const setupTags = (row.dataset.setupTags || '').toLowerCase();
                        const sessionTags = (row.dataset.sessionTags || '').toLowerCase();
                        const marketTags = (row.dataset.marketTags || '').toLowerCase();
                        const direction = (row.dataset.direction || '').toLowerCase();
                        
                        switch (filterBy) {{
                            case 'ticker':
                                shouldShow = ticker.includes(searchTerm);
                                break;
                            case 'strategy':
                                shouldShow = strategy.includes(searchTerm);
                                break;
                            case 'strategy-tags':
                                shouldShow = strategyTags.includes(searchTerm);
                                break;
                            case 'setup-tags':
                                shouldShow = setupTags.includes(searchTerm);
                                break;
                            case 'session-tags':
                                shouldShow = sessionTags.includes(searchTerm);
                                break;
                            case 'market-tags':
                                shouldShow = marketTags.includes(searchTerm);
                                break;
                            case 'direction':
                                shouldShow = direction.includes(searchTerm);
                                break;
                            case 'all':
                            default:
                                shouldShow = ticker.includes(searchTerm) || 
                                           strategy.includes(searchTerm) ||
                                           strategyTags.includes(searchTerm) ||
                                           setupTags.includes(searchTerm) ||
                                           sessionTags.includes(searchTerm) ||
                                           marketTags.includes(searchTerm) ||
                                           direction.includes(searchTerm);
                                break;
                        }}
                    }}
                    
                    if (shouldShow) {{
                        row.style.display = '';
                        visible++;
                    }} else {{
                        row.style.display = 'none';
                    }}
                }});
                
                visibleCount.textContent = visible;
            }}
            
            function clearSearch() {{
                searchInput.value = '';
                filterType.value = 'all';
                filterTrades();
            }}
            
            // Event listeners
            searchInput.addEventListener('input', filterTrades);
            filterType.addEventListener('change', filterTrades);
            clearButton.addEventListener('click', clearSearch);
        }});
    </script>
</body>
</html>
"""

    with open("index.directory/all-trades.html", "w", encoding="utf-8") as f:
        f.write(html_content)

    print("Trade list HTML created at index.directory/all-trades.html")


if __name__ == "__main__":
    main()
