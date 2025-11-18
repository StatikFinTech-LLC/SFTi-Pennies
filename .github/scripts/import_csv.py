#!/usr/bin/env python3
"""
Import CSV Script
Entry point for importing broker CSV files into the trading journal

This script provides a complete import workflow:
1. Detects the broker from CSV content (or use --broker flag)
2. Parses trades using the appropriate importer
3. Validates trade data with broker-specific rules
4. Creates/updates trade markdown files in index.directory/SFTi.Tradez/
5. Updates trades-index.json with new trades
"""

import os
import sys
import json
import argparse
from pathlib import Path
from datetime import datetime
from typing import List, Dict
from globals_utils import setup_imports, ensure_directory, save_json_file, load_json_file, get_week_folder, parse_date

# Setup imports
setup_imports(__file__)


def detect_broker(csv_content: str) -> str:
    """
    Auto-detect broker from CSV content

    Args:
        csv_content (str): Raw CSV content

    Returns:
        str: Detected broker name or None
    """
    import sys

    sys.path.insert(0, os.path.dirname(__file__))
    from importers import list_brokers, get_importer

    for broker_name in list_brokers():
        importer = get_importer(broker_name)
        if importer and importer.detect_format(csv_content):
            return broker_name

    return None


def parse_csv_file(csv_path: str, broker: str = None) -> List[Dict]:
    """
    Parse a CSV file into trades

    Args:
        csv_path (str): Path to CSV file
        broker (str, optional): Broker name (auto-detect if None)

    Returns:
        List[Dict]: List of parsed trades
    """
    try:
        with open(csv_path, "r", encoding="utf-8") as f:
            csv_content = f.read()
    except Exception as e:
        print(f"Error reading CSV file: {e}")
        return []

    # Detect broker if not specified
    if not broker:
        broker = detect_broker(csv_content)
        if not broker:
            print("Could not auto-detect broker. Please specify with --broker flag")
            return []
        print(f"Detected broker: {broker}")

    # Get importer and parse
    import sys

    sys.path.insert(0, os.path.dirname(__file__))
    from importers import get_importer

    importer = get_importer(broker)
    if not importer:
        print(f"No importer found for broker: {broker}")
        return []

    try:
        trades = importer.parse_csv(csv_content)
        return trades
    except Exception as e:
        print(f"Error parsing CSV: {e}")
        return []


def validate_trades(trades: List[Dict], broker: str) -> tuple[List[Dict], List[Dict]]:
    """
    Validate parsed trades

    Args:
        trades (List[Dict]): List of parsed trades
        broker (str): Broker name

    Returns:
        tuple: (valid_trades, invalid_trades_with_errors)
    """
    import sys

    sys.path.insert(0, os.path.dirname(__file__))
    from importers import get_importer

    importer = get_importer(broker)
    if not importer:
        # If no importer, return all as valid (basic validation)
        return trades, []

    valid = []
    invalid = []

    for trade in trades:
        is_valid, errors = importer.validate_trade(trade)
        if is_valid:
            valid.append(trade)
        else:
            invalid.append((trade, errors))

    return valid, invalid


