#!/usr/bin/env bash
# Generate a project directory structure with common files
# 1.0.0

# Quick project scaffolding tool
# Usage: project-init <name> [type]

set -e

PROJECT_NAME="${1:-my-project}"
PROJECT_TYPE="${2:-web}"

if [[ -z "$PROJECT_NAME" ]]; then
    echo "Usage: project-init <name> [web|api|cli]"
    exit 1
fi

if [[ -d "$PROJECT_NAME" ]]; then
    echo "Error: Directory '$PROJECT_NAME' already exists"
    exit 1
fi

echo "🚀 Creating $PROJECT_TYPE project: $PROJECT_NAME"

# Create project structure
mkdir -p "$PROJECT_NAME"/{src,tests,docs}

# Create common files based on type
case "$PROJECT_TYPE" in
    "web")
        cat > "$PROJECT_NAME/src/index.html" << 'EOF'
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>New Project</title>
</head>
<body>
    <h1>Welcome to your new project!</h1>
</body>
</html>
EOF
        ;;
    "api")
        cat > "$PROJECT_NAME/src/main.py" << 'EOF'
#!/usr/bin/env python3
"""API starter template."""

from flask import Flask

app = Flask(__name__)

@app.route('/')
def hello():
    return {'message': 'Hello from your new API!'}

if __name__ == '__main__':
    app.run(debug=True)
EOF
        ;;
    "cli")
        cat > "$PROJECT_NAME/src/main.sh" << 'EOF'
#!/usr/bin/env bash
# CLI tool starter template
echo "Your new CLI tool is ready!"
EOF
        chmod +x "$PROJECT_NAME/src/main.sh"
        ;;
esac

# Create README
cat > "$PROJECT_NAME/README.md" << EOF
# $PROJECT_NAME

A new $PROJECT_TYPE project created with project-init.

## Getting Started

TODO: Add setup and usage instructions

## Contributing

TODO: Add contribution guidelines
EOF

# Create .gitignore
cat > "$PROJECT_NAME/.gitignore" << 'EOF'
# Dependencies
node_modules/
__pycache__/
*.pyc

# Build outputs  
dist/
build/
*.egg-info/

# Environment
.env
.venv/

# IDE
.vscode/
.idea/
*.swp
EOF

echo "✅ Project '$PROJECT_NAME' created successfully!"
echo "📁 Structure:"
find "$PROJECT_NAME" -type f | head -10 | sed 's/^/   /'
echo ""
echo "💡 Next steps:"
echo "   cd $PROJECT_NAME"
echo "   # Start building your $PROJECT_TYPE project!"