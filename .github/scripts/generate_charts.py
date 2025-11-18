#!/usr/bin/env python3
"""
Generate Charts Script
Generates equity curve data in Chart.js compatible JSON format
and creates a static chart image using matplotlib (if available)
"""

import json
import os
from datetime import datetime, timedelta
from collections import defaultdict
from globals_utils import setup_imports, ensure_directory, save_json_file

# Setup imports
setup_imports(__file__)
from utils import load_trades_index, load_account_config

# Try to import matplotlib, but don't fail if it's not available
try:
    import matplotlib

    matplotlib.use("Agg")  # Use non-interactive backend
    import matplotlib.pyplot as plt
    import matplotlib.dates as mdates

    MATPLOTLIB_AVAILABLE = True
except ImportError:
    MATPLOTLIB_AVAILABLE = False
    print("Note: matplotlib not available, skipping static chart generation")

# Standard trading session order for time of day performance
TRADING_SESSION_ORDER = [
    "Pre-Market",
    "Morning",
    "Midday",
    "Afternoon",
    "After-Hours",
    "Extended Hours"
]


def generate_equity_curve_data(trades):
    """
    Generate equity curve data from trades

    Args:
        trades (list): List of trade dictionaries sorted by date

    Returns:
        dict: Chart.js compatible data structure
    """
    if not trades:
        return {
            "labels": [],
            "datasets": [
                {
                    "label": "Equity Curve",
                    "data": [],
                    "borderColor": "#00ff88",
                    "backgroundColor": "rgba(0, 255, 136, 0.1)",
                    "tension": 0.4,
                }
            ],
        }

    # Sort trades by exit date
    sorted_trades = sorted(
        trades, key=lambda t: t.get("exit_date", t.get("entry_date", ""))
    )

    # Calculate cumulative P&L
    labels = []
    cumulative_pnl = []
    running_total = 0

    for trade in sorted_trades:
        pnl = trade.get("pnl_usd", 0)
        running_total += pnl

        # Use exit date for the equity point
        date_str = trade.get("exit_date", trade.get("entry_date", ""))
        try:
            date_obj = datetime.fromisoformat(str(date_str))
            labels.append(date_obj.strftime("%Y-%m-%d"))
        except (ValueError, TypeError):
            labels.append(date_str)

        cumulative_pnl.append(round(running_total, 2))

    # Chart.js format
    chartjs_data = {
        "labels": labels,
        "datasets": [
            {
                "label": "Equity Curve",
                "data": cumulative_pnl,
                "borderColor": "#00ff88",
                "backgroundColor": "rgba(0, 255, 136, 0.1)",
                "fill": True,
                "tension": 0.4,
                "pointRadius": 4,
                "pointHoverRadius": 6,
                "pointBackgroundColor": "#00ff88",
                "pointBorderColor": "#0a0e27",
                "pointBorderWidth": 2,
            }
        ],
    }

    return chartjs_data


def generate_static_chart(
    trades, output_path="index.directory/assets/charts/equity-curve.png"
):
    """
    Generate a static equity curve image using matplotlib

    Args:
        trades (list): List of trade dictionaries
        output_path (str): Output file path for the chart
    """
    if not MATPLOTLIB_AVAILABLE:
        print("Skipping static chart generation (matplotlib not available)")
        return

    if not trades:
        print("No trades to chart")
        return

    # Sort trades by exit date
    sorted_trades = sorted(
        trades, key=lambda t: t.get("exit_date", t.get("entry_date", ""))
    )

    # Calculate cumulative P&L
    dates = []
    cumulative_pnl = []
    running_total = 0

    for trade in sorted_trades:
        pnl = trade.get("pnl_usd", 0)
        running_total += pnl

        date_str = trade.get("exit_date", trade.get("entry_date", ""))
        try:
            date_obj = datetime.fromisoformat(str(date_str))
            dates.append(date_obj)
            cumulative_pnl.append(running_total)
        except (ValueError, TypeError):
            print(f"Warning: Could not parse date {date_str}")
            continue

    if not dates:
        print("No valid dates found for charting")
        return

    # Create the plot with dark theme
    plt.style.use("dark_background")
    fig, ax = plt.subplots(figsize=(12, 6))

    # Plot the equity curve
    ax.plot(
        dates, cumulative_pnl, color="#00ff88", linewidth=2, marker="o", markersize=4
    )
    ax.fill_between(dates, cumulative_pnl, alpha=0.2, color="#00ff88")

    # Add a zero line
    ax.axhline(y=0, color="#ff4757", linestyle="--", alpha=0.5, linewidth=1)

    # Formatting
    ax.set_title(
        "Equity Curve", fontsize=16, fontweight="bold", color="#00ff88", pad=20
    )
    ax.set_xlabel("Date", fontsize=12, color="#e4e4e7")
    ax.set_ylabel("Cumulative P&L ($)", fontsize=12, color="#e4e4e7")

    # Format x-axis dates
    ax.xaxis.set_major_formatter(mdates.DateFormatter("%m/%d"))
    ax.xaxis.set_major_locator(mdates.AutoDateLocator())
    plt.xticks(rotation=45, ha="right")

    # Grid
    ax.grid(True, alpha=0.2, color="#a1a1aa")

    # Style
    ax.spines["top"].set_visible(False)
    ax.spines["right"].set_visible(False)
    ax.spines["left"].set_color("#a1a1aa")
    ax.spines["bottom"].set_color("#a1a1aa")
    ax.tick_params(colors="#e4e4e7")

    # Set background color
    fig.patch.set_facecolor("#0a0e27")
    ax.set_facecolor("#0f1429")

    # Tight layout
    plt.tight_layout()

    # Ensure output directory exists
    ensure_directory(os.path.dirname(output_path))

    # Save the chart
    plt.savefig(output_path, dpi=150, facecolor="#0a0e27", edgecolor="none")
    plt.close()

    print(f"Static chart saved to {output_path}")


