#!/usr/bin/env python3
"""
Broker CSV Importers Package
Registry and management for broker-specific CSV importers
"""

# Registry of available broker importers
BROKER_REGISTRY = {}


def register_broker(name, importer_class):
    """
    Register a broker importer

    Args:
        name (str): Broker name (e.g., 'ibkr', 'schwab')
        importer_class: Importer class that extends BaseImporter
    """
    BROKER_REGISTRY[name.lower()] = importer_class


def get_importer(broker_name):
    """
    Get importer instance for a broker

    Args:
        broker_name (str): Broker name

    Returns:
        BaseImporter instance or None if not found
    """
    importer_class = BROKER_REGISTRY.get(broker_name.lower())
    if importer_class:
        return importer_class()
    return None


def list_brokers():
    """
    List all registered brokers

    Returns:
        list: List of broker names
    """
    return list(BROKER_REGISTRY.keys())


# Import and register broker implementations
from .ibkr import IBKRImporter
from .schwab import SchwabImporter
from .robinhood import RobinhoodImporter
from .webull import WebullImporter

register_broker("ibkr", IBKRImporter)
register_broker("schwab", SchwabImporter)
register_broker("robinhood", RobinhoodImporter)
register_broker("webull", WebullImporter)
