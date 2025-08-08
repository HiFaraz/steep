# Steep 🍵

**Got a useful script? Make it a command in seconds.**

```bash
# Turn any script into a proper command
steep install ./my-script.sh

# Now use it anywhere
my-script
```

No GitHub repos. No taps. No complexity. Just `steep install <script>` and you're done.

---

## Why Steep?

You've written a helpful script. Maybe it resizes images, processes data, or automates deployment. You want to use it everywhere, but:

- 🙄 Creating a GitHub repo feels like overkill  
- 😴 Managing Homebrew taps is too much work
- 🤷 Copying scripts around is messy and hard to update

**Steep solves this.** Point it at any script and get a clean, Homebrew-managed command instantly.

## Features

- 🚀 **One-command installation** - No GitHub, no taps, just `steep install ./script`
- 📦 **Proper Homebrew integration** - Managed like any other brew formula
- 🔍 **Smart metadata extraction** - Reads description and version from script headers
- 🛡️ **Version management** - Downgrade protection, upgrade support
- 🔄 **Self-updating** - Steep can update itself with `steep install --self`
- 📋 **Script management** - List, uninstall, diagnose, and extract installed scripts
- ✅ **Enhanced security** - Guards against world-writable paths and symlinks
- 🛡️ **Integrity verification** - SHA256 validation and post-install checksum checks
- 🤖 **CI-friendly** - Quiet mode and non-interactive options
- 🎯 **Smart defaults** - TTY-aware prompts and original filename detection
- 📦 **Portable bundles** - Export/import scripts between machines
- 🔍 **Pre-flight validation** - Check scripts before installation
- 🧪 **Self-testing** - Built-in functionality verification
- 📊 **Machine-readable output** - JSON format for automation
- ⚠️ **Conflict detection** - Warns about command name conflicts

## Get Started in 30 Seconds

```bash
# 1. Get Steep
curl -O https://raw.githubusercontent.com/HiFaraz/steep/main/steep
chmod +x steep && ./steep install --self

# 2. Install any script  
steep install ./your-script.sh

# 3. Use it anywhere
your-script
```

That's it. Your script is now a proper command managed by Homebrew.

## Script Header Format (Important!)

**Your scripts need metadata in lines 2-3 for Steep to work properly:**

```bash
#!/usr/bin/env bash
# Description of what your script does
# 1.0.0

# Your script code here...
```

Works with any language:

```python
#!/usr/bin/env python3
# Process CSV files with smart defaults
# 1.0.0
```

```javascript
#!/usr/bin/env node
// Convert between data formats
// 1.0.0
```

## Command Reference

### Basic Operations
```bash
steep install ./script            # Install a script
steep install ./script --upgrade  # Upgrade existing script
steep install --self              # Install/update Steep itself
steep list                        # Show scripts with Steep markers (.steep-meta.json)
steep uninstall NAME              # Remove script (refuses if not Steep-installed)
```

### Validation & Diagnostics
```bash
steep check ./script              # Validate before installing
steep doctor NAME                 # Verify Cellar link, print exact fix commands
steep install ./script --dry-run  # Preview installation
steep install ./script --print-metadata  # Show detected metadata
steep self-test                   # Install/verify/extract/uninstall test (non-zero on failure)
```

### Script Recovery & Portability
```bash
steep extract NAME                # Recreate script from installation
steep bundle ./my-bundle          # Export all scripts to directory
steep restore ./my-bundle         # Import scripts from bundle
```

### Configuration Options
```bash
--name NAME                       # Override command name
--desc "Description"              # Override description  
--version X.Y.Z                   # Override version
--allow-downgrade                 # Allow older versions
--force                           # Overwrite existing files
--as-original                     # Use original filename
```

### Output & Automation
```bash
--json                           # Machine-readable JSON output
--quiet, -q                      # Suppress non-error output
--verbose, -v                    # Detailed output
--yes, -y                        # Non-interactive mode
--keep-formula                   # Keep generated formula
--allow-world-writable           # Override security checks
```

**JSON Schema** (`steep list --json`):
```json
[
  {
    "name": "git-cleanup",
    "version": "1.0.0", 
    "description": "Clean up merged Git branches and stale references",
    "file_size": 4285,
    "installed_at": 1699123456,
    "metadata": { "steep_version": "1.0.0", "cmd": "git-cleanup", ... }
  }
]
```

**Exit Codes:**
| Code | Meaning |
|------|---------|
| 0 | Success |
| 1 | General error (missing file, invalid script) |
| 2 | Missing metadata (description/version) |
| 127 | Homebrew not found |


## Examples

### Creating an installable script

```bash
# Create a script with proper headers
cat > resize-images.sh << 'EOF'
#!/usr/bin/env bash
# Batch resize images in a directory
# 1.0.0

for img in *.{jpg,png}; do
    convert "$img" -resize 800x800 "resized-$img"
done
EOF

# Install it
steep install ./resize-images.sh

# Now use it anywhere
resize-images
```

### Managing installed scripts

