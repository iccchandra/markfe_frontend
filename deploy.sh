#!/bin/bash

# Deploy React Admin App to Nginx
# Make this file executable: chmod +x deploy.sh

set -e  # Exit on any error

# Configuration
BUILD_DIR="./build"
NGINX_DIR="/var/www/html/admin"
NGINX_CONFIG="/etc/nginx/sites-available/admin"
BACKUP_DIR="/var/backups/admin-$(date +%Y%m%d-%H%M%S)"

echo "🚀 Starting deployment of React Admin App..."

# Check if build directory exists
if [ ! -d "$BUILD_DIR" ]; then
    echo "❌ Build directory not found. Please run 'npm run build:admin' first."
    exit 1
fi

# Create backup of current deployment
if [ -d "$NGINX_DIR" ]; then
    echo "📦 Creating backup of current deployment..."
    sudo mkdir -p $(dirname "$BACKUP_DIR")
    sudo cp -r "$NGINX_DIR" "$BACKUP_DIR"
    echo "✅ Backup created at: $BACKUP_DIR"
fi

# Create nginx directory if it doesn't exist
echo "📁 Preparing nginx directory..."
sudo mkdir -p "$NGINX_DIR"

# Copy build files to nginx directory
echo "📋 Copying build files to nginx directory..."
sudo cp -r "$BUILD_DIR"/* "$NGINX_DIR/"

# Set proper permissions
echo "🔒 Setting proper permissions..."
sudo chown -R www-data:www-data "$NGINX_DIR"
sudo chmod -R 755 "$NGINX_DIR"

# Copy nginx configuration if it doesn't exist
if [ ! -f "$NGINX_CONFIG" ]; then
    echo "⚙️  Setting up nginx configuration..."
    sudo cp nginx.conf "$NGINX_CONFIG"
    sudo ln -sf "$NGINX_CONFIG" /etc/nginx/sites-enabled/admin
fi

# Test nginx configuration
echo "🧪 Testing nginx configuration..."
sudo nginx -t

if [ $? -eq 0 ]; then
    echo "✅ Nginx configuration is valid"
    
    # Reload nginx
    echo "🔄 Reloading nginx..."
    sudo systemctl reload nginx
    
    echo "🎉 Deployment completed successfully!"
    echo "📍 Your admin panel is now available at: http://your-domain.com/admin"
    
    # Optional: Remove old backups (keep last 5)
    echo "🧹 Cleaning up old backups..."
    sudo find /var/backups -name "admin-*" -type d | sort -r | tail -n +6 | sudo xargs rm -rf
    
else
    echo "❌ Nginx configuration test failed"
    echo "🔄 Restoring from backup..."
    
    if [ -d "$BACKUP_DIR" ]; then
        sudo rm -rf "$NGINX_DIR"
        sudo cp -r "$BACKUP_DIR" "$NGINX_DIR"
        echo "✅ Backup restored"
    fi
    
    exit 1
fi

echo "✨ Deployment process completed!"
