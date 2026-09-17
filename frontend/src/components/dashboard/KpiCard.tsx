import React, { useState } from 'react';
import { Box, Typography, IconButton, Menu, MenuItem } from '@mui/material';
import MoreVertIcon from '@mui/icons-material/MoreVert';
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
          p: '2px',
          borderRadius: '22px',
          position: 'relative',
          width: '100%',
          height: '100%',
          background: `
            radial-gradient(
              150px circle at 90% 0%,
              rgb(32 191 179 / 30%),
              transparent 70%
            ),
            linear-gradient(
              135deg,
              #1a1e26,
              #111317
            )
          `,
        }}
      >
        <Box
          sx={{
            position: 'relative',
            minHeight: 175,
            height: '100%',
            width: '100%',
            p: 3,
            borderRadius: '20px',
            background: `
              radial-gradient(
                150px circle at 90% 0%,
                rgba(32, 191, 179, 0.2),
                transparent 80%
              ),
              linear-gradient(
                135deg,
                #1a1e26,
                #111317
              )
            `,
            boxShadow: '0 20px 30px rgba(0, 0, 0, 0.6)',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
          }}
        >
          <Box sx={{ width: 42, height: 42, borderRadius: '50%', overflow: 'hidden', mb: 2 }}>
            <Skeleton variant="circular" width={42} height={42} sx={{ bgcolor: 'rgba(255,255,255,0.1)' }} />
          </Box>
          <Box>
            <Skeleton variant="text" width="60%" height={36} sx={{ bgcolor: 'rgba(255,255,255,0.1)' }} />
            <Skeleton variant="text" width="40%" height={20} sx={{ bgcolor: 'rgba(255,255,255,0.1)' }} />
          </Box>
        </Box>
      </Box>
    );
  }

  const getTrendColor = () => {
    if (!trend?.direction || trend.direction === 'up') return '#20bfb3';
    if (trend.direction === 'down') return '#f87171';
    return '#94a3b8';
  };

  return (
    <Box
      className="kpi-card-wrapper"
      sx={{
        p: '2px',
        borderRadius: '22px',
        position: 'relative',
        width: '100%',
        height: '100%',
        background: `
          radial-gradient(
            150px circle at 90% 0%,
            rgb(32 191 179),
            transparent 70%
          ),
          linear-gradient(
            135deg,
            #1a1e26,
            #111317
          )
        `,
      }}
    >
      <Box
        className="kpi-card"
        sx={{
          position: 'relative',
          minHeight: 175,
          height: '100%',
          width: '100%',
          p: 3,
          borderRadius: '20px',
          background: `
            radial-gradient(
              150px circle at 90% 0%,
              rgba(32, 191, 179, 0.35),
              transparent 80%
            ),
            linear-gradient(
              135deg,
              #1a1e26,
              #111317
            )
          `,
          boxShadow: '0 20px 30px rgba(0, 0, 0, 0.6)',
          color: '#ffffff',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          transition: 'transform 180ms ease, box-shadow 180ms ease',
          '&:hover': {
            transform: 'translateY(-3px)',
            boxShadow: `
              0 22px 35px rgba(0, 0, 0, 0.55),
              0 0 25px rgba(32, 191, 179, 0.12)
            `,
          },
        }}
      >
        {/* Action Button */}
        <IconButton
          className="kpi-card-menu"
          aria-label={`${title} actions`}
          onClick={handleOpenMenu}
          sx={{
            position: 'absolute',
            top: 10,
            right: 10,
            color: '#606f85',
            '&:hover': {
              color: '#20bfb3',
              backgroundColor: 'rgba(32, 191, 179, 0.08)',
            },
          }}
        >
          <MoreVertIcon fontSize="small" />
        </IconButton>

        {/* Action Dropdown Menu */}
        {menuItems && menuItems.length > 0 && (
          <Menu
            anchorEl={anchorEl}
            open={isMenuOpen}
            onClose={handleCloseMenu}
            slotProps={{
              paper: {
                sx: {
                  bgcolor: '#1a1e26',
                  color: '#ffffff',
                  border: '1px solid rgba(32, 191, 179, 0.2)',
                  boxShadow: '0 10px 25px rgba(0,0,0,0.5)',
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
                  fontSize: '0.8rem',
                  fontFamily: "'Plus Jakarta Sans', sans-serif",
                  '&:hover': { bgcolor: 'rgba(32, 191, 179, 0.15)' },
                }}
              >
                {item.label}
              </MenuItem>
            ))}
          </Menu>
        )}

        {/* Circular Icon */}
        <Box
          className="kpi-card-icon"
          sx={{
            width: 42,
            height: 42,
            minWidth: 42,
            minHeight: 42,
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            mb: 2.5,
            background: 'linear-gradient(135deg, #20bfb3, #0ea5a0)',
            boxShadow: '0 4px 12px rgba(32, 191, 179, 0.4)',
            color: '#ffffff',
            transition: 'transform 180ms ease, box-shadow 180ms ease',
            '& svg': {
              width: 20,
              height: 20,
              color: '#ffffff',
              flexShrink: 0,
            },
            '&:hover': {
              transform: 'scale(1.05)',
              boxShadow: '0 6px 18px rgba(32, 191, 179, 0.5)',
            },
          }}
        >
          {icon}
        </Box>

        {/* Content Box */}
        <Box sx={{ mt: 'auto' }}>
          <Typography
            className="kpi-card-value"
            sx={{
              fontFamily: "'Plus Jakarta Sans', sans-serif",
              fontSize: '1.75rem',
              lineHeight: 1.2,
              fontWeight: 800,
              letterSpacing: '-0.02em',
              color: '#ffffff',
              mb: 0.5,
            }}
          >
            {value ?? '—'}
          </Typography>

          <Typography
            className="kpi-card-title"
            sx={{
              fontFamily: "'Plus Jakarta Sans', sans-serif",
              fontSize: '0.82rem',
              fontWeight: 500,
              color: '#94a3b8',
            }}
          >
            {title}
          </Typography>

          {trend && (
            <Typography
              className={`kpi-card-trend ${trend.direction || 'up'}`}
              sx={{
                mt: 0.5,
                fontSize: '0.75rem',
                fontWeight: 600,
                color: getTrendColor(),
              }}
            >
              {trend.value}
            </Typography>
          )}

          {meta && (
            <Typography
              className="kpi-card-meta"
              sx={{
                mt: 0.5,
                fontSize: '0.75rem',
                color: '#64748b',
              }}
            >
              {meta}
            </Typography>
          )}
        </Box>
      </Box>
    </Box>
  );
}

export default KpiCard;
