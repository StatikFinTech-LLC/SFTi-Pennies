#!/usr/bin/env python3
"""
Base Importer Class
Abstract interface for broker CSV importers
"""

from abc import ABC, abstractmethod
from datetime import datetime
from typing import List, Dict, Optional


class BaseImporter(ABC):
    """
    Abstract base class for broker CSV importers

    All broker-specific importers should extend this class and implement
    the required methods.
    """

    def __init__(self):
        """Initialize the importer"""
        self.broker_name = "Unknown"
        self.supported_formats = []

    @abstractmethod
    def detect_format(self, csv_content: str) -> bool:
        """
        Detect if CSV matches this broker's format

        Args:
            csv_content (str): Raw CSV content

        Returns:
            bool: True if format matches, False otherwise
        """
        pass

    @abstractmethod
    def parse_csv(self, csv_content: str) -> List[Dict]:
        """
        Parse CSV content into standardized trade format

        Args:
            csv_content (str): Raw CSV content

        Returns:
            List[Dict]: List of trade dictionaries in standard format

        Standard trade format:
        {
            'trade_number': int,
            'ticker': str,
            'entry_date': str (ISO format),
            'entry_time': str (HH:MM:SS),
            'entry_price': float,
            'exit_date': str (ISO format),
            'exit_time': str (HH:MM:SS),
            'exit_price': float,
            'position_size': int,
            'direction': str ('LONG' or 'SHORT'),
            'broker': str,
            'pnl_usd': float,
            'pnl_percent': float,
            'strategy': str (optional),
            'notes': str (optional)
        }
        """
        pass

    @abstractmethod
    def validate_trade(self, trade: Dict) -> tuple[bool, List[str]]:
        """
        Validate a parsed trade

        Args:
            trade (Dict): Trade dictionary

        Returns:
            tuple: (is_valid: bool, errors: List[str])
        """
        pass

    def get_broker_name(self) -> str:
        """Get the broker name"""
        return self.broker_name

    def get_supported_formats(self) -> List[str]:
        """Get list of supported CSV formats"""
        return self.supported_formats

    def get_sample_mapping(self) -> Dict:
        """
        Get sample field mapping for this broker

        Returns:
            Dict: Sample field mapping showing broker fields -> standard fields
        """
        return {
            "broker_field_1": "standard_field_1",
            "broker_field_2": "standard_field_2",
            # Implement in subclass for specific broker mappings
        }

    def _validate_required_fields(self, trade: Dict) -> tuple[bool, List[str]]:
        """
        Validate that required fields are present

        Args:
            trade (Dict): Trade dictionary

        Returns:
            tuple: (is_valid: bool, errors: List[str])
        """
        required_fields = [
            "ticker",
            "entry_date",
            "entry_price",
            "exit_price",
            "position_size",
            "direction",
        ]

        errors = []
        for field in required_fields:
            if field not in trade or trade[field] is None:
                errors.append(f"Missing required field: {field}")

        return len(errors) == 0, errors

    def _calculate_pnl(self, trade: Dict) -> Dict:
        """
        Calculate P&L if not already present

        Args:
            trade (Dict): Trade dictionary

        Returns:
            Dict: Trade with calculated P&L fields
        """
        if "pnl_usd" not in trade or trade["pnl_usd"] is None:
            entry_price = float(trade.get("entry_price", 0))
            exit_price = float(trade.get("exit_price", 0))
            position_size = int(trade.get("position_size", 0))
            direction = trade.get("direction", "LONG")

            if direction.upper() == "LONG":
                pnl_usd = (exit_price - entry_price) * position_size
            else:  # SHORT
                pnl_usd = (entry_price - exit_price) * position_size

            trade["pnl_usd"] = round(pnl_usd, 2)

        if "pnl_percent" not in trade or trade["pnl_percent"] is None:
            entry_price = float(trade.get("entry_price", 0))
            if entry_price > 0:
                trade["pnl_percent"] = round(
                    (trade["pnl_usd"] / (entry_price * trade["position_size"])) * 100, 2
                )
            else:
                trade["pnl_percent"] = 0

        return trade
