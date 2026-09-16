export const EMERALD_CHART_COLORS = [
  '#10b981', // Emerald
  '#06b6d4', // Cyan
  '#8b5cf6', // Purple
  '#f59e0b', // Amber
  '#3b82f6', // Blue
  '#f43f5e', // Rose
  '#6366f1', // Indigo
  '#14b8a6', // Teal
];

export const formatDateIST = (dateStr: string): string => {
  if (!dateStr) return '';
  const dateObj = new Date(dateStr);
  if (isNaN(dateObj.getTime())) return dateStr;

  return dateObj.toLocaleDateString('en-IN', {
    timeZone: 'Asia/Kolkata',
    month: 'short',
    day: 'numeric',
  });
};

export const formatValue = (val: number | string, unit?: string): string => {
  if (val === undefined || val === null) return '—';
  if (typeof val === 'number') {
    const formatted = val.toLocaleString();
    return unit ? `${formatted} ${unit}` : formatted;
  }
  return `${val}`;
};
