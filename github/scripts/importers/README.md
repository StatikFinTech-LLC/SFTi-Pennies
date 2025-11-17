# CSV Importers Module

This directory contains broker-specific CSV importers for the SFTi-Pennies trading journal system.

## Architecture

The importers use an object-oriented architecture with a common base class that all broker-specific importers extend.

### Class Hierarchy

```
BaseImporter (Abstract Base Class)
├── IBKRImporter (Interactive Brokers)
├── SchwabImporter (Charles Schwab / TD Ameritrade)
├── RobinhoodImporter (Robinhood)
└── WebullImporter (Webull)
```

## Base Importer (`base_importer.py`)

The `BaseImporter` class provides a common interface for all broker-specific importers.

### Abstract Methods

All broker importers must implement:

#### `detect_format(csv_content: str) -> bool`

Detects if the CSV content matches this broker's format by analyzing headers and structure.

**Parameters:**
- `csv_content` (str): Raw CSV file content

**Returns:**
- `bool`: True if format matches, False otherwise

**Example:**
```python
def detect_format(self, csv_content: str) -> bool:
    header = csv_content.split('\n')[0].lower()
    indicators = ['symbol', 'date/time', 'proceeds']
    return sum(1 for ind in indicators if ind in header) >= 3
```

#### `parse_csv(csv_content: str) -> List[Dict]`

Parses CSV content into standardized trade format.

**Parameters:**
- `csv_content` (str): Raw CSV file content

**Returns:**
- `List[Dict]`: List of trades in standard format

**Standard Trade Format:**
```python
{
    'trade_number': int,          # Sequential trade number
    'ticker': str,                # Stock symbol (e.g., 'AAPL')
    'entry_date': str,            # ISO format (YYYY-MM-DD)
    'entry_time': str,            # HH:MM:SS format
    'entry_price': float,         # Entry price
    'exit_date': str,             # ISO format (YYYY-MM-DD)
    'exit_time': str,             # HH:MM:SS format
    'exit_price': float,          # Exit price
    'position_size': int,         # Number of shares
    'direction': str,             # 'LONG' or 'SHORT'
    'broker': str,                # Broker name
    'pnl_usd': float,             # Profit/Loss in USD
    'pnl_percent': float,         # Profit/Loss in percentage
    'strategy': str,              # Optional: Trading strategy
    'notes': str                  # Optional: Additional notes
}
```

#### `validate_trade(trade: Dict) -> tuple[bool, List[str]]`

Validates a parsed trade and returns validation errors.

**Parameters:**
- `trade` (Dict): Trade dictionary to validate

**Returns:**
- `tuple[bool, List[str]]`: (is_valid, list_of_errors)

**Example:**
```python
def validate_trade(self, trade: Dict) -> tuple[bool, List[str]]:
    is_valid, errors = self._validate_required_fields(trade)
    # Add broker-specific validation
    return is_valid, errors
```

### Helper Methods

The base class provides helper methods:

#### `_validate_required_fields(trade: Dict) -> tuple[bool, List[str]]`

Validates that all required fields are present in the trade.

**Required Fields:**
- ticker
- entry_date
- entry_price
- exit_price
- position_size
- direction

#### `_calculate_pnl(trade: Dict) -> Dict`

Calculates P&L fields if not already present.

**Calculations:**
- For LONG positions: `(exit_price - entry_price) × position_size`
- For SHORT positions: `(entry_price - exit_price) × position_size`
- P&L percentage: `(pnl_usd / (entry_price × position_size)) × 100`

#### `get_broker_name() -> str`

Returns the human-readable broker name.

#### `get_sample_mapping() -> Dict`

Returns a sample field mapping showing how broker CSV fields map to standard fields.

## Broker-Specific Importers

### Interactive Brokers (`ibkr.py`)

**Supported Formats:**
- Flex Query CSV
- Activity Statement CSV
- Trade Confirmation reports

**Detection Indicators:**
- Headers: 'symbol', 'date/time', 'quantity', 'proceeds', 'comm/fee', 'basis', 'realized p/l'
- Requires at least 3 matches for detection

**Key Features:**
- Parses IBKR date/time format: `YYYY-MM-DD HH:MM:SS`
- Handles both Flex Query and Activity Statement formats
- Matches BUY/SELL transactions using FIFO logic
- Extracts commission/fee information
- Supports both positive (BUY) and negative (SELL) quantity indicators

**Special Handling:**
- Automatically pairs entry (BUY) and exit (SELL) transactions
- Groups transactions by ticker symbol
- Sorts chronologically before matching
- Calculates total P&L including commissions

