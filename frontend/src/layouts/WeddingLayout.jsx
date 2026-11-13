import { NavLink, Outlet, useParams, Link } from "react-router-dom";
import {
  CalendarDays,
  CheckSquare,
  LayoutDashboard,
  Users,
  Heart,
  Wallet,
  Image,
  Globe,
  ChevronLeft,
} from "lucide-react";
import { useWedding } from "../features/weddings/useWeddings";
import Badge from "../components/ui/Badge";

const navItems = [
  { to: ".", label: "Overview", icon: LayoutDashboard, end: true },
  { to: "events", label: "Events", icon: CalendarDays },
  { to: "tasks", label: "Tasks", icon: CheckSquare },
  { to: "guests", label: "Guests", icon: UserRound },
  { to: "members", label: "Members", icon: Users },
];

// Modules arriving in later phases
const upcomingItems = [
  { label: "Finance", icon: Wallet },
  { label: "Gallery", icon: Image },
  { label: "Website", icon: Globe },
];

const roleTone = { ADMIN: "gold", MANAGER: "wine", EDITOR: "wine", VIEWER: "gray" };

/**
 * Wedding workspace shell: header + sidebar + <Outlet />.
 * Every child page receives the loaded wedding via useOutletContext().
 */
export default function WeddingLayout() {
  const { weddingId } = useParams();
  const { data: res, isLoading, isError, error } = useWedding(weddingId);

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-10 w-10 animate-spin rounded-full border-2 border-wine-200 border-t-wine-700" />
      </div>
    );
  }

  if (isError) {
    const forbidden = error?.response?.status === 403;
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 px-6 text-center">
        <Heart className="h-12 w-12 text-wine-300" aria-hidden="true" />
        <div>
          <h1 className="font-display text-2xl font-semibold text-wine-950">
            {forbidden ? "You don't have access to this wedding" : "Wedding not found"}
          </h1>
          <p className="mt-2 text-sm text-wine-500">
            {forbidden
              ? "Ask the wedding admin to invite you as a member."
              : "It may have been deleted, or the link is incorrect."}
          </p>
        </div>
        <Link
          to="/dashboard"
          className="inline-flex items-center gap-1.5 rounded-xl bg-wine-700 px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-wine-800"
        >
          <ChevronLeft className="h-4 w-4" aria-hidden="true" />
          Back to dashboard
        </Link>
      </div>
    );
  }

  const wedding = res?.data;
  const role = wedding?.role;
  const weddingDate = wedding?.weddingDate
    ? new Date(wedding.weddingDate).toLocaleDateString("en-IN", {
        day: "numeric",
        month: "short",
        year: "numeric",
      })
    : null;

  return (
    <div className="min-h-screen bg-wine-50">
      {/* Header */}
      <header className="border-b border-wine-200 bg-white/80 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3 sm:px-6">
          <div className="flex items-center gap-3">
            <Link
              to="/dashboard"
              className="hidden rounded-lg p-2 text-wine-500 transition-colors hover:bg-wine-100 hover:text-wine-800 sm:block"
              aria-label="Back to dashboard"
            >
              <ChevronLeft className="h-5 w-5" aria-hidden="true" />
            </Link>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-display text-lg font-semibold leading-tight text-wine-950 sm:text-xl">
                  {wedding?.title}
                </h1>
                {role && <Badge tone={roleTone[role] || "wine"}>{role}</Badge>}
                {wedding?.status === "ARCHIVED" && <Badge tone="gray">Archived</Badge>}
              </div>
              <p className="text-xs text-wine-500">
                {wedding?.couple?.partnerOne} & {wedding?.couple?.partnerTwo}
                {weddingDate ? ` · ${weddingDate}` : ""}
              </p>
            </div>
          </div>

          <div className="hidden items-center gap-2 text-sm text-wine-500 sm:flex">
            <Heart className="h-4 w-4 text-gold-500" aria-hidden="true" />
            <span>MakeMyMarriage</span>
          </div>
        </div>
      </header>

      <div className="mx-auto flex max-w-7xl flex-col gap-6 px-4 py-6 sm:px-6 lg:flex-row">
        {/* Sidebar */}
        <aside className="lg:w-56 lg:shrink-0">
          <nav className="flex gap-2 overflow-x-auto pb-1 lg:flex-col lg:overflow-visible lg:pb-0">
            {navItems.map(({ to, label, icon: Icon, end }) => (
              <NavLink
                key={label}
                to={to}
                end={end}
                className={({ isActive }) =>
                  `flex shrink-0 items-center gap-2.5 rounded-xl px-4 py-2.5 text-sm font-medium transition-colors ${
                    isActive
                      ? "bg-wine-700 text-white shadow-sm shadow-wine-900/20"
                      : "text-wine-700 hover:bg-wine-100"
                  }`
                }
              >
                <Icon className="h-4 w-4" aria-hidden="true" />
                {label}
              </NavLink>
            ))}

            <div className="mt-4 hidden lg:block">
              <p className="mb-2 px-4 text-xs font-semibold uppercase tracking-wide text-wine-400">
                Coming soon
              </p>
              {upcomingItems.map(({ label, icon: Icon }) => (
                <div
                  key={label}
                  className="flex cursor-not-allowed items-center gap-2.5 rounded-xl px-4 py-2.5 text-sm font-medium text-wine-300"
                  title={`Available in a later phase`}
                >
                  <Icon className="h-4 w-4" aria-hidden="true" />
                  {label}
                </div>
              ))}
            </div>
          </nav>
        </aside>

        {/* Page content */}
        <main className="min-w-0 flex-1">
          <Outlet context={{ wedding }} />
        </main>
      </div>
    </div>
  );
}
