#!/usr/bin/env python3
"""
Generate Week Summaries Script
Creates master.trade.md files for each week folder

This script:
1. Scans all week folders in SFTi.Tradez/
2. Aggregates trade data for each week
3. Generates a master.trade.md file with week summary
4. Includes statistics, trade list, and images

Performance Optimizations:
- Single-pass calculation for week statistics
- Efficient tracking of wins/losses without intermediate lists
- Combined calculation of totals and extremes
"""

import os
import sys
import json
import re
from pathlib import Path
from datetime import datetime
from typing import Dict, List
import yaml


def get_repo_root():
    """Get the repository root directory"""
    script_dir = Path(__file__).parent
    return script_dir.parent.parent


def parse_trade_file(file_path: Path) -> Dict:
    """
    Parse a trade markdown file and extract frontmatter

    Args:
        file_path (Path): Path to trade file

    Returns:
        Dict: Trade data from frontmatter
    """
    try:
        with open(file_path, "r", encoding="utf-8") as f:
            content = f.read()

        # Extract YAML frontmatter
        match = re.match(r"^---\s*\n(.*?)\n---\s*\n(.*)$", content, re.DOTALL)
        if not match:
            return {}

        frontmatter_text = match.group(1)
        body_text = match.group(2)

        # Parse YAML
        data = yaml.safe_load(frontmatter_text) or {}
        data["body"] = body_text.strip()

        return data
    except Exception as e:
        print(f"Error parsing {file_path}: {e}")
        return {}


def collect_week_trades(week_folder: Path) -> List[Dict]:
    """
    Collect all trades from a week folder

    Args:
        week_folder (Path): Path to week folder

    Returns:
        List[Dict]: List of trade data
    """
    trades = []

    # Find all .md files except master.trade.md
    for trade_file in week_folder.glob("*.md"):
        if trade_file.name == "master.trade.md":
            continue

        trade_data = parse_trade_file(trade_file)
        if trade_data:
            trade_data["file_name"] = trade_file.name
            trades.append(trade_data)

    # Sort by date
    trades.sort(key=lambda x: x.get("entry_date", ""))

    return trades


def calculate_week_stats(trades: List[Dict]) -> Dict:
    """
    Calculate statistics for a week

    Args:
        trades (List[Dict]): List of trade data

    Returns:
        Dict: Week statistics
    """
    if not trades:
        return {
            "total_trades": 0,
            "total_pnl": 0.0,
            "wins": 0,
            "losses": 0,
            "breakeven": 0,
            "win_rate": 0.0,
            "avg_win": 0.0,
            "avg_loss": 0.0,
            "largest_win": 0.0,
            "largest_loss": 0.0,
            "profit_factor": 0.0,
        }

    # Single-pass calculation for efficiency
    total_pnl = 0.0
    win_count = 0
    loss_count = 0
    breakeven = 0
    total_wins = 0.0
    total_losses = 0.0
    largest_win = 0.0
    largest_loss = 0.0

    for trade in trades:
        pnl = float(trade.get("pnl_usd", 0) or 0)
        total_pnl += pnl

        if pnl > 0:
            win_count += 1
            total_wins += pnl
            if pnl > largest_win:
                largest_win = pnl
        elif pnl < 0:
            loss_count += 1
            total_losses += pnl
            if pnl < largest_loss:
                largest_loss = pnl
        else:
            breakeven += 1

    total_trades = len(trades)
    win_rate = (win_count / total_trades * 100) if total_trades > 0 else 0.0

    avg_win = total_wins / win_count if win_count > 0 else 0.0
    avg_loss = total_losses / loss_count if loss_count > 0 else 0.0

    gross_profit = total_wins
    gross_loss = abs(total_losses)
    profit_factor = gross_profit / gross_loss if gross_loss > 0 else 0.0

    return {
        "total_trades": total_trades,
        "total_pnl": total_pnl,
        "wins": win_count,
        "losses": loss_count,
        "breakeven": breakeven,
        "win_rate": win_rate,
        "avg_win": avg_win,
        "avg_loss": avg_loss,
        "largest_win": largest_win,
        "largest_loss": largest_loss,
        "profit_factor": profit_factor,
        "gross_profit": gross_profit,
        "gross_loss": gross_loss,
    }