def generate_trade_distribution_chart(
    trades, output_path="index.directory/assets/charts/trade-distribution.png"
):
    """
    Generate a bar chart showing P&L distribution

    Args:
        trades (list): List of trade dictionaries
        output_path (str): Output file path for the chart
    """
    if not MATPLOTLIB_AVAILABLE:
        print("Skipping trade distribution chart generation (matplotlib not available)")
        return

    if not trades:
        return

    # Get P&L values
    pnls = [t.get("pnl_usd", 0) for t in trades]
    trade_numbers = [f"#{t.get('trade_number', i)}" for i, t in enumerate(trades, 1)]

    # Create the plot
    plt.style.use("dark_background")
    fig, ax = plt.subplots(figsize=(14, 6))

    # Color bars based on positive/negative
    colors = ["#00ff88" if pnl >= 0 else "#ff4757" for pnl in pnls]

    # Plot bars
    bars = ax.bar(
        trade_numbers, pnls, color=colors, alpha=0.8, edgecolor="#0a0e27", linewidth=1
    )

    # Add a zero line
    ax.axhline(y=0, color="#ffffff", linestyle="-", alpha=0.5, linewidth=1)

    # Formatting
    ax.set_title(
        "Trade P&L Distribution",
        fontsize=16,
        fontweight="bold",
        color="#00ff88",
        pad=20,
    )
    ax.set_xlabel("Trade Number", fontsize=12, color="#e4e4e7")
    ax.set_ylabel("P&L ($)", fontsize=12, color="#e4e4e7")

    # Rotate x-axis labels if many trades
    if len(trade_numbers) > 10:
        plt.xticks(rotation=45, ha="right")

    # Grid
    ax.grid(True, alpha=0.2, axis="y", color="#a1a1aa")

    # Style
    ax.spines["top"].set_visible(False)
    ax.spines["right"].set_visible(False)
    ax.spines["left"].set_color("#a1a1aa")
    ax.spines["bottom"].set_color("#a1a1aa")
    ax.tick_params(colors="#e4e4e7")

    # Set background color
    fig.patch.set_facecolor("#0a0e27")
    ax.set_facecolor("#0f1429")

    # Tight layout
    plt.tight_layout()

    # Ensure output directory exists
    ensure_directory(os.path.dirname(output_path))

    # Save the chart
    plt.savefig(output_path, dpi=150, facecolor="#0a0e27", edgecolor="none")
    plt.close()

    print(f"Distribution chart saved to {output_path}")


def generate_win_loss_ratio_by_strategy_data(trades):
    """
    Generate win/loss ratio by strategy data in Chart.js format

    Args:
        trades (list): List of trade dictionaries

    Returns:
        dict: Chart.js compatible data structure
    """
    if not trades:
        return {
            "labels": [],
            "datasets": [
                {"label": "Wins", "data": [], "backgroundColor": "#00ff88"},
                {"label": "Losses", "data": [], "backgroundColor": "#ff4757"}
            ],
        }

    # Aggregate by strategy
    strategy_stats = {}

    for trade in trades:
        strategy = trade.get("strategy", "Unclassified")
        pnl = trade.get("pnl_usd", 0)

        if strategy not in strategy_stats:
            strategy_stats[strategy] = {"wins": 0, "losses": 0}

        if pnl > 0:
            strategy_stats[strategy]["wins"] += 1
        elif pnl < 0:
            strategy_stats[strategy]["losses"] += 1

    # Sort by total trades (descending)
    sorted_strategies = sorted(
        strategy_stats.items(), 
        key=lambda x: x[1]["wins"] + x[1]["losses"], 
        reverse=True
    )

    # Prepare data
    labels = []
    wins = []
    losses = []

    for strategy, stats in sorted_strategies:
        labels.append(strategy)
        wins.append(stats["wins"])
        losses.append(stats["losses"])

    return {
        "labels": labels,
        "datasets": [
            {
                "label": "Wins",
                "data": wins,
                "backgroundColor": "#00ff88",
                "borderColor": "#00ff88",
                "borderWidth": 2,
            },
            {
                "label": "Losses",
                "data": losses,
                "backgroundColor": "#ff4757",
                "borderColor": "#ff4757",
                "borderWidth": 2,
            }
        ],
    }


