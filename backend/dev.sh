#!/bin/bash

# Hot-reload development server script
echo "🚀 Starting Go server with hot-reload..."
echo "📝 Changes to .go files will automatically restart the server"
echo "🛑 Press Ctrl+C to stop the server"
echo ""

# Add Go bin to PATH for this session
export PATH="$PATH:/Users/sourav/go/bin"

# Run Air for hot-reload
air
