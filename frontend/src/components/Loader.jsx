import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const Loader = ({ fullScreen = false }) => {
    const [showColdStartMessage, setShowColdStartMessage] = useState(false);

    useEffect(() => {
        if (fullScreen) {
            const timer = setTimeout(() => {
                setShowColdStartMessage(true);
            }, 3000);
            return () => clearTimeout(timer);
        }
    }, [fullScreen]);

    if (fullScreen) {
        return (
            <div className="fixed inset-0 bg-slate-50/80 dark:bg-slate-900/80 backdrop-blur-sm z-[100] flex flex-col items-center justify-center">
                <motion.div
                    className="w-16 h-16 border-4 border-primary-200 dark:border-primary-900 border-t-primary-600 rounded-full"
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                />
                <motion.p
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="mt-4 text-slate-600 dark:text-slate-400 font-bold tracking-wide"
                >
                    Loading HRMS Lite...
                </motion.p>
                <AnimatePresence>
                    {showColdStartMessage && (
                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0 }}
                            className="mt-6 max-w-sm text-center px-4"
                        >
                            <p className="text-sm text-slate-500 dark:text-slate-400">
                                ☕ Waking up the server...
                            </p>
                            <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">
                                First load may take up to 30 seconds on free hosting.
                            </p>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        );
    }

    return (
        <div className="flex justify-center p-8">
            <motion.div
                className="w-10 h-10 border-4 border-primary-200 dark:border-primary-900 border-t-primary-600 rounded-full"
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
            />
        </div>
    );
};

export const TableSkeleton = ({ rows = 5, cols = 4 }) => {
    return (
        <div className="w-full animate-pulse">
            <div className="bg-slate-50 dark:bg-slate-900/50 h-12 border-b border-slate-200 dark:border-slate-700" />
            {[...Array(rows)].map((_, i) => (
                <div key={i} className="flex border-b border-slate-100 dark:border-slate-800 p-4">
                    {[...Array(cols)].map((_, j) => (
                        <div key={j} className="flex-1 h-8 bg-slate-100 dark:bg-slate-800 rounded mx-2" />
                    ))}
                </div>
            ))}
        </div>
    );
};

export default Loader;
