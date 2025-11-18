#!/usr/bin/env python3
"""
Global Utilities Module
Common utility functions used across multiple Python scripts to eliminate code duplication.
This module provides reusable functions for file operations, date parsing, and path management.
"""

import os
import json
import sys
from datetime import datetime
from typing import Any, Dict, Optional, Tuple


def setup_imports(script_path: str = __file__) -> None:
    """
    Add the scripts directory to Python path for module imports.
    This eliminates the need for repeated sys.path.insert() calls in every script.
    
    Args:
        script_path: Path to the calling script (defaults to __file__)
    
    Example:
        from globals_utils import setup_imports
        setup_imports(__file__)
    """
    scripts_dir = os.path.dirname(os.path.abspath(script_path))
    if scripts_dir not in sys.path:
        sys.path.insert(0, scripts_dir)


def ensure_directory(directory_path: str) -> str:
    """
    Create a directory if it doesn't exist.
    
    Args:
        directory_path: Path to directory to create
        
    Returns:
        str: The directory path
        
    Example:
        ensure_directory("index.directory/assets/charts")
    """
    os.makedirs(directory_path, exist_ok=True)
    return directory_path


def load_json_file(filepath: str, default: Any = None) -> Any:
    """
    Load a JSON file with error handling.
    
    Args:
        filepath: Path to JSON file
        default: Default value to return if file not found or invalid
        
    Returns:
        Parsed JSON data or default value
        
    Example:
        data = load_json_file("index.directory/trades-index.json", {})
    """
    try:
        with open(filepath, "r", encoding="utf-8") as f:
            return json.load(f)
    except FileNotFoundError:
        print(f"File not found: {filepath}")
        return default
    except json.JSONDecodeError as e:
        print(f"Error parsing JSON from {filepath}: {e}")
        return default
    except Exception as e:
        print(f"Error loading {filepath}: {e}")
        return default


def save_json_file(filepath: str, data: Any, indent: int = 2) -> bool:
    """
    Save data to a JSON file with error handling.
    
    Args:
        filepath: Path to save JSON file
        data: Data to serialize to JSON
        indent: Number of spaces for indentation (default: 2)
        
    Returns:
        bool: True if successful, False otherwise
        
    Example:
        save_json_file("output.json", {"key": "value"})
    """
    try:
        # Ensure directory exists
        directory = os.path.dirname(filepath)
        if directory:
            ensure_directory(directory)
        
        with open(filepath, "w", encoding="utf-8") as f:
            json.dump(data, f, indent=indent, ensure_ascii=False)
        return True
    except Exception as e:
        print(f"Error saving to {filepath}: {e}")
        return False


def parse_date(date_str: str, default: Optional[datetime] = None) -> Optional[datetime]:
    """
    Parse a date string into a datetime object with error handling.
    Supports ISO format dates (YYYY-MM-DD or YYYY-MM-DDTHH:MM:SS).
    
    Args:
        date_str: Date string to parse
        default: Default value to return if parsing fails
        
    Returns:
        datetime object or default value
        
    Example:
        date = parse_date("2025-10-15")
        date_with_time = parse_date("2025-10-15T14:30:00")
    """
    if not date_str:
        return default
    
    try:
        # Handle ISO format with time
        if "T" in str(date_str):
            return datetime.fromisoformat(str(date_str))
        # Handle ISO format date only
        return datetime.fromisoformat(str(date_str).split("T")[0])
    except (ValueError, TypeError, AttributeError):
        return default


def format_currency(amount: float, symbol: str = "$", decimals: int = 2) -> str:
    """
    Format a number as currency with proper sign handling.
    
    NOTE: Reserved for future use. Not currently used in any scripts.
    
    Args:
        amount: Amount to format
        symbol: Currency symbol (default: "$")
        decimals: Number of decimal places (default: 2)
        
    Returns:
        Formatted currency string
        
    Example:
        format_currency(1234.56)  # Returns "$1,234.56"
        format_currency(-42.5)     # Returns "-$42.50"
    """
    if amount >= 0:
        return f"{symbol}{amount:,.{decimals}f}"
    else:
        return f"-{symbol}{abs(amount):,.{decimals}f}"


def safe_divide(numerator: float, denominator: float, default: float = 0.0) -> float:
    """
    Safely divide two numbers, returning default if denominator is zero.
    
    NOTE: Reserved for future use. Not currently used in any scripts.
    
    Args:
        numerator: Numerator value
        denominator: Denominator value
        default: Value to return if denominator is zero (default: 0.0)
        
    Returns:
        Result of division or default value
        
    Example:
        result = safe_divide(10, 2)      # Returns 5.0
        result = safe_divide(10, 0, -1)  # Returns -1
    """
    if denominator == 0:
        return default
    return numerator / denominator


def get_week_folder(date_obj: datetime) -> str:
    """
    Generate a week folder name from a date object.
    Format: week.YYYY.WW (e.g., week.2025.42)
    
    Args:
        date_obj: datetime object
        
    Returns:
        Week folder name string
        
    Example:
        folder = get_week_folder(datetime(2025, 10, 15))  # Returns "week.2025.42"
    """
    year = date_obj.year
    week = date_obj.isocalendar()[1]
    return f"week.{year}.{week:02d}"


def calculate_time_in_trade(entry_date: str, entry_time: str, 
                            exit_date: str, exit_time: str) -> str:
    """
    Calculate time duration between entry and exit.
    
    Args:
        entry_date: Entry date string (YYYY-MM-DD)
        entry_time: Entry time string (HH:MM)
        exit_date: Exit date string (YYYY-MM-DD)
        exit_time: Exit time string (HH:MM)
        
    Returns:
        Human-readable duration string
        
    Example:
        duration = calculate_time_in_trade("2025-10-15", "09:30", "2025-10-15", "11:45")
        # Returns "2.25 hours" or "135 minutes"
    """
    if not all([entry_date, entry_time, exit_date, exit_time]):
        return "Unknown"
    
    try:
        entry_dt = datetime.strptime(f"{entry_date} {entry_time}", "%Y-%m-%d %H:%M")
        exit_dt = datetime.strptime(f"{exit_date} {exit_time}", "%Y-%m-%d %H:%M")
        duration = exit_dt - entry_dt
        
        hours = duration.total_seconds() / 3600
        if hours < 1:
            minutes = int(duration.total_seconds() / 60)
            return f"{minutes} minutes"
        else:
            return f"{hours:.1f} hours"
    except (ValueError, TypeError):
        return "Unknown"


def validate_required_fields(data: Dict, required_fields: list) -> Tuple[bool, list]:
    """
    Validate that a dictionary contains all required fields.
    
    NOTE: Reserved for future use. Not currently used in any scripts.
    
    Args:
        data: Dictionary to validate
        required_fields: List of required field names
        
    Returns:
        Tuple of (is_valid: bool, missing_fields: list)
        
    Example:
        is_valid, missing = validate_required_fields(
            {"name": "John", "age": 30},
            ["name", "age", "email"]
        )
        # Returns (False, ["email"])
    """
    missing_fields = [field for field in required_fields if field not in data]
    return len(missing_fields) == 0, missing_fields


def round_decimals(value: float, decimals: int = 2) -> float:
    """
    Round a float to specified decimal places.
    
    Args:
        value: Value to round
        decimals: Number of decimal places (default: 2)
        
    Returns:
        Rounded value
        
    Example:
        round_decimals(3.14159, 2)  # Returns 3.14
    """
    return round(value, decimals)
