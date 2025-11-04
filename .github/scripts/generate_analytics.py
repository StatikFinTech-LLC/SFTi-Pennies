#!/usr/bin/env python3
"""
Generate Analytics Script
Computes advanced analytics from trades data including expectancy, streaks,
per-tag aggregates, drawdown series, and profit factors.

Performance Optimizations:
- Single-pass algorithms for calculating win/loss statistics
- Reduced list comprehensions and intermediate data structures
- Optimized aggregate_by_tag() to minimize iterations
- Efficient memory usage with streaming calculations

Output: analytics-data.json
"""

import json
import os
from datetime import datetime
from typing import Dict, List, Tuple
import sys
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from utils import load_trades_index, load_account_config

# Constants
MAX_PROFIT_FACTOR = 999.99  # Used when profit factor would be infinity (all wins, no losses)


def calculate_returns_metrics(trades: List[Dict], starting_balance: float, deposits: List[Dict]) -> Dict:
    """
    Calculate percentage-based returns metrics
    
    Args:
        trades: List of trade dictionaries
        starting_balance: Initial account balance
        deposits: List of deposit records
        
    Returns:
        Dict: Returns metrics including total return %, avg return %, etc.
    """
    if not trades or starting_balance <= 0:
        return {
            "total_return_percent": 0.0,
            "avg_return_percent": 0.0,
            "max_drawdown_percent": 0.0,
            "avg_risk_percent": 0.0,
            "avg_position_size_percent": 0.0
        }
    
    # Calculate total P&L
    total_pnl = sum(t.get("pnl_usd", 0) for t in trades)
    
    # Calculate total deposits
    total_deposits = sum(d.get("amount", 0) for d in deposits)
    
    # Initial capital for returns calculation
    initial_capital = starting_balance + total_deposits
    
    # Total return % = (Total P&L / Initial Capital) * 100
    total_return_percent = (total_pnl / initial_capital * 100) if initial_capital > 0 else 0
    
    # Average return per trade as % of account
    avg_return_percent = (total_pnl / len(trades) / initial_capital * 100) if initial_capital > 0 and len(trades) > 0 else 0
    
    # Calculate max drawdown as percentage
    cumulative_pnl = []
    running_total = 0
    for trade in trades:
        running_total += trade.get("pnl_usd", 0)
        cumulative_pnl.append(running_total)
    
    peak = 0
    max_drawdown_dollars = 0
    for value in cumulative_pnl:
        if value > peak:
            peak = value
        drawdown = value - peak
        if drawdown < max_drawdown_dollars:
            max_drawdown_dollars = drawdown
    
    # Max drawdown % = (Max DD in $) / (Starting Balance + Deposits) * 100
    max_drawdown_percent = (max_drawdown_dollars / initial_capital * 100) if initial_capital > 0 else 0
    
    # Average risk per trade (as % of account at time of trade)
    # This requires tracking account balance at each trade
    avg_risk_percent = 0.0
    total_risk_percent = 0.0
    account_balance = initial_capital
    
    for trade in trades:
        pnl = trade.get("pnl_usd", 0)
        position_value = abs(trade.get("entry_price", 0) * trade.get("position_size", 0))
        
        if account_balance > 0:
            # Position size as % of account
            if position_value > 0:
                total_risk_percent += (position_value / account_balance * 100)
        
        # Update account balance for next trade
        account_balance += pnl
    
    avg_position_size_percent = total_risk_percent / len(trades) if len(trades) > 0 else 0
    
    # Calculate average risk based on actual losses
    losses = [t for t in trades if t.get("pnl_usd", 0) < 0]
    if losses:
        avg_loss = abs(sum(t.get("pnl_usd", 0) for t in losses) / len(losses))
        avg_risk_percent = (avg_loss / initial_capital * 100) if initial_capital > 0 else 0
    
    return {
        "total_return_percent": round(total_return_percent, 2),
        "avg_return_percent": round(avg_return_percent, 4),
        "max_drawdown_percent": round(max_drawdown_percent, 2),
        "avg_risk_percent": round(avg_risk_percent, 3),
        "avg_position_size_percent": round(avg_position_size_percent, 2)
    }


