#!/usr/bin/env python3
"""
Theme Parser Module
Parses theme markdown files from index.directory/theme.c/ and provides
theme configuration for HTML generation scripts.

This module follows the same pattern as trade markdown parsing but for
theme customization settings.

Output: Theme configuration dictionary for use in generate_trade_pages.py
        and other HTML generation scripts.
"""

import re
from pathlib import Path
from datetime import datetime
from typing import Any, Dict, Tuple

# Try to import yaml, fall back to regex parsing if not available
try:
    import yaml
    HAS_YAML = True
except ImportError:
    HAS_YAML = False


def parse_yaml_frontmatter(content: str) -> Tuple[Dict[str, Any], str]:
    """
    Parse YAML front matter from markdown content.
    
    Args:
        content: Full markdown file content
        
    Returns:
        Tuple of (frontmatter_dict, body_content)
    """
    # Match YAML front matter between --- markers
    pattern = r'^---\s*\n(.*?)\n---\s*\n(.*)$'
    match = re.match(pattern, content, re.DOTALL)
    
    if not match:
        return {}, content
    
    yaml_content = match.group(1)
    body = match.group(2)
    
    if HAS_YAML:
        try:
            frontmatter = yaml.safe_load(yaml_content)
            return frontmatter if frontmatter else {}, body
        except yaml.YAMLError:
            pass
    
    # Fallback: Simple regex-based parsing for key: value pairs
    frontmatter = {}
    for line in yaml_content.split('\n'):
        line = line.strip()
        if ':' in line and not line.startswith('#'):
            key, _, value = line.partition(':')
            key = key.strip()
            value = value.strip().strip('"').strip("'")
            
            # Try to convert to appropriate types
            if value.lower() == 'true':
                value = True
            elif value.lower() == 'false':
                value = False
            elif re.match(r'^-?\d+$', value):
                value = int(value)
            elif re.match(r'^-?\d+(\.\d+)?$', value):
                value = float(value)
            
            frontmatter[key] = value
    
    return frontmatter, body


def load_theme_file(filepath: str) -> Dict[str, Any]:
    """
    Load and parse a single theme markdown file.
    
    Args:
        filepath: Path to the theme markdown file
        
    Returns:
        Dictionary containing the theme configuration from front matter
    """
    try:
        with open(filepath, 'r', encoding='utf-8') as f:
            content = f.read()
        
        frontmatter, _ = parse_yaml_frontmatter(content)
        return frontmatter
    except FileNotFoundError:
        print(f"Theme file not found: {filepath}")
        return {}
    except Exception as e:
        print(f"Error loading theme file {filepath}: {e}")
        return {}


def load_theme_config(theme_dir: str = "index.directory/theme.c") -> Dict[str, Any]:
    """
    Load all theme configuration from the theme.c directory.
    
    Args:
        theme_dir: Path to the theme.c directory
        
    Returns:
        Dictionary containing all theme settings organized by component
    """
    theme_path = Path(theme_dir)
    
    if not theme_path.exists():
        print(f"Theme directory not found: {theme_dir}")
        return get_default_theme()
    
    config = {
        'colors': {},
        'glass': {},
        'header': {},
        'glowbubbles': {},
        'messages': {},
        'metadata': {
            'loaded_at': datetime.now().isoformat(),
            'source': str(theme_path)
        }
    }
    
    # Load each theme file
    for theme_file in theme_path.glob("theme.*.md"):
        filename = theme_file.name
        
        # Skip README
        if filename == "README.md":
            continue
        
        data = load_theme_file(str(theme_file))
        
        if not data:
            continue
        
        component = data.get('component', '')
        
        # Route to appropriate config section
        if component == 'colors':
            config['colors'] = {
                'primary_color': data.get('primary_color', '#00ff88'),
                'accent_color': data.get('accent_color', '#ffd93d'),
                'red_color': data.get('red_color', '#ff4757'),
                'blue_color': data.get('blue_color', '#00d4ff'),
                'bg_primary': data.get('bg_primary', '#0a0e27'),
                'bg_secondary': data.get('bg_secondary', '#0f1429'),
                'border_color': data.get('border_color', '#27272a'),
                'text_primary': data.get('text_primary', '#e4e4e7'),
                'text_secondary': data.get('text_secondary', '#a1a1aa'),
            }
        elif component == 'glass':
            config['glass'] = {
                'opacity': data.get('opacity', 0.55),
                'blur': data.get('blur', 45),
                'border_opacity': data.get('border_opacity', 0.12),
                'shadow_opacity': data.get('shadow_opacity', 0.25),
            }
        elif component == 'header':
            config['header'] = {
                'background_color': data.get('background_color', 'rgba(10, 14, 39, 0.55)'),
                'border_color': data.get('border_color', 'rgba(255, 255, 255, 0.12)'),
                'text_color': data.get('text_color', '#e4e4e7'),
                'logo_color': data.get('logo_color', '#00ff88'),
                'height': data.get('height', '60px'),
                'blur': data.get('blur', 20),
            }
        elif component.startswith('glowbubble.'):
            bubble_name = component.replace('glowbubble.', '')
            config['glowbubbles'][bubble_name] = {
                'color': data.get('color', 'rgba(0, 255, 136, 1)'),
                'glow_intensity': data.get('glow_intensity', 0.3),
                'size': data.get('size', 44),
                'border_width': data.get('border_width', 2),
            }
        elif component == 'messages':
            config['messages'] = {
                'index': data.get('index', 'Welcome to Your Trading Journal'),
                'dashboard': data.get('dashboard', 'Welcome to Your Trading Journal'),
                'add_trade': data.get('add_trade', 'Add New Trade'),
                'add_note': data.get('add_note', 'Add New Note'),
                'add_pdf': data.get('add_pdf', 'Upload Trade PDF'),
                'all_trades': data.get('all_trades', 'All Trades'),
                'all_weeks': data.get('all_weeks', 'Weekly Performance'),
                'analytics': data.get('analytics', 'Analytics Dashboard'),
                'books': data.get('books', 'Trading Books Library'),
                'notes': data.get('notes', 'Trading Notes'),
                'review': data.get('review', 'Trade Review'),
                'import': data.get('import', 'Import Trading Data'),
                'customization': data.get('customization', 'Customize Your Journal'),
            }
    
    # Fill in defaults for any missing values
    config = merge_with_defaults(config)
    
    return config


