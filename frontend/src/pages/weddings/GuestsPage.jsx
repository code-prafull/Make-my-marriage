import { useEffect, useMemo, useState } from "react";
import { useOutletContext, useParams } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Users,
  Pencil,
  Trash2,
  Plus,
  Mail,
  Copy,
  Check,
  Upload,
  Search,
} from "lucide-react";
import Badge from "../../components/ui/Badge";
import Button from "../../components/ui/Button";
import Modal from "../../components/ui/Modal";
import Input from "../../components/ui/Input";
import Select from "../../components/ui/Select";
import Textarea from "../../components/ui/Textarea";
import EmptyState from "../../components/ui/EmptyState";
import Alert from "../../components/ui/Alert";
import {
  useGuests,
  useCreateGuest,
  useUpdateGuest,
  useDeleteGuest,
  useBulkImportGuests,
  useCreateInvitations,
} from "../../features/guests/useGuests";
import { useEvents } from "../../features/events/useEvents";
import {
  guestSchema,
  guestSideTone,
  guestSideLabel,
} from "../../features/guests/guest.schemas";
import { getApiErrorMessage } from "../../services/api";

const rsvpTone = { ACCEPTED: "green", DECLINED: "red", PENDING: "gray" };
const rsvpLabel = { ACCEPTED: "Accepted", DECLINED: "Declined", PENDING: "Pending" };

function formatDate(d) {
  return new Date(d).toLocaleDateString("en-IN", { day: "numeric", month: "short" });
}

/** Parse pasted guest lines: "Name, Email, Phone, Side, Group". */
function parseGuestLines(text) {
  const records = [];
  const problems = [];

  text
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
    .forEach((line, index) => {
      const row = index + 1;
      const parts = line.split(",").map((p) => p.trim());
      const [name, email = "", phone = "", side = "COMMON", familyGroup = ""] = parts;

      if (name.length < 2) {
        problems.push({ row, reason: "Name is missing or too short" });
        return;
      }
      if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        problems.push({ row, reason: `Invalid email "${email}"` });
        return;
      }
      const upperSide = side.toUpperCase();
      if (upperSide && !["BRIDE", "GROOM", "COMMON"].includes(upperSide)) {
        problems.push({ row, reason: `Unknown side "${side}"` });
        return;
      }

      records.push({ name, email, phone, side: upperSide || "COMMON", familyGroup });
    });

  return { records, problems };
}

