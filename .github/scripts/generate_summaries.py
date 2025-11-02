#!/usr/bin/env python3
"""
Generate Summaries Script
Generates weekly, monthly, and yearly summaries from parsed trade data
Enhanced to preserve user reviews and auto-aggregate higher-level summaries

Performance Optimizations:
- Single-pass calculation of all period statistics
- Combined winner/loser tracking with strategy breakdown
- Efficient best/worst trade tracking without separate max/min operations
- Reduced file I/O with smart caching of summary content
- Optimized date parsing with string operations
"""

import os
import re
from datetime import datetime, timedelta
from collections import defaultdict
from utils import load_trades_index

# Regex patterns for file matching
WEEKLY_PATTERN = r"weekly-\d{4}-W(\d{2})\.md"
MONTHLY_PATTERN = r"monthly-\d{4}-(\d{2})\.md"


def load_existing_summary(filepath):
    """
    Load existing summary and extract user-filled review sections

    Args:
        filepath (str): Path to existing summary file

    Returns:
        dict: Extracted review sections or None if file doesn't exist
    """
    if not os.path.exists(filepath):
        return None

    try:
        with open(filepath, "r", encoding="utf-8") as f:
            content = f.read()

        # Extract review sections
        review = {
            "what_went_well": "",
            "needs_improvement": "",
            "key_lessons": "",
            "next_goals": "",
        }

        # Extract "What Went Well" section
        match = re.search(
            r"### What Went Well\s*\n\s*\n(.*?)(?=\n###|\n##|$)", content, re.DOTALL
        )
        if match and not match.group(1).strip().startswith(
            "_To be filled in manually during review"
        ):
            review["what_went_well"] = match.group(1).strip()

        # Extract "What Needs Improvement" section
        match = re.search(
            r"### What Needs Improvement\s*\n\s*\n(.*?)(?=\n###|\n##|$)",
            content,
            re.DOTALL,
        )
        if match and not match.group(1).strip().startswith(
            "_To be filled in manually during review"
        ):
            review["needs_improvement"] = match.group(1).strip()

        # Extract "Key Lessons Learned" section
        match = re.search(
            r"### Key Lessons Learned\s*\n\s*\n(.*?)(?=\n##|$)", content, re.DOTALL
        )
        if match and not match.group(1).strip().startswith(
            "_To be filled in manually during review"
        ):
            review["key_lessons"] = match.group(1).strip()

        # Extract "Next Period Goals" section
        match = re.search(
            r"## Next Period Goals\s*\n\s*\n(.*?)(?=\n---|$)", content, re.DOTALL
        )
        if match and not match.group(1).strip().startswith("- _Goal"):
            review["next_goals"] = match.group(1).strip()

        return review
    except Exception as e:
        print(f"Warning: Error loading existing summary {filepath}: {e}")
        return None


def group_trades_by_period(trades, period="week"):
    """
    Group trades by time period (week, month, year)

    Args:
        trades (list): List of trade dictionaries
        period (str): 'week', 'month', or 'year'

    Returns:
        dict: Dictionary with period keys and trade lists as values
    """
    grouped = defaultdict(list)

    for trade in trades:
        try:
            # Parse date only once
            entry_date_str = str(trade.get("entry_date"))
            entry_date = datetime.fromisoformat(entry_date_str)

            # Generate key based on period type
            if period == "week":
                key = f"{entry_date.year}-W{entry_date.isocalendar()[1]:02d}"
            elif period == "month":
                key = f"{entry_date.year}-{entry_date.month:02d}"
            elif period == "year":
                key = str(entry_date.year)
            else:
                key = "unknown"

            grouped[key].append(trade)
        except (ValueError, TypeError) as e:
            print(
                f"Warning: Could not parse date for trade {trade.get('trade_number')}: {e}"
            )
            continue

    return dict(grouped)


