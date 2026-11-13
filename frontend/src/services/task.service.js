import api from "./api";

/** Task service — /api/v1/weddings/:weddingId/tasks */
export const taskService = {
  list: (weddingId, params = {}) =>
    api.get(`/weddings/${weddingId}/tasks`, { params }).then((res) => res.data),
  create: (weddingId, payload) =>
    api.post(`/weddings/${weddingId}/tasks`, payload).then((res) => res.data),
  update: (weddingId, taskId, payload) =>
    api.patch(`/weddings/${weddingId}/tasks/${taskId}`, payload).then((res) => res.data),
  remove: (weddingId, taskId) =>
    api.delete(`/weddings/${weddingId}/tasks/${taskId}`).then((res) => res.data),
};
