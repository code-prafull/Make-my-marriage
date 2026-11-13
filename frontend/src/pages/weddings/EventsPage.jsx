import { useState } from "react";
import { useOutletContext, useParams } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { CalendarDays, MapPin, Pencil, Plus, Trash2 } from "lucide-react";
import Badge from "../../components/ui/Badge";
import Button from "../../components/ui/Button";
import Modal from "../../components/ui/Modal";
import Input from "../../components/ui/Input";
import Select from "../../components/ui/Select";
import Textarea from "../../components/ui/Textarea";
import EmptyState from "../../components/ui/EmptyState";
import Alert from "../../components/ui/Alert";
import {
  useEvents,
  useCreateEvent,
  useUpdateEvent,
  useDeleteEvent,
} from "../../features/events/useEvents";
import { eventSchema } from "../../features/events/event.schemas";
import { getApiErrorMessage } from "../../services/api";

function formatDate(d) {
  return new Date(d).toLocaleDateString("en-IN", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

export default function EventsPage() {
  const { weddingId } = useParams();
  const { wedding } = useOutletContext();

  const [statusFilter, setStatusFilter] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [deleting, setDeleting] = useState(null);
  const [actionError, setActionError] = useState("");

  const filters = statusFilter ? { status: statusFilter } : {};
  const { data: res, isLoading } = useEvents(weddingId, filters);
  const createEvent = useCreateEvent(weddingId);
  const updateEvent = useUpdateEvent(weddingId);
  const deleteEvent = useDeleteEvent(weddingId);

  const events = res?.data ?? [];
  const isManager = ["ADMIN", "MANAGER"].includes(wedding?.role);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(eventSchema),
    defaultValues: {
      name: "",
      description: "",
      date: "",
      startTime: "10:00",
      endTime: "13:00",
      venue: { name: "", address: "", googleMapsLink: "" },
      instructions: "",
      visibility: "PUBLIC",
    },
  });

  const openCreate = () => {
    setEditing(null);
    setActionError("");
    reset({
      name: "",
      description: "",
      date: "",
      startTime: "10:00",
      endTime: "13:00",
      venue: { name: "", address: "", googleMapsLink: "" },
      instructions: "",
      visibility: "PUBLIC",
    });
    setModalOpen(true);
  };

  const openEdit = (event) => {
    setEditing(event);
    setActionError("");
    reset({
      name: event.name,
      description: event.description ?? "",
      date: new Date(event.date).toISOString().slice(0, 10),
      startTime: event.startTime,
      endTime: event.endTime,
      venue: {
        name: event.venue?.name ?? "",
        address: event.venue?.address ?? "",
        googleMapsLink: event.venue?.googleMapsLink ?? "",
      },
      instructions: event.instructions ?? "",
      visibility: event.visibility ?? "PUBLIC",
    });
    setModalOpen(true);
  };

  const onSubmit = (values) => {
    const payload = {
      ...values,
      date: new Date(values.date + "T00:00:00").toISOString(),
    };

    const opts = {
      onSuccess: () => {
        setModalOpen(false);
        setEditing(null);
      },
      onError: (err) => setActionError(getApiErrorMessage(err)),
    };

    if (editing) updateEvent.mutate({ eventId: editing.id, ...payload }, opts);
    else createEvent.mutate(payload, opts);
  };

  const confirmDelete = () => {
    deleteEvent.mutate(deleting.id, {
      onSuccess: () => setDeleting(null),
      onError: (err) => {
        setActionError(getApiErrorMessage(err));
        setDeleting(null);
      },
    });
  };

  return (
    <div className="space-y-5">
      {/* Header + filter */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="font-display text-2xl font-semibold text-wine-950">Events</h2>
          <p className="mt-1 text-sm text-wine-500">
            Functions, ceremonies and celebrations for your wedding.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            aria-label="Filter events by status"
            className="w-40"
          >
            <option value="">All events</option>
            <option value="UPCOMING">Upcoming</option>
            <option value="PAST">Past</option>
          </Select>

          {isManager && (
            <Button onClick={openCreate}>
              <Plus className="h-4 w-4" aria-hidden="true" />
              Add event
            </Button>
          )}
        </div>
      </div>

      {actionError && <Alert>{actionError}</Alert>}

      {/* List */}
      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-28 animate-pulse rounded-2xl bg-wine-100" />
          ))}
        </div>
      ) : events.length === 0 ? (
        <EmptyState
          icon={CalendarDays}
          title={statusFilter ? "No events match this filter" : "No events yet"}
          description={
            statusFilter
              ? "Try a different filter to see more."
              : "Add your first function — haldi, mehendi, sangeet, the wedding or reception."
          }
          actionLabel={isManager && !statusFilter ? "Add event" : undefined}
          onAction={openCreate}
        />
      ) : (
        <ul className="space-y-4">
          {events.map((event) => (
            <li
              key={event.id}
              className="rounded-2xl border border-wine-100 bg-white p-5 shadow-sm transition-shadow hover:shadow-md"
            >
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="font-display text-lg font-semibold text-wine-950">
                      {event.name}
                    </h3>
                    <Badge tone={event.status === "UPCOMING" ? "green" : "gray"}>
                      {event.status === "UPCOMING" ? "Upcoming" : "Past"}
                    </Badge>
                    {event.visibility === "PRIVATE" && (
                      <Badge tone="amber">Private</Badge>
                    )}
                  </div>

                  <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-sm text-wine-500">
                    <span className="inline-flex items-center gap-1.5">
                      <CalendarDays className="h-4 w-4 text-wine-400" aria-hidden="true" />
                      {formatDate(event.date)}
                    </span>
                    <span>
                      🕐 {event.startTime} – {event.endTime}
                    </span>
                    {event.venue?.name && (
                      <span className="inline-flex items-center gap-1.5">
                        <MapPin className="h-4 w-4 text-wine-400" aria-hidden="true" />
                        {event.venue.name}
                        {event.venue.address ? ` · ${event.venue.address}` : ""}
                      </span>
                    )}
                  </div>

                  {event.description && (
                    <p className="mt-2 text-sm text-wine-600">{event.description}</p>
                  )}
                  {event.instructions && (
                    <p className="mt-2 rounded-xl bg-wine-50 px-3 py-2 text-sm text-wine-600">
                      📝 {event.instructions}
                    </p>
                  )}
                  {event.venue?.googleMapsLink && (
                    <a
                      href={event.venue.googleMapsLink}
                      target="_blank"
                      rel="noreferrer"
                      className="mt-2 inline-block text-sm font-medium text-wine-700 underline-offset-2 hover:underline"
                    >
                      Open in Maps ↗
                    </a>
                  )}
                </div>

                {isManager && (
                  <div className="flex shrink-0 gap-2">
                    <button
                      type="button"
                      onClick={() => openEdit(event)}
                      aria-label={`Edit ${event.name}`}
                      className="rounded-lg p-2 text-wine-500 transition-colors hover:bg-wine-100 hover:text-wine-800"
                    >
                      <Pencil className="h-4 w-4" aria-hidden="true" />
                    </button>
                    <button
                      type="button"
                      onClick={() => setDeleting(event)}
                      aria-label={`Delete ${event.name}`}
                      className="rounded-lg p-2 text-wine-500 transition-colors hover:bg-red-50 hover:text-red-600"
                    >
                      <Trash2 className="h-4 w-4" aria-hidden="true" />
                    </button>
                  </div>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}

      {/* Create / edit modal */}
      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editing ? "Edit event" : "Add event"}
      >
        <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">
          <Input
            label="Event name"
            type="text"
            placeholder="Haldi Ceremony"
            error={errors.name?.message}
            {...register("name")}
          />

          <Textarea
            label="Description"
            placeholder="What's this event about?"
            rows={2}
            error={errors.description?.message}
            {...register("description")}
          />

          <div className="grid gap-4 sm:grid-cols-3">
            <Input
              label="Date"
              type="date"
              error={errors.date?.message}
              {...register("date")}
            />
            <Input
              label="Start time"
              type="time"
              error={errors.startTime?.message}
              {...register("startTime")}
            />
            <Input
              label="End time"
              type="time"
              error={errors.endTime?.message}
              {...register("endTime")}
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <Input
              label="Venue name"
              type="text"
              placeholder="Royal Palace"
              error={errors.venue?.name?.message}
              {...register("venue.name")}
            />
            <Input
              label="Venue address"
              type="text"
              placeholder="123 Lake View Road, Bhopal"
              error={errors.venue?.address?.message}
              {...register("venue.address")}
            />
          </div>

          <Input
            label="Google Maps link"
            type="url"
            placeholder="https://maps.google.com/..."
            error={errors.venue?.googleMapsLink?.message}
            {...register("venue.googleMapsLink")}
          />

          <Textarea
            label="Instructions"
            placeholder="Anything guests or helpers should know…"
            rows={2}
            error={errors.instructions?.message}
            {...register("instructions")}
          />

          <Select label="Visibility" error={errors.visibility?.message} {...register("visibility")}>
            <option value="PUBLIC">Public — visible to guests</option>
            <option value="PRIVATE">Private — only your team</option>
          </Select>

          <div className="flex flex-col-reverse gap-3 pt-2 sm:flex-row sm:justify-end">
            <Button variant="secondary" onClick={() => setModalOpen(false)} type="button">
              Cancel
            </Button>
            <Button
              type="submit"
              loading={createEvent.isPending || updateEvent.isPending}
            >
              {editing ? "Save changes" : "Create event"}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Delete confirm */}
      <Modal
        open={Boolean(deleting)}
        onClose={() => setDeleting(null)}
        title="Delete event?"
        maxWidth="max-w-md"
      >
        <p className="text-sm text-wine-600">
          <strong>{deleting?.name}</strong> will be removed permanently. Any tasks linked to
          this event will be kept as wedding-level tasks.
        </p>
        <div className="mt-5 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <Button variant="secondary" onClick={() => setDeleting(null)} type="button">
            Keep event
          </Button>
          <Button
            onClick={confirmDelete}
            loading={deleteEvent.isPending}
            className="bg-red-600 text-white hover:bg-red-700 focus-visible:ring-red-500"
          >
            Delete event
          </Button>
        </div>
      </Modal>
    </div>
  );
}