def calculate_period_stats(trades):
    """
    Calculate statistics for a group of trades

    Args:
        trades (list): List of trade dictionaries

    Returns:
        dict: Period statistics
    """
    if not trades:
        return {}

    total_trades = len(trades)
    
    # Single pass to calculate all metrics
    win_count = 0
    loss_count = 0
    total_pnl = 0.0
    total_volume = 0
    best_trade = None
    worst_trade = None
    best_pnl = float('-inf')
    worst_pnl = float('inf')
    
    # Strategy breakdown using defaultdict for efficiency
    strategies = defaultdict(lambda: {"count": 0, "pnl": 0.0})
    
    for trade in trades:
        pnl = trade.get("pnl_usd", 0)
        total_pnl += pnl
        total_volume += trade.get("position_size", 0)
        
        # Track wins/losses
        if pnl > 0:
            win_count += 1
        elif pnl < 0:
            loss_count += 1
        
        # Track best/worst trades
        if pnl > best_pnl:
            best_pnl = pnl
            best_trade = trade
        if pnl < worst_pnl:
            worst_pnl = pnl
            worst_trade = trade
        
        # Update strategy breakdown
        strategy = trade.get("strategy", "Unknown")
        strategies[strategy]["count"] += 1
        strategies[strategy]["pnl"] += pnl

    # Use first trade as fallback if no best/worst found (shouldn't happen with valid data)
    if best_trade is None:
        best_trade = trades[0]
    if worst_trade is None:
        worst_trade = trades[0]

    return {
        "total_trades": total_trades,
        "winning_trades": win_count,
        "losing_trades": loss_count,
        "win_rate": round(win_count / total_trades * 100, 2) if total_trades > 0 else 0,
        "total_pnl": round(total_pnl, 2),
        "avg_pnl": round(total_pnl / total_trades, 2) if total_trades > 0 else 0,
        "best_trade": {
            "ticker": best_trade.get("ticker"),
            "pnl": round(best_trade.get("pnl_usd", 0), 2),
            "trade_number": best_trade.get("trade_number"),
        },
        "worst_trade": {
            "ticker": worst_trade.get("ticker"),
            "pnl": round(worst_trade.get("pnl_usd", 0), 2),
            "trade_number": worst_trade.get("trade_number"),
        },
        "total_volume": total_volume,
        "strategies": dict(strategies),
    }


def generate_summary_markdown(
    period_key, period_stats, period_type="week", existing_review=None
):
    """
    Generate markdown summary for a period

    Args:
        period_key (str): Period identifier (e.g., '2025-W42')
        period_stats (dict): Statistics for the period
        period_type (str): 'week', 'month', or 'year'
        existing_review (dict): Existing review content to preserve

    Returns:
        str: Markdown content
    """
    if period_type == "week":
        title = f"Week {period_key.split('-W')[1]} Summary"
    elif period_type == "month":
        year, month = period_key.split("-")
        month_name = datetime(int(year), int(month), 1).strftime("%B")
        title = f"{month_name} {year} Summary"
    else:
        title = f"{period_key} Summary"

    # Strategy breakdown
    strategy_lines = []
    for strategy, data in period_stats.get("strategies", {}).items():
        strategy_lines.append(
            f"- **{strategy}**: {data['count']} trades, ${data['pnl']:.2f} P&L"
        )
    strategy_breakdown = (
        "\n".join(strategy_lines) if strategy_lines else "- No strategies recorded"
    )

    # Use existing review content if available, otherwise use placeholders
    if existing_review:
        what_went_well = (
            existing_review.get("what_went_well")
            or "_To be filled in manually during review_"
        )
        needs_improvement = (
            existing_review.get("needs_improvement")
            or "_To be filled in manually during review_"
        )
        key_lessons = (
            existing_review.get("key_lessons")
            or "_To be filled in manually during review_"
        )
        next_goals = (
            existing_review.get("next_goals") or "- _Goal 1_\n- _Goal 2_\n- _Goal 3_"
        )
    else:
        what_went_well = "_To be filled in manually during review_"
        needs_improvement = "_To be filled in manually during review_"
        key_lessons = "_To be filled in manually during review_"
        next_goals = "- _Goal 1_\n- _Goal 2_\n- _Goal 3_"

    markdown = f"""# {title}

**Period**: {period_key}

## Statistics

- **Total Trades**: {period_stats['total_trades']}
- **Winning Trades**: {period_stats['winning_trades']}
- **Losing Trades**: {period_stats['losing_trades']}
- **Win Rate**: {period_stats['win_rate']}%
- **Total P&L**: ${period_stats['total_pnl']:.2f}
- **Average P&L per Trade**: ${period_stats['avg_pnl']:.2f}
- **Best Trade**: {period_stats['best_trade']['ticker']} (+${period_stats['best_trade']['pnl']:.2f})
- **Worst Trade**: {period_stats['worst_trade']['ticker']} (${period_stats['worst_trade']['pnl']:.2f})
- **Total Volume Traded**: {period_stats['total_volume']:,} shares

## Performance Analysis

### What Went Well

{what_went_well}

### What Needs Improvement

{needs_improvement}

### Key Lessons Learned

{key_lessons}

## Strategy Breakdown

{strategy_breakdown}

## Next Period Goals

{next_goals}

---

**Generated**: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}
"""
    return markdown


