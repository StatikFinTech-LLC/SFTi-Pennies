#!/usr/bin/env python3
"""
Common Utilities Module
Shared functions used across multiple scripts to avoid code duplication.
"""

import json


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
