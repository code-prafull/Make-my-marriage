import { useState } from "react";
import { useOutletContext, useParams } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import { Trash2, UserPlus, Users } from "lucide-react";
import Badge from "../../components/ui/Badge";
import Button from "../../components/ui/Button";
import Modal from "../../components/ui/Modal";
import EmptyState from "../../components/ui/EmptyState";
import Alert from "../../components/ui/Alert";
import { useMembers, weddingKeys } from "../../features/weddings/useWeddings";
import { getApiErrorMessage } from "../../services/api";
import api from "../../services/api";

const roleTone = { ADMIN: "gold", MANAGER: "wine", EDITOR: "wine", VIEWER: "gray" };
const statusTone = { ACTIVE: "green", PENDING: "amber", REMOVED: "gray" };

function initials(name = "?") {
  return name
    .split(" ")
    .map((p) => p[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

export default function MembersPage() {
  const { weddingId } = useParams();
  const { wedding } = useOutletContext();
  const queryClient = useQueryClient();

  const { data: res, isLoading } = useMembers(weddingId);
  const [removing, setRemoving] = useState(null);
  const [error, setError] = useState("");

  const members = res?.data ?? [];
  const role = wedding?.role;
  const isAdmin = role === "ADMIN";

  const confirmRemove = () => {
    setError("");
    api
      .delete(`/weddings/${weddingId}/members/${removing.id}`)
      .then(() => {
        queryClient.invalidateQueries({ queryKey: weddingKeys.members(weddingId) });
        setRemoving(null);
      })
      .catch((err) => {
        setError(getApiErrorMessage(err));
        setRemoving(null);
      });
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="font-display text-2xl font-semibold text-wine-950">Members</h2>
          <p className="mt-1 text-sm text-wine-500">
            Family and friends who help plan this wedding.
          </p>
        </div>
        <Badge tone={roleTone[role] || "wine"}>You are {role}</Badge>
      </div>

      {error && <Alert>{error}</Alert>}

      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-20 animate-pulse rounded-2xl bg-wine-100" />
          ))}
        </div>
      ) : members.length === 0 ? (
        <EmptyState
          icon={Users}
          title="No members yet"
          description="Invitations arrive in a later phase — for now only you can plan."
        />
      ) : (
        <ul className="space-y-3">
          {members.map((member) => (
            <li
              key={member.id}
              className="flex items-center justify-between gap-4 rounded-2xl border border-wine-100 bg-white p-4"
            >
              <div className="flex min-w-0 items-center gap-3">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-wine-700 text-sm font-semibold text-white">
                  {initials(member.user?.name)}
                </span>
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="truncate font-medium text-wine-950">
                      {member.user?.name ?? "Unknown user"}
                    </p>
                    <Badge tone={roleTone[member.role] || "wine"}>{member.role}</Badge>
                    <Badge tone={statusTone[member.status] || "gray"}>
                      {member.status}
                    </Badge>
                  </div>
                  <p className="truncate text-xs text-wine-500">{member.user?.email}</p>
                </div>
              </div>

              {isAdmin && member.role !== "ADMIN" && (
                <button
                  type="button"
                  onClick={() => setRemoving(member)}
                  aria-label={`Remove ${member.user?.name}`}
                  className="rounded-lg p-2 text-wine-500 transition-colors hover:bg-red-50 hover:text-red-600"
                >
                  <Trash2 className="h-4 w-4" aria-hidden="true" />
                </button>
              )}
            </li>
          ))}
        </ul>
      )}

      <div className="rounded-2xl border border-dashed border-wine-200 bg-white/60 p-5 text-center">
        <UserPlus className="mx-auto mb-2 h-6 w-6 text-wine-400" aria-hidden="true" />
        <p className="text-sm font-medium text-wine-700">Inviting members is coming soon</p>
        <p className="mt-1 text-xs text-wine-500">
          Share an invite link so family can join and help plan.
        </p>
        <Button variant="secondary" size="sm" className="mt-3" disabled>
          Invite member
        </Button>
      </div>

      <Modal
        open={Boolean(removing)}
        onClose={() => setRemoving(null)}
        title="Remove member?"
        maxWidth="max-w-md"
      >
        <p className="text-sm text-wine-600">
          <strong>{removing?.user?.name}</strong> will lose access to this wedding workspace.
        </p>
        <div className="mt-5 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <Button variant="secondary" onClick={() => setRemoving(null)} type="button">
            Cancel
          </Button>
          <Button
            onClick={confirmRemove}
            className="bg-red-600 text-white hover:bg-red-700 focus-visible:ring-red-500"
          >
            Remove member
          </Button>
        </div>
      </Modal>
    </div>
  );
}
