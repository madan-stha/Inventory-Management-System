# Roadmap: from tutorial-grade to showcase project

## Where it stands today (analysis, Nov 2026)

**What works:** every page renders against live data (Dashboard, Inventory, Products, Users, Expenses, Settings); product search and creation work; the stack choice (Next 14 App Router, RTK Query, Prisma, Postgres, MUI DataGrid, Recharts, Tailwind with dark mode) is solid and in demand.

**Why it doesn't yet stand out:**

| Area | Finding |
| --- | --- |
| Originality | The "EdStock" name, layout and seed data look like a widely followed YouTube tutorial. Reviewers who know it will discount it unless the project clearly goes further. |
| Business logic | Mostly read-only. Only `POST /products` writes. Stock never changes, because nothing records a sale or purchase. The dashboard numbers come from **pre-seeded summary tables** (`SalesSummary`, `PurchaseSummary`, `ExpenseSummary`), not computed from transactions. "Popular products" are sorted by stock quantity, not by sales. |
| Correctness | Search is case-sensitive (`phlox` returns 0 results, `Phlox` returns 3). Invalid input reaches Prisma and comes back as a generic 500. Money is stored as `Float`, while `ExpenseByCategory.amount` is a `BigInt`. `Purchases.Products` is optional while `productId` is required. |
| Backend quality | Each controller creates its own `PrismaClient`. There is no validation layer, no central error handler, no pagination, and no indexes beyond primary keys. There's a typo in `darhboardController.ts`. `body-parser` duplicates `express.json()`. The `dev` script runs `tsc -w` and `ts-node` side by side, which does the same work twice. |
| Front-end polish | Images are the literal text "img" and "Logo". The header search bar, the notification badge ("3") and the Settings page are static mocks. No loading skeletons, error states or empty states beyond plain text. |
| Engineering signals | No tests, no CI, no deployment, no Docker. The README was the create-next-app boilerplate until today. There are 13 commits, all from Aug 2024. |

**Fixed today to make it runnable:** added the missing `rimraf` dependency. Fixed the server `tsconfig` so `npm start` finds `dist/index.js`. Added `.env.example` files and a root README with setup steps.

---

## Phase 1 — Foundations (≈1 week)
Goal: anyone can clone and run it in 2 minutes, and the code looks professional.

- [ ] `docker-compose.yml` with Postgres + server + client; one `npm run dev` at the root (npm workspaces).
- [x] One shared Prisma client; a central error-handling middleware; drop `body-parser`; rename `darhboardController`.
- [x] Request validation with **Zod**, returning 400 with field errors (share the schemas with the client form).
- [ ] Switch money fields to `Decimal`; make relations consistent; add indexes on `productId` and `timestamp`.
- [ ] Case-insensitive search (`mode: "insensitive"`); server-side pagination and sorting for the DataGrid.
- [ ] ESLint + Prettier on both apps; Husky pre-commit hook.
- [ ] Upgrade to Next 15 / React 19 and fix the Recharts `defaultProps` console warnings.

## Phase 2 — Make it a real inventory system (≈2 weeks)
Goal: the app *does* something. This is the biggest differentiator from the tutorial.

- [ ] **Full product CRUD:** edit, delete (soft delete), SKU, category, supplier, reorder level, image.
- [ ] **Stock movements:** create sales and purchases (and adjustments/returns) in a Prisma **transaction** that updates `stockQuantity`, with an audit trail of who changed what.
- [ ] **Computed analytics:** remove the seeded summary tables and compute KPIs with SQL aggregations over real transactions (daily/weekly/monthly, change % vs the previous period). Rank "popular products" by units sold.
- [ ] **Low-stock alerts:** connect the notification bell to products below their reorder level.
- [ ] **Suppliers and purchase orders:** draft → ordered → received; receiving stock creates purchase records.
- [ ] CSV import/export for products and transactions.
- [ ] Wire up the header search (global search across products, suppliers and orders).

## Phase 3 — Production-grade signals (≈1–2 weeks)
Goal: show you can ship and maintain software, not just build screens.

- [ ] **Authentication and roles** (Admin / Manager / Staff), with route guards on both sides. Your `auth-system` repo could be reused here, which also cross-links two portfolio projects.
- [ ] Make the Settings page real (profile, theme, notification preferences) and persist it.
- [ ] **Tests:** Vitest + Supertest for the API (especially the stock-movement transactions), React Testing Library for components, and one Playwright end-to-end test for "create product → record sale → stock decreases → dashboard updates".
- [ ] **CI:** a GitHub Actions workflow that runs lint, type-check, tests and build on every PR. Add a status badge to the README.
- [ ] OpenAPI/Swagger docs served at `/docs`.
- [ ] Rate limiting, a CORS allow-list, structured logging (pino), and a health-check endpoint.

## Phase 4 — Standout feature (pick 1–2, ≈1 week each)
These are what reviewers will remember.

- [ ] **Real-time stock updates** via WebSockets or Server-Sent Events, so two browser windows update live. This fits your `Real-Time-Inventory` repo, and the two could be merged into one stronger project.
- [ ] **Demand forecasting / reorder suggestions** from sales history (moving average or simple exponential smoothing), shown on a "Restock" page.
- [ ] **Barcode/QR scanning** with the phone camera to look up items or record sales.
- [ ] Multi-warehouse stock with transfers between locations.

## Phase 5 — Ship and present (≈3–4 days)
Goal: a reviewer understands it in 60 seconds without cloning.

- [ ] Deploy: client on Vercel, API on Render/Railway/Fly, database on Neon/Supabase. Add a **one-click demo login** with seeded data that resets nightly.
- [ ] Rebrand away from "EdStock": your own name, logo, favicon and colour palette. Replace the "img" placeholders with real product images (S3/Cloudinary upload).
- [ ] README rewrite: hero GIF, live demo link, feature list, architecture diagram, ER diagram, tech decisions ("why RTK Query", "why transactions for stock"), test/CI badges.
- [ ] A 2-minute Loom walkthrough, a short write-up/case study, and pin the repo on your GitHub profile.
- [ ] Mobile-responsive pass, Lighthouse ≥ 90, and accessibility checks (keyboard navigation, contrast).

---

## Suggested order if time is short
1. Phase 1 (Docker, validation, error handling)
2. Phase 2: stock movements + computed analytics
3. Phase 3: auth + tests + CI
4. Phase 5: deploy + README + demo
5. One Phase 4 feature (real-time is the most visual)

That's about 4–5 focused weeks to a project that clearly goes beyond the tutorial.
