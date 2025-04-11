// next-client\src\app\register\page.jsx

"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import validator from "validator";
import FormField from "../../components/FormField";
import { ColoredToast } from "../../components/Toast";
import api, { registerRoute } from "../../lib/api";
import {
  FaUser,
  FaLock,
  FaEnvelope,
  FaImage,
  FaHeart,
  FaArrowRight,
} from "react-icons/fa";
import Link from "next/link";
import { motion } from "framer-motion";

export default function Register() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    profilePicture: "",
  });
  const [errors, setErrors] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    profilePicture: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const totalSteps = 2;

  const validateStep1 = () => {
    const newErrors = {};

    if (!formData.name.trim()) newErrors.name = "Name is required";
    else if (formData.name.length < 2)
      newErrors.name = "Name must be at least 2 characters";

    if (!validator.isEmail(formData.email))
      newErrors.email = "Please enter a valid email";

    setErrors({ ...errors, ...newErrors });
    return Object.keys(newErrors).length === 0;
  };

  const validateStep2 = () => {
    const newErrors = {};

    if (!validator.isStrongPassword(formData.password)) {
      newErrors.password =
        "Password must be strong (8+ chars, upper, lower, number, symbol)";
    }

    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
    }

    if (!formData.profilePicture.trim())
      newErrors.profilePicture = "Profile picture URL is required";
    else if (!validator.isURL(formData.profilePicture))
      newErrors.profilePicture = "Please enter a valid URL";

    setErrors({ ...errors, ...newErrors });
    return Object.keys(newErrors).length === 0;
  };

  const nextStep = () => {
    if (currentStep === 1 && validateStep1()) {
      setCurrentStep(2);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (currentStep === 1) {
      nextStep();
      return;
    }

    if (!validateStep2() || isSubmitting) {
      return;
    }

    try {
      setIsSubmitting(true);
      const response = await api.post(registerRoute, {
        name: formData.name,
        email: formData.email,
        password: formData.password,
        profilePicture: formData.profilePicture,
      });

      if (response.data.success) {
        ColoredToast("Registration successful!", "success");
        router.push("/login");
      }
    } catch (error) {
      ColoredToast(error.response?.data?.msg || "Registration failed", "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (field) => (value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => ({ ...prev, [field]: "" }));
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

  // Step animation variants
  const stepVariants = {
    hidden: { opacity: 0, x: 50 },
    visible: {
      opacity: 1,
      x: 0,
      transition: {
        duration: 0.4,
        ease: "easeOut",
      },
    },
    exit: {
      opacity: 0,
      x: -50,
      transition: {
        duration: 0.4,
        ease: "easeIn",
      },
    },
  };

  return (
    <div className="min-h-screen pt-16 flex items-center justify-center bg-gradient-to-br from-pink-50 to-purple-100 dark:from-gray-900 dark:to-purple-900">
      <motion.div
        className="w-full max-w-md p-8 mx-4"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {/* Register Card */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-pink-500 to-purple-600 py-6 px-8 text-white text-center">
            <div className="flex justify-center mb-2">
              <FaHeart className="text-3xl text-white" />
            </div>
            <h1 className="text-2xl font-bold">Create Account</h1>
            <p className="text-white/80 text-sm">
              Join our NoteExchange community
            </p>

            {/* Progress Steps */}
            <div className="flex justify-center mt-4">
              {[...Array(totalSteps)].map((_, i) => (
                <div key={i} className="flex items-center">
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center transition-all ${
                      i + 1 === currentStep
                        ? "bg-white text-pink-500"
                        : i + 1 < currentStep
                        ? "bg-white/20 text-white"
                        : "bg-white/10 text-white/50"
                    }`}
                  >
                    {i + 1}
                  </div>
                  {i < totalSteps - 1 && (
                    <div
                      className={`w-8 h-1 ${
                        i + 1 < currentStep ? "bg-white/60" : "bg-white/10"
                      }`}
                    ></div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="p-8">
            {currentStep === 1 && (
              <motion.div
                key="step1"
                variants={stepVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
              >
                <FormField
                  type="text"
                  placeholder="Enter your name"
                  value={formData.name}
                  setFunc={handleChange("name")}
                  error={errors.name}
                  required
                  icon={<FaUser size={16} />}
                  label="Your Name"
                  maxLength={50}
                />

                <FormField
                  type="email"
                  placeholder="Enter your email"
                  value={formData.email}
                  setFunc={handleChange("email")}
                  error={errors.email}
                  required
                  icon={<FaEnvelope size={16} />}
                  label="Email Address"
                />
              </motion.div>
            )}

            {currentStep === 2 && (
              <motion.div
                key="step2"
                variants={stepVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
              >
                <FormField
                  type="password"
                  placeholder="Create a password"
                  value={formData.password}
                  setFunc={handleChange("password")}
                  error={errors.password}
                  required
                  icon={<FaLock size={16} />}
                  label="Password"
                />

                <FormField
                  type="password"
                  placeholder="Confirm your password"
                  value={formData.confirmPassword}
                  setFunc={handleChange("confirmPassword")}
                  error={errors.confirmPassword}
                  required
                  icon={<FaLock size={16} />}
                  label="Confirm Password"
                />

                <FormField
                  type="text"
                  placeholder="Enter profile picture URL"
                  value={formData.profilePicture}
                  setFunc={handleChange("profilePicture")}
                  error={errors.profilePicture}
                  required
                  icon={<FaImage size={16} />}
                  label="Profile Picture URL"
                />
              </motion.div>
            )}

            <div className="flex justify-between mt-6">
              {currentStep > 1 ? (
                <button
                  type="button"
                  onClick={prevStep}
                  className="px-5 py-2 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                >
                  Back
                </button>
              ) : (
                <div></div>
              )}

              <button
                type={currentStep === totalSteps ? "submit" : "button"}
                onClick={currentStep < totalSteps ? nextStep : undefined}
                className="px-5 py-2 bg-gradient-to-r from-pink-500 to-purple-600 text-white font-medium rounded-lg hover:from-pink-600 hover:to-purple-700 transition-all duration-300 shadow-md disabled:opacity-70 flex items-center"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <span className="flex items-center">
                    <svg
                      className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
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
                    Processing...
                  </span>
                ) : currentStep < totalSteps ? (
                  <span className="flex items-center">
                    Continue <FaArrowRight className="ml-2" />
                  </span>
                ) : (
                  <span className="flex items-center">
                    Register <FaArrowRight className="ml-2" />
                  </span>
                )}
              </button>
            </div>
          </form>

          {/* Footer */}
          <div className="px-8 py-4 bg-gray-50 dark:bg-gray-900/30 border-t border-gray-200 dark:border-gray-700 text-center">
            <p className="text-gray-600 dark:text-gray-400">
              Already have an account?{" "}
              <Link
                href="/login"
                className="text-pink-600 dark:text-pink-400 font-medium hover:underline"
              >
                Sign In
              </Link>
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
