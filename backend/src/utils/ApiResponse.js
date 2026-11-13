/**
 * Adds `pagination` support to the standard envelope:
 * { success, message, data, pagination }
 */
export default function ApiResponse(
  res,
  { statusCode = 200, message = "Success", data = null, pagination = undefined }
) {
  const body = { success: true, message };
  if (data !== null && data !== undefined) body.data = data;
  if (pagination !== undefined) body.pagination = pagination;
  return res.status(statusCode).json(body);
}
