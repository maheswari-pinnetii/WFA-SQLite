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
    fontFamily: "'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
    pageTitle: { fontSize: '28px', fontWeight: 700, lineHeight: '36px' },
    sectionTitle: { fontSize: '18px', fontWeight: 700, lineHeight: '26px' },
    cardTitle: { fontSize: '14px', fontWeight: 600 },
    body: { fontSize: '14px', fontWeight: 400, lineHeight: '21px' },
    secondary: { fontSize: '13px', fontWeight: 400, lineHeight: '19px' },
    tableHeader: { fontSize: '12px', fontWeight: 700 },
    tableCell: { fontSize: '13px', fontWeight: 500 },
    kpiValue: { fontSize: '28px', fontWeight: 800 },
    kpiLabel: { fontSize: '13px', fontWeight: 500 },
    button: { fontSize: '13px', fontWeight: 600 },
  }
};
