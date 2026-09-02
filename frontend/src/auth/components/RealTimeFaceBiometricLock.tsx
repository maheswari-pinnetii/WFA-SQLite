import React, { useState, useEffect, useRef } from 'react';

interface RealTimeFaceBiometricLockProps {
  onSuccess: () => void;
  isLoading?: boolean;
  mode?: 'face' | 'biometric';
}

export const RealTimeFaceBiometricLock: React.FC<RealTimeFaceBiometricLockProps> = ({
  onSuccess,
  isLoading = false,
  mode = 'face',
}) => {
  const [isScanning, setIsScanning] = useState<boolean>(false);
  const [progress, setProgress] = useState<number>(0);
  const [stageText, setStageText] = useState<string>('Ready for verification');
  const [useWebcam, setUseWebcam] = useState<boolean>(false);
  const [webcamError, setWebcamError] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState<boolean>(false);

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  // Stop camera when component unmounts or webcam is toggled off
  useEffect(() => {
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
      }
    };
  }, []);

  const toggleWebcam = async () => {
    if (useWebcam) {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
        streamRef.current = null;
      }
      setUseWebcam(false);
      setWebcamError(null);
    } else {
      try {
        if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
          throw new Error('Webcam not supported in this environment.');
        }
        const stream = await navigator.mediaDevices.getUserMedia({ video: { width: 320, height: 240 } });
        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
        setUseWebcam(true);
        setWebcamError(null);
      } catch {
        setWebcamError('Camera unavailable. Using biometric simulation.');
        setUseWebcam(false);
      }
    }
  };

  const startScan = () => {
    if (isScanning || isSuccess || isLoading) return;
    setIsScanning(true);
    setProgress(0);
    setStageText(mode === 'face' ? 'Detecting facial contour...' : 'Positioning biometric sensor...');

    let current = 0;
    const interval = setInterval(() => {
      current += 10;
      setProgress(current);

      if (current === 30) {
        setStageText(mode === 'face' ? 'Analyzing 3D facial landmarks...' : 'Scanning dermal ridges...');
      } else if (current === 70) {
        setStageText(mode === 'face' ? 'Matching cryptographic biometric mesh...' : 'Verifying biometric identity...');
      } else if (current >= 100) {
        clearInterval(interval);
        setIsScanning(false);
        setIsSuccess(true);
        setStageText(mode === 'face' ? '✓ Face Recognized' : '✓ Biometric Match Confirmed');
        setTimeout(() => {
          onSuccess();
        }, 500);
      }
    }, 120);
  };

  return (
    <div
      className="realtime-biometric-lock-container"
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
      <div style={{ textAlign: 'center', marginBottom: '8px' }}>
        <div style={{ fontSize: '11px', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 600 }}>
          {mode === 'face' ? 'Face ID / Windows Hello' : 'Touch ID / Fingerprint'}
        </div>
        <div style={{ fontSize: '13px', fontWeight: 600, color: isSuccess ? '#10b981' : '#f8fafc', marginTop: '2px' }}>
          {stageText}
        </div>
      </div>

      {/* Interactive Biometric Scanner Zone */}
      <div
        role="button"
        tabIndex={0}
        onClick={startScan}
        onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') startScan(); }}
        className="ms-biometric-hud biometric-hud-box"
        style={{
          position: 'relative',
          width: '160px',
          height: '160px',
          borderRadius: '16px',
          overflow: 'hidden',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: isScanning || isSuccess ? 'default' : 'pointer',
          background: 'radial-gradient(circle at center, rgba(30, 41, 59, 0.9), rgba(15, 23, 42, 0.98))',
          border: isSuccess ? '2px solid #10b981' : isScanning ? '2px solid #38bdf8' : '1px solid rgba(255, 255, 255, 0.12)',
          boxShadow: isSuccess
            ? '0 0 20px rgba(16, 185, 129, 0.4)'
            : isScanning
            ? '0 0 20px rgba(56, 189, 248, 0.35)'
            : 'none',
          transition: 'all 0.3s ease',
        }}
      >
        {/* HUD Corner Accents */}
        <div className="ms-corner ms-corner-tl hud-corner-tl" />
        <div className="ms-corner ms-corner-tr hud-corner-tr" />
        <div className="ms-corner ms-corner-bl hud-corner-bl" />
        <div className="ms-corner ms-corner-br hud-corner-br" />

        {/* Live Webcam Stream if enabled */}
        {useWebcam && (
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            style={{
              position: 'absolute',
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              transform: 'scaleX(-1)', // mirror
              opacity: 0.85,
            }}
          />
        )}

        {/* Dynamic Holographic Vector Mesh */}
        {mode === 'face' ? (
          <svg width="110" height="110" viewBox="0 0 100 100" fill="none" style={{ position: 'relative', zIndex: 2 }}>
            <ellipse cx="50" cy="48" rx="26" ry="32" stroke={isSuccess ? '#10b981' : '#c084fc'} strokeWidth="3" strokeDasharray="5 3" />
            <path d="M42 42 Q50 38 58 42" stroke={isSuccess ? '#10b981' : '#38bdf8'} strokeWidth="2.5" strokeLinecap="round" />
            <circle cx="43" cy="48" r="3.5" fill={isSuccess ? '#10b981' : '#e9d5ff'} />
            <circle cx="57" cy="48" r="3.5" fill={isSuccess ? '#10b981' : '#e9d5ff'} />
            <path d="M50 50 V58 L46 60" stroke={isSuccess ? '#10b981' : '#a855f7'} strokeWidth="2.5" strokeLinecap="round" />
            <path d="M44 68 Q50 72 56 68" stroke={isSuccess ? '#10b981' : '#00f0ff'} strokeWidth="2.5" strokeLinecap="round" />
            {isScanning && (
              <line x1="16" y1="50" x2="84" y2="50" stroke="#00f0ff" strokeWidth="3" strokeLinecap="round" className="ms-hud-beam" />
            )}
          </svg>
        ) : (
          <svg width="110" height="110" viewBox="0 0 100 100" fill="none" style={{ position: 'relative', zIndex: 2 }}>
            <path d="M50 20 C36 20 28 32 28 48 C28 62 34 72 42 80" stroke={isSuccess ? '#10b981' : '#c084fc'} strokeWidth="3" strokeLinecap="round" />
            <path d="M50 30 C40 30 36 38 36 48 C36 58 40 66 46 72" stroke={isSuccess ? '#10b981' : '#a855f7'} strokeWidth="3" strokeLinecap="round" />
            <circle cx="50" cy="50" r="4" fill={isSuccess ? '#10b981' : '#e9d5ff'} />
            <path d="M50 20 C64 20 72 32 72 48 C72 62 66 72 58 80" stroke={isSuccess ? '#10b981' : '#38bdf8'} strokeWidth="3" strokeLinecap="round" />
            <path d="M50 30 C60 30 64 38 64 48 C64 58 60 66 54 72" stroke={isSuccess ? '#10b981' : '#00e5ff'} strokeWidth="3" strokeLinecap="round" />
            {isScanning && (
              <line x1="20" y1="50" x2="80" y2="50" stroke="#00f0ff" strokeWidth="3.5" strokeLinecap="round" className="ms-hud-beam" />
            )}
          </svg>
        )}

        {/* Scan Status Overlay */}
        {isScanning && (
          <div
            style={{
              position: 'absolute',
              bottom: '8px',
              fontSize: '11px',
              fontWeight: 700,
              color: '#38bdf8',
              zIndex: 3,
              background: 'rgba(15, 23, 42, 0.85)',
              padding: '2px 8px',
              borderRadius: '6px',
            }}
          >
            Scanning {progress}%
          </div>
        )}
      </div>

      {/* Progress Bar when scanning */}
      <div
        style={{
          width: '160px',
          height: '4px',
          background: 'rgba(255, 255, 255, 0.08)',
          borderRadius: '2px',
          overflow: 'hidden',
          marginTop: '10px',
        }}
      >
        <div
          style={{
            height: '100%',
            width: `${progress}%`,
            background: isSuccess ? '#10b981' : '#38bdf8',
            transition: 'width 0.15s ease',
          }}
        />
      </div>

      {/* Trigger Button & Live Camera Toggle */}
      <div style={{ marginTop: '12px', display: 'flex', gap: '8px' }}>
        <button
          type="button"
          onClick={startScan}
          disabled={isScanning || isSuccess || isLoading}
          style={{
            fontSize: '12px',
            fontWeight: 600,
            padding: '6px 14px',
            borderRadius: '8px',
            background: isSuccess ? '#10b981' : '#2563eb',
            border: 'none',
            color: '#ffffff',
            cursor: isScanning || isSuccess ? 'default' : 'pointer',
          }}
        >
          {isSuccess ? '✓ Unlocked' : isScanning ? 'Verifying...' : `Scan ${mode === 'face' ? 'Face' : 'Fingerprint'}`}
        </button>

        {mode === 'face' && (
          <button
            type="button"
            onClick={toggleWebcam}
            title="Toggle real camera feed"
            style={{
              fontSize: '11px',
              padding: '6px 10px',
              borderRadius: '8px',
              background: useWebcam ? 'rgba(16, 185, 129, 0.15)' : 'rgba(255, 255, 255, 0.06)',
              border: useWebcam ? '1px solid #10b981' : '1px solid rgba(255, 255, 255, 0.12)',
              color: useWebcam ? '#34d399' : '#94a3b8',
              cursor: 'pointer',
            }}
          >
            {useWebcam ? '📷 Camera On' : '📷 Live Cam'}
          </button>
        )}
      </div>

      {webcamError && (
        <div style={{ marginTop: '6px', fontSize: '10px', color: '#f59e0b', textAlign: 'center' }}>
          {webcamError}
        </div>
      )}
    </div>
  );
};

export default RealTimeFaceBiometricLock;
