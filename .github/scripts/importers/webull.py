#!/usr/bin/env python3
"""
Webull CSV Importer
Parses Webull transaction history CSV exports
"""

import csv
from datetime import datetime
from io import StringIO
from typing import List, Dict
from .base_importer import BaseImporter


class WebullImporter(BaseImporter):
    """
    Webull CSV importer

    Supports:
    - Transaction history exports
    - Account statements

    TODO: Implement full Webull CSV parsing logic
    Reference: Webull > Me > Statements
    """

    def __init__(self):
        super().__init__()
        self.broker_name = "Webull"
        self.supported_formats = ["Transaction History", "Account Statements"]

    def detect_format(self, csv_content: str) -> bool:
        """
        Detect Webull CSV format

        Webull CSVs typically have headers like:
        - "Time,Symbol,Side,Filled/Quantity,Filled Avg Price,Total,Status"

        TODO: Implement detection logic
        """
        lines = csv_content.strip().split("\n")
        if not lines:
            return False

        header = lines[0].lower()

        # Look for Webull-specific indicators
        webull_indicators = [
            "time",
            "symbol",
            "side",
            "filled/quantity",
            "filled avg price",
            "total",
            "status",
        ]

        matches = sum(1 for indicator in webull_indicators if indicator in header)

        # TODO: Refine detection logic
        return matches >= 4

    def parse_csv(self, csv_content: str) -> List[Dict]:
        """
        Parse Webull CSV into standard trade format

        Webull CSV structure (example):
        Time, Symbol, Side, Filled/Quantity, Filled Avg Price, Total, Status
        2025-01-15 09:30:15, AAPL, Buy, 100/100, 150.25, -15025.00, Filled
        2025-01-16 14:25:30, AAPL, Sell, 100/100, 152.50, 15250.00, Filled
        """
        trades = []
        transactions = []

        reader = csv.DictReader(StringIO(csv_content))

        for row in reader:
            # Filter by Status (Filled only)
            status = row.get("Status", row.get("status", "")).strip().upper()
            if status != "FILLED":
                continue

            # Get symbol
            symbol = row.get("Symbol", row.get("symbol", "")).strip().upper()
            if not symbol:
                continue

            # Parse timestamp (YYYY-MM-DD HH:MM:SS)
            time_str = row.get("Time", row.get("time", ""))
            if not time_str:
                continue

            try:
                date_obj = datetime.strptime(time_str.strip(), "%Y-%m-%d %H:%M:%S")
            except:
                try:
                    date_obj = datetime.strptime(time_str.strip(), "%m/%d/%Y %H:%M:%S")
                except:
                    continue

            # Parse side
            side = row.get("Side", row.get("side", "")).strip().upper()
            if side not in ["BUY", "SELL"]:
                continue

            # Parse quantity from "Filled/Quantity" format (e.g., "100/100")
            filled_qty = row.get("Filled/Quantity", row.get("filled/quantity", "0/0"))
            try:
                quantity = int(filled_qty.split("/")[0])
            except:
                quantity = 0

            # Parse price
            price_str = row.get("Filled Avg Price", row.get("filled_avg_price", "0"))
            try:
                price = float(price_str.replace(",", "").replace("$", ""))
            except:
                price = 0.0

            transactions.append(
                {
                    "symbol": symbol,
                    "datetime": date_obj,
                    "quantity": quantity,
                    "price": price,
                    "direction": side,
                    "commission": 0.0,  # Webull is commission-free for stocks
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
                    "position_size": buy["quantity"],
                    "direction": "LONG",
                    "broker": self.broker_name,
                    "notes": f"Imported from Webull CSV",
                }

                trade = self._calculate_pnl(trade)
                trades.append(trade)
                trade_num += 1

        return trades

    def validate_trade(self, trade: Dict) -> tuple[bool, List[str]]:
        """
        Validate Webull trade data with broker-specific rules
        """
        is_valid, errors = self._validate_required_fields(trade)

        # Webull-specific validation
        # Check for reasonable price ranges (penny stocks typically $0.01 - $50)
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

        # Check position size is reasonable
        position_size = int(trade.get("position_size", 0))
        if position_size <= 0:
            errors.append("Position size must be positive")
            is_valid = False

        return is_valid, errors

    def get_sample_mapping(self) -> Dict:
        """Get sample Webull field mapping"""
        return {
            "Time": "entry_date + entry_time / exit_date + exit_time",
            "Symbol": "ticker",
            "Side": "direction (Buy=LONG, Sell=exit)",
            "Filled/Quantity": "position_size",
            "Filled Avg Price": "entry_price / exit_price",
            "Total": "calculated total",
            "Status": "filter (Filled only)",
        }
