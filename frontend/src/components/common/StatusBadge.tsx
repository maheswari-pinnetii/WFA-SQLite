import React from 'react';
import { Chip } from '@mui/material';

export type StatusType =
  | 'active'
  | 'inactive'
  | 'present'
  | 'absent'
  | 'late'
  | 'on_leave'
  | 'wfh'
  | 'pending'
  | 'approved'
  | 'rejected'
  | 'completed'
  | 'in_progress';

export interface StatusBadgeProps {
  status: string | StatusType;
  label?: string;
  size?: 'small' | 'medium';
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, label, size = 'small' }) => {
  const normalizedStatus = String(status).toLowerCase().replace(/\s+/g, '_');
  const displayLabel = label || status.charAt(0).toUpperCase() + status.slice(1).replace(/_/g, ' ');

  let bg = 'rgba(100, 116, 139, 0.1)';
  let color = 'var(--text-muted)';

  switch (normalizedStatus) {
    case 'active':
    case 'present':
    case 'approved':
    case 'completed':
      bg = 'rgba(21, 128, 61, 0.12)';
      color = 'var(--stackly-status-success)';
      break;

    case 'late':
    case 'pending':
    case 'in_progress':
      bg = 'rgba(180, 83, 9, 0.12)';
      color = 'var(--stackly-status-warning)';
      break;

    case 'absent':
    case 'rejected':
    case 'inactive':
      bg = 'rgba(185, 28, 28, 0.12)';
      color = 'var(--stackly-status-error)';
      break;

    case 'on_leave':
    case 'wfh':
      bg = 'rgba(3, 105, 161, 0.12)';
      color = 'var(--stackly-status-info)';
      break;

    default:
      bg = 'rgba(100, 116, 139, 0.12)';
      color = 'var(--text-muted)';
      break;
  }

  return (
    <Chip
      size={size}
      label={displayLabel}
      sx={{
        fontWeight: 600,
        fontSize: size === 'small' ? '0.72rem' : '0.8125rem',
        height: size === 'small' ? 22 : 28,
        bgcolor: bg,
        color: color,
        border: 'none',
        borderRadius: '6px',
        px: 0.5,
      }}
    />
  );
};
