#!/usr/bin/env python3
"""
Generate Books Index Script
Scans the Informational.Bookz directory and creates a JSON index
of all PDF files with metadata
"""

import os
from pathlib import Path
from datetime import datetime
from globals_utils import save_json_file


def extract_book_title(filename):
    """
    Extract a readable title from the filename

    Args:
        filename (str): PDF filename

    Returns:
        str: Formatted title
    """
    # Remove .pdf extension and replace underscores with spaces
    title = filename.replace(".pdf", "").replace("_", " ")
    return title


def scan_books_directory(directory="index.directory/Informational.Bookz"):
    """
    Scan the books directory for PDF files

    Args:
        directory (str): Directory to scan

    Returns:
        list: List of book dictionaries
    """
    books = []

    if not os.path.exists(directory):
        print(f"Directory {directory} not found")
        return books

    # Get all PDF files
    pdf_files = [f for f in os.listdir(directory) if f.endswith(".pdf")]

    for pdf_file in sorted(pdf_files):
        file_path = os.path.join(directory, pdf_file)
        file_stat = os.stat(file_path)

        book = {
            "title": extract_book_title(pdf_file),
            "file": file_path,
            "filename": pdf_file,
            "size": file_stat.st_size,
            "size_mb": round(file_stat.st_size / (1024 * 1024), 2),
            "modified": datetime.fromtimestamp(file_stat.st_mtime).isoformat(),
            # Note: Cover images can be added manually or generated
            "cover": None,
        }

        books.append(book)
        print(f"Found book: {book['title']}")

    return books


def main():
    """Main execution function"""
    print("Generating books index...")

    # Scan the books directory
    books = scan_books_directory()

    if not books:
        print("No books found")
        # Create empty index
        output = {
            "books": [],
            "total_count": 0,
            "generated_at": datetime.now().isoformat(),
            "version": "1.0",
        }
    else:
        print(f"Found {len(books)} book(s)")

        output = {
            "books": books,
            "total_count": len(books),
            "generated_at": datetime.now().isoformat(),
            "version": "1.0",
        }

    # Write JSON index
    output_file = "index.directory/books-index.json"
    save_json_file(output_file, output)

    print(f"Books index written to {output_file}")
    print(f"Total books: {output['total_count']}")


if __name__ == "__main__":
    main()
