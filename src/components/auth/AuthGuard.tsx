import { ReactNode } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useIsAuthenticated } from "@/lib/store/authStore";
import { tokenStorage } from "@/lib/api/client";
import { Loader2 } from "lucide-react";
import { useAuthStore } from "@/lib/store/authStore";

interface AuthGuardProps {
  children: ReactNode;
}

export function AuthGuard({ children }: AuthGuardProps) {
  const isAuthenticated = useIsAuthenticated();
  const isLoading = useAuthStore((s) => s.isLoading);
  const location = useLocation();
  const token = tokenStorage.get();

  // If we have a token but auth state is still loading, show spinner
  if (token && isLoading && !isAuthenticated) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="text-center">
          <Loader2 className="w-10 h-10 animate-spin text-primary mx-auto mb-4" />
          <p className="text-muted-foreground text-sm">Loading your workspace...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated && !token) {
    return <Navigate to="/auth" state={{ from: location }} replace />;
  }

  return <>{children}</>;
}
