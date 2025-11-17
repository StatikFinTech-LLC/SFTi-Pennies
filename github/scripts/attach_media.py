#!/usr/bin/env python3
"""
Attach Media Script
Validates and reconciles media file references in trade metadata

This script provides media management functionality:
1. Scans index.directory/assets/trade-images/ for images
2. Validates that trade metadata references are correct
3. Updates trade markdown frontmatter with image paths
4. Reports orphaned images (not linked to any trade)
5. Validates image files (existence, format, size)
"""

import os
import json
import glob
from pathlib import Path


def scan_trade_images():
    """
    Scan for trade images in assets/trade-images/

    Returns:
        dict: {trade_id: [image_paths]}
    """
    images_dir = Path("index.directory/assets/trade-images")

    if not images_dir.exists():
        print(f"Images directory not found: {images_dir}")
        return {}

    trade_images = {}

    # Scan subdirectories (organized by trade_id)
    for trade_dir in images_dir.iterdir():
        if not trade_dir.is_dir():
            continue

        trade_id = trade_dir.name
        images = []

        # Find all image files
        for ext in ["*.jpg", "*.jpeg", "*.png", "*.gif", "*.webp"]:
            images.extend(glob.glob(str(trade_dir / ext)))

        if images:
            trade_images[trade_id] = sorted(images)

    return trade_images


def validate_image_references(trade, image_path):
    """
    Validate that an image file exists and is accessible

    Args:
        trade (dict): Trade dictionary
        image_path (str): Path to image

    Returns:
        tuple: (is_valid: bool, message: str or None)
            - is_valid: False for validation errors, True for valid files (including those with warnings)
            - message: Error message when is_valid=False, warning message when is_valid=True but file has issues, None when is_valid=True and no issues
    """
    if not os.path.exists(image_path):
        return False, f"Image file does not exist: {image_path}"

    # Check file size (warn if > 5MB, but still valid)
    warning_message = None
    try:
        file_size = os.path.getsize(image_path)
        if file_size > 5 * 1024 * 1024:  # 5MB
            warning_message = (
                f"Warning: Large image file ({file_size / (1024*1024):.1f}MB)"
            )
    except OSError as e:
        return False, f"Cannot read file size: {e}"

    # Verify image format by extension
    valid_extensions = [".jpg", ".jpeg", ".png", ".gif", ".webp"]
    _, ext = os.path.splitext(image_path.lower())
    if ext not in valid_extensions:
        return False, f"Unsupported image format: {ext}"

    # Check read permissions
    if not os.access(image_path, os.R_OK):
        return False, f"File is not readable: {image_path}"

    return True, warning_message


def update_trade_metadata(trade_file_path, image_paths):
    """
    Update trade markdown frontmatter with image references

    Args:
        trade_file_path (str): Path to trade markdown file
        image_paths (list): List of image paths

    Returns:
        bool: True if successful, False otherwise
    """
    try:
        # Read markdown file
        with open(trade_file_path, "r", encoding="utf-8") as f:
            content = f.read()

        # Split frontmatter and body
        if not content.startswith("---"):
            print(f"  ⚠️  No frontmatter found in {trade_file_path}")
            return False

        parts = content.split("---", 2)
        if len(parts) < 3:
            print(f"  ⚠️  Invalid frontmatter format in {trade_file_path}")
            return False

        frontmatter = parts[1]
        body = parts[2]

        # Parse YAML-like frontmatter (simple parsing for images field)
        lines = frontmatter.split("\n")
        new_lines = []
        in_images_section = False
        images_updated = False

        for line in lines:
            if line.strip().startswith("images:") or line.strip().startswith(
                "screenshots:"
            ):
                in_images_section = True
                new_lines.append("screenshots:")
                # Add image paths
                for img_path in image_paths:
                    new_lines.append(f"  - {img_path}")
                images_updated = True
            elif in_images_section and (line.startswith("  -") or not line.strip()):
                # Skip old image entries
                if not line.strip():
                    in_images_section = False
                continue
            else:
                in_images_section = False
                new_lines.append(line)

        # If no images field existed, add it
        if not images_updated:
            new_lines.append("screenshots:")
            for img_path in image_paths:
                new_lines.append(f"  - {img_path}")

        # Reconstruct file content
        new_frontmatter = "\n".join(new_lines)
        new_content = f"---{new_frontmatter}---{body}"

        # Write back to file
        with open(trade_file_path, "w", encoding="utf-8") as f:
            f.write(new_content)

        print(f"  ✓ Updated {trade_file_path} with {len(image_paths)} image(s)")
        return True

    except Exception as e:
        print(f"  ❌ Error updating {trade_file_path}: {e}")
        return False


