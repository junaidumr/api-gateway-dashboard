import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';

const COLORS = {
  '2xx': '#10b981',
  '3xx': '#3b82f6',
  '4xx': '#f59e0b',
  '5xx': '#ef4444',
};

export default function StatusChart({ data }) {
  if (!data?.length) {
    return (
      <div className="flex h-64 items-center justify-center text-sm text-gray-500">
        No status data available
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={280}>
      <PieChart>
        <Pie
          data={data}
          cx="50%"
          cy="50%"
          innerRadius={60}
          outerRadius={90}
          paddingAngle={4}
          dataKey="count"
          nameKey="status"
        >
          {data.map((entry) => (
            <Cell key={entry.status} fill={COLORS[entry.status] || '#9ca3af'} />
          ))}
        </Pie>
        <Tooltip
          contentStyle={{
            borderRadius: '8px',
            border: '1px solid #e9ecef',
            boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
          }}
        />
        <Legend />
      </PieChart>
    </ResponsiveContainer>
  );
}
