import ApiResponse from "../../utils/ApiResponse.js";
import asyncHandler from "../../utils/asyncHandler.js";
import * as memberService from "./member.service.js";

/** GET /api/v1/weddings/:weddingId/members — ADMIN or MANAGER */
export const list = asyncHandler(async (req, res) => {
  const members = await memberService.listMembers(req.params.weddingId);

  return ApiResponse(res, { data: members });
});

/** DELETE /api/v1/weddings/:weddingId/members/:memberId — ADMIN only */
export const remove = asyncHandler(async (req, res) => {
  await memberService.removeMember(req.params.weddingId, req.params.memberId);

  return ApiResponse(res, { message: "Member removed successfully" });
});
