import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Play, Coffee, Wifi, WifiOff, CheckCircle2, CheckSquare, ShieldCheck, AlertTriangle, RefreshCw, Radio } from 'lucide-react';
import { useAuth } from '../../auth/hooks/useAuth';
import { attendanceService, OFFICE_COORDS } from '../../services/attendance.service';
import { syncLocalData, addNotification, fetchAttendanceDataThunk } from '../../store/attendanceSlice';
import { RootState, AppDispatch } from '../../app/store';
import { analyticsApi } from '../../api/endpoints/analytics.api';
import { GeofenceStatusIcon, SyncStatusIcon } from '../common/RealtimeIcons';

interface LiveCheckInWidgetProps {
  employeeName?: string;
  department?: string;
}

export const LiveCheckInWidget: React.FC<LiveCheckInWidgetProps> = ({
  employeeName: propName,
  department: propDept
}) => {
  const dispatch = useDispatch<any>();
  const { user } = useAuth();
  
  // Local state for shift selection, work mode, and simulation options
  const [shiftType, setShiftType] = useState<'Regular' | 'Flexible' | 'Overnight'>('Regular');
  const [workMode, setWorkMode] = useState<'Office' | 'Remote' | 'Client'>('Office');
  const [useCustomLocation, setUseCustomLocation] = useState(false);
  const [lat, setLat] = useState(OFFICE_COORDS.lat);
  const [lng, setLng] = useState(OFFICE_COORDS.lng);
  
  // Local state to simulate offline mode
  const [isOfflineMode, setIsOfflineMode] = useState(false);
  const [availableShifts, setAvailableShifts] = useState<Array<{ name: 'Regular' | 'Flexible' | 'Overnight'; startTime: string; endTime: string }>>([
    { name: 'Regular', startTime: '09:00', endTime: '18:00' },
    { name: 'Flexible', startTime: '00:00', endTime: '23:59' },
    { name: 'Overnight', startTime: '21:00', endTime: '06:00' }
  ]);

  // Redux state
  const { activeRecord, offlineQueueLength } = useSelector(
    (state: RootState) => state.attendance
  );

  const employeeName = propName || user?.name || 'Alex Mercer';
  const employeeId = user?.id || 'emp-001';
  const department = propDept || user?.department || 'Engineering & Technology';

  // Tick clock
  const [now, setNow] = useState(attendanceService.getServerTime());
  useEffect(() => {
    const timer = setInterval(() => {
      setNow(attendanceService.getServerTime());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Sync state with backend database on mount/update
  useEffect(() => {
    (dispatch as AppDispatch)(fetchAttendanceDataThunk(employeeId));
  }, [dispatch, employeeId]);

  useEffect(() => {
    analyticsApi.getShifts().then((shifts) => setAvailableShifts(shifts)).catch(() => undefined);
  }, []);

  // Handle Action dispatchers (with geofencing & offline checks)
  const handleCheckIn = async () => {
    const idempotencyKey = Math.random().toString(36).substr(2, 9);
    const payload = {
      employeeId,
      employeeName,
      department,
      shiftType,
      workMode,
      latitude: useCustomLocation ? lat : OFFICE_COORDS.lat,
      longitude: useCustomLocation ? lng : OFFICE_COORDS.lng,
      accuracy: 5,
      idempotencyKey,
    };

    if (isOfflineMode) {
      attendanceService.enqueueOfflineAction({
        type: 'CHECK_IN',
        payload,
      });
      dispatch(addNotification({ message: 'Offline: Check-in queued locally.', type: 'warning' }));
      dispatch(syncLocalData({ employeeId }));
      return;
    }

    try {
      const record = await attendanceService.checkInRemote(payload);
      dispatch(addNotification({ message: 'Checked in successfully!', type: 'success' }));
      
      // Overtime or Late arrival warning push
      const stats = attendanceService.calculateHours(record);
      if (stats.lateArrival) {
        dispatch(addNotification({ message: 'Late arrival registered for this shift.', type: 'warning' }));
      }
      
      dispatch(fetchAttendanceDataThunk(employeeId));
    } catch (err: any) {
      dispatch(addNotification({ message: err.message, type: 'warning' }));
    }
  };

  const handleTakeBreak = async () => {
    if (isOfflineMode) {
      attendanceService.enqueueOfflineAction({
        type: 'BREAK_START',
        payload: { employeeId },
      });
      dispatch(addNotification({ message: 'Offline: Break start queued locally.', type: 'warning' }));
      dispatch(syncLocalData({ employeeId }));
      return;
    }

    try {
      await attendanceService.transitionRemote('break', employeeId);
      dispatch(addNotification({ message: 'Break started.', type: 'info' }));
      dispatch(fetchAttendanceDataThunk(employeeId));
    } catch (err: any) {
      dispatch(addNotification({ message: err.message, type: 'warning' }));
    }
  };

  const handleResume = async () => {
    if (isOfflineMode) {
      attendanceService.enqueueOfflineAction({
        type: 'BREAK_END',
        payload: { employeeId },
      });
      dispatch(addNotification({ message: 'Offline: Resume queued locally.', type: 'warning' }));
      dispatch(syncLocalData({ employeeId }));
      return;
    }

    try {
      await attendanceService.transitionRemote('resume', employeeId);
      dispatch(addNotification({ message: 'Resumed work.', type: 'success' }));
      dispatch(fetchAttendanceDataThunk(employeeId));
    } catch (err: any) {
      dispatch(addNotification({ message: err.message, type: 'warning' }));
    }
  };

  const handleCheckOut = async () => {
    if (isOfflineMode) {
      attendanceService.enqueueOfflineAction({
        type: 'CHECK_OUT',
        payload: { employeeId },
      });
      dispatch(addNotification({ message: 'Offline: Check-out queued locally.', type: 'warning' }));
      dispatch(syncLocalData({ employeeId }));
      return;
    }

    try {
      await attendanceService.transitionRemote('check-out', employeeId);
      dispatch(addNotification({ message: 'Checked out successfully!', type: 'success' }));
      dispatch(fetchAttendanceDataThunk(employeeId));
    } catch (err: any) {
      dispatch(addNotification({ message: err.message, type: 'warning' }));
    }
  };

  const handleSyncOffline = async () => {
    const res = await attendanceService.syncOfflineActionsRemote();
    if (res.errors.length > 0) {
      dispatch(addNotification({ message: `Sync completed with errors: ${res.errors.join(', ')}`, type: 'warning' }));
    } else {
      dispatch(addNotification({ message: `Successfully synced ${res.syncedCount} actions!`, type: 'success' }));
    }
    dispatch(fetchAttendanceDataThunk(employeeId));
  };

  // Stats for the active record or default placeholder
  const stats = activeRecord
    ? attendanceService.calculateHours(activeRecord)
    : { workingHours: 0, breakDuration: 0, overtime: 0, lateArrival: false, earlyDeparture: false };

  const formatHrsMins = (decimalHours: number) => {
    const totalMins = Math.round(decimalHours * 60);
    const hrs = Math.floor(totalMins / 60);
    const mins = totalMins % 60;
    return `${hrs}h ${mins}m`;
  };

  return (
    <div className="p-6 space-y-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm text-slate-900 dark:text-slate-100 font-sans rounded-lg">
      
      {/* Header and Sync States */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-4">
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <h3 className="text-base font-semibold text-slate-900 dark:text-slate-100">Mark attendance for today</h3>
            <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium ${
              activeRecord
                ? activeRecord.status === 'On Break'
                  ? 'bg-amber-50 text-amber-700 border border-amber-200 dark:bg-amber-950/40 dark:text-amber-400 dark:border-amber-800'
                  : 'bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-400 dark:border-emerald-800'
                : 'bg-slate-100 text-slate-700 border border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700'
            }`}>
              {activeRecord ? (
                activeRecord.status === 'On Break' ? (
                  <>
                    <Coffee size={12} className="text-amber-600 dark:text-amber-400" />
                    <span>On Break</span>
                  </>
                ) : (
                  <>
                    <Radio size={12} className="text-emerald-600 dark:text-emerald-400 animate-pulse" />
                    <span>{activeRecord.status}</span>
                  </>
                )
              ) : (
                <>
                  <CheckSquare size={12} className="text-slate-500" />
                  <span>Checked Out</span>
                </>
              )}
            </span>

            {isOfflineMode ? (
              <span className="flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-50 text-red-700 border border-red-200 dark:bg-red-950/40 dark:text-red-400 dark:border-red-800">
                <WifiOff size={11} /> Offline Mode
              </span>
            ) : (
              <span className="flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-400 dark:border-emerald-800">
                <Wifi size={11} /> Online
              </span>
            )}

            {workMode === 'Office' && (
              <GeofenceStatusIcon
                state={useCustomLocation ? 'OUTSIDE_GEOFENCE' : 'INSIDE_OFFICE'}
                showBadge={true}
              />
            )}
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 font-normal">
            You can mark your attendance for today.
          </p>
        </div>

        <div className="text-left sm:text-right font-mono">
          <p className="text-2xl font-semibold text-blue-600 dark:text-blue-400 tracking-tight">
            {now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true })}
          </p>
          <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
            {now.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })}
          </p>
        </div>
      </div>

      {/* Action triggers with modern live status icons */}
      <div className="flex flex-col sm:flex-row items-center gap-3">
        {!activeRecord ? (
          <button
            onClick={handleCheckIn}
            className="w-full sm:flex-1 px-5 py-2.5 rounded-md bg-emerald-600 hover:bg-emerald-700 font-medium text-sm text-white shadow-sm transition-colors flex items-center justify-center gap-2 cursor-pointer h-10"
            title="Punch Check-In attendance for today"
            aria-label="Check-In Now"
          >
            <CheckCircle2 size={16} /> Check In
          </button>
        ) : (
          <div className="flex flex-col sm:flex-row items-center gap-3 w-full">
            <button
              onClick={handleCheckOut}
              className="w-full sm:flex-1 px-5 py-2.5 rounded-md bg-rose-600 hover:bg-rose-700 font-medium text-sm text-white shadow-sm transition-colors flex items-center justify-center gap-2 cursor-pointer h-10"
              title="Complete shift and Check-Out"
              aria-label="Check-Out"
            >
              <CheckSquare size={16} /> Check Out
            </button>

            {activeRecord.status !== 'On Break' ? (
              <button
                onClick={handleTakeBreak}
                className="w-full sm:flex-1 px-5 py-2.5 rounded-md bg-white hover:bg-slate-50 dark:bg-slate-800 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 font-medium text-sm text-slate-700 dark:text-slate-200 transition-colors flex items-center justify-center gap-2 cursor-pointer h-10"
                title="Pause active shift for a break"
                aria-label="Take Break"
              >
                <Coffee size={16} /> Take Break
              </button>
            ) : (
              <button
                onClick={handleResume}
                className="w-full sm:flex-1 px-5 py-2.5 rounded-md bg-amber-600 hover:bg-amber-700 font-medium text-sm text-white shadow-sm transition-colors flex items-center justify-center gap-2 cursor-pointer h-10"
                title="End break and resume active work"
                aria-label="Resume Work"
              >
                <Play size={16} fill="currentColor" /> Resume Work
              </button>
            )}
          </div>
        )}
      </div>

      {/* Real-time metrics section */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 pt-1">
        <div className="p-3.5 rounded-md bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-800 space-y-1">
          <p className="text-xs font-medium text-slate-500 dark:text-slate-400">Total Hours Today</p>
          <p className="text-lg font-semibold text-slate-900 dark:text-slate-100 font-mono">
            {formatHrsMins(stats.workingHours)}
          </p>
          <p className="text-[11px] text-slate-400 dark:text-slate-500">Target: 8h 00m</p>
        </div>

        <div className="p-3.5 rounded-md bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-800 space-y-1">
          <p className="text-xs font-medium text-slate-500 dark:text-slate-400">Break Duration</p>
          <p className="text-lg font-semibold text-slate-900 dark:text-slate-100 font-mono">
            {formatHrsMins(stats.breakDuration)}
          </p>
          <p className="text-[11px] text-slate-400 dark:text-slate-500">Max Allowed: 1h 00m</p>
        </div>

        <div className="p-3.5 rounded-md bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-800 space-y-1">
          <p className="text-xs font-medium text-slate-500 dark:text-slate-400">Overtime Hours</p>
          <p className="text-lg font-semibold text-slate-900 dark:text-slate-100 font-mono">
            {formatHrsMins(stats.overtime)}
          </p>
          <p className="text-[11px] text-slate-400 dark:text-slate-500">Over 8.0 hrs</p>
        </div>

        <div className="p-3.5 rounded-md bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-800 space-y-1">
          <p className="text-xs font-medium text-slate-500 dark:text-slate-400">Status</p>
          <div className="flex items-center gap-1.5 mt-0.5">
            {stats.lateArrival ? (
              <span className="px-2 py-0.5 rounded bg-rose-50 border border-rose-200 text-rose-700 dark:bg-rose-950/40 dark:border-rose-800 dark:text-rose-400 text-xs font-medium">Late Arrival</span>
            ) : (
              <span className="px-2 py-0.5 rounded bg-emerald-50 border border-emerald-200 text-emerald-700 dark:bg-emerald-950/40 dark:border-emerald-800 dark:text-emerald-400 text-xs font-medium">On Time</span>
            )}
            {stats.earlyDeparture && (
              <span className="px-2 py-0.5 rounded bg-amber-50 border border-amber-200 text-amber-700 dark:bg-amber-950/40 dark:border-amber-800 dark:text-amber-400 text-xs font-medium">Early Out</span>
            )}
          </div>
        </div>
      </div>

      {/* Simulator Controls Panel in details disclosure */}
      <details className="text-xs border border-slate-200 dark:border-slate-800 rounded-md p-3 bg-slate-50/50 dark:bg-slate-800/30 transition-all">
        <summary className="cursor-pointer font-medium text-slate-700 dark:text-slate-300 select-none">
          Simulation & Testing Controls
        </summary>
        <div className="mt-3 space-y-4 pt-3 border-t border-slate-200 dark:border-slate-800">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            
            {/* Shift Selection */}
            <div className="space-y-1.5">
              <label className="text-slate-500 dark:text-slate-400 font-medium">Active Shift Rule</label>
              <select
                value={shiftType}
                onChange={(e) => setShiftType(e.target.value as any)}
                disabled={!!activeRecord}
                className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-md px-3 py-1.5 text-xs text-slate-900 dark:text-slate-100 outline-none cursor-pointer"
              >
                {availableShifts.map((shift) => (
                  <option key={shift.name} value={shift.name}>{shift.name} Shift ({shift.startTime} - {shift.endTime})</option>
                ))}
              </select>
            </div>

            {/* Work Mode */}
            <div className="space-y-1.5">
              <label className="text-slate-500 dark:text-slate-400 font-medium">Work Mode</label>
              <select
                value={workMode}
                onChange={(e) => setWorkMode(e.target.value as any)}
                disabled={!!activeRecord}
                className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-md px-3 py-1.5 text-xs text-slate-900 dark:text-slate-100 outline-none cursor-pointer"
              >
                <option value="Office">In-Office (Geofenced)</option>
                <option value="Remote">Remote Work-From-Home</option>
                <option value="Client">Client Site visit</option>
              </select>
            </div>

            {/* Offline simulator toggle */}
            <div className="flex flex-col justify-end space-y-2">
              <label className="flex items-center gap-2 text-slate-600 dark:text-slate-300 font-medium cursor-pointer">
                <input
                  type="checkbox"
                  checked={isOfflineMode}
                  onChange={(e) => setIsOfflineMode(e.target.checked)}
                  className="w-4 h-4 rounded accent-blue-600"
                />
                Simulate Network Offline
              </label>
              {offlineQueueLength > 0 && (
                <button
                  onClick={handleSyncOffline}
                  className="px-3 py-1.5 rounded-md bg-emerald-600 hover:bg-emerald-700 text-white font-medium text-xs transition-colors flex items-center justify-center gap-1.5"
                >
                  Sync Offline Actions ({offlineQueueLength})
                </button>
              )}
            </div>
          </div>

          {/* Geofence Simulator settings */}
          {workMode === 'Office' && !activeRecord && (
            <div className="pt-2 border-t border-slate-200 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <label className="flex items-center gap-1 text-slate-600 dark:text-slate-300 font-medium cursor-pointer">
                  <input
                    type="checkbox"
                    checked={useCustomLocation}
                    onChange={(e) => {
                      setUseCustomLocation(e.target.checked);
                      if (!e.target.checked) {
                        setLat(OFFICE_COORDS.lat);
                        setLng(OFFICE_COORDS.lng);
                      }
                    }}
                    className="w-4 h-4 rounded accent-blue-600"
                  />
                  Simulate Location Offset (Geofence Breach)
                </label>
              </div>
              {useCustomLocation && (
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      setLat(12.9000); // generic offset coordinates
                      setLng(77.5000);
                    }}
                    className="px-2.5 py-1 rounded-md bg-red-50 text-red-700 border border-red-200 dark:bg-red-950/40 dark:text-red-300 dark:border-red-800 hover:bg-red-100 transition-colors"
                  >
                    Set coordinates outside radius
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </details>
    </div>
  );
};