def calculate_expectancy(trades: List[Dict]) -> float:
    """
    Calculate expectancy (average P&L per trade)

    Expectancy = (Win% × Avg Win) - (Loss% × Avg Loss)

    Args:
        trades: List of trade dictionaries

    Returns:
        float: Expectancy value
    """
    if not trades:
        return 0.0

    # Single pass to calculate wins and losses
    total = len(trades)
    win_count = 0
    loss_count = 0
    total_wins = 0.0
    total_losses = 0.0
    
    for t in trades:
        pnl = t.get("pnl_usd", 0)
        if pnl > 0:
            win_count += 1
            total_wins += pnl
        elif pnl < 0:
            loss_count += 1
            total_losses += pnl

    win_rate = win_count / total if total > 0 else 0
    loss_rate = loss_count / total if total > 0 else 0

    avg_win = total_wins / win_count if win_count > 0 else 0
    avg_loss = abs(total_losses / loss_count) if loss_count > 0 else 0

    expectancy = (win_rate * avg_win) - (loss_rate * avg_loss)
    return round(expectancy, 2)


def calculate_profit_factor(trades: List[Dict]) -> float:
    """
    Calculate profit factor (gross profit / gross loss)

    Args:
        trades: List of trade dictionaries

    Returns:
        float: Profit factor (returns 0 if no losses to avoid Infinity)
    """
    if not trades:
        return 0.0

    # Single pass calculation
    gross_profit = 0.0
    gross_loss = 0.0
    
    for t in trades:
        pnl = t.get("pnl_usd", 0)
        if pnl > 0:
            gross_profit += pnl
        elif pnl < 0:
            gross_loss += pnl

    gross_loss = abs(gross_loss)
    
    # Return 0 if no losses (avoids Infinity in JSON)
    # This indicates perfect win rate, but profit factor is not meaningful
    if gross_loss == 0:
        # Return 0 if no profit, otherwise return MAX_PROFIT_FACTOR instead of infinity
        # to ensure JSON serialization works properly
        return 0.0 if gross_profit == 0 else MAX_PROFIT_FACTOR

    return round(gross_profit / gross_loss, 2)


def calculate_streaks(trades: List[Dict]) -> Tuple[int, int]:
    """
    Calculate max win and loss streaks

    Args:
        trades: List of trade dictionaries (sorted by date)

    Returns:
        Tuple: (max_win_streak, max_loss_streak)
    """
    if not trades:
        return 0, 0

    current_win_streak = 0
    current_loss_streak = 0
    max_win_streak = 0
    max_loss_streak = 0

    for trade in trades:
        pnl = trade.get("pnl_usd", 0)

        if pnl > 0:
            current_win_streak += 1
            current_loss_streak = 0
            max_win_streak = max(max_win_streak, current_win_streak)
        elif pnl < 0:
            current_loss_streak += 1
            current_win_streak = 0
            max_loss_streak = max(max_loss_streak, current_loss_streak)

    return max_win_streak, max_loss_streak


def calculate_drawdown_series(trades: List[Dict]) -> Dict:
    """
    Calculate drawdown series over time

    Args:
        trades: List of trade dictionaries (sorted by date)

    Returns:
        Dict: {'labels': [...], 'values': [...]}
    """
    if not trades:
        return {"labels": [], "values": []}

    labels = []
    drawdowns = []

    cumulative_pnl = []
    running_total = 0

    for trade in trades:
        pnl = trade.get("pnl_usd", 0)
        running_total += pnl
        cumulative_pnl.append(running_total)

        # Date label
        date_str = trade.get("exit_date", trade.get("entry_date", ""))
        try:
            date_obj = datetime.fromisoformat(str(date_str).split("T")[0])
            labels.append(date_obj.strftime("%m/%d"))
        except:
            labels.append(date_str)

    # Calculate drawdown from peak (start peak at 0 for proper drawdown calculation)
    peak = 0
    for value in cumulative_pnl:
        if value > peak:
            peak = value
        drawdown = value - peak
        drawdowns.append(round(drawdown, 2))

    return {"labels": labels, "values": drawdowns}