def get_default_theme() -> Dict[str, Any]:
    """
    Return default theme configuration.
    
    Returns:
        Dictionary containing default theme settings
    """
    return {
        'colors': {
            'primary_color': '#00ff88',
            'accent_color': '#ffd93d',
            'red_color': '#ff4757',
            'blue_color': '#00d4ff',
            'bg_primary': '#0a0e27',
            'bg_secondary': '#0f1429',
            'border_color': '#27272a',
            'text_primary': '#e4e4e7',
            'text_secondary': '#a1a1aa',
        },
        'glass': {
            'opacity': 0.55,
            'blur': 45,
            'border_opacity': 0.12,
            'shadow_opacity': 0.25,
        },
        'header': {
            'background_color': 'rgba(10, 14, 39, 0.55)',
            'border_color': 'rgba(255, 255, 255, 0.12)',
            'text_color': '#e4e4e7',
            'logo_color': '#00ff88',
            'height': '60px',
            'blur': 20,
        },
        'glowbubbles': {
            'profile': {'color': 'rgba(147, 51, 234, 1)', 'glow_intensity': 0.3, 'size': 44, 'border_width': 2},
            'add': {'color': 'rgba(0, 255, 136, 1)', 'glow_intensity': 0.3, 'size': 56, 'border_width': 2},
            'books': {'color': 'rgba(100, 255, 218, 1)', 'glow_intensity': 0.3, 'size': 44, 'border_width': 2},
            'notes': {'color': 'rgba(147, 51, 234, 1)', 'glow_intensity': 0.3, 'size': 44, 'border_width': 2},
            'trades': {'color': 'rgba(251, 191, 36, 1)', 'glow_intensity': 0.3, 'size': 44, 'border_width': 2},
            'mentors': {'color': 'rgba(236, 72, 153, 1)', 'glow_intensity': 0.3, 'size': 44, 'border_width': 2},
        },
        'messages': {
            'index': 'Welcome to Your Trading Journal',
            'dashboard': 'Welcome to Your Trading Journal',
            'add_trade': 'Add New Trade',
            'add_note': 'Add New Note',
            'add_pdf': 'Upload Trade PDF',
            'all_trades': 'All Trades',
            'all_weeks': 'Weekly Performance',
            'analytics': 'Analytics Dashboard',
            'books': 'Trading Books Library',
            'notes': 'Trading Notes',
            'review': 'Trade Review',
            'import': 'Import Trading Data',
            'customization': 'Customize Your Journal',
        },
        'metadata': {
            'loaded_at': datetime.now().isoformat(),
            'source': 'defaults'
        }
    }