**Example CSV Headers:**
```csv
Symbol,Date/Time,Quantity,T. Price,C. Price,Proceeds,Comm/Fee,Basis,Realized P/L
```

### Charles Schwab / TD Ameritrade (`schwab.py`)

**Supported Formats:**
- Schwab Transaction History CSV
- TD Ameritrade legacy exports
- Combined Schwab/TDA format

**Detection Indicators:**
- Schwab: 'action', 'symbol', 'description', 'quantity', 'price', 'fees & comm'
- TD Ameritrade: 'trade date', 'exec time', 'symbol', 'side', 'qty', 'net price'
- Requires at least 4 matches for detection

**Key Features:**
- Handles both Schwab and TDA formats
- Parses Action field (BUY/SELL indicators)
- Extracts fees and commissions
- Supports multiple date formats

**Example CSV Headers:**
```csv
Date,Action,Symbol,Description,Quantity,Price,Fees & Comm,Amount
```

### Robinhood (`robinhood.py`)

**Supported Formats:**
- Account Statements CSV
- Activity History exports

**Detection Indicators:**
- Headers: 'activity date', 'trans code', 'instrument', 'quantity', 'price'
- Requires at least 3 matches for detection

**Key Features:**
- Parses Robinhood-specific transaction codes
- Handles Activity Date format
- Extracts instrument symbols
- Commission-free trades (no fee parsing needed)

**Example CSV Headers:**
```csv
Activity Date,Process Date,Settle Date,Instrument,Description,Trans Code,Quantity,Price,Amount
```

### Webull (`webull.py`)

**Supported Formats:**
- Transaction History CSV
- Trade History exports

**Detection Indicators:**
- Headers: 'time', 'side', 'ticker', 'filled/quantity', 'filled avg price'
- Requires at least 3 matches for detection

**Key Features:**
- Parses Side field (BUY/SELL indicators)
- Handles Filled/Quantity format
- Extracts Filled Avg Price
- Parses combined date/time fields

**Example CSV Headers:**
```csv
Time,Symbol,Side,Filled/Quantity,Filled Avg Price,Total,Status
```

## Usage

### Broker Registration

Importers are automatically registered in `__init__.py`:

```python
from .ibkr import IBKRImporter
from .schwab import SchwabImporter
from .robinhood import RobinhoodImporter
from .webull import WebullImporter

register_broker('ibkr', IBKRImporter)
register_broker('schwab', SchwabImporter)
register_broker('robinhood', RobinhoodImporter)
register_broker('webull', WebullImporter)
```

### Auto-Detection

```python
from importers import list_brokers, get_importer

# Try each registered broker
for broker_name in list_brokers():
    importer = get_importer(broker_name)
    if importer.detect_format(csv_content):
        print(f"Detected: {broker_name}")
        trades = importer.parse_csv(csv_content)
        break
```

### Direct Usage

```python
from importers import get_importer

# Get specific importer
importer = get_importer('ibkr')

# Parse CSV
with open('broker-export.csv', 'r') as f:
    csv_content = f.read()
    
trades = importer.parse_csv(csv_content)

# Validate trades
for trade in trades:
    is_valid, errors = importer.validate_trade(trade)
    if not is_valid:
        print(f"Invalid trade: {errors}")
```

## Adding a New Broker

To add support for a new broker:

### 1. Create Importer Class

Create `new_broker.py`:

```python
from typing import List, Dict
from .base_importer import BaseImporter

class NewBrokerImporter(BaseImporter):
    def __init__(self):
        super().__init__()
        self.broker_name = "New Broker Name"
        self.supported_formats = ["Format Type 1", "Format Type 2"]
    
    def detect_format(self, csv_content: str) -> bool:
        """Detect broker-specific CSV format"""
        header = csv_content.split('\n')[0].lower()
        indicators = ['field1', 'field2', 'field3']
        matches = sum(1 for ind in indicators if ind in header)
        return matches >= 2
    
    def parse_csv(self, csv_content: str) -> List[Dict]:
        """Parse CSV into standard format"""
        # Implementation here
        pass
    
    def validate_trade(self, trade: Dict) -> tuple[bool, List[str]]:
        """Validate trade with broker-specific rules"""
        is_valid, errors = self._validate_required_fields(trade)
        # Add custom validation
        return is_valid, errors
```

### 2. Register in `__init__.py`

```python
from .new_broker import NewBrokerImporter
register_broker('newbroker', NewBrokerImporter)
```

