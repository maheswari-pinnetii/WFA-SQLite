// @vitest-environment jsdom
import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { BrowserRouter } from 'react-router-dom';
import { EmailLoginCard } from '../../frontend/src/auth/components/EmailLoginCard';

describe('Step 1: EmailLoginCard Component Unit Tests', () => {
  const renderCard = (props: React.ComponentProps<typeof EmailLoginCard>) => {
    return render(
      <BrowserRouter>
        <EmailLoginCard {...props} />
      </BrowserRouter>
    );
  };

  it('1.1 should render badge header, Stackly branding, and default email pill', () => {
    renderCard({
      onSubmit: vi.fn(),
      currentEmail: 'employee@thestackly.com',
    });

    expect(screen.getByText('Password-Based')).toBeInTheDocument();
    expect(screen.getByText('Knowledge Factor')).toBeInTheDocument();
    expect(screen.getByAltText('Stackly')).toBeInTheDocument();
    expect(screen.getByText('employee@thestackly.com')).toBeInTheDocument();
    expect(screen.getByText('Enter your password')).toBeInTheDocument();
    expect(screen.getByText('Forgot your password?')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /^Next$/i })).toBeInTheDocument();
  });

  it('1.2 should toggle password visibility when clicking eye button', () => {
    renderCard({ onSubmit: vi.fn() });

    const passwordInput = screen.getByLabelText(/^Password$/i) as HTMLInputElement;
    const toggleBtn = screen.getByRole('button', { name: /Show password/i });

    expect(passwordInput.type).toBe('password');

    // Toggle on
    fireEvent.click(toggleBtn);
    expect(passwordInput.type).toBe('text');

    // Toggle off
    fireEvent.click(screen.getByRole('button', { name: /Hide password/i }));
    expect(passwordInput.type).toBe('password');
  });

  it('1.3 should allow clicking email pill badge to edit corporate email', () => {
    const onEmailChangeMock = vi.fn();
    renderCard({
      onSubmit: vi.fn(),
      currentEmail: 'original@thestackly.com',
      onEmailChange: onEmailChangeMock,
    });

    const emailPill = screen.getByText('original@thestackly.com');
    fireEvent.click(emailPill);

    // Should switch to inline input
    const editInput = screen.getByLabelText('Switch Email') as HTMLInputElement;
    expect(editInput).toBeInTheDocument();
    expect(editInput.value).toBe('original@thestackly.com');

    // Change email value and blur
    fireEvent.change(editInput, { target: { value: 'updated@thestackly.com' } });
    fireEvent.blur(editInput);

    expect(onEmailChangeMock).toHaveBeenCalledWith('updated@thestackly.com');
    expect(screen.getByText('updated@thestackly.com')).toBeInTheDocument();
  });

  it('1.4 should display validation error when password is empty', async () => {
    const onSubmitMock = vi.fn();
    renderCard({ onSubmit: onSubmitMock });

    const submitBtn = screen.getByRole('button', { name: /^Next$/i });
    fireEvent.click(submitBtn);

    expect(await screen.findByText('Please enter your password.')).toBeInTheDocument();
    expect(onSubmitMock).not.toHaveBeenCalled();
  });

  it('1.5 should submit form with valid credentials', () => {
    const onSubmitMock = vi.fn();
    renderCard({
      onSubmit: onSubmitMock,
      currentEmail: 'engineer@thestackly.com',
    });

    const passwordInput = screen.getByLabelText(/^Password$/i);
    fireEvent.change(passwordInput, { target: { value: 'ValidSecurePass2026!' } });

    const submitBtn = screen.getByRole('button', { name: /^Next$/i });
    fireEvent.click(submitBtn);

    expect(onSubmitMock).toHaveBeenCalledWith({
      email: 'engineer@thestackly.com',
      password: 'ValidSecurePass2026!',
    });
  });

  it('1.6 should show loading state and disable submit button when isLoading=true', () => {
    renderCard({
      onSubmit: vi.fn(),
      isLoading: true,
    });

    expect(screen.getByText('Signing in...')).toBeInTheDocument();
    const submitBtn = screen.getByRole('button', { name: /Signing in.../i });
    expect(submitBtn).toBeDisabled();
  });
});
