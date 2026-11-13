import { Router } from "express";
import { z } from "zod";
import * as taskController from "./task.controller.js";
import validate from "../../middlewares/validate.middleware.js";
import { requireMembership, requireRole } from "../../middlewares/membership.middleware.js";
import {
  createTaskSchema,
  updateTaskSchema,
  taskParams,
  taskListQuery,
} from "./task.validation.js";

// mergeParams: true → weddingId from /weddings/:weddingId/tasks
const router = Router({ mergeParams: true });

const objectId = z.string().trim().regex(/^[0-9a-fA-F]{24}$/, "Invalid id");

router.get(
  "/",
  requireMembership,
  validate({ query: taskListQuery }),
  taskController.list
);

router.post(
  "/",
  requireMembership,
  requireRole("ADMIN", "MANAGER"),
  validate({ body: createTaskSchema }),
  taskController.create
);

router.patch(
  "/:taskId",
  requireMembership,
  requireRole("ADMIN", "MANAGER"),
  validate({ params: taskParams.partial({ weddingId: objectId }), body: updateTaskSchema }),
  taskController.update
);

router.delete(
  "/:taskId",
  requireMembership,
  requireRole("ADMIN", "MANAGER"),
  validate({ params: taskParams.partial({ weddingId: objectId }) }),
  taskController.remove
);

export default router;
