# Complete System Architecture

## Full Stack Architecture

```mermaid
graph TB
    subgraph "User Layer"
        USER[👤 User Browser]
    end
    
    subgraph "Frontend - React Application"
        LOGIN[🔐 Login Page<br/>app/login/page.tsx]
        DASHBOARD[📊 Dashboard<br/>app/page.tsx]
        
        subgraph "Components"
            SOLAR_DASH[SolarDashboard Component]
            PROD_CHART[Production Chart<br/>Recharts]
            CONS_CHART[Consumption Chart<br/>Recharts]
            UI_CARDS[4x Overview Cards]
        end
        
        subgraph "State Management"
            REACT_QUERY[⚡ React Query<br/>Data Cache & Refresh]
            SESSION[🔑 NextAuth Session<br/>OAuth Tokens]
        end
    end
    
    subgraph "Backend - Next.js API Routes"
        AUTH_ROUTE[/api/auth/[...nextauth]<br/>NextAuth Handler]
        SUMMARY_ROUTE[/api/enphase/summary]
        PROD_ROUTE[/api/enphase/production]
        CONS_ROUTE[/api/enphase/consumption]
        
        subgraph "Business Logic"
            AUTH_CONFIG[lib/auth.ts<br/>OAuth Config]
            API_CLIENT[lib/api/enphase.ts<br/>API Client]
        end
    end
    
    subgraph "External Services"
        ENPHASE_OAUTH[🔐 Enphase OAuth<br/>Authorization Server]
        ENPHASE_API[☀️ Enphase API v4<br/>Solar Data Provider]
    end
    
    subgraph "Infrastructure"
        DOCKER[🐳 Docker Container<br/>Next.js Standalone]
        COOLIFY[☁️ Coolify Server<br/>Deployment Platform]
    end
    
    %% User Flow
    USER -->|1. Visit App| LOGIN
    LOGIN -->|2. OAuth Redirect| ENPHASE_OAUTH
    ENPHASE_OAUTH -->|3. Auth Code| AUTH_ROUTE
    AUTH_ROUTE -->|4. Exchange Token| ENPHASE_OAUTH
    ENPHASE_OAUTH -->|5. Access Token| SESSION
    SESSION -->|6. Redirect| DASHBOARD
    
    %% Dashboard Data Flow
    DASHBOARD --> SOLAR_DASH
    SOLAR_DASH --> UI_CARDS
    SOLAR_DASH --> PROD_CHART
    SOLAR_DASH --> CONS_CHART
    
    SOLAR_DASH -->|Query| REACT_QUERY
    REACT_QUERY -->|Every 5min| SUMMARY_ROUTE
    REACT_QUERY -->|Every 15min| PROD_ROUTE
    REACT_QUERY -->|Every 15min| CONS_ROUTE
    
    %% API Flow
    SUMMARY_ROUTE --> AUTH_CONFIG
    PROD_ROUTE --> AUTH_CONFIG
    CONS_ROUTE --> AUTH_CONFIG
    
    AUTH_CONFIG --> API_CLIENT
    API_CLIENT -->|GET /summary| ENPHASE_API
    API_CLIENT -->|GET /production| ENPHASE_API
    API_CLIENT -->|GET /consumption| ENPHASE_API
    
    %% Infrastructure
    DASHBOARD -.Runs In.- DOCKER
    AUTH_ROUTE -.Runs In.- DOCKER
    DOCKER -.Deployed On.- COOLIFY
    
    %% Styling
    classDef frontend fill:#3b82f6,stroke:#1e40af,color:#fff
    classDef backend fill:#8b5cf6,stroke:#6d28d9,color:#fff
    classDef external fill:#10b981,stroke:#059669,color:#fff
    classDef infra fill:#f59e0b,stroke:#d97706,color:#fff
    
    class LOGIN,DASHBOARD,SOLAR_DASH,PROD_CHART,CONS_CHART,UI_CARDS frontend
    class AUTH_ROUTE,SUMMARY_ROUTE,PROD_ROUTE,CONS_ROUTE,AUTH_CONFIG,API_CLIENT backend
    class ENPHASE_OAUTH,ENPHASE_API external
    class DOCKER,COOLIFY infra
```

## Data Flow Sequence

