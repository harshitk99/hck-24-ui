"use client"

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { FaDatabase, FaCode, FaRocket } from 'react-icons/fa';

export default function LandingPage() {
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    const features = [
        {
            icon: <FaDatabase className="text-blue-500" />,
            title: "Database Connections",
            description: "Connect to multiple databases seamlessly"
        },
        {
            icon: <FaCode className="text-green-500" />,
            title: "Query Editor",
            description: "Write and execute queries with ease"
        },
        {
            icon: <FaRocket className="text-purple-500" />,
            title: "Real-time Results",
            description: "Get instant query results and insights"
        }
    ];

    return (
        <div className="flex min-h-screen flex-col items-center justify-center bg-black text-white">
            <div className="relative">
                {/* Animated background gradient */}
                <div className="absolute inset-0 -z-10 h-full w-full">
                    <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 via-purple-500/20 to-green-500/20 blur-3xl" />
                </div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8 }}
                    className="flex flex-col items-center space-y-8 p-8"
                >
                    {/* Title Section */}
                    <div className="text-center">
                        <motion.h1 
                            className="mb-4 text-5xl font-bold tracking-tight"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.2 }}
                        >
                            Database Query
                            <span className="bg-gradient-to-r from-blue-500 via-purple-500 to-green-500 bg-clip-text text-transparent"> Platform</span>
                        </motion.h1>
                        <motion.p 
                            className="text-lg text-white/60"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.4 }}
                        >
                            Connect, Query, and Manage Your Databases in One Place
                        </motion.p>
                    </div>

                    {/* Features Grid */}
                    <motion.div 
                        className="grid grid-cols-1 gap-6 sm:grid-cols-3 sm:gap-8"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.6 }}
                    >
                        {features.map((feature, index) => (
                            <motion.div
                                key={index}
                                className="rounded-xl border border-white/10 bg-white/5 p-6 backdrop-blur-sm transition-colors hover:border-white/20 hover:bg-white/10"
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                            >
                                <div className="mb-4 text-2xl">{feature.icon}</div>
                                <h3 className="mb-2 text-lg font-semibold">{feature.title}</h3>
                                <p className="text-sm text-white/60">{feature.description}</p>
                            </motion.div>
                        ))}
                    </motion.div>

                    {/* CTA Button */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.8 }}
                        className="mt-8"
                    >
                        <Link href="/connect">
                            <motion.button
                                className="group relative overflow-hidden rounded-full bg-white px-8 py-3 text-black transition-transform hover:scale-105"
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                            >
                                <span className="relative z-10 flex items-center gap-2 font-medium">
                                    Get Started
                                    <svg 
                                        className="h-4 w-4 transition-transform group-hover:translate-x-1"
                                        fill="none" 
                                        stroke="currentColor" 
                                        viewBox="0 0 24 24"
                                    >
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                                    </svg>
                                </span>
                                <div className="absolute inset-0 z-0 bg-gradient-to-r from-blue-500 via-purple-500 to-green-500 opacity-0 transition-opacity group-hover:opacity-10" />
                            </motion.button>
                        </Link>
                    </motion.div>

                    {/* Bottom Text */}
                    <motion.p 
                        className="mt-8 text-sm text-white/40"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 1 }}
                    >
                        Powerful database management at your fingertips
                    </motion.p>
                </motion.div>
            </div>
        </div>
    );
}