import ApiResponse from "../../utils/ApiResponse.js";
import asyncHandler from "../../utils/asyncHandler.js";
import * as taskService from "./task.service.js";

/** GET /api/v1/weddings/:weddingId/tasks */
export const list = asyncHandler(async (req, res) => {
  const { tasks, pagination } = await taskService.listTasks(req.params.weddingId, req.query);

  return ApiResponse(res, { data: tasks, pagination });
});

/** POST /api/v1/weddings/:weddingId/tasks */
export const create = asyncHandler(async (req, res) => {
  const task = await taskService.createTask(req.params.weddingId, req.body, req.user._id);

  return ApiResponse(res, { statusCode: 201, message: "Task created successfully", data: task });
});

/** PATCH /api/v1/weddings/:weddingId/tasks/:taskId */
export const update = asyncHandler(async (req, res) => {
  const task = await taskService.updateTask(
    req.params.weddingId,
    req.params.taskId,
    req.body
  );

  return ApiResponse(res, { message: "Task updated successfully", data: task });
});

/** DELETE /api/v1/weddings/:weddingId/tasks/:taskId */
export const remove = asyncHandler(async (req, res) => {
  await taskService.deleteTask(req.params.weddingId, req.params.taskId);

  return ApiResponse(res, { message: "Task deleted successfully" });
});
