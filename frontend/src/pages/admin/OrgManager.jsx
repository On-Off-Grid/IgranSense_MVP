import { useState } from 'react';
import Card from '../../components/shared/Card';
import StatusBadge from '../../components/shared/StatusBadge';

/**
 * Mock organizations data
 */
const MOCK_ORGS = [
  {
    id: 'org_1',
    name: 'Fes Valley Cooperative',
    farms: 3,
    users: 12,
    status: 'active',
    plan: 'enterprise',
    createdAt: '2025-01-15',
  },
  {
    id: 'org_2',
    name: 'Atlas Agricultural Group',
    farms: 8,
    users: 24,
    status: 'active',
    plan: 'enterprise',
    createdAt: '2025-02-01',
  },
  {
    id: 'org_3',
    name: 'Coastal Farms Ltd',
    farms: 2,
    users: 5,
    status: 'trial',
    plan: 'starter',
    createdAt: '2025-02-20',
  },
];

/**
 * OrgManager - Admin page for managing organizations
 */
export default function OrgManager() {
  const [orgs] = useState(MOCK_ORGS);
  const [search, setSearch] = useState('');

  const filteredOrgs = orgs.filter(org => 
    org.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white">Organizations</h1>
          <p className="text-slate-400 text-sm mt-1">{orgs.length} total organizations</p>
        </div>
        <button className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg 
                           text-sm font-medium transition-colors flex items-center gap-2">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Add Organization
        </button>
      </div>

      {/* Search */}
      <div className="mb-6">
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search organizations..."
          className="w-full max-w-sm bg-slate-800 border border-slate-700 text-white rounded-lg 
                     px-4 py-2 text-sm focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
        />
      </div>

      {/* Table */}
      <Card className="overflow-hidden p-0">
        <table className="w-full">
          <thead className="bg-slate-800/50 border-b border-slate-700">
            <tr>
              <th className="text-left px-4 py-3 text-xs font-medium text-slate-400 uppercase tracking-wider">
                Organization
              </th>
              <th className="text-left px-4 py-3 text-xs font-medium text-slate-400 uppercase tracking-wider">
                Farms
              </th>
              <th className="text-left px-4 py-3 text-xs font-medium text-slate-400 uppercase tracking-wider">
                Users
              </th>
              <th className="text-left px-4 py-3 text-xs font-medium text-slate-400 uppercase tracking-wider">
                Plan
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
            {filteredOrgs.map(org => (
              <tr key={org.id} className="hover:bg-slate-800/30 transition-colors">
                <td className="px-4 py-4">
                  <div>
                    <p className="text-white font-medium">{org.name}</p>
                    <p className="text-slate-500 text-xs">Created {org.createdAt}</p>
                  </div>
                </td>
                <td className="px-4 py-4 text-slate-300">{org.farms}</td>
                <td className="px-4 py-4 text-slate-300">{org.users}</td>
                <td className="px-4 py-4">
                  <span className={`px-2 py-1 rounded text-xs font-medium ${
                    org.plan === 'enterprise' 
                      ? 'bg-blue-500/20 text-blue-400' 
                      : 'bg-slate-500/20 text-slate-400'
                  }`}>
                    {org.plan}
                  </span>
                </td>
                <td className="px-4 py-4">
                  <StatusBadge status={org.status === 'active' ? 'ok' : 'warning'} />
                </td>
                <td className="px-4 py-4 text-right">
                  <button className="text-slate-400 hover:text-white p-1">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                            d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
                    </svg>
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
    </div>
  );
}
