#!/usr/bin/env python3
"""
Interactive Brokers (IBKR) CSV Importer
Parses IBKR Flex Query or Activity Statement CSV exports
"""

import csv
from datetime import datetime
from io import StringIO
from typing import List, Dict
from .base_importer import BaseImporter


class IBKRImporter(BaseImporter):
    """
    IBKR CSV importer

    Supports:
    - Flex Query exports
    - Activity Statement CSV
    - Trade Confirmation reports

    Reference: https://www.interactivebrokers.com/en/software/reportguide/reportguide.htm
    """

    def __init__(self):
        super().__init__()
        self.broker_name = "Interactive Brokers"
        self.supported_formats = ["Flex Query", "Activity Statement"]

    def detect_format(self, csv_content: str) -> bool:
        """
        Detect IBKR CSV format

        IBKR CSVs typically have headers like:
        - "Trades,Header,..."
        - "DataDiscriminator,Asset Category,..."
        - Or specific IBKR field names
        """
        # Placeholder detection
        lines = csv_content.strip().split("\n")
        if not lines:
            return False

        header = lines[0].lower()

        # Look for IBKR-specific indicators
        ibkr_indicators = [
            "symbol",
            "date/time",
            "quantity",
            "proceeds",
            "comm/fee",
            "basis",
            "realized p/l",
            "datadiscriminator",
            "asset category",
        ]

        # Check if header contains IBKR-specific fields
        matches = sum(1 for indicator in ibkr_indicators if indicator in header)

        return matches >= 3

    def parse_csv(self, csv_content: str) -> List[Dict]:
        """
        Parse IBKR CSV into standard trade format

        IBKR CSV structure (example):
        - Symbol, Date/Time, Quantity, T. Price, C. Price, Proceeds, Comm/Fee, Basis, Realized P/L
        - Or: DataDiscriminator, Asset Category, Currency, Symbol, Date/Time, ...

        Steps:
        1. Identify CSV variant (Flex Query vs Activity Statement)
        2. Parse rows into standardized format
        3. Match entry/exit pairs for complete trades
        4. Calculate P&L and metrics
        """
        trades = []
        transactions = []

        # Parse CSV and collect all transactions
        reader = csv.DictReader(StringIO(csv_content))

        for row in reader:
            # Map IBKR fields to standard format
            symbol = row.get("Symbol", row.get("symbol", "")).strip().upper()
            if not symbol:
                continue

            # Parse date/time from IBKR format (YYYY-MM-DD HH:MM:SS or variations)
            date_time_str = row.get(
                "Date/Time", row.get("DateTime", row.get("date/time", ""))
            )
            if not date_time_str:
                continue

            try:
                dt = datetime.strptime(date_time_str.strip(), "%Y-%m-%d %H:%M:%S")
            except:
                try:
                    dt = datetime.strptime(date_time_str.strip().split()[0], "%Y-%m-%d")
                except:
                    continue

            # Parse quantity and prices
            quantity_str = row.get("Quantity", row.get("quantity", "0"))
            try:
                quantity = int(float(quantity_str.replace(",", "")))
            except:
                quantity = 0

            price_str = row.get("T. Price", row.get("Price", row.get("price", "0")))
            try:
                price = float(price_str.replace(",", ""))
            except:
                price = 0.0

            # Detect direction (buy/sell) - positive quantity = buy, negative = sell
            direction = "BUY" if quantity > 0 else "SELL"

            transactions.append(
                {
                    "symbol": symbol,
                    "datetime": dt,
                    "quantity": abs(quantity),
                    "price": price,
                    "direction": direction,
                    "commission": self._parse_commission(row),
                }
            )

        # Match entry/exit pairs for complete trades
        trades = self._match_transactions(transactions)

        return trades

    def _parse_commission(self, row: Dict) -> float:
        """Parse commission from row"""
        comm_str = row.get(
            "Comm/Fee", row.get("Commission", row.get("commission", "0"))
        )
        try:
            return abs(float(comm_str.replace(",", "")))
        except:
            return 0.0

    def _match_transactions(self, transactions: List[Dict]) -> List[Dict]:
        """Match buy/sell transactions into complete trades"""
        trades = []
        trade_num = 1

        # Group transactions by symbol
        by_symbol = {}
        for t in transactions:
            if t["symbol"] not in by_symbol:
                by_symbol[t["symbol"]] = []
            by_symbol[t["symbol"]].append(t)

        # Match pairs for each symbol
        for symbol, txns in by_symbol.items():
            # Sort by datetime
            txns.sort(key=lambda x: x["datetime"])

            # Simple FIFO matching
            buys = [t for t in txns if t["direction"] == "BUY"]
            sells = [t for t in txns if t["direction"] == "SELL"]

            for buy, sell in zip(buys, sells):
                trade = {
                    "trade_number": trade_num,
                    "ticker": symbol,
                    "entry_date": buy["datetime"].strftime("%Y-%m-%d"),
                    "entry_time": buy["datetime"].strftime("%H:%M:%S"),
                    "entry_price": buy["price"],
                    "exit_date": sell["datetime"].strftime("%Y-%m-%d"),
                    "exit_time": sell["datetime"].strftime("%H:%M:%S"),
                    "exit_price": sell["price"],
                    "position_size": buy["quantity"],
                    "direction": "LONG",
                    "broker": self.broker_name,
                    "notes": f"Imported from IBKR CSV",
                }

                # Calculate P&L
                trade = self._calculate_pnl(trade)
                trades.append(trade)
                trade_num += 1

        return trades

    def validate_trade(self, trade: Dict) -> tuple[bool, List[str]]:
        """
        Validate IBKR trade data with IBKR-specific rules
        """
        is_valid, errors = self._validate_required_fields(trade)

        # Add IBKR-specific validation if needed
        # - Check for valid IBKR symbols
        # - Validate commission structures
        # - Check for split/reverse split indicators

        return is_valid, errors

    def get_sample_mapping(self) -> Dict:
        """
        Get sample IBKR field mapping

        Returns sample mapping for documentation/reference
        """
        return {
            "Symbol": "ticker",
            "Date/Time": "entry_date + entry_time",
            "Quantity": "position_size",
            "T. Price": "entry_price / exit_price",
            "Proceeds": "calculated from price * quantity",
            "Comm/Fee": "commission (separate field)",
            "Realized P/L": "pnl_usd",
        }
