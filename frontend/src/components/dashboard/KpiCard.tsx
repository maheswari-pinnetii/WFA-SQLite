import React, { useState } from 'react';
import { Box, Typography, IconButton, Menu, MenuItem, Chip } from '@mui/material';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import TrendingDownIcon from '@mui/icons-material/TrendingDown';
import RemoveIcon from '@mui/icons-material/Remove';
import Skeleton from '@mui/material/Skeleton';

export interface KpiCardProps {
  title: string;
  value: string | number;
  meta?: string;
  icon: React.ReactNode;
  trend?: {
    value: string;
    direction?: 'up' | 'down' | 'neutral';
  };
  loading?: boolean;
  onMenuClick?: (event?: React.MouseEvent<HTMLElement>) => void;
  menuItems?: Array<{ label: string; action: () => void }>;
}

export function KpiCard({
  title,
  value,
  meta,
  icon,
  trend,
  loading = false,
  onMenuClick,
  menuItems,
}: KpiCardProps) {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const isMenuOpen = Boolean(anchorEl);

  const handleOpenMenu = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
    if (onMenuClick) {
      onMenuClick(event);
    }
  };

  const handleCloseMenu = () => {
    setAnchorEl(null);
  };

  if (loading) {
    return (
      <Box
        sx={{
          p: 3,
          borderRadius: '16px',
          bgcolor: 'var(--bg-card)',
          border: '1px solid var(--border-color)',
          boxShadow: 'var(--shadow-sm)',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          minHeight: 160,
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
          <Skeleton variant="circular" width={42} height={42} />
          <Skeleton variant="rounded" width={60} height={24} />
        </Box>
        <Box>
          <Skeleton variant="text" width="50%" height={38} />
          <Skeleton variant="text" width="70%" height={20} />
        </Box>
      </Box>
    );
  }

  const isPositiveTrend = !trend?.direction || trend.direction === 'up';
  const isNegativeTrend = trend?.direction === 'down';

  return (
    <Box
      className="kpi-card-wrapper transition-all duration-200"
      sx={{
        position: 'relative',
        width: '100%',
        height: '100%',
        bgcolor: 'var(--bg-card)',
        borderRadius: '16px',
        border: '1px solid var(--border-color)',
        boxShadow: 'var(--shadow-sm)',
        p: 2.75,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        minHeight: 160,
        '&:hover': {
          boxShadow: 'var(--shadow-md)',
          borderColor: 'var(--stackly-border-strong)',
          transform: 'translateY(-1px)',
        },
      }}
    >
      {/* Top row: Icon Badge & Trend/Menu */}
      <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', mb: 2 }}>
        {/* Human Icon Shell */}
        <Box
          sx={{
            width: 44,
            height: 44,
            borderRadius: '12px',
            bgcolor: 'var(--stackly-brand-subtle)',
            color: 'var(--stackly-brand-primary)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
            '& svg': {
              width: 22,
              height: 22,
            },
          }}
        >
          {icon}
        </Box>

        {/* Action Menu or Trend */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          {trend && (
            <Chip
              size="small"
              icon={
                isPositiveTrend ? (
                  <TrendingUpIcon style={{ fontSize: 14, color: 'inherit' }} />
                ) : isNegativeTrend ? (
                  <TrendingDownIcon style={{ fontSize: 14, color: 'inherit' }} />
                ) : (
                  <RemoveIcon style={{ fontSize: 14, color: 'inherit' }} />
                )
              }
              label={trend.value}
              sx={{
                fontWeight: 600,
                fontSize: '0.75rem',
                height: 24,
                bgcolor: isPositiveTrend
                  ? 'rgba(21, 128, 61, 0.1)'
                  : isNegativeTrend
                  ? 'rgba(185, 28, 28, 0.1)'
                  : 'rgba(100, 116, 139, 0.1)',
                color: isPositiveTrend
                  ? 'var(--stackly-status-success)'
                  : isNegativeTrend
                  ? 'var(--stackly-status-error)'
                  : 'var(--text-muted)',
                border: 'none',
                '& .MuiChip-icon': {
                  marginLeft: '4px',
                },
              }}
            />
          )}

          {menuItems && menuItems.length > 0 && (
            <>
              <IconButton
                size="small"
                aria-label={`${title} options`}
                onClick={handleOpenMenu}
                sx={{
                  color: 'var(--text-muted)',
                  '&:hover': {
                    color: 'var(--text-primary)',
                    bgcolor: 'var(--bg-hover)',
                  },
                }}
              >
                <MoreVertIcon fontSize="small" />
              </IconButton>
              <Menu
                anchorEl={anchorEl}
                open={isMenuOpen}
                onClose={handleCloseMenu}
                slotProps={{
                  paper: {
                    sx: {
                      bgcolor: 'var(--bg-card)',
                      color: 'var(--text-primary)',
                      borderRadius: '12px',
                      border: '1px solid var(--border-color)',
                      boxShadow: 'var(--shadow-md)',
                    },
                  },
                }}
              >
                {menuItems.map((item, i) => (
                  <MenuItem
                    key={i}
                    onClick={() => {
                      handleCloseMenu();
                      item.action();
                    }}
                    sx={{
                      fontSize: '0.8125rem',
                      fontFamily: 'var(--font-body)',
                      '&:hover': { bgcolor: 'var(--bg-hover)' },
                    }}
                  >
                    {item.label}
                  </MenuItem>
                ))}
              </Menu>
            </>
          )}
        </Box>
      </Box>

      {/* Main Content: Value, Title, Meta */}
      <Box sx={{ mt: 'auto' }}>
        <Typography
          sx={{
            fontFamily: 'var(--font-heading)',
            fontSize: '1.75rem',
            fontWeight: 800,
            lineHeight: 1.2,
            color: 'var(--text-primary)',
            letterSpacing: '-0.02em',
            mb: 0.5,
          }}
        >
          {value ?? '—'}
        </Typography>

        <Typography
          sx={{
            fontFamily: 'var(--font-body)',
            fontSize: '0.84rem',
            fontWeight: 600,
            color: 'var(--text-secondary)',
            lineHeight: 1.3,
          }}
        >
          {title}
        </Typography>

        {meta && (
          <Typography
            sx={{
              mt: 0.5,
              fontFamily: 'var(--font-body)',
              fontSize: '0.75rem',
              fontWeight: 500,
              color: 'var(--text-muted)',
            }}
          >
            {meta}
          </Typography>
        )}
      </Box>
    </Box>
  );
}

export default KpiCard;

