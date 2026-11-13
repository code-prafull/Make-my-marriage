import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { rsvpService } from "../../services/guest.service";

export const rsvpKeys = {
  detail: (token) => ["rsvp", token],
};

/** Public invitation preview — no auth required. */
export function useRsvp(token) {
  return useQuery({
    queryKey: rsvpKeys.detail(token),
    queryFn: () => rsvpService.get(token),
    enabled: Boolean(token),
    retry: false,
  });
}

/** Accept / decline one invited event (status + attendee count). */
export function useRespondRsvp(token) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload) => rsvpService.respond(token, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: rsvpKeys.detail(token) });
    },
  });
}
