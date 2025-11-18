#!/usr/bin/env python3
"""
Common Utilities Module
Shared functions used across multiple scripts to avoid code duplication.
"""

import json
from collections import defaultdict


def load_trades_index():
    """
    Load the trades index JSON file
    
    Returns:
        dict: The trades index data, or None if file not found
    """
    try:
        with open("index.directory/trades-index.json", "r", encoding="utf-8") as f:
            return json.load(f)
    except FileNotFoundError:
        print("index.directory/trades-index.json not found. Run parse_trades.py first.")
        return None


def load_account_config():
    """
    Load account configuration with starting balance, deposits, and withdrawals
    
    Returns:
        dict: Account configuration data with defaults if file not found
        
    Note:
        Default starting_balance is 0 to match the repository's account-config.json
    """
    try:
        with open("index.directory/account-config.json", "r", encoding="utf-8") as f:
            return json.load(f)
    except FileNotFoundError:
        print("index.directory/account-config.json not found, using defaults")
        return {
            "starting_balance": 0,
            "deposits": [],
            "withdrawals": [],
            "version": "1.0"
        }


def calculate_period_stats(trades):
    """
    Calculate statistics for a group of trades.
    Shared function used by generate_summaries.py and other scripts.
    
    Args:
        trades (list): List of trade dictionaries
    
    Returns:
        dict: Period statistics including wins, losses, P&L, best/worst trades
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

    # Use first trade as fallback if no best/worst found
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
