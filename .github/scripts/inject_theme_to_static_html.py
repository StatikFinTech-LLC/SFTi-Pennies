#!/usr/bin/env python3
"""
Inject Theme CSS Variables into Static HTML Files

This script processes static HTML files and injects theme CSS variables
from theme.c markdown files. It ensures all HTML files in the project
have consistent theming, not just the Python-generated ones.

Static HTML files processed:
- index.html (root)
- index.directory/*.html (all static pages)

The script:
1. Loads theme configuration from theme.c markdown files
2. Generates CSS variable block
3. Finds and replaces the theme-color meta tag
4. Injects or updates the theme CSS variables in the <head> section
"""

import os
import re
from theme_parser import load_theme_config, generate_css_variables, get_theme_value


def inject_theme_into_html(html_content: str, theme: dict) -> str:
    """
    Inject theme CSS variables into HTML content.
    
    Args:
        html_content: Original HTML content
        theme: Theme configuration dictionary
        
    Returns:
        Modified HTML content with theme CSS variables
    """
    # Generate CSS variables
    css_vars = generate_css_variables(theme)
    theme_block = f"""  <!-- Theme CSS Variables -->
    <style>
    :root {{
        {css_vars}
    }}
    </style>"""
    
    # Update theme-color meta tag
    primary_color = get_theme_value(theme, 'colors', 'primary_color', '#00ff88')
    html_content = re.sub(
        r'<meta name="theme-color" content="[^"]*">',
        f'<meta name="theme-color" content="{primary_color}">',
        html_content
    )
    
    # Check if theme block already exists
    if '<!-- Theme CSS Variables -->' in html_content:
        # Replace existing theme block (flexible pattern to handle varying indentation)
        pattern = r'\s*<!-- Theme CSS Variables -->.*?</style>'
        html_content = re.sub(pattern, theme_block, html_content, flags=re.DOTALL)
    else:
        # Insert theme block before </head>
        html_content = html_content.replace('</head>', f'{theme_block}\n</head>')
    
    return html_content


def process_html_file(file_path: str, theme: dict) -> bool:
    """
    Process a single HTML file and inject theme.
    
    Args:
        file_path: Path to HTML file
        theme: Theme configuration dictionary
        
    Returns:
        True if file was modified, False otherwise
    """
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            original_content = f.read()
        
        # Inject theme
        modified_content = inject_theme_into_html(original_content, theme)
        
        # Only write if content changed
        if modified_content != original_content:
            with open(file_path, 'w', encoding='utf-8') as f:
                f.write(modified_content)
            return True
        
        return False
    
    except Exception as e:
        print(f"  ❌ Error processing {file_path}: {e}")
        return False


def main():
    """Main execution function"""
    print("🎨 Injecting theme CSS variables into static HTML files...")
    
    # Load theme configuration
    theme = load_theme_config()
    print(f"✅ Loaded theme configuration")
    print(f"   Primary color: {get_theme_value(theme, 'colors', 'primary_color', '#00ff88')}")
    
    # List of static HTML files to process
    static_html_files = [
        'index.html',
        'index.directory/add-note.html',
        'index.directory/add-pdf.html',
        'index.directory/add-trade.html',
        'index.directory/all-weeks.html',
        'index.directory/analytics.html',
        'index.directory/books.html',
        'index.directory/customization.html',
        'index.directory/import.html',
        'index.directory/notes.html',
        'index.directory/review.html',
    ]
    
    modified_count = 0
    skipped_count = 0
    
    print(f"\n📂 Processing {len(static_html_files)} static HTML files...")
    
    for file_path in static_html_files:
        if not os.path.exists(file_path):
            print(f"  ⚠️  Skipped (not found): {file_path}")
            skipped_count += 1
            continue
        
        was_modified = process_html_file(file_path, theme)
        if was_modified:
            print(f"  ✅ Updated: {file_path}")
            modified_count += 1
        else:
            print(f"  ⏭️  Unchanged: {file_path}")
            skipped_count += 1
    
    print(f"\n✨ Theme injection complete!")
    print(f"   Modified: {modified_count} files")
    print(f"   Unchanged: {skipped_count} files")
    
    if modified_count > 0:
        print(f"\n💡 Theme CSS variables have been injected into all static HTML files.")
        print(f"   All pages now use the same theme configuration from theme.c/")


if __name__ == "__main__":
    main()
