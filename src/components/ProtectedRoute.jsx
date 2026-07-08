import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";

export default function ProtectedRoute({ children }) {
  const { user, profile, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--color-text-soft)" }}>
        Loading...
      </div>
    );
  }

  if (!user) return <Navigate to="/" replace />;

  // New user with no interests → send to onboarding (unless already there)
  const needsOnboarding = profile && (!profile.interests || profile.interests.length === 0);
  if (needsOnboarding && location.pathname !== "/onboarding") {
    return <Navigate to="/onboarding" replace />;
  }

  return children;
}
