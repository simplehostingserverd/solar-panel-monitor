#!/bin/bash

echo "🌞 Bishop San Pedro Ozanam Center - Solar Panel Monitor"
echo "=================================================="
echo ""

if [ ! -f .env ]; then
    echo "❌ Error: .env file not found!"
    echo "📝 Please copy .env.example to .env and fill in your credentials:"
    echo "   cp .env.example .env"
    echo ""
    echo "📋 Required environment variables:"
    echo "   - NEXTAUTH_SECRET (generate with: openssl rand -base64 32)"
    echo "   - ENPHASE_SITE_ID (find in Enphase Enlighten URL)"
    exit 1
fi

source .env

if [ -z "$ENPHASE_SITE_ID" ] || [ "$ENPHASE_SITE_ID" = "your-site-id-here" ]; then
    echo "❌ Error: ENPHASE_SITE_ID not configured!"
    echo "📝 Please update ENPHASE_SITE_ID in your .env file"
    echo ""
    echo "To find your Site ID:"
    echo "1. Log into https://enlighten.enphaseenergy.com/"
    echo "2. Navigate to your system"
    echo "3. Your Site ID is in the URL"
    exit 1
fi

if [ -z "$NEXTAUTH_SECRET" ] || [ "$NEXTAUTH_SECRET" = "your-nextauth-secret-here-generate-with-openssl" ]; then
    echo "❌ Error: NEXTAUTH_SECRET not configured!"
    echo "📝 Generate one with: openssl rand -base64 32"
    echo "   Then add it to your .env file"
    exit 1
fi

echo "✅ Environment variables configured"
echo ""
echo "🐳 Starting with Docker Compose..."
echo ""

docker-compose up --build

echo ""
echo "🛑 Application stopped"