def generate_performance_by_day_data(trades):
    """
    Generate performance by day of week data in Chart.js format

    Args:
        trades (list): List of trade dictionaries

    Returns:
        dict: Chart.js compatible data structure
    """
    if not trades:
        return {
            "labels": [],
            "datasets": [{"label": "Average P&L", "data": [], "backgroundColor": []}],
        }

    # Initialize day statistics
    days = [
        "Monday",
        "Tuesday",
        "Wednesday",
        "Thursday",
        "Friday",
        "Saturday",
        "Sunday",
    ]
    day_stats = {day: {"total_pnl": 0, "count": 0} for day in days}

    # Aggregate by day of week
    for trade in trades:
        exit_date_str = trade.get("exit_date", trade.get("entry_date", ""))
        try:
            date_obj = datetime.fromisoformat(str(exit_date_str))
            day_name = date_obj.strftime("%A")
            pnl = trade.get("pnl_usd", 0)

            day_stats[day_name]["total_pnl"] += pnl
            day_stats[day_name]["count"] += 1
        except (ValueError, TypeError):
            continue

    # Calculate averages
    labels = []
    avg_pnls = []
    colors = []

    for day in days:
        if day_stats[day]["count"] > 0:
            labels.append(day)
            avg_pnl = day_stats[day]["total_pnl"] / day_stats[day]["count"]
            avg_pnls.append(round(avg_pnl, 2))
            colors.append("#00ff88" if avg_pnl >= 0 else "#ff4757")

    return {
        "labels": labels,
        "datasets": [
            {
                "label": "Average P&L ($)",
                "data": avg_pnls,
                "backgroundColor": colors,
                "borderColor": colors,
                "borderWidth": 2,
            }
        ],
    }


def generate_ticker_performance_data(trades):
    """
    Generate performance by ticker data in Chart.js format

    Args:
        trades (list): List of trade dictionaries

    Returns:
        dict: Chart.js compatible data structure
    """
    if not trades:
        return {
            "labels": [],
            "datasets": [{"label": "Total P&L", "data": [], "backgroundColor": []}],
        }

    # Aggregate by ticker
    ticker_stats = {}

    for trade in trades:
        ticker = trade.get("ticker", "UNKNOWN")
        pnl = trade.get("pnl_usd", 0)

        if ticker not in ticker_stats:
            ticker_stats[ticker] = {"total_pnl": 0, "count": 0}

        ticker_stats[ticker]["total_pnl"] += pnl
        ticker_stats[ticker]["count"] += 1

    # Sort by total P&L (descending)
    sorted_tickers = sorted(
        ticker_stats.items(), key=lambda x: x[1]["total_pnl"], reverse=True
    )

    # Prepare data
    labels = []
    total_pnls = []
    colors = []

    for ticker, stats in sorted_tickers[:20]:  # Top 20 tickers
        labels.append(ticker)
        total_pnl = stats["total_pnl"]
        total_pnls.append(round(total_pnl, 2))
        colors.append("#00ff88" if total_pnl >= 0 else "#ff4757")

    return {
        "labels": labels,
        "datasets": [
            {
                "label": "Total P&L ($)",
                "data": total_pnls,
                "backgroundColor": colors,
                "borderColor": colors,
                "borderWidth": 2,
            }
        ],
    }


def generate_time_of_day_performance_data(trades):
    """
    Generate time of day performance data using session_tags in Chart.js format

    Args:
        trades (list): List of trade dictionaries

    Returns:
        dict: Chart.js compatible data structure
    """
    if not trades:
        return {
            "labels": [],
            "datasets": [{"label": "Average P&L", "data": [], "backgroundColor": []}],
        }

    # Aggregate by session tag
    session_stats = {}

    for trade in trades:
        # session_tags is an array, take the first one
        session_tags = trade.get("session_tags", [])
        
        if isinstance(session_tags, list) and len(session_tags) > 0:
            session = session_tags[0]
        else:
            session = "Unclassified"

        pnl = trade.get("pnl_usd", 0)

        if session not in session_stats:
            session_stats[session] = {"total_pnl": 0, "count": 0}

        session_stats[session]["total_pnl"] += pnl
        session_stats[session]["count"] += 1

    # Sort by standard trading session order (module-level constant)
    existing_sessions = [s for s in TRADING_SESSION_ORDER if s in session_stats]
    
    # Add any other sessions not in the standard order
    other_sessions = sorted([s for s in session_stats.keys() if s not in TRADING_SESSION_ORDER])
    all_sessions = existing_sessions + other_sessions

    # Prepare data
    labels = []
    avg_pnls = []
    colors = []

    for session in all_sessions:
        stats = session_stats[session]
        if stats["count"] == 0:
            continue  # Skip sessions with zero trades
        labels.append(session)
        avg_pnl = stats["total_pnl"] / stats["count"]
        avg_pnls.append(round(avg_pnl, 2))
        colors.append("#00ff88" if avg_pnl >= 0 else "#ff4757")

    return {
        "labels": labels,
        "datasets": [
            {
                "label": "Average P&L ($)",
                "data": avg_pnls,
                "backgroundColor": colors,
                "borderColor": colors,
                "borderWidth": 2,
            }
        ],
    }


