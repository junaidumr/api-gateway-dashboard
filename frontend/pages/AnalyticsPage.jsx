import { useEffect, useState } from 'react';
import Header from '../components/Header';
import EndpointChart from '../components/EndpointChart';
import TrafficChart from '../components/TrafficChart';
import LoadingSpinner from '../components/LoadingSpinner';
import { analyticsAPI } from '../services/api';
import { formatNumber } from '../utils/formatters';

export default function AnalyticsPage() {
  const [endpoints, setEndpoints] = useState([]);
  const [traffic, setTraffic] = useState([]);
  const [topUsers, setTopUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [endpointsRes, trafficRes, usersRes] = await Promise.all([
          analyticsAPI.getRequestsByEndpoint(),
          analyticsAPI.getDailyTraffic(),
          analyticsAPI.getTopUsers(),
        ]);

        setEndpoints(endpointsRes.data.data);
        setTraffic(trafficRes.data.data);
        setTopUsers(usersRes.data.data);
      } catch (err) {
        console.error('Failed to fetch analytics:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) return <LoadingSpinner />;

  return (
    <div>
      <Header
        title="API Usage Analytics"
        description="Detailed breakdown of API traffic patterns and user activity"
      />

      <div className="mb-8 grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="card">
          <h3 className="mb-4 text-sm font-semibold text-gray-900">Requests per Endpoint</h3>
          <EndpointChart data={endpoints} />
        </div>
        <div className="card">
          <h3 className="mb-4 text-sm font-semibold text-gray-900">Daily Traffic Trends</h3>
          <TrafficChart data={traffic} />
        </div>
      </div>

      <div className="card">
        <h3 className="mb-4 text-sm font-semibold text-gray-900">Top Active Users</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-surface-border">
                <th className="pb-3 font-medium text-gray-500">User</th>
                <th className="pb-3 font-medium text-gray-500">Email</th>
                <th className="pb-3 text-right font-medium text-gray-500">Requests</th>
              </tr>
            </thead>
            <tbody>
              {topUsers.map((user, i) => (
                <tr key={user.userId} className="border-b border-surface-border last:border-0">
                  <td className="py-3.5">
                    <div className="flex items-center gap-3">
                      <span className="flex h-8 w-8 items-center justify-center rounded-full bg-brand-50 text-xs font-semibold text-brand-700">
                        {i + 1}
                      </span>
                      <span className="font-medium text-gray-900">{user.name}</span>
                    </div>
                  </td>
                  <td className="py-3.5 text-gray-500">{user.email}</td>
                  <td className="py-3.5 text-right font-medium text-gray-900">
                    {formatNumber(user.requestCount)}
                  </td>
                </tr>
              ))}
              {topUsers.length === 0 && (
                <tr>
                  <td colSpan={3} className="py-8 text-center text-gray-500">
                    No user activity data
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
