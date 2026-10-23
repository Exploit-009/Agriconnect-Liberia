# AgriConnect Liberia

An independent agricultural marketplace prototype for Liberia, designed for demonstration at an agricultural innovation hackathon.

## Important disclaimers

- **Independent project.** Not affiliated with, endorsed by, or partnered with the World Bank, any government agency, or any hackathon organiser.
- **Prototype.** All produce listings, farmer profiles, prices, contact details, and enquiries are **demo data** — invented for demonstration. No real transactions, payments, or deliveries occur.
- **No real data.** No real farmers, verified suppliers, or actual buyer enquiries are represented.

## What it does

- **Home page** — Brand header, navigation, search bar, popular categories, featured produce, how-it-works, and produce-by-county.
- **Marketplace** — Working search, category filters, county filters, sort options, and responsive product cards.
- **Product details** — Produce name, photos, county, farmer name, quantity, unit, price in Liberian dollars (LRD), harvest/availability info, and a buyer enquiry action.
- **Farmer profiles** — Profile page with bio, specialties, and the farmer's active listings.
- **List your produce** — A functional form with validation that adds listings to local prototype state.
- **Buyer enquiry** — Form with required-field validation, accessible error messages, and a confirmation state (does not claim a message was actually delivered).
- **Favorites** — Toggle favorites that persist in browser local storage when available.
- **Agricultural tips** — General practical information clearly distinguished from verified expert advice.
- **About page** — Project purpose, prototype status, and independent status.
- **Moderation panel** — Simple demo interface for reviewing and removing sample listings.

## Tech stack

- React + TypeScript
- Vite (build tool)
- Tailwind CSS (styling)
- Lucide React (icons)
- No paid services, APIs, or billing required. US$0 budget.

## Getting started

### Prerequisites

- Node.js 18 or higher
- npm (comes with Node.js)

### Running locally

```bash
npm install
npm run dev
```

The app will be available at the URL shown in the terminal (typically `http://localhost:5173`).

### Building for production

```bash
npm run build
npm run preview
```

The built files will be in the `dist/` directory.

### Type checking

```bash
npm run typecheck
```

### Linting

```bash
npm run lint
```

## Project structure

```
src/
  components/     # Reusable UI components (Header, Footer, ProduceCard, etc.)
  hooks/          # Custom hooks (router, favorites, listings)
  pages/          # Page components (Home, Marketplace, ProductDetail, etc.)
  lib/            # Utility functions
  data.ts         # Demo data (produce, farmers, tips)
  types.ts        # TypeScript type definitions
  App.tsx         # Root component with routing
  main.tsx        # Entry point
  index.css       # Global styles + Tailwind
```

## How routing works

This prototype uses a lightweight hash-based router (no external routing library). Navigation happens through `#/marketplace`, `#/product/p1`, etc. This keeps the project simple and dependency-free.

## How local storage works

- **Favorites** are stored under `agriconnect_favorites` in the browser's local storage.
- **User-created listings** are stored under `agriconnect_user_listings`.
- **Removed listing IDs** are stored under `agriconnect_removed_listings`.

If local storage is unavailable (e.g. in a private browsing mode), the app still works — favorites and user listings simply won't persist across reloads.

## Editing the demo data

All demo data is in `src/data.ts`:
- `demoProduce` — The produce listings
- `demoFarmers` — The farmer profiles
- `demoTips` — The agricultural tips

To add or change listings, edit the arrays in that file.

## Exporting the project

The production build (`npm run build`) produces a static `dist/` folder that can be hosted on any static file server or free hosting platform (Netlify, Vercel, GitHub Pages, etc.).

## Connecting to a real database

This prototype is designed to be extended into a real platform. Here is a roadmap:

### 1. Set up a database (e.g. Supabase — free tier)

Create tables for `produce`, `farmers`, `enquiries`, and `favorites`. The current `src/types.ts` already defines the shape of the data.

### 2. Add authentication

Use Supabase Auth (email/password) for farmer and buyer accounts. Replace the local-storage-based listing creation with authenticated database inserts.

### 3. Replace local data with database queries

Replace the `demoProduce` and `demoFarmers` imports with Supabase queries. The `useListings` hook in `src/hooks/useListings.ts` is the main place to make this change.

### 4. Add a real enquiry system

Instead of just showing a confirmation screen, store enquiries in the database and notify farmers via email or SMS.

### 5. Add a payment gateway (if needed)

Integrate Stripe or Mobile Money APIs for actual transactions. Only add this if the platform will handle real payments.

### 6. Implement real moderation

Move the moderation panel behind admin authentication with proper audit logging.

## License

This is a prototype project for demonstration purposes. Use freely for educational and hackathon contexts.
