import { useEffect, useState } from 'react';
import { Activity, Users, AlertTriangle, Zap } from 'lucide-react';
import Header from '../components/Header';
import MetricCard from '../components/MetricCard';
import EndpointChart from '../components/EndpointChart';
import TrafficChart from '../components/TrafficChart';
import StatusChart from '../components/StatusChart';
import LoadingSpinner from '../components/LoadingSpinner';
import { analyticsAPI } from '../services/api';
import { formatNumber, formatPercent } from '../utils/formatters';

export default function OverviewPage() {
  const [overview, setOverview] = useState(null);
  const [endpoints, setEndpoints] = useState([]);
  const [traffic, setTraffic] = useState([]);
  const [statusDist, setStatusDist] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [overviewRes, endpointsRes, trafficRes, statusRes] = await Promise.all([
          analyticsAPI.getOverview(),
          analyticsAPI.getRequestsByEndpoint(),
          analyticsAPI.getDailyTraffic(),
          analyticsAPI.getStatusDistribution(),
        ]);

        setOverview(overviewRes.data.data);
        setEndpoints(endpointsRes.data.data);
        setTraffic(trafficRes.data.data);
        setStatusDist(statusRes.data.data);
      } catch (err) {
        console.error('Failed to fetch overview data:', err);
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
        title="Overview"
        description="Real-time metrics and performance insights for your API gateway"
      />

      <div className="mb-8 grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-4">
        <MetricCard
          title="Total Requests"
          value={formatNumber(overview?.totalRequests)}
          icon={Activity}
        />
        <MetricCard
          title="Active Users"
          value={formatNumber(overview?.activeUsers)}
          subtitle="Last 24 hours"
          icon={Users}
        />
        <MetricCard
          title="Error Rate"
          value={formatPercent(overview?.errorRate)}
          icon={AlertTriangle}
        />
        <MetricCard
          title="Requests / Min"
          value={formatNumber(overview?.requestsPerMinute)}
          subtitle={`${formatNumber(overview?.requestsPerHour)} / hour`}
          icon={Zap}
        />
      </div>

      <div className="mb-8 grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="card lg:col-span-2">
          <h3 className="mb-4 text-sm font-semibold text-gray-900">Daily Traffic (30 days)</h3>
          <TrafficChart data={traffic} />
        </div>
        <div className="card">
          <h3 className="mb-4 text-sm font-semibold text-gray-900">Status Distribution</h3>
          <StatusChart data={statusDist} />
        </div>
      </div>

      <div className="card">
        <h3 className="mb-4 text-sm font-semibold text-gray-900">Requests by Endpoint</h3>
        <EndpointChart data={endpoints} />
      </div>
    </div>
  );
}
