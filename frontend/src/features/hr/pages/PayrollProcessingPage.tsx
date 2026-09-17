import React, { useState } from 'react';
import {
  Box,
  Typography,
  Paper,
  Button,
  Stack,
  TextField,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  CircularProgress
} from '@mui/material';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { payrollApi, PayrollRun } from '../../../api/endpoints/payroll.api';
import { startOfMonth, endOfMonth, format } from 'date-fns';

export default function PayrollProcessingPage() {
  const queryClient = useQueryClient();
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [periodStart, setPeriodStart] = useState(format(startOfMonth(new Date()), 'yyyy-MM-dd'));
  const [periodEnd, setPeriodEnd] = useState(format(endOfMonth(new Date()), 'yyyy-MM-dd'));

  const { data: runs, isLoading } = useQuery({
    queryKey: ['payrollRuns'],
    queryFn: () => payrollApi.getPayrollRuns()
  });

  const createRunMutation = useMutation({
    mutationFn: (params: { month: number; year: number }) => payrollApi.createPayrollRun(params),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['payrollRuns'] });
      setIsCreateModalOpen(false);
    }
  });

  const generatePayslipsMutation = useMutation({
    mutationFn: payrollApi.generatePayslips,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['payrollRuns'] })
  });

  const finalizeRunMutation = useMutation({
    mutationFn: payrollApi.finalizePayrollRun,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['payrollRuns'] })
  });

  const handleCreateRun = () => {
    const startDate = new Date(periodStart);
    const month = startDate.getMonth() + 1;
    const year = startDate.getFullYear();
    createRunMutation.mutate({ month, year });
  };

  const rows: PayrollRun[] = Array.isArray(runs?.data) ? runs.data : (Array.isArray(runs) ? runs : []);

  return (
    <Box>
      <Stack direction="row" sx={{ mb: 3, justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h4" sx={{ fontWeight: 'bold' }}>Payroll Processing Engine</Typography>
        <Button variant="contained" color="primary" onClick={() => setIsCreateModalOpen(true)}>
          New Payroll Run
        </Button>
      </Stack>

      <Paper sx={{ width: '100%', overflow: 'hidden' }}>
        <TableContainer sx={{ maxHeight: 600 }}>
          <Table stickyHeader>
            <TableHead>
              <TableRow>
                <TableCell sx={{ fontWeight: 'bold' }}>Run ID</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Period Start</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Period End</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Run Date</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Status</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={6} align="center" sx={{ py: 4 }}>
                    <CircularProgress size={32} />
                  </TableCell>
                </TableRow>
              ) : rows.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} align="center" sx={{ py: 4, color: 'text.secondary' }}>
                    No payroll runs found.
                  </TableCell>
                </TableRow>
              ) : (
                rows.map((row) => {
                  let color: 'default' | 'primary' | 'success' = 'default';
                  if (row.status === 'DRAFT') color = 'default';
                  if (row.status === 'CALCULATED' || row.status === 'VALIDATED') color = 'primary';
                  if (row.status === 'FINALIZED' || row.status === 'APPROVED') color = 'success';

                  return (
                    <TableRow key={row.id} hover>
                      <TableCell>{row.id}</TableCell>
                      <TableCell>{row.periodStart}</TableCell>
                      <TableCell>{row.periodEnd}</TableCell>
                      <TableCell>{new Date(row.runDate).toLocaleString()}</TableCell>
                      <TableCell>
                        <Chip label={row.status} color={color} size="small" />
                      </TableCell>
                      <TableCell>
                        <Stack direction="row" spacing={1}>
                          {row.status === 'DRAFT' && (
                            <Button
                              variant="outlined"
                              size="small"
                              onClick={() => generatePayslipsMutation.mutate(row.id)}
                              disabled={generatePayslipsMutation.isPending}
                            >
                              Generate Payslips
                            </Button>
                          )}
                          {(row.status === 'CALCULATED' || row.status === 'VALIDATED') && (
                            <Button
                              variant="contained"
                              color="primary"
                              size="small"
                              onClick={() => finalizeRunMutation.mutate(row.id)}
                              disabled={finalizeRunMutation.isPending}
                            >
                              Finalize Run
                            </Button>
                          )}
                        </Stack>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      <Dialog open={isCreateModalOpen} onClose={() => setIsCreateModalOpen(false)}>
        <DialogTitle>Create New Payroll Run</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 2, minWidth: 300 }}>
            <TextField
              label="Period Start"
              type="date"
              value={periodStart}
              onChange={(e) => setPeriodStart(e.target.value)}
              fullWidth
            />
            <TextField
              label="Period End"
              type="date"
              value={periodEnd}
              onChange={(e) => setPeriodEnd(e.target.value)}
              fullWidth
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setIsCreateModalOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleCreateRun} disabled={createRunMutation.isPending}>
            Create Run
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
