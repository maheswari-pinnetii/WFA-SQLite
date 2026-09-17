import { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

/**
 * Top-level error boundary — must use ONLY inline styles and zero external imports
 * so it cannot itself crash when the rest of the app fails to render.
 */
export class ErrorBoundary extends Component<Props, State> {
  public state: State = { hasError: false, error: null };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('[ErrorBoundary] Uncaught render error:', error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div style={{
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '24px',
          backgroundColor: '#0F172A',
          color: '#F8FAFC',
          fontFamily: 'Inter, system-ui, sans-serif',
        }}>
          <div style={{
            maxWidth: '480px',
            width: '100%',
            background: 'rgba(30,41,59,0.95)',
            border: '1px solid #334155',
            borderRadius: '16px',
            padding: '32px',
            textAlign: 'center',
            boxShadow: '0 25px 50px rgba(0,0,0,0.5)',
          }}>
            <div style={{
              width: '64px',
              height: '64px',
              background: 'rgba(239,68,68,0.1)',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 16px',
              fontSize: '28px',
            }}>⚠</div>
            <h2 style={{ fontSize: '20px', fontWeight: 700, marginBottom: '8px' }}>
              Unexpected Error
            </h2>
            <p style={{ fontSize: '13px', color: '#94A3B8', marginBottom: '16px' }}>
              An isolated rendering error occurred. Check the browser console for details.
            </p>
            {this.state.error && (
              <div style={{
                padding: '12px',
                background: '#0F172A',
                borderRadius: '8px',
                border: '1px solid #334155',
                fontSize: '11px',
                fontFamily: 'monospace',
                color: '#f87171',
                textAlign: 'left',
                overflowX: 'auto',
                maxHeight: '120px',
                marginBottom: '16px',
              }}>
                {this.state.error.message}
              </div>
            )}
            <button
              onClick={() => window.location.assign('/')}
              style={{
                width: '100%',
                padding: '10px 0',
                borderRadius: '12px',
                background: '#059669',
                color: '#fff',
                fontWeight: 700,
                fontSize: '13px',
                border: 'none',
                cursor: 'pointer',
              }}
            >
              ↺ Recover Application
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
