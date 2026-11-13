import api from "./api";

/** Guest service — /api/v1/weddings/:weddingId/guests */
export const guestService = {
  list: (weddingId, params = {}) =>
    api.get(`/weddings/${weddingId}/guests`, { params }).then((res) => res.data),
  create: (weddingId, payload) =>
    api.post(`/weddings/${weddingId}/guests`, payload).then((res) => res.data),
  update: (weddingId, guestId, payload) =>
    api.patch(`/weddings/${weddingId}/guests/${guestId}`, payload).then((res) => res.data),
  remove: (weddingId, guestId) =>
    api.delete(`/weddings/${weddingId}/guests/${guestId}`).then((res) => res.data),
  /** Bulk import — records: [{ name, email, phone, side, familyGroup }] */
  bulkImport: (weddingId, records) =>
    api.post(`/weddings/${weddingId}/guests/bulk`, { records }).then((res) => res.data),
};

/** Invitation service — /api/v1/weddings/:weddingId/invitations */
export const invitationService = {
  /**
   * Create (or refresh) invitations for a guest on the given events.
   * Returns { invitations, rsvpToken, rsvpUrl } — the plaintext token
   * is only ever returned once, at creation time.
   */
  create: (weddingId, payload) =>
    api.post(`/weddings/${weddingId}/invitations`, payload).then((res) => res.data),
};

/** Public RSVP service — /api/v1/public/rsvp/:token (no auth) */
export const rsvpService = {
  get: (token) => api.get(`/public/rsvp/${token}`).then((res) => res.data),
  respond: (token, payload) =>
    api.patch(`/public/rsvp/${token}`, payload).then((res) => res.data),
};
