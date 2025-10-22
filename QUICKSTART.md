# Quick Start Guide

## Prerequisites

- Docker installed on your machine
- Enphase Site ID (from Enphase Enlighten dashboard)

## Setup in 3 Steps

### 1. Configure Environment Variables

Edit the `.env` file and update these two values:

```bash
# Generate this secret
NEXTAUTH_SECRET=run-this-command-openssl-rand-base64-32

# Find your Site ID from Enphase Enlighten dashboard
ENPHASE_SITE_ID=your-actual-site-id
```

**To generate NEXTAUTH_SECRET:**
```bash
openssl rand -base64 32
```

**To find your Site ID:**
1. Go to https://enlighten.enphaseenergy.com/
2. Click on your system
3. Look at the URL: `enlighten.enphaseenergy.com/systems/SITE_ID`
4. Copy that ID

### 2. Run the Application

```bash
./start-local.sh
```

Or manually with Docker Compose:

```bash
docker-compose up --build
```

### 3. Access the Dashboard

1. Open http://localhost:3000
2. Click "Sign in with Enphase"
3. Authorize the application
4. View your solar dashboard!

## What You'll See

- **Current Power Output** - Real-time production
- **Today's Energy** - kWh produced today
- **Lifetime Energy** - Total production
- **System Status** - Device health
- **Production Chart** - 24-hour production graph
- **Consumption Chart** - 24-hour consumption graph

## Troubleshooting

**Issue: "Unauthorized" error**
- Check that your Site ID is correct
- Verify API credentials in .env

**Issue: Docker build fails**
- Make sure Docker is running
- Try: `docker-compose down && docker-compose up --build`

**Issue: Can't authenticate**
- Verify NEXTAUTH_SECRET is set
- Check NEXTAUTH_URL matches your domain

## Need Help?

Read the full README.md for detailed information.
