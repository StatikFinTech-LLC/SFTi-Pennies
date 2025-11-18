#!/bin/bash
#
# Optimize Images Script
# Moves images from .github/assets/ to assets/images/ and optimizes them
# This ensures images are served from the public assets directory on GitHub Pages
#

set -e

echo "Starting image optimization..."

# Create target directory
mkdir -p assets/images

# Check if source directory exists
if [ ! -d ".github/assets" ]; then
    echo "No .github/assets directory found, skipping image optimization"
    exit 0
fi

# Find all images in .github/assets (excluding existing trade folders in assets/)
image_count=0

# Process trade-specific images
for trade_dir in .github/assets/trade-*; do
    if [ -d "$trade_dir" ]; then
        trade_name=$(basename "$trade_dir")
        echo "Processing $trade_name..."
        
        # Create corresponding directory in assets/images
        target_dir="assets/images/$trade_name"
        mkdir -p "$target_dir"
        
        # Find and copy images
        shopt -s nullglob
        for ext in jpg jpeg png gif JPG JPEG PNG GIF; do
            for img in "$trade_dir"/*.$ext; do
                if [ -f "$img" ]; then
                    filename=$(basename "$img")
                    
                    # Copy to assets
                    cp "$img" "$target_dir/$filename"
                    echo "  Copied: $filename"
                    ((image_count++))
                    
                    # Optimize images if tools are available
                    if command -v optipng &> /dev/null && [[ "$filename" == *.png ]]; then
                        optipng -quiet "$target_dir/$filename" 2>/dev/null || echo "    (optipng failed, keeping original)"
                    elif command -v jpegoptim &> /dev/null && [[ "$filename" =~ \.(jpg|jpeg|JPG|JPEG)$ ]]; then
                        jpegoptim --quiet --max=85 "$target_dir/$filename" 2>/dev/null || echo "    (jpegoptim failed, keeping original)"
                    fi
                fi
            done
        done
        shopt -u nullglob
    fi
done

# Also handle any loose images in .github/assets root
shopt -s nullglob
for ext in jpg jpeg png gif JPG JPEG PNG GIF; do
    for img in .github/assets/*.$ext; do
        if [ -f "$img" ]; then
            filename=$(basename "$img")
            
            # Skip if already processed
            if [ ! -f "assets/images/$filename" ]; then
                cp "$img" "assets/images/$filename"
                echo "Copied: $filename"
                ((image_count++))
                
                # Optimize if tools available
                if command -v optipng &> /dev/null && [[ "$filename" == *.png ]]; then
                    optipng -quiet "assets/images/$filename" 2>/dev/null || true
                elif command -v jpegoptim &> /dev/null && [[ "$filename" =~ \.(jpg|jpeg|JPG|JPEG)$ ]]; then
                    jpegoptim --quiet --max=85 "assets/images/$filename" 2>/dev/null || true
                fi
            fi
        fi
    done
done
shopt -u nullglob

echo "Image optimization complete!"
echo "Processed $image_count image(s)"

# Note: Original images in .github/assets/ are kept for version control
# The optimized versions in assets/images/ are what gets served on GitHub Pages