def merge_with_defaults(config: Dict[str, Any]) -> Dict[str, Any]:
    """
    Merge loaded config with defaults to ensure all values exist.
    
    Args:
        config: Loaded theme configuration
        
    Returns:
        Complete theme configuration with defaults filled in
    """
    defaults = get_default_theme()
    
    # Merge colors
    if 'colors' not in config or not config['colors']:
        config['colors'] = defaults['colors']
    else:
        for key, value in defaults['colors'].items():
            if key not in config['colors']:
                config['colors'][key] = value
    
    # Merge glass
    if 'glass' not in config or not config['glass']:
        config['glass'] = defaults['glass']
    else:
        for key, value in defaults['glass'].items():
            if key not in config['glass']:
                config['glass'][key] = value
    
    # Merge header
    if 'header' not in config or not config['header']:
        config['header'] = defaults['header']
    else:
        for key, value in defaults['header'].items():
            if key not in config['header']:
                config['header'][key] = value
    
    # Merge glowbubbles
    if 'glowbubbles' not in config or not config['glowbubbles']:
        config['glowbubbles'] = defaults['glowbubbles']
    else:
        for bubble, values in defaults['glowbubbles'].items():
            if bubble not in config['glowbubbles']:
                config['glowbubbles'][bubble] = values
    
    # Merge messages
    if 'messages' not in config or not config['messages']:
        config['messages'] = defaults['messages']
    else:
        for key, value in defaults['messages'].items():
            if key not in config['messages']:
                config['messages'][key] = value
    
    return config


def generate_css_variables(theme: Dict[str, Any]) -> str:
    """
    Generate CSS custom properties from theme configuration.
    
    Args:
        theme: Theme configuration dictionary
        
    Returns:
        CSS string with custom property definitions
    """
    colors = theme.get('colors', {})
    glass = theme.get('glass', {})
    
    css_vars = []
    
    # Color variables
    css_vars.append(f"--accent-green: {colors.get('primary_color', '#00ff88')};")
    css_vars.append(f"--accent-yellow: {colors.get('accent_color', '#ffd93d')};")
    css_vars.append(f"--accent-red: {colors.get('red_color', '#ff4757')};")
    css_vars.append(f"--accent-blue: {colors.get('blue_color', '#00d4ff')};")
    css_vars.append(f"--bg-primary: {colors.get('bg_primary', '#0a0e27')};")
    css_vars.append(f"--bg-secondary: {colors.get('bg_secondary', '#0f1429')};")
    css_vars.append(f"--border-color: {colors.get('border_color', '#27272a')};")
    
    # Glass variables
    css_vars.append(f"--glass-opacity-light: {glass.get('opacity', 0.55)};")
    css_vars.append(f"--glass-blur-medium: {glass.get('blur', 45)}px;")
    
    return "\n        ".join(css_vars)


def generate_inline_style(theme: Dict[str, Any]) -> str:
    """
    Generate an inline <style> block with theme CSS variables.
    
    Args:
        theme: Theme configuration dictionary
        
    Returns:
        HTML style block string
    """
    css_vars = generate_css_variables(theme)
    
    return f"""<style>
    :root {{
        {css_vars}
    }}
    </style>"""


def get_theme_value(theme: Dict[str, Any], category: str, key: str, default: Any) -> Any:
    """
    Safely retrieve a theme value with nested dictionary access.
    
    Args:
        theme: Theme configuration dictionary
        category: Category (e.g., 'colors', 'glass', 'header')
        key: Property key within category
        default: Default value if not found
        
    Returns:
        Theme value or default
        
    Example:
        >>> color = get_theme_value(theme, 'colors', 'primary_color', '#00ff88')
    """
    return theme.get(category, {}).get(key, default)


def get_page_message(theme: Dict[str, Any], page_key: str, default: str = '') -> str:
    """
    Get the customizable message for a specific page.
    
    Args:
        theme: Theme configuration dictionary
        page_key: Page identifier (e.g., 'index', 'add_trade', 'analytics')
        default: Default message if not found
        
    Returns:
        Page message string
        
    Example:
        >>> msg = get_page_message(theme, 'analytics', 'Analytics Dashboard')
    """
    return theme.get('messages', {}).get(page_key, default)


# Standalone execution for testing
if __name__ == "__main__":
    print("Loading theme configuration...")
    theme = load_theme_config()
    
    print("\n📦 Theme Configuration:")
    print(f"  Colors: {len(theme.get('colors', {}))} properties")
    print(f"  Glass: {len(theme.get('glass', {}))} properties")
    print(f"  Header: {len(theme.get('header', {}))} properties")
    print(f"  Glowbubbles: {len(theme.get('glowbubbles', {}))} bubbles")
    
    print("\n🎨 Color Values:")
    for key, value in theme.get('colors', {}).items():
        print(f"  {key}: {value}")
    
    print("\n✨ Glass Effects:")
    for key, value in theme.get('glass', {}).items():
        print(f"  {key}: {value}")
    
    print("\n💫 Glow Bubbles:")
    for bubble, values in theme.get('glowbubbles', {}).items():
        print(f"  {bubble}: {values.get('color')}")
    
    print("\n📝 Generated CSS Variables:")
    print(generate_css_variables(theme))
