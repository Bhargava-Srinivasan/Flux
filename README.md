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

3.  Run in Development Mode:
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

## Folder Structure

```
.
├── apps
│   ├── api          # NestJS Backend
│   └── web          # Next.js Frontend
├── packages
│   ├── config       # Shared Configs
│   └── types        # Shared Types
├── docker-compose.yml
├── package.json
└── README.md
```

## READY FOR NEXT PHASE
