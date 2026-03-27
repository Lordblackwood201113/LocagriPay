import { Navigate } from "react-router-dom";
import { useCurrentUser } from "@/hooks/use-current-user";
import TechnicianDashboard from "./technician/dashboard";

export default function HomePage() {
  const { role, isLoading } = useCurrentUser();

  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <span className="animate-spin h-8 w-8 border-2 border-current border-t-transparent rounded-full inline-block" />
      </div>
    );
  }

  switch (role) {
    case "technicien":
    case "agent_bureau":
      return <TechnicianDashboard />;
    case "direction":
      return <Navigate to="/dashboard" replace />;
    case "admin":
      return <Navigate to="/admin/campaigns" replace />;
    default:
      // No role yet (first sync) — show technicien dashboard as default
      return <TechnicianDashboard />;
  }
}
