AgriConnect Liberia

An independent agricultural marketplace prototype connecting farmers and buyers across Liberia.

Project Status and Safety

- Independent prototype: Not affiliated with, endorsed by, or partnered with the World Bank, any government agency, or any hackathon organiser.
- Verify information: Confirm listings, farmer profiles, prices, contact details, and any demonstration seed data before relying on them.
- Payments: The app records and reports direct mobile-money payments between buyers and farmers but does not hold funds or process Orange Money or Lonestar MTN transactions. Verify transfers through your own mobile-money provider; reported payments are not automatically verified.
- Protect credentials and data: Never commit ".env" files, Supabase service-role keys, passwords, access tokens, private keys, mobile-money PINs, one-time codes, or real customer data. Frontend code may use only the Supabase publishable/anon key. Enforce authorization with Supabase Row Level Security (RLS); interface controls are not a security boundary.

Features

- Public marketplace: Browse agricultural products, search listings, filter by category, county, and organic status, and sort results.
- Product details: View produce descriptions, farmer information, quantities, availability, and prices in Liberian dollars (LRD).
- Authentication: Email/password registration and sign-in for farmer and buyer accounts.
- Farmer listings: Farmers can create and manage their own product listings.
- Buyer enquiries: Buyers can send enquiries about products.
- Enquiry management: Farmers can view relevant enquiries and update their statuses.
- Mobile-money workflow: Supports payment reporting, confirmation, dispute/cancellation workflows, and farmer payment-profile management.
- Responsive interface: React-based interface for mobile and desktop screens.
- Security controls: Supabase authentication and RLS policies are intended to restrict actions by user role and ownership.

Technology Stack

- React 18
- TypeScript
- Vite
- Tailwind CSS
- Lucide React
- Supabase Authentication
- Supabase PostgreSQL database
- Supabase Row Level Security (RLS)

Project Structure

Agriconnect-Liberia/
├── public/
│   └── favicon.svg
├── src/
│   ├── components/
│   ├── hooks/
│   ├── lib/
│   ├── App.tsx
│   ├── main.tsx
│   ├── index.css
│   └── types.ts
├── supabase/
│   └── migrations/
├── .gitignore
├── package.json
├── package-lock.json
├── tsconfig.app.json
├── tsconfig.json
├── vite.config.ts
└── README.md

The exact directory contents may change as development continues.

Environment Configuration

Create a ".env" file in the project root and exclude it from GitHub.

Configure the following variables using values from your own Supabase project:

VITE_SUPABASE_URL=https://YOUR_PROJECT_REF.supabase.co
VITE_SUPABASE_ANON_KEY=YOUR_SUPABASE_PUBLISHABLE_OR_ANON_KEY

Replace the placeholders with the correct project URL and publishable/anon key.

Security requirements:

- Never place a Supabase service-role key in frontend code or any "VITE_*" environment variable.
- Never publish passwords, access tokens, private keys, or real customer data.
- Enforce access controls with Supabase RLS policies; hiding interface buttons is not sufficient.

Getting Started

Prerequisites

- Node.js
- npm
- A Supabase project with the required schema and migrations applied

Install Dependencies

npm install

Start the Development Server

npm run dev

Vite will display the local development URL in the terminal.

Validation

Run the following commands before deployment:

Type Checking

npm run typecheck

Production Build

npm run build

Linting

npm run lint

The production build is generated in the "dist/" directory.

Database and Migrations

Database migrations are stored in "supabase/migrations/".

Before applying migrations:

1. Confirm that you selected the correct Supabase project.
2. Inspect the existing database schema and data.
3. Review migrations for destructive operations.
4. Back up important existing data.
5. Apply migrations in the correct order.
6. Verify RLS policies for anonymous visitors, buyers, farmers, and cross-user access.

Do not reset the database or run destructive migrations against data you need to preserve.

After applying migrations, test that:

- Anonymous users can browse publicly available products.
- Farmers can create and manage only their own listings.
- Buyers can create and access only their own enquiries, subject to intended policies.
- Farmers can view enquiries associated with their products and update only permitted fields.
- Users cannot access or modify another user's private records.
- Payment reports, confirmations, disputes, and cancellations follow intended authorization rules.

Mobile-Money Payments

AgriConnect Liberia supports direct payment arrangements between buyers and farmers using services such as Orange Money and Lonestar MTN Mobile Money.

The app does not automatically verify transfers because a user reports them. Confirm payments through your own provider and resolve disputes carefully. Never store mobile-money PINs, passwords, or one-time verification codes in the application.

Deployment Checklist

Before making the application available to real users:

- [ ] Configure the correct Supabase project URL and publishable/anon key.
- [ ] Confirm that all required migrations have been applied successfully.
- [ ] Verify RLS policies and authentication role restrictions.
- [ ] Run the typecheck and production build.
- [ ] Test registration and sign-in for buyers and farmers.
- [ ] Test product creation, editing, and deletion permissions.
- [ ] Test enquiry creation and status updates.
- [ ] Test payment reporting and dispute workflows.
- [ ] Check the mobile layout on an Android phone.
- [ ] Remove demonstration data or clearly label it.
- [ ] Confirm that no secrets are committed to GitHub.
- [ ] Configure appropriate production hosting and environment variables.

Project Independence

AgriConnect Liberia is an independent project. References to agricultural innovation events are for context only and do not imply sponsorship, endorsement, or official affiliation.

License

No open-source license has been specified. Unless a license is added, do not assume that the code is licensed for unrestricted redistribution or commercial reuse.