def create_trade_markdown(trade: Dict, output_dir: str) -> str:
    """
    Create a markdown file for a trade using the existing template format

    Args:
        trade (Dict): Trade dictionary
        output_dir (str): Output directory (e.g., index.directory/SFTi.Tradez)

    Returns:
        str: Path to created file

    Uses the format: index.directory/SFTi.Tradez/week.YYYY.WW/MM:DD:YYYY.N.md
    """
    # Determine week folder and filename from entry date
    entry_date = trade.get("entry_date", datetime.now().isoformat())
    date_obj = parse_date(entry_date)
    
    if date_obj:
        week_folder = get_week_folder(date_obj)
        # Format: MM:DD:YYYY.N.md (N is the trade sequence for that day)
        date_str = date_obj.strftime("%m:%d:%Y")
        trade_num = trade.get("trade_number", 1)
        filename = f"{date_str}.{trade_num}.md"
    else:
        week_folder = "week.000"
        filename = f"trade-{trade.get('trade_number', 0):03d}.md"

    # Create week directory if needed
    week_path = os.path.join(output_dir, week_folder)
    ensure_directory(week_path)

    filepath = os.path.join(week_path, filename)

    # Generate markdown content using existing template format
    try:
        # Helper function to convert absolute paths to relative paths
        def _convert_to_relative_path(absolute_path):
            """Convert absolute path to relative path from markdown file location"""
            # Remove leading repo name if present (e.g., /SFTi-Pennies/)
            if absolute_path.startswith("/"):
                # Extract the part after the repo name
                parts = absolute_path.split("/")
                # Find 'assets' in the path
                try:
                    assets_index = parts.index("assets")
                    # Reconstruct path from assets onwards
                    relative_parts = parts[assets_index:]
                    return "../../" + "/".join(relative_parts)
                except ValueError:
                    # If 'assets' not found, just use the path as-is with relative prefix
                    return "../../" + absolute_path.lstrip("/")
            else:
                # Already relative, ensure it has the correct prefix
                if absolute_path.startswith("assets/"):
                    return "../../" + absolute_path
                else:
                    return absolute_path

        # Load template
        template_path = ".github/templates/trade.md.template"
        with open(template_path, "r", encoding="utf-8") as f:
            template = f.read()

        # Prepare data for template
        screenshots_list = trade.get("screenshots", [])
        if not screenshots_list or screenshots_list == [""]:
            screenshots_str = "No screenshots uploaded."
        else:
            # Convert paths to relative format and generate HTML img tags
            screenshots_str = "\n\n".join(
                [
                    f'<img width="2048" height="1679" alt="image" src="{_convert_to_relative_path(s)}"/>'
                    for s in screenshots_list
                ]
            )

        # Build frontmatter
        frontmatter = f"""---
trade_number: {trade.get('trade_number', '')}
ticker: {trade.get('ticker', '')}
entry_date: {trade.get('entry_date', '')}
entry_time: {trade.get('entry_time', '')}
exit_date: {trade.get('exit_date', '')}
exit_time: {trade.get('exit_time', '')}
entry_price: {trade.get('entry_price', '')}
exit_price: {trade.get('exit_price', '')}
position_size: {trade.get('position_size', '')}
direction: {trade.get('direction', 'LONG')}
strategy: {trade.get('strategy', '')}
stop_loss: {trade.get('stop_loss', '')}
target_price: {trade.get('target_price', '')}
risk_reward_ratio: {trade.get('risk_reward_ratio', '')}
broker: {trade.get('broker', '')}
pnl_usd: {trade.get('pnl_usd', '')}
pnl_percent: {trade.get('pnl_percent', '')}"""

        # Add new fields for v1.1 schema if present
        if "strategy_tags" in trade:
            frontmatter += f"\nstrategy_tags: {trade.get('strategy_tags', [])}"
        if "setup_tags" in trade:
            frontmatter += f"\nsetup_tags: {trade.get('setup_tags', [])}"
        if "session_tags" in trade:
            frontmatter += f"\nsession_tags: {trade.get('session_tags', [])}"
        if "market_condition_tags" in trade:
            frontmatter += (
                f"\nmarket_condition_tags: {trade.get('market_condition_tags', [])}"
            )

        frontmatter += f"""
screenshots:
  - {screenshots_list[0] if screenshots_list and screenshots_list[0] else 'None'}
---

# Trade #{trade.get('trade_number', '')} - {trade.get('ticker', '')}

## Trade Details

- **Ticker**: {trade.get('ticker', '')}
- **Direction**: {trade.get('direction', 'LONG')}
- **Entry**: ${trade.get('entry_price', '')} on {trade.get('entry_date', '')} at {trade.get('entry_time', '')}
- **Exit**: ${trade.get('exit_price', '')} on {trade.get('exit_date', '')} at {trade.get('exit_time', '')}
- **Position Size**: {trade.get('position_size', '')} shares
- **Strategy**: {trade.get('strategy', '')}
- **Broker**: {trade.get('broker', '')}

## Risk Management

- **Stop Loss**: ${trade.get('stop_loss', '')}
- **Target Price**: ${trade.get('target_price', '')}
- **Risk:Reward Ratio**: 1:{trade.get('risk_reward_ratio', '')}

## Results

- **P&L (USD)**: ${trade.get('pnl_usd', '')}
- **P&L (%)**: {trade.get('pnl_percent', '')}%

## Notes

{trade.get('notes', 'Imported from CSV')}

## Screenshots

{screenshots_str}
"""

        # Write to file
        with open(filepath, "w", encoding="utf-8") as f:
            f.write(frontmatter)

        print(f"Created trade file: {filepath}")
        return filepath

    except Exception as e:
        print(f"Error creating trade markdown: {e}")
        return filepath


