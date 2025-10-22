# Architecture Overview

## System Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────────────┐
│                           USER'S BROWSER                                 │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  ┌────────────────────────────────────────────────────────────────┐   │
│  │                    React Application                            │   │
│  │  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐        │   │
│  │  │   Login UI   │  │  Dashboard   │  │   Charts     │        │   │
│  │  │              │  │   UI         │  │  (Recharts)  │        │   │
│  │  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘        │   │
│  │         │                 │                  │                 │   │
│  │         └─────────────────┼──────────────────┘                 │   │
│  │                           │                                     │   │
│  │                    ┌──────▼───────┐                           │   │
│  │                    │ React Query  │                           │   │
│  │                    │  (Cache)     │                           │   │
│  │                    └──────┬───────┘                           │   │
│  └───────────────────────────┼─────────────────────────────────┘   │
│                               │                                       │
└───────────────────────────────┼───────────────────────────────────────┘
                                │
                         HTTPS Requests
                                │
┌───────────────────────────────▼───────────────────────────────────────┐
│                     NEXT.JS SERVER (Docker)                           │
├───────────────────────────────────────────────────────────────────────┤
│                                                                        │
│  ┌──────────────────────────────────────────────────────────────┐   │
│  │                     API Routes                                │   │
│  │                                                               │   │
│  │  ┌───────────────┐      ┌────────────────────────────┐      │   │
│  │  │   NextAuth    │      │    Enphase Proxy APIs      │      │   │
│  │  │   /api/auth   │      │                            │      │   │
│  │  │               │      │  • /api/enphase/summary    │      │   │
│  │  │ • OAuth Flow  │      │  • /api/enphase/production │      │   │
│  │  │ • Token Store │      │  • /api/enphase/consumption│      │   │
│  │  │ • Refresh     │      │                            │      │   │
│  │  └───────┬───────┘      └────────┬───────────────────┘      │   │
│  │          │                       │                           │   │
│  │          │ Session Token         │ Access Token + API Key    │   │
│  │          │                       │                           │   │
│  └──────────┼───────────────────────┼───────────────────────────┘   │
│             │                       │                               │
│  ┌──────────▼───────────────────────▼─────────────────────────┐    │
│  │                 Server Components                           │    │
│  │  • Server-side rendering                                    │    │
│  │  • Session management                                       │    │
│  │  • Environment variables                                    │    │
│  └──────────────────────────────────────────────────────────────┘    │
│                                                                        │
└────────────┬──────────────────────┬────────────────────────────────┘
             │                      │
    OAuth Authorize          API Requests
             │                      │
┌────────────▼──────────┐  ┌────────▼─────────────────────────────────┐
│   Enphase OAuth       │  │      Enphase API v4                      │
│   Authorization       │  │  https://api.enphaseenergy.com/api/v4    │
│                       │  │                                           │
│  • Authorize endpoint │  │  • GET /systems/{id}/summary             │
│  • Token endpoint     │  │  • GET /systems/{id}/telemetry/          │
│  • Refresh endpoint   │  │    production_micro                      │
│                       │  │  • GET /systems/{id}/telemetry/          │
│                       │  │    consumption_meter                     │
└───────────────────────┘  └──────────────────────────────────────────┘
```

## Request Flow

### 1. Authentication Flow

```
User                 Browser              Next.js Server         Enphase
 │                     │                       │                    │
 │  1. Visit /login    │                       │                    │
 │────────────────────>│                       │                    │
 │                     │                       │                    │
 │                     │  2. Redirect to       │                    │
 │                     │     Enphase OAuth     │                    │
 │                     │──────────────────────────────────────────>│
 │                     │                       │                    │
 │  3. User authorizes │                       │                    │
 │────────────────────────────────────────────────────────────────>│
 │                     │                       │                    │
 │                     │  4. Callback with code│                    │
 │                     │<──────────────────────────────────────────│
 │                     │                       │                    │
 │                     │  5. Exchange code     │                    │
 │                     │    for tokens         │                    │
 │                     │──────────────────────>│                    │
 │                     │                       │  6. Token request  │
 │                     │                       │───────────────────>│
 │                     │                       │                    │
 │                     │                       │  7. Access Token   │
 │                     │                       │<───────────────────│
 │                     │                       │                    │
 │                     │  8. Set session       │                    │
 │                     │<──────────────────────│                    │
 │                     │                       │                    │
 │  9. Redirect to     │                       │                    │
 │     dashboard       │                       │                    │
 │<────────────────────│                       │                    │
```

### 2. Dashboard Data Flow

```
Browser              Next.js API Route       Enphase API
  │                        │                      │
  │  1. GET /api/          │                      │
  │     enphase/summary    │                      │
  │───────────────────────>│                      │
  │                        │                      │
  │                        │  2. Validate session │
  │                        │     & get token      │
  │                        │                      │
  │                        │  3. Forward request  │
  │                        │     with token +     │
  │                        │     API key          │
  │                        │─────────────────────>│
  │                        │                      │
  │                        │  4. System data      │
  │                        │<─────────────────────│
  │                        │                      │
  │  5. JSON response      │                      │
  │<───────────────────────│                      │
  │                        │                      │
  │  (React Query caches   │                      │
  │   for 5 minutes)       │                      │
```

### 3. Auto-Refresh Cycle

```
React Query Cache
     │
     │  Every 5 minutes (summary)
     │  Every 15 minutes (production/consumption)
     │
     ▼
