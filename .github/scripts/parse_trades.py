#!/usr/bin/env python3
"""
Parse Trades Script
Parses markdown files from the trades/ directory and generates a JSON index
with all trade data extracted from YAML frontmatter

Performance Optimizations:
- Single-pass statistics calculation combining multiple metrics
- Efficient cumulative P&L tracking for drawdown calculation
- Reduced memory allocation with in-place updates
- Optimized type conversions and validations
"""

import os
import json
import yaml
import glob
import re
from pathlib import Path
from datetime import datetime


def parse_frontmatter(content):
    """
    Extract YAML frontmatter from markdown content

    Args:
        content (str): Markdown file content

    Returns:
        tuple: (frontmatter_dict, markdown_body)
    """
    if not content.startswith("---"):
        return {}, content

    try:
        # Split content by --- markers
        parts = content.split("---", 2)
        if len(parts) < 3:
            return {}, content

        # Parse YAML frontmatter
        frontmatter = yaml.safe_load(parts[1])
        body = parts[2].strip()

        return frontmatter, body
    except Exception as e:
        print(f"Error parsing frontmatter: {e}")
        return {}, content


def parse_trade_file(filepath):
    """
    Parse a single trade markdown file

    Args:
        filepath (str): Path to trade markdown file

    Returns:
        dict: Parsed trade data or None if parsing fails
    """
    try:
        with open(filepath, "r", encoding="utf-8") as f:
            content = f.read()

        frontmatter, body = parse_frontmatter(content)

        if not frontmatter:
            print(f"Warning: No frontmatter found in {filepath}")
            return None

        # Validate required fields
        required_fields = [
            "trade_number",
            "ticker",
            "entry_date",
            "entry_price",
            "exit_price",
            "position_size",
            "direction",
        ]

        missing_fields = [f for f in required_fields if f not in frontmatter]
        if missing_fields:
            print(f"Warning: Missing required fields in {filepath}: {missing_fields}")
            return None

        # Extract notes section from markdown body
        notes = ""
        notes_match = re.search(r"## Notes\s*\n+(.*?)(?=\n##|\Z)", body, re.DOTALL)
        if notes_match:
            notes = notes_match.group(1).strip()

        # Add computed fields
        trade_data = {
            "file_path": filepath,
            "body": body[:200] + "..." if len(body) > 200 else body,  # Preview
            "notes": notes if notes else "No notes recorded.",
            **frontmatter,
        }

        # Ensure numeric fields are properly typed
        numeric_fields = [
            "trade_number",
            "entry_price",
            "exit_price",
            "position_size",
            "stop_loss",
            "target_price",
            "pnl_usd",
            "pnl_percent",
            "risk_reward_ratio",
        ]

        for field in numeric_fields:
            if field in trade_data and trade_data[field] is not None:
                try:
                    trade_data[field] = float(trade_data[field])
                except (ValueError, TypeError):
                    print(f"Warning: Could not convert {field} to number in {filepath}")

        # Convert trade_number to int specifically
        if "trade_number" in trade_data:
            trade_data["trade_number"] = int(trade_data["trade_number"])

        # Convert date/time fields to strings for JSON serialization
        date_fields = ["entry_date", "exit_date", "entry_time", "exit_time"]
        for field in date_fields:
            if field in trade_data and trade_data[field] is not None:
                trade_data[field] = str(trade_data[field])

        return trade_data

    except Exception as e:
        print(f"Error parsing {filepath}: {e}")
        return None


