"use client";

import { useState, useEffect } from "react";
import Head from "next/head";
import AuthProvider from "../contexts/AuthContext";
import Navbar from "../components/Navbar";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "../styles/globals.css";
import { motion, AnimatePresence } from "framer-motion";
import { FaBook, FaGraduationCap } from "react-icons/fa";

export default function ClientLayout({ children }) {
  const [theme, setTheme] = useState("light");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const savedTheme = localStorage.getItem("theme") || "light";
    setTheme(savedTheme);
    document.documentElement.classList.toggle("dark", savedTheme === "dark");

    // Simulate loading
    const timer = setTimeout(() => {
      setLoading(false);
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  const toggleTheme = () => {
    const newTheme = theme === "light" ? "dark" : "light";
    setTheme(newTheme);
    localStorage.setItem("theme", newTheme);
    document.documentElement.classList.toggle("dark");
  };

  return (
    <>
      <Head>
        <title>NotesExchange</title>
        <meta name="description" content="Share and access student notes" />
      </Head>

      <AnimatePresence mode="wait">
        {loading ? (
          <motion.div
            key="loader"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 flex items-center justify-center bg-gradient-to-br from-yellow-50 to-amber-100 dark:from-gray-900 dark:to-amber-900 z-50"
          >
            <div className="text-center">
              <motion.div
                animate={{
                  scale: [1, 1.2, 1],
                }}
                transition={{
                  repeat: Infinity,
                  duration: 1.5,
                  ease: "easeInOut",
                }}
                className="mb-4 flex justify-center"
              >
                <FaBook className="text-6xl text-yellow-500 dark:text-yellow-400" />
              </motion.div>
              <motion.p
                animate={{ opacity: [0.5, 1, 0.5] }}
                transition={{
                  repeat: Infinity,
                  duration: 2,
                  ease: "easeInOut",
                }}
                className="text-lg font-medium text-yellow-800 dark:text-yellow-200"
              >
                NotesExchange
              </motion.p>
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="content"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="min-h-screen flex flex-col"
          >
            <AuthProvider>
              <Navbar toggleTheme={toggleTheme} theme={theme} />
              <main className="flex-grow">{children}</main>
              {/* <Footer /> */}
              <ToastContainer
                position="top-right"
                autoClose={3000}
                hideProgressBar={false}
                newestOnTop
                closeOnClick
                rtl={false}
                pauseOnFocusLoss
                draggable
                pauseOnHover
                theme={theme}
              />
            </AuthProvider>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