┌─────────────┐
│  Refetch    │
│  Data       │
└─────┬───────┘
      │
      ▼
  API Request ──> Next.js API ──> Enphase API
      │
      ▼
  Update UI
```

## Component Hierarchy

```
RootLayout (app/layout.tsx)
│
├── SessionProvider
│   └── QueryClientProvider
│       │
│       └── Page (app/page.tsx)
│           │
│           ├── Header
│           │   ├── Title
│           │   └── SignOut Button
│           │
│           └── SolarDashboard (components/solar-dashboard.tsx)
│               │
│               ├── Overview Cards (4x Card components)
│               │   ├── Current Power
│               │   ├── Today's Energy
│               │   ├── Lifetime Energy
│               │   └── System Status
│               │
│               └── Tabs
│                   ├── Production Tab
│                   │   └── ProductionChart (components/production-chart.tsx)
│                   │       └── Recharts LineChart
│                   │
│                   └── Consumption Tab
│                       └── ConsumptionChart (components/consumption-chart.tsx)
│                           └── Recharts LineChart
```

## Data Models

### System Summary
```typescript
{
  system_id: number
  current_power: number        // Watts
  energy_today: number         // Watt-hours
  energy_lifetime: number      // Watt-hours
  summary_date: string
  status: string              // "normal", "comm", etc.
  operational_at: number      // Unix timestamp
  last_report_at: number      // Unix timestamp
}
```

### Production Data
```typescript
{
  system_id: number
  total_devices: number
  intervals: [
    {
      end_at: number          // Unix timestamp
      devices_reporting: number
      wh_del: number          // Watt-hours delivered
      powr: number            // Power in watts
    }
  ]
}
```

### Consumption Data
```typescript
{
  system_id: number
  total_devices: number
  intervals: [
    {
      end_at: number          // Unix timestamp
      eid: number
      wh_del: number          // Watt-hours delivered
      devices_reporting: number
    }
  ]
}
```

## State Management

```
┌──────────────────────────────────────────┐
│         Application State                │
├──────────────────────────────────────────┤
│                                          │
│  ┌────────────────────────────────┐     │
│  │     Session State              │     │
│  │  (NextAuth + SessionProvider)  │     │
│  │                                │     │
│  │  • Access Token                │     │
│  │  • Refresh Token               │     │
│  │  • Token Expiry                │     │
│  │  • User Info                   │     │
│  └────────────────────────────────┘     │
│                                          │
│  ┌────────────────────────────────┐     │
│  │     Data Cache                 │     │
│  │  (React Query)                 │     │
│  │                                │     │
│  │  • Summary (5min TTL)          │     │
│  │  • Production (15min TTL)      │     │
│  │  • Consumption (15min TTL)     │     │
│  │                                │     │
│  │  Features:                     │     │
│  │  - Background refetch          │     │
│  │  - Stale while revalidate      │     │
│  │  - Error retry                 │     │
│  └────────────────────────────────┘     │
│                                          │
└──────────────────────────────────────────┘
```

## Deployment Architecture (Coolify)

```
                    Internet
                       │
                       │
                    ┌──▼──┐
                    │ DNS │
                    └──┬──┘
                       │
                       │
              ┌────────▼────────┐
              │  Coolify Server │
              │   (Reverse Proxy)│
              └────────┬────────┘
                       │
                       │
           ┌───────────▼───────────┐
           │   Docker Container     │
           │  (Next.js Standalone)  │
           │                        │
           │  Port: 3000            │
           │  Environment: .env     │
           │                        │
           │  Health Check: /       │
           │  Restart: unless-stopped│
           └────────────────────────┘
```

## Security Flow

```
┌─────────────────────────────────────────────────────┐
│                  Security Layers                     │
├─────────────────────────────────────────────────────┤
│                                                      │
│  1. HTTPS/TLS                                       │
│     └─> All traffic encrypted                       │
│                                                      │
│  2. OAuth 2.0                                       │
│     └─> User authorization with Enphase            │
│                                                      │
│  3. Session Management                              │
│     └─> Secure HTTP-only cookies                   │
│                                                      │
│  4. Token Refresh                                   │
│     └─> Automatic token renewal                    │
│                                                      │
│  5. API Key + Access Token                         │
│     └─> Dual authentication to Enphase             │
│                                                      │
│  6. Server-side API Proxying                       │
│     └─> Credentials never exposed to client        │
│                                                      │
│  7. Environment Variables                           │
│     └─> Secrets stored securely                    │
│                                                      │
└─────────────────────────────────────────────────────┘
```

## Performance Optimizations

1. **React Query Caching**
   - Summary: 5min stale time, 5min refetch
   - Production: 15min stale time, 15min refetch
   - Consumption: 15min stale time, 15min refetch

2. **Next.js Optimizations**
   - Server Components for static content
   - Client Components only where needed
   - Standalone output for smaller Docker images

3. **Docker Multi-stage Build**
   - Deps stage: Install dependencies
   - Builder stage: Build application
   - Runner stage: Minimal production image

4. **Code Splitting**
   - Automatic with Next.js App Router
   - Route-based splitting
   - Component lazy loading

## Error Handling

```
Error Source → Handler → User Feedback
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

API Error → React Query → Retry 3x → Show error state

Auth Error → NextAuth → Redirect to login

Network Error → React Query → Show loading/error

Token Expired → NextAuth → Auto-refresh → Retry request

Invalid Response → Error boundary → Fallback UI
```
