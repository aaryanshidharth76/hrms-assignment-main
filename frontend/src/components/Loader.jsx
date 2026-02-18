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
            <div className="fixed inset-0 bg-gray-50/80 dark:bg-gray-950/80 backdrop-blur-sm z-[100] flex flex-col items-center justify-center">
                <motion.div
                    className="w-14 h-14 border-4 border-primary-200 dark:border-primary-900 border-t-primary-600 rounded-full"
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                />
                <motion.p
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="mt-4 text-gray-600 dark:text-gray-400 font-semibold tracking-wide text-sm"
                >
                    Loading PeopleDesk...
                </motion.p>
                <AnimatePresence>
                    {showColdStartMessage && (
                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0 }}
                            className="mt-6 max-w-sm text-center px-4"
                        >
                            <div className="flex items-center justify-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                Waking up the server...
                            </div>
                            <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
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
            <div className="bg-gray-50 dark:bg-gray-900/50 h-12 border-b border-gray-200 dark:border-gray-700" />
            {[...Array(rows)].map((_, i) => (
                <div key={i} className="flex border-b border-gray-50 dark:border-gray-800 p-4">
                    {[...Array(cols)].map((_, j) => (
                        <div key={j} className="flex-1 h-8 bg-gray-100 dark:bg-gray-800 rounded mx-2" />
                    ))}
                </div>
            ))}
        </div>
    );
};

export default Loader;