def format_date_label(date, timeframe, interval=None):
    """
    Format a date object into a label string based on the timeframe and interval
    
    Args:
        date (datetime): The date to format
        timeframe (str): The timeframe (day, week, month, quarter, year, 5year)
        interval (str): Optional interval override (30min, daily, weekly, monthly, quarterly, yearly)
    
    Returns:
        str: Formatted date label
    """
    # Use interval if provided, otherwise use default for timeframe
    if interval == "30min":
        return date.strftime("%H:%M")
    elif interval == "daily":
        return date.strftime("%m/%d")
    elif interval == "weekly":
        return date.strftime("W%W %m/%d")
    elif interval == "monthly":
        return date.strftime("%b %Y")
    elif interval == "quarterly":
        return date.strftime("%Y Q") + str((date.month - 1) // 3 + 1)
    elif interval == "yearly":
        return date.strftime("%Y")
    
    # Default formatting based on timeframe
    if timeframe == "day":
        # For day timeframe, show time in HH:MM format, or date if time is midnight
        return date.strftime("%H:%M") if (date.hour != 0 or date.minute != 0) else date.strftime("%m/%d")
    elif timeframe == "week":
        return date.strftime("%a %m/%d")
    elif timeframe == "month":
        return date.strftime("%m/%d")
    elif timeframe == "quarter":
        return date.strftime("%m/%d")
    elif timeframe == "year":
        return date.strftime("%b %Y")
    elif timeframe == "5year":
        return date.strftime("%Y Q") + str((date.month - 1) // 3 + 1)
    else:
        return date.strftime("%Y-%m-%d")


def get_timeframe_range(end_date, timeframe):
    """
    Calculate the start date for a given timeframe based on the end date
    
    Args:
        end_date (datetime): The most recent trade date (end of range)
        timeframe (str): The timeframe (day, week, month, quarter, year, 5year)
    
    Returns:
        datetime: The start date for the timeframe
    """
    
    if timeframe == "day":
        # Last 24 hours
        return end_date - timedelta(hours=24)
    elif timeframe == "week":
        # Last 7 days
        return end_date - timedelta(days=7)
    elif timeframe == "month":
        # Last 30 days
        return end_date - timedelta(days=30)
    elif timeframe == "quarter":
        # Last 90 days (3 months)
        return end_date - timedelta(days=90)
    elif timeframe == "year":
        # Last 365 days
        return end_date - timedelta(days=365)
    elif timeframe == "5year":
        # Last 1825 days (5 years)
        return end_date - timedelta(days=1825)
    else:
        return end_date - timedelta(days=30)


def get_default_interval(timeframe):
    """
    Get the default data point interval for a timeframe
    
    Args:
        timeframe (str): The timeframe (day, week, month, quarter, year, 5year)
    
    Returns:
        str: The default interval (30min, daily, weekly, monthly, quarterly, yearly)
    """
    if timeframe == "day":
        return "30min"
    elif timeframe == "week":
        return "30min"  # Default, can be toggled to daily
    elif timeframe == "month":
        return "daily"  # Default, can be toggled to weekly
    elif timeframe == "quarter":
        return "weekly"  # Default, can be toggled to monthly
    elif timeframe == "year":
        return "weekly"  # Default, can be toggled to monthly or quarterly
    elif timeframe == "5year":
        return "quarterly"  # Default, can be toggled to yearly
    else:
        return "daily"


def filter_and_aggregate_by_timeframe(dates, values, timeframe, interval, end_date, base_value):
    """
    Filter data to timeframe range and aggregate by interval
    
    Args:
        dates (list): List of datetime objects for all trades
        values (list): List of values corresponding to each date
        timeframe (str): The timeframe to filter (day, week, month, quarter, year, 5year)
        interval (str): The data point interval (30min, daily, weekly, monthly, quarterly, yearly)
        end_date (datetime): The most recent trade date (end of range)
        base_value (float): Starting value (before any trades)
    
    Returns:
        tuple: (labels, data) filtered and aggregated
    """
    from datetime import timedelta
    
    # Calculate start date for timeframe
    start_date = get_timeframe_range(end_date, timeframe)
    
    # Filter trades within the timeframe range
    filtered_dates = []
    filtered_values = []
    for date, value in zip(dates, values):
        if start_date <= date <= end_date:
            filtered_dates.append(date)
            filtered_values.append(value)
    
    if not filtered_dates:
        # No trades in this timeframe, return just the base value
        start_label = format_date_label(start_date, timeframe, interval)
        end_label = format_date_label(end_date, timeframe, interval)
        return ([start_label, end_label], [base_value, base_value])
    
    # Determine aggregation bucket size based on interval
    def get_bucket_key(date, interval):
        """
        Returns a bucket key (datetime object) for the given date, based on the specified interval.
        
        Args:
            date (datetime): The datetime object to bucket.
            interval (str): The interval type. Supported values:
                - "30min": Buckets by 30-minute intervals. Rounds down to the nearest 30 minutes.
                - "daily": Buckets by day. Sets time to midnight.
                - "weekly": Buckets by week. Sets to the Monday of the week at midnight.
                - "monthly": Buckets by month. Sets to the first day of the month at midnight.
                - "quarterly": Buckets by quarter. Sets to the first day of the quarter at midnight.
                - "yearly": Buckets by year. Sets to January 1st at midnight.
                - Any other value: Defaults to daily bucketing (midnight).
        
        Returns:
            datetime: The bucket key representing the start of the interval containing the input date.
        
        Bucketing logic:
            - "30min": Rounds down to the nearest 30-minute mark (minute = 0 or 30, seconds and microseconds set to 0).
            - "daily": Sets hour, minute, second, and microsecond to 0.
            - "weekly": Sets to the Monday of the week (weekday 0), hour, minute, second, and microsecond to 0.
            - "monthly": Sets day to 1, hour, minute, second, and microsecond to 0.
            - "quarterly": Sets month to the first month of the quarter (1, 4, 7, 10), day to 1, hour, minute, second, and microsecond to 0.
            - "yearly": Sets month to 1, day to 1, hour, minute, second, and microsecond to 0.
            - Default: Sets hour, minute, second, and microsecond to 0 (same as "daily").
        """
        if interval == "30min":
            # Round down to nearest 30 minutes
            return date.replace(minute=(date.minute // 30) * 30, second=0, microsecond=0)
        elif interval == "daily":
            return date.replace(hour=0, minute=0, second=0, microsecond=0)
        elif interval == "weekly":
            # Start of week (Monday)
            days_since_monday = date.weekday()
            return (date - timedelta(days=days_since_monday)).replace(hour=0, minute=0, second=0, microsecond=0)
        elif interval == "monthly":
            return date.replace(day=1, hour=0, minute=0, second=0, microsecond=0)
        elif interval == "quarterly":
            # Start of quarter
            quarter_month = ((date.month - 1) // 3) * 3 + 1
            return date.replace(month=quarter_month, day=1, hour=0, minute=0, second=0, microsecond=0)
        elif interval == "yearly":
            return date.replace(month=1, day=1, hour=0, minute=0, second=0, microsecond=0)
        else:
            return date.replace(hour=0, minute=0, second=0, microsecond=0)
    
    # Aggregate by bucket
    aggregated = defaultdict(lambda: {"dates": [], "values": []})
    
    for date, value in zip(filtered_dates, filtered_values):
        bucket = get_bucket_key(date, interval)
        aggregated[bucket]["dates"].append(date)
        aggregated[bucket]["values"].append(value)
    
    # Sort buckets chronologically
    sorted_buckets = sorted(aggregated.keys())
    
    # Take the last value for each bucket (end of period value)
    labels = []
    data = []
    
    # Add starting point if needed
    first_bucket = sorted_buckets[0] if sorted_buckets else end_date
    if sorted_buckets and first_bucket > start_date:
        # Add a point at the start with base value
        labels.append(format_date_label(start_date, timeframe, interval))
        data.append(base_value)
    
    # Add aggregated data points
    for bucket in sorted_buckets:
        # Use the last value in this bucket
        last_value = aggregated[bucket]["values"][-1]
        labels.append(format_date_label(bucket, timeframe, interval))
        data.append(last_value)
    
    return (labels, data)


def parse_trade_datetime(trade):
    """
    Parse trade exit datetime from trade dictionary, combining date and time fields
    
    Args:
        trade (dict): Trade dictionary with exit_date, exit_time (or entry_date, entry_time)
    
    Returns:
        datetime: Parsed datetime object, or None if parsing fails
    """
    # Try exit date/time first
    date_str = trade.get("exit_date", trade.get("entry_date", ""))
    time_str = trade.get("exit_time", trade.get("entry_time", ""))
    
    if not date_str:
        return None
    
    try:
        # Combine date and time if both are available
        if time_str:
            # Validate and handle time string format
            colon_count = time_str.count(':')
            if colon_count == 1:
                # HH:MM format - append seconds
                datetime_str = f"{date_str}T{time_str}:00"
            elif colon_count == 2:
                # HH:MM:SS format - use as is
                datetime_str = f"{date_str}T{time_str}"
            else:
                # Invalid format - treat as date only
                datetime_str = str(date_str)
        else:
            datetime_str = str(date_str)
        
        return datetime.fromisoformat(datetime_str)
    except (ValueError, TypeError):
        return None


def generate_portfolio_value_charts(trades, account_config):
    """
    Generate portfolio value charts for all timeframes with proper time range filtering
    Portfolio Value = Starting Balance + Deposits - Withdrawals + Cumulative P&L
    
    For 'day' timeframe: Shows portfolio value progression for trades in the last 24 hours only,
                         starting from actual portfolio value at the beginning of that period
    For other timeframes: Shows cumulative portfolio value progression from all trades
    
    Each timeframe shows distinct time ranges:
    - Day: Last 24 hours, 30-min intervals - INTRADAY VALUES ONLY
    - Week: Last 7 days, 30-min or daily intervals
    - Month: Last 30 days, daily or weekly intervals
    - Quarter: Last 90 days, weekly or monthly intervals
    - Year: Last 365 days, weekly/monthly/quarterly intervals
    - 5 Year: Last 1825 days, quarterly or yearly intervals
    
    Args:
        trades (list): List of trade dictionaries
        account_config (dict): Account configuration with starting balance, deposits, withdrawals
    """
    starting_balance = account_config.get("starting_balance", 0)
    deposits = account_config.get("deposits", [])
    withdrawals = account_config.get("withdrawals", [])
    
    # Calculate total deposits and withdrawals
    total_deposits = sum(d.get("amount", 0) for d in deposits)
    total_withdrawals = sum(w.get("amount", 0) for w in withdrawals)
    
    # Sort trades by date and time, filtering out trades with invalid dates
    sorted_trades = []
    for trade in trades:
        if parse_trade_datetime(trade):
            sorted_trades.append(trade)
    
    sorted_trades.sort(key=parse_trade_datetime)
    
    # Calculate cumulative P&L at each trade with dates
    trade_dates = []
    portfolio_values = []
    cumulative_pnl = 0
    
    base_value = starting_balance + total_deposits - total_withdrawals
    
    for trade in sorted_trades:
        pnl = trade.get("pnl_usd", 0)
        cumulative_pnl += pnl
        
        date_obj = parse_trade_datetime(trade)
        if date_obj:
            trade_dates.append(date_obj)
            portfolio_values.append(base_value + cumulative_pnl)
    
    # Determine end date (most recent trade or today)
    if trade_dates:
        end_date = max(trade_dates)
    else:
        end_date = datetime.now()
    
    # Generate data for each timeframe with proper filtering
    def create_chart_data(dates, values, timeframe, interval, end_date, base_value):
        labels, data = filter_and_aggregate_by_timeframe(
            dates, values, timeframe, interval, end_date, base_value
        )
        
        return {
            "labels": labels,
            "datasets": [{
                "label": "Portfolio Value",
                "data": data,
                "borderColor": "#00ff88",
                "backgroundColor": "rgba(0, 255, 136, 0.1)",
                "fill": True,
                "tension": 0.4,
                "pointRadius": 4,
                "pointHoverRadius": 7,
                "pointBackgroundColor": "#00ff88",
                "pointBorderColor": "#0a0e27",
                "pointBorderWidth": 2,
            }]
        }
    
    # Special handling for 'day' timeframe - show only today's portfolio progression
    def create_day_chart_data(sorted_trades, end_date, base_value):
        """
        For day timeframe, show portfolio value progression during the last 24 hours,
        starting from actual portfolio value at the beginning of that period.
        """
        start_date = end_date - timedelta(hours=24)
        
        # Filter trades within the day range
        day_trades = [t for t in sorted_trades if parse_trade_datetime(t) and start_date <= parse_trade_datetime(t) <= end_date]
        
        # Calculate portfolio value at start of day
        cumulative_pnl_before_day = 0
        for trade in sorted_trades:
            trade_date = parse_trade_datetime(trade)
            if trade_date and trade_date < start_date:
                cumulative_pnl_before_day += trade.get("pnl_usd", 0)
        
        portfolio_value_at_day_start = base_value + cumulative_pnl_before_day
        
        if not day_trades:
            # No trades today, return flat line at current portfolio value
            interval = get_default_interval("day")
            start_label = format_date_label(start_date, "day", interval)
            end_label = format_date_label(end_date, "day", interval)
            return {
                "labels": [start_label, end_label],
                "datasets": [{
                    "label": "Portfolio Value",
                    "data": [portfolio_value_at_day_start, portfolio_value_at_day_start],
                    "borderColor": "#00ff88",
                    "backgroundColor": "rgba(0, 255, 136, 0.1)",
                    "fill": True,
                    "tension": 0.4,
                    "pointRadius": 4,
                    "pointHoverRadius": 7,
                    "pointBackgroundColor": "#00ff88",
                    "pointBorderColor": "#0a0e27",
                    "pointBorderWidth": 2,
                }]
            }
        
        # Calculate portfolio value at each trade during the day
        day_trade_dates = []
        day_portfolio_values = []
        day_cumulative_pnl = 0
        
        for trade in day_trades:
            pnl = trade.get("pnl_usd", 0)
            day_cumulative_pnl += pnl
            
            # Portfolio value = start of day value + cumulative P&L during day
            portfolio_value = portfolio_value_at_day_start + day_cumulative_pnl
            
            trade_date = parse_trade_datetime(trade)
            if trade_date:
                day_trade_dates.append(trade_date)
                day_portfolio_values.append(portfolio_value)
        
        # Aggregate by 30-minute intervals
        interval = get_default_interval("day")
        labels, data = filter_and_aggregate_by_timeframe(
            day_trade_dates, day_portfolio_values, "day", interval, end_date, portfolio_value_at_day_start
        )
        
        return {
            "labels": labels,
            "datasets": [{
                "label": "Portfolio Value",
                "data": data,
                "borderColor": "#00ff88",
                "backgroundColor": "rgba(0, 255, 136, 0.1)",
                "fill": True,
                "tension": 0.4,
                "pointRadius": 4,
                "pointHoverRadius": 7,
                "pointBackgroundColor": "#00ff88",
                "pointBorderColor": "#0a0e27",
                "pointBorderWidth": 2,
            }]
        }
    
    # Generate for each timeframe with default interval
    timeframes = ["day", "week", "month", "quarter", "year", "5year"]
    for timeframe in timeframes:
        if timeframe == "day":
            # Special handling for day timeframe
            chart_data = create_day_chart_data(sorted_trades, end_date, base_value)
        else:
            # Normal cumulative portfolio value for other timeframes
            interval = get_default_interval(timeframe)
            chart_data = create_chart_data(trade_dates, portfolio_values, timeframe, interval, end_date, base_value)
        
        output_path = f"index.directory/assets/charts/portfolio-value-{timeframe}.json"
        with open(output_path, "w", encoding="utf-8") as f:
            json.dump(chart_data, f, indent=2)
        print(f"  ✓ Portfolio value ({timeframe}) with {get_default_interval(timeframe)} interval saved")


def generate_total_return_charts(trades, account_config):
    """
    Generate total return percentage charts for all timeframes with proper time range filtering
    
    For 'day' timeframe: Shows return for trades executed in the last 24 hours only,
                         calculated as % of portfolio value at start of that period
    For other timeframes: Shows cumulative return from ALL trades as % of starting investment
    
    Each timeframe shows distinct time ranges:
    - Day: Last 24 hours, 30-min intervals - INTRADAY RETURN ONLY
    - Week: Last 7 days, 30-min or daily intervals
    - Month: Last 30 days, daily or weekly intervals
    - Quarter: Last 90 days, weekly or monthly intervals
    - Year: Last 365 days, weekly/monthly/quarterly intervals
    - 5 Year: Last 1825 days, quarterly or yearly intervals
    
    Args:
        trades (list): List of trade dictionaries
        account_config (dict): Account configuration
    """
    starting_balance = account_config.get("starting_balance", 0)
    deposits = account_config.get("deposits", [])
    withdrawals = account_config.get("withdrawals", [])
    
    total_deposits = sum(d.get("amount", 0) for d in deposits)
    total_withdrawals = sum(w.get("amount", 0) for w in withdrawals)
    
    starting_investment = starting_balance + total_deposits - total_withdrawals
    
    if starting_investment == 0:
        starting_investment = 1  # Avoid division by zero
    
    # Sort trades by date and time, filtering out trades with invalid dates
    sorted_trades = []
    for trade in trades:
        if parse_trade_datetime(trade):
            sorted_trades.append(trade)
    
    sorted_trades.sort(key=parse_trade_datetime)
    
    # Calculate return percentage at each trade
    trade_dates = []
    return_percentages = []
    cumulative_pnl = 0
    
    for trade in sorted_trades:
        pnl = trade.get("pnl_usd", 0)
        cumulative_pnl += pnl
        
        return_pct = (cumulative_pnl / starting_investment) * 100
        
        date_obj = parse_trade_datetime(trade)
        if date_obj:
            trade_dates.append(date_obj)
            return_percentages.append(return_pct)
    
    # Determine end date (most recent trade or today)
    if trade_dates:
        end_date = max(trade_dates)
    else:
        end_date = datetime.now()
    
    # Generate data for each timeframe with default interval
    def create_chart_data(dates, values, timeframe, interval, end_date):
        labels, data = filter_and_aggregate_by_timeframe(
            dates, values, timeframe, interval, end_date, 0  # Start at 0% return
        )
        
        # Round return percentages to 2 decimal places
        data = [round(v, 2) for v in data]
        
        return {
            "labels": labels,
            "datasets": [{
                "label": "Total Return %",
                "data": data,
                "borderColor": "#00d4ff",
                "backgroundColor": "rgba(0, 212, 255, 0.1)",
                "fill": True,
                "tension": 0.4,
                "pointRadius": 4,
                "pointHoverRadius": 7,
                "pointBackgroundColor": "#00d4ff",
                "pointBorderColor": "#0a0e27",
                "pointBorderWidth": 2,
            }]
        }
    
    # Special handling for 'day' timeframe - show only today's trading return
    def create_day_chart_data(sorted_trades, end_date, starting_investment):
        """
        For day timeframe, calculate return based on portfolio value at start of day,
        showing only the performance from trades executed during that day.
        """
        start_date = end_date - timedelta(hours=24)
        
        # Filter trades within the day range
        day_trades = [t for t in sorted_trades if parse_trade_datetime(t) and start_date <= parse_trade_datetime(t) <= end_date]
        
        if not day_trades:
            # No trades today, return flat line at 0%
            interval = get_default_interval("day")
            start_label = format_date_label(start_date, "day", interval)
            end_label = format_date_label(end_date, "day", interval)
            return {
                "labels": [start_label, end_label],
                "datasets": [{
                    "label": "Total Return %",
                    "data": [0, 0],
                    "borderColor": "#00d4ff",
                    "backgroundColor": "rgba(0, 212, 255, 0.1)",
                    "fill": True,
                    "tension": 0.4,
                    "pointRadius": 4,
                    "pointHoverRadius": 7,
                    "pointBackgroundColor": "#00d4ff",
                    "pointBorderColor": "#0a0e27",
                    "pointBorderWidth": 2,
                }]
            }
        
        # Calculate portfolio value at start of day (before day's trades)
        # This is starting investment + cumulative P&L from all trades before this day
        cumulative_pnl_before_day = 0
        for trade in sorted_trades:
            trade_date = parse_trade_datetime(trade)
            if trade_date and trade_date < start_date:
                cumulative_pnl_before_day += trade.get("pnl_usd", 0)
        
        portfolio_value_at_day_start = starting_investment + cumulative_pnl_before_day
        
        # Avoid division by zero
        if portfolio_value_at_day_start == 0:
            portfolio_value_at_day_start = starting_investment if starting_investment > 0 else 1
        
        # Calculate return % for each trade during the day relative to day's starting portfolio value
        day_trade_dates = []
        day_return_percentages = []
        day_cumulative_pnl = 0
        
        for trade in day_trades:
            pnl = trade.get("pnl_usd", 0)
            day_cumulative_pnl += pnl
            
            # Calculate return as % of portfolio value at start of day
            day_return_pct = (day_cumulative_pnl / portfolio_value_at_day_start) * 100
            
            trade_date = parse_trade_datetime(trade)
            if trade_date:
                day_trade_dates.append(trade_date)
                day_return_percentages.append(day_return_pct)
        
        # Aggregate by 30-minute intervals
        interval = get_default_interval("day")
        labels, data = filter_and_aggregate_by_timeframe(
            day_trade_dates, day_return_percentages, "day", interval, end_date, 0
        )
        
        # Round to 2 decimal places
        data = [round(v, 2) for v in data]
        
        return {
            "labels": labels,
            "datasets": [{
                "label": "Total Return %",
                "data": data,
                "borderColor": "#00d4ff",
                "backgroundColor": "rgba(0, 212, 255, 0.1)",
                "fill": True,
                "tension": 0.4,
                "pointRadius": 4,
                "pointHoverRadius": 7,
                "pointBackgroundColor": "#00d4ff",
                "pointBorderColor": "#0a0e27",
                "pointBorderWidth": 2,
            }]
        }
    
    # Generate for each timeframe with default interval
    timeframes = ["day", "week", "month", "quarter", "year", "5year"]
    for timeframe in timeframes:
        if timeframe == "day":
            # Special handling for day timeframe
            chart_data = create_day_chart_data(sorted_trades, end_date, starting_investment)
        else:
            # Normal cumulative return for other timeframes
            interval = get_default_interval(timeframe)
            chart_data = create_chart_data(trade_dates, return_percentages, timeframe, interval, end_date)
        
        output_path = f"index.directory/assets/charts/total-return-{timeframe}.json"
        with open(output_path, "w", encoding="utf-8") as f:
            json.dump(chart_data, f, indent=2)
        print(f"  ✓ Total return ({timeframe}) with {get_default_interval(timeframe)} interval saved")


def main():
    """Main execution function"""
    print("Generating charts...")

    # Load trades index
    index_data = load_trades_index()
    if not index_data:
        return

    trades = index_data.get("trades", [])
    
    # Load account config
    account_config = load_account_config()
    
    print(f"Processing {len(trades)} trades...")

    # Ensure output directory exists
    ensure_directory("index.directory/assets/charts")

    # Generate all Chart.js data files
    print("Generating Chart.js data files...")

    # 1. Equity Curve
    equity_data = generate_equity_curve_data(trades)
    save_json_file("index.directory/assets/charts/equity-curve-data.json", equity_data)
    print("  ✓ Equity curve data saved")

    # 2. Win/Loss Ratio by Strategy
    win_loss_ratio_data = generate_win_loss_ratio_by_strategy_data(trades)
    save_json_file("index.directory/assets/charts/win-loss-ratio-by-strategy-data.json", win_loss_ratio_data)
    print("  ✓ Win/Loss ratio by strategy data saved")

    # 3. Performance by Day
    day_data = generate_performance_by_day_data(trades)
    save_json_file("index.directory/assets/charts/performance-by-day-data.json", day_data)
    print("  ✓ Performance by day data saved")

    # 4. Ticker Performance
    ticker_data = generate_ticker_performance_data(trades)
    save_json_file("index.directory/assets/charts/ticker-performance-data.json", ticker_data)
    print("  ✓ Ticker performance data saved")
    
    # 5. Time of Day Performance
    time_of_day_data = generate_time_of_day_performance_data(trades)
    save_json_file("index.directory/assets/charts/time-of-day-performance-data.json", time_of_day_data)
    print("  ✓ Time of day performance data saved")
    
    # 6. Portfolio Value Charts (all timeframes)
    print("\nGenerating Portfolio Value charts...")
    generate_portfolio_value_charts(trades, account_config)
    
    # 7. Total Return Charts (all timeframes)
    print("\nGenerating Total Return charts...")
    generate_total_return_charts(trades, account_config)

    # Generate static charts (PNG images)
    print("\nGenerating static chart images...")
    try:
        generate_static_chart(trades)
        generate_trade_distribution_chart(trades)
        print("Static charts generated successfully")
    except Exception as e:
        print(f"Error generating static charts: {e}")
        print("Continuing without static charts...")


if __name__ == "__main__":
    main()