def update_trades_index(new_trades: List[Dict]):
    """
    Update the trades-index.json with newly imported trades

    Args:
        new_trades (List[Dict]): List of new trades to add
    """
    index_path = "index.directory/trades-index.json"

    # Load existing index
    index_data = load_json_file(index_path, {"trades": [], "statistics": {}, "version": "1.0"})
    
    existing_trades = index_data.get("trades", [])

    # Create a set of existing trade identifiers (date + ticker)
    existing_ids = set()
    for trade in existing_trades:
        trade_id = f"{trade.get('entry_date', '')}_{trade.get('ticker', '')}"
        existing_ids.add(trade_id)

    # Add new trades, checking for duplicates
    added_count = 0
    for trade in new_trades:
        trade_id = f"{trade.get('entry_date', '')}_{trade.get('ticker', '')}"
        if trade_id not in existing_ids:
            existing_trades.append(trade)
            existing_ids.add(trade_id)
            added_count += 1
        else:
            print(
                f"  Skipping duplicate trade: {trade.get('ticker', '')} on {trade.get('entry_date', '')}"
            )

    # Update index
    index_data["trades"] = existing_trades

    # Save updated index
    if save_json_file(index_path, index_data):
        print(f"Updated trades index with {added_count} new trade(s)")
    else:
        print(f"Error saving trades index")


def main():
    """Main entry point"""
    parser = argparse.ArgumentParser(description="Import trades from broker CSV files")
    parser.add_argument("csv_file", help="Path to CSV file to import")
    parser.add_argument(
        "--broker",
        choices=["ibkr", "schwab", "robinhood", "webull"],
        help="Broker name (auto-detect if not specified)",
    )
    parser.add_argument(
        "--dry-run", action="store_true", help="Validate only, do not create files"
    )
    parser.add_argument(
        "--output-dir",
        default="index.directory/SFTi.Tradez",
        help="Output directory for trade files",
    )

    args = parser.parse_args()

    print("=" * 60)
    print("SFTi-Pennies CSV Importer")
    print("=" * 60)
    print(f"CSV File: {args.csv_file}")
    print(f"Broker: {args.broker or 'auto-detect'}")
    print(f"Dry Run: {args.dry_run}")
    print(f"Output: {args.output_dir}")
    print("=" * 60)

    # Check if CSV file exists
    if not os.path.exists(args.csv_file):
        print(f"Error: CSV file not found: {args.csv_file}")
        sys.exit(1)

    # Parse CSV
    print("\n[Step 1/4] Parsing CSV file...")
    trades = parse_csv_file(args.csv_file, args.broker)

    if not trades:
        print("No trades found in CSV file")
        sys.exit(0)

    print(f"Found {len(trades)} potential trade(s)")

    # Validate trades
    print("\n[Step 2/4] Validating trades...")
    valid_trades, invalid_trades = validate_trades(trades, args.broker or "unknown")

    print(f"Valid trades: {len(valid_trades)}")
    print(f"Invalid trades: {len(invalid_trades)}")

    if invalid_trades:
        print("\nInvalid trades:")
        for i, (trade, errors) in enumerate(invalid_trades, 1):
            print(f"  {i}. {trade.get('ticker', 'UNKNOWN')}: {', '.join(errors)}")

    if not valid_trades:
        print("No valid trades to import")
        sys.exit(0)

    if args.dry_run:
        print(f"\n[DRY RUN] Would import {len(valid_trades)} trade(s)")
        sys.exit(0)

    # Create trade files
    print("\n[Step 3/4] Creating trade markdown files...")
    created_files = []
    for trade in valid_trades:
        filepath = create_trade_markdown(trade, args.output_dir)
        created_files.append(filepath)

    print(f"Created {len(created_files)} trade file(s)")

    # Update index
    print("\n[Step 4/4] Updating trades index...")
    update_trades_index(valid_trades)

    print("\n" + "=" * 60)
    print("Import complete!")
    print("=" * 60)
    print(f"Imported {len(valid_trades)} trade(s)")
    print(f"Created {len(created_files)} file(s)")
    print("\nNext steps:")
    print("1. Run: python .github/scripts/parse_trades.py")
    print("2. Run: python .github/scripts/generate_charts.py")
    print("3. Commit and push changes to trigger full pipeline")


if __name__ == "__main__":
    main()
