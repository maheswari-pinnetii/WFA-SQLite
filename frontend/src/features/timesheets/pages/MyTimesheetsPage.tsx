import React, { useEffect, useState } from 'react';
import { Container, Typography, Paper, Table, TableBody, TableCell, TableHead, TableRow, Chip, Button, Box } from '@mui/material';
import { apiClient as api } from '../../../api/client';
import { useNavigate } from 'react-router-dom';
import { format } from 'date-fns';

export const MyTimesheetsPage: React.FC = () => {
  const [timesheets, setTimesheets] = useState<any[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchTimesheets = async () => {
      try {
        const res = await api.get('/timesheets');
        setTimesheets(res.data.data);
      } catch (e) {
        console.error('Failed to fetch timesheets', e);
      }
    };
    fetchTimesheets();
  }, []);

  return (
    <Container maxWidth="lg" sx={{ mt: 4 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h4">My Timesheets</Typography>
        <Button variant="contained" color="primary" onClick={() => navigate('/timesheets/entry')}>
          New Timesheet
        </Button>
      </Box>

      <Paper>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Period</TableCell>
              <TableCell>Total Hours</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Action</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {timesheets.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} align="center">No timesheets found.</TableCell>
              </TableRow>
            ) : (
              timesheets.map(ts => (
                <TableRow key={ts.id}>
                  <TableCell>{format(new Date(ts.startDate), 'MMM dd, yyyy')} - {format(new Date(ts.endDate), 'MMM dd, yyyy')}</TableCell>
                  <TableCell>{ts.totalHours}</TableCell>
                  <TableCell>
                    <Chip 
                      label={ts.status} 
                      color={ts.status === 'APPROVED' ? 'success' : ts.status === 'PENDING' ? 'warning' : ts.status === 'REJECTED' ? 'error' : 'default'} 
                    />
                  </TableCell>
                  <TableCell>
                    <Button variant="outlined" size="small" onClick={() => navigate(`/timesheets/entry/${ts.id}`)}>
                      View
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </Paper>
    </Container>
  );
};
