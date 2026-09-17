import React from 'react';
import { Box, TextField, MenuItem, Button, InputAdornment } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import FilterListIcon from '@mui/icons-material/FilterList';
import RefreshIcon from '@mui/icons-material/Refresh';
import DownloadIcon from '@mui/icons-material/Download';

export interface FilterOption {
  value: string;
  label: string;
}

export interface DashboardFilterBarProps {
  searchPlaceholder?: string;
  searchValue?: string;
  onSearchChange?: (value: string) => void;
  departmentValue?: string;
  onDepartmentChange?: (value: string) => void;
  departmentOptions?: FilterOption[];
  locationValue?: string;
  onLocationChange?: (value: string) => void;
  locationOptions?: FilterOption[];
  statusValue?: string;
  onStatusChange?: (value: string) => void;
  statusOptions?: FilterOption[];
  onRefresh?: () => void;
  onExport?: () => void;
  onReset?: () => void;
}

export const DashboardFilterBar: React.FC<DashboardFilterBarProps> = ({
  searchPlaceholder = 'Search employees, teams, IDs...',
  searchValue = '',
  onSearchChange,
  departmentValue = '',
  onDepartmentChange,
  departmentOptions = [],
  locationValue = '',
  onLocationChange,
  locationOptions = [],
  statusValue = '',
  onStatusChange,
  statusOptions = [],
  onRefresh,
  onExport,
  onReset,
}) => {
  return (
    <Box
      sx={{
        p: 2,
        mb: 3,
        borderRadius: '16px',
        bgcolor: 'var(--bg-card)',
        border: '1px solid var(--border-color)',
        boxShadow: 'var(--shadow-sm)',
        display: 'flex',
        flexWrap: 'wrap',
        alignItems: 'center',
        gap: 1.5,
      }}
    >
      {/* Search Input */}
      {onSearchChange && (
        <TextField
          size="small"
          placeholder={searchPlaceholder}
          value={searchValue}
          onChange={(e) => onSearchChange(e.target.value)}
          sx={{
            flex: { xs: '1 1 100%', sm: '1 1 240px' },
            minWidth: 200,
            '& .MuiOutlinedInput-root': {
              borderRadius: '10px',
              bgcolor: 'var(--bg-primary)',
              fontSize: '0.84rem',
              '& fieldset': { borderColor: 'var(--border-color)' },
              '&:hover fieldset': { borderColor: 'var(--stackly-border-strong)' },
              '&.Mui-focused fieldset': { borderColor: 'var(--stackly-brand-primary)' },
            },
          }}
          slotProps={{
            input: {
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon sx={{ fontSize: 18, color: 'var(--text-muted)' }} />
                </InputAdornment>
              ),
            },
          }}
        />
      )}

      {/* Department Filter */}
      {onDepartmentChange && departmentOptions.length > 0 && (
        <TextField
          select
          size="small"
          label="Department"
          value={departmentValue}
          onChange={(e) => onDepartmentChange(e.target.value)}
          sx={{
            minWidth: 150,
            flex: { xs: '1 1 140px', sm: '0 0 auto' },
            '& .MuiOutlinedInput-root': {
              borderRadius: '10px',
              bgcolor: 'var(--bg-primary)',
              fontSize: '0.84rem',
              '& fieldset': { borderColor: 'var(--border-color)' },
            },
          }}
        >
          <MenuItem value="" sx={{ fontSize: '0.84rem' }}>
            All Departments
          </MenuItem>
          {departmentOptions.map((opt) => (
            <MenuItem key={opt.value} value={opt.value} sx={{ fontSize: '0.84rem' }}>
              {opt.label}
            </MenuItem>
          ))}
        </TextField>
      )}

      {/* Location Filter */}
      {onLocationChange && locationOptions.length > 0 && (
        <TextField
          select
          size="small"
          label="Location"
          value={locationValue}
          onChange={(e) => onLocationChange(e.target.value)}
          sx={{
            minWidth: 140,
            flex: { xs: '1 1 130px', sm: '0 0 auto' },
            '& .MuiOutlinedInput-root': {
              borderRadius: '10px',
              bgcolor: 'var(--bg-primary)',
              fontSize: '0.84rem',
              '& fieldset': { borderColor: 'var(--border-color)' },
            },
          }}
        >
          <MenuItem value="" sx={{ fontSize: '0.84rem' }}>
            All Locations
          </MenuItem>
          {locationOptions.map((opt) => (
            <MenuItem key={opt.value} value={opt.value} sx={{ fontSize: '0.84rem' }}>
              {opt.label}
            </MenuItem>
          ))}
        </TextField>
      )}

      {/* Status Filter */}
      {onStatusChange && statusOptions.length > 0 && (
        <TextField
          select
          size="small"
          label="Status"
          value={statusValue}
          onChange={(e) => onStatusChange(e.target.value)}
          sx={{
            minWidth: 130,
            flex: { xs: '1 1 120px', sm: '0 0 auto' },
            '& .MuiOutlinedInput-root': {
              borderRadius: '10px',
              bgcolor: 'var(--bg-primary)',
              fontSize: '0.84rem',
              '& fieldset': { borderColor: 'var(--border-color)' },
            },
          }}
        >
          <MenuItem value="" sx={{ fontSize: '0.84rem' }}>
            All Statuses
          </MenuItem>
          {statusOptions.map((opt) => (
            <MenuItem key={opt.value} value={opt.value} sx={{ fontSize: '0.84rem' }}>
              {opt.label}
            </MenuItem>
          ))}
        </TextField>
      )}

      {/* Action Buttons: Reset, Refresh, Export */}
      <Box sx={{ ml: 'auto', display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
        {onReset && (
          <Button
            size="small"
            variant="text"
            startIcon={<FilterListIcon sx={{ fontSize: 16 }} />}
            onClick={onReset}
            sx={{
              color: 'var(--text-muted)',
              fontSize: '0.8125rem',
              textTransform: 'none',
              borderRadius: '8px',
              '&:hover': { color: 'var(--text-primary)', bgcolor: 'var(--bg-hover)' },
            }}
          >
            Reset
          </Button>
        )}

        {onRefresh && (
          <Button
            size="small"
            variant="outlined"
            startIcon={<RefreshIcon sx={{ fontSize: 16 }} />}
            onClick={onRefresh}
            sx={{
              color: 'var(--text-primary)',
              borderColor: 'var(--border-color)',
              fontSize: '0.8125rem',
              textTransform: 'none',
              borderRadius: '8px',
              '&:hover': { borderColor: 'var(--stackly-brand-primary)', bgcolor: 'var(--bg-hover)' },
            }}
          >
            Refresh
          </Button>
        )}

        {onExport && (
          <Button
            size="small"
            variant="contained"
            startIcon={<DownloadIcon sx={{ fontSize: 16 }} />}
            onClick={onExport}
            sx={{
              bgcolor: 'var(--stackly-brand-primary)',
              color: '#FFFFFF',
              fontSize: '0.8125rem',
              fontWeight: 600,
              textTransform: 'none',
              borderRadius: '8px',
              boxShadow: 'none',
              '&:hover': { bgcolor: 'var(--stackly-brand-hover)', boxShadow: 'var(--shadow-sm)' },
            }}
          >
            Export
          </Button>
        )}
      </Box>
    </Box>
  );
};
