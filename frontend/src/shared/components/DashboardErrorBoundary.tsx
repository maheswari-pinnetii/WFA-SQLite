import React, { Component, ErrorInfo, ReactNode } from 'react';
import { Box, Typography, Button } from '@mui/material';
import { AlertTriangle, RefreshCw } from 'lucide-react';

interface Props {
  children?: ReactNode;
  fallback?: ReactNode;
  dashboardName?: string;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class DashboardErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Dashboard Error:', error, errorInfo);
  }

  private handleReset = () => {
    this.setState({ hasError: false, error: null });
    window.location.reload();
  };

  public render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <Box 
          sx={{ 
            display: 'flex', 
            flexDirection: 'column', 
            alignItems: 'center', 
            justifyContent: 'center',
            p: 6,
            minHeight: '400px',
            bgcolor: 'background.paper',
            borderRadius: 2,
            boxShadow: 1,
            textAlign: 'center'
          }}
          className="glass-panel"
        >
          <AlertTriangle size={48} color="#ef4444" style={{ marginBottom: '16px' }} />
          <Typography variant="h5" color="error" gutterBottom fontWeight="bold">
            {this.props.dashboardName ? `${this.props.dashboardName} Error` : 'Dashboard Error'}
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ mb: 3, maxWidth: 500 }}>
            We encountered an unexpected error while loading this dashboard. 
            {this.state.error && (
              <Box component="span" sx={{ display: 'block', mt: 1, p: 2, bgcolor: 'action.hover', borderRadius: 1, fontSize: '0.875rem', fontFamily: 'monospace', textAlign: 'left', overflowX: 'auto' }}>
                {this.state.error.toString()}
              </Box>
            )}
          </Typography>
          <Button 
            variant="contained" 
            color="primary" 
            startIcon={<RefreshCw size={18} />}
            onClick={this.handleReset}
            className="btn btn-primary"
          >
            Reload Dashboard
          </Button>
        </Box>
      );
    }

    return this.props.children;
  }
}