def calculate_kelly_criterion(trades: List[Dict]) -> float:
    """
    Calculate Kelly Criterion percentage

    Kelly % = W - [(1 - W) / R]
    where W = win rate, R = avg win / avg loss ratio

    Args:
        trades: List of trade dictionaries

    Returns:
        float: Kelly percentage
    """
    if not trades:
        return 0.0

    # Single pass to calculate stats
    win_count = 0
    loss_count = 0
    total_wins = 0.0
    total_losses = 0.0
    
    for t in trades:
        pnl = t.get("pnl_usd", 0)
        if pnl > 0:
            win_count += 1
            total_wins += pnl
        elif pnl < 0:
            loss_count += 1
            total_losses += pnl

    if win_count == 0 or loss_count == 0:
        return 0.0

    win_rate = win_count / len(trades)
    avg_win = total_wins / win_count
    avg_loss = abs(total_losses / loss_count)

    if avg_loss == 0:
        return 0.0

    r_ratio = avg_win / avg_loss
    kelly = win_rate - ((1 - win_rate) / r_ratio)

    return round(kelly * 100, 1)


def aggregate_by_tag(trades: List[Dict], tag_field: str) -> Dict:
    """
    Aggregate statistics by a tag field (strategy, setup, etc.)
    Handles both single-value fields (e.g., 'strategy') and array fields (e.g., 'setup_tags', 'session_tags')

    Args:
        trades: List of trade dictionaries
        tag_field: Field to group by (e.g., 'strategy', 'setup', 'session')

    Returns:
        Dict: {tag_value: {stats...}, ...}
    """
    aggregates = {}

    # Group trades by tag and calculate stats in single pass
    for trade in trades:
        tag_value = trade.get(tag_field)
        
        # Handle array/list tags - convert to string or take first element
        # Note: When tags are stored as arrays (e.g., ["Breakout", "Momentum"]),
        # we use only the first element to avoid duplicate aggregation. This treats
        # the primary/first tag as the main classification for statistical purposes.
        if isinstance(tag_value, list):
            tag_value = str(tag_value[0]) if tag_value else "Unclassified"
        
        if not tag_value or tag_value == "":
            tag_value = "Unclassified"

        if tag_value not in aggregates:
            aggregates[tag_value] = {
                "trades": [],
                "total_trades": 0,
                "winning_trades": 0,
                "losing_trades": 0,
                "win_rate": 0,
                "total_pnl": 0.0,
                "avg_pnl": 0,
                "expectancy": 0,
            }

        aggregates[tag_value]["trades"].append(trade)

    # Calculate stats for each tag in optimized manner
    for tag_value, data in aggregates.items():
        tag_trades = data["trades"]
        data["total_trades"] = len(tag_trades)
        
        # Calculate all metrics in single pass
        win_count = 0
        loss_count = 0
        total_pnl = 0.0
        
        for t in tag_trades:
            pnl = t.get("pnl_usd", 0)
            total_pnl += pnl
            if pnl > 0:
                win_count += 1
            elif pnl < 0:
                loss_count += 1
        
        data["winning_trades"] = win_count
        data["losing_trades"] = loss_count
        data["win_rate"] = round(
            (win_count / data["total_trades"] * 100) if data["total_trades"] > 0 else 0,
            1,
        )
        data["total_pnl"] = round(total_pnl, 2)
        data["avg_pnl"] = round(
            total_pnl / data["total_trades"] if data["total_trades"] > 0 else 0,
            2,
        )
        data["expectancy"] = calculate_expectancy(tag_trades)

        # Remove trades list from output
        del data["trades"]

    return aggregates


