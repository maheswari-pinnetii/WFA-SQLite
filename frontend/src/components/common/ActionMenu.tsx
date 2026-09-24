import React, { useState } from 'react';
import {
  Button,
  IconButton,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  Divider,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  CircularProgress,
} from '@mui/material';
import { ChevronDown, LucideIcon } from 'lucide-react';
import { usePermission } from '../../hooks/usePermission';
import { Permission } from '../../features/auth/security/permissions/permissions';

export interface ActionMenuItem<T = any> {
  id: string;
  label: string;
  icon?: LucideIcon | React.ComponentType<{ size?: number; className?: string }>;
  permission?: Permission | string;
  disabled?: boolean | ((row: T) => boolean);
  danger?: boolean;
  hidden?: boolean | ((row: T) => boolean);
  dividerBefore?: boolean;
  requiresConfirmation?: boolean;
  confirmationTitle?: string | ((row: T) => string);
  confirmationMessage?: string | ((row: T) => string);
  onClick?: (row: T) => void | Promise<void>;
}

export interface ActionMenuProps<T = any> {
  actions: ActionMenuItem<T>[];
  row: T;
  onAction?: (actionId: string, row: T) => void | Promise<void>;
  disabled?: boolean;
  loading?: boolean;
  size?: 'small' | 'medium' | 'large';
  variant?: 'button' | 'icon' | 'outlined' | 'contained' | 'text';
  buttonLabel?: string;
  permissions?: string[];
  ariaLabel?: string;
}

