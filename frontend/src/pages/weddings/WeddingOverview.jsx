import { Link, useOutletContext, useParams } from "react-router-dom";
import {
  CalendarDays,
  CheckSquare,
  Clock,
  AlertTriangle,
  Plus,
  Users,
  Wallet,
  Image,
} from "lucide-react";
import { useWeddingDashboard } from "../../features/weddings/useWeddings";
import { useEvents } from "../../features/events/useEvents";
import Badge from "../../components/ui/Badge";

function StatCard({ icon: Icon, label, value, tone = "wine" }) {
  const tones = {
    wine: "bg-wine-100 text-wine-700",
    gold: "bg-gold-300/30 text-gold-600",
    green: "bg-emerald-50 text-emerald-600",
    red: "bg-red-50 text-red-600",
  };

  return (
    <div className="rounded-2xl border border-wine-100 bg-white p-4 sm:p-5">
      <div className="flex items-center gap-3">
        <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${tones[tone]}`}>
          <Icon className="h-5 w-5" aria-hidden="true" />
        </div>
        <div className="min-w-0">
          <p className="truncate text-xs font-medium uppercase tracking-wide text-wine-400">
            {label}
          </p>
          <p className="font-display text-2xl font-semibold text-wine-950">{value}</p>
        </div>
      </div>
    </div>
  );
}

function formatDate(d) {
  return new Date(d).toLocaleDateString("en-IN", {
    weekday: "short",
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

/** Wedding workspace overview — FR-03 dashboard aggregates. */
export default function WeddingOverview() {
  const { weddingId } = useParams();
  const { wedding } = useOutletContext();
  const { data: res, isLoading } = useWeddingDashboard(weddingId);
  const { data: eventsRes } = useEvents(weddingId, { status: "UPCOMING", limit: 5 });

  const stats = res?.data?.stats;
  const upcoming = res?.data?.upcomingEvents ?? eventsRes?.data ?? [];

  if (isLoading) {
    return (
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-24 animate-pulse rounded-2xl bg-wine-100" />
        ))}
      </div>
    );
  }

  const quickActions = [
    { label: "Add event", icon: CalendarDays, to: "events" },
    { label: "Create task", icon: CheckSquare, to: "tasks" },
    { label: "Invite member", icon: Users, to: "members" },
    { label: "Add guest", icon: Users, to: "events", disabled: true },
    { label: "Add expense", icon: Wallet, to: "events", disabled: true },
    { label: "Upload photo", icon: Image, to: "events", disabled: true },
  ];

  return (
    <div className="space-y-6">
      {/* Greeting */}
      <div>
        <h2 className="font-display text-2xl font-semibold text-wine-950">
          {wedding?.title}
        </h2>
        <p className="mt-1 text-sm text-wine-500">
          Here's what's happening with your wedding planning.
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4 xl:grid-cols-4">
        <StatCard icon={CalendarDays} label="Total events" value={stats?.totalEvents ?? 0} />
        <StatCard
          icon={CheckSquare}
          label="Pending tasks"
          value={stats?.pendingTasks ?? 0}
          tone="gold"
        />
        <StatCard
          icon={Clock}
          label="Completed tasks"
          value={stats?.completedTasks ?? 0}
          tone="green"
        />
        <StatCard
          icon={AlertTriangle}
          label="Overdue tasks"
          value={stats?.overdueTasks ?? 0}
          tone={stats?.overdueTasks > 0 ? "red" : "green"}
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-5">
        {/* Upcoming events */}
        <section className="lg:col-span-3">
          <div className="mb-3 flex items-center justify-between">
            <h3 className="font-display text-lg font-semibold text-wine-950">
              Upcoming events
            </h3>
            <Link
              to="events"
              className="text-sm font-medium text-wine-700 hover:text-wine-900 hover:underline"
            >
              View all
            </Link>
          </div>

          {upcoming.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-wine-200 bg-white/60 px-6 py-10 text-center">
              <CalendarDays className="mx-auto mb-3 h-8 w-8 text-wine-300" aria-hidden="true" />
              <p className="text-sm text-wine-500">
                No events yet. Start by adding your first function — haldi, mehendi or sangeet.
              </p>
              <Link
                to="events"
                className="mt-4 inline-flex items-center gap-1.5 rounded-xl bg-wine-700 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-wine-800"
              >
                <Plus className="h-4 w-4" aria-hidden="true" />
                Add event
              </Link>
            </div>
          ) : (
            <ul className="space-y-3">
              {upcoming.map((event) => (
                <li
                  key={event.id}
                  className="flex items-center justify-between gap-4 rounded-2xl border border-wine-100 bg-white p-4"
                >
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="truncate font-medium text-wine-950">{event.name}</p>
                      <Badge tone="green">Upcoming</Badge>
                    </div>
                    <p className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-0.5 text-xs text-wine-500">
                      <span>{formatDate(event.date)}</span>
                      <span>
                        {event.startTime} – {event.endTime}
                      </span>
                      {event.venue?.name && <span>📍 {event.venue.name}</span>}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>

        {/* Quick actions */}
        <section className="lg:col-span-2">
          <h3 className="mb-3 font-display text-lg font-semibold text-wine-950">
            Quick actions
          </h3>
          <div className="grid grid-cols-2 gap-3">
            {quickActions.map(({ label, icon: Icon, to, disabled }) =>
              disabled ? (
                <div
                  key={label}
                  className="flex cursor-not-allowed flex-col items-start gap-2 rounded-2xl border border-dashed border-wine-200 bg-white/50 p-4 opacity-60"
                  title="Coming in a later phase"
                >
                  <Icon className="h-5 w-5 text-wine-400" aria-hidden="true" />
                  <span className="text-sm font-medium text-wine-500">{label}</span>
                  <span className="text-[10px] uppercase tracking-wide text-wine-400">
                    Coming soon
                  </span>
                </div>
              ) : (
                <Link
                  key={label}
                  to={to}
                  className="flex flex-col items-start gap-2 rounded-2xl border border-wine-100 bg-white p-4 transition-colors hover:border-wine-300 hover:bg-wine-50"
                >
                  <Icon className="h-5 w-5 text-wine-600" aria-hidden="true" />
                  <span className="text-sm font-medium text-wine-900">{label}</span>
                </Link>
              )
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
