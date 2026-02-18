import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { employeeApi, attendanceApi } from '../api/api';
import AttendanceForm from '../components/AttendanceForm';
import AttendanceTable from '../components/AttendanceTable';
import Loader from '../components/Loader';
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
    const [employee, setEmployee] = useState(null);
    const [records, setRecords] = useState([]);
    const [loading, setLoading] = useState(true);
    const [formLoading, setFormLoading] = useState(false);
    const [error, setError] = useState(null);
    const [todayStatus, setTodayStatus] = useState(null);
    const [quickMarkLoading, setQuickMarkLoading] = useState(null);
    const { addToast } = useToast();
    const today = new Date().toISOString().split('T')[0];

    useEffect(() => {
        fetchData();
    }, [employeeId]);

    const fetchData = async () => {
        try {
            setLoading(true);
            setError(null);
            const [empRes, attRes] = await Promise.all([
                employeeApi.getById(employeeId),
                attendanceApi.getByEmployee(employeeId)
            ]);
            setEmployee(empRes.data);
            setRecords(attRes.data);

            const todayRecord = attRes.data.find(r => r.date === today);
            if (todayRecord) {
                setTodayStatus(todayRecord.status);
            }
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

    if (loading) return <Loader fullScreen />;

    return (
        <motion.div
            variants={pageVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            transition={{ duration: 0.3 }}
            className="space-y-5"
        >
            {/* Back Link + Header */}
            <div>
                <Link to="/employees" className="inline-flex items-center gap-1.5 text-sm text-gray-500 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors font-medium mb-3">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                    Back to Employees
                </Link>
                {employee && (
                    <div className="flex items-center gap-4">
                        <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-primary-400 to-accent-500 flex items-center justify-center text-white font-bold text-xl shadow-lg shadow-primary-500/20">
                            {employee.full_name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{employee.full_name}</h1>
                            <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">{employee.department} &middot; <span className="font-mono">{employee.employee_id}</span></p>
                        </div>
                    </div>
                )}
            </div>

            <ErrorBanner message={error} onDismiss={() => setError(null)} />

            {/* Today's Status */}
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700/50 shadow-card p-5">
                <div className="flex items-center gap-2.5 mb-4">
                    <div className="w-8 h-8 rounded-lg bg-primary-50 dark:bg-primary-900/20 flex items-center justify-center text-primary-600 dark:text-primary-400">
                        <svg className="w-4.5 h-4.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                    </div>
                    <h2 className="text-base font-bold text-gray-900 dark:text-white">Today's Attendance</h2>
                </div>

                {todayStatus ? (
                    <div className={`p-4 rounded-xl border ${todayStatus === 'Present' ? 'bg-emerald-50 dark:bg-emerald-900/20 border-emerald-200 dark:border-emerald-800' : 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800'}`}>
                        <div className="flex items-center gap-3">
                            {todayStatus === 'Present' ? (
                                <svg className="w-5 h-5 text-emerald-600 dark:text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                            ) : (
                                <svg className="w-5 h-5 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                            )}
                            <p className={`font-bold text-sm ${todayStatus === 'Present' ? 'text-emerald-700 dark:text-emerald-300' : 'text-red-700 dark:text-red-300'}`}>
                                Marked as {todayStatus}
                            </p>
                        </div>
                    </div>
                ) : (
                    <div className="flex flex-col sm:flex-row gap-3">
                        <motion.button
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => handleQuickMark('Present')}
                            disabled={quickMarkLoading}
                            className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-emerald-500 hover:bg-emerald-600 text-white font-medium rounded-xl transition-all shadow-md shadow-emerald-500/20 disabled:opacity-50"
                        >
                            {quickMarkLoading === 'Present' ? (
                                <motion.div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full" animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: 'linear' }} />
                            ) : (
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                            )}
                            Mark Present
                        </motion.button>
                        <motion.button
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => handleQuickMark('Absent')}
                            disabled={quickMarkLoading}
                            className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-red-500 hover:bg-red-600 text-white font-medium rounded-xl transition-all shadow-md shadow-red-500/20 disabled:opacity-50"
                        >
                            {quickMarkLoading === 'Absent' ? (
                                <motion.div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full" animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: 'linear' }} />
                            ) : (
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                            )}
                            Mark Absent
                        </motion.button>
                    </div>
                )}
            </motion.div>

            {/* Attendance Form */}
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700/50 shadow-card p-5">
                <div className="flex items-center gap-2.5 mb-4">
                    <div className="w-8 h-8 rounded-lg bg-accent-50 dark:bg-accent-900/20 flex items-center justify-center text-accent-600 dark:text-accent-400">
                        <svg className="w-4.5 h-4.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                        </svg>
                    </div>
                    <h2 className="text-base font-bold text-gray-900 dark:text-white">Mark for Specific Date</h2>
                </div>
                <AttendanceForm
                    employeeId={employeeId}
                    onSubmit={handleMarkAttendance}
                    loading={formLoading}
                />
            </motion.div>

            {/* Attendance History */}
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700/50 shadow-card overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
                    <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-lg bg-amber-50 dark:bg-amber-900/20 flex items-center justify-center text-amber-600 dark:text-amber-400">
                            <svg className="w-4.5 h-4.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                            </svg>
                        </div>
                        <h2 className="text-base font-bold text-gray-900 dark:text-white">Attendance History</h2>
                        <span className="text-xs text-gray-500 dark:text-gray-400 font-medium">({records.length} records)</span>
                    </div>
                </div>

                {records.length === 0 ? (
                    <EmptyState
                        icon={<svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>}
                        title="No attendance records"
                        description="Start by marking attendance above."
                    />
                ) : (
                    <AttendanceTable records={records} />
                )}
            </motion.div>
        </motion.div>
    );
};

export default Attendance;
