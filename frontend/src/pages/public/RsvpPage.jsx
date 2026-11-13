import { useParams, Link } from "react-router-dom";
import {
  Heart,
  CalendarDays,
  MapPin,
  Check,
  X,
  Clock,
  UserMinus,
  UserPlus,
} from "lucide-react";
import Badge from "../../components/ui/Badge";
import Button from "../../components/ui/Button";
import { useRsvp, useRespondRsvp } from "../../features/guests/useRsvp";
import { getApiErrorMessage } from "../../services/api";

function formatDate(d) {
  return new Date(d).toLocaleDateString("en-IN", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

const tone = { ACCEPTED: "green", DECLINED: "red", PENDING: "amber" };
const label = { ACCEPTED: "Accepted", DECLINED: "Declined", PENDING: "Awaiting your reply" };

/** Public RSVP page — a guest responds per invited event, no login needed. */
export default function RsvpPage() {
  const { token } = useParams();
  const { data: res, isLoading, isError, error } = useRsvp(token);
  const respond = useRespondRsvp(token);

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-10 w-10 animate-spin rounded-full border-2 border-wine-200 border-t-wine-700" />
      </div>
    );
  }

  if (isError) {
    const notFound = error?.response?.status === 404;
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4 px-6 text-center">
        <Heart className="h-12 w-12 text-wine-300" aria-hidden="true" />
        <div>
          <h1 className="font-display text-2xl font-semibold text-wine-950">
            {notFound ? "This invitation is no longer valid" : "Something went wrong"}
          </h1>
          <p className="mt-2 text-sm text-wine-500">
            {notFound
              ? "The link may have expired, or the invitation was removed."
              : getApiErrorMessage(error)}
          </p>
        </div>
        <Link to="/" className="text-sm font-medium text-wine-700 hover:underline">
          Go home
        </Link>
      </div>
    );
  }

  const invitation = res?.data;
  const wedding = invitation?.wedding;
  const guest = invitation?.guest;
  const events = invitation?.events ?? [];

  const respondTo = (eventId, status, attendeeCount) => {
    respond.mutate({ eventId, status, attendeeCount });
  };

  return (
    <div className="mx-auto max-w-2xl px-4 py-10 sm:py-14">
      {/* Header */}
      <div className="text-center">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-gold-600">
          You&apos;re invited
        </p>
        <h1 className="mt-3 font-display text-3xl font-semibold text-wine-950 sm:text-4xl">
          {wedding?.couple?.partnerOne} &amp; {wedding?.couple?.partnerTwo}
        </h1>
        {wedding?.weddingDate && (
          <p className="mt-2 flex items-center justify-center gap-1.5 text-sm text-wine-500">
            <CalendarDays className="h-4 w-4 text-wine-400" aria-hidden="true" />
            {formatDate(wedding.weddingDate)}
          </p>
        )}
        <p className="mt-6 text-lg text-wine-700">
          Dear <strong className="font-semibold text-wine-950">{guest?.name}</strong>, we would
          be honoured to have you with us at:
        </p>
      </div>

      {/* Invited events */}
      <div className="mt-8 space-y-4">
        {events.map(({ event, rsvpStatus, attendeeCount, maxAttendees }) => {
          const pending = respond.isPending && respond.variables?.eventId === event.id;

          return (
            <div
              key={event.id}
              className="rounded-2xl border border-wine-100 bg-white p-5 shadow-sm"
            >
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <h2 className="font-display text-lg font-semibold text-wine-950">
                      {event.name}
                    </h2>
                    <Badge tone={tone[rsvpStatus] ?? "gray"}>
                      {label[rsvpStatus] ?? rsvpStatus}
                    </Badge>
                  </div>
                  <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-sm text-wine-500">
                    <span>{formatDate(event.date)}</span>
                    {event.startTime && (
                      <span>
                        {event.startTime}
                        {event.endTime ? ` – ${event.endTime}` : ""}
                      </span>
                    )}
                    {event.venue?.name && (
                      <span className="inline-flex items-center gap-1.5">
                        <MapPin className="h-4 w-4 text-wine-400" aria-hidden="true" />
                        {event.venue.name}
                        {event.venue?.address ? ` · ${event.venue.address}` : ""}
                      </span>
                    )}
                  </div>
                  {event.instructions && (
                    <p className="mt-2 rounded-xl bg-wine-50 px-3 py-2 text-sm text-wine-600">
                      📝 {event.instructions}
                    </p>
                  )}
                </div>
              </div>

              {/* Response controls */}
              <div className="mt-4 border-t border-wine-100 pt-4">
                {rsvpStatus === "ACCEPTED" ? (
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <p className="inline-flex items-center gap-1.5 text-sm text-emerald-700">
                      <Check className="h-4 w-4" aria-hidden="true" />
                      You&apos;re attending{attendeeCount > 1 ? ` with ${attendeeCount - 1} more` : ""}!
                    </p>
                    <div className="flex items-center gap-2">
                      {/* Attendee count stepper */}
                      <div className="flex items-center gap-1.5 rounded-xl border border-wine-200 px-2 py-1">
                        <button
                          type="button"
                          aria-label="Fewer attendees"
                          disabled={attendeeCount <= 1 || pending}
                          onClick={() =>
                            respondTo(event.id, "ACCEPTED", Math.max(1, attendeeCount - 1))
                          }
                          className="rounded-lg p-1 text-wine-600 transition-colors hover:bg-wine-100 disabled:cursor-not-allowed disabled:opacity-40"
                        >
                          <UserMinus className="h-4 w-4" aria-hidden="true" />
                        </button>
                        <span className="min-w-16 text-center text-sm text-wine-800">
                          {attendeeCount} attendee{attendeeCount === 1 ? "" : "s"}
                        </span>
                        <button
                          type="button"
                          aria-label="More attendees"
                          disabled={attendeeCount >= (maxAttendees ?? 5) || pending}
                          onClick={() => respondTo(event.id, "ACCEPTED", attendeeCount + 1)}
                          className="rounded-lg p-1 text-wine-600 transition-colors hover:bg-wine-100 disabled:cursor-not-allowed disabled:opacity-40"
                        >
                          <UserPlus className="h-4 w-4" aria-hidden="true" />
                        </button>
                      </div>
                      <Button
                        variant="secondary"
                        disabled={pending}
                        loading={pending}
                        onClick={() => respondTo(event.id, "DECLINED")}
                        className="px-3 text-sm"
                      >
                        <X className="h-4 w-4" aria-hidden="true" />
                        Can&apos;t make it
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <p className="inline-flex items-center gap-1.5 text-sm text-wine-500">
                      <Clock className="h-4 w-4" aria-hidden="true" />
                      {rsvpStatus === "DECLINED"
                        ? "You declined — changed your mind?"
                        : "Will you attend?"}
                    </p>
                    <div className="flex gap-2">
                      <Button
                        variant="secondary"
                        disabled={pending}
                        onClick={() => respondTo(event.id, "DECLINED")}
                        className="px-3 text-sm"
                      >
                        <X className="h-4 w-4" aria-hidden="true" />
                        Decline
                      </Button>
                      <Button
                        disabled={pending}
                        loading={pending}
                        onClick={() => respondTo(event.id, "ACCEPTED", 1)}
                      >
                        <Check className="h-4 w-4" aria-hidden="true" />
                        Accept
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {respond.isError && (
        <p className="mt-4 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600">
          {getApiErrorMessage(respond.error)}
        </p>
      )}

      {/* Footer */}
      <p className="mt-10 text-center text-sm text-wine-500">
        With love,
        <br />
        <span className="font-display text-lg text-wine-800">
          {wedding?.couple?.partnerOne} &amp; {wedding?.couple?.partnerTwo}
        </span>
      </p>
      <p className="mt-4 text-center text-xs text-wine-400">
        Powered by MakeMyMarriage
      </p>
    </div>
  );
}
