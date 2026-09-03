import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import TopNav from './TopNav';
import Toast from '../common/Toast';

/**
 * DashboardLayout wraps all authenticated pages.
 * Provides sidebar, top nav, and content area.
 */
export default function DashboardLayout() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="dashboard-layout">
      {/* Animated Background — 3 orbs + grid pattern */}
      <div className="bg-gradient-mesh">
        <div className="bg-orb-3" />
      </div>
      <div className="bg-grid-pattern" />

      <Sidebar
        collapsed={sidebarCollapsed}
        onToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
        mobileOpen={mobileMenuOpen}
        onMobileClose={() => setMobileMenuOpen(false)}
      />

      <div className={`dashboard-main ${sidebarCollapsed ? 'sidebar-collapsed' : ''}`}>
        <TopNav
          collapsed={sidebarCollapsed}
          onToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
          onMobileMenuToggle={() => setMobileMenuOpen(!mobileMenuOpen)}
        />

        <div className="dashboard-content">
          <Outlet />
        </div>
      </div>

      <Toast />
    </div>
  );
}
