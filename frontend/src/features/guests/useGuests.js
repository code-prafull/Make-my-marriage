import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { guestService, invitationService } from "../../services/guest.service";

export const guestKeys = {
  all: (weddingId) => ["weddings", weddingId, "guests"],
  list: (weddingId, filters) => ["weddings", weddingId, "guests", filters ?? {}],
};

/** Guests for a wedding with optional filters (side, search, page…). */
export function useGuests(weddingId, filters = {}) {
  return useQuery({
    queryKey: guestKeys.list(weddingId, filters),
    queryFn: () => guestService.list(weddingId, filters),
    enabled: Boolean(weddingId),
  });
}

function useInvalidateWedding(weddingId) {
  const queryClient = useQueryClient();
  return () => {
    queryClient.invalidateQueries({ queryKey: guestKeys.all(weddingId) });
    queryClient.invalidateQueries({ queryKey: ["weddings", "dashboard", weddingId] });
  };
}

export function useCreateGuest(weddingId) {
  const invalidate = useInvalidateWedding(weddingId);

  return useMutation({
    mutationFn: (payload) => guestService.create(weddingId, payload),
    onSuccess: invalidate,
  });
}

export function useUpdateGuest(weddingId) {
  const invalidate = useInvalidateWedding(weddingId);

  return useMutation({
    mutationFn: ({ guestId, ...payload }) => guestService.update(weddingId, guestId, payload),
    onSuccess: invalidate,
  });
}

export function useDeleteGuest(weddingId) {
  const invalidate = useInvalidateWedding(weddingId);

  return useMutation({
    mutationFn: (guestId) => guestService.remove(weddingId, guestId),
    onSuccess: invalidate,
  });
}

export function useBulkImportGuests(weddingId) {
  const invalidate = useInvalidateWedding(weddingId);

  return useMutation({
    mutationFn: (records) => guestService.bulkImport(weddingId, records),
    onSuccess: invalidate,
  });
}

/** Create / refresh invitations for a guest; resolves with { rsvpToken, rsvpUrl }. */
export function useCreateInvitations(weddingId) {
  const invalidate = useInvalidateWedding(weddingId);

  return useMutation({
    mutationFn: (payload) => invitationService.create(weddingId, payload),
    onSuccess: invalidate,
  });
}
