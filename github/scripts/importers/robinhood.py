#!/usr/bin/env python3
"""
Robinhood CSV Importer
Parses Robinhood account statement CSV exports
"""

import csv
from datetime import datetime
from io import StringIO
from typing import List, Dict
from .base_importer import BaseImporter


class RobinhoodImporter(BaseImporter):
    """
    Robinhood CSV importer

    Supports:
    - Account statement exports
    - Transaction history

    TODO: Implement full Robinhood CSV parsing logic
    Reference: Robinhood > Account > Statements & History
    """

    def __init__(self):
        super().__init__()
        self.broker_name = "Robinhood"
        self.supported_formats = ["Account Statements", "Transaction History"]

    def detect_format(self, csv_content: str) -> bool:
        """
        Detect Robinhood CSV format

        Robinhood CSVs typically have headers like:
        - "Activity Date,Process Date,Settle Date,Instrument,Description,Trans Code,Quantity,Price,Amount"

        TODO: Implement detection logic
        """
        lines = csv_content.strip().split("\n")
        if not lines:
            return False

        header = lines[0].lower()

        # Look for Robinhood-specific indicators
        rh_indicators = [
            "activity date",
            "process date",
            "settle date",
            "instrument",
            "trans code",
            "quantity",
            "price",
            "amount",
        ]

        matches = sum(1 for indicator in rh_indicators if indicator in header)

        # TODO: Refine detection logic
        return matches >= 5

    def parse_csv(self, csv_content: str) -> List[Dict]:
        """
        Parse Robinhood CSV into standard trade format

        Robinhood CSV structure (example):
        Activity Date, Process Date, Settle Date, Instrument, Description, Trans Code, Quantity, Price, Amount
        01/15/2025, 01/15/2025, 01/17/2025, AAPL, APPLE INC, Buy, 10, 150.25, -1502.50
        01/16/2025, 01/16/2025, 01/18/2025, AAPL, APPLE INC, Sell, 10, 152.50, 1525.00
        """
        trades = []
        transactions = []

        reader = csv.DictReader(StringIO(csv_content))

        for row in reader:
            # Filter by Trans Code (Buy/Sell only)
            trans_code = (
                row.get("Trans Code", row.get("trans_code", "")).strip().upper()
            )
            if trans_code not in ["BUY", "SELL"]:
                continue

            # Get symbol
            symbol = row.get("Instrument", row.get("instrument", "")).strip().upper()
            if not symbol:
                continue

            # Parse date (MM/DD/YYYY)
            date_str = row.get("Activity Date", row.get("activity_date", ""))
            if not date_str:
                continue

            try:
                if "/" in date_str:
                    date_obj = datetime.strptime(date_str.strip(), "%m/%d/%Y")
                else:
                    date_obj = datetime.strptime(date_str.strip(), "%Y-%m-%d")
            except:
                continue

            # Parse quantity
            qty_str = row.get("Quantity", row.get("quantity", "0"))
            try:
                quantity = abs(float(qty_str.replace(",", "")))
            except:
                quantity = 0.0

            # Parse price
            price_str = row.get("Price", row.get("price", "0"))
            try:
                price = abs(float(price_str.replace(",", "").replace("$", "")))
            except:
                price = 0.0

            transactions.append(
                {
                    "symbol": symbol,
                    "datetime": date_obj,
                    "quantity": quantity,
                    "price": price,
                    "direction": trans_code,
                    "commission": 0.0,  # Robinhood is commission-free
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

        # Match pairs
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
                    "position_size": int(buy["quantity"]),
                    "direction": "LONG",
                    "broker": self.broker_name,
                    "notes": f"Imported from Robinhood CSV",
                }

                trade = self._calculate_pnl(trade)
                trades.append(trade)
                trade_num += 1

        return trades

    def validate_trade(self, trade: Dict) -> tuple[bool, List[str]]:
        """
        Validate Robinhood trade data with broker-specific rules
        """
        is_valid, errors = self._validate_required_fields(trade)

        # Robinhood-specific validation
        # Check for fractional shares (Robinhood supports fractional trading)
        position_size = trade.get("position_size", 0)
        if isinstance(position_size, float) and position_size < 1 and position_size > 0:
            # Fractional shares are valid on Robinhood, just note it
            pass
        elif position_size <= 0:
            errors.append("Position size must be positive")
            is_valid = False

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

        return is_valid, errors

    def get_sample_mapping(self) -> Dict:
        """Get sample Robinhood field mapping"""
        return {
            "Activity Date": "entry_date / exit_date",
            "Instrument": "ticker",
            "Trans Code": "direction (Buy/Sell)",
            "Quantity": "position_size",
            "Price": "entry_price / exit_price",
            "Amount": "calculated total (negative for buys)",
        }
