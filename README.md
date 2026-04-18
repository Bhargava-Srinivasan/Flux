# Flux SaaS

Work management application built with Next.js, NestJS, and PostgreSQL.

## Architecture

*   **apps/web**: Next.js App Router (Frontend)
*   **apps/api**: NestJS (Backend)
*   **packages/config**: Shared configuration (ESLint, TSConfig)
*   **packages/types**: Shared TypeScript types

## Prerequisites

*   Node.js >= 18
*   Docker & Docker Compose

## Getting Started

1.  Install dependencies:
    ```bash
    npm install
    ```

2.  Environment Setup:
    Copy `.env.example` to `.env`:
    ```bash
    cp .env.example .env
    ```

3.  Database Setup:
    This project is configured to use PostgreSQL by default (schema.prisma).
    To run locally, you can use the provided docker-compose configuration.

    ```bash
    # Start PostgreSQL
    docker-compose up -d postgres

    # Run migrations
    cd apps/api
    npx prisma migrate dev

    # Seed Database
    npm run seed:dev
    ```

    *Note: If you need to use SQLite for lightweight testing where Docker is unavailable, you must manually update `apps/api/prisma/schema.prisma` to `provider = "sqlite"` and update `.env` to `DATABASE_URL="file:./dev.db"`.*

4.  Run in Development Mode:
    ```bash
    npm run dev
    ```

    *   Web: http://localhost:3000
    *   API: http://localhost:3001

## Docker

Run the entire stack with Docker Compose:

```bash
docker-compose up --build
```

## Testing

### E2E Tests (Playwright)

We use Playwright for End-to-End testing.

1.  Start the applications (Web and API).
2.  Seed the database for E2E:
    ```bash
    cd apps/api
    npm run seed:e2e
    ```
3.  Run the tests:
    ```bash
    npx playwright test
    ```

**E2E Note (Important)**:
E2E tests are reliable in local development environments. However, in constrained CI or sandbox environments, tests may experience timeouts or failures due to resource limitations (slow background server startup, port conflicts). If you encounter instability, ensure both the Backend (`:3001`) and Frontend (`:3000`) servers are fully ready before launching the tests.

### Unit Tests

*   API: `npm run test -w @flux/api`

## Environment Variables

| Variable | Description | Default |
| :--- | :--- | :--- |
| `DATABASE_URL` | Prisma Connection String | `postgresql://...` |
| `JWT_SECRET` | Secret for signing JWTs | `supersecret` |
| `API_URL` | Backend URL | `http://localhost:3001` |
| `NEXT_PUBLIC_API_URL` | API URL exposed to Frontend | `http://localhost:3001` |

## Folder Structure

```
.
├── apps
│   ├── api          # NestJS Backend
│   │   ├── src/auth        # Authentication Module
│   │   ├── src/common      # Guards, Interceptors, Decorators
│   │   ├── src/organizations # Organization Module
│   │   ├── src/workspaces    # Workspace Module
│   │   └── prisma          # DB Schema & Seeds
│   └── web          # Next.js Frontend
│       ├── app/(auth)      # Login/Signup Pages
│       ├── app/(dashboard) # Core Dashboard Pages
│       ├── components      # UI Components
│       └── lib             # Utilities & API Client
├── packages
│   ├── config       # Shared Configs
│   └── types        # Shared Types
├── tests            # E2E Tests
└── docker-compose.yml
```

## READY FOR NEXT PHASE
