import { useState } from 'react';
import Card from '../../components/shared/Card';
import StatusBadge from '../../components/shared/StatusBadge';

/**
 * Mock users data
 */
const MOCK_USERS = [
  {
    id: 'user_1',
    email: 'admin@igransense.ma',
    name: 'Admin User',
    role: 'admin',
    org: 'Platform',
    lastActive: '2026-03-01T10:30:00',
    status: 'active',
  },
  {
    id: 'user_2',
    email: 'enterprise@example.com',
    name: 'Enterprise Manager',
    role: 'enterprise',
    org: 'Fes Valley Cooperative',
    lastActive: '2026-02-28T15:45:00',
    status: 'active',
  },
  {
    id: 'user_3',
    email: 'farmer@example.com',
    name: 'Ahmed Bensaid',
    role: 'farmer',
    org: 'Atlas Agricultural Group',
    lastActive: '2026-02-28T09:20:00',
    status: 'active',
  },
  {
    id: 'user_4',
    email: 'local@example.com',
    name: 'Hassan El-Amri',
    role: 'local_farm',
    org: 'Coastal Farms Ltd',
    lastActive: '2026-02-25T14:00:00',
    status: 'inactive',
  },
];

const ROLE_BADGES = {
  admin: { bg: 'bg-purple-500/20', text: 'text-purple-400', label: 'Admin' },
  enterprise: { bg: 'bg-blue-500/20', text: 'text-blue-400', label: 'Enterprise' },
  farmer: { bg: 'bg-green-500/20', text: 'text-green-400', label: 'Farmer' },
  local_farm: { bg: 'bg-slate-500/20', text: 'text-slate-400', label: 'Local Farm' },
};

/**
 * UserManager - Admin page for managing users
 */
export default function UserManager() {
  const [users] = useState(MOCK_USERS);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.name.toLowerCase().includes(search.toLowerCase()) ||
                          user.email.toLowerCase().includes(search.toLowerCase());
    const matchesRole = roleFilter === 'all' || user.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  const formatLastActive = (dateStr) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now - date;
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    return date.toLocaleDateString();
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white">Users</h1>
          <p className="text-slate-400 text-sm mt-1">{users.length} total users</p>
        </div>
        <button className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg 
                           text-sm font-medium transition-colors flex items-center gap-2">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Add User
        </button>
      </div>

      {/* Filters */}
      <div className="flex gap-4 mb-6">
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search users..."
          className="flex-1 max-w-sm bg-slate-800 border border-slate-700 text-white rounded-lg 
                     px-4 py-2 text-sm focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
        />
        <select
          value={roleFilter}
          onChange={(e) => setRoleFilter(e.target.value)}
          className="bg-slate-800 border border-slate-700 text-white rounded-lg px-3 py-2 text-sm"
        >
          <option value="all">All Roles</option>
          <option value="admin">Admin</option>
          <option value="enterprise">Enterprise</option>
          <option value="farmer">Farmer</option>
          <option value="local_farm">Local Farm</option>
        </select>
      </div>

      {/* Table */}
      <Card className="overflow-hidden p-0">
        <table className="w-full">
          <thead className="bg-slate-800/50 border-b border-slate-700">
            <tr>
              <th className="text-left px-4 py-3 text-xs font-medium text-slate-400 uppercase tracking-wider">
                User
              </th>
              <th className="text-left px-4 py-3 text-xs font-medium text-slate-400 uppercase tracking-wider">
                Role
              </th>
              <th className="text-left px-4 py-3 text-xs font-medium text-slate-400 uppercase tracking-wider">
                Organization
              </th>
              <th className="text-left px-4 py-3 text-xs font-medium text-slate-400 uppercase tracking-wider">
                Last Active
              </th>
              <th className="text-left px-4 py-3 text-xs font-medium text-slate-400 uppercase tracking-wider">
                Status
              </th>
              <th className="text-right px-4 py-3 text-xs font-medium text-slate-400 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-700">
            {filteredUsers.map(user => {
              const roleBadge = ROLE_BADGES[user.role] || ROLE_BADGES.local_farm;
              return (
                <tr key={user.id} className="hover:bg-slate-800/30 transition-colors">
                  <td className="px-4 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center text-sm font-medium text-white">
                        {user.name.charAt(0)}
                      </div>
                      <div>
                        <p className="text-white font-medium">{user.name}</p>
                        <p className="text-slate-500 text-xs">{user.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-4">
                    <span className={`px-2 py-1 rounded text-xs font-medium ${roleBadge.bg} ${roleBadge.text}`}>
                      {roleBadge.label}
                    </span>
                  </td>
                  <td className="px-4 py-4 text-slate-300">{user.org}</td>
                  <td className="px-4 py-4 text-slate-400 text-sm">
                    {formatLastActive(user.lastActive)}
                  </td>
                  <td className="px-4 py-4">
                    <StatusBadge status={user.status === 'active' ? 'ok' : 'offline'} />
                  </td>
                  <td className="px-4 py-4 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <button className="text-slate-400 hover:text-white p-1.5 hover:bg-slate-700 rounded">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                                d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                        </svg>
                      </button>
                      <button className="text-slate-400 hover:text-red-400 p-1.5 hover:bg-slate-700 rounded">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </Card>
    </div>
  );
}
