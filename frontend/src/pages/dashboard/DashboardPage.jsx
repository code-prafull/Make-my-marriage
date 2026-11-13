import { Link, useNavigate } from "react-router-dom";
import { CalendarDays, Flower2, LogOut, Plus, Heart } from "lucide-react";
import Button from "../../components/ui/Button";
import Badge from "../../components/ui/Badge";
import EmptyState from "../../components/ui/EmptyState";
import { useLogout, useSession } from "../../features/auth/useAuth";
import { useWeddings } from "../../features/weddings/useWeddings";

const roleTone = { ADMIN: "gold", MANAGER: "wine", EDITOR: "wine", VIEWER: "gray" };

function formatDate(d) {
  return new Date(d).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

/** Dashboard home: list of the user's wedding workspaces. */
export default function DashboardPage() {
  const { data: user } = useSession();
  const logout = useLogout();
  const navigate = useNavigate();
  const { data: res, isLoading } = useWeddings();

  const handleLogout = () =>
    logout.mutate(undefined, { onSuccess: () => navigate("/login", { replace: true }) });

  const weddings = res?.data ?? [];

  return (
    <div className="min-h-screen bg-wine-50">
      <header className="border-b border-wine-100 bg-white/80 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-5">
          <Link to="/dashboard" className="flex items-center gap-2.5">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-gold-400 to-gold-600">
              <Flower2 className="h-4.5 w-4.5 text-wine-950" aria-hidden="true" />
            </span>
            <span className="font-display text-lg font-semibold text-wine-900">
              MakeMyMarriage
            </span>
          </Link>

          <div className="flex items-center gap-3">
            <span className="hidden text-sm text-wine-600 sm:block">
              Hi, <strong className="font-semibold text-wine-900">{user?.name}</strong>
            </span>
            <Button variant="secondary" size="sm" onClick={handleLogout} loading={logout.isPending}>
              <LogOut className="h-4 w-4" aria-hidden="true" />
              Sign out
            </Button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-5 py-10">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <h1 className="font-display text-3xl font-semibold text-wine-950">
              Welcome, {user?.name?.split(" ")[0]} 👋
            </h1>
            <p className="mt-2 text-wine-500">
              Pick a wedding to start planning, or create a new one.
            </p>
          </div>

          <Link to="/weddings/new">
            <Button size="md">
              <Plus className="h-4 w-4" aria-hidden="true" />
              Create wedding
            </Button>
          </Link>
        </div>

        {isLoading ? (
          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="h-40 animate-pulse rounded-2xl bg-wine-100" />
            ))}
          </div>
        ) : weddings.length === 0 ? (
          <div className="mt-8">
            <EmptyState
              icon={Heart}
              title="Create your first wedding"
              description="Every wedding gets its own workspace — events, tasks, guests and budget, all in one place."
              actionLabel="Get started"
              onAction={() => navigate("/weddings/new")}
            />
          </div>
        ) : (
          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {weddings.map((wedding) => (
              <Link
                key={wedding.id}
                to={`/weddings/${wedding.id}`}
                className="group rounded-2xl border border-wine-100 bg-white p-5 shadow-sm transition-all hover:-translate-y-0.5 hover:border-wine-300 hover:shadow-md"
              >
                <div className="flex items-start justify-between gap-3">
                  <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-wine-100 text-wine-700 transition-colors group-hover:bg-wine-700 group-hover:text-white">
                    <CalendarDays className="h-5 w-5" aria-hidden="true" />
                  </span>
                  <Badge tone={roleTone[wedding.role] || "wine"}>
                    {wedding.role}
                  </Badge>
                </div>

                <h2 className="mt-4 font-display text-lg font-semibold text-wine-950">
                  {wedding.title}
                </h2>
                <p className="mt-1 text-sm text-wine-500">
                  {wedding.couple?.partnerOne} & {wedding.couple?.partnerTwo}
                </p>

                <div className="mt-3 flex items-center justify-between text-xs text-wine-400">
                  <span>
                    {wedding.weddingDate ? formatDate(wedding.weddingDate) : "Date not set"}
                  </span>
                  {wedding.status === "ARCHIVED" && <Badge tone="gray">Archived</Badge>}
                  <span className="font-medium text-wine-700 opacity-0 transition-opacity group-hover:opacity-100">
                    Open →
                  </span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
