import React, { useState, useRef, useEffect } from 'react';

interface RealTimePatternLockProps {
  onSuccess: (pattern?: number[]) => void;
  isLoading?: boolean;
}

interface Point {
  x: number;
  y: number;
}

export const RealTimePatternLock: React.FC<RealTimePatternLockProps> = ({
  onSuccess,
  isLoading = false,
}) => {
  const [selectedDots, setSelectedDots] = useState<number[]>([]);
  const [isDrawing, setIsDrawing] = useState<boolean>(false);
  const [currentMousePos, setCurrentMousePos] = useState<Point | null>(null);
  const [patternStatus, setPatternStatus] = useState<'idle' | 'success' | 'error'>('idle');

  const containerRef = useRef<HTMLDivElement | null>(null);

  // 3x3 Matrix Node Positions (percent coordinates)
  const DOT_COORDINATES: Point[] = [
    { x: 30, y: 30 }, { x: 100, y: 30 }, { x: 170, y: 30 },
    { x: 30, y: 100 }, { x: 100, y: 100 }, { x: 170, y: 100 },
    { x: 30, y: 170 }, { x: 100, y: 170 }, { x: 170, y: 170 },
  ];

  const handleStart = (dotIndex: number) => {
    if (patternStatus === 'success' || isLoading) return;
    setIsDrawing(true);
    setSelectedDots([dotIndex]);
    setPatternStatus('idle');
  };

  const handleEnterDot = (dotIndex: number) => {
    if (!isDrawing || patternStatus === 'success') return;
    if (!selectedDots.includes(dotIndex)) {
      setSelectedDots((prev) => [...prev, dotIndex]);
    }
  };

  const handleEnd = () => {
    if (!isDrawing) return;
    setIsDrawing(false);
    setCurrentMousePos(null);

    if (selectedDots.length >= 4) {
      setPatternStatus('success');
      setTimeout(() => {
        onSuccess(selectedDots);
      }, 500);
    } else if (selectedDots.length > 0) {
      setPatternStatus('error');
      setTimeout(() => {
        setSelectedDots([]);
        setPatternStatus('idle');
      }, 700);
    }
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isDrawing || !containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const scale = 200 / rect.width;
    setCurrentMousePos({
      x: (e.clientX - rect.left) * scale,
      y: (e.clientY - rect.top) * scale,
    });
  };

  // Quick Demo Auto-Unlock (for accessibility or quick click)
  const handleQuickPattern = () => {
    if (isDrawing || patternStatus === 'success') return;
    const demoDots = [0, 1, 2, 4, 6, 7, 8];
    setSelectedDots(demoDots); // Z or S wave pattern
    setPatternStatus('success');
    setTimeout(() => {
      onSuccess(demoDots);
    }, 450);
  };

  // Global mouseup in case cursor leaves the canvas
  useEffect(() => {
    const onWindowMouseUp = () => {
      if (isDrawing) handleEnd();
    };
    window.addEventListener('mouseup', onWindowMouseUp);
    return () => window.removeEventListener('mouseup', onWindowMouseUp);
  }, [isDrawing, selectedDots]);

  const lineColor =
    patternStatus === 'success'
      ? '#10b981'
      : patternStatus === 'error'
      ? '#ef4444'
      : '#38bdf8';

  return (
    <div
      className="realtime-pattern-lock-container"
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
        userSelect: 'none',
      }}
    >
      <div style={{ textAlign: 'center', marginBottom: '10px' }}>
        <div style={{ fontSize: '11px', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 600 }}>
          Pattern Screen Lock
        </div>
        <div style={{ fontSize: '13px', fontWeight: 600, color: '#f8fafc', marginTop: '2px' }}>
          {patternStatus === 'success'
            ? '✓ Pattern Verified - Unlocking'
            : patternStatus === 'error'
            ? 'Connect at least 4 dots'
            : 'Draw your unlock pattern'}
        </div>
      </div>

      {/* 200x200 Pattern Grid Canvas */}
      <div
        ref={containerRef}
        onMouseMove={handleMouseMove}
        onMouseLeave={() => setCurrentMousePos(null)}
        style={{
          position: 'relative',
          width: '200px',
          height: '200px',
          background: 'radial-gradient(circle at center, rgba(30, 41, 59, 0.8), rgba(15, 23, 42, 0.95))',
          borderRadius: '16px',
          border: '1px solid rgba(255, 255, 255, 0.12)',
          boxShadow: 'inset 0 0 20px rgba(0, 0, 0, 0.5)',
          cursor: isDrawing ? 'crosshair' : 'pointer',
          touchAction: 'none',
        }}
      >
        <svg width="200" height="200" style={{ position: 'absolute', top: 0, left: 0, pointerEvents: 'none' }}>
          {/* Static Connecting Lines between selected nodes */}
          {selectedDots.map((dotIdx, i) => {
            if (i === 0) return null;
            const prev = DOT_COORDINATES[selectedDots[i - 1]];
            const curr = DOT_COORDINATES[dotIdx];
            return (
              <line
                key={`line-${i}`}
                x1={prev.x}
                y1={prev.y}
                x2={curr.x}
                y2={curr.y}
                stroke={lineColor}
                strokeWidth="4"
                strokeLinecap="round"
                filter="drop-shadow(0 0 6px currentColor)"
              />
            );
          })}

          {/* Active drag line tracking mouse */}
          {isDrawing && selectedDots.length > 0 && currentMousePos && (
            <line
              x1={DOT_COORDINATES[selectedDots[selectedDots.length - 1]].x}
              y1={DOT_COORDINATES[selectedDots[selectedDots.length - 1]].y}
              x2={currentMousePos.x}
              y2={currentMousePos.y}
              stroke="rgba(56, 189, 248, 0.75)"
              strokeWidth="3.5"
              strokeDasharray="4 3"
              strokeLinecap="round"
            />
          )}
        </svg>

        {/* 9 Interactive Dot Nodes */}
        {DOT_COORDINATES.map((coord, idx) => {
          const isSelected = selectedDots.includes(idx);
          const isFirst = selectedDots[0] === idx;
          return (
            <div
              key={`dot-${idx}`}
              onMouseDown={() => handleStart(idx)}
              onMouseEnter={() => handleEnterDot(idx)}
              style={{
                position: 'absolute',
                top: `${coord.y - 18}px`,
                left: `${coord.x - 18}px`,
                width: '36px',
                height: '36px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
              }}
            >
              <div
                style={{
                  width: isSelected ? '18px' : '12px',
                  height: isSelected ? '18px' : '12px',
                  borderRadius: '50%',
                  background: isSelected
                    ? lineColor
                    : 'rgba(255, 255, 255, 0.4)',
                  boxShadow: isSelected
                    ? `0 0 12px ${lineColor}`
                    : '0 0 4px rgba(255, 255, 255, 0.2)',
                  border: isFirst ? '2px solid #ffffff' : 'none',
                  transition: 'all 0.15s ease',
                }}
              />
            </div>
          );
        })}
      </div>

      {/* Footer controls & hints */}
      <div style={{ marginTop: '12px', display: 'flex', gap: '8px', alignItems: 'center' }}>
        <button
          type="button"
          onClick={() => {
            setSelectedDots([]);
            setPatternStatus('idle');
          }}
          disabled={selectedDots.length === 0}
          style={{
            fontSize: '11px',
            padding: '4px 10px',
            borderRadius: '8px',
            background: 'rgba(255, 255, 255, 0.06)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            color: '#94a3b8',
            cursor: selectedDots.length === 0 ? 'default' : 'pointer',
          }}
        >
          Reset Pattern
        </button>

        <button
          type="button"
          onClick={handleQuickPattern}
          style={{
            fontSize: '11px',
            padding: '4px 10px',
            borderRadius: '8px',
            background: 'rgba(56, 189, 248, 0.12)',
            border: '1px solid rgba(56, 189, 248, 0.25)',
            color: '#38bdf8',
            fontWeight: 600,
            cursor: 'pointer',
          }}
        >
          Demo Pattern ⚡
        </button>
      </div>
    </div>
  );
};

export default RealTimePatternLock;
