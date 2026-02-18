import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { employeeApi, attendanceApi } from '../api/api';
import Loader from '../components/Loader';
import ErrorBanner from '../components/ErrorBanner';

const Dashboard = () => {
    const [stats, setStats] = useState(null);
    const [employees, setEmployees] = useState([]);
    const [recentActivity, setRecentActivity] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const today = new Date().toISOString().split('T')[0];

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            setLoading(true);
            const [statsRes, empRes] = await Promise.all([
                attendanceApi.getStats(),
                employeeApi.getAll()
            ]);
            setStats(statsRes.data);
            setEmployees(empRes.data);

            const activityPromises = empRes.data.slice(0, 5).map(async (emp) => {
                try {
                    const attRes = await attendanceApi.getByEmployee(emp.employee_id);
                    if (attRes.data.length > 0) {
                        return { ...attRes.data[0], employee: emp };
                    }
                    return null;
                } catch { return null; }
            });
            const activities = (await Promise.all(activityPromises)).filter(Boolean);
            setRecentActivity(activities.slice(0, 5));
        } catch (err) {
            setError(err.response?.data?.detail || 'Failed to load dashboard data');
        } finally {
            setLoading(false);
        }
    };

    const departmentCounts = employees.reduce((acc, emp) => {
        acc[emp.department] = (acc[emp.department] || 0) + 1;
        return acc;
    }, {});

    const recentEmployees = [...employees].sort((a, b) =>
        new Date(b.created_at || 0) - new Date(a.created_at || 0)
    ).slice(0, 5);

    if (loading) return <Loader fullScreen />;

    const statCards = [
        {
            title: 'Total Employees',
            value: stats?.total_employees || 0,
            icon: (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
            ),
            color: 'primary',
            borderColor: 'border-l-primary-500',
            iconBg: 'bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400',
        },
        {
            title: 'Present Today',
            value: stats?.present_today || 0,
            subtitle: today,
            icon: (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
            ),
            color: 'emerald',
            borderColor: 'border-l-emerald-500',
            iconBg: 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400',
        },
        {
            title: 'Absent Today',
            value: stats?.absent_today || 0,
            icon: (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
            ),
            color: 'rose',
            borderColor: 'border-l-rose-500',
            iconBg: 'bg-rose-50 dark:bg-rose-900/20 text-rose-600 dark:text-rose-400',
        },
        {
            title: 'Not Marked',
            value: stats?.not_marked || 0,
            icon: (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
            ),
            color: 'amber',
            borderColor: 'border-l-amber-500',
            iconBg: 'bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400',
        }
    ];

    const departmentColors = {
        Engineering: 'text-primary-600 dark:text-primary-400 bg-primary-50 dark:bg-primary-900/20',
        Product: 'text-accent-600 dark:text-accent-400 bg-accent-50 dark:bg-accent-900/20',
        Design: 'text-pink-600 dark:text-pink-400 bg-pink-50 dark:bg-pink-900/20',
        Marketing: 'text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/20',
        Sales: 'text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/20',
        'Human Resources': 'text-cyan-600 dark:text-cyan-400 bg-cyan-50 dark:bg-cyan-900/20',
        Finance: 'text-violet-600 dark:text-violet-400 bg-violet-50 dark:bg-violet-900/20',
        Operations: 'text-orange-600 dark:text-orange-400 bg-orange-50 dark:bg-orange-900/20',
        IT: 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20',
    };

    const containerVariants = {
        hidden: { opacity: 0 },
        show: { opacity: 1, transition: { staggerChildren: 0.08 } }
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 15 },
        show: { opacity: 1, y: 0 }
    };

    return (
        <div className="space-y-6 max-w-7xl mx-auto">
            <ErrorBanner message={error} onDismiss={() => setError(null)} />

            {/* Page Title */}
            <div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Dashboard</h1>
                <p className="text-gray-500 dark:text-gray-400 mt-1 text-sm">Overview of your workforce and attendance</p>
            </div>

            {/* Stat Cards */}
            <motion.div variants={containerVariants} initial="hidden" animate="show" className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {statCards.map((card) => (
                    <motion.div
                        key={card.title}
                        variants={itemVariants}
                        whileHover={{ y: -4 }}
                        className={`bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700/50 shadow-card hover:shadow-card-hover p-5 border-l-4 ${card.borderColor} transition-all`}
                    >
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">{card.title}</p>
                                <h3 className="text-3xl font-bold text-gray-900 dark:text-white mt-1.5">{card.value}</h3>
                                {card.subtitle && (
                                    <p className="text-xs text-gray-400 dark:text-gray-500 mt-1.5">{card.subtitle}</p>
                                )}
                            </div>
                            <div className={`w-12 h-12 rounded-xl ${card.iconBg} flex items-center justify-center`}>
                                {card.icon}
                            </div>
                        </div>
                    </motion.div>
                ))}
            </motion.div>

            {/* Main Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Departments Section */}
                <motion.div initial={{ opacity: 0, x: -15 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3 }} className="lg:col-span-1 bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700/50 shadow-card p-6">
                    <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center gap-2.5">
                            <div className="w-8 h-8 rounded-lg bg-accent-50 dark:bg-accent-900/20 flex items-center justify-center text-accent-600 dark:text-accent-400">
                                <svg className="w-4.5 h-4.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                                </svg>
                            </div>
                            <h3 className="text-base font-bold text-gray-900 dark:text-white">Departments</h3>
                        </div>
                    </div>
                    <div className="space-y-2.5">
                        {Object.entries(departmentCounts).length === 0 ? (
                            <div className="text-center py-8"><p className="text-gray-400 dark:text-gray-500 text-sm">No departments yet</p></div>
                        ) : (
                            Object.entries(departmentCounts).map(([dept, count], index) => (
                                <motion.div key={dept} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.4 + index * 0.04 }} whileHover={{ x: 3 }} className="group flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-all">
                                    <span className="text-sm text-gray-700 dark:text-gray-300 font-medium">{dept}</span>
                                    <Link to={`/employees?department=${encodeURIComponent(dept)}`} className={`px-2.5 py-0.5 rounded-md text-xs font-bold ${departmentColors[dept] || 'text-primary-600 dark:text-primary-400 bg-primary-50 dark:bg-primary-900/20'}`}>
                                        {count}
                                    </Link>
                                </motion.div>
                            ))
                        )}
                    </div>
                </motion.div>

                {/* Recent Activity Section */}
                <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="lg:col-span-2 bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700/50 shadow-card p-6">
                    <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center gap-2.5">
                            <div className="w-8 h-8 rounded-lg bg-amber-50 dark:bg-amber-900/20 flex items-center justify-center text-amber-600 dark:text-amber-400">
                                <svg className="w-4.5 h-4.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                                </svg>
                            </div>
                            <h3 className="text-base font-bold text-gray-900 dark:text-white">Recent Activity</h3>
                        </div>
                        <Link to="/mark-attendance" className="text-sm font-medium text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 transition-colors">View All</Link>
                    </div>
                    <div className="space-y-2.5">
                        {recentActivity.length === 0 ? (
                            <div className="text-center py-12"><p className="text-gray-400 dark:text-gray-500 text-sm">No recent activity recorded</p></div>
                        ) : (
                            recentActivity.map((activity, index) => (
                                <motion.div key={activity.id} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.5 + index * 0.04 }} className="flex items-center justify-between p-3.5 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-all">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-primary-400 to-accent-500 flex items-center justify-center text-white font-bold text-sm">
                                            {activity.employee?.full_name[0]}
                                        </div>
                                        <div>
                                            <p className="text-sm text-gray-800 dark:text-gray-200 font-semibold">{activity.employee?.full_name || 'Unknown'}</p>
                                            <p className="text-xs text-gray-400 dark:text-gray-500">{activity.date}</p>
                                        </div>
                                    </div>
                                    <span className={`px-3 py-1 rounded-md text-xs font-bold ${activity.status === 'Present'
                                        ? 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400'
                                        : 'bg-rose-50 dark:bg-rose-900/20 text-rose-600 dark:text-rose-400'
                                        }`}>
                                        {activity.status}
                                    </span>
                                </motion.div>
                            ))
                        )}
                    </div>
                </motion.div>
            </div>

            {/* Recently Added Employees */}
            <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }} className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700/50 shadow-card p-6">
                <div className="flex items-center gap-2.5 mb-6">
                    <div className="w-8 h-8 rounded-lg bg-primary-50 dark:bg-primary-900/20 flex items-center justify-center text-primary-600 dark:text-primary-400">
                        <svg className="w-4.5 h-4.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                        </svg>
                    </div>
                    <h3 className="text-base font-bold text-gray-900 dark:text-white">Recently Added</h3>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
                    {recentEmployees.length === 0 ? (
                        <div className="col-span-full text-center py-8"><p className="text-gray-400 dark:text-gray-500 text-sm">No employees added yet</p></div>
                    ) : (
                        recentEmployees.map((emp, index) => {
                            const colors = ['from-primary-400 to-primary-600', 'from-accent-400 to-accent-600', 'from-emerald-400 to-emerald-600', 'from-amber-400 to-amber-600', 'from-rose-400 to-rose-600'];
                            const avatarGradient = colors[index % colors.length];
                            return (
                                <motion.div key={emp.id} initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.6 + index * 0.04 }} whileHover={{ y: -3 }} className="group flex flex-col items-center text-center p-5 rounded-xl bg-gray-50 dark:bg-gray-700/20 border border-gray-100 dark:border-gray-700/30 hover:border-primary-200 dark:hover:border-primary-800/50 hover:shadow-card-hover transition-all">
                                    <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${avatarGradient} flex items-center justify-center text-white font-bold text-lg shadow-md group-hover:scale-105 transition-transform mb-3`}>
                                        {emp.full_name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
                                    </div>
                                    <div className="w-full">
                                        <p className="text-sm text-gray-800 dark:text-gray-200 font-semibold truncate">{emp.full_name}</p>
                                        <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">{emp.department}</p>
                                    </div>
                                </motion.div>
                            );
                        })
                    )}
                </div>
            </motion.div>
        </div>
    );
};

export default Dashboard;
