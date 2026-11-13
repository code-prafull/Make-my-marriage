import api from "./api";

/** Event service — /api/v1/weddings/:weddingId/events */
export const eventService = {
  list: (weddingId, params = {}) =>
    api.get(`/weddings/${weddingId}/events`, { params }).then((res) => res.data),
  create: (weddingId, payload) =>
    api.post(`/weddings/${weddingId}/events`, payload).then((res) => res.data),
  update: (weddingId, eventId, payload) =>
    api.patch(`/weddings/${weddingId}/events/${eventId}`, payload).then((res) => res.data),
  remove: (weddingId, eventId) =>
    api.delete(`/weddings/${weddingId}/events/${eventId}`).then((res) => res.data),
};
