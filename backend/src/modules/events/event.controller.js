import ApiResponse from "../../utils/ApiResponse.js";
import asyncHandler from "../../utils/asyncHandler.js";
import * as eventService from "./event.service.js";

/** GET /api/v1/weddings/:weddingId/events */
export const list = asyncHandler(async (req, res) => {
  const { events, pagination } = await eventService.listEvents(
    req.params.weddingId,
    req.query
  );

  return ApiResponse(res, { data: events, pagination });
});

/** GET /api/v1/weddings/:weddingId/events/:eventId */
export const getOne = asyncHandler(async (req, res) => {
  const event = await eventService.getEvent(req.params.weddingId, req.params.eventId);

  return ApiResponse(res, { data: event });
});

/** POST /api/v1/weddings/:weddingId/events */
export const create = asyncHandler(async (req, res) => {
  const event = await eventService.createEvent(
    req.params.weddingId,
    req.body,
    req.user._id
  );

  return ApiResponse(res, { statusCode: 201, message: "Event created successfully", data: event });
});

/** PATCH /api/v1/weddings/:weddingId/events/:eventId */
export const update = asyncHandler(async (req, res) => {
  const event = await eventService.updateEvent(
    req.params.weddingId,
    req.params.eventId,
    req.body
  );

  return ApiResponse(res, { message: "Event updated successfully", data: event });
});

/** DELETE /api/v1/weddings/:weddingId/events/:eventId */
export const remove = asyncHandler(async (req, res) => {
  await eventService.deleteEvent(req.params.weddingId, req.params.eventId);

  return ApiResponse(res, { message: "Event deleted successfully" });
});
