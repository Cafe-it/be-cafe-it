#!/bin/bash

# OpenAPI Generator Script for Cafe IT API
# This script generates OpenAPI specification using NestJS and Swagger

set -e  # Exit on any error

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}🚀 Cafe IT API - OpenAPI Generator${NC}"
echo "=================================="

# Check if ts-node is available
if ! command -v pnpm &> /dev/null; then
    echo "❌ pnpm is not installed. Please install pnpm first."
    exit 1
fi

# Install dependencies if needed
if [ ! -d "node_modules" ]; then
    echo "📦 Installing dependencies..."
    pnpm install
fi

# Run the TypeScript generator
echo "🔧 Running OpenAPI generator..."
pnpm exec ts-node --project tsconfig.json scripts/generate-openapi.ts

echo -e "${GREEN}✨ OpenAPI generation completed!${NC}" 