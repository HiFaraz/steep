#!/usr/bin/env python3
# Pretty print JSON files with syntax highlighting
# 1.0.0

import json
import sys
from pathlib import Path

def pretty_print_json(file_path):
    """Pretty print a JSON file with indentation."""
    try:
        with open(file_path, 'r') as f:
            data = json.load(f)
        
        print(json.dumps(data, indent=2, sort_keys=True))
        return 0
    except json.JSONDecodeError as e:
        print(f"Error: Invalid JSON in {file_path}: {e}", file=sys.stderr)
        return 1
    except FileNotFoundError:
        print(f"Error: File not found: {file_path}", file=sys.stderr)
        return 1
    except Exception as e:
        print(f"Error: {e}", file=sys.stderr)
        return 1

if __name__ == "__main__":
    if len(sys.argv) != 2:
        print("Usage: json-pretty <file.json>")
        sys.exit(1)
    
    sys.exit(pretty_print_json(sys.argv[1]))