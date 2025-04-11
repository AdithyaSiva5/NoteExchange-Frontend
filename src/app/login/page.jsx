"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import validator from "validator";
import { useAuth } from "../../contexts/AuthContext";
import FormField from "../../components/FormField";
import { ColoredToast } from "../../components/Toast";
import {
  FaGoogle,
  FaUser,
  FaLock,
  FaBook,
  FaEnvelope,
  FaArrowRight,
  FaGraduationCap,
} from "react-icons/fa";
import Link from "next/link";
import { motion } from "framer-motion";

export default function Login() {
  const [password, setPassword] = useState("");
  const [email, setEmail] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [emailError, setEmailError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();
  const { login, loginWithGoogle } = useAuth();

  const handleValidation = () => {
    let formIsValid = true;

    if (!validator.isEmail(email)) {
      formIsValid = false;
      setEmailError("Please enter a valid email address");
    } else {
      setEmailError("");
    }

    if (!validator.isStrongPassword(password)) {
      formIsValid = false;
      setPasswordError(
        "Password must include 8+ characters, uppercase, lowercase, number, and symbol"
      );
    } else {
      setPasswordError("");
    }
    return formIsValid;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isSubmitting || !handleValidation()) return;

    try {
      setIsSubmitting(true);
      const success = await login({ email, password });
      if (success) {
        ColoredToast("Login Successful!", "success");
        router.push("/"); // Try this first
        // window.location.href = '/'; // Uncomment if router.push fails
      }
    } catch (error) {
      ColoredToast(error.message || "Login failed", "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Background animation variants
  const backgroundVariants = {
    initial: {
      backgroundPosition: "0% 0%",
    },
    animate: {
      backgroundPosition: "100% 100%",
      transition: {
        duration: 20,
        ease: "linear",
        repeat: Infinity,
        repeatType: "reverse",
      },
    },
  };

  // Container animation variants
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
    <motion.div
      className="min-h-screen pt-16 flex items-center justify-center bg-gradient-to-br from-yellow-50 to-amber-100 dark:from-gray-900 dark:to-amber-900"
      variants={backgroundVariants}
      initial="initial"
      animate="animate"
    >
      <motion.div
        className="w-full max-w-md p-8 mx-4"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {/* Login Card */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-yellow-500 to-amber-600 py-6 px-8 text-white text-center">
            <div className="flex justify-center mb-2">
              <FaBook className="text-3xl text-white" />
            </div>
            <h1 className="text-2xl font-bold">Welcome Back</h1>
            <p className="text-white/80 text-sm">
              Sign in to continue accessing study notes
            </p>
          </div>
          {/* Form */}
          <form onSubmit={handleSubmit} className="p-8">
            {/* <FormField
              type="email"
              placeholder="Enter your email"
              value={email}
              setFunc={setEmail}
              error={emailError}
              required
              icon={<FaEnvelope size={16} />}
              label="Email Address"
            />

            <FormField
              type="password"
              placeholder="Enter your password"
              value={password}
              setFunc={setPassword}
              error={passwordError}
              required
              icon={<FaLock size={16} />}
              label="Password"
            />

            <button
              type="submit"
              className="w-full mt-2 py-3 px-4 bg-gradient-to-r from-yellow-500 to-amber-600 text-white font-medium rounded-lg hover:from-yellow-600 hover:to-amber-700 transition-all duration-300 shadow-md disabled:opacity-70 flex items-center justify-center"
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
                  Signing in...
                </span>
              ) : (
                <span className="flex items-center">
                  Sign In <FaArrowRight className="ml-2" />
                </span>
              )}
            </button>

            <div className="my-6 flex items-center">
              <div className="flex-grow h-px bg-gray-200 dark:bg-gray-700"></div>
              <div className="mx-4 text-sm text-gray-500 dark:text-gray-400">
                or
              </div>
              <div className="flex-grow h-px bg-gray-200 dark:bg-gray-700"></div>
            </div>  */}

            <button
              type="button"
              onClick={loginWithGoogle}
              className="w-full py-3 px-4 flex items-center justify-center bg-white dark:bg-gray-700 text-gray-700 dark:text-white border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-600 transition-all duration-300 shadow-sm"
              disabled={isSubmitting}
            >
              <FaGoogle className="mr-3 text-red-500" />
              Continue with Google
            </button>
          </form>

          {/* Education Benefits */}
          <div className="px-8 pb-6">
            <div className="bg-yellow-50 dark:bg-yellow-900/20 rounded-lg p-4 border border-yellow-100 dark:border-yellow-900/30">
              <h3 className="text-amber-800 dark:text-amber-300 font-medium flex items-center mb-2">
                <FaGraduationCap className="mr-2" /> Student Benefits
              </h3>
              <ul className="text-sm text-gray-600 dark:text-gray-300 space-y-2">
                <li className="flex items-start">
                  <span className="text-yellow-500 mr-2">•</span>
                  <span>Access to thousands of study notes</span>
                </li>
                <li className="flex items-start">
                  <span className="text-yellow-500 mr-2">•</span>
                  <span>Upload and share your own notes</span>
                </li>
                <li className="flex items-start">
                  <span className="text-yellow-500 mr-2">•</span>
                  <span>Earn rewards for helpful contributions</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}
