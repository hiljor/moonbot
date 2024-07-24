#!/bin/bash
# Navigate to bot directory
cd /path/to/bot

# Pull latest changes from Git
git pull

# Deploy commands
node deploy-commands.js

# Restart the bot using pm2
pm2 restart index.js
