"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import api from "../../../lib/api";
import { ColoredToast } from "../../../components/Toast";
import AdminNav from "../../../components/AdminNav";
import {
  FaUsers,
  FaUserCog,
  FaGraduationCap,
  FaBan,
  FaSearch,
  FaSpinner,
  FaCheck,
  FaTimes,
  FaExclamationTriangle,
} from "react-icons/fa";
import { motion } from "framer-motion";

export default function AdminUsers() {
  const router = useRouter();
  const [users, setUsers] = useState([]);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
  });
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [isToggling, setIsToggling] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [confirmAction, setConfirmAction] = useState({
    type: null,
    userId: null,
  });

  const fetchUsers = async (page = 1) => {
    try {
      const token = localStorage.getItem("adminToken");
      if (!token) {
        ColoredToast("Please log in as admin", "error");
        router.push("/admin5839201");
        return;
      }

      const response = await api.get(
        `/api/5839201/users?page=${page}&limit=10`,
        {
          headers: { Authorization: token },
        }
      );
      setUsers(response.data.users);
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
          error.response?.data?.msg || "Failed to fetch users",
          "error"
        );
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) {
      setSearchResults([]);
      fetchUsers();
      return;
    }

    setIsSearching(true);
    try {
      const token = localStorage.getItem("adminToken");
      const response = await api.get(
        `/api/5839201/users/search?query=${encodeURIComponent(searchQuery)}`,
        {
          headers: { Authorization: token },
        }
      );
      setSearchResults(response.data.users);
      setUsers([]); // Clear paginated list
    } catch (error) {
      ColoredToast(
        error.response?.data?.msg || "Failed to search users",
        "error"
      );
    } finally {
      setIsSearching(false);
    }
  };

  const handleConfirmAction = (type, userId) => {
    setConfirmAction({ type, userId });
    setShowConfirmModal(true);
  };

  const executeAction = async () => {
    const { type, userId } = confirmAction;
    setShowConfirmModal(false);

    if (type === "creator") {
      await toggleCreator(userId);
    } else if (type === "premium") {
      await togglePremium(userId);
    } else if (type === "block") {
      await toggleBlock(userId);
    }
  };

  const toggleCreator = async (userId) => {
    if (isToggling) return;
    setIsToggling(true);
    try {
      const token = localStorage.getItem("adminToken");
      const response = await api.put(
        `/api/5839201/users/${userId}/toggle-creator`,
        {},
        { headers: { Authorization: token } }
      );
      updateUserState(userId, response.data.user);
      ColoredToast("Reviewer status updated", "success");
    } catch (error) {
      ColoredToast(
        error.response?.data?.msg || "Failed to update reviewer status",
        "error"
      );
    } finally {
      setIsToggling(false);
    }
  };

  const togglePremium = async (userId) => {
    if (isToggling) return;
    setIsToggling(true);
    try {
      const token = localStorage.getItem("adminToken");
      const response = await api.put(
        `/api/5839201/users/${userId}/toggle-premium`,
        {},
        { headers: { Authorization: token } }
      );
      updateUserState(userId, response.data.user);
      ColoredToast("Pro status updated", "success");
    } catch (error) {
      ColoredToast(
        error.response?.data?.msg || "Failed to update pro status",
        "error"
      );
    } finally {
      setIsToggling(false);
    }
  };

  const toggleBlock = async (userId) => {
    if (isToggling) return;
    setIsToggling(true);
    try {
      const token = localStorage.getItem("adminToken");
      const response = await api.put(
        `/api/5839201/users/${userId}/toggle-block`,
        {},
        { headers: { Authorization: token } }
      );
      updateUserState(userId, response.data.user);
      ColoredToast(
        `User ${response.data.user.blocked ? "blocked" : "unblocked"}`,
        "success"
      );
    } catch (error) {
      ColoredToast(
        error.response?.data?.msg || "Failed to toggle block status",
        "error"
      );
    } finally {
      setIsToggling(false);
    }
  };

  const updateUserState = (userId, updatedUser) => {
    if (searchResults.length > 0) {
      setSearchResults((prev) =>
        prev.map((u) => (u._id === userId ? { ...u, ...updatedUser } : u))
      );
    } else {
      setUsers((prev) =>
        prev.map((u) => (u._id === userId ? { ...u, ...updatedUser } : u))
      );
    }
  };

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= pagination.totalPages) {
      fetchUsers(newPage);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

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
              Loading users data...
            </p>
          </div>
        </div>
      </div>
    );
  }

  const displayUsers = searchResults.length > 0 ? searchResults : users;

  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-50 to-amber-100 dark:from-gray-900 dark:to-amber-900">
      <AdminNav />
      <div className="container mx-auto px-4 py-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
          <h1 className="text-3xl font-bold text-gray-800 dark:text-white flex items-center mb-4 md:mb-0">
            <FaUsers className="mr-3 text-yellow-600 dark:text-yellow-400" />
            {/* Manage Users */}
          </h1>
          <div className="flex items-center text-sm">
            <span className="mr-2 text-gray-600 dark:text-gray-300">
              {searchResults.length > 0
                ? `${searchResults.length} search results`
                : `Showing ${
                    (pagination.currentPage - 1) * 10 + 1
                  } - ${Math.min(
                    pagination.currentPage * 10,
                    (pagination.currentPage - 1) * 10 + displayUsers.length
                  )} of many users`}
            </span>
          </div>
        </div>

        {/* Search Bar */}
        <motion.form
          onSubmit={handleSearch}
          className="mb-6"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          <div className="flex flex-col md:flex-row">
            <div className="relative flex-grow mb-3 md:mb-0 md:mr-3">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FaSearch className="text-gray-400 dark:text-gray-500" />
              </div>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by name or email..."
                className="w-full pl-10 pr-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-yellow-500 dark:focus:ring-yellow-600"
              />
            </div>
            <button
              type="submit"
              className="py-3 px-6 bg-gradient-to-r from-yellow-600 to-amber-600 text-white rounded-lg hover:from-yellow-700 hover:to-amber-700 transition-all shadow-md flex items-center justify-center disabled:opacity-70"
              disabled={isSearching}
            >
              {isSearching ? (
                <>
                  <FaSpinner className="animate-spin mr-2" />
                  Searching...
                </>
              ) : (
                <>
                  <FaSearch className="mr-2" />
                  Search
                </>
              )}
            </button>
            {searchResults.length > 0 && (
              <button
                type="button"
                onClick={() => {
                  setSearchQuery("");
                  setSearchResults([]);
                  fetchUsers();
                }}
                className="mt-3 md:mt-0 md:ml-3 py-3 px-4 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              >
                Clear Search
              </button>
            )}
          </div>
        </motion.form>

        <motion.div
          className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {displayUsers.length > 0 ? (
            <>
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="bg-gray-50 dark:bg-gray-700/30">
                      <th className="px-4 py-3 text-sm font-medium text-gray-500 dark:text-gray-400">
                        User
                      </th>
                      <th className="px-4 py-3 text-sm font-medium text-gray-500 dark:text-gray-400">
                        Email
                      </th>
                      <th className="px-4 py-3 text-sm font-medium text-gray-500 dark:text-gray-400">
                        Status
                      </th>
                      <th className="px-4 py-3 text-sm font-medium text-gray-500 dark:text-gray-400">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                    {displayUsers.map((user) => (
                      <tr
                        key={user._id}
                        className="hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors"
                      >
                        <td className="px-4 py-3">
                          <div className="flex items-center">
                            {user.profilePicture ? (
                              <img
                                src={user.profilePicture}
                                alt={user.name}
                                className="w-10 h-10 rounded-full mr-3 object-cover border border-gray-200 dark:border-gray-700"
                              />
                            ) : (
                              <div className="w-10 h-10 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center mr-3">
                                <FaUsers className="text-gray-500 dark:text-gray-400" />
                              </div>
                            )}
                            <span className="font-medium text-gray-800 dark:text-white">
                              {user.name}
                            </span>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-gray-600 dark:text-gray-300">
                          {user.email}
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex flex-wrap gap-1">
                            {user.creator && (
                              <span className="px-2 py-1 text-xs rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 flex items-center">
                                <FaUserCog className="mr-1" /> Reviewer
                              </span>
                            )}
                            {user.premium && (
                              <span className="px-2 py-1 text-xs rounded-full bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300 flex items-center">
                                <FaGraduationCap className="mr-1" /> Pro
                                {user.premiumExpiresAt && (
                                  <span className="ml-1 text-xs">
                                    (Expires:{" "}
                                    {new Date(
                                      user.premiumExpiresAt
                                    ).toLocaleDateString()}
                                    )
                                  </span>
                                )}
                              </span>
                            )}
                            {user.blocked && (
                              <span className="px-2 py-1 text-xs rounded-full bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300 flex items-center">
                                <FaBan className="mr-1" /> Blocked
                              </span>
                            )}
                            {!user.creator &&
                              !user.premium &&
                              !user.blocked && (
                                <span className="px-2 py-1 text-xs rounded-full bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-300">
                                  Standard
                                </span>
                              )}
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex flex-wrap gap-2">
                            <button
                              onClick={() =>
                                handleConfirmAction("creator", user._id)
                              }
                              disabled={isToggling}
                              className="flex items-center px-3 py-1 text-xs rounded bg-blue-600 text-white hover:bg-blue-700 disabled:bg-blue-400 transition-colors shadow-sm"
                            >
                              <FaUserCog className="mr-1" />
                              {user.creator
                                ? "Remove Reviewer"
                                : "Make Reviewer"}
                            </button>
                            <button
                              onClick={() =>
                                handleConfirmAction("premium", user._id)
                              }
                              disabled={isToggling}
                              className="flex items-center px-3 py-1 text-xs rounded bg-yellow-600 text-white hover:bg-yellow-700 disabled:bg-yellow-400 transition-colors shadow-sm"
                            >
                              <FaGraduationCap className="mr-1" />
                              {user.premium ? "Remove Pro" : "Add Pro"}
                            </button>
                            <button
                              onClick={() =>
                                handleConfirmAction("block", user._id)
                              }
                              disabled={isToggling}
                              className={`flex items-center px-3 py-1 text-xs rounded text-white transition-colors shadow-sm ${
                                user.blocked
                                  ? "bg-green-600 hover:bg-green-700 disabled:bg-green-400"
                                  : "bg-red-600 hover:bg-red-700 disabled:bg-red-400"
                              }`}
                            >
                              {user.blocked ? (
                                <>
                                  <FaCheck className="mr-1" /> Unblock User
                                </>
                              ) : (
                                <>
                                  <FaBan className="mr-1" /> Block User
                                </>
                              )}
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {searchResults.length === 0 && pagination.totalPages > 1 && (
                <div className="flex justify-center py-4 border-t border-gray-100 dark:border-gray-700">
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() =>
                        handlePageChange(pagination.currentPage - 1)
                      }
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
                      onClick={() =>
                        handlePageChange(pagination.currentPage + 1)
                      }
                      disabled={
                        pagination.currentPage === pagination.totalPages
                      }
                      className="px-4 py-2 rounded-md bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600 disabled:opacity-50 disabled:pointer-events-none transition-colors"
                    >
                      Next &rarr;
                    </button>
                  </div>
                </div>
              )}
            </>
          ) : (
            <div className="p-8 text-center">
              <FaSearch className="mx-auto text-gray-400 dark:text-gray-500 text-4xl mb-4" />
              <h3 className="text-lg font-medium text-gray-800 dark:text-white mb-1">
                No users found
              </h3>
              <p className="text-gray-500 dark:text-gray-400">
                Try adjusting your search or filters
              </p>
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
                {confirmAction.type === "creator" && (
                  <>
                    Are you sure you want to{" "}
                    {displayUsers.find((u) => u._id === confirmAction.userId)
                      ?.creator
                      ? "remove"
                      : "add"}{" "}
                    reviewer status?
                  </>
                )}
                {confirmAction.type === "premium" && (
                  <>
                    Are you sure you want to{" "}
                    {displayUsers.find((u) => u._id === confirmAction.userId)
                      ?.premium
                      ? "remove"
                      : "add"}{" "}
                    pro status?
                  </>
                )}
                {confirmAction.type === "block" && (
                  <>
                    Are you sure you want to{" "}
                    {displayUsers.find((u) => u._id === confirmAction.userId)
                      ?.blocked
                      ? "unblock"
                      : "block"}{" "}
                    this user?
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
                className="px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors"
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