```mermaid
sequenceDiagram
    actor User
    participant Browser
    participant NextJS
    participant ReactQuery
    participant EnphaseAuth
    participant EnphaseAPI
    
    Note over User,EnphaseAPI: Initial Authentication
    User->>Browser: Visit Dashboard
    Browser->>NextJS: GET /
    NextJS-->>Browser: Redirect to /login
    Browser->>EnphaseAuth: OAuth Authorization Request
    User->>EnphaseAuth: Approve Access
    EnphaseAuth->>NextJS: Authorization Code
    NextJS->>EnphaseAuth: Exchange Code for Token
    EnphaseAuth->>NextJS: Access + Refresh Token
    NextJS->>Browser: Set Session & Redirect to /
    
    Note over User,EnphaseAPI: Dashboard Loading
    Browser->>ReactQuery: Mount Dashboard
    ReactQuery->>NextJS: GET /api/enphase/summary
    NextJS->>EnphaseAPI: GET /systems/{id}/summary
    EnphaseAPI-->>NextJS: System Data
    NextJS-->>ReactQuery: JSON Response
    ReactQuery-->>Browser: Update UI
    
    par Parallel Chart Data Loading
        ReactQuery->>NextJS: GET /api/enphase/production
        NextJS->>EnphaseAPI: GET /telemetry/production_micro
        EnphaseAPI-->>NextJS: Production Data
        NextJS-->>ReactQuery: JSON Response
    and
        ReactQuery->>NextJS: GET /api/enphase/consumption
        NextJS->>EnphaseAPI: GET /telemetry/consumption_meter
        EnphaseAPI-->>NextJS: Consumption Data
        NextJS-->>ReactQuery: JSON Response
    end
    
    ReactQuery-->>Browser: Render Charts
    
    Note over User,EnphaseAPI: Auto-Refresh Cycle
    loop Every 5-15 minutes
        ReactQuery->>NextJS: Refetch Data
        NextJS->>EnphaseAPI: GET Latest Data
        EnphaseAPI-->>NextJS: Updated Data
        NextJS-->>ReactQuery: Cache Update
        ReactQuery-->>Browser: UI Auto-Updates
    end
```

## Component Architecture

```mermaid
graph LR
    subgraph "app/layout.tsx"
        ROOT[Root Layout]
        
        subgraph "Providers"
            SESSION_PROV[SessionProvider]
            QUERY_PROV[QueryClientProvider]
        end
        
        ROOT --> SESSION_PROV
        SESSION_PROV --> QUERY_PROV
    end
    
    subgraph "app/page.tsx"
        QUERY_PROV --> PAGE[Dashboard Page]
        
        PAGE --> HEADER[Header Component]
        PAGE --> MAIN[Main Content]
        
        HEADER --> TITLE[Site Title]
        HEADER --> SIGNOUT[Sign Out Button]
    end
    
    subgraph "components/solar-dashboard.tsx"
        MAIN --> DASH[SolarDashboard]
        
        DASH --> CARDS[Overview Section]
        DASH --> TABS[Tabs Component]
        
        CARDS --> CARD1[Current Power Card]
        CARDS --> CARD2[Today's Energy Card]
        CARDS --> CARD3[Lifetime Energy Card]
        CARDS --> CARD4[System Status Card]
        
        TABS --> TAB_PROD[Production Tab]
        TABS --> TAB_CONS[Consumption Tab]
    end
    
    subgraph "Chart Components"
        TAB_PROD --> PROD_CHART[ProductionChart]
        TAB_CONS --> CONS_CHART[ConsumptionChart]
        
        PROD_CHART --> RECHARTS1[Recharts LineChart]
        CONS_CHART --> RECHARTS2[Recharts LineChart]
    end
    
    subgraph "Data Hooks"
        DASH -.useQuery.-> QUERY1[Summary Query]
        DASH -.useQuery.-> QUERY2[Production Query]
        DASH -.useQuery.-> QUERY3[Consumption Query]
        
        QUERY1 -.Fetch.-> API1[/api/enphase/summary]
        QUERY2 -.Fetch.-> API2[/api/enphase/production]
        QUERY3 -.Fetch.-> API3[/api/enphase/consumption]
    end
    
    classDef layout fill:#e0e7ff,stroke:#6366f1
    classDef component fill:#dbeafe,stroke:#3b82f6
    classDef chart fill:#d1fae5,stroke:#10b981
    classDef data fill:#fef3c7,stroke:#f59e0b
    
    class ROOT,SESSION_PROV,QUERY_PROV layout
    class PAGE,HEADER,MAIN,DASH,CARDS,TABS component
    class PROD_CHART,CONS_CHART,RECHARTS1,RECHARTS2 chart
    class QUERY1,QUERY2,QUERY3,API1,API2,API3 data
```

## Deployment Architecture

