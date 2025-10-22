# Bishop San Pedro Ozanam Center - Solar Panel Monitoring

A Next.js application for monitoring solar panel production and consumption using the Enphase API.

## Features

- 🌞 Real-time solar production monitoring
- ⚡ Energy consumption tracking
- 📊 Interactive charts with Recharts
- 🔐 OAuth authentication with Enphase API
- 🎨 Modern UI with shadcn/ui components
- 🔄 Auto-refresh data every 5-15 minutes
- 🐳 Docker support for easy deployment

## Tech Stack

- **Next.js 14** - React framework with App Router
- **TypeScript** - Type safety
- **shadcn/ui** - UI component library
- **Tailwind CSS** - Styling
- **React Query** - Data fetching and caching
- **NextAuth.js** - Authentication
- **Recharts** - Data visualization
- **Docker** - Containerization

## Prerequisites

- Node.js 18+ or Docker
- Enphase API credentials
- Enphase System/Site ID

## Environment Variables

Copy `.env.example` to `.env` and fill in your credentials:

```bash
cp .env.example .env
```

Required variables:

```env
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=generate-with-openssl-rand-base64-32

ENPHASE_CLIENT_ID=00a39c3d2a6062b3cabfe389953ebd22
ENPHASE_CLIENT_SECRET=5ef06eb90c7725fd6d2bbef04de90223
ENPHASE_API_KEY=09f924267e8c045fc65daac3778645ed

ENPHASE_SITE_ID=your-site-id-here
```

### Generate NEXTAUTH_SECRET

```bash
openssl rand -base64 32
```

### Find Your Enphase Site ID

1. Log into https://enlighten.enphaseenergy.com/
2. Navigate to your system
3. Your Site ID is in the URL: `enlighten.enphaseenergy.com/systems/SITE_ID`

## Getting Started

### Option 1: Docker (Recommended)

1. **Build and run with Docker Compose:**

```bash
docker-compose up -d
```

2. **View logs:**

```bash
docker-compose logs -f
```

3. **Stop the application:**

```bash
docker-compose down
```

### Option 2: Local Development

1. **Install dependencies:**

```bash
npm install
```

2. **Run development server:**

```bash
npm run dev
```

3. **Build for production:**

```bash
npm run build
npm start
```

## Usage

1. Navigate to `http://localhost:3000`
2. Click "Sign in with Enphase"
3. Authorize the application on Enphase's OAuth page
4. View your solar dashboard

## Dashboard Features

### Overview Cards
- **Current Power** - Live production in kW
- **Today's Energy** - Total energy produced today
- **Lifetime Energy** - Total energy since installation
- **System Status** - Current system state and device count

### Charts
- **Production Tab** - 24-hour solar production history
- **Consumption Tab** - 24-hour energy consumption history

## API Endpoints

- `GET /api/auth/[...nextauth]` - Authentication
- `GET /api/enphase/summary` - System summary
- `GET /api/enphase/production` - Production data
- `GET /api/enphase/consumption` - Consumption data

## Deployment to Coolify

1. **Push your code to a Git repository**

2. **In Coolify, create a new service:**
   - Select "Docker Compose"
   - Connect your repository
   - Set environment variables in Coolify UI

3. **Add environment variables in Coolify:**
   - All variables from `.env.example`
   - Update `NEXTAUTH_URL` to your domain

4. **Deploy:**
   - Coolify will automatically build and deploy using the Dockerfile

## Data Refresh Intervals

- **System Summary**: Every 5 minutes
- **Production Data**: Every 15 minutes
- **Consumption Data**: Every 15 minutes

## Troubleshooting

### Authentication Issues

- Verify your `ENPHASE_CLIENT_ID` and `ENPHASE_CLIENT_SECRET`
- Ensure `NEXTAUTH_URL` matches your deployment URL
- Check that your redirect URI is registered with Enphase

### No Data Showing

- Verify your `ENPHASE_SITE_ID` is correct
- Check API key permissions in Enphase portal
- Review browser console and server logs

### Docker Issues

```bash
# Rebuild containers
docker-compose up --build

# View detailed logs
docker-compose logs -f solar-monitor

# Restart services
docker-compose restart
```

## Development

```bash
# Run development server with hot reload
npm run dev

# Type check
npm run build

# Lint
npm run lint
```

## License

Developed by SoftwarePros Inc for Bishop San Pedro Ozanam Center

## Support

For issues or questions, please contact SoftwarePros Inc.
