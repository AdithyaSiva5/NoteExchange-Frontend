"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import FormField from "../../components/FormField";
import { ColoredToast } from "../../components/Toast";
import api from "../../lib/api";
import { FaLock, FaEnvelope, FaShieldAlt, FaArrowRight, FaUniversity } from "react-icons/fa";
import { motion } from "framer-motion";

export default function AdminLogin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();

  // Check if already logged in
  useEffect(() => {
    const token = localStorage.getItem("adminToken");
    if (token) {
      router.push("/admin5839201/dashboard");
    }
  }, [router]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isSubmitting || !email || !password) return;

    try {
      setIsSubmitting(true);
      const response = await api.post("/api/5839201/login", {
        email,
        password,
      });
      if (response.data.success) {
        localStorage.setItem("adminToken", response.data.token);
        ColoredToast("Admin login successful!", "success");
        router.push("/admin5839201/dashboard");
      }
    } catch (error) {
      ColoredToast(error.response?.data?.msg || "Admin login failed", "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        ease: "easeOut",
      },
    },
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-yellow-100 to-amber-100 dark:from-gray-900 dark:to-amber-900">
      <motion.div
        className="w-full max-w-md p-8"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-yellow-700 to-amber-800 py-8 px-8 text-white text-center">
            <div className="flex justify-center mb-4">
              <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center">
                <FaShieldAlt className="text-yellow-700 text-3xl" />
              </div>
            </div>
            <h1 className="text-2xl font-bold">Admin Login</h1>
            <p className="text-white/80 text-sm mt-1">Secure admin access</p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="p-8">
            <FormField
              type="email"
              placeholder="Enter admin email"
              value={email}
              setFunc={setEmail}
              required
              icon={<FaEnvelope size={16} />}
              label="Admin Email"
            />

            <FormField
              type="password"
              placeholder="Enter admin password"
              value={password}
              setFunc={setPassword}
              required
              icon={<FaLock size={16} />}
              label="Admin Password"
            />

            <button
              type="submit"
              className="w-full mt-6 py-3 px-4 bg-gradient-to-r from-yellow-700 to-amber-800 text-white font-medium rounded-lg hover:from-yellow-800 hover:to-amber-900 transition-all duration-300 shadow-md disabled:opacity-70 flex items-center justify-center"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <span className="flex items-center">
                  <svg
                    className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  Authenticating...
                </span>
              ) : (
                <span className="flex items-center">
                  Access Admin Panel <FaArrowRight className="ml-2" />
                </span>
              )}
            </button>

            <div className="mt-6 text-center">
              <a
                href="/"
                className="text-sm text-yellow-600 dark:text-yellow-400 hover:underline"
              >
                Return to main site
              </a>
            </div>
          </form>

          {/* Security Notice */}
          <div className="bg-yellow-50 dark:bg-yellow-900/20 border-t border-yellow-100 dark:border-yellow-900/30 p-4 text-center">
            <p className="text-xs text-yellow-800 dark:text-yellow-300 flex items-center justify-center">
              <FaLock className="mr-1" /> Secure admin access only
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}