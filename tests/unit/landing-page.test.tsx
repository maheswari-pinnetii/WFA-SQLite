// @vitest-environment jsdom
import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { BrowserRouter } from 'react-router-dom';
import { LandingPage } from '../../frontend/src/pages/LandingPage';

// Mock useAuth hook
vi.mock('../../frontend/src/auth/hooks/useAuth', () => ({
  useAuth: () => ({
    isAuthenticated: false,
    role: 'EMPLOYEE',
    user: null,
    initializeAuth: vi.fn(),
    isLoading: false
  })
}));

describe('Enterprise Landing Page UI & Features Test Suite', () => {
  const renderLandingPage = () => {
    return render(
      <BrowserRouter>
        <LandingPage />
      </BrowserRouter>
    );
  };

  it('should render the Unique Value Proposition and Primary Hero CTA button', () => {
    renderLandingPage();

    // UVP Headline
    expect(screen.getByText(/The Next-Gen Workforce Analytics/i)).toBeInTheDocument();
    expect(screen.getByText(/Attendance OS/i)).toBeInTheDocument();

    // Primary & Secondary Hero CTAs
    const primaryCta = screen.getByText(/Launch Live Employee Portal/i);
    const secondaryCta = screen.getByText(/Explore Admin & HR Suite/i);
    expect(primaryCta).toBeInTheDocument();
    expect(secondaryCta).toBeInTheDocument();
  });

  it('should render Trust Badges, Security Certifications, and Live Enterprise Metrics', () => {
    renderLandingPage();

    // Security Trust Badges
    expect(screen.getByText(/SOC2 Type II Certified/i)).toBeInTheDocument();
    expect(screen.getByText(/ISO 27001 Standard/i)).toBeInTheDocument();
    expect(screen.getByText(/GDPR & HIPAA Ready/i)).toBeInTheDocument();
    expect(screen.getByText(/AES-256 \+ SQLite WAL Encryption/i)).toBeInTheDocument();

    // Live Metrics
    const metricElements = screen.getAllByText(/500\+/i);
    expect(metricElements.length).toBeGreaterThan(0);
    expect(screen.getByText(/<10ms/i)).toBeInTheDocument();
    expect(screen.getAllByText(/99.99%/i).length).toBeGreaterThan(0);
  });

  it('should render the Problem You Solve ("Legacy Nightmare vs Stackly Solution") matrix', () => {
    renderLandingPage();

    expect(screen.getByText(/Problem You Solve/i)).toBeInTheDocument();
    expect(screen.getByText(/The Legacy Workplace Nightmare/i)).toBeInTheDocument();
    expect(screen.getByText(/The Stackly WFA Unified Solution/i)).toBeInTheDocument();
    expect(screen.getByText(/Buddy Punching & Time Theft/i)).toBeInTheDocument();
    expect(screen.getByText(/GPS Geofencing \+ Biometric WebAuthn/i)).toBeInTheDocument();
  });

  it('should render Key Benefits with interactive icons and descriptions', () => {
    renderLandingPage();

    expect(screen.getByText(/Key Benefits/i)).toBeInTheDocument();
    expect(screen.getByText(/Zero-Latency Geofenced Time Clock/i)).toBeInTheDocument();
    expect(screen.getByText(/Executive Workforce Analytics/i)).toBeInTheDocument();
    expect(screen.getByText(/Multi-Method Passwordless Authentication/i)).toBeInTheDocument();
    expect(screen.getByText(/Hot SQLite Database Backup & Recovery/i)).toBeInTheDocument();
    expect(screen.getByText(/Automated Payroll Calculation Engine/i)).toBeInTheDocument();
  });

  it('should support Interactive ROI Calculator slider adjustments', () => {
    renderLandingPage();

    const slider = screen.getByLabelText(/Workforce Headcount Slider/i);
    expect(slider).toBeInTheDocument();
    expect(screen.getByText(/250 Employees/i)).toBeInTheDocument();
    expect(screen.getByText(/\$70,000/i)).toBeInTheDocument();
  });

  it('should render Interactive FAQ Accordion and expand/collapse answers on click', () => {
    renderLandingPage();

    expect(screen.getByText(/Frequently Asked Questions/i)).toBeInTheDocument();
    const faqQuestion = screen.getByText(/How does Stackly handle 500\+ employees logging in simultaneously\?/i);
    expect(faqQuestion).toBeInTheDocument();

    // First FAQ is open by default
    expect(screen.getByText(/Write-Ahead Logging \(WAL\) mode/i)).toBeInTheDocument();

    // Click to toggle
    fireEvent.click(faqQuestion);
    // Click on another question
    const secondQuestion = screen.getByText(/Is employee GPS tracked outside the workplace\?/i);
    fireEvent.click(secondQuestion);
    expect(screen.getByText(/GPS coordinates are captured only at the exact instant/i)).toBeInTheDocument();
  });

  it('should render the 2nd Ending Call to Action banner at the bottom', () => {
    renderLandingPage();

    expect(screen.getByText(/Ready to Supercharge Your Workforce Intelligence\?/i)).toBeInTheDocument();
    expect(screen.getByText(/Get Started with Live Demo 🚀/i)).toBeInTheDocument();
    expect(screen.getByText(/Create Account Free/i)).toBeInTheDocument();
  });
});
