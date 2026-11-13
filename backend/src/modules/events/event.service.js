import ApiError from "../../utils/ApiError.js";
import Event from "./event.model.js";
import Task from "../tasks/task.model.js";

function startOfToday() {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d;
}

/** Event → API DTO with computed upcoming/past status. */
export function toEventDto(event) {
  const isPast = new Date(event.date) < startOfToday();
  return {
    id: event._id.toString(),
    name: event.name,
    description: event.description,
    date: event.date,
    startTime: event.startTime,
    endTime: event.endTime,
    venue: event.venue,
    instructions: event.instructions,
    visibility: event.visibility,
    status: isPast ? "PAST" : "UPCOMING",
    createdAt: event.createdAt,
  };
}

/** GET events with pagination, status filter and sorting. */
export async function listEvents(weddingId, { page, limit, status, sortBy, order }) {
  const filter = { wedding: weddingId };

  if (status === "UPCOMING") filter.date = { $gte: startOfToday() };
  if (status === "PAST") filter.date = { $lt: startOfToday() };

  const [total, events] = await Promise.all([
    Event.countDocuments(filter),
    Event.find(filter)
      .sort({ [sortBy]: order === "desc" ? -1 : 1, _id: 1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean(),
  ]);

  return {
    events: events.map((e) => ({
      ...toEventDto(e),
      id: e._id.toString(),
    })),
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.max(1, Math.ceil(total / limit)),
    },
  };
}

/** Single event scoped to its wedding. */
export async function getEvent(weddingId, eventId) {
  const event = await Event.findOne({ _id: eventId, wedding: weddingId }).lean();
  if (!event) throw ApiError.notFound("Event not found");
  return toEventDto(event);
}

export async function createEvent(weddingId, payload, userId) {
  const event = await Event.create({
    ...payload,
    wedding: weddingId,
    createdBy: userId,
  });
  return toEventDto(event);
}

/** Only explicitly allowed fields are updated (service-level scoping). */
export async function updateEvent(weddingId, eventId, payload) {
  // Drop undefined keys (Zod omits absent fields) so $set only touches provided fields
  const set = Object.fromEntries(
    Object.entries(payload).filter(([, v]) => v !== undefined)
  );

  const event = await Event.findOneAndUpdate(
    { _id: eventId, wedding: weddingId },
    { $set: set },
    { returnDocument: "after", runValidators: true }
  );
  if (!event) throw ApiError.notFound("Event not found");
  return toEventDto(event);
}

/**
 * Deletes an event and safely handles references:
 * tasks pointing at the event are unlinked (kept as wedding-level tasks).
 */
export async function deleteEvent(weddingId, eventId) {
  const event = await Event.findOneAndDelete({ _id: eventId, wedding: weddingId });
  if (!event) throw ApiError.notFound("Event not found");

  await Task.updateMany(
    { wedding: weddingId, event: eventId },
    { $unset: { event: "" } }
  );

  return true;
}