def generate_master_markdown(week_name: str, stats: Dict, trades: List[Dict]) -> str:
    """
    Generate master.trade.md content

    Args:
        week_name (str): Week identifier (e.g., "2025.01")
        stats (Dict): Week statistics
        trades (List[Dict]): List of trade data

    Returns:
        str: Markdown content
    """
    # Extract year and week number
    parts = week_name.split(".")
    if len(parts) == 2:
        year, week = parts
        title = f"Week {week}, {year}"
    else:
        title = f"Week {week_name}"

    # Generate markdown
    md = f"""# {title} - Trading Summary

## Overview

This week's trading session included **{stats['total_trades']} trades** with a total P&L of **${stats['total_pnl']:.2f}**.

## Performance Metrics

| Metric | Value |
|--------|-------|
| Total Trades | {stats['total_trades']} |
| Total P&L | ${stats['total_pnl']:.2f} |
| Win Rate | {stats['win_rate']:.1f}% |
| Wins | {stats['wins']} |
| Losses | {stats['losses']} |
| Breakeven | {stats['breakeven']} |
| Average Win | ${stats['avg_win']:.2f} |
| Average Loss | ${stats['avg_loss']:.2f} |
| Largest Win | ${stats['largest_win']:.2f} |
| Largest Loss | ${stats['largest_loss']:.2f} |
| Profit Factor | {stats['profit_factor']:.2f} |
| Gross Profit | ${stats['gross_profit']:.2f} |
| Gross Loss | ${stats['gross_loss']:.2f} |

## Trade List

"""

    # Add trade list
    for i, trade in enumerate(trades, 1):
        ticker = trade.get("ticker", "N/A")
        date = trade.get("entry_date", "N/A")
        pnl = float(trade.get("pnl_usd", 0) or 0)
        pnl_str = f"${pnl:.2f}"
        direction = trade.get("direction", "LONG")
        entry = float(trade.get("entry_price", 0) or 0)
        exit_val = float(trade.get("exit_price", 0) or 0)

        md += f"\n### {i}. {ticker} - {date}\n\n"
        md += f"- **Direction**: {direction}\n"
        md += f"- **Entry**: ${entry:.2f}\n"
        md += f"- **Exit**: ${exit_val:.2f}\n"
        md += f"- **P&L**: {pnl_str}\n"

        # Add strategy tags if available
        if trade.get("strategy_tags"):
            tags = trade["strategy_tags"]
            if isinstance(tags, list):
                md += f"- **Strategy**: {', '.join(tags)}\n"
            else:
                md += f"- **Strategy**: {tags}\n"

        # Add setup tags if available
        if trade.get("setup_tags"):
            tags = trade["setup_tags"]
            if isinstance(tags, list):
                md += f"- **Setup**: {', '.join(tags)}\n"
            else:
                md += f"- **Setup**: {tags}\n"

        # Add notes if available
        if trade.get("notes"):
            notes = trade["notes"].strip()
            if notes:
                md += f"\n**Notes**: {notes}\n"

    md += "\n\n## Weekly Reflection\n\n"
    md += "_Add your weekly reflection, lessons learned, and improvements for next week..._\n\n"

    md += "---\n\n"
    md += f"*Generated on {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}*\n"

    return md


def process_week_folder(week_folder: Path) -> bool:
    """
    Process a single week folder and generate master.trade.md

    Args:
        week_folder (Path): Path to week folder

    Returns:
        bool: True if successful
    """
    week_name = week_folder.name.replace("week.", "")
    print(f"Processing {week_folder.name}...")

    # Collect trades
    trades = collect_week_trades(week_folder)

    if not trades:
        print(f"  No trades found in {week_folder.name}")
        return False

    # Calculate statistics
    stats = calculate_week_stats(trades)

    # Generate markdown
    markdown_content = generate_master_markdown(week_name, stats, trades)

    # Write to file
    master_file = week_folder / "master.trade.md"
    try:
        with open(master_file, "w", encoding="utf-8") as f:
            f.write(markdown_content)
        print(f"  ✓ Generated master.trade.md with {len(trades)} trades")
        return True
    except Exception as e:
        print(f"  ✗ Error writing master.trade.md: {e}")
        return False


def main():
    """Main function"""
    repo_root = get_repo_root()
    trades_dir = repo_root / "index.directory" / "SFTi.Tradez"

    if not trades_dir.exists():
        print(f"Error: Trades directory not found: {trades_dir}")
        return 1

    # Find all week folders
    week_folders = sorted(
        [d for d in trades_dir.iterdir() if d.is_dir() and d.name.startswith("week.")]
    )

    if not week_folders:
        print("No week folders found")
        return 0

    print(f"Found {len(week_folders)} week folders\n")

    success_count = 0
    for week_folder in week_folders:
        if process_week_folder(week_folder):
            success_count += 1

    print(
        f"\n✓ Successfully generated {success_count}/{len(week_folders)} master.trade.md files"
    )

    return 0


if __name__ == "__main__":
    sys.exit(main())
