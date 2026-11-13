import mongoose from "mongoose";
import ApiResponse from "../../utils/ApiResponse.js";
import asyncHandler from "../../utils/asyncHandler.js";
import Event from "../events/event.model.js";
import { getTaskCounts } from "../tasks/task.service.js";
import { toWeddingDto } from "../weddings/wedding.service.js";

/**
 * GET /api/v1/weddings/:weddingId/dashboard
 * Aggregates the FR-03 dashboard information from database records.
 */
export const getDashboard = asyncHandler(async (req, res) => {
  const weddingId = new mongoose.Types.ObjectId(req.params.weddingId);

  const startOfToday = new Date();
  startOfToday.setHours(0, 0, 0, 0);

  const [totalEvents, pastEvents, upcomingEvents, taskCounts] = await Promise.all([
    Event.countDocuments({ wedding: weddingId }),
    Event.countDocuments({ wedding: weddingId, date: { $lt: startOfToday } }),
    Event.find({ wedding: weddingId, date: { $gte: startOfToday } })
      .sort({ date: 1 })
      .limit(5)
      .select("name date startTime endTime venue visibility")
      .lean(),
    getTaskCounts(weddingId),
  ]);

  // Guests / contributions / expenses arrive in Phases 3–4 — zeros for now
  const data = {
    wedding: toWeddingDto(req.wedding, req.membership.role),
    stats: {
      totalEvents,
      upcomingEventsCount: totalEvents - pastEvents,
      pendingTasks: taskCounts.pending,
      completedTasks: taskCounts.completed,
      overdueTasks: taskCounts.overdue,
      totalTasks: taskCounts.total,
      totalGuests: 0,
      rsvpAccepted: 0,
      rsvpDeclined: 0,
      rsvpPending: 0,
      totalContributions: 0,
      totalExpenses: 0,
      remainingBalance: 0,
    },
    upcomingEvents: upcomingEvents.map((e) => ({
      id: e._id.toString(),
      name: e.name,
      date: e.date,
      startTime: e.startTime,
      endTime: e.endTime,
      venue: e.venue,
    })),
    quickActions: ["event", "guest", "task", "contribution", "expense", "photo"],
  };

  return ApiResponse(res, { data });
});
