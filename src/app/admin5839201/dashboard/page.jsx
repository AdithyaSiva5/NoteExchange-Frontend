"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import api from "../../../lib/api";
import { ColoredToast } from "../../../components/Toast";
import AdminNav from "../../../components/AdminNav";
import {
  FaUsers,
  FaBook,
  FaCheckCircle,
  FaHourglass,
  FaUserCog,
  FaGraduationCap,
  FaBan,
  FaCheck,
  FaTimes,
  FaTrash,
  FaChalkboard,
  FaUniversity,
} from "react-icons/fa";
import { motion } from "framer-motion";

export default function AdminDashboard() {
  const router = useRouter();
  const [users, setUsers] = useState([]);
  const [posts, setPosts] = useState([]);
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalCreators: 0,
    totalPremium: 0,
    totalBlocked: 0,
    totalPosts: 0,
    pendingPosts: 0,
    approvedPosts: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem("adminToken");
        if (!token) {
          ColoredToast("Please log in as admin", "error");
          router.push("/admin5839201");
          return;
        }

        const [usersRes, postsRes] = await Promise.all([
          api.get("/api/5839201/users", { headers: { Authorization: token } }),
          api.get("/api/posts", { headers: { Authorization: token } }),
        ]);

        const fetchedUsers = usersRes.data.users;
        const fetchedPosts = postsRes.data.posts;

        setUsers(fetchedUsers);
        setPosts(fetchedPosts);

        // Calculate statistics
        setStats({
          totalUsers: fetchedUsers.length,
          totalCreators: fetchedUsers.filter((user) => user.creator).length,
          totalPremium: fetchedUsers.filter((user) => user.premium).length,
          totalBlocked: fetchedUsers.filter((user) => user.blocked).length,
          totalPosts: fetchedPosts.length,
          pendingPosts: fetchedPosts.filter((post) => !post.approved).length,
          approvedPosts: fetchedPosts.filter((post) => post.approved).length,
        });
      } catch (error) {
        if (error.response?.status === 401) {
          ColoredToast("Session expired, please log in again", "error");
          localStorage.removeItem("adminToken");
          router.push("/admin5839201");
        } else {
          ColoredToast(
            error.response?.data?.msg || "Failed to fetch data",
            "error"
          );
        }
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [router]);

  const toggleCreator = async (userId) => {
    try {
      const token = localStorage.getItem("adminToken");
      const response = await api.put(
        `/api/5839201/users/${userId}/toggle-creator`,
        {},
        {
          headers: { Authorization: token },
        }
      );
      setUsers(users.map((u) => (u._id === userId ? response.data.user : u)));
      ColoredToast("Reviewer status updated", "success");
    } catch (error) {
      ColoredToast(
        error.response?.data?.msg || "Failed to update reviewer status",
        "error"
      );
    }
  };

  const handlePostAction = async (postId, action) => {
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
    }
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
              Loading dashboard data...
            </p>
          </div>
        </div>
      </div>
    );
  }

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.4 },
    },
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-50 to-amber-100 dark:from-gray-900 dark:to-amber-900">
      <AdminNav />
      <div className="container mx-auto px-4 py-6">
        <h1 className="text-3xl font-bold mb-6 text-gray-800 dark:text-white">
          {/* Admin Dashboard */}
        </h1>

        {/* Stats Section */}
        <motion.div
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {/* Users Stats */}
          <motion.div
            variants={itemVariants}
            className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 border-l-4 border-blue-500"
          >
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-blue-100 dark:bg-blue-900/30 mr-4">
                <FaUsers className="text-xl text-blue-500 dark:text-blue-400" />
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Total Users
                </p>
                <h3 className="text-2xl font-bold text-gray-800 dark:text-white">
                  {stats.totalUsers}
                </h3>
              </div>
            </div>
            <div className="mt-4 grid grid-cols-3 gap-2 text-center text-xs">
              <div className="bg-gray-50 dark:bg-gray-700/30 p-2 rounded">
                <FaUserCog className="mx-auto text-blue-500 dark:text-blue-400 mb-1" />
                <p className="text-gray-500 dark:text-gray-400">Reviewers</p>
                <p className="font-semibold text-gray-800 dark:text-white">
                  {stats.totalCreators}
                </p>
              </div>
              <div className="bg-gray-50 dark:bg-gray-700/30 p-2 rounded">
                <FaGraduationCap className="mx-auto text-yellow-500 mb-1" />
                <p className="text-gray-500 dark:text-gray-400">Pro Users</p>
                <p className="font-semibold text-gray-800 dark:text-white">
                  {stats.totalPremium}
                </p>
              </div>
              <div className="bg-gray-50 dark:bg-gray-700/30 p-2 rounded">
                <FaBan className="mx-auto text-red-500 mb-1" />
                <p className="text-gray-500 dark:text-gray-400">Blocked</p>
                <p className="font-semibold text-gray-800 dark:text-white">
                  {stats.totalBlocked}
                </p>
              </div>
            </div>
          </motion.div>

          {/* Notes Stats */}
          <motion.div
            variants={itemVariants}
            className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 border-l-4 border-yellow-500"
          >
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-yellow-100 dark:bg-yellow-900/30 mr-4">
                <FaBook className="text-xl text-yellow-500 dark:text-yellow-400" />
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Total Notes
                </p>
                <h3 className="text-2xl font-bold text-gray-800 dark:text-white">
                  {stats.totalPosts}
                </h3>
              </div>
            </div>
            <div className="mt-4 grid grid-cols-2 gap-2 text-center text-xs">
              <div className="bg-gray-50 dark:bg-gray-700/30 p-2 rounded">
                <FaCheckCircle className="mx-auto text-green-500 mb-1" />
                <p className="text-gray-500 dark:text-gray-400">Approved</p>
                <p className="font-semibold text-gray-800 dark:text-white">
                  {stats.approvedPosts}
                </p>
              </div>
              <div className="bg-gray-50 dark:bg-gray-700/30 p-2 rounded">
                <FaHourglass className="mx-auto text-orange-500 mb-1" />
                <p className="text-gray-500 dark:text-gray-400">Pending</p>
                <p className="font-semibold text-gray-800 dark:text-white">
                  {stats.pendingPosts}
                </p>
              </div>
            </div>
          </motion.div>

          {/* Education Stats */}
          <motion.div
            variants={itemVariants}
            className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 border-l-4 border-green-500"
          >
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-green-100 dark:bg-green-900/30 mr-4">
                <FaUniversity className="text-xl text-green-500 dark:text-green-400" />
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Top Subjects
                </p>
                <h3 className="text-2xl font-bold text-gray-800 dark:text-white">
                  5
                </h3>
              </div>
            </div>
            <div className="mt-4 grid grid-cols-1 gap-2 text-center text-xs">
              <div className="bg-gray-50 dark:bg-gray-700/30 p-2 rounded">
                <FaChalkboard className="mx-auto text-green-500 mb-1" />
                <p className="text-gray-500 dark:text-gray-400">Most Popular</p>
                <p className="font-semibold text-gray-800 dark:text-white">
                  Computer Science
                </p>
              </div>
            </div>
          </motion.div>
        </motion.div>

        {/* Recent Users Section */}
        <motion.div variants={itemVariants} className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-gray-800 dark:text-white flex items-center">
              <FaUsers className="mr-2 text-blue-500 dark:text-blue-400" />{" "}
              Recent Users
            </h2>
            <a
              href="/admin5839201/users"
              className="text-sm px-3 py-1 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded-full hover:bg-blue-100 dark:hover:bg-blue-900/40 transition-colors"
            >
              View All
            </a>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-gray-50 dark:bg-gray-700/30">
                    <th className="px-4 py-3 text-sm font-medium text-gray-500 dark:text-gray-400">
                      Name
                    </th>
                    <th className="px-4 py-3 text-sm font-medium text-gray-500 dark:text-gray-400">
                      Email
                    </th>
                    <th className="px-4 py-3 text-sm font-medium text-gray-500 dark:text-gray-400">
                      Status
                    </th>
                    <th className="px-4 py-3 text-sm font-medium text-gray-500 dark:text-gray-400">
                      Action
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                  {users.slice(0, 5).map((user) => (
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
                              className="w-8 h-8 rounded-full mr-3 object-cover"
                            />
                          ) : (
                            <div className="w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center mr-3">
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
                            <span className="px-2 py-1 text-xs rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300">
                              Reviewer
                            </span>
                          )}
                          {user.premium && (
                            <span className="px-2 py-1 text-xs rounded-full bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300">
                              Pro
                            </span>
                          )}
                          {user.blocked && (
                            <span className="px-2 py-1 text-xs rounded-full bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300">
                              Blocked
                            </span>
                          )}
                          {!user.creator && !user.premium && !user.blocked && (
                            <span className="px-2 py-1 text-xs rounded-full bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-300">
                              Standard
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <button
                          onClick={() => toggleCreator(user._id)}
                          className="px-2 py-1 text-xs rounded bg-blue-600 text-white hover:bg-blue-700 transition-colors"
                        >
                          {user.creator ? "Remove Reviewer" : "Make Reviewer"}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </motion.div>

        {/* Pending Approval Section */}
        <motion.div variants={itemVariants}>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-gray-800 dark:text-white flex items-center">
              <FaHourglass className="mr-2 text-orange-500" /> Pending Notes
            </h2>
            <a
              href="/admin5839201/posts"
              className="text-sm px-3 py-1 bg-yellow-50 dark:bg-yellow-900/20 text-yellow-600 dark:text-yellow-400 rounded-full hover:bg-yellow-100 dark:hover:bg-yellow-900/40 transition-colors"
            >
              View All
            </a>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-hidden">
            {posts.filter((post) => !post.approved).length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="bg-gray-50 dark:bg-gray-700/30">
                      <th className="px-4 py-3 text-sm font-medium text-gray-500 dark:text-gray-400">
                        Title
                      </th>
                      <th className="px-4 py-3 text-sm font-medium text-gray-500 dark:text-gray-400">
                        Author
                      </th>
                      <th className="px-4 py-3 text-sm font-medium text-gray-500 dark:text-gray-400">
                        Subject
                      </th>
                      <th className="px-4 py-3 text-sm font-medium text-gray-500 dark:text-gray-400">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                    {posts
                      .filter((post) => !post.approved)
                      .slice(0, 5)
                      .map((post) => (
                        <tr
                          key={post._id}
                          className="hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors"
                        >
                          <td className="px-4 py-3">
                            <div>
                              <h3 className="font-medium text-gray-800 dark:text-white">
                                {post.title}
                              </h3>
                              <p className="text-sm text-gray-500 dark:text-gray-400 truncate max-w-xs">
                                {post.description}
                              </p>
                            </div>
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex items-center">
                              {post.userId.profilePicture ? (
                                <img
                                  src={post.userId.profilePicture}
                                  alt={post.userId.name}
                                  className="w-6 h-6 rounded-full mr-2 object-cover"
                                />
                              ) : null}
                              <span className="text-gray-600 dark:text-gray-300">
                                {post.userId.name}
                              </span>
                            </div>
                          </td>
                          <td className="px-4 py-3 text-gray-600 dark:text-gray-300">
                            {post.subject || "Computer Science"}
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex space-x-2">
                              <button
                                onClick={() =>
                                  handlePostAction(post._id, "approve")
                                }
                                className="flex items-center px-2 py-1 text-xs rounded bg-green-600 text-white hover:bg-green-700 transition-colors"
                              >
                                <FaCheck className="mr-1" /> Approve
                              </button>
                              <button
                                onClick={() =>
                                  handlePostAction(post._id, "reject")
                                }
                                className="flex items-center px-2 py-1 text-xs rounded bg-red-600 text-white hover:bg-red-700 transition-colors"
                              >
                                <FaTimes className="mr-1" /> Reject
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="p-6 text-center">
                <FaCheckCircle className="mx-auto text-green-500 text-3xl mb-3" />
                <p className="text-gray-600 dark:text-gray-300">
                  No pending notes to approve!
                </p>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
