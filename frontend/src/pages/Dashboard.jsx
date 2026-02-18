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
                <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
            ),
            bg: 'bg-gradient-to-br from-violet-500 to-purple-600',
            shadow: 'shadow-violet-500/20'
        },
        {
            title: 'Present Today',
            value: stats?.present_today || 0,
            subtitle: today,
            icon: (
                <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
            ),
            bg: 'bg-gradient-to-br from-emerald-500 to-teal-600',
            shadow: 'shadow-emerald-500/20'
        },
        {
            title: 'Absent Today',
            value: stats?.absent_today || 0,
            icon: (
                <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
            ),
            bg: 'bg-gradient-to-br from-rose-500 to-red-600',
            shadow: 'shadow-rose-500/20'
        },
        {
            title: 'Not Marked',
            value: stats?.not_marked || 0,
            icon: (
                <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
            ),
            bg: 'bg-gradient-to-br from-amber-500 to-orange-600',
            shadow: 'shadow-amber-500/20'
        }
    ];

    const departmentColors = {
        Engineering: 'text-blue-600 dark:text-blue-400',
        Product: 'text-purple-600 dark:text-purple-400',
        Design: 'text-pink-600 dark:text-pink-400',
        Marketing: 'text-green-600 dark:text-green-400',
        Sales: 'text-yellow-600 dark:text-yellow-400',
        'Human Resources': 'text-teal-600 dark:text-teal-400',
        Finance: 'text-indigo-600 dark:text-indigo-400',
        Operations: 'text-orange-600 dark:text-orange-400',
        IT: 'text-cyan-600 dark:text-cyan-400',
    };

    const containerVariants = {
        hidden: { opacity: 0 },
        show: { opacity: 1, transition: { staggerChildren: 0.1 } }
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 20 },
        show: { opacity: 1, y: 0 }
    };

    // Glass card class
    const glassCard = "bg-white/70 dark:bg-slate-800/70 backdrop-blur-md border border-white/20 dark:border-slate-700/50";

    return (
        <div className="space-y-8 max-w-7xl mx-auto">
            <ErrorBanner message={error} onDismiss={() => setError(null)} />

            {/* Stat Cards */}
            <motion.div variants={containerVariants} initial="hidden" animate="show" className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {statCards.map((card) => (
                    <motion.div
                        key={card.title}
                        variants={itemVariants}
                        whileHover={{ y: -8, scale: 1.02 }}
                        className={`group relative ${glassCard} p-6 rounded-3xl shadow-xl overflow-hidden transition-all`}
                    >
                        <div className={`absolute -right-4 -top-4 w-24 h-24 rounded-full ${card.bg} opacity-10 group-hover:opacity-20 transition-opacity`} />
                        <div className="flex items-center justify-between relative z-10">
                            <div>
                                <p className="text-sm font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">{card.title}</p>
                                <h3 className="text-4xl font-black text-slate-900 dark:text-white mt-2 tracking-tight">{card.value}</h3>
                                {card.subtitle && (
                                    <p className="text-xs font-medium text-slate-400 dark:text-slate-500 mt-2 flex items-center gap-1">
                                        <span className="w-1 h-1 rounded-full bg-slate-400" />
                                        {card.subtitle}
                                    </p>
                                )}
                            </div>
                            <div className={`w-14 h-14 rounded-2xl ${card.bg} flex items-center justify-center text-white shadow-2xl ${card.shadow} transform group-hover:rotate-6 transition-transform backdrop-blur-sm border border-white/20`}>
                                {card.icon}
                            </div>
                        </div>
                    </motion.div>
                ))}
            </motion.div>

            {/* Main Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Departments Section */}
                <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.4 }} className={`lg:col-span-1 ${glassCard} rounded-3xl p-8 shadow-xl`}>
                    <div className="flex items-center justify-between mb-8">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-blue-500/10 backdrop-blur-sm flex items-center justify-center text-xl border border-blue-500/20">🏢</div>
                            <h3 className="text-xl font-black text-slate-800 dark:text-white">Departments</h3>
                        </div>
                    </div>
                    <div className="space-y-4">
                        {Object.entries(departmentCounts).length === 0 ? (
                            <div className="text-center py-8"><p className="text-slate-400 dark:text-slate-500 text-sm italic">No departments yet</p></div>
                        ) : (
                            Object.entries(departmentCounts).map(([dept, count], index) => (
                                <motion.div key={dept} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.5 + index * 0.05 }} whileHover={{ x: 5 }} className="group flex items-center justify-between p-4 rounded-2xl bg-white/50 dark:bg-slate-900/40 backdrop-blur-sm border border-slate-100/50 dark:border-slate-700/30 hover:bg-white/80 dark:hover:bg-slate-700/50 hover:shadow-lg transition-all">
                                    <span className="text-slate-700 dark:text-slate-300 font-bold">{dept}</span>
                                    <Link to={`/employees?department=${encodeURIComponent(dept)}`} className={`${departmentColors[dept] || 'text-blue-600 dark:text-blue-400'} bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm px-3 py-1 rounded-lg text-sm font-black shadow-sm group-hover:shadow-md transition-all border border-white/20`}>
                                        {count}
                                    </Link>
                                </motion.div>
                            ))
                        )}
                    </div>
                </motion.div>

                {/* Recent Activity Section */}
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }} className={`lg:col-span-2 ${glassCard} rounded-3xl p-8 shadow-xl`}>
                    <div className="flex items-center justify-between mb-8">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-amber-500/10 backdrop-blur-sm flex items-center justify-center text-xl border border-amber-500/20">📋</div>
                            <h3 className="text-xl font-black text-slate-800 dark:text-white">Recent Activity</h3>
                        </div>
                        <Link to="/mark-attendance" className="text-sm font-bold text-primary-600 hover:underline">View All</Link>
                    </div>
                    <div className="space-y-4">
                        {recentActivity.length === 0 ? (
                            <div className="text-center py-12"><p className="text-slate-400 dark:text-slate-500 text-sm italic">No recent activity recorded</p></div>
                        ) : (
                            recentActivity.map((activity, index) => (
                                <motion.div key={activity.id} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.6 + index * 0.05 }} whileHover={{ scale: 1.01 }} className="flex items-center justify-between p-5 rounded-2xl bg-white/50 dark:bg-slate-900/40 backdrop-blur-sm border border-slate-100/50 dark:border-slate-700/30 hover:bg-white/80 dark:hover:bg-slate-700/50 hover:shadow-lg transition-all">
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-slate-200 to-slate-300 dark:from-slate-700 dark:to-slate-800 backdrop-blur-sm flex items-center justify-center text-slate-600 dark:text-slate-300 font-black border border-white/20">
                                            {activity.employee?.full_name[0]}
                                        </div>
                                        <div>
                                            <p className="text-slate-800 dark:text-slate-200 font-bold">{activity.employee?.full_name || 'Unknown'}</p>
                                            <p className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-tighter">{activity.date}</p>
                                        </div>
                                    </div>
                                    <span className={`px-4 py-1.5 rounded-xl text-xs font-black uppercase tracking-widest border-2 backdrop-blur-sm ${activity.status === 'Present' ? 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20' : 'bg-rose-500/10 text-rose-600 border-rose-500/20'}`}>
                                        {activity.status}
                                    </span>
                                </motion.div>
                            ))
                        )}
                    </div>
                </motion.div>
            </div>

            {/* Recently Added Employees */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }} className={`${glassCard} rounded-3xl p-8 shadow-xl`}>
                <div className="flex items-center gap-3 mb-8">
                    <div className="w-10 h-10 rounded-xl bg-violet-500/10 backdrop-blur-sm flex items-center justify-center text-xl border border-violet-500/20">✨</div>
                    <h3 className="text-xl font-black text-slate-800 dark:text-white">Recently Added Employees</h3>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
                    {recentEmployees.length === 0 ? (
                        <div className="col-span-full text-center py-8"><p className="text-slate-400 dark:text-slate-500 text-sm italic">No employees added yet</p></div>
                    ) : (
                        recentEmployees.map((emp, index) => {
                            const colors = ['from-violet-500 to-purple-600', 'from-blue-500 to-indigo-600', 'from-emerald-500 to-teal-600', 'from-amber-500 to-orange-600', 'from-rose-500 to-pink-600'];
                            const avatarGradient = colors[index % colors.length];
                            return (
                                <motion.div key={emp.id} initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.7 + index * 0.05 }} whileHover={{ y: -5 }} className="group flex flex-col items-center text-center p-6 rounded-3xl bg-white/50 dark:bg-slate-900/40 backdrop-blur-sm border border-slate-100/50 dark:border-slate-700/30 hover:bg-white/80 dark:hover:bg-slate-700/50 hover:shadow-xl transition-all">
                                    <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${avatarGradient} flex items-center justify-center text-white font-black text-xl shadow-lg group-hover:scale-110 transition-transform mb-4 backdrop-blur-sm border border-white/20`}>
                                        {emp.full_name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
                                    </div>
                                    <div className="w-full">
                                        <p className="text-slate-800 dark:text-slate-200 font-black truncate">{emp.full_name}</p>
                                        <p className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-tighter mt-1">{emp.department}</p>
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
