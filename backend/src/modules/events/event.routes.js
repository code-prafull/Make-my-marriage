import { Router } from "express";
import * as eventController from "./event.controller.js";
import validate from "../../middlewares/validate.middleware.js";
import { requireMembership, requireRole } from "../../middlewares/membership.middleware.js";
import {
  createEventSchema,
  updateEventSchema,
  eventParams,
  eventListQuery,
} from "./event.validation.js";

// mergeParams: true → weddingId from /weddings/:weddingId/events
const router = Router({ mergeParams: true });

router.get(
  "/",
  requireMembership,
  validate({ query: eventListQuery }),
  eventController.list
);

router.post(
  "/",
  requireMembership,
  requireRole("ADMIN", "MANAGER"),
  validate({ body: createEventSchema }),
  eventController.create
);

router.get(
  "/:eventId",
  requireMembership,
  validate({ params: eventParams }),
  eventController.getOne
);

router.patch(
  "/:eventId",
  requireMembership,
  requireRole("ADMIN", "MANAGER"),
  validate({ params: eventParams, body: updateEventSchema }),
  eventController.update
);

router.delete(
  "/:eventId",
  requireMembership,
  requireRole("ADMIN", "MANAGER"),
  validate({ params: eventParams }),
  eventController.remove
);

export default router;