def calculate_statistics(trades):
    """
    Calculate aggregate statistics from all trades

    Args:
        trades (list): List of trade dictionaries

    Returns:
        dict: Statistics dictionary
    """
    if not trades:
        return {
            "total_trades": 0,
            "winning_trades": 0,
            "losing_trades": 0,
            "win_rate": 0,
            "total_pnl": 0,
            "avg_pnl": 0,
            "avg_winner": 0,
            "avg_loser": 0,
            "largest_win": 0,
            "largest_loss": 0,
            "total_volume": 0,
        }

    # Single pass through all trades to calculate multiple metrics
    total_trades = len(trades)
    winning_trades = 0
    losing_trades = 0
    total_pnl = 0.0
    total_winner_pnl = 0.0
    total_loser_pnl = 0.0
    largest_win = float('-inf')
    largest_loss = float('inf')
    total_volume = 0
    
    # For drawdown calculation
    cumulative_pnl = []
    running_total = 0.0

    for t in trades:
        pnl = t.get("pnl_usd", 0)
        total_pnl += pnl
        total_volume += t.get("position_size", 0)
        
        # Track cumulative for drawdown
        running_total += pnl
        cumulative_pnl.append(running_total)
        
        # Update extremes
        if pnl > largest_win:
            largest_win = pnl
        if pnl < largest_loss:
            largest_loss = pnl
        
        # Categorize winners/losers
        if pnl > 0:
            winning_trades += 1
            total_winner_pnl += pnl
        elif pnl < 0:
            losing_trades += 1
            total_loser_pnl += pnl

    # Calculate derived statistics
    win_rate = (winning_trades / total_trades * 100) if total_trades > 0 else 0
    avg_pnl = total_pnl / total_trades if total_trades > 0 else 0
    avg_winner = total_winner_pnl / winning_trades if winning_trades > 0 else 0
    avg_loser = total_loser_pnl / losing_trades if losing_trades > 0 else 0

    # Calculate max drawdown efficiently (start peak at 0 for proper drawdown calculation)
    max_drawdown = 0
    if cumulative_pnl:
        peak = 0
        for value in cumulative_pnl:
            if value > peak:
                peak = value
            drawdown = value - peak
            if drawdown < max_drawdown:
                max_drawdown = drawdown

    # Handle edge cases for extremes
    if largest_win == float('-inf'):
        largest_win = 0
    if largest_loss == float('inf'):
        largest_loss = 0

    return {
        "total_trades": total_trades,
        "winning_trades": winning_trades,
        "losing_trades": losing_trades,
        "win_rate": round(win_rate, 2),
        "total_pnl": round(total_pnl, 2),
        "avg_pnl": round(avg_pnl, 2),
        "avg_winner": round(avg_winner, 2),
        "avg_loser": round(avg_loser, 2),
        "largest_win": round(largest_win, 2),
        "largest_loss": round(largest_loss, 2),
        "total_volume": int(total_volume),
        "max_drawdown": round(max_drawdown, 2),
        "profit_factor": round(abs(avg_winner / avg_loser), 2) if avg_loser != 0 else 0,
    }


def main():
    """Main execution function"""
    print("Starting trade parsing...")

    # Find all trade markdown files in both locations:
    # 1. Legacy location: trades/*.md
    # 2. New location: index.directory/SFTi.Tradez/week.*/**.md (supports both week.XXX and week.YYYY.WW formats)
    trade_files = []

    # Check legacy trades/ directory
    legacy_files = glob.glob("trades/*.md")
    if legacy_files:
        print(f"Found {len(legacy_files)} legacy trade file(s) in trades/")
        trade_files.extend(legacy_files)

    # Check new index.directory/SFTi.Tradez structure (supports week.XXX and week.YYYY.WW patterns)
    sfti_tradez_pattern = "index.directory/SFTi.Tradez/week.*/*.md"
    sfti_files = glob.glob(sfti_tradez_pattern)
    # Filter out README files
    sfti_files = [f for f in sfti_files if not f.endswith("README.md")]
    if sfti_files:
        print(f"Found {len(sfti_files)} trade file(s) in index.directory/SFTi.Tradez/")
        trade_files.extend(sfti_files)

    # Remove duplicates
    trade_files = list(set(trade_files))

    if not trade_files:
        print(
            "No trade files found in trades/ or index.directory/SFTi.Tradez/ directories"
        )
        # Create empty index
        output = {
            "trades": [],
            "statistics": calculate_statistics([]),
            "generated_at": datetime.now().isoformat(),
            "version": "1.0",
        }
    else:
        print(f"Found {len(trade_files)} total trade file(s)")

        # Parse all trade files
        trades = []
        for filepath in trade_files:
            print(f"Parsing {filepath}...")
            trade_data = parse_trade_file(filepath)
            if trade_data:
                trades.append(trade_data)

        print(f"Successfully parsed {len(trades)} trade(s)")

        # Sort trades by trade number
        trades.sort(key=lambda x: x.get("trade_number", 0))

        # Calculate statistics
        stats = calculate_statistics(trades)

        # Generate output
        output = {
            "trades": trades,
            "statistics": stats,
            "generated_at": datetime.now().isoformat(),
            "version": "1.0",
        }

    # Write JSON index
    output_file = "index.directory/trades-index.json"
    with open(output_file, "w", encoding="utf-8") as f:
        json.dump(output, f, indent=2, ensure_ascii=False)

    print(f"Trade index written to {output_file}")
    print(f"Total trades: {output['statistics']['total_trades']}")
    print(f"Win rate: {output['statistics']['win_rate']}%")
    print(f"Total P&L: ${output['statistics']['total_pnl']}")


if __name__ == "__main__":
    main()
