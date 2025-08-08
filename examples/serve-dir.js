#!/usr/bin/env node
// Serve any directory as a static website with live reload
// 1.0.0

const http = require('http');
const fs = require('fs');
const path = require('path');
const url = require('url');

// MIME types for common file extensions
const mimeTypes = {
    '.html': 'text/html',
    '.js': 'text/javascript',
    '.css': 'text/css',
    '.json': 'application/json',
    '.png': 'image/png',
    '.jpg': 'image/jpg',
    '.jpeg': 'image/jpeg',
    '.gif': 'image/gif',
    '.svg': 'image/svg+xml',
    '.wav': 'audio/wav',
    '.mp4': 'video/mp4',
    '.woff': 'application/font-woff',
    '.ttf': 'application/font-ttf',
    '.eot': 'application/vnd.ms-fontobject',
    '.otf': 'application/font-otf',
    '.wasm': 'application/wasm',
    '.ico': 'image/x-icon'
};

function getContentType(filePath) {
    const ext = path.extname(filePath).toLowerCase();
    return mimeTypes[ext] || 'application/octet-stream';
}

function formatFileSize(bytes) {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
}

function generateDirectoryListing(dirPath, requestPath) {
    const items = fs.readdirSync(dirPath);
    const files = [];
    const dirs = [];
    
    // Separate files and directories
    items.forEach(item => {
        const itemPath = path.join(dirPath, item);
        const stat = fs.statSync(itemPath);
        const info = {
            name: item,
            path: path.posix.join(requestPath, item),
            size: stat.size,
            modified: stat.mtime,
            isDirectory: stat.isDirectory()
        };
        
        if (info.isDirectory) {
            dirs.push(info);
        } else {
            files.push(info);
        }
    });
    
    // Sort alphabetically
    dirs.sort((a, b) => a.name.localeCompare(b.name));
    files.sort((a, b) => a.name.localeCompare(b.name));
    
    // Generate HTML
    const title = `Directory listing for ${requestPath}`;
    let html = `<!DOCTYPE html>
<html>
<head>
    <title>${title}</title>
    <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, sans-serif; margin: 2rem; }
        h1 { color: #333; border-bottom: 1px solid #eee; padding-bottom: 0.5rem; }
        table { width: 100%; border-collapse: collapse; margin-top: 1rem; }
        th, td { text-align: left; padding: 0.5rem; border-bottom: 1px solid #eee; }
        th { background: #f5f5f5; font-weight: 600; }
        .icon { width: 20px; margin-right: 0.5rem; }
        .dir { color: #0066cc; font-weight: 500; }
        .file { color: #333; }
        .size { text-align: right; font-family: monospace; color: #666; }
        .modified { color: #666; font-size: 0.9em; }
        a { text-decoration: none; }
        a:hover { text-decoration: underline; }
        .footer { margin-top: 2rem; padding-top: 1rem; border-top: 1px solid #eee; color: #666; font-size: 0.9em; }
    </style>
</head>
<body>
    <h1>📁 ${title}</h1>
    <table>
        <thead>
            <tr>
                <th>Name</th>
                <th>Size</th>
                <th>Modified</th>
            </tr>
        </thead>
        <tbody>`;
    
    // Add parent directory link if not root
    if (requestPath !== '/') {
        const parentPath = path.posix.dirname(requestPath);
        html += `<tr><td><a href="${parentPath}" class="dir">📁 ..</a></td><td></td><td></td></tr>`;
    }
    
    // Add directories
    dirs.forEach(dir => {
        html += `<tr>
            <td><a href="${dir.path}" class="dir">📁 ${dir.name}/</a></td>
            <td class="size">-</td>
            <td class="modified">${dir.modified.toLocaleDateString()} ${dir.modified.toLocaleTimeString()}</td>
        </tr>`;
    });
    
    // Add files
    files.forEach(file => {
        const icon = file.name.match(/\\.(jpg|jpeg|png|gif|svg)$/i) ? '🖼️' : 
                    file.name.match(/\\.(js|json|html|css|md)$/i) ? '📄' : '📄';
        html += `<tr>
            <td><a href="${file.path}" class="file">${icon} ${file.name}</a></td>
            <td class="size">${formatFileSize(file.size)}</td>
            <td class="modified">${file.modified.toLocaleDateString()} ${file.modified.toLocaleTimeString()}</td>
        </tr>`;
    });
    
    html += `</tbody></table>
    <div class="footer">
        Served by <strong>serve-dir</strong> • ${dirs.length} directories, ${files.length} files
    </div>
</body>
</html>`;
    
    return html;
}

