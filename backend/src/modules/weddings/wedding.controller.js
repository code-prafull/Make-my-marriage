import ApiResponse from "../../utils/ApiResponse.js";
import asyncHandler from "../../utils/asyncHandler.js";
import * as weddingService from "./wedding.service.js";

/** POST /api/v1/weddings — creator becomes ADMIN automatically */
export const create = asyncHandler(async (req, res) => {
  const wedding = await weddingService.createWedding(req.body, req.user._id);

  return ApiResponse(res, {
    statusCode: 201,
    message: "Wedding created successfully",
    data: weddingService.toWeddingDto(wedding, "ADMIN"),
  });
});

/** GET /api/v1/weddings — user's weddings with their role */
export const list = asyncHandler(async (req, res) => {
  const weddings = await weddingService.listUserWeddings(req.user._id);

  return ApiResponse(res, { data: weddings });
});

/** GET /api/v1/weddings/:weddingId */
export const getOne = asyncHandler(async (req, res) => {
  return ApiResponse(res, {
    data: weddingService.toWeddingDto(req.wedding, req.membership.role),
  });
});

/** PATCH /api/v1/weddings/:weddingId — ADMIN or MANAGER */
export const update = asyncHandler(async (req, res) => {
  const wedding = await weddingService.updateWedding(req.params.weddingId, req.body);

  return ApiResponse(res, {
    message: "Wedding updated successfully",
    data: weddingService.toWeddingDto(wedding, req.membership.role),
  });
});

/** DELETE /api/v1/weddings/:weddingId — ADMIN only (archives) */
export const remove = asyncHandler(async (req, res) => {
  const wedding = await weddingService.archiveWedding(req.params.weddingId);

  return ApiResponse(res, {
    message: "Wedding archived successfully",
    data: weddingService.toWeddingDto(wedding),
  });
});