def find_orphaned_images(trade_images, trades):
    """
    Find images that are not linked to any trade

    Args:
        trade_images (dict): {trade_id: [image_paths]}
        trades (list): List of trade dictionaries

    Returns:
        list: List of orphaned image paths
    """
    # Get all trade IDs from trades
    trade_ids = {f"trade-{t.get('trade_number', 0):03d}" for t in trades}

    orphaned = []
    for trade_id, images in trade_images.items():
        if trade_id not in trade_ids:
            orphaned.extend(images)

    return orphaned


def generate_validation_report(trade_images, trades, orphaned, updated_files):
    """
    Generate a validation report HTML file

    Args:
        trade_images (dict): {trade_id: [image_paths]}
        trades (list): List of trade dictionaries
        orphaned (list): List of orphaned image paths
        updated_files (list): List of updated trade files
    """
    total_images = sum(len(imgs) for imgs in trade_images.values())

    report_html = f"""<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Media Validation Report - SFTi-Pennies</title>
    <style>
        body {{
            font-family: 'Inter', sans-serif;
            background: #0a0e1a;
            color: #e4e4e7;
            padding: 2rem;
            line-height: 1.6;
        }}
        .container {{
            max-width: 1200px;
            margin: 0 auto;
        }}
        h1 {{
            color: #00ff88;
            margin-bottom: 0.5rem;
        }}
        .summary {{
            background: #1a1f2e;
            padding: 1.5rem;
            border-radius: 8px;
            margin: 1.5rem 0;
            border-left: 4px solid #00ff88;
        }}
        .stat {{
            display: flex;
            justify-content: space-between;
            padding: 0.5rem 0;
        }}
        .stat-label {{
            color: #9ca3af;
        }}
        .stat-value {{
            font-weight: 600;
            color: #00ff88;
        }}
        .section {{
            background: #1a1f2e;
            padding: 1.5rem;
            border-radius: 8px;
            margin: 1.5rem 0;
        }}
        .section h2 {{
            color: #ffd700;
            margin-bottom: 1rem;
        }}
        .trade-item {{
            background: #0f1420;
            padding: 1rem;
            border-radius: 6px;
            margin: 0.75rem 0;
        }}
        .image-list {{
            margin-top: 0.5rem;
            padding-left: 1rem;
        }}
        .image-item {{
            color: #9ca3af;
            font-family: 'JetBrains Mono', monospace;
            font-size: 0.875rem;
            padding: 0.25rem 0;
        }}
        .warning {{
            color: #ff4757;
        }}
        .success {{
            color: #00ff88;
        }}
        .timestamp {{
            color: #9ca3af;
            font-size: 0.875rem;
        }}
    </style>
</head>
<body>
    <div class="container">
        <h1>📸 Media Validation Report</h1>
        <p class="timestamp">Generated: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}</p>
        
        <div class="summary">
            <h2 style="margin-top: 0;">Summary</h2>
            <div class="stat">
                <span class="stat-label">Total Images:</span>
                <span class="stat-value">{total_images}</span>
            </div>
            <div class="stat">
                <span class="stat-label">Trades with Images:</span>
                <span class="stat-value">{len(trade_images)}</span>
            </div>
            <div class="stat">
                <span class="stat-label">Orphaned Images:</span>
                <span class="stat-value {'warning' if orphaned else 'success'}">{len(orphaned)}</span>
            </div>
            <div class="stat">
                <span class="stat-label">Updated Files:</span>
                <span class="stat-value">{len(updated_files)}</span>
            </div>
        </div>
        
        <div class="section">
            <h2>✓ Linked Images</h2>
            {''.join([f'''
            <div class="trade-item">
                <strong>{trade_id}</strong> ({len(images)} image{'s' if len(images) != 1 else ''})
                <div class="image-list">
                    {''.join([f'<div class="image-item">• {img}</div>' for img in images])}
                </div>
            </div>
            ''' for trade_id, images in trade_images.items()])}
        </div>
        
        {f'''
        <div class="section">
            <h2 class="warning">⚠️ Orphaned Images</h2>
            <p style="color: #9ca3af; margin-bottom: 1rem;">
                These images are not linked to any trade. They may be from deleted trades or incorrectly named directories.
            </p>
            <div class="image-list">
                {''.join([f'<div class="image-item warning">• {img}</div>' for img in orphaned])}
            </div>
        </div>
        ''' if orphaned else '<div class="section"><h2 class="success">✓ No Orphaned Images</h2><p style="color: #9ca3af;">All images are properly linked to trades.</p></div>'}
        
        {f'''
        <div class="section">
            <h2 class="success">✓ Updated Trade Files</h2>
            <div class="image-list">
                {''.join([f'<div class="image-item success">• {f}</div>' for f in updated_files])}
            </div>
        </div>
        ''' if updated_files else ''}
    </div>
</body>
</html>
"""

    # Write report to file
    report_path = Path("index.directory/media-validation-report.html")
    with open(report_path, "w", encoding="utf-8") as f:
        f.write(report_html)

    print(f"\n✓ Generated validation report: {report_path}")
    return report_path


