"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import api from "../../../lib/api";
import { ColoredToast } from "../../../components/Toast";
import AdminNav from "../../../components/AdminNav";
import {
  FaBook,
  FaCheck,
  FaTimes,
  FaTrash,
  FaFilter,
  FaExclamationTriangle,
  FaSpinner,
  FaCheckCircle,
  FaHourglass,
  FaTags,
  FaSortAmountDown,
} from "react-icons/fa";
import { motion } from "framer-motion";

export default function AdminPosts() {
  const router = useRouter();
  const [posts, setPosts] = useState([]);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
  });
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all"); // all, pending, approved
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [confirmAction, setConfirmAction] = useState({
    type: null,
    postId: null,
    title: "",
  });
  const [expandedPost, setExpandedPost] = useState(null);
  const [processing, setProcessing] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  // Check if device is mobile
  useEffect(() => {
    const checkIsMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkIsMobile();
    window.addEventListener("resize", checkIsMobile);

    return () => window.removeEventListener("resize", checkIsMobile);
  }, []);

  const fetchPosts = async (page = 1) => {
    try {
      setLoading(true);
      const token = localStorage.getItem("adminToken");
      if (!token) {
        ColoredToast("Please log in as admin", "error");
        router.push("/admin5839201");
        return;
      }

      const response = await api.get(`/api/posts?page=${page}&limit=10`, {
        headers: { Authorization: token },
      });
      setPosts(response.data.posts);
      setPagination({
        currentPage: response.data.pagination.currentPage,
        totalPages: response.data.pagination.totalPages,
      });
    } catch (error) {
      if (error.response?.status === 401) {
        ColoredToast("Session expired, please log in again", "error");
        localStorage.removeItem("adminToken");
        router.push("/admin5839201");
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

  useEffect(() => {
    fetchPosts();
  }, []);

  const handleConfirmAction = (type, postId, title = "") => {
    setConfirmAction({ type, postId, title });
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
      const token = localStorage.getItem("adminToken");
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
      } else if (action === "delete") {
        await api.delete(`/api/posts/${postId}`, {
          headers: { Authorization: token },
        });
        setPosts(posts.filter((p) => p._id !== postId));
        ColoredToast("Notes deleted", "success");
      }
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
      fetchPosts(newPage);
    }
  };

  const filteredPosts = posts.filter((post) => {
    if (filter === "pending") return !post.approved;
    if (filter === "approved") return post.approved;
    return true; // "all" filter
  });

  const toggleExpandPost = (postId) => {
    if (expandedPost === postId) {
      setExpandedPost(null);
    } else {
      setExpandedPost(postId);
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { duration: 0.4 },
    },
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-yellow-50 to-amber-100 dark:from-gray-900 dark:to-amber-900">
        <AdminNav />
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-50 to-amber-100 dark:from-gray-900 dark:to-amber-900">
      <AdminNav />
      <div className="container mx-auto px-4 py-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
          <h1 className="text-3xl font-bold text-gray-800 dark:text-white flex items-center mb-4 md:mb-0">
            <FaBook className="mr-3 text-yellow-600 dark:text-yellow-400" />{" "}
            
          </h1>

          <div className="flex items-center">
            <div className="relative mr-2">
              <select
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                className="appearance-none pl-10 pr-10 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 focus:outline-none focus:ring-2 focus:ring-yellow-500"
              >
                <option value="all">All Notes</option>
                <option value="pending">Pending Approval</option>
                <option value="approved">Approved</option>
              </select>
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center px-3 text-gray-500 dark:text-gray-400">
                <FaFilter size={14} />
              </div>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-gray-500 dark:text-gray-400">
                <FaSortAmountDown className="h-4 w-4" />
              </div>
            </div>

            <div className="text-sm text-gray-600 dark:text-gray-300">
              <span className="rounded-full px-2 py-1 bg-yellow-100 dark:bg-yellow-900/20 text-yellow-800 dark:text-yellow-200">
                {filter === "pending"
                  ? filteredPosts.length
                  : posts.filter((post) => !post.approved).length}{" "}
                pending
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
          {filteredPosts.length > 0 ? (
            <div>
              {filteredPosts.map((post) => (
                <div
                  key={post._id}
                  className="relative transition-colors hover:bg-gray-50 dark:hover:bg-gray-700/30 border-b-4 border-gray-100 dark:border-gray-700 mb-4 pb-2"
                >
                  <div className={`p-6 ${isMobile ? "" : "pr-28"}`}>
                    {/* Status badges */}
                    <div className="flex flex-wrap items-center gap-2 mb-3">
                      {post.approved ? (
                        <span className="px-2 py-1 bg-green-100 dark:bg-green-900/20 text-green-800 dark:text-green-300 text-sm rounded-md font-medium flex items-center">
                          <FaCheckCircle className="mr-1.5" /> Approved
                        </span>
                      ) : (
                        <span className="px-2 py-1 bg-yellow-100 dark:bg-yellow-900/20 text-yellow-800 dark:text-yellow-300 text-sm rounded-md font-medium flex items-center">
                          <FaHourglass className="mr-1.5" /> Pending
                        </span>
                      )}
                      <span className="px-2 py-1 bg-blue-100 dark:bg-blue-900/20 text-blue-800 dark:text-blue-300 text-sm rounded-md font-medium flex items-center">
                        <FaTags className="mr-1.5" />
                        {post.subject || "Computer Science"}
                      </span>
                    </div>

                    <div className="flex flex-col md:flex-row md:items-start md:justify-between">
                      <div className="flex-grow mb-3 md:mb-0 md:mr-4">
                        {/* Title */}
                        <h3 className="font-medium text-gray-800 dark:text-white text-xl mb-2">
                          {post.title}
                        </h3>

                        {/* Author info */}
                        <div className="flex items-center text-sm text-gray-500 dark:text-gray-400 mb-3">
                          <div className="flex items-center mr-4">
                            {post.userId?.profilePicture ? (
                              <img
                                src={post.userId.profilePicture}
                                alt={post.userId.name}
                                className="w-6 h-6 rounded-full mr-2"
                              />
                            ) : null}
                            <span className="font-medium">
                              By: {post.userId?.name || "Unknown User"}
                            </span>
                          </div>
                          {post.approved && post.approvedBy && (
                            <div className="flex items-center">
                              <span>Approved by: {post.approvedBy.name}</span>
                            </div>
                          )}
                        </div>

                        {/* Note content */}
                        <div
                          className="cursor-pointer bg-gray-50 dark:bg-gray-700/30 p-4 rounded-lg"
                          onClick={() => toggleExpandPost(post._id)}
                        >
                          <p
                            className={`text-gray-600 dark:text-gray-300 ${
                              expandedPost === post._id ? "" : "line-clamp-3"
                            }`}
                          >
                            {post.description}
                          </p>

                          {/* Show more/less link */}
                          <button className="mt-2 text-yellow-600 dark:text-yellow-400 font-medium text-sm hover:underline flex items-center">
                            {expandedPost === post._id
                              ? "Show less"
                              : "Show more"}
                          </button>

                          {/* Expandable content */}
                          {expandedPost === post._id && (
                            <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-600 text-gray-700 dark:text-gray-300">
                              <h4 className="font-medium mb-2 text-gray-800 dark:text-white">
                                Full Notes Content:
                              </h4>
                              <p className="whitespace-pre-line overflow-auto max-h-96 text-gray-600 dark:text-gray-300">
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
                          )}
                        </div>
                      </div>

                      {/* Action buttons - always visible on right side for desktop */}
                      {!isMobile && (
                        <div className="absolute right-6 top-6 flex flex-col space-y-3">
                          {!post.approved && (
                            <>
                              <button
                                onClick={() =>
                                  handleConfirmAction(
                                    "approve",
                                    post._id,
                                    post.title
                                  )
                                }
                                disabled={processing}
                                className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-md shadow-sm transition-colors flex items-center justify-center min-w-[100px] font-medium"
                              >
                                <FaCheck className="mr-1.5" /> Approve
                              </button>
                              <button
                                onClick={() =>
                                  handleConfirmAction(
                                    "reject",
                                    post._id,
                                    post.title
                                  )
                                }
                                disabled={processing}
                                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-md shadow-sm transition-colors flex items-center justify-center min-w-[100px] font-medium"
                              >
                                <FaTimes className="mr-1.5" /> Reject
                              </button>
                            </>
                          )}
                          <button
                            onClick={() =>
                              handleConfirmAction(
                                "delete",
                                post._id,
                                post.title
                              )
                            }
                            disabled={processing}
                            className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-md shadow-sm transition-colors flex items-center justify-center min-w-[100px] font-medium"
                          >
                            <FaTrash className="mr-1.5" /> Delete
                          </button>
                        </div>
                      )}
                    </div>

                    {/* Mobile action buttons - at the bottom of the card */}
                    {isMobile && (
                      <div className="flex flex-wrap gap-3 mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                        {!post.approved && (
                          <>
                            <button
                              onClick={() =>
                                handleConfirmAction(
                                  "approve",
                                  post._id,
                                  post.title
                                )
                              }
                              disabled={processing}
                              className="flex-1 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-md shadow-sm transition-colors flex items-center justify-center font-medium"
                            >
                              <FaCheck className="mr-1.5" /> Approve
                            </button>
                            <button
                              onClick={() =>
                                handleConfirmAction(
                                  "reject",
                                  post._id,
                                  post.title
                                )
                              }
                              disabled={processing}
                              className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-md shadow-sm transition-colors flex items-center justify-center font-medium"
                            >
                              <FaTimes className="mr-1.5" /> Reject
                            </button>
                          </>
                        )}
                        <button
                          onClick={() =>
                            handleConfirmAction("delete", post._id, post.title)
                          }
                          disabled={processing}
                          className={`${
                            !post.approved ? "flex-none" : "flex-1"
                          } px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-md shadow-sm transition-colors flex items-center justify-center font-medium`}
                        >
                          <FaTrash className="mr-1.5" /> Delete
                        </button>
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
                    Approve notes to see them here
                  </p>
                </>
              ) : (
                <>
                  <FaBook className="mx-auto text-gray-400 dark:text-gray-500 text-4xl mb-4" />
                  <h3 className="text-lg font-medium text-gray-800 dark:text-white mb-1">
                    No notes found
                  </h3>
                  <p className="text-gray-500 dark:text-gray-400">
                    There are no notes in the system
                  </p>
                </>
              )}
            </div>
          )}

          {filteredPosts.length > 0 && pagination.totalPages > 1 && (
            <div className="flex justify-center py-6 border-t border-gray-200 dark:border-gray-700">
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => handlePageChange(pagination.currentPage - 1)}
                  disabled={pagination.currentPage === 1}
                  className="px-4 py-2 rounded-md bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600 disabled:opacity-50 disabled:pointer-events-none transition-colors"
                >
                  ← Previous
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
                  Next →
                </button>
              </div>
            </div>
          )}
        </motion.div>
      </div>

      {/* Confirmation Modal */}
      {showConfirmModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 px-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl max-w-md w-full p-6 animate-fade-in">
            <div className="mb-4 text-center">
              <div className="mx-auto w-12 h-12 rounded-full bg-yellow-100 dark:bg-yellow-900/30 flex items-center justify-center text-yellow-600 dark:text-yellow-400 mb-4">
                <FaExclamationTriangle size={24} />
              </div>
              <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-2">
                Confirm Action
              </h3>
              <p className="text-gray-600 dark:text-gray-300">
                {confirmAction.type === "approve" && (
                  <>Are you sure you want to approve "{confirmAction.title}"?</>
                )}
                {confirmAction.type === "reject" && (
                  <>
                    Are you sure you want to reject "{confirmAction.title}"?
                    This action cannot be undone.
                  </>
                )}
                {confirmAction.type === "delete" && (
                  <>
                    Are you sure you want to delete "{confirmAction.title}"?
                    This action cannot be undone.
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
                    : confirmAction.type === "reject" ||
                      confirmAction.type === "delete"
                    ? "bg-red-600 hover:bg-red-700"
                    : "bg-yellow-600 hover:bg-yellow-700"
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
                    {confirmAction.type === "delete" && "Delete"}
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
