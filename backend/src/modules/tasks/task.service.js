import ApiError from "../../utils/ApiError.js";
import Task from "./task.model.js";
import Event from "../events/event.model.js";
import WeddingMember from "../members/member.model.js";

function startOfToday() {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d;
}

function isOverdue(task) {
  return (
    task.status !== "COMPLETED" &&
    task.dueDate !== null &&
    new Date(task.dueDate) < startOfToday()
  );
}

/** Task → API DTO with populated references and overdue flag. */
export function toTaskDto(task) {
  return {
    id: task._id.toString(),
    title: task.title,
    description: task.description,
    event: task.event
      ? {
          id: task.event._id ? task.event._id.toString() : String(task.event),
          name: task.event.name,
          date: task.event.date,
        }
      : null,
    assignee: task.assignee
      ? {
          id: task.assignee._id ? task.assignee._id.toString() : String(task.assignee),
          name: task.assignee.name,
          email: task.assignee.email,
        }
      : null,
    dueDate: task.dueDate,
    priority: task.priority,
    status: task.status,
    isOverdue: isOverdue(task),
    createdAt: task.createdAt,
  };
}

/** Validates that a referenced event belongs to this wedding. */
async function assertEventBelongs(weddingId, eventId) {
  if (!eventId) return null;
  const event = await Event.findOne({ _id: eventId, wedding: weddingId }).select("_id name date");
  if (!event) throw ApiError.badRequest("The selected event does not exist in this wedding");
  return event;
}

/** Validates that an assignee is an ACTIVE member of this wedding. */
async function assertAssigneeIsMember(weddingId, userId) {
  if (!userId) return;
  const membership = await WeddingMember.findOne({
    wedding: weddingId,
    user: userId,
    status: "ACTIVE",
  });
  if (!membership) {
    throw ApiError.badRequest("Tasks can only be assigned to active wedding members");
  }
}

export async function listTasks(weddingId, query) {
  const { page, limit, status, priority, event, assignee, overdue, sortBy, order } = query;

  const filter = { wedding: weddingId };
  if (status) filter.status = status;
  if (priority) filter.priority = priority;
  if (event) filter.event = event;
  if (assignee) filter.assignee = assignee;
  if (overdue === true) {
    filter.dueDate = { $ne: null, $lt: startOfToday() };
    filter.status = { $ne: "COMPLETED" };
  }

  const [total, tasks] = await Promise.all([
    Task.countDocuments(filter),
    Task.find(filter)
      .populate("event", "name date")
      .populate("assignee", "name email")
      .sort({ [sortBy]: order === "desc" ? -1 : 1, _id: 1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean(),
  ]);

  return {
    tasks: tasks.map((t) => ({ ...toTaskDto(t), id: t._id.toString() })),
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.max(1, Math.ceil(total / limit)),
    },
  };
}

export async function createTask(weddingId, payload, userId) {
  const event = await assertEventBelongs(weddingId, payload.event);
  await assertAssigneeIsMember(weddingId, payload.assignee);

  const task = await Task.create({
    ...payload,
    event: event ? event._id : null,
    wedding: weddingId,
    createdBy: userId,
  });

  const populated = await Task.findById(task._id)
    .populate("event", "name date")
    .populate("assignee", "name email")
    .lean();

  return toTaskDto(populated);
}

export async function updateTask(weddingId, taskId, payload) {
  // Drop undefined keys (Zod omits absent fields) so $set only touches provided fields
  const set = Object.fromEntries(
    Object.entries(payload).filter(([, v]) => v !== undefined)
  );

  // Only validate references that are present in the update
  if ("event" in set) await assertEventBelongs(weddingId, set.event);
  if ("assignee" in set) await assertAssigneeIsMember(weddingId, set.assignee);

  const task = await Task.findOneAndUpdate(
    { _id: taskId, wedding: weddingId },
    { $set: set },
    { returnDocument: "after", runValidators: true }
  )
    .populate("event", "name date")
    .populate("assignee", "name email");

  if (!task) throw ApiError.notFound("Task not found");
  return toTaskDto(task);
}

export async function deleteTask(weddingId, taskId) {
  const task = await Task.findOneAndDelete({ _id: taskId, wedding: weddingId });
  if (!task) throw ApiError.notFound("Task not found");
  return true;
}

/** Dashboard counters for the events/tasks modules. */
export async function getTaskCounts(weddingId) {
  const today = startOfToday();

  const [total, pending, completed, overdue] = await Promise.all([
    Task.countDocuments({ wedding: weddingId }),
    Task.countDocuments({ wedding: weddingId, status: { $ne: "COMPLETED" } }),
    Task.countDocuments({ wedding: weddingId, status: "COMPLETED" }),
    Task.countDocuments({
      wedding: weddingId,
      status: { $ne: "COMPLETED" },
      dueDate: { $ne: null, $lt: today },
    }),
  ]);

  return { total, pending, completed, overdue };
}
