import React, { useEffect, useState } from 'react';
import {
  Box,
  Typography,
  Button,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  CircularProgress
} from '@mui/material';
import { PlayArrow, CheckCircle, Add } from '@mui/icons-material';
import { payrollApi, PayrollRun } from '../../../api/payrollApi.ts';

const PayrollDashboard: React.FC = () => {
  const [runs, setRuns] = useState<PayrollRun[]>([]);
  const [loading, setLoading] = useState(true);
  const [openCreate, setOpenCreate] = useState(false);
  const [month, setMonth] = useState<number>(new Date().getMonth() + 1);
  const [year, setYear] = useState<number>(new Date().getFullYear());
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchRuns();
  }, []);

  const fetchRuns = async () => {
    try {
      setLoading(true);
      const data = await payrollApi.getPayrollRuns();
      setRuns(data);
    } catch (err) {
      console.error('Failed to fetch payroll runs', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateRun = async () => {
    try {
      setSubmitting(true);
      await payrollApi.createPayrollRun(month, year);
      setOpenCreate(false);
      fetchRuns();
    } catch (err) {
      console.error(err);
      alert('Failed to create run');
    } finally {
      setSubmitting(false);
    }
  };

  const handleGenerate = async (runId: string) => {
    try {
      await payrollApi.generatePayslips(runId);
      alert('Payslips generated successfully!');
      fetchRuns();
    } catch (err) {
      console.error(err);
      alert('Failed to generate payslips');
    }
  };

  const handleFinalize = async (runId: string) => {
    if (!window.confirm('Are you sure? This will lock the payslips permanently.')) return;
    try {
      await payrollApi.finalizePayrollRun(runId);
      alert('Payroll finalized!');
      fetchRuns();
    } catch (err) {
      console.error(err);
      alert('Failed to finalize');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'DRAFT': return 'warning';
      case 'FINALIZED': return 'success';
      case 'PROCESSED': return 'info';
      default: return 'default';
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
        <Typography variant="h4" >Payroll Processing</Typography>
        <Button 
          variant="contained" 
          startIcon={<Add />} 
          onClick={() => setOpenCreate(true)}
        >
          New Payroll Run
        </Button>
      </Box>

      <TableContainer component={Paper} elevation={2}>
        <Table>
          <TableHead>
            <TableRow sx={{ backgroundColor: 'background.default' }}>
              <TableCell><strong>Period</strong></TableCell>
              <TableCell><strong>Run Date</strong></TableCell>
              <TableCell><strong>Status</strong></TableCell>
              <TableCell align="right"><strong>Actions</strong></TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={4} align="center"><CircularProgress /></TableCell>
              </TableRow>
            ) : runs.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} align="center">No payroll runs found.</TableCell>
              </TableRow>
            ) : (
              runs.map((run) => (
                <TableRow key={run.id} hover>
                  <TableCell>{run.periodStart} to {run.periodEnd}</TableCell>
                  <TableCell>{new Date(run.runDate).toLocaleDateString()}</TableCell>
                  <TableCell>
                    <Chip size="small" label={run.status} color={getStatusColor(run.status) as any} />
                  </TableCell>
                  <TableCell align="right">
                    {run.status === 'DRAFT' && (
                      <>
                        <Button 
                          size="small" 
                          startIcon={<PlayArrow />} 
                          onClick={() => handleGenerate(run.id)}
                          sx={{ mr: 1 }}
                        >
                          Generate
                        </Button>
                        <Button 
                          size="small" 
                          color="success" 
                          startIcon={<CheckCircle />} 
                          onClick={() => handleFinalize(run.id)}
                        >
                          Finalize
                        </Button>
                      </>
                    )}
                    {run.status !== 'DRAFT' && (
                      <Button size="small" variant="outlined" color="primary">
                        View Report
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog open={openCreate} onClose={() => setOpenCreate(false)}>
        <DialogTitle>Create Payroll Run</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', gap: 2, mt: 2 }}>
            <TextField 
              label="Month (1-12)" 
              type="number" 
              value={month} 
              onChange={(e) => setMonth(Number(e.target.value))}
              
            />
            <TextField 
              label="Year" 
              type="number" 
              value={year} 
              onChange={(e) => setYear(Number(e.target.value))}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenCreate(false)}>Cancel</Button>
          <Button 
            variant="contained" 
            onClick={handleCreateRun} 
            disabled={submitting}
          >
            Create Run
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default PayrollDashboard;