export default function GuestsPage() {
  const { weddingId } = useParams();
  const { wedding } = useOutletContext();

  const [searchText, setSearchText] = useState("");
  const [search, setSearch] = useState("");
  const [sideFilter, setSideFilter] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [deleting, setDeleting] = useState(null);
  const [importOpen, setImportOpen] = useState(false);
  const [importText, setImportText] = useState("");
  const [importResult, setImportResult] = useState(null);
  const [inviting, setInviting] = useState(null);
  const [inviteResult, setInviteResult] = useState(null);
  const [copied, setCopied] = useState(false);
  const [actionError, setActionError] = useState("");

  const filters = useMemo(() => {
    const f = {};
    if (search) f.search = search;
    if (sideFilter) f.side = sideFilter;
    return f;
  }, [search, sideFilter]);

  const { data: res, isLoading } = useGuests(weddingId, filters);
  const { data: eventsRes } = useEvents(weddingId, { limit: 100, sortBy: "date", sortOrder: "asc" });
  const createGuest = useCreateGuest(weddingId);
  const updateGuest = useUpdateGuest(weddingId);
  const deleteGuest = useDeleteGuest(weddingId);
  const bulkImport = useBulkImportGuests(weddingId);
  const createInvitations = useCreateInvitations(weddingId);

  const guests = res?.data ?? [];
  const pagination = res?.pagination;
  const events = eventsRes?.data ?? [];
  const eventById = useMemo(
    () => Object.fromEntries(events.map((e) => [e.id, e])),
    [events]
  );
  const isManager = ["ADMIN", "MANAGER"].includes(wedding?.role);

  // Debounce search input → query param
  useEffect(() => {
    const t = setTimeout(() => setSearch(searchText.trim()), 300);
    return () => clearTimeout(t);
  }, [searchText]);

  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(guestSchema),
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      familyGroup: "",
      side: "COMMON",
      eventIds: [],
      notes: "",
    },
  });

  const selectedEventIds = watch("eventIds") ?? [];

  const toggleEvent = (eventId) => {
    const next = selectedEventIds.includes(eventId)
      ? selectedEventIds.filter((id) => id !== eventId)
      : [...selectedEventIds, eventId];
    setValue("eventIds", next, { shouldValidate: true });
  };

  const openCreate = () => {
    setEditing(null);
    setActionError("");
    reset({
      name: "",
      email: "",
      phone: "",
      familyGroup: "",
      side: "COMMON",
      eventIds: [],
      notes: "",
    });
    setModalOpen(true);
  };

  const openEdit = (guest) => {
    setEditing(guest);
    setActionError("");
    reset({
      name: guest.name,
      email: guest.email ?? "",
      phone: guest.phone ?? "",
      familyGroup: guest.familyGroup ?? "",
      side: guest.side ?? "COMMON",
      eventIds: guest.eventIds ?? [],
      notes: guest.notes ?? "",
    });
    setModalOpen(true);
  };

  const onSubmit = (values) => {
    const opts = {
      onSuccess: () => {
        setModalOpen(false);
        setEditing(null);
      },
      onError: (err) => setActionError(getApiErrorMessage(err)),
    };

    if (editing) updateGuest.mutate({ guestId: editing.id, ...values }, opts);
    else createGuest.mutate(values, opts);
  };

  const confirmDelete = () => {
    deleteGuest.mutate(deleting.id, {
      onSuccess: () => setDeleting(null),
      onError: (err) => {
        setActionError(getApiErrorMessage(err));
        setDeleting(null);
      },
    });
  };

  const runImport = () => {
    const { records, problems } = parseGuestLines(importText);
    if (records.length === 0) {
      setImportResult({
        created: 0,
        failures: problems.length ? problems : [{ row: "-", reason: "Nothing to import" }],
      });
      return;
    }

    bulkImport.mutate(records, {
      onSuccess: (data) => {
        setImportResult({
          created: data.data?.created ?? 0,
          failures: [...(data.data?.failed ?? []), ...problems],
        });
      },
      onError: (err) => setActionError(getApiErrorMessage(err)),
    });
  };

  const openInvite = (guest) => {
    setInviting(guest);
    setActionError("");
  };

  const sendInvite = (eventIds) => {
    createInvitations.mutate(
      { guestId: inviting.id, eventIds },
      {
        onSuccess: (data) => {
          const token = data.data?.rsvpToken;
          setInviteResult({
            name: inviting.name,
            email: inviting.email ?? "",
            url: token ? `${window.location.origin}/rsvp/${token}` : null,
          });
          setInviting(null);
          setCopied(false);
        },
        onError: (err) => setActionError(getApiErrorMessage(err)),
      }
    );
  };

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(inviteResult?.url ?? "");
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      window.prompt("Copy this RSVP link:", inviteResult?.url);
    }
  };

  return (
    <div className="space-y-5">
      {/* Header + filters */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="font-display text-2xl font-semibold text-wine-950">Guests</h2>
          <p className="mt-1 text-sm text-wine-500">
            {pagination
              ? `${pagination.total} guest${pagination.total === 1 ? "" : "s"} on your list`
              : "Your wedding guest list."}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="relative">
            <Search
              className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-wine-400"
              aria-hidden="true"
            />
            <input
              type="search"
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              placeholder="Search name, email, group…"
              aria-label="Search guests"
              className="w-56 rounded-xl border border-wine-200 bg-white py-2.5 pl-9 pr-3 text-sm text-wine-900 placeholder:text-wine-400 focus:border-wine-500 focus:outline-none focus:ring-2 focus:ring-wine-500/20"
            />
          </div>

          <Select
            value={sideFilter}
            onChange={(e) => setSideFilter(e.target.value)}
            aria-label="Filter guests by side"
            className="w-40"
          >
            <option value="">All sides</option>
            <option value="BRIDE">Bride&apos;s side</option>
            <option value="GROOM">Groom&apos;s side</option>
            <option value="COMMON">Common</option>
          </Select>

          {isManager && (
            <>
              <Button variant="secondary" onClick={() => { setImportResult(null); setImportOpen(true); }}>
                <Upload className="h-4 w-4" aria-hidden="true" />
                Import list
              </Button>
              <Button onClick={openCreate}>
                <Plus className="h-4 w-4" aria-hidden="true" />
                Add guest
              </Button>
            </>
          )}
        </div>
      </div>

      {actionError && <Alert>{actionError}</Alert>}

      {/* List */}
      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-24 animate-pulse rounded-2xl bg-wine-100" />
          ))}
        </div>
      ) : guests.length === 0 ? (
        <EmptyState
          icon={Users}
          title={search || sideFilter ? "No guests match your filters" : "No guests yet"}
          description={
            search || sideFilter
              ? "Try a different search or filter."
              : "Start building your guest list — add them one by one or paste a whole list."
          }
          actionLabel={isManager && !search && !sideFilter ? "Add guest" : undefined}
          onAction={openCreate}
        />
      ) : (
        <ul className="space-y-4">
          {guests.map((guest) => {
            const invitations = guest.invitations ?? [];
            const accepted = invitations.filter((i) => i.rsvpStatus === "ACCEPTED").length;
            const declined = invitations.filter((i) => i.rsvpStatus === "DECLINED").length;
            const pending = invitations.filter((i) => i.rsvpStatus === "PENDING").length;

            return (
              <li
                key={guest.id}
                className="rounded-2xl border border-wine-100 bg-white p-5 shadow-sm transition-shadow hover:shadow-md"
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="font-display text-lg font-semibold text-wine-950">
                        {guest.name}
                      </h3>
                      <Badge tone={guestSideTone[guest.side] ?? "gray"}>
                        {guestSideLabel[guest.side] ?? guest.side}
                      </Badge>
                      {guest.familyGroup && <Badge tone="gray">{guest.familyGroup}</Badge>}
                    </div>

                    <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-sm text-wine-500">
                      {guest.email && <span>✉️ {guest.email}</span>}
                      {guest.phone && <span>📞 {guest.phone}</span>}
                    </div>

                    {/* Invited events + RSVP status */}
                    {invitations.length > 0 && (
                      <div className="mt-3 flex flex-wrap items-center gap-2">
                        {invitations.map((inv) => (
                          <span
                            key={inv.id}
                            className="inline-flex items-center gap-1.5 rounded-full border border-wine-100 bg-wine-50 px-2.5 py-1 text-xs text-wine-700"
                          >
                            {inv.event?.name ?? "Event"}
                            {inv.event?.date && (
                              <span className="text-wine-400">· {formatDate(inv.event.date)}</span>
                            )}
                            <Badge tone={rsvpTone[inv.rsvpStatus] ?? "gray"}>
                              {rsvpLabel[inv.rsvpStatus] ?? inv.rsvpStatus}
                            </Badge>
                          </span>
                        ))}
                      </div>
                    )}

                    {guest.notes && (
                      <p className="mt-2 rounded-xl bg-wine-50 px-3 py-2 text-sm text-wine-600">
                        📝 {guest.notes}
                      </p>
                    )}
                  </div>

                  {isManager && (
                    <div className="flex shrink-0 items-center gap-2">
                      {invitations.length > 0 && (
                        <span className="mr-1 text-xs text-wine-500">
                          {accepted} ✓ · {declined} ✗ · {pending} pending
                        </span>
                      )}
                      <Button
                        variant="secondary"
                        onClick={() => openInvite(guest)}
                        className="px-3"
                      >
                        <Mail className="h-4 w-4" aria-hidden="true" />
                        Invite
                      </Button>
                      <button
                        type="button"
                        onClick={() => openEdit(guest)}
                        aria-label={`Edit ${guest.name}`}
                        className="rounded-lg p-2 text-wine-500 transition-colors hover:bg-wine-100 hover:text-wine-800"
                      >
                        <Pencil className="h-4 w-4" aria-hidden="true" />
                      </button>
                      <button
                        type="button"
                        onClick={() => setDeleting(guest)}
                        aria-label={`Delete ${guest.name}`}
                        className="rounded-lg p-2 text-wine-500 transition-colors hover:bg-red-50 hover:text-red-600"
                      >
                        <Trash2 className="h-4 w-4" aria-hidden="true" />
                      </button>
                    </div>
                  )}
                </div>
              </li>
            );
          })}
        </ul>
      )}

      {/* Pagination footer */}
      {pagination && pagination.totalPages > 1 && (
        <p className="text-center text-xs text-wine-400">
          Page {pagination.page} of {pagination.totalPages}
        </p>
      )}

      {/* Add / edit modal */}
      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editing ? "Edit guest" : "Add guest"}
      >
        <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">
          <Input
            label="Full name"
            type="text"
            placeholder="Aunt Meera"
            error={errors.name?.message}
            {...register("name")}
          />

          <div className="grid gap-4 sm:grid-cols-2">
            <Input
              label="Email"
              type="email"
              placeholder="meera@example.com"
              error={errors.email?.message}
              {...register("email")}
            />
            <Input
              label="Phone"
              type="tel"
              placeholder="+91 98765 43210"
              error={errors.phone?.message}
              {...register("phone")}
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <Input
              label="Family group"
              type="text"
              placeholder="Sharma family"
              error={errors.familyGroup?.message}
              {...register("familyGroup")}
            />
            <Select label="Side" error={errors.side?.message} {...register("side")}>
              <option value="COMMON">Common</option>
              <option value="BRIDE">Bride&apos;s side</option>
              <option value="GROOM">Groom&apos;s side</option>
            </Select>
          </div>

          <div>
            <p className="mb-1.5 text-sm font-medium text-wine-800">Invited to events</p>
            {events.length === 0 ? (
              <p className="rounded-xl bg-wine-50 px-3 py-2 text-xs text-wine-500">
                No events yet — add events first to attach this guest.
              </p>
            ) : (
              <div className="max-h-40 space-y-1.5 overflow-y-auto rounded-xl border border-wine-200 p-3">
                {events.map((event) => (
                  <label key={event.id} className="flex cursor-pointer items-center gap-2.5 text-sm">
                    <input
                      type="checkbox"
                      checked={selectedEventIds.includes(event.id)}
                      onChange={() => toggleEvent(event.id)}
                      className="h-4 w-4 rounded border-wine-300 text-wine-700 accent-wine-700"
                    />
                    <span className="text-wine-800">{event.name}</span>
                    <span className="text-xs text-wine-400">{formatDate(event.date)}</span>
                  </label>
                ))}
              </div>
            )}
            {errors.eventIds?.message && (
              <p className="mt-1 text-xs text-red-600">{errors.eventIds.message}</p>
            )}
          </div>

          <Textarea
            label="Notes"
            placeholder="Dietary needs, plus-one, anything else…"
            rows={2}
            error={errors.notes?.message}
            {...register("notes")}
          />

          <div className="flex flex-col-reverse gap-3 pt-2 sm:flex-row sm:justify-end">
            <Button variant="secondary" onClick={() => setModalOpen(false)} type="button">
              Cancel
            </Button>
            <Button type="submit" loading={createGuest.isPending || updateGuest.isPending}>
              {editing ? "Save changes" : "Add guest"}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Import modal */}
      <Modal
        open={importOpen}
        onClose={() => setImportOpen(false)}
        title="Import guest list"
      >
        {importResult ? (
          <div className="space-y-4">
            <p className="text-sm text-wine-600">
              Imported <strong>{importResult.created}</strong> guest
              {importResult.created === 1 ? "" : "s"} successfully.
            </p>
            {importResult.failures?.length > 0 && (
              <div className="rounded-xl border border-amber-200 bg-amber-50 p-3">
                <p className="mb-2 text-sm font-medium text-amber-800">
                  {importResult.failures.length} row{importResult.failures.length === 1 ? "" : "s"} skipped:
                </p>
                <ul className="space-y-1 text-xs text-amber-700">
                  {importResult.failures.map((f, i) => (
                    <li key={i}>
                      Row {f.row}: {f.reason}
                    </li>
                  ))}
                </ul>
              </div>
            )}
            <div className="flex justify-end gap-3">
              <Button variant="secondary" onClick={() => setImportOpen(false)} type="button">
                Done
              </Button>
              <Button
                onClick={() => {
                  setImportResult(null);
                  setImportText("");
                }}
                type="button"
              >
                Import more
              </Button>
            </div>
          </div>
        ) : (
          <form
            onSubmit={(e) => {
              e.preventDefault();
              runImport();
            }}
            className="space-y-4"
          >
            <div>
              <Textarea
                label="Paste your guest list"
                rows={7}
                value={importText}
                onChange={(e) => setImportText(e.target.value)}
                placeholder={
                  "One guest per line:\nMeera Sharma, meera@example.com, +91 98765 43210, BRIDE, Sharma family\nRahul Verma, rahul@example.com, , GROOM,"
                }
              />
              <p className="mt-1 text-xs text-wine-400">
                Format: Name, Email, Phone, Side (BRIDE/GROOM/COMMON), Family group — only the
                name is required.
              </p>
            </div>
            <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
              <Button variant="secondary" onClick={() => setImportOpen(false)} type="button">
                Cancel
              </Button>
              <Button type="submit" loading={bulkImport.isPending}>
                <Upload className="h-4 w-4" aria-hidden="true" />
                Import guests
              </Button>
            </div>
          </form>
        )}
      </Modal>

      {/* Invite modal */}
      <Modal
        open={Boolean(inviting)}
        onClose={() => setInviting(null)}
        title={`Invite ${inviting?.name ?? "guest"}`}
        maxWidth="max-w-lg"
      >
        <form
          onSubmit={(e) => {
            e.preventDefault();
            const checked = Array.from(e.currentTarget.querySelectorAll("input:checked")).map(
              (el) => el.value
            );
            if (checked.length === 0) {
              setActionError("Select at least one event to invite this guest.");
              return;
            }
            sendInvite(checked);
          }}
          className="space-y-4"
        >
          <p className="text-sm text-wine-600">
            Pick the events {inviting?.name} is invited to. They&apos;ll get a personal RSVP
            page where they can accept or decline each event.
          </p>

          {events.length === 0 ? (
            <p className="rounded-xl bg-wine-50 px-3 py-2 text-sm text-wine-500">
              No events yet — add events first.
            </p>
          ) : (
            <div className="max-h-48 space-y-1.5 overflow-y-auto rounded-xl border border-wine-200 p-3">
              {events.map((event) => (
                <label key={event.id} className="flex cursor-pointer items-center gap-2.5 text-sm">
                  <input
                    type="checkbox"
                    value={event.id}
                    defaultChecked={(inviting?.eventIds ?? []).includes(event.id)}
                    className="h-4 w-4 rounded border-wine-300 text-wine-700 accent-wine-700"
                  />
                  <span className="text-wine-800">{event.name}</span>
                  <span className="text-xs text-wine-400">{formatDate(event.date)}</span>
                </label>
              ))}
            </div>
          )}

          <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
            <Button variant="secondary" onClick={() => setInviting(null)} type="button">
              Cancel
            </Button>
            <Button type="submit" loading={createInvitations.isPending}>
              <Mail className="h-4 w-4" aria-hidden="true" />
              Send invitation
            </Button>
          </div>
        </form>
      </Modal>

      {/* RSVP link result modal */}
      <Modal
        open={Boolean(inviteResult)}
        onClose={() => setInviteResult(null)}
        title="Invitation ready 🎉"
        maxWidth="max-w-lg"
      >
        <p className="text-sm text-wine-600">
          Share this personal RSVP link with {inviteResult?.name ?? "your guest"} — it opens
          their invitation page where they can accept or decline each event.
        </p>
        <div className="mt-3 flex items-center gap-2 rounded-xl border border-wine-200 bg-wine-50 px-3 py-2.5">
          <code className="min-w-0 flex-1 truncate text-xs text-wine-800">{inviteResult?.url}</code>
          <button
            type="button"
            onClick={copyLink}
            aria-label="Copy RSVP link"
            className="shrink-0 rounded-lg p-1.5 text-wine-600 transition-colors hover:bg-wine-100 hover:text-wine-900"
          >
            {copied ? (
              <Check className="h-4 w-4 text-emerald-600" aria-hidden="true" />
            ) : (
              <Copy className="h-4 w-4" aria-hidden="true" />
            )}
          </button>
        </div>
        <p className="mt-2 text-xs text-wine-400">
          The email has been queued
          {inviteResult?.email ? ` to ${inviteResult.email}` : ""} (dev mode: check the server
          console).
        </p>
        <div className="mt-5 flex justify-end">
          <Button onClick={() => setInviteResult(null)} type="button">
            Done
          </Button>
        </div>
      </Modal>

      {/* Delete confirm */}
      <Modal
        open={Boolean(deleting)}
        onClose={() => setDeleting(null)}
        title="Remove guest?"
        maxWidth="max-w-md"
      >
        <p className="text-sm text-wine-600">
          <strong>{deleting?.name}</strong> will be removed from your guest list along with any
          invitations sent to them.
        </p>
        <div className="mt-5 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <Button variant="secondary" onClick={() => setDeleting(null)} type="button">
            Keep guest
          </Button>
          <Button
            onClick={confirmDelete}
            loading={deleteGuest.isPending}
            className="bg-red-600 text-white hover:bg-red-700 focus-visible:ring-red-500"
          >
            Remove guest
          </Button>
        </div>
      </Modal>
    </div>
  );
}
