# 🌞 Get Started in 3 Steps

## What You Have

A complete, production-ready Next.js application for monitoring your Enphase solar panels!

## Quick Start

### Step 1: Configure Your Environment (2 minutes)

1. **Generate a secret key:**
   ```bash
   openssl rand -base64 32
   ```

2. **Find your Enphase Site ID:**
   - Visit https://enlighten.enphaseenergy.com/
   - Click on your system
   - Look at the URL: `enlighten.enphaseenergy.com/systems/YOUR_SITE_ID`
   - Copy that number

3. **Edit the `.env` file:**
   ```bash
   nano .env
   ```
   
   Update these two lines:
   ```bash
   NEXTAUTH_SECRET=paste-the-secret-you-generated
   ENPHASE_SITE_ID=paste-your-site-id
   ```
   
   Save and exit (Ctrl+X, then Y, then Enter)

### Step 2: Start the Application (1 minute)

```bash
./start-local.sh
```

That's it! Docker will build and start everything automatically.

### Step 3: View Your Dashboard (30 seconds)

1. Open your browser to http://localhost:3000
2. Click "Sign in with Enphase"
3. Authorize the application on Enphase's page
4. See your solar dashboard! ☀️

## What You'll See

### Dashboard Overview
- **Current Power** - Live power production in kilowatts
- **Today's Energy** - Total kilowatt-hours produced today
- **Lifetime Energy** - Total production since installation
- **System Status** - System health and device count

### Charts
- **Production Tab** - 24-hour graph showing:
  - Power output over time
  - Energy production intervals
  
- **Consumption Tab** - 24-hour graph showing:
  - Energy consumption patterns

### Auto-Refresh
- Data updates automatically every 5-15 minutes
- No need to refresh the page!

## Common Commands

### Start the application
```bash
./start-local.sh
```

### Stop the application
Press `Ctrl+C` in the terminal, then:
```bash
docker-compose down
```

### View logs
```bash
docker-compose logs -f
```

### Restart the application
```bash
docker-compose restart
```

### Rebuild from scratch
```bash
docker-compose down
docker-compose up --build
```

## Troubleshooting

### "Error: ENPHASE_SITE_ID not configured"

You need to set your Site ID in the `.env` file. See Step 1 above.

### "Error: Unauthorized"

Your Enphase API credentials might be incorrect. Double-check the `.env` file.

### "Can't connect to Docker"

Make sure Docker Desktop is running on your machine.

### Authentication not working

1. Verify `NEXTAUTH_SECRET` is set in `.env`
2. Try clearing your browser cookies
3. Make sure `NEXTAUTH_URL=http://localhost:3000` in `.env`

### No data showing

1. Verify your `ENPHASE_SITE_ID` is correct
2. Check if you completed the OAuth authorization
3. Look at logs: `docker-compose logs -f`

## File Structure

```
SolarPanel/
├── .env                    ← Configure this file!
├── start-local.sh         ← Run this to start!
├── docker-compose.yml     
├── Dockerfile             
│
├── app/                   ← Next.js application
├── components/            ← UI components
├── lib/                   ← Business logic
│
├── README.md              ← Full documentation
├── QUICKSTART.md          ← Condensed setup guide
├── DEPLOYMENT_CHECKLIST.md ← For Coolify deployment
├── ARCHITECTURE.md        ← System design diagrams
└── GET_STARTED.md         ← You are here!
```

## Next Steps

### For Local Development
- Application is running at http://localhost:3000
- Make changes to files in `app/` or `components/`
- Changes will NOT auto-reload (need to rebuild)
- To rebuild: `docker-compose up --build`

### For Production Deployment
1. Read `DEPLOYMENT_CHECKLIST.md`
2. Push code to Git repository
3. Deploy to Coolify server
4. Update `NEXTAUTH_URL` to your domain
5. Monitor with Coolify dashboard

## Need Help?

📖 **Full Documentation:** Read `README.md`

🚀 **Quick Setup:** Read `QUICKSTART.md`

🏗️ **Architecture:** Read `ARCHITECTURE.md`

📋 **Deploy to Production:** Read `DEPLOYMENT_CHECKLIST.md`

## Tech Stack Summary

- **Frontend:** Next.js 14 + React 18 + TypeScript
- **UI:** shadcn/ui + Tailwind CSS
- **Charts:** Recharts
- **API:** Enphase API v4
- **Auth:** NextAuth.js with OAuth 2.0
- **Data:** React Query (auto-refresh)
- **Container:** Docker + Docker Compose
- **Deploy:** Coolify-ready

## What's Included

✅ Complete authentication with Enphase OAuth
✅ Real-time solar production monitoring
✅ Energy consumption tracking
✅ Beautiful interactive charts
✅ Auto-refreshing data (5-15 min intervals)
✅ Mobile-responsive design
✅ Docker containerization
✅ Production-ready configuration
✅ Comprehensive documentation

## Support

**Developed by:** SoftwarePros Inc  
**For:** Bishop San Pedro Ozanam Center

For technical issues, check the logs first:
```bash
docker-compose logs -f
```

Most issues are related to:
1. Missing `ENPHASE_SITE_ID` in `.env`
2. Missing `NEXTAUTH_SECRET` in `.env`
3. Docker not running

---

## 🎉 You're All Set!

Your solar monitoring dashboard is ready to go. Just follow the 3 steps above and you'll be monitoring your solar panels in minutes!

**Remember:** 
- Update `.env` with your Site ID and secret
- Run `./start-local.sh`
- Visit http://localhost:3000

Happy solar monitoring! ☀️⚡📊