def main():
    """Main execution function"""
    print("=" * 60)
    print("SFTi-Pennies Media Attachment Validator")
    print("=" * 60)

    # Scan for images
    print("\n[Step 1/4] Scanning for trade images...")
    trade_images = scan_trade_images()

    if not trade_images:
        print("No trade images found in index.directory/assets/trade-images/")
        print("Images should be organized in subdirectories like:")
        print("  index.directory/assets/trade-images/trade-001/screenshot1.png")
        print("  index.directory/assets/trade-images/trade-001/screenshot2.png")
        return

    total_images = sum(len(imgs) for imgs in trade_images.values())
    print(f"Found {total_images} image(s) across {len(trade_images)} trade(s)")

    for trade_id, images in trade_images.items():
        print(f"  {trade_id}: {len(images)} image(s)")

    # Load trades
    print("\n[Step 2/4] Loading trades index...")
    try:
        with open("index.directory/trades-index.json", "r", encoding="utf-8") as f:
            index_data = json.load(f)
        trades = index_data.get("trades", [])
        print(f"Loaded {len(trades)} trade(s)")
    except FileNotFoundError:
        print("Error: trades-index.json not found")
        return

    # Find orphaned images
    print("\n[Step 3/4] Checking for orphaned images...")
    orphaned = find_orphaned_images(trade_images, trades)

    if orphaned:
        print(f"⚠️  Found {len(orphaned)} orphaned image(s):")
        for img in orphaned:
            print(f"  - {img}")
    else:
        print("✓ No orphaned images found")

    # Update trade metadata
    print("\n[Step 4/4] Updating trade metadata...")
    updated_files = []

    for trade in trades:
        trade_number = trade.get("trade_number", 0)
        trade_id = f"trade-{trade_number:03d}"

        if trade_id in trade_images:
            # Find trade markdown file
            trade_files = glob.glob(
                f"index.directory/SFTi.Tradez/**/trade-{trade_number:03d}*.md",
                recursive=True,
            )

            if trade_files:
                trade_file = trade_files[0]
                # Convert image paths to relative paths from trade file location
                relative_images = []
                for img_path in trade_images[trade_id]:
                    # Make path relative to trade file
                    rel_path = os.path.relpath(img_path, os.path.dirname(trade_file))
                    relative_images.append(rel_path)

                if update_trade_metadata(trade_file, relative_images):
                    updated_files.append(trade_file)
            else:
                print(f"  ⚠️  Trade file not found for {trade_id}")

    # Generate validation report
    print("\n[Report] Generating validation report...")
    report_path = generate_validation_report(
        trade_images, trades, orphaned, updated_files
    )

    print("\n" + "=" * 60)
    print("Summary:")
    print(f"  Total images: {total_images}")
    print(f"  Linked trades: {len(trade_images)}")
    print(f"  Orphaned images: {len(orphaned)}")
    print(f"  Updated files: {len(updated_files)}")
    print(f"  Report: {report_path}")
    print("=" * 60)


if __name__ == "__main__":
    main()
