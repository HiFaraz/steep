#!/usr/bin/env bash
# Clean up merged Git branches and stale references
# 1.0.0

# Git repository cleanup tool
# Removes merged branches, stale remotes, and optimizes the repo

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Check if we're in a git repository
if ! git rev-parse --git-dir > /dev/null 2>&1; then
    echo -e "${RED}Error: Not in a Git repository${NC}"
    exit 1
fi

echo -e "${BLUE}🧹 Git Cleanup Tool${NC}"
echo -e "${BLUE}===================${NC}"

# Get current branch
CURRENT_BRANCH=$(git symbolic-ref --short HEAD 2>/dev/null || echo "HEAD")
echo -e "Current branch: ${GREEN}$CURRENT_BRANCH${NC}"
echo ""

# Update all remote references
echo -e "${YELLOW}📡 Fetching latest from remotes...${NC}"
git fetch --all --prune

# Find merged branches
echo -e "${YELLOW}🔍 Finding merged branches...${NC}"
MERGED_BRANCHES=$(git branch --merged | grep -v "^\*" | grep -v "master\|main\|develop" | xargs -n1 2>/dev/null || true)

if [[ -n "$MERGED_BRANCHES" ]]; then
    echo -e "${YELLOW}📋 Merged branches to delete:${NC}"
    echo "$MERGED_BRANCHES" | sed 's/^/  /'
    echo ""
    
    if [[ "${1:-}" != "--yes" ]]; then
        read -p "Delete these branches? [y/N]: " -n 1 -r
        echo ""
        if [[ ! $REPLY =~ ^[Yy]$ ]]; then
            echo "Skipping branch deletion."
        else
            echo "$MERGED_BRANCHES" | xargs git branch -d
            echo -e "${GREEN}✅ Deleted merged branches${NC}"
        fi
    else
        echo "$MERGED_BRANCHES" | xargs git branch -d
        echo -e "${GREEN}✅ Deleted merged branches${NC}"
    fi
else
    echo -e "${GREEN}✅ No merged branches to delete${NC}"
fi

# Clean up remote tracking branches
echo ""
echo -e "${YELLOW}🗑️  Cleaning up stale remote references...${NC}"
git remote prune origin

# Run garbage collection
echo -e "${YELLOW}♻️  Running garbage collection...${NC}"
git gc --auto

# Show repository statistics
echo ""
echo -e "${BLUE}📊 Repository Statistics:${NC}"
echo "  Total commits: $(git rev-list --all --count)"
echo "  Total branches: $(git branch -a | wc -l | xargs)"
echo "  Repository size: $(du -sh .git | cut -f1)"

echo ""
echo -e "${GREEN}✨ Cleanup complete!${NC}"

# Suggest additional cleanup if repo is large
REPO_SIZE_KB=$(du -sk .git | cut -f1)
if [[ $REPO_SIZE_KB -gt 100000 ]]; then
    echo ""
    echo -e "${YELLOW}💡 Repository is large (>100MB). Consider:${NC}"
    echo "  • git filter-branch to remove large files"
    echo "  • BFG Repo-Cleaner for advanced cleanup" 
    echo "  • git lfs for future large file management"
fi