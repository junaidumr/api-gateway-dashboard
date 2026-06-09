export const formatNumber = (num) => {
  if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
  if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
  return num?.toLocaleString() ?? '0';
};

export const formatDate = (date) => {
  return new Date(date).toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

export const formatPercent = (value) => `${value}%`;

export const getStatusColor = (code) => {
  if (code < 300) return 'text-emerald-600 bg-emerald-50';
  if (code < 400) return 'text-blue-600 bg-blue-50';
  if (code < 500) return 'text-amber-600 bg-amber-50';
  return 'text-red-600 bg-red-50';
};
