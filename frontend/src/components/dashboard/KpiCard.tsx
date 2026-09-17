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
          p: '1px',
          borderRadius: '16px',
          position: 'relative',
          width: '100%',
          height: '100%',
          background: 'linear-gradient(135deg, rgba(32, 191, 179, 0.35), rgba(32, 191, 179, 0.12) 45%, rgba(32, 191, 179, 0.4))',
        }}
      >
        <Box
          sx={{
            position: 'relative',
            minHeight: 165,
            height: '100%',
            width: '100%',
            p: 2.5,
            borderRadius: '15px',
            background: `
              radial-gradient(
                140px circle at 100% 0%,
                rgba(32, 191, 179, 0.20),
                transparent 72%
              ),
              linear-gradient(
                145deg,
                #151D25,
                #10161D
              )
            `,
            boxShadow: '0 12px 28px rgba(0, 0, 0, 0.28)',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
          }}
        >
          <Box sx={{ width: 42, height: 42, borderRadius: '50%', overflow: 'hidden', mb: 2 }}>
            <Skeleton variant="circular" width={42} height={42} sx={{ bgcolor: 'rgba(32, 191, 179, 0.15)' }} />
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
    if (!trend?.direction || trend.direction === 'up') return '#20BFB3';
    if (trend.direction === 'down') return '#f87171';
    return '#94A3B8';
  };

  return (
    <Box
      className="kpi-card-wrapper"
      sx={{
        p: '1px',
        borderRadius: '24px',
        position: 'relative',
        width: '100%',
        height: '100%',
        background: 'linear-gradient(135deg, rgba(32, 191, 179, 0.45), rgba(32, 191, 179, 0.10) 50%, rgba(32, 191, 179, 0.35))',
        transition: 'all 240ms ease-in-out',
      }}
    >
      <Box
        className="kpi-card"
        sx={{
          position: 'relative',
          minHeight: 165,
          height: '100%',
          width: '100%',
          p: 2.75,
          borderRadius: '23px',
          background: `
            radial-gradient(
              220px circle at 95% 5%,
              rgba(32, 191, 179, 0.32),
              transparent 75%
            ),
            linear-gradient(
              145deg,
              #131C24 0%,
              #0D131A 100%
            )
          `,
          boxShadow: '0 14px 30px rgba(0, 0, 0, 0.35)',
          color: '#FFFFFF',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          transition: 'transform 240ms ease, box-shadow 240ms ease, background 240ms ease',
          '&:hover': {
            transform: 'translateY(-3px)',
            background: `
              radial-gradient(
                260px circle at 90% 5%,
                rgba(32, 191, 179, 0.55),
                rgba(14, 165, 160, 0.25) 55%,
                transparent 85%
              ),
              linear-gradient(
                145deg,
                #15202A 0%,
                #0E161F 100%
              )
            `,
            boxShadow: `
              0 20px 40px rgba(0, 0, 0, 0.45),
              0 0 25px rgba(32, 191, 179, 0.22)
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
            top: 14,
            right: 14,
            color: '#64748B',
            transition: 'color 180ms ease, background-color 180ms ease',
            '&:hover': {
              color: '#20BFB3',
              backgroundColor: 'rgba(32, 191, 179, 0.12)',
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
                  bgcolor: '#131C24',
                  color: '#FFFFFF',
                  borderRadius: '12px',
                  border: '1px solid rgba(32, 191, 179, 0.35)',
                  boxShadow: '0 12px 28px rgba(0, 0, 0, 0.45)',
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

        {/* Circular Icon with Drop Glow */}
        <Box
          className="kpi-card-icon"
          sx={{
            width: 44,
            height: 44,
            minWidth: 44,
            minHeight: 44,
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            mb: 2.25,
            background: 'linear-gradient(135deg, #00C49F 0%, #20BFB3 100%)',
            boxShadow: '0 0 20px rgba(32, 191, 179, 0.6), 0 4px 12px rgba(32, 191, 179, 0.35)',
            color: '#FFFFFF',
            transition: 'transform 200ms ease, box-shadow 200ms ease',
            '& svg': {
              width: 22,
              height: 22,
              color: '#FFFFFF',
              flexShrink: 0,
            },
            '&:hover': {
              transform: 'scale(1.06)',
              boxShadow: '0 0 25px rgba(32, 191, 179, 0.8), 0 6px 16px rgba(32, 191, 179, 0.45)',
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
              lineHeight: 1.15,
              fontWeight: 800,
              letterSpacing: '-0.025em',
              color: '#FFFFFF',
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
              fontWeight: 600,
              color: '#CBD5E1',
              mb: 0.25,
            }}
          >
            {title}
          </Typography>

          {trend && (
            <Typography
              className={`kpi-card-trend ${trend.direction || 'up'}`}
              sx={{
                mt: 0.25,
                fontFamily: "'Plus Jakarta Sans', sans-serif",
                fontSize: '0.78rem',
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
                mt: 0.25,
                fontFamily: "'Plus Jakarta Sans', sans-serif",
                fontSize: '0.78rem',
                fontWeight: 500,
                color: '#94A3B8',
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
