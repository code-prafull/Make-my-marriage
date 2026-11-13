import { Router } from "express";
import { z } from "zod";
import * as memberController from "./member.controller.js";
import validate from "../../middlewares/validate.middleware.js";
import { requireMembership, requireRole } from "../../middlewares/membership.middleware.js";

// mergeParams: true → weddingId from the parent /weddings/:weddingId/members route
const expressRouter = Router({ mergeParams: true });

const memberIdParams = z.object({
  weddingId: z.string().trim().min(1),
  memberId: z.string().trim().min(1),
});

expressRouter.get("/", requireMembership, requireRole("ADMIN", "MANAGER"), memberController.list);

expressRouter.delete(
  "/:memberId",
  validate({ params: memberIdParams }),
  requireMembership,
  requireRole("ADMIN"),
  memberController.remove
);

export default expressRouter;