```bash
# See what's installed
steep list

# Update a script
vim my-tool.sh  # bump version to 1.0.1
steep install ./my-tool.sh --upgrade

# Remove a script
steep uninstall my-tool

# Diagnose issues with a script
steep doctor my-tool

# Extract an installed script
steep extract my-tool               # recreates as 'my-tool'
steep extract my-tool --as-original # recreates with original filename (e.g., 'my-tool.sh')
```

## How It Works

1. **Reads metadata** from your script (or uses provided flags)
2. **Generates a Ruby formula** in a temp directory with proper URL and SHA256
3. **Runs brew install** with the temporary formula
4. **Marks installation** with `.steep-meta.json` in the Cellar
5. **Cleans up** the temporary formula (unless `--keep-formula`)

The formula uses `file://` URLs with version query parameters for cache-busting, ensuring brew always fetches the latest version when upgrading.

## Requirements

- macOS with [Homebrew](https://brew.sh) installed
- Python 3.8+ (for running Steep itself)
- Scripts must be executable (Steep will set the bit if needed)

## Advanced Workflows

#### Team bundles – share everything at once
```bash
steep bundle ./team-scripts        # Export all your tools
steep restore ./team-scripts       # Import on any machine
```

#### CI/CD – validate & install non-interactively  
```bash
steep check ./script.sh            # Validate in pipeline
steep install ./script.sh --quiet --yes  # Install without prompts
steep list --json | jq '.[0]'      # Get machine-readable status
```

#### Debugging – dry-run & keep formula
```bash
steep install ./script.sh --dry-run -v     # Preview with details  
steep install ./script.sh --keep-formula   # Inspect generated formula
steep self-test                    # Validate environment
```

#### Troubleshooting – diagnose & fix
```bash
steep doctor my-tool               # Comprehensive health check
```

**Example doctor output:**
```bash
$ steep doctor git-cleanup
🩺 Diagnosing 'git-cleanup'...

✅ Installed via Homebrew (version: 1.0.0)
✅ Installed by Steep
   Description: Clean up merged Git branches
   Version: 1.0.0
❌ Not properly linked
   Fix with: brew link git-cleanup --force
✅ Source file still exists
   Source unchanged since install
```

### Security Model

Steep's security approach:

- **Local sources only** - Uses `file://` URLs, never downloads from internet
- **SHA256 integrity** - Validates checksums before and after installation  
- **Directory safety** - Blocks world-writable dirs/symlinks (override with `--allow-world-writable`)
- **Conflict detection** - Warns about command name conflicts with existing binaries

```bash
# Validate script safety before installation
steep check ./untrusted-script.sh

# Override security checks if needed (use carefully)  
steep install ./script.sh --allow-world-writable --yes
```

## Limitations & Considerations

### Dependencies
- Scripts must handle their own dependencies
- No automatic dependency resolution
- Consider using `which` or similar checks in your scripts

### Performance
- Each installation creates a separate Homebrew formula
- Formula generation adds ~1-2 seconds per install
- Large scripts (>10MB) may take longer due to SHA256 calculation

### Platform Support  
- macOS only (requires Homebrew)
- Windows/Linux not supported

## FAQ

**Q: How do I distribute my script to others?**  
A: Share your script file and have them run `steep install ./yourscript`. For teams, use `steep bundle` to create portable distributions.

**Q: Can I use this with compiled binaries?**  
A: Yes! Steep works with any executable file, not just scripts.

**Q: How do I handle script dependencies?**  
A: Include dependency checks in your script. Consider using bundles to distribute multiple related scripts together.

**Q: How do I update Steep itself?**  
A: Run `steep install --self` to update to the latest version.

**Q: Can I install from URLs?**  
A: Not directly. Download first, then use Steep: `curl -O URL && steep install ./script`

**Q: What if I have naming conflicts?**  
A: Use `steep check` to detect conflicts, or `--name` to override the command name.

## Development & Testing

Steep is developed with **rigorous testing** to ensure reliability:

- **39+ comprehensive tests** covering all functionality
- **Integration tests** for Homebrew interactions
- **Edge case handling** for error conditions
- **Cross-platform compatibility** testing
- **Security validation** tests

```bash
# Run the full test suite
cd steep
python3 -m pytest tests/ -v

# Run Steep's built-in self-test
steep self-test
```

### Development Approach

This project was developed using **modern AI-assisted development** practices:
- Core functionality and architecture designed by human developers
- **Claude AI** used for implementation, testing, and documentation
- **Human oversight** for design decisions and quality assurance
- Extensive testing ensures reliability despite AI-generated code

The result is **well-tested, production-ready code** that you can trust with your development workflows.

## Contributing

Contributions welcome! Steep is a single-file Python script designed to be self-contained and easy to understand.

**Before contributing:**
1. Run the test suite to ensure everything works
2. Add tests for new functionality
3. Update documentation as needed

## License

MIT License - See [LICENSE](LICENSE) file for details.

## Author

Created with ❤️ by [Faraz Syed](https://github.com/HiFaraz) who didn't want to create a GitHub repo just to distribute simple scripts.

**Built with AI assistance** - This project demonstrates how AI can accelerate development while maintaining high code quality through comprehensive testing.