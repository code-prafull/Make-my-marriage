import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { taskService } from "../../services/task.service";

export const taskKeys = {
  all: (weddingId) => ["weddings", weddingId, "tasks"],
  list: (weddingId, filters) => ["weddings", weddingId, "tasks", filters ?? {}],
};

/** Tasks for a wedding with optional filters (status, priority, event, assignee, overdue) */
export function useTasks(weddingId, filters = {}) {
  return useQuery({
    queryKey: taskKeys.list(weddingId, filters),
    queryFn: () => taskService.list(weddingId, filters),
    enabled: Boolean(weddingId),
  });
}

function useInvalidateWedding(weddingId) {
  const queryClient = useQueryClient();
  return () => {
    queryClient.invalidateQueries({ queryKey: taskKeys.all(weddingId) });
    queryClient.invalidateQueries({ queryKey: ["weddings", "dashboard", weddingId] });
  };
}

export function useCreateTask(weddingId) {
  const invalidate = useInvalidateWedding(weddingId);

  return useMutation({
    mutationFn: (payload) => taskService.create(weddingId, payload),
    onSuccess: invalidate,
  });
}

export function useUpdateTask(weddingId) {
  const invalidate = useInvalidateWedding(weddingId);

  return useMutation({
    mutationFn: ({ taskId, ...payload }) => taskService.update(weddingId, taskId, payload),
    onSuccess: invalidate,
  });
}

export function useDeleteTask(weddingId) {
  const invalidate = useInvalidateWedding(weddingId);

  return useMutation({
    mutationFn: (taskId) => taskService.remove(weddingId, taskId),
    onSuccess: invalidate,
  });
}
