import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

export default function TrafficChart({ data }) {
  if (!data?.length) {
    return (
      <div className="flex h-64 items-center justify-center text-sm text-gray-500">
        No traffic data available
      </div>
    );
  }

  const chartData = data.map((item) => ({
    date: item.date.slice(5),
    requests: item.count,
    errors: item.errors,
  }));

  return (
    <ResponsiveContainer width="100%" height={300}>
      <AreaChart data={chartData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
        <defs>
          <linearGradient id="colorRequests" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#4c6ef5" stopOpacity={0.15} />
            <stop offset="95%" stopColor="#4c6ef5" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
        <XAxis dataKey="date" tick={{ fontSize: 12 }} stroke="#9ca3af" />
        <YAxis tick={{ fontSize: 12 }} stroke="#9ca3af" />
        <Tooltip
          contentStyle={{
            borderRadius: '8px',
            border: '1px solid #e9ecef',
            boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
          }}
        />
        <Area
          type="monotone"
          dataKey="requests"
          stroke="#4c6ef5"
          strokeWidth={2}
          fill="url(#colorRequests)"
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}
