# Steep Examples

Real-world scripts that demonstrate Steep's value. These aren't toy examples—they're tools you'll actually want to use.

## 🛠️ Practical Tools

### project-init.sh
**Project scaffolding tool** - Create new projects with proper structure and boilerplate files.

```bash
steep install ./examples/project-init.sh

# Now available everywhere
project-init my-app web       # Create a web project
project-init api-server api   # Create an API project  
project-init cli-tool cli     # Create a CLI tool
```

**Why you'd want this as a command:** No more copy-pasting project templates or manually creating the same folder structure repeatedly.

---

### git-cleanup.sh  
**Git repository maintenance** - Clean merged branches, prune remotes, and optimize repositories.

```bash
steep install ./examples/git-cleanup.sh

# Use in any git repository
cd my-project && git-cleanup
cd another-repo && git-cleanup --yes  # Non-interactive mode
```

**Why you'd want this as a command:** Repository maintenance is something you do across multiple projects. Having it as a global command saves tons of time.

---

### img-resize.py
**Batch image processor** - Resize images with smart defaults, quality optimization, and progress reporting.

```bash
steep install ./examples/img-resize.py

# Resize photos for web
img-resize *.jpg --size 1200 --quality 80

# Create thumbnails  
img-resize photos/ --width 300 --suffix thumb

# Process with progress
img-resize large_photos/ --verbose
```

**Why you'd want this as a command:** Image processing is a common task across different projects. Much easier than remembering complex ImageMagick commands.

---

### serve-dir.js
**Static file server** - Serve any directory as a website with beautiful directory listings and proper MIME types.

```bash
steep install ./examples/serve-dir.js

# Instantly serve any directory
serve-dir                    # Current directory on port 8080
serve-dir ./build --port 3000  # Custom directory and port
serve-dir ~/Documents        # Serve documents folder
```

**Why you'd want this as a command:** Perfect for quickly sharing files, testing static sites, or previewing build outputs. No need to install global packages.

---

### json-pretty.py  
**JSON formatter** - Clean up JSON files with proper formatting and error handling.

```bash
steep install ./examples/json-pretty.py

# Format JSON files
json-pretty config.json
json-pretty api-response.json
```

**Why you'd want this as a command:** Quick JSON formatting without opening editors or installing tools.

## 🎯 The Steep Advantage

Notice how these examples show **real problems** that benefit from being **global commands**:

- ✅ **Cross-project utility** - Useful in multiple contexts
- ✅ **Memorable commands** - `git-cleanup` vs `~/scripts/git_maintenance.sh`  
- ✅ **Professional feel** - Commands integrate naturally into workflows
- ✅ **Easy updates** - `steep install script.py --upgrade` updates everywhere

## 📝 Script Format

All Steep scripts follow this simple format:

```bash
#!/usr/bin/env bash
# What your script does (one-line description)
# 1.0.0 (semantic version)

# Your script code here...
```

Works with any language:

```python
#!/usr/bin/env python3  
# Process data files with smart defaults
# 1.0.0
```

```javascript
#!/usr/bin/env node
// Serve static files with live reload  
// 1.0.0
```

```ruby
#!/usr/bin/env ruby
# Generate reports from log files
# 1.0.0
```

## 🚀 Try These Examples

```bash
# Install all examples as a bundle
steep bundle ./examples my-dev-tools

# On any machine, restore the bundle  
steep restore my-dev-tools

# Now you have project-init, git-cleanup, img-resize, etc. everywhere!
```