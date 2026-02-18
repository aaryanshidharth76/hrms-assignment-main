import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';

const EmployeeTable = ({ employees, onDelete, loading = false }) => {
    const tableRowVariants = {
        hidden: { opacity: 0, y: 10 },
        visible: (i) => ({
            opacity: 1,
            y: 0,
            transition: { delay: i * 0.03, duration: 0.2 }
        }),
        exit: { opacity: 0, x: -20, transition: { duration: 0.2 } }
    };

    return (
        <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
                <thead className="bg-slate-50 dark:bg-slate-900/50 border-b border-slate-200 dark:border-slate-700">
                    <tr>
                        <th className="px-6 py-4 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                            Employee
                        </th>
                        <th className="px-6 py-4 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider hidden sm:table-cell">
                            Email
                        </th>
                        <th className="px-6 py-4 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                            Department
                        </th>
                        <th className="px-6 py-4 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider text-right">
                            Actions
                        </th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    <AnimatePresence mode="popLayout">
                        {employees.map((employee, index) => (
                            <motion.tr
                                key={employee.id}
                                custom={index}
                                variants={tableRowVariants}
                                initial="hidden"
                                animate="visible"
                                exit="exit"
                                layout
                                className="group hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
                            >
                                <td className="px-4 sm:px-6 py-4">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center text-white font-bold text-sm shadow-sm flex-shrink-0">
                                            {employee.full_name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
                                        </div>
                                        <div>
                                            <p className="font-semibold text-slate-800 dark:text-slate-200 whitespace-nowrap">{employee.full_name}</p>
                                            <p className="text-xs text-slate-500 dark:text-slate-400 font-mono flex items-center gap-1">
                                                <span className="opacity-50">#</span>{employee.employee_id}
                                            </p>
                                        </div>
                                    </div>
                                </td>
                                <td className="px-6 py-4 hidden sm:table-cell">
                                    <span className="text-sm text-slate-600 dark:text-slate-400">{employee.email}</span>
                                </td>
                                <td className="px-4 sm:px-6 py-4">
                                    <span className="inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-semibold bg-primary-50 dark:bg-primary-900/20 text-primary-700 dark:text-primary-400 border border-primary-100 dark:border-primary-800 whitespace-nowrap">
                                        {employee.department}
                                    </span>
                                </td>
                                <td className="px-4 sm:px-6 py-4">
                                    <div className="flex items-center justify-end gap-1">
                                        <Link to={`/attendance/${employee.employee_id}`}>
                                            <motion.button
                                                whileHover={{ scale: 1.1, backgroundColor: 'rgba(59, 130, 246, 0.1)' }}
                                                whileTap={{ scale: 0.9 }}
                                                className="p-2 rounded-lg text-slate-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors"
                                                title="View Attendance"
                                            >
                                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                                                </svg>
                                            </motion.button>
                                        </Link>
                                        <motion.button
                                            whileHover={{ scale: 1.1, backgroundColor: 'rgba(239, 68, 68, 0.1)' }}
                                            whileTap={{ scale: 0.9 }}
                                            onClick={() => onDelete(employee)}
                                            disabled={loading}
                                            className="p-2 rounded-lg text-slate-400 hover:text-red-600 dark:hover:text-red-400 transition-colors disabled:opacity-50"
                                            title="Delete Employee"
                                        >
                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                            </svg>
                                        </motion.button>
                                    </div>
                                </td>
                            </motion.tr>
                        ))}
                    </AnimatePresence>
                </tbody>
            </table>
        </div>
    );
};

export default EmployeeTable;
