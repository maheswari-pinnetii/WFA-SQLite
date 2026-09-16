import React, { useEffect, useState } from 'react';
import {
  Box,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  CircularProgress
} from '@mui/material';
import { Download } from '@mui/icons-material';
import { payrollApi, Payslip } from '../../../api/payrollApi.ts';

const MyPayslips: React.FC = () => {
  const [payslips, setPayslips] = useState<Payslip[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPayslips();
  }, []);

  const fetchPayslips = async () => {
    try {
      setLoading(true);
      const data = await payrollApi.getMyPayslips();
      setPayslips(data);
    } catch (err) {
      console.error('Failed to fetch payslips', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = (payslip: Payslip) => {
    // In a real implementation, this would trigger a PDF download from the backend
    alert(`Downloading PDF for payslip ${payslip.id}`);
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4"  sx={{ mb: 3 }}>My Payslips</Typography>

      <TableContainer component={Paper} elevation={2}>
        <Table>
          <TableHead>
            <TableRow sx={{ backgroundColor: 'background.default' }}>
              <TableCell><strong>Period</strong></TableCell>
              <TableCell><strong>Gross Earnings</strong></TableCell>
              <TableCell><strong>Deductions</strong></TableCell>
              <TableCell><strong>Net Pay</strong></TableCell>
              <TableCell align="right"><strong>Action</strong></TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={5} align="center"><CircularProgress /></TableCell>
              </TableRow>
            ) : payslips.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} align="center">No payslips available yet.</TableCell>
              </TableRow>
            ) : (
              payslips.map((payslip) => (
                <TableRow key={payslip.id} hover>
                  <TableCell>{payslip.periodStart} to {payslip.periodEnd}</TableCell>
                  <TableCell>₹{payslip.totalEarnings.toLocaleString()}</TableCell>
                  <TableCell>₹{payslip.totalDeductions.toLocaleString()}</TableCell>
                  <TableCell><strong>₹{payslip.netPay.toLocaleString()}</strong></TableCell>
                  <TableCell align="right">
                    <Button 
                      size="small" 
                      variant="outlined" 
                      startIcon={<Download />}
                      onClick={() => handleDownload(payslip)}
                    >
                      Download PDF
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
};

export default MyPayslips;