def main():
    """Main execution function"""
    print("Generating analytics...")

    # Load account config
    account_config = load_account_config()
    starting_balance = account_config.get("starting_balance", 1000.00)
    total_deposits = sum(d.get("amount", 0) for d in account_config.get("deposits", []))
    
    # Load trades index
    index_data = load_trades_index()
    if not index_data:
        return

    trades = index_data.get("trades", [])
    stats = index_data.get("statistics", {})
    total_pnl = stats.get("total_pnl", 0)
    
    # Calculate portfolio value
    portfolio_value = starting_balance + total_deposits + total_pnl
    
    if not trades:
        print("No trades found in index")
        # Create empty analytics
        analytics = {
            "expectancy": 0,
            "profit_factor": 0,
            "max_win_streak": 0,
            "max_loss_streak": 0,
            "max_drawdown": 0,
            "kelly_criterion": 0,
            "by_strategy": {},
            "by_setup": {},
            "by_session": {},
            "drawdown_series": {"labels": [], "values": []},
            "account": {
                "starting_balance": starting_balance,
                "total_deposits": total_deposits,
                "total_pnl": total_pnl,
                "portfolio_value": portfolio_value
            },
            "generated_at": datetime.now().isoformat(),
        }
    else:
        print(f"Processing {len(trades)} trades...")

        # Sort trades by date
        sorted_trades = sorted(
            trades, key=lambda t: t.get("exit_date", t.get("entry_date", ""))
        )

        # Calculate overall metrics
        expectancy = calculate_expectancy(sorted_trades)
        profit_factor = calculate_profit_factor(sorted_trades)
        max_win_streak, max_loss_streak = calculate_streaks(sorted_trades)
        drawdown_series = calculate_drawdown_series(sorted_trades)
        max_drawdown = (
            min(drawdown_series["values"]) if drawdown_series["values"] else 0
        )
        kelly = calculate_kelly_criterion(sorted_trades)
        
        # Calculate percentage-based returns metrics
        returns_metrics = calculate_returns_metrics(
            sorted_trades, 
            starting_balance, 
            account_config.get("deposits", [])
        )

        # Aggregate by tags
        by_strategy = aggregate_by_tag(sorted_trades, "strategy")
        by_setup = aggregate_by_tag(sorted_trades, "setup")
        by_session = aggregate_by_tag(sorted_trades, "session")

        analytics = {
            "expectancy": expectancy,
            "profit_factor": profit_factor,
            "max_win_streak": max_win_streak,
            "max_loss_streak": max_loss_streak,
            "max_drawdown": max_drawdown,
            "max_drawdown_percent": returns_metrics["max_drawdown_percent"],
            "kelly_criterion": kelly,
            "by_strategy": by_strategy,
            "by_setup": by_setup,
            "by_session": by_session,
            "drawdown_series": drawdown_series,
            "returns": {
                "total_return_percent": returns_metrics["total_return_percent"],
                "avg_return_percent": returns_metrics["avg_return_percent"],
                "avg_risk_percent": returns_metrics["avg_risk_percent"],
                "avg_position_size_percent": returns_metrics["avg_position_size_percent"]
            },
            "account": {
                "starting_balance": starting_balance,
                "total_deposits": total_deposits,
                "total_pnl": total_pnl,
                "portfolio_value": portfolio_value
            },
            "generated_at": datetime.now().isoformat(),
        }

    # Save analytics data
    os.makedirs("index.directory/assets/charts", exist_ok=True)
    output_file = "index.directory/assets/charts/analytics-data.json"

    with open(output_file, "w", encoding="utf-8") as f:
        json.dump(analytics, f, indent=2)

    print(f"Analytics written to {output_file}")
    print(f"Expectancy: ${analytics['expectancy']}")
    print(f"Profit Factor: {analytics['profit_factor']}")
    print(f"Kelly Criterion: {analytics['kelly_criterion']}%")


if __name__ == "__main__":
    main()
