import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { employeeApi, attendanceApi } from '../api/api';
import AttendanceForm from '../components/AttendanceForm';
import AttendanceTable from '../components/AttendanceTable';
import Loader, { TableSkeleton } from '../components/Loader';
import EmptyState from '../components/EmptyState';
import ErrorBanner from '../components/ErrorBanner';
import { useToast } from '../components/Toast';

const pageVariants = {
    initial: { opacity: 0, x: 20 },
    animate: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: -20 }
};

const Attendance = () => {
    const { employeeId } = useParams();
    const today = new Date().toISOString().split('T')[0];
    const [employee, setEmployee] = useState(null);
    const [records, setRecords] = useState([]);
    const [loading, setLoading] = useState(true);
    const [formLoading, setFormLoading] = useState(false);
    const [quickMarkLoading, setQuickMarkLoading] = useState(null);
    const [todayStatus, setTodayStatus] = useState(null);
    const [error, setError] = useState(null);
    const { addToast } = useToast();

    useEffect(() => {
        fetchData();
    }, [employeeId]);

    const fetchData = async () => {
        try {
            setLoading(true);
            setError(null);

            const [empResponse, attResponse] = await Promise.all([
                employeeApi.getById(employeeId),
                attendanceApi.getByEmployee(employeeId)
            ]);

            setEmployee(empResponse.data);
            setRecords(attResponse.data);

            const todayRecord = attResponse.data.find(r => r.date === today);
            setTodayStatus(todayRecord?.status || null);
        } catch (err) {
            setError(err.response?.data?.detail || 'Failed to load attendance data');
        } finally {
            setLoading(false);
        }
    };

    const handleMarkAttendance = async (data) => {
        try {
            setFormLoading(true);
            const response = await attendanceApi.mark(data);
            setRecords(prev => [response.data, ...prev]);
            if (data.date === today) {
                setTodayStatus(data.status);
            }
            addToast(`Attendance marked for ${data.date}`, 'success');
        } catch (err) {
            const message = err.response?.data?.detail || 'Failed to mark attendance';
            addToast(message, 'error');
            throw err;
        } finally {
            setFormLoading(false);
        }
    };

    const handleQuickMark = async (status) => {
        try {
            setQuickMarkLoading(status);
            const response = await attendanceApi.mark({
                employee_id: employeeId,
                date: today,
                status: status
            });
            setRecords(prev => [response.data, ...prev]);
            setTodayStatus(status);
            addToast(`Marked ${status} for today`, 'success');
        } catch (err) {
            const message = err.response?.data?.detail || 'Failed to mark attendance';
            addToast(message, 'error');
        } finally {
            setQuickMarkLoading(null);
        }
    };

    if (loading) {
        return (
            <motion.div
                variants={pageVariants}
                initial="initial"
                animate="animate"
                className="space-y-6"
            >
                <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-slate-200 dark:bg-slate-800 rounded-xl animate-pulse"></div>
                    <div className="h-8 w-48 bg-slate-200 dark:bg-slate-800 rounded animate-pulse"></div>
                </div>
                <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 p-6">
                    <div className="h-6 w-32 bg-slate-200 dark:bg-slate-800 rounded animate-pulse mb-4"></div>
                    <div className="grid grid-cols-3 gap-4">
                        <div className="h-12 bg-slate-200 dark:bg-slate-800 rounded-xl animate-pulse"></div>
                        <div className="h-12 bg-slate-200 dark:bg-slate-800 rounded-xl animate-pulse"></div>
                        <div className="h-12 bg-slate-200 dark:bg-slate-800 rounded-xl animate-pulse"></div>
                    </div>
                </div>
                <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden">
                    <TableSkeleton rows={5} cols={3} />
                </div>
            </motion.div>
        );
    }

    return (
        <motion.div
            variants={pageVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            transition={{ duration: 0.3 }}
            className="space-y-6"
        >
            {/* Header */}
            <div className="flex items-center gap-4">
                <Link to="/employees">
                    <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-400 transition-colors shadow-sm"
                    >
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                        </svg>
                    </motion.button>
                </Link>
                <div>
                    <h1 className="text-2xl font-bold text-slate-800 dark:text-white">Attendance History</h1>
                    {employee && (
                        <div className="flex items-center gap-2 mt-1">
                            <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center text-white font-bold text-[10px] shadow-sm">
                                {employee.full_name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
                            </div>
                            <span className="text-slate-500 dark:text-slate-400 text-sm font-medium">
                                {employee.full_name} ({employee.employee_id})
                            </span>
                        </div>
                    )}
                </div>
            </div>

            {/* Error Banner */}
            <ErrorBanner message={error} onDismiss={() => setError(null)} />

            {/* Quick Mark Today's Attendance */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-gradient-to-r from-primary-50/70 to-blue-50/70 dark:from-primary-900/20 dark:to-blue-900/20 backdrop-blur-md rounded-2xl border border-primary-100/50 dark:border-primary-900/30 p-6 shadow-sm"
            >
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                        <h2 className="text-lg font-bold text-slate-800 dark:text-white">Today's Attendance</h2>
                        <p className="text-slate-500 dark:text-slate-400 text-sm">
                            {new Date().toLocaleDateString('en-US', {
                                weekday: 'long',
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric'
                            })}
                        </p>
                    </div>

                    {todayStatus ? (
                        <div className="flex items-center gap-3">
                            <span className="text-slate-600 dark:text-slate-400 text-sm font-medium">Status:</span>
                            <span className={`px-4 py-2 rounded-xl font-bold text-sm border shadow-sm ${todayStatus === 'Present'
                                ? 'bg-emerald-100 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400 border-emerald-300 dark:border-emerald-800'
                                : 'bg-red-100 dark:bg-red-900/20 text-red-700 dark:text-red-400 border-red-300 dark:border-red-800'
                                }`}>
                                {todayStatus === 'Present' ? '✓ ' : '✗ '}{todayStatus}
                            </span>
                        </div>
                    ) : (
                        <div className="flex items-center gap-3">
                            <span className="text-slate-600 dark:text-slate-400 text-sm font-medium hidden sm:inline">Quick mark:</span>
                            <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={() => handleQuickMark('Present')}
                                disabled={quickMarkLoading}
                                className="flex items-center gap-2 px-6 py-2.5 bg-emerald-500 text-white rounded-xl hover:bg-emerald-600 disabled:opacity-50 transition-colors font-bold shadow-lg shadow-emerald-500/25"
                            >
                                {quickMarkLoading === 'Present' ? (
                                    <motion.div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full" animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: 'linear' }} />
                                ) : (
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                    </svg>
                                )}
                                Present
                            </motion.button>
                            <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={() => handleQuickMark('Absent')}
                                disabled={quickMarkLoading}
                                className="flex items-center gap-2 px-6 py-2.5 bg-red-500 text-white rounded-xl hover:bg-red-600 disabled:opacity-50 transition-colors font-bold shadow-lg shadow-red-500/25"
                            >
                                {quickMarkLoading === 'Absent' ? (
                                    <motion.div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full" animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: 'linear' }} />
                                ) : (
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                )}
                                Absent
                            </motion.button>
                        </div>
                    )}
                </div>
            </motion.div>

            {/* Mark Attendance Form (for other dates) */}
            <div className="bg-white/70 dark:bg-slate-800/70 backdrop-blur-md rounded-2xl shadow-sm border border-white/20 dark:border-slate-700/50 p-6">
                <h2 className="text-lg font-bold text-slate-800 dark:text-white mb-6">Mark Attendance for Other Dates</h2>
                <AttendanceForm
                    employeeId={employeeId}
                    onSubmit={handleMarkAttendance}
                    loading={formLoading}
                />
            </div>

            {/* Attendance Table */}
            <div className="bg-white/70 dark:bg-slate-800/70 backdrop-blur-md rounded-2xl shadow-sm border border-white/20 dark:border-slate-700/50 overflow-hidden">
                <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50">
                    <h2 className="text-lg font-bold text-slate-800 dark:text-white">Attendance History</h2>
                </div>
                {records.length === 0 ? (
                    <div className="p-12">
                        <EmptyState
                            icon="📅"
                            title="No attendance records"
                            description="Start tracking by marking attendance above."
                        />
                    </div>
                ) : (
                    <AttendanceTable records={records} />
                )}
            </div>
        </motion.div>
    );
};

export default Attendance;
