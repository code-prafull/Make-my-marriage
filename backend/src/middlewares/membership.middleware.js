import ApiError from "../utils/ApiError.js";
import asyncHandler from "../utils/asyncHandler.js";
import Wedding from "../modules/weddings/wedding.model.js";
import WeddingMember from "../modules/members/member.model.js";

/**
 * Ensures the authenticated user has an ACTIVE membership in the
 * wedding identified by `req.params.weddingId`.
 * Attaches `req.wedding` and `req.membership` for downstream handlers.
 */
const requireMembership = asyncHandler(async (req, _res, next) => {
  const { weddingId } = req.params;

  const wedding = await Wedding.findById(weddingId);
  if (!wedding) {
    throw ApiError.notFound("Wedding not found");
  }

  const membership = await WeddingMember.findOne({
    wedding: wedding._id,
    user: req.user._id,
    status: "ACTIVE",
  });

  if (!membership) {
    throw ApiError.forbidden("You are not a member of this wedding");
  }

  req.wedding = wedding;
  req.membership = membership;
  next();
});

/**
 * Role guard — use AFTER requireMembership.
 * Usage: requireRole("ADMIN")
 */
const requireRole = (...roles) => (req, _res, next) => {
  if (!req.membership || !roles.includes(req.membership.role)) {
    return next(ApiError.forbidden("You do not have permission to perform this action"));
  }
  return next();
};

export { requireMembership, requireRole };
