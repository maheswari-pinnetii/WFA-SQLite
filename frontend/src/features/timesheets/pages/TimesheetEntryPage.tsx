import React, { useEffect, useState } from 'react';
import { Container, Typography, Paper, Table, TableBody, TableCell, TableHead, TableRow, Button, Box, TextField, MenuItem } from '@mui/material';
import { api } from '../../../shared/api';
import { useNavigate, useParams } from 'react-router-dom';
import { startOfWeek, endOfWeek, format, addDays } from 'date-fns';

export const TimesheetEntryPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [projects, setProjects] = useState<any[]>([]);
  const [entries, setEntries] = useState<any[]>([]);
  const [status, setStatus] = useState<string>('DRAFT');
  
  // Weekly dates
  const today = new Date();
  const weekStart = startOfWeek(today, { weekStartsOn: 1 });
  const weekEnd = endOfWeek(today, { weekStartsOn: 1 });
  const days = Array.from({ length: 7 }).map((_, i) => addDays(weekStart, i));

  useEffect(() => {
    const fetchProjects = async () => {
      const res = await api.get('/projects');
      setProjects(res.data.data);
    };
    fetchProjects();

    if (id) {
      const fetchTimesheet = async () => {
        const res = await api.get(`/timesheets/${id}`);
        setEntries(res.data.data.entries || []);
        setStatus(res.data.data.status);
      };
      fetchTimesheet();
    }
  }, [id]);

  const handleAddRow = () => {
    // Add a blank row structure
    // We'll just add one entry per day for a new selected project
    // Actually, simple structure: each row represents a project. 
    // This is just UI state; we'll translate it to flat entries on save.
  };

  // For simplicity in this demo, we'll implement a flat entry form where users add Project + Date + Hours
  // In a real app, you'd want a matrix view.
  const addEntry = () => {
    setEntries([...entries, { projectId: '', date: format(today, 'yyyy-MM-dd'), hours: 0, description: '' }]);
  };

  const updateEntry = (index: number, field: string, value: any) => {
    const newEntries = [...entries];
    newEntries[index] = { ...newEntries[index], [field]: value };
    setEntries(newEntries);
  };

  const removeEntry = (index: number) => {
    const newEntries = [...entries];
    newEntries.splice(index, 1);
    setEntries(newEntries);
  };

  const handleSave = async (submitStatus: string) => {
    const totalHours = entries.reduce((sum, e) => sum + Number(e.hours || 0), 0);
    const payload = {
      id,
      startDate: format(weekStart, 'yyyy-MM-dd'),
      endDate: format(weekEnd, 'yyyy-MM-dd'),
      status: submitStatus,
      totalHours,
      entries: entries.map(e => ({
        ...e,
        hours: Number(e.hours)
      }))
    };

    try {
      await api.post('/timesheets', payload);
      navigate('/timesheets/my');
    } catch (e) {
      console.error('Failed to save timesheet', e);
    }
  };

  const isReadOnly = status !== 'DRAFT' && status !== 'REJECTED';

  return (
    <Container maxWidth="lg" sx={{ mt: 4 }}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
        <Typography variant="h4">Timesheet Entry</Typography>
        <Typography variant="h6">{format(weekStart, 'MMM dd')} - {format(weekEnd, 'MMM dd, yyyy')}</Typography>
      </Box>

      <Paper sx={{ p: 2, mb: 2 }}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Project</TableCell>
              <TableCell>Date</TableCell>
              <TableCell>Hours</TableCell>
              <TableCell>Description</TableCell>
              <TableCell>Action</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {entries.map((entry, idx) => (
              <TableRow key={idx}>
                <TableCell>
                  <TextField 
                    select 
                    fullWidth 
                    value={entry.projectId} 
                    onChange={e => updateEntry(idx, 'projectId', e.target.value)}
                    disabled={isReadOnly}
                    size="small"
                  >
                    {projects.map(p => (
                      <MenuItem key={p.id} value={p.id}>{p.name}</MenuItem>
                    ))}
                  </TextField>
                </TableCell>
                <TableCell>
                  <TextField 
                    type="date" 
                    value={entry.date} 
                    onChange={e => updateEntry(idx, 'date', e.target.value)}
                    disabled={isReadOnly}
                    size="small"
                  />
                </TableCell>
                <TableCell>
                  <TextField 
                    type="number" 
                    value={entry.hours} 
                    onChange={e => updateEntry(idx, 'hours', e.target.value)}
                    disabled={isReadOnly}
                    size="small"
                    inputProps={{ min: 0, max: 24, step: 0.5 }}
                    sx={{ width: 80 }}
                  />
                </TableCell>
                <TableCell>
                  <TextField 
                    fullWidth 
                    value={entry.description} 
                    onChange={e => updateEntry(idx, 'description', e.target.value)}
                    disabled={isReadOnly}
                    size="small"
                  />
                </TableCell>
                <TableCell>
                  <Button color="error" onClick={() => removeEntry(idx)} disabled={isReadOnly}>Remove</Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        {!isReadOnly && (
          <Box mt={2}>
            <Button variant="outlined" onClick={addEntry}>+ Add Line Item</Button>
          </Box>
        )}
      </Paper>

      <Box display="flex" justifyContent="flex-end" gap={2}>
        <Button variant="outlined" onClick={() => navigate('/timesheets/my')}>Cancel</Button>
        {!isReadOnly && (
          <>
            <Button variant="contained" color="secondary" onClick={() => handleSave('DRAFT')}>Save as Draft</Button>
            <Button variant="contained" color="primary" onClick={() => handleSave('PENDING')}>Submit for Approval</Button>
          </>
        )}
      </Box>
    </Container>
  );
};
