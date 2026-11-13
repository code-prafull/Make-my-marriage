import { Router } from "express";
import * as weddingController from "./wedding.controller.js";
import * as dashboardController from "../dashboard/dashboard.controller.js";
import memberRoutes from "../members/member.routes.js";
import eventRoutes from "../events/event.routes.js";
import taskRoutes from "../tasks/task.routes.js";
import validate from "../../middlewares/validate.middleware.js";
import authenticate from "../../middlewares/auth.middleware.js";
import { requireMembership, requireRole } from "../../middlewares/membership.middleware.js";
import {
  createWeddingSchema,
  updateWeddingSchema,
  weddingIdParams,
} from "./wedding.validation.js";

const router = Router();

router.use(authenticate);

router.post("/", validate({ body: createWeddingSchema }), weddingController.create);
router.get("/", weddingController.list);

// Nested resources: /weddings/:weddingId/<resource>
router.use("/:weddingId/members", validate({ params: weddingIdParams }), memberRoutes);
router.use("/:weddingId/events", validate({ params: weddingIdParams }), eventRoutes);
router.use("/:weddingId/tasks", validate({ params: weddingIdParams }), taskRoutes);

router.get(
  "/:weddingId/dashboard",
  validate({ params: weddingIdParams }),
  requireMembership,
  dashboardController.getDashboard
);

router.get(
  "/:weddingId",
  validate({ params: weddingIdParams }),
  requireMembership,
  weddingController.getOne
);

router.patch(
  "/:weddingId",
  validate({ params: weddingIdParams, body: updateWeddingSchema }),
  requireMembership,
  requireRole("ADMIN", "MANAGER"),
  weddingController.update
);

router.delete(
  "/:weddingId",
  validate({ params: weddingIdParams }),
  requireMembership,
  requireRole("ADMIN"),
  weddingController.remove
);

export default router;
