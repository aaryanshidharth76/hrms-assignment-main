import { motion } from 'framer-motion';

const EmptyState = ({ icon, title, description }) => {
    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex flex-col items-center justify-center p-12 text-center"
        >
            <div className="w-20 h-20 bg-slate-100 dark:bg-slate-800 rounded-2xl flex items-center justify-center text-4xl mb-6 shadow-inner">
                {icon}
            </div>
            <h3 className="text-xl font-bold text-slate-800 dark:text-white mb-2">{title}</h3>
            <p className="text-slate-500 dark:text-slate-400 max-w-xs mx-auto font-medium">
                {description}
            </p>
        </motion.div>
    );
};

export default EmptyState;