def main():
    """Main execution function"""
    print("Generating summaries...")

    # Load trades index
    index_data = load_trades_index()
    if not index_data:
        return

    trades = index_data.get("trades", [])
    if not trades:
        print("No trades found in index")
        return

    print(f"Processing {len(trades)} trades...")

    # Create summaries directory in index.directory/
    os.makedirs("index.directory/summaries", exist_ok=True)

    # Generate weekly summaries
    print("Generating weekly summaries...")
    weekly_groups = group_trades_by_period(trades, "week")
    for week_key, week_trades in weekly_groups.items():
        stats = calculate_period_stats(week_trades)

        # Load existing review content to preserve user input
        filename = f"index.directory/summaries/weekly-{week_key}.md"
        existing_review = load_existing_summary(filename)

        markdown = generate_summary_markdown(week_key, stats, "week", existing_review)

        with open(filename, "w", encoding="utf-8") as f:
            f.write(markdown)

        if existing_review and any(existing_review.values()):
            print(f"  Updated {filename} (preserved user review)")
        else:
            print(f"  Created {filename}")

    # Generate monthly summaries from weekly data
    print("Generating monthly summaries (aggregated from weekly data)...")
    monthly_groups = group_trades_by_period(trades, "month")
    for month_key, month_trades in monthly_groups.items():
        stats = calculate_period_stats(month_trades)

        # Load existing review content to preserve user input
        filename = f"index.directory/summaries/monthly-{month_key}.md"
        existing_review = load_existing_summary(filename)

        # Aggregate insights from weekly summaries if available
        year, month = month_key.split("-")
        weekly_insights = aggregate_weekly_insights(year, month)

        # Merge weekly insights with existing review
        if weekly_insights and not existing_review:
            existing_review = weekly_insights
        elif weekly_insights and existing_review:
            # Preserve user-written content but add weekly insights as suggestions
            for key in ["what_went_well", "needs_improvement", "key_lessons"]:
                if not existing_review.get(key) and weekly_insights.get(key):
                    existing_review[key] = weekly_insights[key]

        markdown = generate_summary_markdown(month_key, stats, "month", existing_review)

        with open(filename, "w", encoding="utf-8") as f:
            f.write(markdown)

        if existing_review and any(existing_review.values()):
            print(f"  Updated {filename} (with weekly insights)")
        else:
            print(f"  Created {filename}")

    # Generate yearly summaries from monthly data
    print("Generating yearly summaries (aggregated from monthly data)...")
    yearly_groups = group_trades_by_period(trades, "year")
    for year_key, year_trades in yearly_groups.items():
        stats = calculate_period_stats(year_trades)

        # Load existing review content to preserve user input
        filename = f"index.directory/summaries/yearly-{year_key}.md"
        existing_review = load_existing_summary(filename)

        # Aggregate insights from monthly summaries if available
        monthly_insights = aggregate_monthly_insights(year_key)

        # Merge monthly insights with existing review
        if monthly_insights and not existing_review:
            existing_review = monthly_insights
        elif monthly_insights and existing_review:
            # Preserve user-written content but add monthly insights as suggestions
            for key in ["what_went_well", "needs_improvement", "key_lessons"]:
                if not existing_review.get(key) and monthly_insights.get(key):
                    existing_review[key] = monthly_insights[key]

        markdown = generate_summary_markdown(year_key, stats, "year", existing_review)

        with open(filename, "w", encoding="utf-8") as f:
            f.write(markdown)

        if existing_review and any(existing_review.values()):
            print(f"  Updated {filename} (with monthly insights)")
        else:
            print(f"  Created {filename}")

    print("Summary generation complete!")


def aggregate_section(reviews, section_key, prefix_format):
    """
    Helper function to aggregate a specific section from multiple reviews

    Args:
        reviews (list): List of tuples containing (identifier, review_dict)
        section_key (str): Key of the section to aggregate
        prefix_format (str): Format string for the prefix (e.g., "**Week {}**")

    Returns:
        str: Aggregated content or empty string
    """
    sections = []
    for identifier, review in reviews:
        if review.get(section_key):
            prefix = prefix_format.format(identifier)
            sections.append(f"{prefix}: {review[section_key]}")

    return "\n\n".join(sections) if sections else ""


