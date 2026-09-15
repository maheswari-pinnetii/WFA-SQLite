import React, { Component, ErrorInfo, ReactNode } from 'react';
import { Box, Typography, Button } from '@mui/material';
import { AlertTriangle, RefreshCw } from 'lucide-react';

interface Props {
  children?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class GlobalErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Global React Error:', error, errorInfo);
  }

  private handleReset = () => {
    this.setState({ hasError: false, error: null });
    window.location.reload();
  };

  public render() {
    if (this.state.hasError) {
      return (
        <Box 
          sx={{ 
            display: 'flex', 
            flexDirection: 'column', 
            alignItems: 'center', 
            justifyContent: 'center',
            p: 6,
            minHeight: '100vh',
            bgcolor: '#0F172A',
            color: '#F8FAFC',
            textAlign: 'center'
          }}
        >
          <AlertTriangle size={64} color="#ef4444" style={{ marginBottom: '24px' }} />
          <Typography variant="h4" gutterBottom color="error" sx={{ fontWeight: 'bold' }}>
            Application Error
          </Typography>
          <Typography variant="body1" sx={{ mb: 4, maxWidth: 600, color: '#94A3B8' }}>
            We encountered a critical error while rendering the application. 
            This is usually temporary. Please try reloading the page.
          </Typography>
          {this.state.error && (
            <Box sx={{ display: 'block', mb: 4, p: 2, bgcolor: 'rgba(0,0,0,0.3)', borderRadius: 1, fontSize: '0.875rem', fontFamily: 'monospace', textAlign: 'left', overflowX: 'auto', maxWidth: '800px', width: '100%' }}>
              {this.state.error.toString()}
            </Box>
          )}
          <Button 
            variant="contained" 
            sx={{ bgcolor: '#10B981', '&:hover': { bgcolor: '#059669' } }}
            startIcon={<RefreshCw size={18} />}
            onClick={this.handleReset}
          >
            Reload Application
          </Button>
        </Box>
      );
    }

    return this.props.children;
  }
}
