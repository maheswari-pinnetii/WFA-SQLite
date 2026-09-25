// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach } from 'vitest';
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { ActionMenu, ActionMenuItem } from '../../frontend/src/components/common/ActionMenu';
import { Permission } from '../../frontend/src/features/auth/security/permissions/permissions';

// Mock usePermission hook
const mockHasPermission = vi.fn();
vi.mock('../../frontend/src/hooks/usePermission', () => ({
  usePermission: () => ({
    hasPermission: mockHasPermission,
    role: 'ADMIN',
    permissions: [Permission.EMPLOYEE_VIEW, Permission.EMPLOYEE_UPDATE, Permission.EMPLOYEE_DELETE],
  }),
}));

describe('ActionMenu Component Unit Tests', () => {
  const dummyRow = { id: 'emp-101', name: 'John Doe', status: 'Active' };

  beforeEach(() => {
    mockHasPermission.mockReset();
    mockHasPermission.mockReturnValue(true);
  });

  const sampleActions: ActionMenuItem<typeof dummyRow>[] = [
    {
      id: 'view',
      label: 'View Profile',
      permission: Permission.EMPLOYEE_VIEW,
      onClick: vi.fn(),
    },
    {
      id: 'edit',
      label: 'Edit Employee',
      permission: Permission.EMPLOYEE_UPDATE,
      onClick: vi.fn(),
    },
    {
      id: 'delete',
      label: 'Delete Employee',
      permission: Permission.EMPLOYEE_DELETE,
      danger: true,
      requiresConfirmation: true,
      confirmationTitle: 'Delete Employee Record',
      confirmationMessage: 'Are you sure you want to permanently delete John Doe?',
      onClick: vi.fn(),
    },
  ];

  it('renders button trigger with default label "Action ▾"', () => {
    render(<ActionMenu actions={sampleActions} row={dummyRow} buttonLabel="Action ▾" />);
    const trigger = screen.getByRole('button', { name: /action menu/i });
    expect(trigger).toBeInTheDocument();
    expect(trigger).toHaveTextContent('Action ▾');
  });

  it('filters out actions where hasPermission returns false', () => {
    mockHasPermission.mockImplementation((perm: string) => perm !== Permission.EMPLOYEE_DELETE);

    render(<ActionMenu actions={sampleActions} row={dummyRow} buttonLabel="Action ▾" />);
    const trigger = screen.getByRole('button', { name: /action menu/i });
    fireEvent.click(trigger);

    expect(screen.getByText('View Profile')).toBeInTheDocument();
    expect(screen.getByText('Edit Employee')).toBeInTheDocument();
    expect(screen.queryByText('Delete Employee')).not.toBeInTheDocument();
  });

  it('returns null if no actions are permitted', () => {
    mockHasPermission.mockReturnValue(false);

    const { container } = render(<ActionMenu actions={sampleActions} row={dummyRow} />);
    expect(container.firstChild).toBeNull();
  });

  it('opens menu and triggers callback when action is selected', async () => {
    const onActionMock = vi.fn();
    render(<ActionMenu actions={sampleActions} row={dummyRow} onAction={onActionMock} buttonLabel="Action ▾" />);

    const trigger = screen.getByRole('button', { name: /action menu/i });
    fireEvent.click(trigger);

    const viewItem = screen.getByText('View Profile');
    fireEvent.click(viewItem);

    await waitFor(() => {
      expect(sampleActions[0].onClick).toHaveBeenCalledWith(dummyRow);
      expect(onActionMock).toHaveBeenCalledWith('view', dummyRow);
    });
  });

  it('shows MUI confirmation dialog for destructive actions with requiresConfirmation', async () => {
    render(<ActionMenu actions={sampleActions} row={dummyRow} buttonLabel="Action ▾" />);

    const trigger = screen.getByRole('button', { name: /action menu/i });
    fireEvent.click(trigger);

    const deleteItem = screen.getByText('Delete Employee');
    fireEvent.click(deleteItem);

    // Confirmation dialog should appear
    expect(screen.getByText('Delete Employee Record')).toBeInTheDocument();
    expect(screen.getByText('Are you sure you want to permanently delete John Doe?')).toBeInTheDocument();

    // Confirm button click
    const confirmButton = screen.getByRole('button', { name: /confirm/i });
    fireEvent.click(confirmButton);

    await waitFor(() => {
      expect(sampleActions[2].onClick).toHaveBeenCalledWith(dummyRow);
    });
  });
});