export function ActionMenu<T = any>({
  actions,
  row,
  onAction,
  disabled = false,
  loading = false,
  size = 'small',
  variant = 'button',
  buttonLabel = 'Action',
  ariaLabel = 'Action menu',
}: ActionMenuProps<T>) {
  const { hasPermission } = usePermission();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [pendingAction, setPendingAction] = useState<ActionMenuItem<T> | null>(null);
  const [actionLoading, setActionLoading] = useState<boolean>(false);

  const open = Boolean(anchorEl);

  const visibleActions = actions.filter((action) => {
    if (action.hidden) {
      if (typeof action.hidden === 'function' && action.hidden(row)) return false;
      if (typeof action.hidden === 'boolean' && action.hidden) return false;
    }
    if (action.permission && !hasPermission(action.permission)) {
      return false;
    }
    return true;
  });

  if (visibleActions.length === 0) {
    return null;
  }

  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    event.stopPropagation();
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const executeAction = async (action: ActionMenuItem<T>) => {
    try {
      setActionLoading(true);
      if (action.onClick) {
        await action.onClick(row);
      }
      if (onAction) {
        await onAction(action.id, row);
      }
    } finally {
      setActionLoading(false);
      setPendingAction(null);
    }
  };

  const handleMenuItemClick = (action: ActionMenuItem<T>, event: React.MouseEvent) => {
    event.stopPropagation();
    handleClose();

    if (action.requiresConfirmation) {
      setPendingAction(action);
    } else {
      executeAction(action);
    }
  };

  const handleConfirmAction = () => {
    if (pendingAction) {
      executeAction(pendingAction);
    }
  };

  const handleCancelDialog = () => {
    setPendingAction(null);
  };

  const getConfirmationTitle = () => {
    if (!pendingAction) return 'Confirm Action';
    if (typeof pendingAction.confirmationTitle === 'function') {
      return pendingAction.confirmationTitle(row);
    }
    if (pendingAction.confirmationTitle) {
      return pendingAction.confirmationTitle;
    }
    return `Confirm ${pendingAction.label}`;
  };

  const getConfirmationMessage = () => {
    if (!pendingAction) return 'Are you sure you want to perform this action?';
    if (typeof pendingAction.confirmationMessage === 'function') {
      return pendingAction.confirmationMessage(row);
    }
    if (pendingAction.confirmationMessage) {
      return pendingAction.confirmationMessage;
    }
    return `Are you sure you want to ${pendingAction.label.toLowerCase()}? This action cannot be undone.`;
  };

  const isButtonDisabled = disabled || loading || actionLoading;

  const renderTrigger = () => {
    const isIconOnly = variant === 'icon';

    if (isIconOnly) {
      return (
        <IconButton
          aria-label={ariaLabel}
          aria-controls={open ? 'action-menu' : undefined}
          aria-haspopup="true"
          aria-expanded={open ? 'true' : undefined}
          onClick={handleClick}
          disabled={isButtonDisabled}
          size={size}
          sx={{
            color: 'var(--text-secondary, #64748b)',
            '&:hover': {
              backgroundColor: 'rgba(16, 185, 129, 0.08)',
              color: '#10b981',
            },
          }}
        >
          {loading || actionLoading ? (
            <CircularProgress size={16} color="inherit" />
          ) : (
            <ChevronDown size={18} />
          )}
        </IconButton>
      );
    }

    const buttonVariant = variant === 'button' ? 'outlined' : variant;

    return (
      <Button
        aria-label={ariaLabel}
        aria-controls={open ? 'action-menu' : undefined}
        aria-haspopup="true"
        aria-expanded={open ? 'true' : undefined}
        onClick={handleClick}
        disabled={isButtonDisabled}
        size={size}
        variant={buttonVariant}
        endIcon={
          loading || actionLoading ? (
            <CircularProgress size={14} color="inherit" />
          ) : (
            <ChevronDown size={14} />
          )
        }
        sx={{
          textTransform: 'none',
          fontWeight: 600,
          fontSize: '0.75rem',
          borderRadius: '0.375rem',
          borderColor: 'var(--border-color, #e2e8f0)',
          color: 'var(--text-primary, #0f172a)',
          backgroundColor: 'var(--bg-card, #ffffff)',
          '&:hover': {
            borderColor: '#10b981',
            backgroundColor: 'rgba(16, 185, 129, 0.04)',
            color: '#10b981',
          },
          '&:focus-visible': {
            outline: '2px solid #10b981',
            outlineOffset: '2px',
          },
        }}
      >
        {buttonLabel}
      </Button>
    );
  };

  return (
    <>
      {renderTrigger()}

      <Menu
        id="action-menu"
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        onClick={(e) => e.stopPropagation()}
        slotProps={{
          paper: {
            elevation: 3,
            sx: {
              minWidth: 160,
              borderRadius: '0.5rem',
              border: '1px solid var(--border-color, #e2e8f0)',
              backgroundColor: 'var(--bg-card, #ffffff)',
              color: 'var(--text-primary, #0f172a)',
              mt: 0.5,
              boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
              '& .MuiMenuItem-root': {
                fontSize: '0.8125rem',
                fontWeight: 500,
                py: 1,
                px: 1.5,
                borderRadius: '0.25rem',
                mx: 0.5,
                my: 0.25,
              },
            },
          },
        }}
        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
      >
        {visibleActions.map((action, index) => {
          const isDisabled =
            typeof action.disabled === 'function' ? action.disabled(row) : Boolean(action.disabled);
          const Icon = action.icon;

          return (
            <React.Fragment key={action.id}>
              {action.dividerBefore && index > 0 && (
                <Divider sx={{ my: 0.5, borderColor: 'var(--border-color, #e2e8f0)' }} />
              )}
              <MenuItem
                disabled={isDisabled}
                onClick={(e) => handleMenuItemClick(action, e)}
                sx={{
                  color: action.danger ? '#ef4444' : 'var(--text-primary, #0f172a)',
                  '&:hover': {
                    backgroundColor: action.danger
                      ? 'rgba(239, 68, 68, 0.08)'
                      : 'rgba(16, 185, 129, 0.08)',
                    color: action.danger ? '#dc2626' : '#10b981',
                  },
                  '&.Mui-disabled': {
                    opacity: 0.5,
                  },
                }}
              >
                {Icon && (
                  <ListItemIcon
                    sx={{
                      minWidth: 28,
                      color: action.danger ? '#ef4444' : 'var(--text-secondary, #64748b)',
                      '.MuiMenuItem-root:hover &': {
                        color: action.danger ? '#dc2626' : '#10b981',
                      },
                    }}
                  >
                    <Icon size={16} />
                  </ListItemIcon>
                )}
                <ListItemText
                  primary={action.label}
                  sx={{
                    '& .MuiListItemText-primary': {
                      fontSize: '0.8125rem',
                      fontWeight: 500,
                    },
                  }}
                />
              </MenuItem>
            </React.Fragment>
          );
        })}
      </Menu>

      {/* MUI Confirmation Dialog for Destructive / Sensitive Actions */}
      <Dialog
        open={Boolean(pendingAction)}
        onClose={handleCancelDialog}
        onClick={(e) => e.stopPropagation()}
        slotProps={{
          paper: {
            sx: {
              borderRadius: '0.75rem',
              p: 1,
              backgroundColor: 'var(--bg-card, #ffffff)',
              color: 'var(--text-primary, #0f172a)',
              maxWidth: '420px',
              width: '100%',
            },
          },
        }}
      >
        <DialogTitle
          sx={{
            fontWeight: 700,
            fontSize: '1rem',
            color: pendingAction?.danger ? '#ef4444' : 'var(--text-primary, #0f172a)',
            pb: 1,
          }}
        >
          {getConfirmationTitle()}
        </DialogTitle>
        <DialogContent>
          <DialogContentText
            sx={{
              fontSize: '0.875rem',
              color: 'var(--text-secondary, #475569)',
            }}
          >
            {getConfirmationMessage()}
          </DialogContentText>
        </DialogContent>
        <DialogActions sx={{ pt: 2, px: 3, pb: 2 }}>
          <Button
            onClick={handleCancelDialog}
            disabled={actionLoading}
            variant="outlined"
            size="small"
            sx={{
              textTransform: 'none',
              fontWeight: 600,
              borderRadius: '0.375rem',
              color: 'var(--text-secondary, #64748b)',
              borderColor: 'var(--border-color, #cbd5e1)',
            }}
          >
            Cancel
          </Button>
          <Button
            onClick={handleConfirmAction}
            disabled={actionLoading}
            variant="contained"
            size="small"
            color={pendingAction?.danger ? 'error' : 'primary'}
            startIcon={actionLoading ? <CircularProgress size={14} color="inherit" /> : null}
            sx={{
              textTransform: 'none',
              fontWeight: 600,
              borderRadius: '0.375rem',
              backgroundColor: pendingAction?.danger ? '#ef4444' : '#10b981',
              '&:hover': {
                backgroundColor: pendingAction?.danger ? '#dc2626' : '#059669',
              },
            }}
          >
            {actionLoading ? 'Processing...' : 'Confirm'}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
