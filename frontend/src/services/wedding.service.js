import api from "./api";

/** Wedding workspace service — /api/v1/weddings */
export const weddingService = {
  list: () => api.get("/weddings").then((res) => res.data),
  get: (weddingId) => api.get(`/weddings/${weddingId}`).then((res) => res.data),
  create: (payload) => api.post("/weddings", payload).then((res) => res.data),
  update: (weddingId, payload) =>
    api.patch(`/weddings/${weddingId}`, payload).then((res) => res.data),
  remove: (weddingId) => api.delete(`/weddings/${weddingId}`).then((res) => res.data),
  dashboard: (weddingId) =>
    api.get(`/weddings/${weddingId}/dashboard`).then((res) => res.data),
  members: (weddingId) =>
    api.get(`/weddings/${weddingId}/members`).then((res) => res.data),
};
