import { Sprout, AlertTriangle, Database, Lock, Globe, Code, Heart } from 'lucide-react';
import type { Route } from '@/hooks/useRouter';

interface AboutPageProps {
  navigate: (r: Route) => void;
}

export function AboutPage({ navigate }: AboutPageProps) {
  return (
    <div className="animate-fade-in section-padding mx-auto max-w-3xl py-8">
      <div className="mb-8 text-center">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-leaf-100 text-leaf-600">
          <Sprout size={32} />
        </div>
        <h1 className="font-display text-2xl font-bold text-forest-900 sm:text-3xl">About AgriConnect Liberia</h1>
        <p className="mx-auto mt-3 max-w-xl text-sm leading-relaxed text-forest-500">
          An independent agricultural marketplace prototype, built to demonstrate how technology can connect Liberian farmers directly with buyers.
        </p>
      </div>

      {/* Independence disclaimer */}
      <div className="mb-6 flex items-start gap-3 rounded-2xl border border-cream-200 bg-cream-50 p-5">
        <AlertTriangle size={20} className="mt-0.5 flex-shrink-0 text-cream-700" />
        <div>
          <h2 className="text-sm font-semibold text-cream-900">Independent project — not affiliated</h2>
          <p className="mt-1 text-sm leading-relaxed text-cream-800">
            AgriConnect Liberia is an independent prototype. It is not affiliated with, endorsed by, or partnered with the World Bank, any government agency, or any hackathon organiser. No real transactions, payments, or deliveries occur through this platform.
          </p>
        </div>
      </div>

      {/* Prototype status */}
      <section className="mb-6 rounded-2xl bg-white p-6 shadow-card">
        <h2 className="mb-3 font-display text-lg font-semibold text-forest-900">Prototype status</h2>
        <p className="text-sm leading-relaxed text-forest-600">
          This is a working prototype designed for live demonstration at an agricultural innovation hackathon. All produce listings, farmer profiles, prices, contact details, and enquiries are <strong>demo data</strong> — they are invented for demonstration and do not represent real farmers, real businesses, or actual transactions.
        </p>
        <p className="mt-3 text-sm leading-relaxed text-forest-600">
          The application works entirely in your browser. Listing creation, favorites, and moderation use your browser's local storage — no data is sent to any server.
        </p>
      </section>

      {/* What it does */}
      <section className="mb-6 rounded-2xl bg-white p-6 shadow-card">
        <h2 className="mb-4 font-display text-lg font-semibold text-forest-900">What the prototype does</h2>
        <ul className="space-y-3 text-sm text-forest-600">
          <li className="flex items-start gap-2.5">
            <span className="mt-0.5 flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full bg-leaf-100 text-leaf-600 text-xs">1</span>
            <span>Browse a marketplace of produce from across six Liberian counties with working search, category filters, county filters, and sorting.</span>
          </li>
          <li className="flex items-start gap-2.5">
            <span className="mt-0.5 flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full bg-leaf-100 text-leaf-600 text-xs">2</span>
            <span>View detailed produce pages with photos, pricing in Liberian dollars (LRD), harvest dates, and farmer information.</span>
          </li>
          <li className="flex items-start gap-2.5">
            <span className="mt-0.5 flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full bg-leaf-100 text-leaf-600 text-xs">3</span>
            <span>Fill in a "List your produce" form that adds new listings to the local prototype state.</span>
          </li>
          <li className="flex items-start gap-2.5">
            <span className="mt-0.5 flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full bg-leaf-100 text-leaf-600 text-xs">4</span>
            <span>Send a buyer enquiry form with validation — without claiming a real message was delivered.</span>
          </li>
          <li className="flex items-start gap-2.5">
            <span className="mt-0.5 flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full bg-leaf-100 text-leaf-600 text-xs">5</span>
            <span>Save favorites that persist in your browser when local storage is available.</span>
          </li>
          <li className="flex items-start gap-2.5">
            <span className="mt-0.5 flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full bg-leaf-100 text-leaf-600 text-xs">6</span>
            <span>Review and remove listings through a demonstration moderation panel.</span>
          </li>
          <li className="flex items-start gap-2.5">
            <span className="mt-0.5 flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full bg-leaf-100 text-leaf-600 text-xs">7</span>
            <span>Read agricultural tips, clearly separated between verified expert guidance and general community suggestions.</span>
          </li>
        </ul>
      </section>

      {/* What it doesn't do */}
      <section className="mb-6 rounded-2xl bg-white p-6 shadow-card">
        <h2 className="mb-4 font-display text-lg font-semibold text-forest-900">What it does not do</h2>
        <div className="space-y-2.5 text-sm text-forest-600">
          <div className="flex items-start gap-2.5"><Lock size={16} className="mt-0.5 flex-shrink-0 text-forest-400" /> It does not use authentication or user accounts.</div>
          <div className="flex items-start gap-2.5"><Database size={16} className="mt-0.5 flex-shrink-0 text-forest-400" /> It does not connect to a real database (data lives in your browser only).</div>
          <div className="flex items-start gap-2.5"><AlertTriangle size={16} className="mt-0.5 flex-shrink-0 text-forest-400" /> It does not process payments or handle real money.</div>
          <div className="flex items-start gap-2.5"><Globe size={16} className="mt-0.5 flex-shrink-0 text-forest-400" /> It does not send enquiries to real farmers.</div>
        </div>
      </section>

      {/* Tech stack */}
      <section className="mb-6 rounded-2xl bg-white p-6 shadow-card">
        <h2 className="mb-3 font-display text-lg font-semibold text-forest-900">Built with</h2>
        <div className="flex flex-wrap gap-2">
          {['React', 'TypeScript', 'Vite', 'Tailwind CSS', 'Lucide Icons'].map(tech => (
            <span key={tech} className="chip bg-forest-50 text-forest-600"><Code size={11} /> {tech}</span>
          ))}
        </div>
        <p className="mt-3 text-sm text-forest-500">
          US$0 budget. Free-tier tools only. No paid APIs, no billing requirements.
        </p>
      </section>

      {/* Roadmap */}
      <section className="mb-6 rounded-2xl bg-forest-50 p-6">
        <h2 className="mb-3 font-display text-lg font-semibold text-forest-900">From prototype to production</h2>
        <p className="text-sm leading-relaxed text-forest-600">
          This prototype is designed to be extended. To make it a real platform, the next steps would include:
        </p>
        <ul className="mt-3 space-y-2 text-sm text-forest-600">
          <li className="flex items-start gap-2"><span className="mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-leaf-500" /> Connect to a real database (e.g. Supabase) for persistent listings and accounts</li>
          <li className="flex items-start gap-2"><span className="mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-leaf-500" /> Add farmer and buyer authentication</li>
          <li className="flex items-start gap-2"><span className="mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-leaf-500" /> Integrate a real messaging or notification system for enquiries</li>
          <li className="flex items-start gap-2"><span className="mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-leaf-500" /> Add a payment gateway (if transactions are needed)</li>
          <li className="flex items-start gap-2"><span className="mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-leaf-500" /> Verify farmer identities through a vetting process</li>
        </ul>
        <p className="mt-4 text-xs text-forest-400">
          See the README file included with the project for detailed instructions on connecting a real database.
        </p>
      </section>

      {/* CTA */}
      <div className="text-center">
        <button onClick={() => navigate({ name: 'marketplace' })} className="btn-primary text-base">
          <Sprout size={18} />
          Explore the marketplace
        </button>
        <p className="mt-4 flex items-center justify-center gap-1 text-xs text-forest-400">
          Built with <Heart size={12} className="fill-gold-500 text-gold-500" /> for Liberia's agricultural community
        </p>
      </div>
    </div>
  );
}
