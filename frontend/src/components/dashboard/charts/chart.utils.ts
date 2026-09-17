export const EMERALD_CHART_COLORS = [
  '#0F766E', // Primary Stackly Emerald
  '#64748B', // Slate 500
  '#94A3B8', // Slate 400
  '#14B8A6', // Primary Light
  '#475569', // Slate 600
  '#334155', // Slate 700
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
