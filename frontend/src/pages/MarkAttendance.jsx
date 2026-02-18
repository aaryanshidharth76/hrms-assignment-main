import { useState, useEffect, useMemo, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { employeeApi, attendanceApi } from '../api/api';
import Loader from '../components/Loader';
import EmptyState from '../components/EmptyState';
import ErrorBanner from '../components/ErrorBanner';
import { useToast } from '../components/Toast';

const pageVariants = {
    initial: { opacity: 0, x: 20 },
    animate: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: -20 }
};

const MarkAttendance = () => {
    const today = new Date().toISOString().split('T')[0];
    const [employees, setEmployees] = useState([]);
    const [attendanceStatus, setAttendanceStatus] = useState({});
    const [selectedDate, setSelectedDate] = useState(today);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState({});
    const [error, setError] = useState(null);

    // Dialog state
    const [showDialog, setShowDialog] = useState(false);
    const [dialogEmployee, setDialogEmployee] = useState(null);
    const [dialogDate, setDialogDate] = useState(today);
    const [dialogStatus, setDialogStatus] = useState('Present');
    const [dialogLoading, setDialogLoading] = useState(false);
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const dropdownRef = useRef(null);

    const { addToast } = useToast();

    useEffect(() => {
        fetchData();
    }, [selectedDate]);

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setDropdownOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const fetchData = async () => {
        try {
            setLoading(true);
            setError(null);

            const empResponse = await employeeApi.getAll();
            setEmployees(empResponse.data);

            const statusMap = {};
            for (const emp of empResponse.data) {
                try {
                    const attResponse = await attendanceApi.getByEmployee(emp.employee_id);
                    const todayRecord = attResponse.data.find(r => r.date === selectedDate);
                    if (todayRecord) {
                        statusMap[emp.employee_id] = todayRecord.status;
                    }
                } catch (err) { }
            }
            setAttendanceStatus(statusMap);
        } catch (err) {
            setError(err.response?.data?.detail || 'Failed to load employees');
        } finally {
            setLoading(false);
        }
    };

    const handleMarkAttendance = async (employeeId, status) => {
        try {
            setSubmitting(prev => ({ ...prev, [employeeId]: true }));
            await attendanceApi.mark({
                employee_id: employeeId,
                date: selectedDate,
                status: status
            });
            setAttendanceStatus(prev => ({ ...prev, [employeeId]: status }));
            addToast(`Attendance marked as ${status}`, 'success');
        } catch (err) {
            const message = err.response?.data?.detail || 'Failed to mark attendance';
            addToast(message, 'error');
        } finally {
            setSubmitting(prev => ({ ...prev, [employeeId]: false }));
        }
    };

    const handleDialogSubmit = async () => {
        if (!dialogEmployee) {
            addToast('Please select an employee', 'error');
            return;
        }
        try {
            setDialogLoading(true);
            await attendanceApi.mark({
                employee_id: dialogEmployee.employee_id,
                date: dialogDate,
                status: dialogStatus
            });
            if (dialogDate === selectedDate) {
                setAttendanceStatus(prev => ({ ...prev, [dialogEmployee.employee_id]: dialogStatus }));
            }
            addToast(`Attendance marked as ${dialogStatus} for ${dialogEmployee.full_name}`, 'success');
            setShowDialog(false);
            resetDialog();
        } catch (err) {
            const message = err.response?.data?.detail || 'Failed to mark attendance';
            addToast(message, 'error');
        } finally {
            setDialogLoading(false);
        }
    };

    const resetDialog = () => {
        setDialogEmployee(null);
        setDialogDate(today);
        setDialogStatus('Present');
        setSearchQuery('');
    };

    const openDialog = () => {
        resetDialog();
        setShowDialog(true);
    };

    const getStatusColor = (status) => {
        if (status === 'Present') return 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800';
        if (status === 'Absent') return 'bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 border-red-200 dark:border-red-800';
        return 'bg-gray-50 dark:bg-gray-800 text-gray-600 dark:text-gray-400 border-gray-200 dark:border-gray-700';
    };

    // Filter employees for dropdown
    const filteredEmployees = useMemo(() => {
        if (!searchQuery.trim()) return employees;
        const query = searchQuery.toLowerCase();
        return employees.filter(emp =>
            emp.employee_id.toLowerCase().includes(query) ||
            emp.full_name.toLowerCase().includes(query) ||
            emp.email.toLowerCase().includes(query)
        );
    }, [employees, searchQuery]);

    const markedCount = Object.keys(attendanceStatus).length;
    const presentCount = Object.values(attendanceStatus).filter(s => s === 'Present').length;
    const absentCount = Object.values(attendanceStatus).filter(s => s === 'Absent').length;

    if (loading) {
        return <Loader fullScreen />;
    }

    return (
        <motion.div
            variants={pageVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            transition={{ duration: 0.3 }}
            className="space-y-5"
        >
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Mark Attendance</h1>
                    <p className="text-gray-500 dark:text-gray-400 mt-1 text-sm">Quick attendance marking for all employees</p>
                </div>

                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
                    {/* Add Attendance Button */}
                    <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={openDialog}
                        className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors font-medium shadow-md shadow-primary-500/20"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                        </svg>
                        <span className="whitespace-nowrap">Add Attendance</span>
                    </motion.button>

                    {/* Date Picker */}
                    <div className="flex items-center gap-2">
                        <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Date:</label>
                        <input
                            type="date"
                            value={selectedDate}
                            onChange={(e) => setSelectedDate(e.target.value)}
                            max={today}
                            className="px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-colors text-sm"
                        />
                    </div>
                </div>
            </div>

            {/* Stats Bar */}
            <div className="grid grid-cols-3 gap-4">
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700/50 p-4 text-center shadow-card">
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">{employees.length}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 font-medium mt-0.5">Total Employees</p>
                </motion.div>
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="bg-white dark:bg-gray-800 rounded-xl border-l-4 border-l-emerald-500 border border-gray-100 dark:border-gray-700/50 p-4 text-center shadow-card">
                    <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">{presentCount}</p>
                    <p className="text-xs text-emerald-600 dark:text-emerald-500 font-medium mt-0.5">Present</p>
                </motion.div>
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="bg-white dark:bg-gray-800 rounded-xl border-l-4 border-l-rose-500 border border-gray-100 dark:border-gray-700/50 p-4 text-center shadow-card">
                    <p className="text-2xl font-bold text-rose-600 dark:text-rose-400">{absentCount}</p>
                    <p className="text-xs text-rose-600 dark:text-rose-500 font-medium mt-0.5">Absent</p>
                </motion.div>
            </div>

            <ErrorBanner message={error} onDismiss={() => setError(null)} />

            {/* Employee List */}
            {employees.length === 0 ? (
                <EmptyState icon={<svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" /></svg>} title="No employees yet" description="Add employees first to mark their attendance." />
            ) : (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-white dark:bg-gray-800 rounded-xl shadow-card border border-gray-100 dark:border-gray-700/50 overflow-hidden">
                    <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
                        <h2 className="text-sm font-semibold text-gray-900 dark:text-white">
                            Attendance for {new Date(selectedDate).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                        </h2>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{markedCount} of {employees.length} marked</p>
                    </div>

                    <div className="divide-y divide-gray-50 dark:divide-gray-700/50 max-h-[500px] overflow-y-auto">
                        {employees.map((employee, index) => {
                            const status = attendanceStatus[employee.employee_id];
                            const isSubmitting = submitting[employee.employee_id];

                            return (
                                <motion.div key={employee.id} initial={{ opacity: 0, x: -15 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: index * 0.02 }} className="flex items-center justify-between p-4 hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors">
                                    <div className="flex items-center gap-3">
                                        <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-primary-400 to-accent-500 flex items-center justify-center text-white font-semibold text-xs">
                                            {employee.full_name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
                                        </div>
                                        <div>
                                            <p className="font-medium text-sm text-gray-800 dark:text-gray-200">{employee.full_name}</p>
                                            <p className="text-xs text-gray-400 dark:text-gray-500 font-mono">{employee.department} &middot; {employee.employee_id}</p>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-2">
                                        {status ? (
                                            <span className={`px-3 py-1 rounded-md text-xs font-bold border ${getStatusColor(status)}`}>{status}</span>
                                        ) : (
                                            <>
                                                <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={() => handleMarkAttendance(employee.employee_id, 'Present')} disabled={isSubmitting} className="flex items-center gap-1 px-3 py-1.5 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400 rounded-lg hover:bg-emerald-100 dark:hover:bg-emerald-900/30 border border-emerald-200 dark:border-emerald-800 transition-colors disabled:opacity-50 text-xs font-semibold">
                                                    {isSubmitting ? <motion.div className="w-3.5 h-3.5 border-2 border-emerald-300 border-t-emerald-600 rounded-full" animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: 'linear' }} /> : <><svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>Present</>}
                                                </motion.button>
                                                <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={() => handleMarkAttendance(employee.employee_id, 'Absent')} disabled={isSubmitting} className="flex items-center gap-1 px-3 py-1.5 bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/30 border border-red-200 dark:border-red-800 transition-colors disabled:opacity-50 text-xs font-semibold">
                                                    {isSubmitting ? <motion.div className="w-3.5 h-3.5 border-2 border-red-300 border-t-red-600 rounded-full" animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: 'linear' }} /> : <><svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>Absent</>}
                                                </motion.button>
                                            </>
                                        )}
                                    </div>
                                </motion.div>
                            );
                        })}
                    </div>
                </motion.div>
            )}

            {/* Mark Attendance Dialog */}
            <AnimatePresence>
                {showDialog && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/50 flex items-center justify-center z-[100] p-4 !m-0"
                        onClick={() => setShowDialog(false)}
                    >
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 20 }}
                            onClick={(e) => e.stopPropagation()}
                            className="bg-white dark:bg-gray-900 rounded-2xl shadow-elevated max-w-md w-full overflow-hidden"
                        >
                            {/* Dialog Header */}
                            <div className="flex items-center justify-between p-5 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
                                <h3 className="text-lg font-bold text-gray-900 dark:text-white">Mark Attendance</h3>
                                <button onClick={() => setShowDialog(false)} className="p-1 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors">
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>
                            </div>

                            {/* Dialog Body */}
                            <div className="p-6 space-y-5">
                                {/* Employee Dropdown */}
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Employee</label>
                                    <div className="relative" ref={dropdownRef}>
                                        <button
                                            type="button"
                                            onClick={() => setDropdownOpen(!dropdownOpen)}
                                            className="w-full flex items-center justify-between px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 hover:border-gray-300 dark:hover:border-gray-600 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-colors text-left shadow-sm"
                                        >
                                            {dialogEmployee ? (
                                                <div className="flex items-center gap-3">
                                                    <div className="w-7 h-7 rounded-md bg-gradient-to-br from-primary-400 to-accent-500 flex items-center justify-center text-white font-bold text-[10px]">
                                                        {dialogEmployee.full_name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
                                                    </div>
                                                    <div>
                                                        <p className="font-semibold text-gray-800 dark:text-gray-200 text-sm">{dialogEmployee.full_name}</p>
                                                        <p className="text-xs text-gray-500 dark:text-gray-400 font-mono">{dialogEmployee.employee_id}</p>
                                                    </div>
                                                </div>
                                            ) : (
                                                <span className="text-gray-400 dark:text-gray-500 text-sm">Select an employee</span>
                                            )}
                                            <svg className={`w-4 h-4 text-gray-400 transition-transform ${dropdownOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                            </svg>
                                        </button>

                                        {/* Dropdown Menu */}
                                        <AnimatePresence>
                                            {dropdownOpen && (
                                                <motion.div
                                                    initial={{ opacity: 0, y: -10 }}
                                                    animate={{ opacity: 1, y: 0 }}
                                                    exit={{ opacity: 0, y: -10 }}
                                                    className="absolute z-10 w-full mt-2 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-elevated overflow-hidden"
                                                >
                                                    {/* Search Input */}
                                                    <div className="p-3 border-b border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50">
                                                        <input
                                                            type="text"
                                                            value={searchQuery}
                                                            onChange={(e) => setSearchQuery(e.target.value)}
                                                            placeholder="Search by name, ID, or email..."
                                                            className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 dark:text-white"
                                                            autoFocus
                                                        />
                                                    </div>

                                                    {/* Employee List */}
                                                    <div className="max-h-60 overflow-y-auto">
                                                        {filteredEmployees.length === 0 ? (
                                                            <p className="p-4 text-center text-gray-500 dark:text-gray-400 text-sm">No employees found</p>
                                                        ) : (
                                                            filteredEmployees.map((emp) => (
                                                                <button
                                                                    key={emp.id}
                                                                    type="button"
                                                                    onClick={() => {
                                                                        setDialogEmployee(emp);
                                                                        setDropdownOpen(false);
                                                                        setSearchQuery('');
                                                                    }}
                                                                    className={`w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-left ${dialogEmployee?.id === emp.id ? 'bg-primary-50 dark:bg-primary-900/20' : ''}`}
                                                                >
                                                                    <div className="w-7 h-7 rounded-md bg-gradient-to-br from-primary-400 to-accent-500 flex items-center justify-center text-white font-bold text-[10px]">
                                                                        {emp.full_name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
                                                                    </div>
                                                                    <div className="flex-1 min-w-0">
                                                                        <p className="font-semibold text-gray-800 dark:text-gray-200 text-sm truncate">{emp.full_name}</p>
                                                                        <p className="text-xs text-gray-500 dark:text-gray-400 truncate font-mono">{emp.email} &middot; {emp.employee_id}</p>
                                                                    </div>
                                                                    {dialogEmployee?.id === emp.id && (
                                                                        <svg className="w-4 h-4 text-primary-600 dark:text-primary-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                                                        </svg>
                                                                    )}
                                                                </button>
                                                            ))
                                                        )}
                                                    </div>
                                                </motion.div>
                                            )}
                                        </AnimatePresence>
                                    </div>
                                </div>

                                {/* Date Picker */}
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Date</label>
                                    <input
                                        type="date"
                                        value={dialogDate}
                                        onChange={(e) => setDialogDate(e.target.value)}
                                        max={today}
                                        className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-colors shadow-sm"
                                    />
                                </div>

                                {/* Status Toggle */}
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Status</label>
                                    <div className="grid grid-cols-2 gap-3">
                                        <motion.button
                                            whileHover={{ scale: 1.02 }}
                                            whileTap={{ scale: 0.98 }}
                                            type="button"
                                            onClick={() => setDialogStatus('Present')}
                                            className={`flex items-center justify-center gap-2 px-4 py-3 rounded-xl font-semibold transition-all shadow-sm ${dialogStatus === 'Present'
                                                ? 'bg-emerald-500 text-white shadow-emerald-500/20'
                                                : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'
                                                }`}
                                        >
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                            </svg>
                                            Present
                                        </motion.button>
                                        <motion.button
                                            whileHover={{ scale: 1.02 }}
                                            whileTap={{ scale: 0.98 }}
                                            type="button"
                                            onClick={() => setDialogStatus('Absent')}
                                            className={`flex items-center justify-center gap-2 px-4 py-3 rounded-xl font-semibold transition-all shadow-sm ${dialogStatus === 'Absent'
                                                ? 'bg-red-500 text-white shadow-red-500/20'
                                                : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'
                                                }`}
                                        >
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                            </svg>
                                            Absent
                                        </motion.button>
                                    </div>
                                </div>
                            </div>

                            {/* Dialog Footer */}
                            <div className="flex items-center justify-end gap-3 p-5 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
                                <motion.button
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                    type="button"
                                    onClick={() => setShowDialog(false)}
                                    className="px-5 py-2.5 rounded-xl font-medium text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                                >
                                    Cancel
                                </motion.button>
                                <motion.button
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                    type="button"
                                    onClick={handleDialogSubmit}
                                    disabled={!dialogEmployee || dialogLoading}
                                    className="flex items-center gap-2 px-6 py-2.5 bg-primary-600 text-white rounded-xl font-medium hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-md shadow-primary-500/20"
                                >
                                    {dialogLoading ? (
                                        <motion.div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full" animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: 'linear' }} />
                                    ) : (
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                        </svg>
                                    )}
                                    Mark Attendance
                                </motion.button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    );
};

export default MarkAttendance;
