#!/usr/bin/env python3
"""
Generate Trade Detail Pages Script
Creates individual HTML pages for each trade with full details, charts, and media

Features:
- Generates responsive HTML pages with trade metrics
- Displays P&L, risk management, and trade details
- Includes image galleries with GLightbox integration
- Shows strategy and setup tags
- Mobile-friendly design with dark theme

Performance Optimizations:
- List comprehensions for gallery and tag rendering
- Efficient string joining instead of concatenation in loops
- Pre-computed formatting with f-strings

Output: index.directory/trades/{trade-id}.html
"""

import os
from pathlib import Path
from datetime import datetime
from navbar_template import get_navbar_html
from globals_utils import setup_imports, calculate_time_in_trade

# Setup imports
setup_imports(__file__)
from utils import load_trades_index


def generate_trade_html(trade):
    """
    Generate HTML for a single trade detail page with full details

    Args:
        trade (dict): Trade dictionary

    Returns:
        str: HTML content
    """
    # Extract trade data
    trade_number = trade.get("trade_number", 0)
    ticker = trade.get("ticker", "UNKNOWN")
    entry_date = trade.get("entry_date", "")
    entry_time = trade.get("entry_time", "")
    exit_date = trade.get("exit_date", "")
    exit_time = trade.get("exit_time", "")
    entry_price = trade.get("entry_price", 0)
    exit_price = trade.get("exit_price", 0)
    position_size = trade.get("position_size", 0)
    pnl_usd = trade.get("pnl_usd", 0)
    pnl_percent = trade.get("pnl_percent", 0)
    direction = trade.get("direction", "LONG")
    strategy = trade.get("strategy", "Unknown")
    stop_loss = trade.get("stop_loss", 0)
    target_price = trade.get("target_price", 0)
    risk_reward_ratio = trade.get("risk_reward_ratio", 0)
    broker = trade.get("broker", "Unknown")
    notes = trade.get("notes", "No notes recorded.")

    # Get tags (v1.1 schema)
    strategy_tags = trade.get("strategy_tags", [])
    setup_tags = trade.get("setup_tags", [])
    session_tags = trade.get("session_tags", [])
    market_condition_tags = trade.get("market_condition_tags", [])

    # Get images
    images = trade.get("images", [])
    screenshots = trade.get("screenshots", [])
    if not images and screenshots:
        images = screenshots if isinstance(screenshots, list) else []

    # Calculate additional metrics using utility function
    time_in_trade = calculate_time_in_trade(entry_date, entry_time, exit_date, exit_time)

    # Generate tag badges HTML
    def render_tags(tags, color):
        if not tags:
            return '<span style="color: var(--text-secondary); font-style: italic;">None</span>'
        # Use list comprehension and join for better performance
        return "".join([
            f'<span style="display: inline-block; padding: 0.25rem 0.75rem; background: {color}; color: white; border-radius: 4px; font-size: 0.875rem; margin-right: 0.5rem; margin-bottom: 0.5rem;">{tag}</span>'
            for tag in tags
        ])

    # Generate image gallery HTML
    gallery_html = ""
    if images and len(images) > 0:
        # Use list comprehension with pre-computed paths to avoid duplicate operations
        gallery_items = []
        for idx, img in enumerate(images):
            if img and img != "None" and img.strip():
                img_path = img.replace("../../assets/", "../assets/")
                gallery_items.append(f"""
                <a href="{img_path}" class="glightbox" data-gallery="trade-{trade_number}">
                    <img src="{img_path}" alt="Trade screenshot {idx+1}" style="width: 200px; height: 150px; object-fit: cover; border-radius: 8px; cursor: pointer; border: 2px solid var(--border-color); transition: all 0.3s;">
                </a>
                """)

        if gallery_items:
            gallery_html = f"""
            <div style="background: var(--bg-secondary); padding: 1.5rem; border-radius: 8px; margin-bottom: 1.5rem;">
                <h2 style="margin-bottom: 1rem;">📸 Screenshots</h2>
                <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(200px, 1fr)); gap: 1rem;">
                    {''.join(gallery_items)}
                </div>
            </div>
            """
        else:
            gallery_html = """
            <div style="background: var(--bg-secondary); padding: 1.5rem; border-radius: 8px; margin-bottom: 1.5rem;">
                <h2 style="margin-bottom: 1rem;">📸 Screenshots</h2>
                <p style="color: var(--text-secondary); margin: 0;">No screenshots available for this trade.</p>
            </div>
            """

    # Generate full HTML template
    html = f"""<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0, viewport-fit=cover">
  <meta name="description" content="Trade #{trade_number} - {ticker} details and analysis">
  <meta name="theme-color" content="#00ff88">
  
  <title>Trade #{trade_number} - {ticker} - SFTi-Pennies</title>
  
  <!-- Fonts -->
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500;600;700&display=swap" rel="stylesheet">
  
  <!-- Tailwind CDN -->
  <script src="https://cdn.tailwindcss.com"></script>
  
  <!-- GLightbox CSS -->
  <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/glightbox/dist/css/glightbox.min.css">
  
  <!-- Custom Styles -->
  <link rel="stylesheet" href="../assets/css/main.css">
  <link rel="stylesheet" href="../assets/css/glass-effects.css">
  <link rel="stylesheet" href="../assets/css/glowing-bubbles.css">
  
  <!-- PWA Manifest -->
  <link rel="manifest" href="../../manifest.json">
  
  <!-- Icons -->
  <link rel="icon" type="image/png" sizes="192x192" href="../assets/icons/icon-192.png">
</head>
<body>
  <canvas id="bg-canvas"></canvas>
  
{get_navbar_html("subdirectory")}
  
  <!-- Main Content -->
  <main class="container">
    <section>
      <!-- Header -->
      <div style="margin-bottom: 2rem;">
        <div style="display: flex; align-items: center; gap: 1rem; margin-bottom: 0.5rem; flex-wrap: wrap;">
          <h1 style="margin: 0;">Trade #{trade_number}: {ticker}</h1>
          <span style="padding: 0.375rem 1rem; background: {'rgba(0,255,136,0.2)' if pnl_usd >= 0 else 'rgba(255,71,87,0.2)'}; color: {'var(--accent-green)' if pnl_usd >= 0 else 'var(--accent-red)'}; border-radius: 6px; font-weight: 700; font-size: 0.875rem; text-transform: uppercase; letter-spacing: 0.05em;">
            {'🎯 WIN' if pnl_usd >= 0 else '❌ LOSS'}
          </span>
        </div>
        <div style="display: flex; gap: 1rem; align-items: center; flex-wrap: wrap;">
          <p style="color: var(--text-secondary); margin: 0;">{strategy} | {direction}</p>
          <span style="color: var(--text-secondary);">•</span>
          <p style="color: var(--text-secondary); margin: 0;">{broker}</p>
        </div>
      </div>
      
      <!-- Key Metrics Grid -->
      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: 1rem; margin-bottom: 2rem;">
        <div style="background: var(--bg-secondary); padding: 1.25rem; border-radius: 8px; border: 2px solid {'var(--accent-green)' if pnl_usd >= 0 else 'var(--accent-red)'};">
          <div style="font-size: 0.75rem; color: var(--text-secondary); text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 0.5rem;">P&L (USD)</div>
          <div style="font-family: var(--font-mono); font-size: 2rem; font-weight: 700; color: {'var(--accent-green)' if pnl_usd >= 0 else 'var(--accent-red)'};">
            ${pnl_usd:.2f}
          </div>
        </div>
        <div style="background: var(--bg-secondary); padding: 1.25rem; border-radius: 8px;">
          <div style="font-size: 0.75rem; color: var(--text-secondary); text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 0.5rem;">P&L (%)</div>
          <div style="font-family: var(--font-mono); font-size: 2rem; font-weight: 700; color: {'var(--accent-green)' if pnl_percent >= 0 else 'var(--accent-red)'};">
            {'+' if pnl_percent >= 0 else ''}{pnl_percent:.2f}%
          </div>
        </div>
        <div style="background: var(--bg-secondary); padding: 1.25rem; border-radius: 8px;">
          <div style="font-size: 0.75rem; color: var(--text-secondary); text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 0.5rem;">Position Size</div>
          <div style="font-family: var(--font-mono); font-size: 1.5rem; font-weight: 600;">
            {position_size} shares
          </div>
        </div>
        <div style="background: var(--bg-secondary); padding: 1.25rem; border-radius: 8px;">
          <div style="font-size: 0.75rem; color: var(--text-secondary); text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 0.5rem;">Time in Trade</div>
          <div style="font-family: var(--font-mono); font-size: 1.5rem; font-weight: 600;">
            {time_in_trade}
          </div>
        </div>
      </div>
      
      <!-- Trade Details -->
      <div style="background: var(--bg-secondary); padding: 1.5rem; border-radius: 8px; margin-bottom: 1.5rem;">
        <h2 style="margin-bottom: 1.5rem;">📊 Trade Details</h2>
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 1.5rem;">
          <div>
            <h3 style="font-size: 0.875rem; color: var(--accent-green); text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 0.75rem;">Entry</h3>
            <div style="display: flex; flex-direction: column; gap: 0.5rem;">
              <div style="display: flex; justify-content: space-between;">
                <span style="color: var(--text-secondary);">Price:</span>
                <span style="font-family: var(--font-mono); font-weight: 600;">${entry_price:.2f}</span>
              </div>
              <div style="display: flex; justify-content: space-between;">
                <span style="color: var(--text-secondary);">Date:</span>
                <span style="font-family: var(--font-mono);">{entry_date}</span>
              </div>
              <div style="display: flex; justify-content: space-between;">
                <span style="color: var(--text-secondary);">Time:</span>
                <span style="font-family: var(--font-mono);">{entry_time}</span>
              </div>
            </div>
          </div>
          <div>
            <h3 style="font-size: 0.875rem; color: var(--accent-red); text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 0.75rem;">Exit</h3>
            <div style="display: flex; flex-direction: column; gap: 0.5rem;">
              <div style="display: flex; justify-content: space-between;">
                <span style="color: var(--text-secondary);">Price:</span>
                <span style="font-family: var(--font-mono); font-weight: 600;">${exit_price:.2f}</span>
              </div>
              <div style="display: flex; justify-content: space-between;">
                <span style="color: var(--text-secondary);">Date:</span>
                <span style="font-family: var(--font-mono);">{exit_date}</span>
              </div>
              <div style="display: flex; justify-content: space-between;">
                <span style="color: var(--text-secondary);">Time:</span>
                <span style="font-family: var(--font-mono);">{exit_time}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <!-- Risk Management -->
      <div style="background: var(--bg-secondary); padding: 1.5rem; border-radius: 8px; margin-bottom: 1.5rem;">
        <h2 style="margin-bottom: 1.5rem;">🎯 Risk Management</h2>
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 1.5rem;">
          <div>
            <div style="font-size: 0.875rem; color: var(--text-secondary); margin-bottom: 0.5rem;">Stop Loss</div>
            <div style="font-family: var(--font-mono); font-size: 1.25rem; font-weight: 600; color: var(--accent-red);">
              ${stop_loss:.2f}
            </div>
          </div>
          <div>
            <div style="font-size: 0.875rem; color: var(--text-secondary); margin-bottom: 0.5rem;">Target Price</div>
            <div style="font-family: var(--font-mono); font-size: 1.25rem; font-weight: 600; color: var(--accent-green);">
              ${target_price:.2f}
            </div>
          </div>
          <div>
            <div style="font-size: 0.875rem; color: var(--text-secondary); margin-bottom: 0.5rem;">Risk:Reward Ratio</div>
            <div style="font-family: var(--font-mono); font-size: 1.25rem; font-weight: 600; color: var(--accent-yellow);">
              1:{risk_reward_ratio:.2f}
            </div>
          </div>
        </div>
      </div>
      
      <!-- Tags Section -->
      <div style="background: var(--bg-secondary); padding: 1.5rem; border-radius: 8px; margin-bottom: 1.5rem;">
        <h2 style="margin-bottom: 1.5rem;">🏷️ Tags & Classification</h2>
        <div style="display: grid; gap: 1rem;">
          <div>
            <div style="font-size: 0.875rem; color: var(--text-secondary); margin-bottom: 0.5rem;">Strategy Tags:</div>
            <div>{render_tags(strategy_tags, 'var(--accent-green)')}</div>
          </div>
          <div>
            <div style="font-size: 0.875rem; color: var(--text-secondary); margin-bottom: 0.5rem;">Setup Tags:</div>
            <div>{render_tags(setup_tags, 'var(--accent-blue)')}</div>
          </div>
          <div>
            <div style="font-size: 0.875rem; color: var(--text-secondary); margin-bottom: 0.5rem;">Session Tags:</div>
            <div>{render_tags(session_tags, 'var(--accent-yellow)')}</div>
          </div>
          <div>
            <div style="font-size: 0.875rem; color: var(--text-secondary); margin-bottom: 0.5rem;">Market Condition Tags:</div>
            <div>{render_tags(market_condition_tags, 'var(--accent-red)')}</div>
          </div>
        </div>
      </div>
      
      <!-- Screenshots Gallery -->
      {gallery_html}
      
      <!-- Notes Section -->
      <div style="background: var(--bg-secondary); padding: 1.5rem; border-radius: 8px; margin-bottom: 1.5rem;">
        <h2 style="margin-bottom: 1rem;">📝 Notes & Journal</h2>
        <div style="line-height: 1.8; color: var(--text-primary);">
          {notes.replace(chr(10), '<br>')}
        </div>
      </div>
      
    </section>
  </main>
  
  <!-- Footer - Generated by footer.js -->
  
  <!-- GLightbox JS -->
  <script src="https://cdn.jsdelivr.net/gh/mcstudios/glightbox/dist/js/glightbox.min.js"></script>
  <script>
    // Initialize GLightbox for image gallery
    const lightbox = GLightbox({{
      selector: '.glightbox',
      touchNavigation: true,
      loop: true,
      autoplayVideos: true
    }});
  </script>
  
  <!-- Load shared utilities first -->
  <script src="../assets/js/utils.js"></script>
  <script src="../assets/js/chartConfig.js"></script>
  
  <!-- Application scripts -->
  <script src="../assets/js/navbar.js"></script>
  <script src="../assets/js/footer.js"></script>
  <script src="../assets/js/background.js"></script>
  <script src="../assets/js/auth.js"></script>
  <script src="../assets/js/app.js"></script>
  <script src="../assets/js/glowing-bubbles.js"></script>
</body>
</html>
"""

    return html


def main():
    """Main execution function"""
    print("Generating trade detail pages...")

    # Load trades
    index_data = load_trades_index()
    if not index_data:
        return

    trades = index_data.get("trades", [])
    if not trades:
        print("No trades found")
        return

    print(f"Processing {len(trades)} trade(s)...")

    # Create output directory
    output_dir = Path("index.directory/trades")
    output_dir.mkdir(parents=True, exist_ok=True)

    # Generate pages
    for trade in trades:
        trade_number = trade.get("trade_number", 0)
        ticker = trade.get("ticker", "UNKNOWN")

        # Generate HTML
        html_content = generate_trade_html(trade)

        # Write file
        filename = f"trade-{trade_number:03d}-{ticker}.html"
        filepath = output_dir / filename

        with open(filepath, "w", encoding="utf-8") as f:
            f.write(html_content)

        print(f"Generated: {filepath}")

    print(f"\n✓ Generated {len(trades)} trade detail page(s)")
    print(f"Output directory: {output_dir}")


if __name__ == "__main__":
    main()
