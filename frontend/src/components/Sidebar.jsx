import { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getNavItemsForRole } from '../utils/rolePermissions';

/**
 * Collapsible sidebar navigation — icon-only by default, expands on hover.
 * On mobile (<md), renders as a slide-out drawer overlay.
 *
 * Props:
 *  - isOnline, edgeConnected, lastSync  — edge connectivity state
 *  - mobileOpen  — whether the mobile drawer is open
 *  - onMobileClose — callback to close the mobile drawer
 */
export default function Sidebar({ isOnline, edgeConnected, lastSync, mobileOpen, onMobileClose }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const navItems = user ? getNavItemsForRole(user.role) : [];

  /* ---- edge status derived values ---- */
  let statusText, statusColor, dotColor, showLastSync;
  if (!edgeConnected) {
    statusText = 'Edge Disconnected';
    statusColor = 'text-red-400';
    dotColor = 'bg-red-500';
    showLastSync = true;
  } else if (!isOnline) {
    statusText = 'Edge Active (Offline)';
    statusColor = 'text-orange-400';
    dotColor = 'bg-orange-500 animate-pulse';
    showLastSync = false;
  } else {
    statusText = 'Edge Active';
    statusColor = 'text-slate-400';
    dotColor = 'bg-green-500 animate-pulse';
    showLastSync = false;
  }

  /* ---- role badge ---- */
  const roleBadgeClasses = {
    admin: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
    enterprise: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
    farmer: 'bg-green-500/20 text-green-400 border-green-500/30',
    local_farm: 'bg-slate-500/20 text-slate-400 border-slate-500/30',
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
    onMobileClose?.();
  };

  const handleNavClick = () => {
    // Close mobile drawer when a link is tapped
    onMobileClose?.();
  };

  /* ---- shared link styling ---- */
  const linkClass = ({ isActive }) =>
    `flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors whitespace-nowrap ${
      isActive
        ? 'bg-green-600 text-white'
        : 'text-slate-300 hover:bg-slate-700 hover:text-white'
    }`;

  /* ---- Sidebar inner content (shared between desktop & mobile) ---- */
  const sidebarContent = (expanded) => (
    <div className="flex flex-col h-full">
      {/* Nav links */}
      <nav className="flex-1 flex flex-col gap-1 px-2 pt-4 overflow-y-auto">
        {navItems.map(item => (
          <NavLink
            key={item.path}
            to={item.path}
            className={linkClass}
            onClick={handleNavClick}
            title={!expanded ? item.label : undefined}
          >
            <span className="text-lg flex-shrink-0 w-6 text-center">{item.icon}</span>
            <span
              className={`text-sm font-medium transition-all duration-200 ${
                expanded ? 'opacity-100 w-auto' : 'opacity-0 w-0 overflow-hidden'
              }`}
            >
              {item.label}
            </span>
          </NavLink>
        ))}
      </nav>

      {/* Bottom section: edge status + user + logout */}
      <div className="border-t border-slate-700 px-2 py-3 flex flex-col gap-3">
        {/* Edge status */}
        <div className="flex items-center gap-3 px-3 py-2" title={!expanded ? statusText : undefined}>
          <span className={`w-2.5 h-2.5 rounded-full flex-shrink-0 ${dotColor}`} />
          <div
            className={`flex flex-col transition-all duration-200 ${
              expanded ? 'opacity-100 w-auto' : 'opacity-0 w-0 overflow-hidden'
            }`}
          >
            <span className={`text-xs ${statusColor} whitespace-nowrap`}>{statusText}</span>
            {showLastSync && lastSync && (
              <span className="text-[10px] text-slate-500 whitespace-nowrap">
                Last sync: {lastSync.toLocaleTimeString()}
              </span>
            )}
          </div>
        </div>

        {/* User info */}
        {user && (
          <div className="flex items-center gap-3 px-3 py-2" title={!expanded ? user.email : undefined}>
            {/* Avatar circle */}
            <span className="w-7 h-7 rounded-full bg-slate-600 flex items-center justify-center text-xs text-white flex-shrink-0 uppercase">
              {user.email?.[0] || 'U'}
            </span>
            <div
              className={`flex flex-col min-w-0 transition-all duration-200 ${
                expanded ? 'opacity-100 w-auto' : 'opacity-0 w-0 overflow-hidden'
              }`}
            >
              <span className="text-sm text-white truncate">{user.email}</span>
              <span className={`text-[10px] px-1.5 py-0.5 rounded border w-fit ${roleBadgeClasses[user.role] || roleBadgeClasses.local_farm}`}>
                {user.role.replace('_', ' ')}
              </span>
            </div>
          </div>
        )}

        {/* Logout */}
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-slate-400 hover:bg-red-500/10 hover:text-red-400 transition-colors w-full"
          title={!expanded ? 'Sign out' : undefined}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
            stroke="currentColor"
            className="w-5 h-5 flex-shrink-0"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15M12 9l-3 3m0 0l3 3m-3-3h12.75"
            />
          </svg>
          <span
            className={`text-sm font-medium transition-all duration-200 whitespace-nowrap ${
              expanded ? 'opacity-100 w-auto' : 'opacity-0 w-0 overflow-hidden'
            }`}
          >
            Sign out
          </span>
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* ===== Desktop sidebar (hidden on mobile) ===== */}
      <aside
        className="hidden md:flex flex-col fixed left-0 top-14 z-40
                   h-[calc(100vh-3.5rem)] bg-slate-800 border-r border-slate-700
                   w-16 hover:w-60 transition-all duration-300 group overflow-hidden"
      >
        {/* We use a CSS‐only "expanded" approach via group-hover.
            But the inner content needs to know — we use the group class
            and style children with group-hover variants.
            However, since we need JS‐level expanded for title attrs,
            we wrap in a hover‐tracking div. */}
        <HoverExpander>{(expanded) => sidebarContent(expanded)}</HoverExpander>
      </aside>

      {/* ===== Mobile drawer overlay (visible only on small screens when open) ===== */}
      {mobileOpen && (
        <div className="md:hidden fixed inset-0 z-50 flex">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={onMobileClose}
          />
          {/* Drawer panel */}
          <aside className="relative w-64 bg-slate-800 border-r border-slate-700 h-full flex flex-col animate-slide-in-left">
            {sidebarContent(true)}
          </aside>
        </div>
      )}
    </>
  );
}

/**
 * Tiny helper that tracks mouse-enter / mouse-leave on its wrapper
 * and passes an `expanded` boolean to its render-children function.
 */
function HoverExpander({ children }) {
  const [expanded, setExpanded] = useState(false);
  return (
    <div
      className="flex flex-col h-full"
      onMouseEnter={() => setExpanded(true)}
      onMouseLeave={() => setExpanded(false)}
    >
      {children(expanded)}
    </div>
  );
}
