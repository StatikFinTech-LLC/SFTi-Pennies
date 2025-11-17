#!/usr/bin/env python3
"""
Normalize Schema Script
Handles schema migrations and versioning for trade data

This script ensures backward compatibility when the trade data schema changes.
Features:
- Migrate old trade formats to new formats
- Validate trades against schema versions
- Supports schema versions 1.0 and 1.1
- Dry-run mode for safe testing
"""

import os
import argparse
from datetime import datetime
from globals_utils import setup_imports, save_json_file

# Setup imports
setup_imports(__file__)
from utils import load_trades_index


CURRENT_SCHEMA_VERSION = "1.1"

# Schema version history
SCHEMA_VERSIONS = {
    "1.0": "Initial schema with basic trade fields",
    "1.1": "Added tags (strategy, setup, session, market_condition) and notes field",
}


def get_schema_version(index_data):
    """Get current schema version from index"""
    return index_data.get("version", "1.0")


def migrate_1_0_to_1_1(trade):
    """
    Migrate trade from schema 1.0 to 1.1

    Changes in 1.1:
    - Add tags field (list of strings)
    - Add strategy_tags, setup_tags, session_tags, market_condition_tags fields
    - Add notes field (string)

    Args:
        trade (dict): Trade in 1.0 format

    Returns:
        dict: Trade in 1.1 format
    """
    # Add new fields with defaults
    if "tags" not in trade:
        trade["tags"] = []

    if "strategy_tags" not in trade:
        # If old 'strategy' field exists, use it as a tag
        strategy = trade.get("strategy", "")
        trade["strategy_tags"] = [strategy] if strategy else []

    if "setup_tags" not in trade:
        trade["setup_tags"] = []

    if "session_tags" not in trade:
        trade["session_tags"] = []

    if "market_condition_tags" not in trade:
        trade["market_condition_tags"] = []

    if "notes" not in trade:
        trade["notes"] = trade.get("notes", "")

    # Keep backward compatibility - maintain old 'strategy' field
    # This allows old code to still work

    return trade


def migrate_schema(index_data, target_version=CURRENT_SCHEMA_VERSION):
    """
    Migrate index data to target schema version

    Args:
        index_data (dict): Trade index data
        target_version (str): Target schema version

    Returns:
        dict: Migrated index data
    """
    current_version = get_schema_version(index_data)

    if current_version == target_version:
        print(f"Schema is already at version {target_version}")
        return index_data

    print(f"Migrating schema from {current_version} to {target_version}")

    trades = index_data.get("trades", [])
    migrated_trades = []

    for trade in trades:
        # Apply migrations in sequence
        if current_version == "1.0" and target_version == "1.1":
            trade = migrate_1_0_to_1_1(trade)

        # Future migration paths can be added here as schema evolves
        # Example:
        # elif current_version == "1.1" and target_version == "1.2":
        #     trade = migrate_1_1_to_1_2(trade)

        migrated_trades.append(trade)

    # Update version
    index_data["trades"] = migrated_trades
    index_data["version"] = target_version
    index_data["schema_migrated_at"] = datetime.now().isoformat()

    return index_data


def validate_schema(trade, version=CURRENT_SCHEMA_VERSION):
    """
    Validate that a trade conforms to the specified schema version

    Args:
        trade (dict): Trade dictionary
        version (str): Schema version to validate against

    Returns:
        tuple: (is_valid, errors)
    """
    errors = []

    # Required fields for all versions
    required_base_fields = [
        "trade_number",
        "ticker",
        "entry_date",
        "entry_price",
        "exit_price",
        "position_size",
        "direction",
    ]

    for field in required_base_fields:
        if field not in trade:
            errors.append(f"Missing required field: {field}")

    # Version-specific validation
    if version == "1.1":
        # Check for tag fields
        tag_fields = [
            "tags",
            "strategy_tags",
            "setup_tags",
            "session_tags",
            "market_condition_tags",
        ]
        for field in tag_fields:
            if field in trade and not isinstance(trade[field], list):
                errors.append(f"Field {field} must be a list")

    return len(errors) == 0, errors


def main():
    """Main execution function"""
    parser = argparse.ArgumentParser(description="Normalize and migrate trade schema")
    parser.add_argument(
        "--target-version",
        default=CURRENT_SCHEMA_VERSION,
        help=f"Target schema version (default: {CURRENT_SCHEMA_VERSION})",
    )
    parser.add_argument(
        "--validate-only", action="store_true", help="Validate schema without migrating"
    )
    parser.add_argument(
        "--dry-run",
        action="store_true",
        help="Show what would be migrated without saving",
    )

    args = parser.parse_args()

    print("=" * 60)
    print("SFTi-Pennies Schema Normalizer")
    print("=" * 60)
    print(f"Current schema version: {CURRENT_SCHEMA_VERSION}")
    print(f"Target schema version: {args.target_version}")
    print("=" * 60)

    # Load trades index
    index_data = load_trades_index()
    if not index_data:
        return

    current_version = get_schema_version(index_data)
    print(f"\nIndex schema version: {current_version}")

    trades = index_data.get("trades", [])
    print(f"Total trades: {len(trades)}")

    if args.validate_only:
        print(f"\nValidating against schema {args.target_version}...")
        invalid_count = 0
        for i, trade in enumerate(trades, 1):
            is_valid, errors = validate_schema(trade, args.target_version)
            if not is_valid:
                print(
                    f"  Trade #{i} ({trade.get('ticker', 'UNKNOWN')}): {', '.join(errors)}"
                )
                invalid_count += 1

        if invalid_count == 0:
            print(f"✓ All trades conform to schema {args.target_version}")
        else:
            print(f"✗ {invalid_count} trade(s) do not conform to schema")
        return

    # Migrate
    if current_version != args.target_version:
        migrated_data = migrate_schema(index_data, args.target_version)

        if args.dry_run:
            print(
                f"\n[DRY RUN] Would migrate {len(trades)} trade(s) to schema {args.target_version}"
            )
        else:
            # Save migrated data
            save_json_file("index.directory/trades-index.json", migrated_data)

            print(
                f"\n✓ Migrated {len(trades)} trade(s) to schema {args.target_version}"
            )
            print("Updated: index.directory/trades-index.json")

    print("=" * 60)


if __name__ == "__main__":
    main()
