import { useEffect, useState } from 'react';
import { Key, Plus, Ban, Copy, Check } from 'lucide-react';
import Header from '../components/Header';
import LoadingSpinner from '../components/LoadingSpinner';
import { apiKeyAPI, usersAPI } from '../services/api';
import { formatDate } from '../utils/formatters';

export default function ApiKeysPage() {
  const [keys, setKeys] = useState([]);
  const [users, setUsers] = useState([]);
  const [stats, setStats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState('');
  const [generating, setGenerating] = useState(false);
  const [copiedKey, setCopiedKey] = useState(null);

  const fetchData = async () => {
    try {
      const [keysRes, usersRes, statsRes] = await Promise.all([
        apiKeyAPI.getAll(),
        usersAPI.getAll(),
        apiKeyAPI.getStats(),
      ]);
      setKeys(keysRes.data.data);
      setUsers(usersRes.data.data.filter((u) => u.role === 'user'));
      setStats(statsRes.data.data);
    } catch (err) {
      console.error('Failed to fetch API keys:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleGenerate = async () => {
    if (!selectedUser) return;
    setGenerating(true);
    try {
      await apiKeyAPI.generate(selectedUser);
      setSelectedUser('');
      await fetchData();
    } catch (err) {
      console.error('Failed to generate key:', err);
    } finally {
      setGenerating(false);
    }
  };

  const handleRevoke = async (id) => {
    try {
      await apiKeyAPI.revoke(id);
      await fetchData();
    } catch (err) {
      console.error('Failed to revoke key:', err);
    }
  };

  const copyToClipboard = (key) => {
    navigator.clipboard.writeText(key);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const activeCount = stats.find((s) => s._id === 'active')?.count || 0;
  const revokedCount = stats.find((s) => s._id === 'revoked')?.count || 0;
  const totalUsage = stats.reduce((sum, s) => sum + (s.totalUsage || 0), 0);

  if (loading) return <LoadingSpinner />;

  return (
    <div>
      <Header
        title="API Key Management"
        description="Generate, revoke, and monitor API keys for external clients"
      />

      <div className="mb-8 grid grid-cols-1 gap-5 sm:grid-cols-3">
        <div className="card">
          <p className="text-sm font-medium text-gray-500">Active Keys</p>
          <p className="mt-2 text-3xl font-semibold text-emerald-600">{activeCount}</p>
        </div>
        <div className="card">
          <p className="text-sm font-medium text-gray-500">Revoked Keys</p>
          <p className="mt-2 text-3xl font-semibold text-red-600">{revokedCount}</p>
        </div>
        <div className="card">
          <p className="text-sm font-medium text-gray-500">Total API Calls</p>
          <p className="mt-2 text-3xl font-semibold text-gray-900">{totalUsage}</p>
        </div>
      </div>

      <div className="card mb-8">
        <h3 className="mb-4 text-sm font-semibold text-gray-900">Generate New API Key</h3>
        <div className="flex flex-col gap-3 sm:flex-row">
          <select
            value={selectedUser}
            onChange={(e) => setSelectedUser(e.target.value)}
            className="input-field flex-1"
          >
            <option value="">Select a user...</option>
            {users.map((user) => (
              <option key={user._id} value={user._id}>
                {user.name} ({user.email})
              </option>
            ))}
          </select>
          <button
            onClick={handleGenerate}
            disabled={!selectedUser || generating}
            className="btn-primary shrink-0"
          >
            <Plus size={16} className="mr-2" />
            {generating ? 'Generating...' : 'Generate Key'}
          </button>
        </div>
      </div>

      <div className="card">
        <h3 className="mb-4 text-sm font-semibold text-gray-900">All API Keys</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-surface-border">
                <th className="pb-3 font-medium text-gray-500">Key</th>
                <th className="pb-3 font-medium text-gray-500">User</th>
                <th className="pb-3 font-medium text-gray-500">Status</th>
                <th className="pb-3 font-medium text-gray-500">Usage</th>
                <th className="pb-3 font-medium text-gray-500">Created</th>
                <th className="pb-3 font-medium text-gray-500">Actions</th>
              </tr>
            </thead>
            <tbody>
              {keys.map((apiKey) => (
                <tr key={apiKey._id} className="border-b border-surface-border last:border-0">
                  <td className="py-3.5">
                    <div className="flex items-center gap-2">
                      <Key size={14} className="text-gray-400" />
                      <code className="rounded bg-gray-50 px-2 py-0.5 text-xs text-gray-700">
                        {apiKey.key.slice(0, 16)}...
                      </code>
                      <button
                        onClick={() => copyToClipboard(apiKey.key)}
                        className="text-gray-400 hover:text-gray-600"
                        title="Copy key"
                      >
                        {copiedKey === apiKey.key ? <Check size={14} /> : <Copy size={14} />}
                      </button>
                    </div>
                  </td>
                  <td className="py-3.5">
                    <div>
                      <p className="font-medium text-gray-900">{apiKey.userId?.name}</p>
                      <p className="text-xs text-gray-500">{apiKey.userId?.email}</p>
                    </div>
                  </td>
                  <td className="py-3.5">
                    <span
                      className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${
                        apiKey.status === 'active'
                          ? 'bg-emerald-50 text-emerald-700'
                          : 'bg-red-50 text-red-700'
                      }`}
                    >
                      {apiKey.status}
                    </span>
                  </td>
                  <td className="py-3.5 text-gray-700">{apiKey.usageCount}</td>
                  <td className="py-3.5 text-gray-500">{formatDate(apiKey.createdAt)}</td>
                  <td className="py-3.5">
                    {apiKey.status === 'active' && (
                      <button
                        onClick={() => handleRevoke(apiKey._id)}
                        className="inline-flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-xs font-medium text-red-600 transition-colors hover:bg-red-50"
                      >
                        <Ban size={14} />
                        Revoke
                      </button>
                    )}
                  </td>
                </tr>
              ))}
              {keys.length === 0 && (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-gray-500">
                    No API keys found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