### 3. Add Documentation

Update this README with:
- Supported formats
- Detection indicators
- Key features
- Example CSV headers

### 4. Add Tests

Create test cases for:
- Format detection
- CSV parsing
- Trade validation
- Edge cases

## Transaction Matching Algorithm

Most broker CSVs export individual BUY and SELL transactions. The importers match these into complete trades using FIFO (First In, First Out) logic:

### Algorithm Steps

1. **Parse all transactions** from CSV
2. **Group by ticker symbol**
3. **Sort chronologically** within each group
4. **Separate BUYs and SELLs**
5. **Match pairs** using FIFO:
   - First BUY matches with first SELL
   - Second BUY matches with second SELL
   - And so on...

### Example

```python
def _match_transactions(self, transactions: List[Dict]) -> List[Dict]:
    trades = []
    
    # Group by symbol
    by_symbol = {}
    for t in transactions:
        if t['symbol'] not in by_symbol:
            by_symbol[t['symbol']] = []
        by_symbol[t['symbol']].append(t)
    
    # Match pairs for each symbol
    for symbol, txns in by_symbol.items():
        txns.sort(key=lambda x: x['datetime'])
        buys = [t for t in txns if t['direction'] == 'BUY']
        sells = [t for t in txns if t['direction'] == 'SELL']
        
        for buy, sell in zip(buys, sells):
            trade = {
                'ticker': symbol,
                'entry_date': buy['datetime'].strftime('%Y-%m-%d'),
                'entry_time': buy['datetime'].strftime('%H:%M:%S'),
                'entry_price': buy['price'],
                'exit_date': sell['datetime'].strftime('%Y-%m-%d'),
                'exit_time': sell['datetime'].strftime('%H:%M:%S'),
                'exit_price': sell['price'],
                'position_size': buy['quantity'],
                'direction': 'LONG',
                'broker': self.broker_name
            }
            trade = self._calculate_pnl(trade)
            trades.append(trade)
    
    return trades
```

## Error Handling

### Common Issues and Solutions

**Issue: CSV format not detected**
- Ensure CSV has standard headers in first row
- Check for extra header rows or footers
- Verify encoding (should be UTF-8)

**Issue: Transactions don't match**
- Verify ticker symbols are consistent
- Check for stock splits (adjust quantities)
- Ensure complete BUY/SELL pairs
- Consider manual entry for complex trades

**Issue: Invalid date formats**
- Parse using multiple date format attempts
- Use `datetime.strptime()` with try/except
- Default to ISO format: `YYYY-MM-DD`

**Issue: Missing required fields**
- Check if broker CSV includes all needed data
- Some fields may need to be added manually
- Use validation to identify missing data

## Testing

### Unit Tests

Test each importer with:
- Sample CSV files from broker
- Edge cases (partial fills, splits, etc.)
- Invalid data
- Multiple transactions

### Integration Tests

Test the complete flow:
1. Auto-detection
2. Parsing
3. Validation
4. File creation
5. Index update

## Performance Considerations

- **Large CSV files**: Process in chunks if needed
- **Many transactions**: Use efficient data structures (dict, set)
- **Memory usage**: Stream parsing for very large files
- **Execution time**: Optimize matching algorithm for speed

## Security

- **CSV Injection**: Sanitize all fields before processing
- **Path Traversal**: Validate file paths
- **Code Injection**: Never use `eval()` on CSV data
- **PII Handling**: Don't log sensitive account information

## Future Enhancements

- [ ] Support for options trades (multi-leg)
- [ ] Partial position exits
- [ ] Stock splits and dividends
- [ ] Cryptocurrency trades
- [ ] Forex trades
- [ ] More brokers (E*TRADE, Fidelity, etc.)
- [ ] API-based imports (no CSV needed)
- [ ] Real-time import via broker APIs
- [ ] Machine learning for better matching

## References

- [IBKR Report Guide](https://www.interactivebrokers.com/en/software/reportguide/reportguide.htm)
- [Schwab Export Documentation](https://www.schwab.com)
- [Python csv module](https://docs.python.org/3/library/csv.html)
- [ISO 8601 Date Format](https://en.wikipedia.org/wiki/ISO_8601)

## Support

For questions or issues:
1. Check existing [GitHub Issues](https://github.com/statikfintechllc/SFTi-Pennies/issues)
2. Review importer source code and comments
3. Test with `--dry-run` flag first
4. Open new issue with CSV sample (remove sensitive data)

---

**Last Updated:** 2025-10-20  
**Version:** 1.0.0
