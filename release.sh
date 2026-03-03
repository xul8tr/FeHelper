#!/bin/bash

# Set script to exit on error
set -e

# Get current date and time, format: YYYY-MM-DD_HH-MM-SS
TIMESTAMP=$(date +"%Y-%m-%d_%H-%M-%S")

# Define paths
TARGET_DIR="../nginx-website/fehelper"
BACKUP_DIR="../backup.release"
SOURCE_DIR="./website"

echo "🚀 Starting website deployment..."

# 1. Check and backup existing directory
if [ -d "$TARGET_DIR" ]; then
    echo "📦 Existing directory found, creating backup..."
    
    # Create backup directory (if it doesn't exist)
    mkdir -p "$BACKUP_DIR"
    
    BACKUP_NAME="fehelper.${TIMESTAMP}.zip"
    BACKUP_PATH="${BACKUP_DIR}/${BACKUP_NAME}"
    
    # Switch to target directory's parent directory for packaging
    cd "../nginx-website"
    zip -r "$BACKUP_PATH" "fehelper" > /dev/null 2>&1
    cd - > /dev/null
    
    echo "✅ Backup created: $BACKUP_PATH"
    
else
    echo "ℹ️  Target directory does not exist, skipping backup step"
    # 2. Create target directory
    echo "📁 Creating target directory..."
    mkdir -p "$TARGET_DIR"
fi

# 3. Check if website directory exists
if [ ! -d "$SOURCE_DIR" ]; then
    echo "❌ Error: website directory does not exist!"
    exit 1
fi


# 4. Copy all contents from website to target directory
echo "📤 Copying all contents from website to target directory..."
cp -r "$SOURCE_DIR"/. "$TARGET_DIR"/

echo "✅ Deployment complete!"
echo "📍 Deployment location: $TARGET_DIR"

# Display directory contents
echo ""
echo "📋 Deployed file list:"
ls -la "$TARGET_DIR" 

