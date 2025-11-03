#!/usr/bin/env python3
"""
Test Imports Script
Validates that all Python files are properly wired with global awareness and accessibility
Tests for silent failures in imports and functions
"""

import sys
import os
import importlib.util
from pathlib import Path

# Constants
ERROR_MESSAGE_MAX_LENGTH = 100


def test_file_import(file_path: str, base_dir: str) -> tuple[bool, str]:
    """
    Test if a Python file can be imported without errors
    
    Args:
        file_path: Path to Python file relative to base_dir
        base_dir: Base directory containing the Python files
        
    Returns:
        tuple: (success: bool, message: str)
    """
    try:
        full_path = os.path.join(base_dir, file_path)
        
        if not os.path.exists(full_path):
            return False, f"File not found: {file_path}"
        
        # Load and import the module
        module_name = file_path.replace('/', '.').replace('.py', '')
        spec = importlib.util.spec_from_file_location(module_name, full_path)
        
        if spec is None or spec.loader is None:
            return False, f"Cannot create module spec for {file_path}"
        
        module = importlib.util.module_from_spec(spec)
        
        # Add parent directory to sys.path for relative imports
        parent_dir = os.path.dirname(full_path)
        if parent_dir not in sys.path:
            sys.path.insert(0, parent_dir)
        
        # Execute the module
        spec.loader.exec_module(module)
        
        return True, f"Successfully imported {file_path}"
        
    except Exception as e:
        return False, f"Error importing {file_path}: {str(e)[:ERROR_MESSAGE_MAX_LENGTH]}"


def test_utils_functions():
    """Test utils.py functions are accessible"""
    try:
        import utils
        
        required_functions = ['load_trades_index', 'load_account_config']
        
        for func_name in required_functions:
            if not hasattr(utils, func_name):
                return False, f"Missing function: utils.{func_name}"
            if not callable(getattr(utils, func_name)):
                return False, f"Not callable: utils.{func_name}"
        
        return True, "All utils functions accessible"
    except Exception as e:
        return False, f"Error testing utils: {str(e)}"


def test_importers_package():
    """Test importers package is properly wired"""
    try:
        import importers
        
        # Check registry functions
        required_attrs = ['BROKER_REGISTRY', 'register_broker', 'get_importer', 'list_brokers']
        
        for attr in required_attrs:
            if not hasattr(importers, attr):
                return False, f"Missing attribute: importers.{attr}"
        
        # Check all brokers are registered
        expected_brokers = ['ibkr', 'schwab', 'robinhood', 'webull']
        registered_brokers = importers.list_brokers()
        
        for broker in expected_brokers:
            if broker not in registered_brokers:
                return False, f"Broker not registered: {broker}"
            
            importer = importers.get_importer(broker)
            if importer is None:
                return False, f"Cannot get importer for: {broker}"
        
        return True, f"All brokers registered: {registered_brokers}"
    except Exception as e:
        return False, f"Error testing importers: {str(e)}"


def test_base_importer():
    """Test BaseImporter class"""
    try:
        from importers.base_importer import BaseImporter
        
        required_methods = [
            'detect_format', 'parse_csv', 'validate_trade',
            'get_broker_name', 'get_supported_formats', 'get_sample_mapping'
        ]
        
        for method in required_methods:
            if not hasattr(BaseImporter, method):
                return False, f"Missing method: BaseImporter.{method}"
        
        return True, f"BaseImporter has all {len(required_methods)} required methods"
    except Exception as e:
        return False, f"Error testing BaseImporter: {str(e)}"


def main():
    """Main test execution"""
    print("=" * 70)
    print("Python Import and Accessibility Test")
    print("=" * 70)
    
    # Get base directory
    base_dir = os.path.dirname(os.path.abspath(__file__))
    os.chdir(base_dir)
    
    # List of all Python files to test
    python_files = [
        'utils.py',
        'parse_trades.py',
        'import_csv.py',
        'generate_analytics.py',
        'generate_charts.py',
        'generate_index.py',
        'generate_summaries.py',
        'generate_trade_pages.py',
        'generate_week_summaries.py',
        'generate_books_index.py',
        'generate_notes_index.py',
        'update_homepage.py',
        'export_csv.py',
        'normalize_schema.py',
        'attach_media.py',
        'navbar_template.py',
        'importers/__init__.py',
        'importers/base_importer.py',
        'importers/ibkr.py',
        'importers/schwab.py',
        'importers/robinhood.py',
        'importers/webull.py'
    ]
    
    # Test 1: Import all Python files
    print("\n[Test 1] Testing all Python file imports...")
    print("-" * 70)
    
    failed_imports = []
    for file_path in python_files:
        success, message = test_file_import(file_path, base_dir)
        status = "✓" if success else "✗"
        print(f"{status} {file_path}")
        
        if not success:
            failed_imports.append(message)
    
    # Test 2: Test utils functions
    print("\n[Test 2] Testing utils.py functions...")
    print("-" * 70)
    success, message = test_utils_functions()
    status = "✓" if success else "✗"
    print(f"{status} {message}")
    if not success:
        failed_imports.append(message)
    
    # Test 3: Test importers package
    print("\n[Test 3] Testing importers package...")
    print("-" * 70)
    success, message = test_importers_package()
    status = "✓" if success else "✗"
    print(f"{status} {message}")
    if not success:
        failed_imports.append(message)
    
    # Test 4: Test BaseImporter
    print("\n[Test 4] Testing BaseImporter class...")
    print("-" * 70)
    success, message = test_base_importer()
    status = "✓" if success else "✗"
    print(f"{status} {message}")
    if not success:
        failed_imports.append(message)
    
    # Print results
    print("\n" + "=" * 70)
    print("TEST RESULTS")
    print("=" * 70)
    successful_imports = sum(1 for f in python_files if test_file_import(f, base_dir)[0])
    print(f"Total files tested: {len(python_files)}")
    print(f"Successful imports: {successful_imports}")
    print(f"Failed tests: {len(failed_imports)}")
    
    if failed_imports:
        print("\n⚠️  Failed tests:")
        for i, failure in enumerate(failed_imports, 1):
            print(f"  {i}. {failure}")
        print("\n" + "=" * 70)
        sys.exit(1)
    else:
        print("\n" + "=" * 70)
        print("✓✓✓ ALL TESTS PASSED! ✓✓✓")
        print("=" * 70)
        print("✓ All Python files are properly wired")
        print("✓ Global awareness and accessibility verified")
        print("✓ No silent failures detected")
        print("=" * 70)
        sys.exit(0)


if __name__ == "__main__":
    main()
