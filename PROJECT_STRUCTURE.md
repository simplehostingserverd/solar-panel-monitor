# Project Structure

```
SolarPanel/
├── app/                          # Next.js 14 App Router
│   ├── api/                      # API Routes
│   │   ├── auth/
│   │   │   └── [...nextauth]/   # NextAuth authentication
│   │   │       └── route.ts
│   │   └── enphase/             # Enphase API endpoints
│   │       ├── summary/
│   │       │   └── route.ts     # System summary endpoint
│   │       ├── production/
│   │       │   └── route.ts     # Production data endpoint
│   │       └── consumption/
│   │           └── route.ts     # Consumption data endpoint
│   ├── login/
│   │   └── page.tsx             # Login page
│   ├── layout.tsx               # Root layout
│   ├── page.tsx                 # Dashboard home page
│   └── globals.css              # Global styles with Tailwind
│
├── components/                   # React Components
│   ├── ui/                      # shadcn/ui components
│   │   ├── button.tsx
│   │   ├── card.tsx
│   │   └── tabs.tsx
│   ├── solar-dashboard.tsx      # Main dashboard component
│   ├── production-chart.tsx     # Production chart (Recharts)
│   └── consumption-chart.tsx    # Consumption chart (Recharts)
│
├── lib/                         # Utilities & Logic
│   ├── api/
│   │   └── enphase.ts          # Enphase API client
│   ├── auth.ts                 # NextAuth configuration
│   ├── providers.tsx           # React Query & Session providers
│   └── utils.ts                # Utility functions
│
├── types/                       # TypeScript definitions
│   └── next-auth.d.ts          # NextAuth type extensions
│
├── public/                      # Static assets
│
├── Dockerfile                   # Docker container definition
├── docker-compose.yml           # Docker Compose configuration
├── .dockerignore               # Docker ignore patterns
├── .env                        # Environment variables (not in git)
├── .env.example                # Environment template
├── .gitignore                  # Git ignore patterns
├── package.json                # Dependencies
├── tsconfig.json               # TypeScript configuration
├── tailwind.config.ts          # Tailwind CSS configuration
├── postcss.config.js           # PostCSS configuration
├── next.config.js              # Next.js configuration
├── next-env.d.ts               # Next.js type definitions
├── start-local.sh              # Local startup script
├── README.md                   # Full documentation
├── QUICKSTART.md               # Quick start guide
└── PROJECT_STRUCTURE.md        # This file
```

## Key Files Explained

### Configuration Files

- **package.json** - All npm dependencies and scripts
- **tsconfig.json** - TypeScript compiler configuration
- **tailwind.config.ts** - Tailwind CSS theme and plugins
- **next.config.js** - Next.js build configuration (standalone output for Docker)

### Core Application Files

- **app/layout.tsx** - Root layout with providers
- **app/page.tsx** - Protected dashboard page
- **app/login/page.tsx** - OAuth login page
- **lib/auth.ts** - NextAuth OAuth flow with token refresh
- **lib/providers.tsx** - React Query and session context

### API Integration

- **lib/api/enphase.ts** - Type-safe Enphase API client
- **app/api/enphase/\*\*/route.ts** - Server-side API proxies

### UI Components

- **components/solar-dashboard.tsx** - Main dashboard with data fetching
- **components/production-chart.tsx** - Production visualization
- **components/consumption-chart.tsx** - Consumption visualization
- **components/ui/** - Reusable shadcn/ui components

### Docker Files

- **Dockerfile** - Multi-stage build (deps → builder → runner)
- **docker-compose.yml** - Service orchestration
- **.dockerignore** - Files to exclude from build

## Data Flow

1. **Authentication** (`/login`)
   - User redirected to Enphase OAuth
   - Callback receives authorization code
   - NextAuth exchanges code for access/refresh tokens
   - Tokens stored in session

2. **Dashboard** (`/`)
   - React Query fetches data every 5-15 min
   - API routes proxy requests to Enphase
   - Charts render with Recharts
   - Auto-refresh on interval

3. **API Proxy** (`/api/enphase/*`)
   - Validates session
   - Adds API key and access token
   - Forwards to Enphase API
   - Returns data to client

## Tech Stack Summary

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 14 (App Router) |
| Language | TypeScript |
| UI Components | shadcn/ui + Radix UI |
| Styling | Tailwind CSS |
| Data Fetching | React Query (TanStack Query) |
| Charts | Recharts |
| Authentication | NextAuth.js |
| API Client | Axios |
| Container | Docker + Docker Compose |
| Deployment | Coolify (or any Docker host) |
