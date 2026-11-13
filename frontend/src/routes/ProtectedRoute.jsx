import { Navigate, useLocation } from "react-router-dom";
import { useSession } from "../features/auth/useAuth";
import { Flower2 } from "lucide-react";

function FullScreenLoader() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-3 bg-wine-50">
      <Flower2 className="h-8 w-8 animate-spin text-wine-500" aria-hidden="true" />
      <p className="text-sm text-wine-500">Loading…</p>
    </div>
  );
}

/**
 * Guards authenticated routes. Frontend guard is for UX only —
 * real authorization is always enforced by the backend.
 */
export default function ProtectedRoute({ children }) {
  const { data: session, isLoading } = useSession();
  const location = useLocation();

  if (isLoading) return <FullScreenLoader />;

  if (!session) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  return children;
}
