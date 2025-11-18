#!/usr/bin/env python3
"""
Generate Notes Index Script
Scans the SFTi.Notez directory and creates a JSON index
of all markdown files with metadata and excerpts
"""

import os
import yaml
from pathlib import Path
from datetime import datetime
from globals_utils import save_json_file


def extract_frontmatter(content):
    """
    Extract YAML frontmatter from markdown content

    Args:
        content (str): Markdown content

    Returns:
        tuple: (frontmatter_dict, markdown_body)
    """
    if not content.startswith("---"):
        return {}, content

    try:
        parts = content.split("---", 2)
        if len(parts) < 3:
            return {}, content

        frontmatter = yaml.safe_load(parts[1])
        body = parts[2].strip()
        return frontmatter, body
    except Exception as e:
        print(f"Error parsing frontmatter: {e}")
        return {}, content


def extract_title_from_markdown(content, filename):
    """
    Extract title from markdown content or filename

    Args:
        content (str): Markdown content
        filename (str): File name as fallback

    Returns:
        str: Title
    """
    # Try to find first H1 heading
    lines = content.split("\n")
    for line in lines:
        if line.startswith("# "):
            return line[2:].strip()
        elif line.startswith("**") and line.endswith("**"):
            # Handle bold text as title
            return line.strip("*").strip()

    # Fallback to filename
    return filename.replace(".md", "").replace(".", " ").replace("_", " ")


def extract_excerpt(content, max_length=150):
    """
    Extract a short excerpt from markdown content

    Args:
        content (str): Markdown content
        max_length (int): Maximum excerpt length

    Returns:
        str: Excerpt
    """
    # Remove headings and get first paragraph
    lines = content.split("\n")
    paragraphs = []

    for line in lines:
        line = line.strip()
        # Skip headings, horizontal rules, and empty lines
        if (
            line.startswith("#")
            or line.startswith("---")
            or line.startswith("```")
            or line.startswith(">")
            or line.startswith("<")
            or not line
        ):
            continue

        # Stop at image tags
        if "![" in line or "<img" in line:
            continue

        paragraphs.append(line)

        # Get first meaningful paragraph
        if len(" ".join(paragraphs)) > 50:
            break

    excerpt = " ".join(paragraphs)

    # Truncate if too long
    if len(excerpt) > max_length:
        excerpt = excerpt[:max_length].rsplit(" ", 1)[0] + "..."

    return excerpt


def find_thumbnail(content, note_file):
    """
    Find the first image in markdown content for thumbnail

    Args:
        content (str): Markdown content
        note_file (str): Note file path

    Returns:
        str: Thumbnail path or None
    """
    # Look for markdown images
    lines = content.split("\n")
    for line in lines:
        if "![" in line:
            # Extract image path from ![alt](path)
            start = line.find("](") + 2
            end = line.find(")", start)
            if start > 1 and end > start:
                img_path = line[start:end]
                # Convert relative path to absolute from note directory
                if img_path.startswith("../"):
                    return img_path[3:]  # Remove ../
                elif img_path.startswith("./"):
                    return os.path.dirname(note_file) + "/" + img_path[2:]
                return img_path

        # Look for HTML img tags
        if "<img" in line and "src=" in line:
            start = line.find('src="') + 5
            end = line.find('"', start)
            if start > 4 and end > start:
                img_path = line[start:end]
                if img_path.startswith("../"):
                    return img_path[3:]
                return img_path

    return None


def scan_notes_directory(directory="index.directory/SFTi.Notez"):
    """
    Scan the notes directory for markdown files

    Args:
        directory (str): Directory to scan

    Returns:
        list: List of note dictionaries
    """
    notes = []

    if not os.path.exists(directory):
        print(f"Directory {directory} not found")
        return notes

    # Get all markdown files except README.md
    # Note: README.md is intentionally excluded as it's a navigational/documentation file,
    # not an actual trading note with content meant to be displayed as a card
    md_files = [
        f for f in os.listdir(directory) if f.endswith(".md") and f != "README.md"
    ]

    for md_file in sorted(md_files):
        file_path = os.path.join(directory, md_file)

        try:
            with open(file_path, "r", encoding="utf-8") as f:
                content = f.read()

            # Extract frontmatter and body
            frontmatter, body = extract_frontmatter(content)

            # Extract title
            title = frontmatter.get("title") or extract_title_from_markdown(
                content, md_file
            )

            # Extract excerpt
            excerpt = extract_excerpt(body)

            # Find thumbnail
            thumbnail = find_thumbnail(content, file_path)

            # File stats
            file_stat = os.stat(file_path)

            note = {
                "title": title,
                "file": file_path,
                "filename": md_file,
                "excerpt": excerpt,
                "thumbnail": thumbnail,
                "size": file_stat.st_size,
                "modified": datetime.fromtimestamp(file_stat.st_mtime).isoformat(),
                "tags": frontmatter.get("tags", [])
                if isinstance(frontmatter.get("tags"), list)
                else [],
            }

            notes.append(note)
            print(f"Found note: {note['title']}")

        except Exception as e:
            print(f"Error processing {md_file}: {e}")
            continue

    return notes


def main():
    """Main execution function"""
    print("Generating notes index...")

    # Scan the notes directory
    notes = scan_notes_directory()

    if not notes:
        print("No notes found")
        # Create empty index
        output = {
            "notes": [],
            "total_count": 0,
            "generated_at": datetime.now().isoformat(),
            "version": "1.0",
        }
    else:
        print(f"Found {len(notes)} note(s)")

        output = {
            "notes": notes,
            "total_count": len(notes),
            "generated_at": datetime.now().isoformat(),
            "version": "1.0",
        }

    # Write JSON index
    output_file = "index.directory/notes-index.json"
    save_json_file(output_file, output)

    print(f"Notes index written to {output_file}")
    print(f"Total notes: {output['total_count']}")


if __name__ == "__main__":
    main()
