export const tokens = {
  background: {
    page: 'var(--bg-primary)',
    surface: 'var(--bg-secondary)',
    card: 'var(--bg-card)',
    elevated: 'var(--bg-tertiary)',
    hover: 'var(--bg-hover)',
  },
  text: {
    primary: 'var(--text-primary)',
    secondary: 'var(--text-secondary)',
    tertiary: 'var(--text-muted)',
    disabled: 'var(--stackly-text-disabled)',
  },
  border: {
    default: 'var(--border-color)',
    strong: 'var(--stackly-border-strong)',
    focus: 'var(--stackly-border-focus)',
  },
  brand: {
    primary: 'var(--stackly-brand-primary)',
    hover: 'var(--stackly-brand-hover)',
    active: 'var(--stackly-brand-active)',
    subtle: 'var(--stackly-brand-subtle)',
  },
  status: {
    success: 'var(--status-success)',
    warning: 'var(--status-warning)',
    error: 'var(--status-error)',
    info: 'var(--status-info)',
    pending: 'var(--status-pending)',
  },
  typography: {
    fontFamily: '"Inter", "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
    pageTitle: { fontSize: '24px', fontWeight: 600, lineHeight: '32px' },
    sectionTitle: { fontSize: '18px', fontWeight: 600, lineHeight: '26px' },
    cardTitle: { fontSize: '15px', fontWeight: 600 },
    body: { fontSize: '14px', fontWeight: 400, lineHeight: '20px' },
    secondary: { fontSize: '13px', fontWeight: 400, lineHeight: '18px' },
    tableHeader: { fontSize: '12px', fontWeight: 600 },
    tableCell: { fontSize: '13px', fontWeight: 400 },
    kpiValue: { fontSize: '28px', fontWeight: 600 },
    kpiLabel: { fontSize: '13px', fontWeight: 500 },
    button: { fontSize: '14px', fontWeight: 500 },
  }
};