```mermaid
graph TB
    subgraph "Development"
        DEV[👨‍💻 Developer]
        GIT[📦 Git Repository<br/>GitHub/GitLab]
        
        DEV -->|git push| GIT
    end
    
    subgraph "Coolify Server"
        COOLIFY[☁️ Coolify Platform]
        REGISTRY[🐳 Container Registry]
        
        subgraph "Build Process"
            BUILDER[Docker Builder]
            
            BUILDER -->|Stage 1| DEPS[Install Dependencies]
            DEPS -->|Stage 2| BUILD[Build Next.js App]
            BUILD -->|Stage 3| IMAGE[Production Image<br/>Node 18 Alpine]
        end
        
        subgraph "Runtime"
            CONTAINER[🐳 Running Container]
            ENV[🔐 Environment Variables]
            
            CONTAINER --> NEXTJS[Next.js Server<br/>Port 3000]
            ENV -.Inject.-> CONTAINER
        end
        
        subgraph "Reverse Proxy"
            NGINX[Nginx/Traefik]
            SSL[🔒 SSL Certificate]
            
            NGINX --> SSL
        end
    end
    
    subgraph "External"
        INTERNET[🌐 Internet]
        DNS[DNS]
        ENPHASE[Enphase API]
        
        INTERNET --> DNS
        DNS --> NGINX
    end
    
    %% Flow
    GIT -->|Webhook| COOLIFY
    COOLIFY -->|Trigger Build| BUILDER
    IMAGE --> REGISTRY
    REGISTRY --> CONTAINER
    
    NGINX --> CONTAINER
    CONTAINER <-->|API Calls| ENPHASE
    
    classDef dev fill:#dbeafe,stroke:#3b82f6
    classDef coolify fill:#fef3c7,stroke:#f59e0b
    classDef runtime fill:#d1fae5,stroke:#10b981
    classDef external fill:#e0e7ff,stroke:#6366f1
    
    class DEV,GIT dev
    class COOLIFY,BUILDER,DEPS,BUILD,IMAGE,REGISTRY coolify
    class CONTAINER,ENV,NEXTJS,NGINX,SSL runtime
    class INTERNET,DNS,ENPHASE external
```

## Security Flow

```mermaid
graph TD
    subgraph "Security Layers"
        L1[Layer 1: HTTPS/TLS]
        L2[Layer 2: OAuth 2.0]
        L3[Layer 3: Session Management]
        L4[Layer 4: API Authentication]
        L5[Layer 5: Server-side Proxying]
        L6[Layer 6: Environment Secrets]
        
        L1 --> L2
        L2 --> L3
        L3 --> L4
        L4 --> L5
        L5 --> L6
    end
    
    subgraph "Implementation"
        HTTPS[🔒 All traffic encrypted<br/>SSL Certificate]
        OAUTH[🔐 Enphase Authorization<br/>No password storage]
        SESSION[🍪 HTTP-only cookies<br/>NextAuth.js]
        TOKENS[🎫 Access Token + API Key<br/>Dual authentication]
        PROXY[🛡️ Credentials never exposed<br/>Server-side only]
        ENV[🔑 Secrets in .env<br/>Never in client code]
        
        L1 -.Implements.- HTTPS
        L2 -.Implements.- OAUTH
        L3 -.Implements.- SESSION
        L4 -.Implements.- TOKENS
        L5 -.Implements.- PROXY
        L6 -.Implements.- ENV
    end
    
    classDef layer fill:#fecaca,stroke:#dc2626
    classDef impl fill:#d1fae5,stroke:#10b981
    
    class L1,L2,L3,L4,L5,L6 layer
    class HTTPS,OAUTH,SESSION,TOKENS,PROXY,ENV impl
```

## Real-time Data Update Cycle

```mermaid
stateDiagram-v2
    [*] --> Initial_Load
    
    Initial_Load --> Fetching: User Opens Dashboard
    Fetching --> Cached: Data Received
    Cached --> Displaying: Render UI
    
    Displaying --> Stale: After 5-15 minutes
    Stale --> Background_Refetch: Auto-trigger
    Background_Refetch --> Updating: Fetch Fresh Data
    Updating --> Cached: Update Cache
    Cached --> Displaying: Re-render
    
    Displaying --> [*]: User Closes Tab
    
    note right of Initial_Load
        First visit or
        hard refresh
    end note
    
    note right of Cached
        React Query Cache:
        - Summary: 5min TTL
        - Production: 15min TTL
        - Consumption: 15min TTL
    end note
    
    note right of Background_Refetch
        Happens automatically
        while user views dashboard
    end note
```

This is the complete visual representation of your solar monitoring application architecture!
