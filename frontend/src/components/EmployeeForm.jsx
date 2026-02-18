import { useState } from 'react';
import { motion } from 'framer-motion';

const EmployeeForm = ({ onSubmit, onCancel, loading = false }) => {
    const [formData, setFormData] = useState({
        employee_id: '',
        full_name: '',
        email: '',
        department: '',
    });
    const [errors, setErrors] = useState({});

    const departments = [
        'Engineering',
        'Product',
        'Design',
        'Marketing',
        'Sales',
        'Human Resources',
        'Finance',
        'Operations',
    ];

    const validateForm = () => {
        const newErrors = {};

        if (!formData.employee_id.trim()) {
            newErrors.employee_id = 'Employee ID is required';
        }
        if (!formData.full_name.trim()) {
            newErrors.full_name = 'Full name is required';
        }
        if (!formData.email.trim()) {
            newErrors.email = 'Email is required';
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
            newErrors.email = 'Please enter a valid email address';
        }
        if (!formData.department) {
            newErrors.department = 'Department is required';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validateForm()) return;

        try {
            await onSubmit(formData);
            setFormData({
                employee_id: '',
                full_name: '',
                email: '',
                department: '',
            });
            setErrors({});
        } catch (error) {
            // Error handled by parent
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: '' }));
        }
    };

    const inputBaseClass = "w-full px-4 py-2.5 rounded-lg border bg-gray-50 dark:bg-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-colors text-sm";
    const inputNormalBorder = "border-gray-200 dark:border-gray-700";
    const inputErrorBorder = "border-red-300 bg-red-50 dark:bg-red-900/20";

    return (
        <form onSubmit={handleSubmit} className="space-y-5">
            <div className="grid grid-cols-1 gap-4">
                {/* Employee ID */}
                <div>
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
                        Employee ID
                    </label>
                    <input
                        type="text"
                        name="employee_id"
                        value={formData.employee_id}
                        onChange={handleChange}
                        placeholder="e.g., EMP001"
                        className={`${inputBaseClass} ${errors.employee_id ? inputErrorBorder : inputNormalBorder}`}
                    />
                    {errors.employee_id && (
                        <p className="text-red-500 text-xs mt-1 font-medium">{errors.employee_id}</p>
                    )}
                </div>

                {/* Full Name */}
                <div>
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
                        Full Name
                    </label>
                    <input
                        type="text"
                        name="full_name"
                        value={formData.full_name}
                        onChange={handleChange}
                        placeholder="e.g., John Doe"
                        className={`${inputBaseClass} ${errors.full_name ? inputErrorBorder : inputNormalBorder}`}
                    />
                    {errors.full_name && (
                        <p className="text-red-500 text-xs mt-1 font-medium">{errors.full_name}</p>
                    )}
                </div>

                {/* Email */}
                <div>
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
                        Email Address
                    </label>
                    <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        placeholder="e.g., john@company.com"
                        className={`${inputBaseClass} ${errors.email ? inputErrorBorder : inputNormalBorder}`}
                    />
                    {errors.email && (
                        <p className="text-red-500 text-xs mt-1 font-medium">{errors.email}</p>
                    )}
                </div>

                {/* Department */}
                <div>
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
                        Department
                    </label>
                    <select
                        name="department"
                        value={formData.department}
                        onChange={handleChange}
                        className={`${inputBaseClass} appearance-none ${errors.department ? inputErrorBorder : inputNormalBorder}`}
                    >
                        <option value="">Select department</option>
                        {departments.map(dept => (
                            <option key={dept} value={dept}>{dept}</option>
                        ))}
                    </select>
                    {errors.department && (
                        <p className="text-red-500 text-xs mt-1 font-medium">{errors.department}</p>
                    )}
                </div>
            </div>

            <div className="mt-8 flex justify-end gap-3">
                {onCancel && (
                    <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        type="button"
                        onClick={onCancel}
                        className="px-5 py-2.5 text-gray-600 dark:text-gray-400 font-medium hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
                    >
                        Cancel
                    </motion.button>
                )}
                <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    type="submit"
                    disabled={loading}
                    className="px-6 py-2.5 bg-primary-600 text-white font-medium rounded-lg hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2 shadow-md shadow-primary-500/20"
                >
                    {loading ? (
                        <>
                            <motion.div
                                className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full"
                                animate={{ rotate: 360 }}
                                transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                            />
                            Adding...
                        </>
                    ) : (
                        <>
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                            </svg>
                            Add Employee
                        </>
                    )}
                </motion.button>
            </div>
        </form>
    );
};

export default EmployeeForm;
