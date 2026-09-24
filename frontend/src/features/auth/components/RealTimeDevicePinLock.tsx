import React, { useState, useEffect } from 'react';

interface RealTimeDevicePinLockProps {
  onSuccess: (pin?: string) => void;
  isLoading?: boolean;
}

export const RealTimeDevicePinLock: React.FC<RealTimeDevicePinLockProps> = ({
  onSuccess,
  isLoading = false,
}) => {
  const [pin, setPin] = useState<string>('');
  const [isVerifying, setIsVerifying] = useState<boolean>(false);
  const [errorStatus, setErrorStatus] = useState<boolean>(false);
  const [isSuccess, setIsSuccess] = useState<boolean>(false);

  const MAX_PIN_LENGTH = 4;

  const handleDigit = (digit: string) => {
    if (pin.length >= MAX_PIN_LENGTH || isVerifying || isSuccess) return;
    const nextPin = pin + digit;
    setPin(nextPin);
    setErrorStatus(false);

    if (nextPin.length === MAX_PIN_LENGTH) {
      verifyPin(nextPin);
    }
  };

  const handleDelete = () => {
    if (isVerifying || isSuccess) return;
    setPin((prev) => prev.slice(0, -1));
    setErrorStatus(false);
  };

  const handleClear = () => {
    if (isVerifying || isSuccess) return;
    setPin('');
    setErrorStatus(false);
  };

  const verifyPin = async (enteredPin: string) => {
    setIsVerifying(true);
    // Real-time verification delay for realistic responsiveness
    await new Promise((resolve) => setTimeout(resolve, 350));

    // Accepts demo PIN 1234 or any valid 4-digit input
    if (enteredPin.length === 4) {
      setIsSuccess(true);
      setIsVerifying(false);
      setTimeout(() => {
        onSuccess(enteredPin);
      }, 500);
    } else {
      setErrorStatus(true);
      setIsVerifying(false);
      setTimeout(() => {
        setPin('');
        setErrorStatus(false);
      }, 700);
    }
  };

  // Keyboard listener for physical keyboard entry
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (/^[0-9]$/.test(e.key)) {
        handleDigit(e.key);
      } else if (e.key === 'Backspace') {
        handleDelete();
      } else if (e.key === 'Escape' || e.key === 'Delete') {
        handleClear();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [pin, isVerifying, isSuccess]);

  return (
    <div
      className="realtime-pin-pad-container"
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        padding: '12px',
        background: 'rgba(15, 23, 42, 0.65)',
        border: '1px solid rgba(255, 255, 255, 0.08)',
        borderRadius: '16px',
        width: '100%',
        maxWidth: '310px',
        margin: '0 auto',
        boxSizing: 'border-box',
      }}
    >
      <div style={{ textAlign: 'center', marginBottom: '12px' }}>
        <div style={{ fontSize: '11px', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 600 }}>
          Device Screen PIN
        </div>
        <div style={{ fontSize: '13px', fontWeight: 600, color: '#f8fafc', marginTop: '2px' }}>
          {isSuccess
            ? '✓ PIN Accepted - Unlocking'
            : isVerifying
            ? 'Verifying Device PIN...'
            : errorStatus
            ? 'Incorrect PIN. Try again.'
            : 'Enter your 4-digit device PIN'}
        </div>
      </div>

      {/* 4-Digit Pin Dots Indicator */}
      <div
        className={`pin-dots-row ${errorStatus ? 'shake-animation' : ''}`}
        style={{
          display: 'flex',
          gap: '14px',
          marginBottom: '16px',
          padding: '8px 16px',
          borderRadius: '24px',
          background: errorStatus ? 'rgba(239, 68, 68, 0.15)' : 'rgba(255, 255, 255, 0.04)',
          border: errorStatus ? '1px solid #ef4444' : isSuccess ? '1px solid #10b981' : '1px solid rgba(255, 255, 255, 0.1)',
          transition: 'all 0.25s ease',
        }}
      >
        {[0, 1, 2, 3].map((idx) => {
          const filled = idx < pin.length;
          return (
            <div
              key={idx}
              style={{
                width: '14px',
                height: '14px',
                borderRadius: '50%',
                background: isSuccess
                  ? '#10b981'
                  : errorStatus
                  ? '#ef4444'
                  : filled
                  ? '#38bdf8'
                  : 'rgba(255, 255, 255, 0.2)',
                boxShadow: filled
                  ? isSuccess
                    ? '0 0 10px #10b981'
                    : '0 0 8px #38bdf8'
                  : 'none',
                transform: filled ? 'scale(1.15)' : 'scale(1)',
                transition: 'all 0.18s cubic-bezier(0.4, 0, 0.2, 1)',
              }}
            />
          );
        })}
      </div>

      {/* 3x4 Numeric Keypad */}
      <div
        className="pin-keypad-grid"
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: '8px',
          width: '100%',
        }}
      >
        {['1', '2', '3', '4', '5', '6', '7', '8', '9', 'C', '0', '⌫'].map((key) => {
          const isAction = key === 'C' || key === '⌫';
          return (
            <button
              key={key}
              type="button"
              disabled={isLoading || isVerifying || isSuccess}
              onClick={() => {
                if (key === 'C') handleClear();
                else if (key === '⌫') handleDelete();
                else handleDigit(key);
              }}
              style={{
                height: '46px',
                borderRadius: '12px',
                background: isAction ? 'rgba(255, 255, 255, 0.05)' : 'rgba(255, 255, 255, 0.09)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                color: isAction ? '#94a3b8' : '#ffffff',
                fontSize: isAction ? '15px' : '18px',
                fontWeight: isAction ? 600 : 700,
                cursor: isLoading || isVerifying ? 'not-allowed' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'all 0.15s ease',
              }}
              onMouseDown={(e) => {
                (e.currentTarget as HTMLElement).style.transform = 'scale(0.95)';
                (e.currentTarget as HTMLElement).style.background = 'rgba(56, 189, 248, 0.25)';
              }}
              onMouseUp={(e) => {
                (e.currentTarget as HTMLElement).style.transform = 'scale(1)';
                (e.currentTarget as HTMLElement).style.background = isAction ? 'rgba(255, 255, 255, 0.05)' : 'rgba(255, 255, 255, 0.09)';
              }}
            >
              {key}
            </button>
          );
        })}
      </div>

      {/* Helper hint */}
      <div style={{ marginTop: '10px', fontSize: '11px', color: '#64748b', textAlign: 'center' }}>
        Tip: Enter <span style={{ color: '#38bdf8', fontWeight: 600 }}>1234</span> or type on your keyboard
      </div>
    </div>
  );
};

export default RealTimeDevicePinLock;
