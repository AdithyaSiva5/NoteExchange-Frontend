"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../../contexts/AuthContext";
import FormField from "../../components/FormField";
import { ColoredToast } from "../../components/Toast";
import api from "../../lib/api";
import {
  FaBook,
  FaFeather,
  FaGraduationCap,
  FaInfoCircle,
  FaFileUpload,
  FaClipboardCheck,
  FaLightbulb,
} from "react-icons/fa";
import { motion } from "framer-motion";

export default function SubmitPost() {
  const { user } = useAuth();
  const router = useRouter();
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    subject: "Computer Science",
  });
  const [errors, setErrors] = useState({
    title: "",
    description: "",
    subject: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [charCount, setCharCount] = useState({ title: 0, description: 0 });

  const TITLE_MAX = 50;
  const DESC_MAX = 4000; // Unified limit for all users

  const SUBJECTS = [
    "Computer Science",
    "Mathematics",
    "Physics",
    "Chemistry",
    "Biology",
    "Engineering",
    "Business",
    "Economics",
    "Literature",
    "History",
    "Other",
  ];

  useEffect(() => {
    if (!user) router.push("/login");
  }, [user, router]);

  useEffect(() => {
    setCharCount({
      title: formData.title.length,
      description: formData.description.length,
    });
  }, [formData.title, formData.description]);

  const validateForm = () => {
    const newErrors = {};

    if (!formData.title.trim()) newErrors.title = "Title is required";
    else if (formData.title.length > TITLE_MAX)
      newErrors.title = `Title cannot exceed ${TITLE_MAX} characters`;

    if (!formData.description.trim())
      newErrors.description = "Note content is required";
    else if (formData.description.length > DESC_MAX) {
      newErrors.description = `Content cannot exceed ${DESC_MAX} characters`;
    }

    if (!formData.subject) newErrors.subject = "Subject is required";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm() || isSubmitting) return;

    setIsSubmitting(true);
    try {
      const response = await api.post("/api/posts", formData);
      if (response.data.success) {
        ColoredToast(
          "Your notes have been submitted and are awaiting approval!",
          "success"
        );
        router.push("/");
      }
    } catch (error) {
      ColoredToast(
        error.response?.data?.msg || "Failed to submit notes",
        "error"
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (field) => (value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => ({ ...prev, [field]: "" }));
  };

  if (!user) return null;

  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6, ease: "easeOut" },
    },
  };

  return (
    <div className="min-h-screen pt-20 pb-10 bg-gradient-to-br from-yellow-50 to-amber-100 dark:from-gray-900 dark:to-amber-900">
      <div className="container mx-auto px-4">
        <motion.div
          className="max-w-2xl mx-auto"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl overflow-hidden mb-8">
            <div className="bg-gradient-to-r from-yellow-500 to-amber-600 py-6 px-8 text-white">
              <h1 className="text-2xl font-bold flex items-center">
                <FaFileUpload className="mr-3" /> Upload Your Notes
              </h1>
              <p className="text-white/80 text-sm mt-1">
                Share your knowledge with other students
              </p>
            </div>

            <form onSubmit={handleSubmit} className="p-8">
              <FormField
                type="text"
                placeholder="Enter a descriptive title"
                value={formData.title}
                setFunc={handleChange("title")}
                error={errors.title}
                required
                maxLength={TITLE_MAX}
                label="Note Title"
              />

              <div className="mb-5">
                <label className="block text-sm font-medium mb-1.5 text-gray-700 dark:text-gray-300">
                  Subject <span className="text-red-500">*</span>
                </label>
                <select
                  value={formData.subject}
                  onChange={(e) => handleChange("subject")(e.target.value)}
                  className={`w-full p-3 border rounded-lg transition-all duration-200 focus:ring-0 focus:outline-none dark:bg-gray-800 dark:text-white ${
                    errors.subject
                      ? "border-red-300 dark:border-red-700 bg-red-50 dark:bg-red-900/20"
                      : "border-gray-200 dark:border-gray-700 focus:border-yellow-400 dark:focus:border-yellow-600 focus:ring-2 focus:ring-yellow-100 dark:focus:ring-yellow-900/30"
                  }`}
                >
                  {SUBJECTS.map((subject) => (
                    <option key={subject} value={subject}>
                      {subject}
                    </option>
                  ))}
                </select>
                {errors.subject && (
                  <p className="mt-1 text-red-500 text-sm">{errors.subject}</p>
                )}
              </div>

              <FormField
                type="textarea"
                placeholder="Write your notes content..."
                value={formData.description}
                setFunc={handleChange("description")}
                error={errors.description}
                required
                maxLength={DESC_MAX}
                label="Notes Content"
              />

              <div className="flex items-center justify-between mt-8">
                <button
                  type="button"
                  onClick={() => router.push("/")}
                  className="px-5 py-2 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="px-5 py-2 bg-gradient-to-r from-yellow-500 to-amber-600 text-white font-medium rounded-lg hover:from-yellow-600 hover:to-amber-700 transition-all duration-300 shadow-md disabled:opacity-70 flex items-center"
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
                      Submitting...
                    </span>
                  ) : (
                    <span className="flex items-center">
                      Submit Notes <FaBook className="ml-2" />
                    </span>
                  )}
                </button>
              </div>
            </form>
          </div>

          <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-xl p-6 shadow-lg">
            <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-3 flex items-center">
              <FaInfoCircle className="mr-2 text-yellow-500 dark:text-yellow-400" />
              Notes Submission Guidelines
            </h3>
            <ul className="space-y-2 text-gray-700 dark:text-gray-300 text-sm">
              <li className="flex items-start">
                <span className="text-yellow-500 dark:text-yellow-400 mr-2">
                  •
                </span>
                <span>
                  Your notes will be reviewed by our community moderators before
                  being published.
                </span>
              </li>
              <li className="flex items-start">
                <span className="text-yellow-500 dark:text-yellow-400 mr-2">
                  •
                </span>
                <span>
                  Keep content accurate, clear, and appropriate for student use.
                </span>
              </li>
              <li className="flex items-start">
                <span className="text-yellow-500 dark:text-yellow-400 mr-2">
                  •
                </span>
                <span>
                  Include important concepts, formulas, and examples when
                  applicable.
                </span>
              </li>
              <li className="flex items-start">
                <span className="text-yellow-500 dark:text-yellow-400 mr-2">
                  •
                </span>
                <span>
                  You earn points each time another student finds your notes
                  helpful.
                </span>
              </li>
            </ul>

            <div className="mt-4 bg-yellow-50 dark:bg-yellow-900/20 p-4 rounded-lg border border-yellow-100 dark:border-yellow-900/30">
              <div className="flex items-center text-amber-700 dark:text-amber-300 font-medium mb-2">
                <FaLightbulb className="mr-2" /> Pro Tip
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Organize your notes with clear headings, bullet points, and
                numbered lists when applicable. Structured notes are more likely
                to be approved and helpful to other students.
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
