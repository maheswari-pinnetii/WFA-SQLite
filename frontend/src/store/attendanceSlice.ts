import { createSlice, PayloadAction, createAsyncThunk } from '@reduxjs/toolkit';
import { AttendanceRecord, CorrectionRequest, AuditLog, attendanceService } from '../services/attendance.service';
import { apiClient } from '../api/client';

interface AttendanceState {
  activeRecord: AttendanceRecord | null;
  records: AttendanceRecord[];
  corrections: CorrectionRequest[];
  auditLogs: AuditLog[];
  isOffline: boolean;
  offlineQueueLength: number;
  isLoading: boolean;
  error: string | null;
  notifications: Array<{ id: string; message: string; type: 'info' | 'warning' | 'success'; timestamp: string }>;
}

const initialState: AttendanceState = {
  activeRecord: null,
  records: [],
  corrections: [],
  auditLogs: [],
  isOffline: !navigator.onLine,
  offlineQueueLength: 0,
  isLoading: false,
  error: null,
  notifications: [],
};

export const fetchAttendanceDataThunk = createAsyncThunk(
  'attendance/fetchData',
  async (employeeId: string) => {
    let records: AttendanceRecord[] = [];
    let corrections: CorrectionRequest[] = [];
    let auditLogs: AuditLog[] = [];
    let isOffline = false;

    try {
      const recordsRes = await apiClient.get('/v1/attendance/records?limit=1000');
      if (recordsRes.data && recordsRes.data.success) {
        // Handle both older array format and new { data, meta } format
        records = recordsRes.data.data.data ? recordsRes.data.data.data : recordsRes.data.data;
      }

      const correctionsRes = await apiClient.get('/v1/attendance/corrections');
      if (correctionsRes.data && correctionsRes.data.success) {
        corrections = correctionsRes.data.data;
      }

      const auditRes = await apiClient.get('/v1/attendance/audit-logs');
      if (auditRes.data && auditRes.data.success) {
        auditLogs = auditRes.data.data;
      }
    } catch (err) {
      console.warn('Offline or unable to fetch from server, fallback to local storage cache.', err);
      isOffline = true;
      // Fallback to local storage if offline
      records = await attendanceService.getRecords();
      corrections = await attendanceService.getCorrections();
      auditLogs = await attendanceService.getAuditLogs();
    }

    return { records, corrections, auditLogs, isOffline, employeeId };
  }
);

export const syncLocalDataThunk = createAsyncThunk(
  'attendance/syncLocalData',
  async (employeeId: string) => {
    const records = await attendanceService.getRecords();
    const corrections = await attendanceService.getCorrections();
    const auditLogs = await attendanceService.getAuditLogs();
    const offlineQueue = await attendanceService.getOfflineQueue();
    
    return { records, corrections, auditLogs, offlineQueueLength: offlineQueue.length, employeeId };
  }
);

const attendanceSlice = createSlice({
  name: 'attendance',
  initialState,
  reducers: {
    setOfflineState(state, action: PayloadAction<boolean>) {
      state.isOffline = action.payload;
    },
    addNotification(state, action: PayloadAction<{ message: string; type: 'info' | 'warning' | 'success' }>) {
      state.notifications.unshift({
        id: Math.random().toString(36).substr(2, 9),
        message: action.payload.message,
        type: action.payload.type,
        timestamp: new Date().toLocaleTimeString(),
      });
    },
    clearNotifications(state) {
      state.notifications = [];
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchAttendanceDataThunk.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchAttendanceDataThunk.fulfilled, (state, action) => {
        state.isLoading = false;
        state.records = action.payload.records;
        state.corrections = action.payload.corrections;
        state.auditLogs = action.payload.auditLogs;
        state.isOffline = action.payload.isOffline;
        
        // Cannot block the reducer with await, offlineQueueLength is async now, so it will be set in syncLocalDataThunk
        const active = state.records.find((r) => r.employeeId === action.payload.employeeId && r.status !== 'Checked Out');
        state.activeRecord = active || null;
      })
      .addCase(fetchAttendanceDataThunk.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message || 'Failed to fetch attendance data';
      })
      .addCase(syncLocalDataThunk.fulfilled, (state, action) => {
        state.records = action.payload.records;
        state.corrections = action.payload.corrections;
        state.auditLogs = action.payload.auditLogs;
        state.offlineQueueLength = action.payload.offlineQueueLength;
        
        const active = state.records.find((r) => r.employeeId === action.payload.employeeId && r.status !== 'Checked Out');
        state.activeRecord = active || null;
      });
  }
});

export const { setOfflineState, addNotification, clearNotifications } = attendanceSlice.actions;
export default attendanceSlice.reducer;
