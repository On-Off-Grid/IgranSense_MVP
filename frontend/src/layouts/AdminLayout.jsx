import { NavLink, Routes, Route, Navigate } from 'react-router-dom';
import OrgManager from '../pages/admin/OrgManager';
import UserManager from '../pages/admin/UserManager';
import Diagnostics from '../pages/admin/Diagnostics';

/**
 * AdminLayout - Layout wrapper for admin pages
 * Includes secondary navigation sidebar
 */
export default function AdminLayout() {
  const linkClass = ({ isActive }) =>
    `flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
      isActive
        ? 'bg-purple-600 text-white'
        : 'text-slate-300 hover:bg-slate-700'
    }`;

  return (
    <div className="flex gap-6 -m-6">
      {/* Sidebar */}
      <aside className="w-64 bg-slate-800/50 border-r border-slate-700 min-h-[calc(100vh-80px)] p-4">
        <div className="mb-6">
          <h2 className="text-lg font-semibold text-white flex items-center gap-2">
            <span className="text-2xl">🛡️</span>
            Admin Panel
          </h2>
          <p className="text-xs text-slate-400 mt-1">Platform management</p>
        </div>

        <nav className="space-y-1">
          <NavLink to="/admin/organizations" className={linkClass}>
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                    d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
            Organizations
          </NavLink>

          <NavLink to="/admin/users" className={linkClass}>
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                    d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
            </svg>
            Users
          </NavLink>

          <NavLink to="/admin/diagnostics" className={linkClass}>
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                    d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
            Diagnostics
          </NavLink>
        </nav>

        <div className="mt-8 pt-6 border-t border-slate-700">
          <a 
            href="/" 
            className="flex items-center gap-2 text-sm text-slate-400 hover:text-white transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back to Dashboard
          </a>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-6">
        <Routes>
          <Route index element={<Navigate to="/admin/organizations" replace />} />
          <Route path="organizations" element={<OrgManager />} />
          <Route path="users" element={<UserManager />} />
          <Route path="diagnostics" element={<Diagnostics />} />
        </Routes>
      </main>
    </div>
  );
}
