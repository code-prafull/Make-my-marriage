import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { weddingService } from "../../services/wedding.service";

export const weddingKeys = {
  all: ["weddings"],
  list: ["weddings", "list"],
  detail: (id) => ["weddings", "detail", id],
  dashboard: (id) => ["weddings", "dashboard", id],
  members: (id) => ["weddings", "members", id],
};

/** User's weddings (dashboard list) */
export function useWeddings() {
  return useQuery({
    queryKey: weddingKeys.list,
    queryFn: weddingService.list,
    staleTime: 30 * 1000,
  });
}

/** Single wedding workspace */
export function useWedding(weddingId) {
  return useQuery({
    queryKey: weddingKeys.detail(weddingId),
    queryFn: () => weddingService.get(weddingId),
    enabled: Boolean(weddingId),
  });
}

/** Dashboard aggregates (FR-03) */
export function useWeddingDashboard(weddingId) {
  return useQuery({
    queryKey: weddingKeys.dashboard(weddingId),
    queryFn: () => weddingService.dashboard(weddingId),
    enabled: Boolean(weddingId),
  });
}

export function useMembers(weddingId) {
  return useQuery({
    queryKey: weddingKeys.members(weddingId),
    queryFn: () => weddingService.members(weddingId),
    enabled: Boolean(weddingId),
  });
}

export function useCreateWedding() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: weddingService.create,
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: weddingKeys.list });
      if (res?.data?.id) {
        queryClient.invalidateQueries({ queryKey: weddingKeys.detail(res.data.id) });
      }
    },
  });
}

export function useUpdateWedding(weddingId) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload) => weddingService.update(weddingId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: weddingKeys.list });
      queryClient.invalidateQueries({ queryKey: weddingKeys.detail(weddingId) });
    },
  });
}
