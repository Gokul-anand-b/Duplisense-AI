import { useAuth } from '../../hooks/useAuth';
import DeveloperDashboard from './DeveloperDashboard';
import ManagerDashboard from './ManagerDashboard';
import AdminDashboardView from './AdminDashboardView';

/**
 * Role-Based Dashboard View Router
 * Automatically renders the exact dashboard tailored to the authenticated user's role:
 * - 'admin'     -> Admin Governance & FAISS Vector Control Center
 * - 'manager'   -> Engineering Management & ROI Approval Hub
 * - 'developer' -> Developer Workspace & Reusable Asset Hub
 */
export default function Dashboard() {
  const { user } = useAuth();

  if (user?.role === 'admin') {
    return <AdminDashboardView user={user} />;
  }

  if (user?.role === 'manager') {
    return <ManagerDashboard user={user} />;
  }

  // Default to developer workspace
  return <DeveloperDashboard user={user} />;
}
