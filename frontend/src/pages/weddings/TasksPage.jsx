import { useState } from "react";
import { useOutletContext, useParams } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  CheckSquare,
  Pencil,
  Plus,
  Trash2,
  AlertTriangle,
  User,
} from "lucide-react";
import Badge from "../../components/ui/Badge";
import Button from "../../components/ui/Button";
import Modal from "../../components/ui/Modal";
import Input from "../../components/ui/Input";
import Select from "../../components/ui/Select";
import Textarea from "../../components/ui/Textarea";
import EmptyState from "../../components/ui/EmptyState";
import Alert from "../../components/ui/Alert";
import { useTasks, useCreateTask, useUpdateTask, useDeleteTask } from "../../features/tasks/useTasks";
import { useEvents } from "../../features/events/useEvents";
import { useMembers } from "../../features/weddings/useWeddings";
import { taskSchema } from "../../features/tasks/task.schemas";
import { getApiErrorMessage } from "../../services/api";

const statusTone = { TODO: "gray", IN_PROGRESS: "amber", COMPLETED: "green" };
const statusLabel = { TODO: "To do", IN_PROGRESS: "In progress", COMPLETED: "Completed" };
const priorityTone = { LOW: "gray", MEDIUM: "wine", HIGH: "red" };

function formatDate(d) {
  return new Date(d).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export default function TasksPage() {
  const { weddingId } = useParams();
  const { wedding } = useOutletContext();

  const [filters, setFilters] = useState({
    status: "",
    priority: "",
    event: "",
    assignee: "",
    overdue: "",
  });
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [deleting, setDeleting] = useState(null);
  const [actionError, setActionError] = useState("");

  const queryFilters = Object.fromEntries(
    Object.entries(filters).filter(([, v]) => v !== "")
  );

  const { data: res, isLoading } = useTasks(weddingId, queryFilters);
  const { data: eventsRes } = useEvents(weddingId, { limit: 100 });
  const { data: membersRes } = useMembers(weddingId);

  const createTask = useCreateTask(weddingId);
  const updateTask = useUpdateTask(weddingId);
  const deleteTask = useDeleteTask(weddingId);

  const tasks = res?.data ?? [];
  const events = eventsRes?.data ?? [];
  const members = membersRes?.data ?? [];
  const isManager = ["ADMIN", "MANAGER"].includes(wedding?.role);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(taskSchema),
    defaultValues: {
      title: "",
      description: "",
      event: "",
      assignee: "",
      dueDate: "",
      priority: "MEDIUM",
      status: "TODO",
    },
  });

  const blank = {
    title: "",
    description: "",
    event: "",
    assignee: "",
    dueDate: "",
    priority: "MEDIUM",
    status: "TODO",
  };

  const openCreate = () => {
    setEditing(null);
    setActionError("");
    reset(blank);
    setModalOpen(true);
  };

  const openEdit = (task) => {
    setEditing(task);
    setActionError("");
    reset({
      title: task.title,
      description: task.description ?? "",
      event: task.event?.id ?? "",
      assignee: task.assignee?.id ?? "",
      dueDate: task.dueDate ? new Date(task.dueDate).toISOString().slice(0, 10) : "",
      priority: task.priority,
      status: task.status,
    });
    setModalOpen(true);
  };

  const onSubmit = (values) => {
    const payload = {
      ...values,
      dueDate: values.dueDate
        ? new Date(values.dueDate + "T00:00:00").toISOString()
        : null,
      event: values.event || null,
      assignee: values.assignee || null,
    };

    const opts = {
      onSuccess: () => {
        setModalOpen(false);
        setEditing(null);
      },
      onError: (err) => setActionError(getApiErrorMessage(err)),
    };

    if (editing) updateTask.mutate({ taskId: editing.id, ...payload }, opts);
    else createTask.mutate(payload, opts);
  };

  // Inline status change from the list
  const quickStatus = (task, status) =>
    updateTask.mutate(
      { taskId: task.id, status },
      { onError: (err) => setActionError(getApiErrorMessage(err)) }
    );

  const confirmDelete = () => {
    deleteTask.mutate(deleting.id, {
      onSuccess: () => setDeleting(null),
      onError: (err) => {
        setActionError(getApiErrorMessage(err));
        setDeleting(null);
      },
    });
  };

  const setFilter = (key) => (e) =>
    setFilters((f) => ({ ...f, [key]: e.target.value }));

  const activeFilterCount = Object.values(filters).filter(Boolean).length;

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="font-display text-2xl font-semibold text-wine-950">Tasks</h2>
          <p className="mt-1 text-sm text-wine-500">
            Assign responsibilities and track what's done.
          </p>
        </div>

        {isManager && (
          <Button onClick={openCreate}>
            <Plus className="h-4 w-4" aria-hidden="true" />
            Add task
          </Button>
        )}
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-end gap-3 rounded-2xl border border-wine-100 bg-white p-4">
        <Select
          label="Status"
          value={filters.status}
          onChange={setFilter("status")}
          className="w-40"
        >
          <option value="">All statuses</option>
          <option value="TODO">To do</option>
          <option value="IN_PROGRESS">In progress</option>
          <option value="COMPLETED">Completed</option>
        </Select>

        <Select
          label="Priority"
          value={filters.priority}
          onChange={setFilter("priority")}
          className="w-36"
        >
          <option value="">All priorities</option>
          <option value="LOW">Low</option>
          <option value="MEDIUM">Medium</option>
          <option value="HIGH">High</option>
        </Select>

        <Select
          label="Event"
          value={filters.event}
          onChange={setFilter("event")}
          className="w-44"
        >
          <option value="">All events</option>
          {events.map((ev) => (
            <option key={ev.id} value={ev.id}>
              {ev.name}
            </option>
          ))}
        </Select>

        <Select
          label="Assignee"
          value={filters.assignee}
          onChange={setFilter("assignee")}
          className="w-44"
        >
          <option value="">Everyone</option>
          {members.map((m) => (
            <option key={m.id} value={m.user?.id ?? m.userId}>
              {m.user?.name ?? m.name}
            </option>
          ))}
        </Select>

        <label className="flex h-[46px] cursor-pointer items-center gap-2 px-1 pb-1 text-sm font-medium text-wine-800">
          <input
            type="checkbox"
            checked={filters.overdue === "true"}
            onChange={(e) =>
              setFilters((f) => ({ ...f, overdue: e.target.checked ? "true" : "" }))
            }
            className="h-4 w-4 rounded border-wine-300 accent-wine-700"
          />
          Overdue only
        </label>

        {activeFilterCount > 0 && (
          <button
            type="button"
            onClick={() =>
              setFilters({ status: "", priority: "", event: "", assignee: "", overdue: "" })
            }
            className="pb-2.5 text-sm font-medium text-wine-700 underline-offset-2 hover:underline"
          >
            Clear filters
          </button>
        )}
      </div>

      {actionError && <Alert>{actionError}</Alert>}

      {/* List */}
      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-20 animate-pulse rounded-2xl bg-wine-100" />
          ))}
        </div>
      ) : tasks.length === 0 ? (
        <EmptyState
          icon={CheckSquare}
          title={activeFilterCount ? "No tasks match these filters" : "No tasks yet"}
          description={
            activeFilterCount
              ? "Try clearing some filters."
              : "Break the planning down — book the decorator, send invitations, finalize the menu…"
          }
          actionLabel={isManager && !activeFilterCount ? "Add task" : undefined}
          onAction={openCreate}
        />
      ) : (
        <ul className="space-y-3">
          {tasks.map((task) => (
            <li
              key={task.id}
              className={`rounded-2xl border bg-white p-4 shadow-sm ${
                task.isOverdue ? "border-red-200" : "border-wine-100"
              }`}
            >
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3
                      className={`font-medium ${
                        task.status === "COMPLETED"
                          ? "text-wine-400 line-through"
                          : "text-wine-950"
                      }`}
                    >
                      {task.title}
                    </h3>
                    <Badge tone={statusTone[task.status]}>
                      {statusLabel[task.status]}
                    </Badge>
                    <Badge tone={priorityTone[task.priority]}>{task.priority}</Badge>
                    {task.isOverdue && (
                      <Badge tone="red">
                        <AlertTriangle className="h-3 w-3" aria-hidden="true" />
                        Overdue
                      </Badge>
                    )}
                  </div>

                  {task.description && (
                    <p className="mt-1.5 text-sm text-wine-600">{task.description}</p>
                  )}

                  <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs text-wine-500">
                    {task.event && <span>📅 {task.event.name}</span>}
                    {task.assignee && (
                      <span className="inline-flex items-center gap-1">
                        <User className="h-3.5 w-3.5" aria-hidden="true" />
                        {task.assignee.name}
                      </span>
                    )}
                    {task.dueDate && (
                      <span
                        className={
                          task.isOverdue ? "font-medium text-red-600" : undefined
                        }
                      >
                        Due {formatDate(task.dueDate)}
                      </span>
                    )}
                  </div>
                </div>

                {isManager && (
                  <div className="flex shrink-0 items-center gap-2">
                    <Select
                      aria-label={`Change status of ${task.title}`}
                      value={task.status}
                      onChange={(e) => quickStatus(task, e.target.value)}
                      className="w-36 py-1.5 text-xs"
                    >
                      <option value="TODO">To do</option>
                      <option value="IN_PROGRESS">In progress</option>
                      <option value="COMPLETED">Completed</option>
                    </Select>
                    <button
                      type="button"
                      onClick={() => openEdit(task)}
                      aria-label={`Edit ${task.title}`}
                      className="rounded-lg p-2 text-wine-500 transition-colors hover:bg-wine-100 hover:text-wine-800"
                    >
                      <Pencil className="h-4 w-4" aria-hidden="true" />
                    </button>
                    <button
                      type="button"
                      onClick={() => setDeleting(task)}
                      aria-label={`Delete ${task.title}`}
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
        title={editing ? "Edit task" : "Add task"}
      >
        <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">
          <Input
            label="Title"
            type="text"
            placeholder="Book the decorator"
            error={errors.title?.message}
            {...register("title")}
          />

          <Textarea
            label="Description"
            placeholder="Details, contact numbers, notes…"
            rows={2}
            error={errors.description?.message}
            {...register("description")}
          />

          <div className="grid gap-4 sm:grid-cols-2">
            <Select label="Event" error={errors.event?.message} {...register("event")}>
              <option value="">No specific event</option>
              {events.map((ev) => (
                <option key={ev.id} value={ev.id}>
                  {ev.name}
                </option>
              ))}
            </Select>

            <Select label="Assign to" error={errors.assignee?.message} {...register("assignee")}>
              <option value="">Unassigned</option>
              {members.map((m) => (
                <option key={m.id} value={m.user?.id ?? m.userId}>
                  {m.user?.name ?? m.name}
                </option>
              ))}
            </Select>
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            <Input
              label="Due date"
              type="date"
              error={errors.dueDate?.message}
              {...register("dueDate")}
            />
            <Select label="Priority" error={errors.priority?.message} {...register("priority")}>
              <option value="LOW">Low</option>
              <option value="MEDIUM">Medium</option>
              <option value="HIGH">High</option>
            </Select>
            <Select label="Status" error={errors.status?.message} {...register("status")}>
              <option value="TODO">To do</option>
              <option value="IN_PROGRESS">In progress</option>
              <option value="COMPLETED">Completed</option>
            </Select>
          </div>

          <div className="flex flex-col-reverse gap-3 pt-2 sm:flex-row sm:justify-end">
            <Button variant="secondary" onClick={() => setModalOpen(false)} type="button">
              Cancel
            </Button>
            <Button type="submit" loading={createTask.isPending || updateTask.isPending}>
              {editing ? "Save changes" : "Create task"}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Delete confirm */}
      <Modal
        open={Boolean(deleting)}
        onClose={() => setDeleting(null)}
        title="Delete task?"
        maxWidth="max-w-md"
      >
        <p className="text-sm text-wine-600">
          <strong>{deleting?.title}</strong> will be removed permanently.
        </p>
        <div className="mt-5 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <Button variant="secondary" onClick={() => setDeleting(null)} type="button">
            Keep task
          </Button>
          <Button
            onClick={confirmDelete}
            loading={deleteTask.isPending}
            className="bg-red-600 text-white hover:bg-red-700 focus-visible:ring-red-500"
          >
            Delete task
          </Button>
        </div>
      </Modal>
    </div>
  );
}
