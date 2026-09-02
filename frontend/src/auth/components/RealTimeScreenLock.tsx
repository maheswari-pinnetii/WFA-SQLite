import React, { useState, useEffect } from 'react';

interface RealTimeScreenLockProps {
  onSuccess: () => void;
  isLoading?: boolean;
}

export const RealTimeScreenLock: React.FC<RealTimeScreenLockProps> = ({
  onSuccess,
  isLoading = false,
}) => {
  const [currentTime, setCurrentTime] = useState<string>('');
  const [currentDate, setCurrentDate] = useState<string>('');
  const [isUnlocked, setIsUnlocked] = useState<boolean>(false);

  // Live real-time clock
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentTime(
        now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      );
      setCurrentDate(
        now.toLocaleDateString([], { weekday: 'long', month: 'short', day: 'numeric' })
      );
    };

    updateTime();
    const timer = setInterval(updateTime, 1000);
    return () => clearInterval(timer);
  }, []);

  const handleUnlock = () => {
    if (isUnlocked || isLoading) return;
    setIsUnlocked(true);
    setTimeout(() => {
      onSuccess();
    }, 450);
  };

  return (
    <div
      className="realtime-screen-lock-container"
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        padding: '16px 14px',
        background: 'linear-gradient(145deg, rgba(15, 23, 42, 0.95), rgba(30, 41, 59, 0.85))',
        border: '1px solid rgba(255, 255, 255, 0.1)',
        borderRadius: '16px',
        width: '100%',
        maxWidth: '310px',
        margin: '0 auto',
        boxSizing: 'border-box',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Top Status Bar: WiFi & Battery */}
      <div
        style={{
          width: '100%',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          fontSize: '10px',
          color: '#94a3b8',
          marginBottom: '10px',
        }}
      >
        <span>📶 Stackly-Corp-5G</span>
        <span>⚡ 100% Locked</span>
      </div>

      {/* Real-time Large Digital Clock */}
      <div style={{ textAlign: 'center', margin: '4px 0 14px' }}>
        <div
          style={{
            fontSize: '36px',
            fontWeight: 800,
            color: '#ffffff',
            letterSpacing: '-0.02em',
            lineHeight: 1,
            fontFamily: 'system-ui, -apple-system, sans-serif',
          }}
        >
          {currentTime || '12:00'}
        </div>
        <div style={{ fontSize: '11px', color: '#cbd5e1', marginTop: '4px', fontWeight: 500 }}>
          {currentDate || 'Monday, September 2'}
        </div>
      </div>

      {/* Lock Icon / Shield Badge */}
      <div
        style={{
          width: '56px',
          height: '56px',
          borderRadius: '50%',
          background: isUnlocked
            ? 'rgba(16, 185, 129, 0.2)'
            : 'rgba(56, 189, 248, 0.12)',
          border: isUnlocked
            ? '2px solid #10b981'
            : '1px solid rgba(56, 189, 248, 0.3)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: '16px',
          transition: 'all 0.3s ease',
          boxShadow: isUnlocked ? '0 0 16px #10b981' : 'none',
        }}
      >
        {isUnlocked ? (
          <span style={{ fontSize: '24px' }}>🔓</span>
        ) : (
          <span style={{ fontSize: '24px' }}>🔒</span>
        )}
      </div>

      {/* Interactive Swipe / Click to Unlock Button */}
      <button
        type="button"
        onClick={handleUnlock}
        disabled={isUnlocked || isLoading}
        style={{
          width: '100%',
          padding: '10px 16px',
          borderRadius: '12px',
          background: isUnlocked
            ? 'linear-gradient(135deg, #10b981, #059669)'
            : 'linear-gradient(135deg, #2563eb, #1d4ed8)',
          border: 'none',
          color: '#ffffff',
          fontSize: '13px',
          fontWeight: 700,
          cursor: isUnlocked ? 'default' : 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '8px',
          boxShadow: '0 4px 12px rgba(37, 99, 235, 0.3)',
          transition: 'all 0.2s ease',
        }}
        onMouseDown={(e) => {
          if (!isUnlocked) (e.currentTarget as HTMLElement).style.transform = 'scale(0.98)';
        }}
        onMouseUp={(e) => {
          if (!isUnlocked) (e.currentTarget as HTMLElement).style.transform = 'scale(1)';
        }}
      >
        <span>{isUnlocked ? 'Device Unlocked' : 'Swipe or Click to Unlock'}</span>
        <span>&rarr;</span>
      </button>

      <div style={{ fontSize: '10px', color: '#64748b', marginTop: '8px', textAlign: 'center' }}>
        Press button to simulate OS device screen unlock
      </div>
    </div>
  );
};

export default RealTimeScreenLock;
