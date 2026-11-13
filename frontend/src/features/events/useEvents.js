import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { eventService } from "../../services/event.service";

export const eventKeys = {
  all: (weddingId) => ["weddings", weddingId, "events"],
  list: (weddingId, filters) => ["weddings", weddingId, "events", filters ?? {}],
};

/** Events for a wedding with optional filters (status, page, sortBy…) */
export function useEvents(weddingId, filters = {}) {
  return useQuery({
    queryKey: eventKeys.list(weddingId, filters),
    queryFn: () => eventService.list(weddingId, filters),
    enabled: Boolean(weddingId),
  });
}

function useInvalidateWedding(weddingId) {
  const queryClient = useQueryClient();
  return () => {
    queryClient.invalidateQueries({ queryKey: eventKeys.all(weddingId) });
    queryClient.invalidateQueries({ queryKey: ["weddings", "dashboard", weddingId] });
  };
}

export function useCreateEvent(weddingId) {
  const invalidate = useInvalidateWedding(weddingId);

  return useMutation({
    mutationFn: (payload) => eventService.create(weddingId, payload),
    onSuccess: invalidate,
  });
}

export function useUpdateEvent(weddingId) {
  const invalidate = useInvalidateWedding(weddingId);

  return useMutation({
    mutationFn: ({ eventId, ...payload }) => eventService.update(weddingId, eventId, payload),
    onSuccess: invalidate,
  });
}

export function useDeleteEvent(weddingId) {
  const invalidate = useInvalidateWedding(weddingId);

  return useMutation({
    mutationFn: (eventId) => eventService.remove(weddingId, eventId),
    onSuccess: invalidate,
  });
}
