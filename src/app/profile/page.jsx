"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../../contexts/AuthContext";
import FormField from "../../components/FormField";
import { ColoredToast } from "../../components/Toast";
import api from "../../lib/api";
import {
  FaUser,
  FaGraduationCap,
  FaCalendarAlt,
  FaEdit,
  FaCheck,
  FaArrowRight,
  FaBook,
  FaChartLine,
} from "react-icons/fa";
import { motion } from "framer-motion";
import ProfileImage from "../../components/ProfileImage";

export default function Profile() {
  const { user, setUser } = useAuth();
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({ name: user?.name || "" });
  const [errors, setErrors] = useState({ name: "" });
  const [isEditing, setIsEditing] = useState(false);

  const NAME_MAX = 15;

  useEffect(() => {
    if (!user) router.push("/");
    else setFormData((prev) => ({ ...prev, name: user.name }));
  }, [user, router]);

  const validateForm = () => {
    const newErrors = {};
    if (!formData.name.trim() || formData.name.length < 2) {
      newErrors.name = "Name must be at least 2 characters";
    } else if (formData.name.length > NAME_MAX) {
      newErrors.name = `Name cannot exceed ${NAME_MAX} characters`;
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmitName = async (e) => {
    e.preventDefault();
    if (!validateForm() || isSubmitting) return;

    setIsSubmitting(true);
    try {
      const response = await api.put("/api/user/update-name", {
        name: formData.name,
      });
      if (response.data.success) {
        setUser(response.data.user);
        ColoredToast("Name updated successfully!", "success");
        setIsEditing(false);
      }
    } catch (error) {
      ColoredToast(error.response?.data?.msg || "Error updating name", "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (field) => (value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => ({ ...prev, [field]: "" }));
  };

  if (!user) return null;

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

  const calculateDaysLeft = () => {
    if (!user.premium || !user.premiumExpiresAt) return 0;
    const expiresAt = new Date(user.premiumExpiresAt);
    const now = new Date();
    return Math.ceil((expiresAt - now) / (1000 * 60 * 60 * 24));
  };

  const daysLeft = calculateDaysLeft();

  return (
    <div className="min-h-screen pt-20 pb-10 bg-gradient-to-br from-yellow-50 to-amber-100 dark:from-gray-900 dark:to-amber-900">
      <div className="container mx-auto px-4">
        <motion.div
          className="max-w-xl mx-auto"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl overflow-hidden">
            {/* Profile Header */}
            <div className="bg-gradient-to-r from-yellow-500 to-amber-600 py-6 px-8">
              <div className="flex items-center">
                <div className="relative">
                  <ProfileImage
                    src={user.profilePicture}
                    alt={user.name}
                    size={64} // w-16 h-16 is 64px
                    className="border-2 border-white"
                  />
                  {user.premium && (
                    <div className="absolute -top-1 -right-1 bg-amber-400 rounded-full p-1">
                      <FaGraduationCap className="text-white text-xs" />
                    </div>
                  )}
                </div>
                <div className="ml-4 text-white">
                  <h1 className="text-2xl font-bold">{user.name}</h1>
                  <p className="text-white/80 text-sm">{user.email}</p>
                </div>
              </div>
            </div>

            {/* Profile Content */}
            <div className="p-6">
              {/* Name Update Section */}
              <div className="mb-8">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-semibold text-gray-800 dark:text-white flex items-center">
                    <FaUser className="mr-2 text-yellow-500 dark:text-yellow-400" />{" "}
                    Profile Information
                  </h2>
                  {!isEditing && (
                    <button
                      onClick={() => setIsEditing(true)}
                      className="text-sm px-3 py-1 rounded-full bg-yellow-100 dark:bg-yellow-900/30 text-yellow-600 dark:text-yellow-400 hover:bg-yellow-200 dark:hover:bg-yellow-900/50 transition-colors flex items-center"
                    >
                      <FaEdit className="mr-1" /> Edit
                    </button>
                  )}
                </div>

                {isEditing ? (
                  <form onSubmit={handleSubmitName} className="mb-4">
                    <FormField
                      type="text"
                      placeholder="Enter your name"
                      value={formData.name}
                      setFunc={handleChange("name")}
                      error={errors.name}
                      required
                      maxLength={NAME_MAX}
                      label="Your Name"
                      icon={<FaUser size={16} />}
                    />
                    <div className="flex space-x-3 mt-4">
                      <button
                        type="button"
                        onClick={() => setIsEditing(false)}
                        className="px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="px-4 py-2 bg-gradient-to-r from-yellow-500 to-amber-600 text-white rounded-lg hover:from-yellow-600 hover:to-amber-700 transition-all shadow-md flex items-center justify-center disabled:opacity-70"
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
                            Updating...
                          </span>
                        ) : (
                          <span className="flex items-center">
                            <FaCheck className="mr-2" /> Save Changes
                          </span>
                        )}
                      </button>
                    </div>
                  </form>
                ) : (
                  <div className="bg-gray-50 dark:bg-gray-900/20 rounded-lg p-4 mb-6">
                    <div className="flex items-center justify-between">
                      <div className="text-sm text-gray-500 dark:text-gray-400">
                        Name
                      </div>
                      <div className="font-medium text-gray-800 dark:text-white">
                        {user.name}
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Activity Stats Section */}
              <div className="mb-8">
                <h2 className="text-lg font-semibold text-gray-800 dark:text-white flex items-center mb-4">
                  <FaChartLine className="mr-2 text-yellow-500 dark:text-yellow-400" />{" "}
                  Your Activity
                </h2>

                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-gray-50 dark:bg-gray-900/20 rounded-lg p-4 text-center">
                    <div className="text-yellow-500 dark:text-yellow-400 mb-1">
                      <FaBook className="mx-auto text-xl" />
                    </div>
                    <div className="font-bold text-2xl text-gray-800 dark:text-white">
                      12
                    </div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">
                      Notes Viewed
                    </div>
                  </div>

                  <div className="bg-gray-50 dark:bg-gray-900/20 rounded-lg p-4 text-center">
                    <div className="text-yellow-500 dark:text-yellow-400 mb-1">
                      <FaBook className="mx-auto text-xl" />
                    </div>
                    <div className="font-bold text-2xl text-gray-800 dark:text-white">
                      3
                    </div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">
                      Notes Uploaded
                    </div>
                  </div>
                </div>
              </div>

              {/* Premium Status Section */}
              <div>
                <h2 className="text-lg font-semibold text-gray-800 dark:text-white flex items-center mb-4">
                  <FaGraduationCap className="mr-2 text-yellow-500 dark:text-yellow-400" />{" "}
                  Membership Status
                </h2>

                <div
                  className={`rounded-lg p-5 ${
                    user.premium
                      ? "bg-gradient-to-r from-yellow-50 to-amber-50 dark:from-yellow-900/20 dark:to-amber-900/20 border border-yellow-100 dark:border-yellow-900/30"
                      : "bg-gray-50 dark:bg-gray-900/20"
                  }`}
                >
                  {user.premium ? (
                    <div>
                      <div className="flex items-center">
                        <div className="mr-4">
                          <div className="w-12 h-12 rounded-full bg-gradient-to-r from-yellow-400 to-amber-500 flex items-center justify-center">
                            <FaGraduationCap className="text-white text-lg" />
                          </div>
                        </div>
                        <div>
                          <h3 className="font-semibold text-lg text-gray-800 dark:text-white">
                            Pro Member
                          </h3>
                          <p className="text-sm flex items-center text-gray-600 dark:text-gray-300">
                            <FaCalendarAlt className="mr-1 text-xs text-yellow-500 dark:text-yellow-400" />
                            Expires:{" "}
                            {new Date(
                              user.premiumExpiresAt
                            ).toLocaleDateString()}
                            <span className="ml-2 px-2 py-0.5 bg-yellow-100 dark:bg-yellow-900/40 text-yellow-800 dark:text-yellow-200 rounded-full text-xs">
                              {daysLeft} {daysLeft === 1 ? "day" : "days"} left
                            </span>
                          </p>
                        </div>
                      </div>
                      <div className="mt-4 text-sm text-gray-600 dark:text-gray-400">
                        Enjoy all Pro features including full notes access and
                        unlimited downloads.
                      </div>
                    </div>
                  ) : (
                    <div>
                      <h3 className="font-semibold text-gray-800 dark:text-white">
                        Free Member
                      </h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mt-1 mb-4">
                        Upgrade to Pro to unlock all features and benefits.
                      </p>
                      <button
                        onClick={() => router.push("/premium")}
                        className="w-full py-2 bg-gradient-to-r from-yellow-500 to-amber-600 text-white rounded-lg hover:from-yellow-600 hover:to-amber-700 transition-all shadow-md flex items-center justify-center"
                      >
                        Upgrade to Pro <FaArrowRight className="ml-2" />
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