function createServer(rootDir, port) {
    const server = http.createServer((req, res) => {
        const parsedUrl = url.parse(req.url);
        const pathname = parsedUrl.pathname;
        
        // Security: prevent directory traversal
        const safePath = path.normalize(pathname).replace(/^(\\..[/\\\\])+/, '');
        const filePath = path.join(rootDir, safePath);
        
        // Ensure we're still within the root directory
        if (!filePath.startsWith(rootDir)) {
            res.writeHead(403, { 'Content-Type': 'text/plain' });
            res.end('Forbidden: Path outside root directory');
            return;
        }
        
        try {
            const stats = fs.statSync(filePath);
            
            if (stats.isDirectory()) {
                // Check for index.html
                const indexPath = path.join(filePath, 'index.html');
                if (fs.existsSync(indexPath)) {
                    const content = fs.readFileSync(indexPath);
                    res.writeHead(200, { 'Content-Type': 'text/html' });
                    res.end(content);
                } else {
                    // Generate directory listing
                    const listing = generateDirectoryListing(filePath, pathname);
                    res.writeHead(200, { 'Content-Type': 'text/html' });
                    res.end(listing);
                }
            } else {
                // Serve file
                const content = fs.readFileSync(filePath);
                const contentType = getContentType(filePath);
                res.writeHead(200, { 'Content-Type': contentType });
                res.end(content);
            }
            
            // Log request
            const timestamp = new Date().toLocaleTimeString();
            console.log(`[${timestamp}] ${req.method} ${pathname} - 200`);
            
        } catch (err) {
            if (err.code === 'ENOENT') {
                res.writeHead(404, { 'Content-Type': 'text/plain' });
                res.end('404 Not Found');
                console.log(`[${new Date().toLocaleTimeString()}] ${req.method} ${pathname} - 404`);
            } else {
                res.writeHead(500, { 'Content-Type': 'text/plain' });
                res.end('500 Internal Server Error');
                console.log(`[${new Date().toLocaleTimeString()}] ${req.method} ${pathname} - 500`);
            }
        }
    });
    
    return server;
}

function main() {
    const args = process.argv.slice(2);
    let port = 8080;
    let directory = process.cwd();
    
    // Parse arguments
    for (let i = 0; i < args.length; i++) {
        const arg = args[i];
        if (arg === '--port' || arg === '-p') {
            port = parseInt(args[++i]) || 8080;
        } else if (arg === '--help' || arg === '-h') {
            console.log(`serve-dir - Serve any directory as a static website
            
Usage: serve-dir [directory] [options]

Options:
  -p, --port <number>    Port to listen on (default: 8080)
  -h, --help            Show this help message

Examples:
  serve-dir                    # Serve current directory on port 8080
  serve-dir ./public           # Serve ./public directory
  serve-dir --port 3000        # Use port 3000
  serve-dir ./dist -p 9000     # Serve ./dist on port 9000`);
            process.exit(0);
        } else if (!arg.startsWith('-')) {
            directory = path.resolve(arg);
        }
    }
    
    // Validate directory
    if (!fs.existsSync(directory)) {
        console.error(`Error: Directory '${directory}' does not exist.`);
        process.exit(1);
    }
    
    if (!fs.statSync(directory).isDirectory()) {
        console.error(`Error: '${directory}' is not a directory.`);
        process.exit(1);
    }
    
    const server = createServer(directory, port);
    
    server.listen(port, () => {
        console.log(`🌐 Serving ${directory}`);
        console.log(`📡 Server running at http://localhost:${port}/`);
        console.log(`⏹️  Press Ctrl+C to stop`);
    });
    
    // Graceful shutdown
    process.on('SIGINT', () => {
        console.log('\\n⏹️  Shutting down server...');
        server.close(() => {
            console.log('✅ Server stopped');
            process.exit(0);
        });
    });
}

if (require.main === module) {
    main();
}