# EdStock: Inventory Management System

A full-stack inventory dashboard for tracking products, stock levels, sales, purchases and expenses.

- **Front end:** Next.js 14 (App Router), Redux Toolkit Query, MUI DataGrid, Recharts and Tailwind CSS, with dark mode
- **Back end:** Express, Prisma and PostgreSQL
- **Shared:** Zod schemas, so the server and the client form validate input with the same rules

## Features

| Page | What it shows |
| --- | --- |
| **Dashboard** | Popular products, sales and purchase summaries, expense breakdown by category |
| **Inventory** | Every product in a sortable, filterable data grid |
| **Products** | Product cards with search, and a form to create products |
| **Users** | User list in a data grid |
| **Expenses** | Expenses by category, with category and date filters and a pie chart |
| **Settings** | Profile and preference toggles (UI only for now) |

The API validates every request. When input is invalid it returns a `400` that lists the error for each field, and the create-product form shows those same messages under each input.

## Project structure

This repository uses npm workspaces:

```
.
├── shared/   @inventory/shared: Zod schemas and types used by server and client
├── server/   Express + Prisma REST API
│   ├── prisma/          schema, migrations, seed script and seed data
│   └── src/
│       ├── controllers/ request handlers
│       ├── routes/      Express routers
│       ├── middleware/  validation and central error handling
│       └── lib/         shared Prisma client, async handler, HttpError
└── client/   Next.js front end
    └── src/
        ├── app/         pages (App Router) and UI components
        └── state/       Redux store and RTK Query API slice
```

## Getting started

### Prerequisites

- Node.js 18 or newer (npm 7+ for workspaces)
- PostgreSQL 14 or newer, running locally

### 1. Install dependencies

Run this from the repository root. It installs all three workspaces and builds `shared/`.

```bash
npm install
```

### 2. Set up the database

```bash
createdb inventory
```

```bash
cp server/.env.example server/.env
```

Edit `server/.env` and replace `USER` in `DATABASE_URL` with your Postgres user. Then create the tables and load the sample data:

```bash
cd server && npx prisma generate && npx prisma migrate deploy && npm run seed
```

### 3. Run the app

Start the API (http://localhost:8000):

```bash
npm run dev -w server
```

In a second terminal, start the client (http://localhost:3000):

```bash
cp client/.env.example client/.env.local && npm run dev -w client
```

## Environment variables

| File | Variable | Example | Purpose |
| --- | --- | --- | --- |
| `server/.env` | `DATABASE_URL` | `postgresql://USER@localhost:5432/inventory?schema=public` | Postgres connection string used by Prisma |
| `server/.env` | `PORT` | `8000` | API port (defaults to `3001` if unset) |
| `client/.env.local` | `NEXT_PUBLIC_API_BASE_URL` | `http://localhost:8000` | Where the client sends API requests |

## Scripts

| Command | Where | What it does |
| --- | --- | --- |
| `npm install` | root | Installs every workspace and builds `shared/` |
| `npm run build:shared` | root | Rebuilds the shared schemas after you edit `shared/src` |
| `npm run dev` | `server/` | Builds, then runs the API with nodemon and ts-node |
| `npm run build` / `npm start` | `server/` | Compiles to `dist/` / runs the compiled API |
| `npm run seed` | `server/` | Clears the database and loads the sample data from `prisma/seedData` |
| `npm run dev` | `client/` | Next.js dev server |
| `npm run build` / `npm start` | `client/` | Production build / serve it |
| `npm run lint` | `client/` | ESLint |

## API

Base URL: `http://localhost:8000`

| Method | Path | Description |
| --- | --- | --- |
| `GET` | `/dashboard` | Popular products, and sales, purchase and expense summaries |
| `GET` | `/products?search=` | List products, with an optional name filter |
| `POST` | `/products` | Create a product |
| `GET` | `/users` | List users |
| `GET` | `/expenses` | Expenses by category |

### Create a product

```http
POST /products
Content-Type: application/json

{ "name": "Desk Lamp", "price": 24.99, "stockQuantity": 40, "rating": 4.5 }
```

| Field | Type | Rules |
| --- | --- | --- |
| `name` | string | Required, 1–200 characters, trimmed |
| `price` | number | 0 to 1,000,000 |
| `stockQuantity` | integer | 0 or more |
| `rating` | number | Optional, 0–5 |
| `productId` | string | Optional; the server generates a UUID if omitted |

Returns `201` with the created product.

### Errors

Every error response is JSON with a `message`, plus `details` when there is more to say:

```json
{
  "message": "Validation failed",
  "details": { "fieldErrors": { "price": ["Price must be 0 or more"] } }
}
```

| Status | When |
| --- | --- |
| `400` | Invalid body or query string, or malformed JSON |
| `404` | Unknown route, or the record doesn't exist |
| `409` | A record with that unique value (e.g. `productId`) already exists |
| `500` | Unexpected server error (the details are logged on the server, never sent to the client) |

## Known limitations

- Dashboard figures come from pre-seeded summary tables, not from computed transactions.
- Product search is case-sensitive, and lists aren't paginated yet.
- The header search, notification badge and Settings page are placeholders.

These and the rest of the planned work are tracked in [ROADMAP.md](ROADMAP.md).

## License

[MIT](client/LICENSE)
