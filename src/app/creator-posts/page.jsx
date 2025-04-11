"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../../contexts/AuthContext";
import api from "../../lib/api";
import { ColoredToast } from "../../components/Toast";
import {
  FaBook,
  FaCheck,
  FaTimes,
  FaExclamationTriangle,
  FaSpinner,
  FaCheckCircle,
  FaHourglass,
  FaFilter,
  FaLock,
  FaChevronDown,
  FaChevronUp,
  FaClipboardCheck,
  FaGraduationCap,
} from "react-icons/fa";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import ProfileImage from "@/components/ProfileImage";

export default function CreatorPosts() {
  const { user } = useAuth();
  const router = useRouter();
  const [posts, setPosts] = useState([]);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
  });
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("pending"); // pending, approved, all
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [confirmAction, setConfirmAction] = useState({
    type: null,
    postId: null,
  });
  const [expandedPost, setExpandedPost] = useState(null);
  const [processing, setProcessing] = useState(false);

  const fetchPosts = async (page = 1, currentFilter = filter) => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      if (!token || !user?.creator) {
        ColoredToast("You must be a creator to view this page", "error");
        router.push("/login");
        return;
      }

      // Add filter parameter to API request
      const response = await api.get(
        `/api/posts?page=${page}&limit=10&filter=${currentFilter}`,
        {
          headers: { Authorization: token },
        }
      );
      setPosts(response.data.posts);
      setPagination({
        currentPage: response.data.pagination.currentPage,
        totalPages: response.data.pagination.totalPages,
      });
    } catch (error) {
      if (error.response?.status === 401) {
        ColoredToast("Session expired, please log in again", "error");
        localStorage.removeItem("token");
        router.push("/login");
      } else {
        ColoredToast(
          error.response?.data?.msg || "Failed to fetch notes",
          "error"
        );
      }
    } finally {
      setLoading(false);
    }
  };

  // Effect for initial load and when user changes
  useEffect(() => {
    if (user?.creator) {
      fetchPosts(1, filter);
    }
  }, [user]);

  // Handle filter change
  useEffect(() => {
    if (user?.creator) {
      fetchPosts(1, filter);
    }
  }, [filter]);

  const handleConfirmAction = (type, postId) => {
    setConfirmAction({ type, postId });
    setShowConfirmModal(true);
  };

  const executeAction = async () => {
    const { type, postId } = confirmAction;
    setShowConfirmModal(false);
    await handlePostAction(postId, type);
  };

  const handlePostAction = async (postId, action) => {
    setProcessing(true);
    try {
      const token = localStorage.getItem("token");
      if (action === "approve") {
        await api.put(
          `/api/posts/${postId}/approve`,
          {},
          { headers: { Authorization: token } }
        );
        setPosts(
          posts.map((p) => (p._id === postId ? { ...p, approved: true } : p))
        );
        ColoredToast("Notes approved", "success");
      } else if (action === "reject") {
        await api.delete(`/api/posts/${postId}/reject`, {
          headers: { Authorization: token },
        });
        setPosts(posts.filter((p) => p._id !== postId));
        ColoredToast("Notes rejected and deleted", "success");
      }

      // After action, refresh the posts to maintain accurate counts
      fetchPosts(pagination.currentPage, filter);
    } catch (error) {
      ColoredToast(
        error.response?.data?.msg || `Failed to ${action} notes`,
        "error"
      );
    } finally {
      setProcessing(false);
    }
  };

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= pagination.totalPages) {
      fetchPosts(newPage, filter);
    }
  };

  const toggleExpandPost = (postId) => {
    if (expandedPost === postId) {
      setExpandedPost(null);
    } else {
      setExpandedPost(postId);
    }
  };

  // Count pending posts
  const pendingCount = posts.filter((post) => !post.approved).length;

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { duration: 0.4 },
    },
  };

  if (loading) {
    return (
      <div className="min-h-screen pt-20 bg-gradient-to-br from-yellow-50 to-amber-100 dark:from-gray-900 dark:to-amber-900">
        <div
          className="container mx-auto px-4 py-8 flex items-center justify-center"
          style={{ height: "calc(100vh - 64px)" }}
        >
          <div className="flex flex-col items-center">
            <div className="w-16 h-16 border-4 border-yellow-600 border-t-transparent rounded-full animate-spin mb-4"></div>
            <p className="text-yellow-800 dark:text-yellow-300">
              Loading notes data...
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (!user?.creator) {
    return (
      <div className="min-h-screen pt-20 bg-gradient-to-br from-yellow-50 to-amber-100 dark:from-gray-900 dark:to-amber-900 flex items-center justify-center px-4">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg max-w-md w-full p-8 text-center">
          <FaLock className="mx-auto text-yellow-500 dark:text-yellow-400 text-5xl mb-4" />
          <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-2">
            Reviewer Access Required
          </h2>
          <p className="text-gray-600 dark:text-gray-300 mb-6">
            You need reviewer permissions to access this page. If you believe
            you should have access, please contact an administrator.
          </p>
          <Link
            href="/"
            className="inline-block px-6 py-3 bg-gradient-to-r from-yellow-500 to-amber-600 text-white rounded-lg hover:from-yellow-600 hover:to-amber-700 transition-all shadow-md"
          >
            Back to Home
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-20 bg-gradient-to-br from-yellow-50 to-amber-100 dark:from-gray-900 dark:to-amber-900">
      <div className="container mx-auto px-4 py-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
          <h1 className="text-3xl font-bold text-gray-800 dark:text-white flex items-center mb-4 md:mb-0">
            <FaClipboardCheck className="mr-3 text-yellow-600 dark:text-yellow-400" />{" "}
            Notes Review Panel
          </h1>

          <div className="flex items-center">
            <div className="relative mr-2">
              <select
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                className="appearance-none pl-10 pr-10 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 focus:outline-none focus:ring-2 focus:ring-yellow-500"
              >
                <option value="pending">Pending Review</option>
                <option value="approved">Approved</option>
                <option value="all">All Notes</option>
              </select>
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center px-3 text-gray-500 dark:text-gray-400">
                <FaFilter size={14} />
              </div>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-gray-500 dark:text-gray-400">
                <svg className="w-4 h-4 fill-current" viewBox="0 0 20 20">
                  <path
                    d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                    clipRule="evenodd"
                    fillRule="evenodd"
                  ></path>
                </svg>
              </div>
            </div>

            <div className="text-sm text-gray-600 dark:text-gray-300">
              <span className="rounded-full px-2 py-1 bg-yellow-100 dark:bg-yellow-900/20 text-yellow-800 dark:text-yellow-200">
                {filter === "pending" ? pendingCount : 0} pending
              </span>
            </div>
          </div>
        </div>

        <motion.div
          className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {posts.length > 0 ? (
            <div className="divide-y divide-gray-100 dark:divide-gray-700">
              {posts.map((post) => (
                <div
                  key={post._id}
                  className="transition-colors hover:bg-gray-50 dark:hover:bg-gray-700/30"
                >
                  {/* Card layout with top actions bar */}
                  <div className="p-4">
                    {/* Top section with status and actions */}
                    <div className="flex justify-between items-start mb-2">
                      <div className="flex items-center space-x-2">
                        {post.approved ? (
                          <span className="px-2 py-0.5 bg-green-100 dark:bg-green-900/20 text-green-800 dark:text-green-300 text-xs rounded-full flex items-center">
                            <FaCheckCircle className="mr-1" /> Approved
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 bg-yellow-100 dark:bg-yellow-900/20 text-yellow-800 dark:text-yellow-300 text-xs rounded-full flex items-center">
                            <FaHourglass className="mr-1" /> Pending
                          </span>
                        )}
                        <span className="px-2 py-0.5 bg-blue-100 dark:bg-blue-900/20 text-blue-800 dark:text-blue-300 text-xs rounded-full">
                          {post.subject || "Computer Science"}
                        </span>
                      </div>

                      {/* Action buttons always visible at top */}
                      {!post.approved && (
                        <div className="flex gap-2">
                          <button
                            onClick={() =>
                              handleConfirmAction("approve", post._id)
                            }
                            disabled={processing}
                            className="flex items-center px-3 py-1 text-sm rounded bg-green-600 text-white hover:bg-green-700 disabled:bg-green-400 transition-colors shadow-sm"
                          >
                            <FaCheck className="mr-1" /> Approve
                          </button>
                          <button
                            onClick={() =>
                              handleConfirmAction("reject", post._id)
                            }
                            disabled={processing}
                            className="flex items-center px-3 py-1 text-sm rounded bg-red-600 text-white hover:bg-red-700 disabled:bg-red-400 transition-colors shadow-sm"
                          >
                            <FaTimes className="mr-1" /> Reject
                          </button>
                        </div>
                      )}
                    </div>

                    {/* Note title */}
                    <h3 className="font-medium text-gray-800 dark:text-white text-lg mb-1">
                      {post.title}
                    </h3>

                    {/* Author info */}
                    <div className="flex items-center text-sm text-gray-500 dark:text-gray-400 mb-3">
                      <div className="flex items-center mr-4">
                        {post.userId.profilePicture ? (
                          <ProfileImage
                            src={post.userId.profilePicture}
                            alt={`${post.userId.name}'s profile`}
                            size={32}
                            className="mr-2 border-2 border-yellow-200 dark:border-yellow-800"
                          />
                        ) : null}
                        <span>By: {post.userId.name}</span>
                        {post.userId.premium && (
                          <FaGraduationCap className="ml-1 text-yellow-500 dark:text-yellow-400" />
                        )}
                      </div>
                      {post.approved && post.approvedBy && (
                        <div className="flex items-center">
                          <span>Approved by: {post.approvedBy.name}</span>
                        </div>
                      )}
                    </div>

                    {/* Note content with expand/collapse */}
                    <div className="bg-gray-50 dark:bg-gray-700/30 p-3 rounded">
                      <p
                        className={`text-gray-600 dark:text-gray-300 text-sm break-words ${
                          expandedPost === post._id ? "" : "line-clamp-3"
                        }`}
                      >
                        {post.description}
                      </p>

                      <button
                        className="text-yellow-600 dark:text-yellow-400 text-sm mt-2 focus:outline-none hover:underline flex items-center"
                        onClick={() => toggleExpandPost(post._id)}
                      >
                        {expandedPost === post._id ? (
                          <>
                            <FaChevronUp className="mr-1" size={12} /> Show Less
                          </>
                        ) : (
                          <>
                            <FaChevronDown className="mr-1" size={12} /> Show
                            More
                          </>
                        )}
                      </button>
                    </div>

                    {/* Expanded content section */}
                    {expandedPost === post._id && (
                      <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-700 text-gray-700 dark:text-gray-300">
                        <div className="bg-gray-50 dark:bg-gray-700/30 p-4 rounded-lg">
                          <h4 className="font-medium mb-2">
                            Full Notes Content:
                          </h4>
                          <p className="whitespace-pre-line break-words">
                            {post.description}
                          </p>

                          <div className="mt-4 text-sm text-gray-500 dark:text-gray-400">
                            <p>
                              Created:{" "}
                              {new Date(post.createdAt).toLocaleString()}
                            </p>
                            {post.approved && post.approvedAt && (
                              <p>
                                Approved:{" "}
                                {new Date(post.approvedAt).toLocaleString()}
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-8 text-center">
              {filter === "pending" ? (
                <>
                  <FaCheckCircle className="mx-auto text-green-500 text-4xl mb-4" />
                  <h3 className="text-lg font-medium text-gray-800 dark:text-white mb-1">
                    No pending notes
                  </h3>
                  <p className="text-gray-500 dark:text-gray-400">
                    All notes have been reviewed
                  </p>
                </>
              ) : filter === "approved" ? (
                <>
                  <FaBook className="mx-auto text-gray-400 dark:text-gray-500 text-4xl mb-4" />
                  <h3 className="text-lg font-medium text-gray-800 dark:text-white mb-1">
                    No approved notes
                  </h3>
                  <p className="text-gray-500 dark:text-gray-400">
                    Notes you approve will appear here
                  </p>
                </>
              ) : (
                <>
                  <FaBook className="mx-auto text-gray-400 dark:text-gray-500 text-4xl mb-4" />
                  <h3 className="text-lg font-medium text-gray-800 dark:text-white mb-1">
                    No notes found
                  </h3>
                  <p className="text-gray-500 dark:text-gray-400">
                    There are no notes to review at this time
                  </p>
                </>
              )}
            </div>
          )}

          {posts.length > 0 && pagination.totalPages > 1 && (
            <div className="flex justify-center py-4 border-t border-gray-100 dark:border-gray-700">
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => handlePageChange(pagination.currentPage - 1)}
                  disabled={pagination.currentPage === 1}
                  className="px-4 py-2 rounded-md bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600 disabled:opacity-50 disabled:pointer-events-none transition-colors"
                >
                  &larr; Previous
                </button>
                <div className="flex items-center space-x-1">
                  {[...Array(Math.min(5, pagination.totalPages))].map(
                    (_, i) => {
                      // Logic to show pages around current page
                      let pageToShow;
                      if (pagination.totalPages <= 5) {
                        pageToShow = i + 1;
                      } else if (pagination.currentPage <= 3) {
                        pageToShow = i + 1;
                      } else if (
                        pagination.currentPage >=
                        pagination.totalPages - 2
                      ) {
                        pageToShow = pagination.totalPages - 4 + i;
                      } else {
                        pageToShow = pagination.currentPage - 2 + i;
                      }

                      return (
                        <button
                          key={i}
                          onClick={() => handlePageChange(pageToShow)}
                          className={`w-10 h-10 rounded-md ${
                            pageToShow === pagination.currentPage
                              ? "bg-yellow-600 text-white"
                              : "bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600"
                          } transition-colors`}
                        >
                          {pageToShow}
                        </button>
                      );
                    }
                  )}
                </div>
                <button
                  onClick={() => handlePageChange(pagination.currentPage + 1)}
                  disabled={pagination.currentPage === pagination.totalPages}
                  className="px-4 py-2 rounded-md bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600 disabled:opacity-50 disabled:pointer-events-none transition-colors"
                >
                  Next &rarr;
                </button>
              </div>
            </div>
          )}
        </motion.div>

        {/* Reviewer Guidelines Section */}
        <div className="mt-8 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-xl p-6 shadow-lg">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-3">
            Reviewer Guidelines
          </h3>
          <ul className="space-y-2 text-gray-700 dark:text-gray-300">
            <li className="flex items-start">
              <span className="text-yellow-500 dark:text-yellow-400 mr-2">
                •
              </span>
              <span>
                Review notes carefully for accuracy and appropriate content
                before approving.
              </span>
            </li>
            <li className="flex items-start">
              <span className="text-yellow-500 dark:text-yellow-400 mr-2">
                •
              </span>
              <span>
                Ensure notes follow educational guidelines and are properly
                formatted.
              </span>
            </li>
            <li className="flex items-start">
              <span className="text-yellow-500 dark:text-yellow-400 mr-2">
                •
              </span>
              <span>
                Reject notes that contain plagiarized content or inappropriate
                material.
              </span>
            </li>
            <li className="flex items-start">
              <span className="text-yellow-500 dark:text-yellow-400 mr-2">
                •
              </span>
              <span>
                Reject notes that contain plagiarized content or inappropriate
                material.
              </span>
            </li>
            <li className="flex items-start">
              <span className="text-yellow-500 dark:text-yellow-400 mr-2">
                •
              </span>
              <span>
                All approved content should be helpful for students of all
                levels.
              </span>
            </li>
          </ul>
        </div>
      </div>

      {/* Confirmation Modal */}
      {showConfirmModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 px-4">
          <motion.div
            className="bg-white dark:bg-gray-800 rounded-xl shadow-xl max-w-md w-full p-6"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.2 }}
          >
            <div className="mb-4 text-center">
              <div className="mx-auto w-12 h-12 rounded-full bg-yellow-100 dark:bg-yellow-900/30 flex items-center justify-center text-yellow-600 dark:text-yellow-400 mb-4">
                <FaExclamationTriangle size={24} />
              </div>
              <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-2">
                Confirm Action
              </h3>
              <p className="text-gray-600 dark:text-gray-300">
                {confirmAction.type === "approve" && (
                  <>Are you sure you want to approve these notes?</>
                )}
                {confirmAction.type === "reject" && (
                  <>
                    Are you sure you want to reject these notes? This action
                    cannot be undone.
                  </>
                )}
              </p>
            </div>
            <div className="flex justify-center space-x-3">
              <button
                onClick={() => setShowConfirmModal(false)}
                className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={executeAction}
                className={`px-4 py-2 rounded-lg text-white transition-colors ${
                  confirmAction.type === "approve"
                    ? "bg-green-600 hover:bg-green-700"
                    : "bg-red-600 hover:bg-red-700"
                }`}
              >
                {processing ? (
                  <span className="flex items-center">
                    <FaSpinner className="animate-spin mr-2" /> Processing...
                  </span>
                ) : (
                  <>
                    {confirmAction.type === "approve" && "Approve"}
                    {confirmAction.type === "reject" && "Reject"}
                  </>
                )}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