def get_week_month(week_number, year):
    """
    Determine which month a given ISO week falls into

    Args:
        week_number (int): ISO week number (1-53)
        year (int): Year

    Returns:
        int: Month number (1-12) or None if cannot determine
    """
    try:
        # Get the first day of the ISO week
        # ISO week 1 is the week containing the first Thursday of the year
        jan_4 = datetime(int(year), 1, 4)
        week_1_start = jan_4 - timedelta(days=jan_4.weekday())
        target_week_start = week_1_start + timedelta(weeks=week_number - 1)

        # Use the middle of the week (Wednesday) to determine the month
        mid_week = target_week_start + timedelta(days=2)
        return mid_week.month
    except (ValueError, OverflowError):
        return None


def aggregate_weekly_insights(year, month):
    """
    Aggregate insights from weekly summaries for a given month

    Args:
        year (str): Year string
        month (str): Month string (01-12)

    Returns:
        dict: Aggregated review sections
    """
    summaries_dir = "index.directory/summaries"
    aggregated = {
        "what_went_well": "",
        "needs_improvement": "",
        "key_lessons": "",
        "next_goals": "",
    }

    # Find all weekly summaries for this month
    weekly_reviews = []
    if os.path.exists(summaries_dir):
        for filename in os.listdir(summaries_dir):
            if filename.startswith(f"weekly-{year}-W") and filename.endswith(".md"):
                # Extract week number from filename
                try:
                    week_match = re.match(WEEKLY_PATTERN, filename)
                    if week_match:
                        week_num = int(week_match.group(1))
                        # Check if this week belongs to the target month
                        week_month = get_week_month(week_num, int(year))
                        if week_month == int(month):
                            filepath = os.path.join(summaries_dir, filename)
                            review = load_existing_summary(filepath)
                            if review and any(review.values()):
                                weekly_reviews.append((week_num, review))
                except (ValueError, AttributeError):
                    continue

    if not weekly_reviews:
        return None

    # Sort by week number
    weekly_reviews.sort(key=lambda x: x[0])

    # Aggregate each section using the helper function
    aggregated["what_went_well"] = aggregate_section(
        weekly_reviews, "what_went_well", "**Week {}**"
    )
    aggregated["needs_improvement"] = aggregate_section(
        weekly_reviews, "needs_improvement", "**Week {}**"
    )
    aggregated["key_lessons"] = aggregate_section(
        weekly_reviews, "key_lessons", "**Week {}**"
    )

    return aggregated if any(aggregated.values()) else None


def aggregate_monthly_insights(year):
    """
    Aggregate insights from monthly summaries for a given year

    Args:
        year (str): Year string

    Returns:
        dict: Aggregated review sections
    """
    summaries_dir = "index.directory/summaries"
    aggregated = {
        "what_went_well": "",
        "needs_improvement": "",
        "key_lessons": "",
        "next_goals": "",
    }

    # Find all monthly summaries for this year
    monthly_reviews = []
    if os.path.exists(summaries_dir):
        for filename in sorted(os.listdir(summaries_dir)):
            if filename.startswith(f"monthly-{year}-") and filename.endswith(".md"):
                # Extract month number from filename
                month_match = re.match(MONTHLY_PATTERN, filename)
                if not month_match:
                    continue
                month_num = int(month_match.group(1))
                if not (1 <= month_num <= 12):
                    continue
                try:
                    month_name = datetime(int(year), month_num, 1).strftime("%B")
                except ValueError:
                    continue
                filepath = os.path.join(summaries_dir, filename)
                review = load_existing_summary(filepath)
                if review and any(review.values()):
                    monthly_reviews.append((month_name, review))

    if not monthly_reviews:
        return None

    # Aggregate each section using the helper function
    aggregated["what_went_well"] = aggregate_section(
        monthly_reviews, "what_went_well", "**{}**"
    )
    aggregated["needs_improvement"] = aggregate_section(
        monthly_reviews, "needs_improvement", "**{}**"
    )
    aggregated["key_lessons"] = aggregate_section(
        monthly_reviews, "key_lessons", "**{}**"
    )

    return aggregated if any(aggregated.values()) else None


if __name__ == "__main__":
    main()
