import { motion } from 'framer-motion';

const EmptyState = ({ icon, title, description }) => {
    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex flex-col items-center justify-center p-12 text-center"
        >
            <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-2xl flex items-center justify-center mb-5 shadow-inner">
                {icon}
            </div>
            <h3 className="text-lg font-bold text-gray-800 dark:text-white mb-1.5">{title}</h3>
            <p className="text-gray-500 dark:text-gray-400 max-w-xs mx-auto text-sm">
                {description}
            </p>
        </motion.div>
    );
};

export default EmptyState;
