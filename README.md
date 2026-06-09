# API Gateway + Analytics Dashboard

A production-grade API Gateway with an admin analytics dashboard, built to demonstrate system design, scalability, security, and clean architecture suitable for a portfolio project.

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                        Client Applications                       │
│              (Web Apps, Mobile, External Services)               │
└──────────────────────────┬──────────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────────────┐
│                     API Gateway (Port 4000)                      │
│  ┌──────────┐ ┌──────────┐ ┌────────────┐ ┌──────────────────┐  │
│  │   Auth   │ │   Rate   │ │  Request   │ │     Routing      │  │
│  │  Layer   │ │ Limiting │ │  Logging   │ │     Layer        │  │
│  │JWT + Key │ │100 req/m │ │  MongoDB   │ │  Proxy Forward   │  │
│  └──────────┘ └──────────┘ └────────────┘ └──────────────────┘  │
└──────────┬──────────────────┬──────────────────┬────────────────┘
           │                  │                  │
           ▼                  ▼                  ▼
┌──────────────────┐ ┌──────────────────┐ ┌──────────────────┐
│  User Service    │ │ Payment Service  │ │  Order Service   │
│   (Port 4001)    │ │   (Port 4002)    │ │   (Port 4003)    │
│  Mock REST API   │ │  Mock REST API   │ │  Mock REST API   │
└──────────────────┘ └──────────────────┘ └──────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│              Admin Dashboard (React + Vite, Port 3000)           │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────────────┐  │
│  │ Overview │ │Analytics │ │ API Keys │ │  Request Logs    │  │
│  │ Metrics  │ │ Charts   │ │ Mgmt     │ │  Viewer          │  │
│  └──────────┘ └──────────┘ └──────────┘ └──────────────────┘  │
└──────────────────────────┬──────────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────────────┐
│                     MongoDB Database                             │
│         Users │ API Keys │ Request Logs │ Analytics              │
└─────────────────────────────────────────────────────────────────┘
```

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React (Vite), Tailwind CSS, Recharts |
| Backend | Node.js, Express.js |
| Database | MongoDB, Mongoose |
| Auth | JWT, bcrypt, API Key system |
| Proxy | http-proxy-middleware |

## Features

### API Gateway
- **Routing Layer** — Forwards `/api/users`, `/api/payments`, `/api/orders` to microservices
- **Security Layer** — JWT + API Key authentication middleware
- **Rate Limiting** — 100 requests/minute per user (configurable)
- **Request Logging** — Every request stored with userId, endpoint, method, status, response time
- **Error Handling** — Centralized handler with standard `{ success, message, data }` format

### Admin Dashboard
- **Authentication** — Admin login with protected routes
- **Overview Analytics** — Total requests, active users, error rate, requests/min
- **API Usage Analytics** — Endpoint charts, daily traffic, top users
- **API Key Management** — Generate, revoke, view usage stats
- **Request Logs Viewer** — Filterable table with pagination

## Project Structure

```
api-gateway-dashboard/
├── backend/
│   ├── config/          # Database connection, seed script
│   ├── controllers/     # Route handlers (auth, analytics, keys, logs)
│   ├── middleware/       # Auth, rate limiting, logging, error handling
│   ├── models/          # Mongoose schemas (User, APIKey, RequestLog)
│   ├── routes/          # Express route definitions
│   ├── services/        # Mock microservices + gateway proxy
│   └── server.js        # Main gateway entry point
├── frontend/
│   ├── components/      # Reusable UI (charts, cards, sidebar)
│   ├── layouts/         # Dashboard layout wrapper
│   ├── pages/           # Route pages (login, overview, analytics, keys, logs)
│   ├── services/        # API client (axios)
│   ├── utils/           # Auth helpers, formatters
│   └── App.jsx          # Root component with routing
└── README.md
```

## Getting Started

### Prerequisites

- Node.js 18+
- MongoDB running locally, via Docker, or a MongoDB Atlas connection string

**Quick MongoDB with Docker:**

```bash
docker compose up -d
```

### 1. Clone & Install

```bash
git clone <your-repo-url>
cd api-gateway-dashboard

# Backend
cd backend
npm install
cp .env.example .env   # Edit if needed

# Frontend
cd ../frontend
npm install
```

### 2. Seed the Database

```bash
cd backend
npm run seed
```

This creates:
- Admin user: `admin@gateway.io` / `admin123`
- 4 regular users with sample API keys
- 500 sample request logs for analytics

### 3. Start the Backend

```bash
cd backend
npm run dev
```

The gateway starts on `http://localhost:4000` along with three mock microservices on ports 4001–4003.

### 4. Start the Frontend

```bash
cd frontend
npm run dev
```

Open `http://localhost:3000` and sign in with the admin credentials.

## API Reference

### Gateway Routes (require JWT or API Key)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/users` | List users (proxied) |
| GET | `/api/users/profile` | User profile (proxied) |
| GET | `/api/payments` | List payments (proxied) |
| GET | `/api/orders` | List orders (proxied) |

**Authentication headers:**
```
Authorization: Bearer <jwt-token>
# OR
x-api-key: gw_<your-api-key>
```

### Admin Routes (require admin JWT)

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/admin/auth/login` | Admin login |
| GET | `/admin/analytics/overview` | Dashboard metrics |
| GET | `/admin/analytics/requests-by-endpoint` | Endpoint breakdown |
| GET | `/admin/analytics/daily-traffic` | 30-day traffic trend |
| GET | `/admin/analytics/top-users` | Most active users |
| GET | `/admin/api-keys` | List all API keys |
| POST | `/admin/api-keys` | Generate new key |
| PATCH | `/admin/api-keys/:id/revoke` | Revoke a key |
| GET | `/admin/logs` | Request logs (filterable) |

### Example: Gateway Request with API Key

```bash
curl -H "x-api-key: gw_your_key_here" http://localhost:4000/api/users
```

### Example: Admin Login

```bash
curl -X POST http://localhost:4000/admin/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@gateway.io","password":"admin123"}'
```

## Screenshots

> Add screenshots of your running dashboard here for maximum GitHub impact.

| Page | Description |
|------|-------------|
| `screenshots/login.png` | Admin login page |
| `screenshots/overview.png` | Dashboard overview with metrics |
| `screenshots/analytics.png` | API usage analytics charts |
| `screenshots/api-keys.png` | API key management |
| `screenshots/logs.png` | Request logs viewer |

## Design Decisions

1. **Single-process microservices** — Mock services run in the same Node process on separate ports, simulating real distributed architecture without Docker overhead for local dev.

2. **Gateway as single entry point** — All external traffic flows through one gateway, enabling centralized auth, rate limiting, and logging — the same pattern used by Netflix Zuul, Kong, and AWS API Gateway.

3. **Dual authentication** — JWT for dashboard admins, API keys for external service-to-service communication.

4. **Async request logging** — Logs are written on `res.finish` event without blocking the response pipeline.

5. **Standardized responses** — Every API response follows `{ success, message, data }` for predictable client handling.

## License

MIT
