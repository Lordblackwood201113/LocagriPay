import { Routes, Route } from "react-router-dom";
import { NotFoundPage } from "./pages/errors";
import SignInPage from "./pages/auth/sign-in";
import SignUpPage from "./pages/auth/sign-up";
import { ProtectedRoute } from "./components/layout/protected-route";
import { AppLayout } from "./components/layout/app-layout";
import SuppliersPage from "./pages/technician/suppliers";
import CooperativeDetailPage from "./pages/technician/cooperative-detail";
import CampaignsPage from "./pages/admin/campaigns";
import NewCollectionPage from "./pages/technician/new-collection";
import CollectionDetailPage from "./pages/technician/collection-detail";
import ProducerDetailPage from "./pages/technician/producer-detail";
import ValidationQueuePage from "./pages/agent/validation-queue";
import ValidateCollectionPage from "./pages/agent/validate-collection";
import MyDecisionsPage from "./pages/agent/my-decisions";
import DirectionValidationQueuePage from "./pages/direction/direction-validation-queue";
import ValidateDecisionPage from "./pages/direction/validate-decision";
import PaymentsPage from "./pages/admin/payments";
import UsersPage from "./pages/admin/users";
import AuditPage from "./pages/admin/audit";
import HomePage from "./pages/home";
import DirectionDashboard from "./pages/direction/dashboard";
import ReportsPage from "./pages/direction/reports";


function App() {
  return (
    <Routes>
      {/* Public */}
      <Route path="/sign-in/*" element={<SignInPage />} />
      <Route path="/sign-up/*" element={<SignUpPage />} />

      {/* Protected shell */}
      <Route
        element={
          <ProtectedRoute>
            <AppLayout />
          </ProtectedRoute>
        }
      >
        {/* Technicien */}
        <Route index element={<HomePage />} />
        <Route path="collections/new" element={<NewCollectionPage />} />
        <Route path="collections/:id" element={<CollectionDetailPage />} />
        <Route path="suppliers" element={<SuppliersPage />} />
        <Route path="suppliers/producer/:id" element={<ProducerDetailPage />} />
        <Route path="suppliers/cooperative/:id" element={<CooperativeDetailPage />} />

        {/* Agent Bureau */}
        <Route path="validation" element={<ValidationQueuePage />} />
        <Route path="validation/:id" element={<ValidateCollectionPage />} />
        <Route path="my-decisions" element={<MyDecisionsPage />} />

        {/* Direction */}
        <Route path="direction/validation" element={<DirectionValidationQueuePage />} />
        <Route path="direction/validation/:id" element={<ValidateDecisionPage />} />
        <Route path="dashboard" element={<DirectionDashboard />} />
        <Route path="reports" element={<ReportsPage />} />

        {/* Admin */}
        <Route path="admin/users" element={<UsersPage />} />
        <Route path="admin/campaigns" element={<CampaignsPage />} />
        <Route path="admin/payments" element={<PaymentsPage />} />
        <Route path="admin/audit" element={<AuditPage />} />
      </Route>

      {/* Catch-all */}
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}

export default App;
