import { useEffect, useState, useCallback } from 'react';
import { Search, Filter } from 'lucide-react';
import Header from '../components/Header';
import LoadingSpinner from '../components/LoadingSpinner';
import { logsAPI } from '../services/api';
import { formatDate, getStatusColor } from '../utils/formatters';

export default function LogsPage() {
  const [logs, setLogs] = useState([]);
  const [pagination, setPagination] = useState({ total: 0, page: 1, pages: 1 });
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    endpoint: '',
    userId: '',
    statusCode: '',
    startDate: '',
    endDate: '',
    page: 1,
  });

  const fetchLogs = useCallback(async () => {
    setLoading(true);
    try {
      const params = Object.fromEntries(
        Object.entries(filters).filter(([, v]) => v !== '' && v !== undefined)
      );
      const { data } = await logsAPI.getLogs(params);
      setLogs(data.data.logs);
      setPagination(data.data.pagination);
    } catch (err) {
      console.error('Failed to fetch logs:', err);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    fetchLogs();
  }, [fetchLogs]);

  const handleFilterChange = (key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value, page: 1 }));
  };

  const handlePageChange = (page) => {
    setFilters((prev) => ({ ...prev, page }));
  };

  return (
    <div>
      <Header
        title="Request Logs"
        description="Browse and filter all API gateway request logs"
      />

      <div className="card mb-6">
        <div className="mb-3 flex items-center gap-2 text-sm font-medium text-gray-700">
          <Filter size={16} />
          Filters
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
          <div>
            <label className="mb-1 block text-xs text-gray-500">Endpoint</label>
            <input
              type="text"
              placeholder="/api/users"
              value={filters.endpoint}
              onChange={(e) => handleFilterChange('endpoint', e.target.value)}
              className="input-field"
            />
          </div>
          <div>
            <label className="mb-1 block text-xs text-gray-500">Status Code</label>
            <select
              value={filters.statusCode}
              onChange={(e) => handleFilterChange('statusCode', e.target.value)}
              className="input-field"
            >
              <option value="">All</option>
              <option value="200">200</option>
              <option value="201">201</option>
              <option value="400">400</option>
              <option value="401">401</option>
              <option value="403">403</option>
              <option value="404">404</option>
              <option value="500">500</option>
            </select>
          </div>
          <div>
            <label className="mb-1 block text-xs text-gray-500">Start Date</label>
            <input
              type="date"
              value={filters.startDate}
              onChange={(e) => handleFilterChange('startDate', e.target.value)}
              className="input-field"
            />
          </div>
          <div>
            <label className="mb-1 block text-xs text-gray-500">End Date</label>
            <input
              type="date"
              value={filters.endDate}
              onChange={(e) => handleFilterChange('endDate', e.target.value)}
              className="input-field"
            />
          </div>
          <div className="flex items-end">
            <button onClick={fetchLogs} className="btn-primary w-full">
              <Search size={16} className="mr-2" />
              Search
            </button>
          </div>
        </div>
      </div>

      <div className="card">
        {loading ? (
          <LoadingSpinner />
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-surface-border">
                    <th className="pb-3 font-medium text-gray-500">Endpoint</th>
                    <th className="pb-3 font-medium text-gray-500">Method</th>
                    <th className="pb-3 font-medium text-gray-500">User</th>
                    <th className="pb-3 font-medium text-gray-500">Status</th>
                    <th className="pb-3 font-medium text-gray-500">Response Time</th>
                    <th className="pb-3 font-medium text-gray-500">Timestamp</th>
                  </tr>
                </thead>
                <tbody>
                  {logs.map((log) => (
                    <tr key={log._id} className="border-b border-surface-border last:border-0">
                      <td className="py-3.5">
                        <code className="text-xs text-gray-700">{log.endpoint}</code>
                      </td>
                      <td className="py-3.5">
                        <span className="rounded bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-700">
                          {log.method}
                        </span>
                      </td>
                      <td className="py-3.5">
                        {log.userId ? (
                          <div>
                            <p className="text-gray-900">{log.userId.name}</p>
                            <p className="text-xs text-gray-500">{log.userId.email}</p>
                          </div>
                        ) : (
                          <span className="text-gray-400">—</span>
                        )}
                      </td>
                      <td className="py-3.5">
                        <span
                          className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${getStatusColor(log.statusCode)}`}
                        >
                          {log.statusCode}
                        </span>
                      </td>
                      <td className="py-3.5 text-gray-700">{log.responseTime}ms</td>
                      <td className="py-3.5 text-gray-500">{formatDate(log.timestamp)}</td>
                    </tr>
                  ))}
                  {logs.length === 0 && (
                    <tr>
                      <td colSpan={6} className="py-8 text-center text-gray-500">
                        No logs found matching your filters
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {pagination.pages > 1 && (
              <div className="mt-6 flex items-center justify-between border-t border-surface-border pt-4">
                <p className="text-sm text-gray-500">
                  Showing page {pagination.page} of {pagination.pages} ({pagination.total} total)
                </p>
                <div className="flex gap-2">
                  <button
                    onClick={() => handlePageChange(pagination.page - 1)}
                    disabled={pagination.page <= 1}
                    className="btn-secondary"
                  >
                    Previous
                  </button>
                  <button
                    onClick={() => handlePageChange(pagination.page + 1)}
                    disabled={pagination.page >= pagination.pages}
                    className="btn-secondary"
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
