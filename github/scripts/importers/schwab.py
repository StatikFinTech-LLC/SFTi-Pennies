#!/usr/bin/env python3
"""
TD Ameritrade / Charles Schwab CSV Importer
Parses Schwab transaction history CSV exports

Note: TD Ameritrade merged with Schwab, so this handles both formats
"""

import csv
from datetime import datetime
from io import StringIO
from typing import List, Dict
from .base_importer import BaseImporter


class SchwabImporter(BaseImporter):
    """
    Schwab/TD Ameritrade CSV importer

    Supports:
    - Schwab transaction history exports
    - TD Ameritrade legacy formats
    - Combined Schwab/TDA CSV

    Reference: Schwab > Accounts > History > Export
    """

    def __init__(self):
        super().__init__()
        self.broker_name = "Charles Schwab"
        self.supported_formats = ["Transaction History", "TD Ameritrade History"]

    def detect_format(self, csv_content: str) -> bool:
        """
        Detect Schwab/TDA CSV format

        Schwab CSVs typically have headers like:
        - "Date,Action,Symbol,Description,Quantity,Price,Fees & Comm,Amount"
        - Or TDA specific headers
        """
        lines = csv_content.strip().split("\n")
        if not lines:
            return False

        header = lines[0].lower()

        # Look for Schwab/TDA-specific indicators
        schwab_indicators = [
            "action",
            "symbol",
            "description",
            "quantity",
            "price",
            "fees & comm",
            "amount",
        ]

        tda_indicators = [
            "trade date",
            "exec time",
            "symbol",
            "side",
            "qty",
            "pos effect",
            "net price",
        ]

        matches = sum(1 for indicator in schwab_indicators if indicator in header)
        tda_matches = sum(1 for indicator in tda_indicators if indicator in header)

        return matches >= 4 or tda_matches >= 4

    def parse_csv(self, csv_content: str) -> List[Dict]:
        """
        Parse Schwab/TDA CSV into standard trade format

        Schwab CSV structure (example):
        Date, Action, Symbol, Description, Quantity, Price, Fees & Comm, Amount
        01/15/2025, Buy, AAPL, APPLE INC, 100, 150.25, 0.00, -15025.00
        01/16/2025, Sell, AAPL, APPLE INC, 100, 152.50, 0.00, 15250.00

        TDA CSV structure (example):
        Trade Date, Exec Time, Symbol, Side, Qty, Pos Effect, Net Price, Comm, Fees
        """
        trades = []
        transactions = []

        reader = csv.DictReader(StringIO(csv_content))

        for row in reader:
            # Map Schwab fields to standard format
            symbol = row.get("Symbol", row.get("symbol", "")).strip().upper()
            if not symbol:
                continue

            # Parse date (MM/DD/YYYY or YYYY-MM-DD)
            date_str = row.get("Date", row.get("Trade Date", ""))
            time_str = row.get("Time", row.get("Exec Time", "09:30:00"))

            if not date_str:
                continue

            try:
                if "/" in date_str:
                    date_obj = datetime.strptime(date_str.strip(), "%m/%d/%Y")
                else:
                    date_obj = datetime.strptime(date_str.strip(), "%Y-%m-%d")
            except:
                continue

            # Parse time if available
            try:
                if time_str and ":" in time_str:
                    time_parts = time_str.strip().split(":")
                    date_obj = date_obj.replace(
                        hour=int(time_parts[0]),
                        minute=int(time_parts[1]),
                        second=int(time_parts[2]) if len(time_parts) > 2 else 0,
                    )
            except:
                pass

            # Detect action/direction
            action = row.get("Action", row.get("Side", "")).strip().upper()
            if "BUY" in action:
                direction = "BUY"
            elif "SELL" in action:
                direction = "SELL"
            else:
                continue

            # Parse quantity
            qty_str = row.get("Quantity", row.get("Qty", "0"))
            try:
                quantity = int(float(qty_str.replace(",", "")))
            except:
                quantity = 0

            # Parse price
            price_str = row.get("Price", row.get("Net Price", "0"))
            try:
                price = float(price_str.replace(",", "").replace("$", ""))
            except:
                price = 0.0

            # Parse commission
            comm_str = row.get("Fees & Comm", row.get("Comm", "0"))
            try:
                commission = abs(float(comm_str.replace(",", "").replace("$", "")))
            except:
                commission = 0.0

            transactions.append(
                {
                    "symbol": symbol,
                    "datetime": date_obj,
                    "quantity": abs(quantity),
                    "price": price,
                    "direction": direction,
                    "commission": commission,
                }
            )

        # Match entry/exit pairs
        trades = self._match_transactions(transactions)

        return trades

    def _match_transactions(self, transactions: List[Dict]) -> List[Dict]:
        """Match buy/sell transactions into complete trades"""
        trades = []
        trade_num = 1

        # Group by symbol
        by_symbol = {}
        for t in transactions:
            if t["symbol"] not in by_symbol:
                by_symbol[t["symbol"]] = []
            by_symbol[t["symbol"]].append(t)

        # Match pairs for each symbol
        for symbol, txns in by_symbol.items():
            txns.sort(key=lambda x: x["datetime"])

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
                    "notes": f"Imported from Schwab CSV",
                }

                trade = self._calculate_pnl(trade)
                trades.append(trade)
                trade_num += 1

        return trades

    def validate_trade(self, trade: Dict) -> tuple[bool, List[str]]:
        """
        Validate Schwab/TDA trade data with broker-specific rules
        """
        is_valid, errors = self._validate_required_fields(trade)

        # Schwab-specific validation
        # Check for reasonable price ranges
        entry_price = float(trade.get("entry_price", 0))
        exit_price = float(trade.get("exit_price", 0))

        if entry_price <= 0:
            errors.append("Entry price must be positive")
            is_valid = False
        elif entry_price > 10000:
            errors.append(f"Entry price ${entry_price} seems unusually high")

        if exit_price <= 0:
            errors.append("Exit price must be positive")
            is_valid = False
        elif exit_price > 10000:
            errors.append(f"Exit price ${exit_price} seems unusually high")

        # Check position size is reasonable and whole number (Schwab doesn't support fractional shares for penny stocks)
        position_size = trade.get("position_size", 0)
        if position_size <= 0:
            errors.append("Position size must be positive")
            is_valid = False
        elif isinstance(position_size, float) and position_size != int(position_size):
            errors.append("Schwab does not support fractional shares for most stocks")

        return is_valid, errors

    def get_sample_mapping(self) -> Dict:
        """Get sample Schwab field mapping"""
        return {
            "Date": "entry_date / exit_date",
            "Action": "direction (Buy=LONG, Sell=exit)",
            "Symbol": "ticker",
            "Quantity": "position_size",
            "Price": "entry_price / exit_price",
            "Fees & Comm": "commission",
            "Amount": "calculated total",
        }
