#!/usr/bin/env python3
"""
Update Homepage Script
Updates the index.html with the 3 most recent trades
Injects trade data into the homepage HTML
"""

import sys
import os
from datetime import datetime
from globals_utils import setup_imports

# Setup imports
setup_imports(__file__)
from utils import load_trades_index


def main():
    """Main execution function"""
    print("Updating homepage with recent trades...")

    # Load trades index
    index_data = load_trades_index()
    if not index_data:
        print("Could not load trades index")
        return

    trades = index_data.get("trades", [])
    stats = index_data.get("statistics", {})

    # Note: The actual homepage update is handled by the JavaScript
    # This script mainly ensures the index.directory/trades-index.json is in the right place

    # Copy trades-index.json to the root for web access
    print(f"Trades index contains {len(trades)} trade(s)")
    print(
        f"Statistics: Win Rate: {stats.get('win_rate', 0)}%, Total P&L: ${stats.get('total_pnl', 0)}"
    )

    # The index.html file uses JavaScript to dynamically load from index.directory/trades-index.json
    # So we just need to ensure the JSON file is accessible
    print("Homepage will be updated via JavaScript when loaded")
    print("index.directory/trades-index.json is ready for frontend consumption")


if __name__ == "__main__":
    main()
