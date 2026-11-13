import { Link, Outlet } from "react-router-dom";
import { Flower2, Calendar, Users, Wallet, Globe } from "lucide-react";

const features = [
  { icon: Calendar, text: "Manage every ceremony — Haldi, Mehendi, Sangeet & more" },
  { icon: Users, text: "Invite family, assign tasks and collect event-wise RSVPs" },
  { icon: Wallet, text: "Track contributions and expenses across both families" },
  { icon: Globe, text: "Publish a beautiful wedding website and shared gallery" },
];

/**
 * Split-screen layout for public auth pages:
 * branding panel on the left, form content on the right.
 */
export default function PublicLayout() {
  return (
    <div className="min-h-screen bg-wine-50 lg:grid lg:grid-cols-[1.05fr_1fr]">
      {/* Branding panel */}
      <aside className="relative hidden overflow-hidden bg-wine-950 lg:flex lg:flex-col lg:justify-between lg:p-12">
        <div className="bg-gold-dots absolute inset-0" aria-hidden="true" />
        <div
          className="absolute -left-24 -top-24 h-96 w-96 rounded-full bg-wine-800/50 blur-3xl"
          aria-hidden="true"
        />
        <div
          className="absolute -bottom-32 -right-24 h-[28rem] w-[28rem] rounded-full bg-gold-500/10 blur-3xl"
          aria-hidden="true"
        />

        <div className="relative">
          <Link to="/" className="inline-flex items-center gap-2.5">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-gold-400 to-gold-600 shadow-lg shadow-gold-500/25">
              <Flower2 className="h-5 w-5 text-wine-950" aria-hidden="true" />
            </span>
            <span className="font-display text-xl font-semibold tracking-tight text-white">
              MakeMyMarriage
            </span>
          </Link>
        </div>

        <div className="relative max-w-md">
          <h1 className="font-display text-4xl font-semibold leading-tight text-white xl:text-5xl">
            Your entire wedding,{" "}
            <span className="bg-gradient-to-r from-gold-300 to-gold-500 bg-clip-text text-transparent">
              one beautiful workspace
            </span>
          </h1>
          <p className="mt-4 text-base leading-relaxed text-wine-200/90">
            Replace scattered WhatsApp messages, spreadsheets and paper notes —
            plan every event, guest and rupee together with your family.
          </p>

          <ul className="mt-8 space-y-4">
            {features.map(({ icon: Icon, text }) => (
              <li key={text} className="flex items-start gap-3 text-sm text-wine-100/90">
                <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-white/10 ring-1 ring-white/15">
                  <Icon className="h-3.5 w-3.5 text-gold-300" aria-hidden="true" />
                </span>
                {text}
              </li>
            ))}
          </ul>
        </div>

        <p className="relative text-xs text-wine-300/70">
          Made with ♥ for Indian families — Haldi to Reception, sorted.
        </p>
      </aside>

      {/* Form panel */}
      <main className="flex min-h-screen flex-col px-5 py-8 sm:px-10 lg:min-h-0 lg:justify-center lg:py-12">
        {/* Compact brand for mobile */}
        <Link
          to="/"
          className="mb-8 inline-flex items-center gap-2.5 lg:hidden"
        >
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-gold-400 to-gold-600">
            <Flower2 className="h-4.5 w-4.5 text-wine-950" aria-hidden="true" />
          </span>
          <span className="font-display text-lg font-semibold text-wine-900">
            MakeMyMarriage
          </span>
        </Link>

        <div className="mx-auto w-full max-w-md">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
