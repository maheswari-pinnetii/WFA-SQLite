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
  DialogActions
} from '@mui/material';
import { DataGrid, GridColDef } from '@mui/x-data-grid';
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
    mutationFn: payrollApi.createPayrollRun,
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

  const columns: GridColDef[] = [
    { field: 'id', headerName: 'Run ID', width: 280 },
    { field: 'periodStart', headerName: 'Period Start', width: 130 },
    { field: 'periodEnd', headerName: 'Period End', width: 130 },
    { field: 'runDate', headerName: 'Run Date', width: 200, valueGetter: (params: any) => new Date(params.value || params.row.runDate).toLocaleString() },
    {
      field: 'status',
      headerName: 'Status',
      width: 130,
      renderCell: (params) => {
        let color: 'default' | 'primary' | 'success' = 'default';
        if (params.value === 'DRAFT') color = 'default';
        if (params.value === 'PROCESSED') color = 'primary';
        if (params.value === 'FINALIZED') color = 'success';
        return <Chip label={params.value} color={color} size="small" />;
      }
    },
    {
      field: 'actions',
      headerName: 'Actions',
      width: 250,
      renderCell: (params) => (
        <Stack direction="row" spacing={1} sx={{ mt: 0.5 }}>
          {params.row.status === 'DRAFT' && (
            <Button
              variant="outlined"
              size="small"
              onClick={() => generatePayslipsMutation.mutate(params.row.id)}
              disabled={generatePayslipsMutation.isPending}
            >
              Generate Payslips
            </Button>
          )}
          {params.row.status === 'PROCESSED' && (
            <Button
              variant="contained"
              color="primary"
              size="small"
              onClick={() => finalizeRunMutation.mutate(params.row.id)}
              disabled={finalizeRunMutation.isPending}
            >
              Finalize Run
            </Button>
          )}
        </Stack>
      )
    }
  ];

  return (
    <Box>
      <Stack direction="row" sx={{ mb: 3, justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h4" sx={{ fontWeight: 'bold' }}>Payroll Processing Engine</Typography>
        <Button variant="contained" color="primary" onClick={() => setIsCreateModalOpen(true)}>
          New Payroll Run
        </Button>
      </Stack>

      <Paper sx={{ height: 600, width: '100%' }}>
        <DataGrid
          rows={runs?.data || []}
          columns={columns}
          loading={isLoading}
          disableRowSelectionOnClick
          pageSizeOptions={[10, 25, 50]}
        />
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
