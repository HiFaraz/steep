#!/usr/bin/env python3
# Batch resize images with smart defaults and quality optimization
# 1.0.0

import argparse
import os
import sys
from pathlib import Path
from PIL import Image, ImageOps
import subprocess

def get_image_size(file_path):
    """Get human-readable file size."""
    size = file_path.stat().st_size
    for unit in ['B', 'KB', 'MB', 'GB']:
        if size < 1024.0:
            return f"{size:.1f}{unit}"
        size /= 1024.0
    return f"{size:.1f}TB"

def resize_image(input_path, output_path, max_width, max_height, quality=85):
    """Resize a single image with quality optimization."""
    try:
        with Image.open(input_path) as img:
            # Convert to RGB if necessary (handles transparency)
            if img.mode in ('RGBA', 'LA', 'P'):
                background = Image.new('RGB', img.size, (255, 255, 255))
                if img.mode == 'P':
                    img = img.convert('RGBA')
                background.paste(img, mask=img.split()[-1] if img.mode == 'RGBA' else None)
                img = background
            
            # Calculate new size maintaining aspect ratio
            img.thumbnail((max_width, max_height), Image.Resampling.LANCZOS)
            
            # Apply auto-orientation based on EXIF
            img = ImageOps.exif_transpose(img)
            
            # Save with optimization
            save_kwargs = {
                'format': 'JPEG',
                'quality': quality,
                'optimize': True
            }
            
            if output_path.suffix.lower() in ['.png']:
                save_kwargs = {
                    'format': 'PNG',
                    'optimize': True
                }
            
            img.save(output_path, **save_kwargs)
            return True
            
    except Exception as e:
        print(f"Error processing {input_path}: {e}", file=sys.stderr)
        return False

def main():
    parser = argparse.ArgumentParser(
        description='Batch resize images with smart defaults',
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog='''
Examples:
  img-resize *.jpg                    # Resize to 1920x1080 (default)
  img-resize *.png --size 800         # Resize to 800x800
  img-resize photos/ --width 1200     # Resize directory to width 1200
  img-resize img.jpg --suffix thumb   # Create img_thumb.jpg
        '''
    )
    
    parser.add_argument('files', nargs='+', help='Image files or directories to process')
    parser.add_argument('--width', type=int, default=1920, help='Maximum width (default: 1920)')
    parser.add_argument('--height', type=int, default=1080, help='Maximum height (default: 1080)')
    parser.add_argument('--size', type=int, help='Set both width and height to same value')
    parser.add_argument('--quality', type=int, default=85, help='JPEG quality 1-100 (default: 85)')
    parser.add_argument('--suffix', default='', help='Add suffix to output files (default: overwrite)')
    parser.add_argument('--output-dir', help='Output directory (default: same as input)')
    parser.add_argument('--dry-run', action='store_true', help='Show what would be done')
    parser.add_argument('--verbose', '-v', action='store_true', help='Verbose output')
    
    args = parser.parse_args()
    
    if args.size:
        args.width = args.height = args.size
    
    # Collect all image files
    image_extensions = {'.jpg', '.jpeg', '.png', '.bmp', '.tiff', '.webp'}
    files_to_process = []
    
    for file_arg in args.files:
        path = Path(file_arg)
        if path.is_file() and path.suffix.lower() in image_extensions:
            files_to_process.append(path)
        elif path.is_dir():
            for ext in image_extensions:
                files_to_process.extend(path.glob(f'*{ext}'))
                files_to_process.extend(path.glob(f'*{ext.upper()}'))
        else:
            print(f"Warning: {path} is not a valid image file or directory", file=sys.stderr)
    
    if not files_to_process:
        print("No image files found to process.", file=sys.stderr)
        return 1
    
    print(f"📸 Found {len(files_to_process)} images to resize")
    print(f"   Target size: {args.width}x{args.height}")
    print(f"   Quality: {args.quality}%")
    
    if args.dry_run:
        print("\n🔍 Dry run - showing what would be processed:")
        for file_path in files_to_process[:10]:  # Show first 10
            print(f"  {file_path} ({get_image_size(file_path)})")
        if len(files_to_process) > 10:
            print(f"  ... and {len(files_to_process) - 10} more")
        return 0
    
    # Process files
    processed = 0
    total_size_before = 0
    total_size_after = 0
    
    for i, input_path in enumerate(files_to_process, 1):
        if args.verbose:
            print(f"[{i}/{len(files_to_process)}] Processing {input_path}")
        
        # Calculate output path
        if args.output_dir:
            output_dir = Path(args.output_dir)
            output_dir.mkdir(exist_ok=True)
            if args.suffix:
                stem = input_path.stem + f'_{args.suffix}'
                output_path = output_dir / f'{stem}{input_path.suffix}'
            else:
                output_path = output_dir / input_path.name
        else:
            if args.suffix:
                stem = input_path.stem + f'_{args.suffix}'
                output_path = input_path.parent / f'{stem}{input_path.suffix}'
            else:
                output_path = input_path
        
        # Track file sizes
        size_before = input_path.stat().st_size
        total_size_before += size_before
        
        # Resize image
        if resize_image(input_path, output_path, args.width, args.height, args.quality):
            size_after = output_path.stat().st_size
            total_size_after += size_after
            processed += 1
            
            if args.verbose:
                reduction = ((size_before - size_after) / size_before * 100) if size_before > 0 else 0
                print(f"  {get_image_size(input_path)} → {get_image_size(output_path)} ({reduction:+.1f}%)")
    
    # Summary
    print(f"\n✅ Processed {processed}/{len(files_to_process)} images")
    if total_size_before > 0:
        total_reduction = ((total_size_before - total_size_after) / total_size_before * 100)
        print(f"   Size change: {get_image_size(Path('.')).replace('.', str(total_size_before))} → {get_image_size(Path('.')).replace('.', str(total_size_after))} ({total_reduction:+.1f}%)")
    
    return 0 if processed == len(files_to_process) else 1

if __name__ == '__main__':
    try:
        sys.exit(main())
    except KeyboardInterrupt:
        print("\n⚠️  Interrupted by user", file=sys.stderr)
        sys.exit(130)
    except ImportError as e:
        if 'PIL' in str(e):
            print("Error: Pillow library required. Install with: pip install Pillow", file=sys.stderr)
            sys.exit(1)
        raise