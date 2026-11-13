import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { authService } from "../../services/auth.service";

export const authKeys = {
  session: ["auth", "session"],
};

/**
 * Restores the current session on app load (GET /auth/me).
 * Returns null when not authenticated instead of throwing.
 */
export function useSession() {
  return useQuery({
    queryKey: authKeys.session,
    queryFn: async () => {
      try {
        const res = await authService.me();
        return res?.data ?? null;
      } catch (error) {
        // 401 = no valid session — not an error, just signed out
        if (error?.response?.status === 401) return null;
        throw error;
      }
    },
    retry: false,
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
  });
}

/** POST /auth/login — caches the returned user as the session */
export function useLogin() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: authService.login,
    onSuccess: (res) => {
      queryClient.setQueryData(authKeys.session, res?.data?.user ?? null);
    },
  });
}

/** POST /auth/signup — caches the returned user as the session */
export function useSignup() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: authService.signup,
    onSuccess: (res) => {
      queryClient.setQueryData(authKeys.session, res?.data?.user ?? null);
    },
  });
}

/** POST /auth/logout — clears the cached session */
export function useLogout() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: authService.logout,
    onSettled: () => {
      queryClient.setQueryData(authKeys.session, null);
      queryClient.clear();
    },
  });
}
