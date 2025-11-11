#!/usr/bin/env python3
"""
Export CSV Script
Exports trades from trades-index.json to CSV format

Features:
- Export all trades or filter by strategy, date range
- Configurable output file path
- Standard CSV format compatible with spreadsheet applications
"""

import csv
import argparse
from datetime import datetime
import os
from globals_utils import setup_imports

# Setup imports
setup_imports(__file__)
from utils import load_trades_index


def export_to_csv(trades, output_file="trades-export.csv"):
    """
    Export trades to CSV file with comprehensive trade data

    Args:
        trades (list): List of trade dictionaries
        output_file (str): Output CSV file path
    """
    if not trades:
        print("No trades to export")
        return

    # Define CSV fields - comprehensive set of trade attributes
    fields = [
        "trade_number",
        "ticker",
        "entry_date",
        "entry_time",
        "entry_price",
        "exit_date",
        "exit_time",
        "exit_price",
        "position_size",
        "direction",
        "broker",
        "strategy",
        "pnl_usd",
        "pnl_percent",
        "risk_reward_ratio",
        "time_in_trade",
        "notes",
    ]

    try:
        with open(output_file, "w", newline="", encoding="utf-8") as f:
            writer = csv.DictWriter(f, fieldnames=fields, extrasaction="ignore")

            # Write header
            writer.writeheader()

            # Write trades
            for trade in trades:
                # Flatten nested fields if needed
                row = {field: trade.get(field, "") for field in fields}
                writer.writerow(row)

        print(f"Exported {len(trades)} trade(s) to {output_file}")

    except Exception as e:
        print(f"Error exporting to CSV: {e}")


def main():
    """Main execution function"""
    parser = argparse.ArgumentParser(description="Export trades to CSV format")
    parser.add_argument(
        "--output",
        "-o",
        default="trades-export.csv",
        help="Output CSV file path (default: trades-export.csv)",
    )
    parser.add_argument("--filter-strategy", help="Filter by strategy name")
    parser.add_argument(
        "--filter-date-from", help="Filter trades from date (YYYY-MM-DD)"
    )
    parser.add_argument("--filter-date-to", help="Filter trades to date (YYYY-MM-DD)")

    args = parser.parse_args()

    print("=" * 60)
    print("SFTi-Pennies CSV Exporter")
    print("=" * 60)

    # Load trades
    index_data = load_trades_index()
    if not index_data:
        return

    trades = index_data.get("trades", [])
    print(f"Loaded {len(trades)} trade(s) from index")

    # Apply filters
    if args.filter_strategy:
        trades = [
            t
            for t in trades
            if t.get("strategy", "").lower() == args.filter_strategy.lower()
        ]
        print(
            f"Filtered to {len(trades)} trade(s) with strategy '{args.filter_strategy}'"
        )

    if args.filter_date_from:
        # Filter trades from date (inclusive)
        try:
            from_date = datetime.strptime(args.filter_date_from, "%Y-%m-%d")
            filtered_trades = []
            for t in trades:
                entry_date = t.get("entry_date", "")
                if entry_date:  # Skip trades with missing dates
                    try:
                        if datetime.strptime(entry_date, "%Y-%m-%d") >= from_date:
                            filtered_trades.append(t)
                    except ValueError:
                        # Skip trades with invalid date format
                        continue
            trades = filtered_trades
            print(f"Filtered to {len(trades)} trade(s) from {args.filter_date_from}")
        except ValueError:
            print(
                f"Warning: Invalid date format for --filter-date-from (expected YYYY-MM-DD)"
            )

    if args.filter_date_to:
        # Filter trades to date (inclusive)
        try:
            to_date = datetime.strptime(args.filter_date_to, "%Y-%m-%d")
            filtered_trades = []
            for t in trades:
                entry_date = t.get("entry_date", "")
                if entry_date:  # Skip trades with missing dates
                    try:
                        if datetime.strptime(entry_date, "%Y-%m-%d") <= to_date:
                            filtered_trades.append(t)
                    except ValueError:
                        # Skip trades with invalid date format
                        continue
            trades = filtered_trades
            print(f"Filtered to {len(trades)} trade(s) until {args.filter_date_to}")
        except ValueError:
            print(
                f"Warning: Invalid date format for --filter-date-to (expected YYYY-MM-DD)"
            )

    # Export
    if trades:
        export_to_csv(trades, args.output)
    else:
        print("No trades match filters")

    print("=" * 60)


if __name__ == "__main__":
    main()
