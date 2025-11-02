#!/usr/bin/env python3
"""
Generate Index Script
Consolidates all parsed trade data and generates the master trades index
This is essentially a wrapper that ensures parse_trades.py output is in the right place
"""

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
        # Sort by trade number
        sorted_trades = sorted(trades, key=lambda t: t.get("trade_number", 0), reverse=True)
        
        for trade in sorted_trades:
            pnl = trade.get("pnl_usd", 0)
            pnl_class = "positive" if pnl >= 0 else "negative"
            pnl_sign = "+" if pnl >= 0 else ""

            # Generate trade page link
            trade_number = trade.get("trade_number", 0)
            ticker = trade.get("ticker", "UNKNOWN")
            trade_link = f"trades/trade-{trade_number:03d}-{ticker}.html"

            rows.append(
                f"""
        <tr style="cursor: pointer;" onclick="window.location.href='{trade_link}'">
            <td><a href="{trade_link}" style="color: inherit; text-decoration: none;">#{trade.get('trade_number', 'N/A')}</a></td>
            <td><a href="{trade_link}" style="color: inherit; text-decoration: none;"><strong>{trade.get('ticker', 'N/A')}</strong></a></td>
            <td>{trade.get('direction', 'N/A')}</td>
            <td>${trade.get('entry_price', 0):.4f}</td>
            <td>${trade.get('exit_price', 0):.4f}</td>
            <td>{trade.get('position_size', 0):,}</td>
            <td class="{pnl_class}">{pnl_sign}${abs(pnl):.2f}</td>
            <td>{trade.get('entry_date', 'N/A')}</td>
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
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
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
        
        <div style="overflow-x: auto;">
            <table>
                <thead>
                    <tr>
                        <th>Trade #</th>
                        <th>Ticker</th>
                        <th>Direction</th>
                        <th>Entry</th>
                        <th>Exit</th>
                        <th>Size</th>
                        <th>P&L</th>
                        <th>Date</th>
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
</body>
</html>
"""

    with open("index.directory/all-trades.html", "w", encoding="utf-8") as f:
        f.write(html_content)

    print("Trade list HTML created at index.directory/all-trades.html")


if __name__ == "__main__":
    main()
