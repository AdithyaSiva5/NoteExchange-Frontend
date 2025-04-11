"use client";

import { useState, useEffect, useRef } from "react";
import { useAuth } from "../contexts/AuthContext";
import api from "../lib/api";
import { ColoredToast } from "../components/Toast";
import Link from "next/link";
import { useCallback } from "react";
import debounce from "lodash/debounce";
import {
  FaGoogle,
  FaBook,
  FaAngleLeft,
  FaAngleRight,
  FaRegThumbsUp,
  FaThumbsUp,
  FaGraduationCap,
  FaArrowRight,
  FaChalkboardTeacher,
  FaDownload,
  FaUniversity,
} from "react-icons/fa";
import { motion, AnimatePresence } from "framer-motion";
import ProfileImage from "@/components/ProfileImage";

export default function Home() {
  const { user, loginWithGoogle } = useAuth();
  const [posts, setPosts] = useState([]);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
  });
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState("newest");
  const [activePostIndex, setActivePostIndex] = useState(0);
  const storyContainerRef = useRef(null);
  const [isLiking, setIsLiking] = useState(false);

  const fetchPosts = async (page = 1, sort = sortBy) => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      const response = await api.get(
        `/api/posts/public?page=${page}&limit=5&sortBy=${sort}`,
        {
          headers: token ? { Authorization: token } : {},
        }
      );
      setPosts(response.data.posts);
      setPagination({
        currentPage: response.data.pagination.currentPage,
        totalPages: response.data.pagination.totalPages,
      });
    } catch (error) {
      ColoredToast(
        error.response?.data?.msg || "Failed to load notes",
        "error"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const handleSort = (e) => {
      const newSort = e.detail;
      setSortBy(newSort);
      fetchPosts(1, newSort);
    };

    window.addEventListener("sortChange", handleSort);
    return () => window.removeEventListener("sortChange", handleSort);
  }, []);

  useEffect(() => {
    if (user) fetchPosts();
    else setLoading(false);
  }, [user]);

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= pagination.totalPages) fetchPosts(newPage);
  };

  const handleLike = useCallback(
    debounce(async (postId, hasLiked) => {
      if (!user || isLiking) return;
      setIsLiking(true);
      try {
        const token = localStorage.getItem("token");
        const response = await api.post(
          `/api/posts/${postId}/like`,
          {},
          {
            headers: { Authorization: token },
          }
        );
        setPosts(
          posts.map((post) =>
            post._id === postId
              ? {
                  ...post,
                  likeCount: response.data.likeCount,
                  hasLiked: response.data.hasLiked,
                }
              : post
          )
        );
      } catch (error) {
        ColoredToast(
          error.response?.data?.msg || "Failed to rate note",
          "error"
        );
      } finally {
        setIsLiking(false);
      }
    }, 300),
    [user, posts, isLiking]
  );

  const nextStory = () => {
    if (activePostIndex < posts.length - 1) {
      setActivePostIndex(activePostIndex + 1);
    } else if (pagination.currentPage < pagination.totalPages) {
      handlePageChange(pagination.currentPage + 1);
      setActivePostIndex(0);
    }
  };

  const prevStory = () => {
    if (activePostIndex > 0) {
      setActivePostIndex(activePostIndex - 1);
    } else if (pagination.currentPage > 1) {
      handlePageChange(pagination.currentPage - 1);
      setActivePostIndex(posts.length - 1);
    }
  };

  useEffect(() => {
    const handleSwipe = (e) => {
      if (e.target.closest(".note-card")) {
        const container = storyContainerRef.current;
        if (!container) return;

        if (e.deltaX > 50) prevStory();
        else if (e.deltaX < -50) nextStory();
      }
    };

    const container = storyContainerRef.current;
    if (container) {
      container.addEventListener("touchend", handleSwipe);
      return () => container.removeEventListener("touchend", handleSwipe);
    }
  }, [activePostIndex, posts]);

  // Pro Subscription Banner Component
  const ProBanner = () => (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="relative overflow-hidden rounded-xl bg-gradient-to-r from-yellow-500 to-amber-600 shadow-lg my-4"
    >
      {/* Decorative elements */}
      <div className="absolute -right-12 -top-12 h-40 w-40 rounded-full bg-white/10 blur-xl"></div>
      <div className="absolute left-10 -bottom-20 h-40 w-40 rounded-full bg-white/10 blur-xl"></div>

      <div className="relative p-5 flex items-center justify-between z-10">
        <div className="flex items-center">
          <FaGraduationCap className="text-white text-xl mr-3 animate-pulse" />
          <div>
            <h3 className="text-white font-bold text-base md:text-lg">
              Unlock Full Notes
            </h3>
            <p className="text-white/80 text-xs md:text-sm mt-1">
              Get unlimited access to all study materials
            </p>
          </div>
        </div>

        <Link href="/premium">
          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.98 }}
            className="bg-white text-amber-600 hover:text-yellow-600 px-4 py-2 rounded-lg font-medium flex items-center shadow-md transition-all duration-300 text-sm"
          >
            Go Pro <FaArrowRight className="ml-2" />
          </motion.div>
        </Link>
      </div>

      {/* Accent elements */}
      <div className="absolute top-3 left-3 w-1 h-1 bg-white rounded-full opacity-70"></div>
      <div className="absolute top-10 right-16 w-1.5 h-1.5 bg-white rounded-full opacity-80"></div>
      <div className="absolute bottom-4 left-32 w-1 h-1 bg-white rounded-full opacity-60"></div>
    </motion.div>
  );

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-yellow-50 to-amber-100 dark:from-gray-900 dark:to-amber-900">
        <div className="animate-pulse flex flex-col items-center">
          <div className="w-16 h-16 relative">
            <div className="absolute inset-0 rounded-full bg-yellow-400 opacity-75 animate-ping"></div>
            <FaBook className="relative text-5xl text-yellow-500" />
          </div>
          <p className="mt-4 text-lg text-yellow-800 dark:text-yellow-300 font-medium">
            Loading NotesExchange...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-50 to-amber-100 dark:from-gray-900 dark:to-amber-900 transition-all duration-300">
      {!user ? (
        <div className="flex flex-col items-center justify-center min-h-screen px-4">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.8 }}
            className="text-center max-w-md w-full"
          >
            <motion.div
              className="mx-auto mb-8 relative"
              animate={{ scale: [1, 1.1, 1] }}
              transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
            >
              <div className="w-40 h-40 mx-auto relative">
                <div className="absolute w-full h-full bg-gradient-to-br from-yellow-400 to-amber-500 dark:from-yellow-500 dark:to-amber-600 rounded-full blur-xl opacity-30"></div>
                <FaBook className="w-full h-full text-yellow-500 dark:text-yellow-400" />
              </div>
            </motion.div>

            <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-yellow-600 to-amber-600 dark:from-yellow-400 dark:to-amber-400">
              NotesExchange
            </h1>

            <p className="text-lg md:text-xl mb-8 text-gray-700 dark:text-gray-200">
              Share, access, and excel with student-created study materials
            </p>

            <button
              onClick={loginWithGoogle}
              className="group relative flex items-center justify-center w-full py-3 px-6 text-white font-medium rounded-full overflow-hidden bg-gradient-to-r from-yellow-500 to-amber-600 hover:from-yellow-600 hover:to-amber-700 transition-all duration-300 shadow-lg"
            >
              <span className="absolute right-full w-12 h-12 rounded-full bg-white opacity-10 transform translate-x-2.5 transition-transform duration-500 ease-out group-hover:translate-x-40"></span>
              <FaGoogle className="mr-2" /> Sign in with Google
            </button>
          </motion.div>
        </div>
      ) : (
        <div className="container mx-auto px-4 py-6 md:py-10 pt-20 md:pt-24">
          {posts.length > 0 ? (
            <div className="relative" ref={storyContainerRef}>
              <div className="note-container relative max-w-3xl mx-auto overflow-hidden">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={posts[activePostIndex]?._id || "empty"}
                    initial={{ opacity: 0, x: 50 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -50 }}
                    transition={{ duration: 0.3 }}
                    className="note-card bg-white dark:bg-gray-800 rounded-xl shadow-xl p-6 md:p-8"
                  >
                    {posts[activePostIndex] && (
                      <div className="flex flex-col h-full">
                        <div className="flex items-center mb-4">
                          <span className="px-2 py-1 text-xs rounded-full bg-yellow-100 dark:bg-yellow-900/40 text-yellow-800 dark:text-yellow-200 mr-2">
                            Course Notes
                          </span>
                          {posts[activePostIndex].premium && (
                            <span className="px-2 py-1 text-xs rounded-full bg-amber-100 dark:bg-amber-900/40 text-amber-800 dark:text-amber-200 flex items-center">
                              <FaGraduationCap className="mr-1" /> Pro Content
                            </span>
                          )}
                        </div>

                        <h2 className="text-2xl md:text-3xl font-bold text-gray-800 dark:text-white mb-4 break-words">
                          {posts[activePostIndex].title}
                        </h2>

                        <div className="text-gray-600 dark:text-gray-300 text-lg leading-relaxed break-words whitespace-pre-wrap mb-4">
                          {posts[activePostIndex].description}
                          {!user.premium &&
                            posts[activePostIndex].isTruncated && (
                              <>
                                <div className="blur-sm opacity-60 my-3 text-gray-600 dark:text-gray-400 text-lg">
                                  This section contains additional material
                                  including key formulas, diagrams, and detailed
                                  explanations...
                                </div>
                                <ProBanner />
                              </>
                            )}
                        </div>

                        <div className="rounded-lg bg-yellow-50 dark:bg-yellow-900/10 p-3 mb-4 border border-yellow-100 dark:border-yellow-900/30">
                          <h3 className="font-medium text-amber-800 dark:text-amber-300 mb-2 flex items-center">
                            <FaChalkboardTeacher className="mr-2" /> Note
                            Details
                          </h3>
                          <ul className="text-sm text-gray-600 dark:text-gray-300 space-y-1">
                            <li className="flex items-center">
                              <span className="w-24 text-gray-500 dark:text-gray-400">
                                Subject:
                              </span>
                              <span className="font-medium">
                                Computer Science
                              </span>
                            </li>
                            <li className="flex items-center">
                              <span className="w-24 text-gray-500 dark:text-gray-400">
                                Pages:
                              </span>
                              <span className="font-medium">12</span>
                            </li>
                            <li className="flex items-center">
                              <span className="w-24 text-gray-500 dark:text-gray-400">
                                Format:
                              </span>
                              <span className="font-medium">PDF</span>
                            </li>
                          </ul>
                        </div>

                        <div className="border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/80 px-6 py-4 flex items-center justify-between mt-auto">
                          <motion.button
                            onClick={() =>
                              handleLike(
                                posts[activePostIndex]._id,
                                posts[activePostIndex].hasLiked
                              )
                            }
                            whileTap={{ scale: 0.9 }}
                            className={`flex items-center space-x-2 py-1.5 px-3 rounded-full transition-all duration-300 ${
                              posts[activePostIndex].hasLiked
                                ? "bg-yellow-100 dark:bg-yellow-900/30"
                                : "hover:bg-gray-100 dark:hover:bg-gray-700/50"
                            }`}
                          >
                            {posts[activePostIndex].hasLiked ? (
                              <motion.div
                                initial={{ scale: 1 }}
                                animate={{ scale: [1, 1.2, 1] }}
                                transition={{ duration: 0.3 }}
                              >
                                <FaThumbsUp className="text-yellow-500 dark:text-yellow-400" />
                              </motion.div>
                            ) : (
                              <FaRegThumbsUp className="text-gray-500 dark:text-gray-400 group-hover:text-yellow-500 dark:group-hover:text-yellow-400" />
                            )}
                            <span
                              className={`font-medium ${
                                posts[activePostIndex].hasLiked
                                  ? "text-yellow-500 dark:text-yellow-400"
                                  : "text-gray-500 dark:text-gray-400"
                              }`}
                            >
                              {posts[activePostIndex].likeCount}
                            </span>
                          </motion.button>

                          <div className="flex items-center gap-4">
                            <button className="flex items-center text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/20 rounded-full px-3 py-1 text-sm hover:bg-amber-100 dark:hover:bg-amber-900/30 transition-colors">
                              <FaDownload className="mr-1" /> Download
                            </button>

                            <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                              {posts[activePostIndex].userId.profilePicture && (
                                <ProfileImage
                                  src={
                                    posts[activePostIndex].userId.profilePicture
                                  }
                                  alt={`${posts[activePostIndex].userId.name}'s profile`}
                                  size={32}
                                  className="mr-2 border-2 border-yellow-200 dark:border-yellow-800"
                                />
                              )}
                              <span className="truncate max-w-[150px]">
                                By: {posts[activePostIndex].userId.name}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </motion.div>
                </AnimatePresence>

                <div className="mt-6 mb-10 flex justify-between items-center">
                  <motion.button
                    onClick={prevStory}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    disabled={
                      activePostIndex === 0 && pagination.currentPage === 1
                    }
                    className="flex items-center space-x-1 bg-white/90 dark:bg-gray-800/90 py-2 px-4 rounded-full shadow-md disabled:opacity-50 hover:bg-white dark:hover:bg-gray-700 transition-all duration-200"
                  >
                    <FaAngleLeft className="text-yellow-600 dark:text-yellow-400" />
                    <span className="text-gray-700 dark:text-gray-300">
                      Previous
                    </span>
                  </motion.button>

                  <div className="text-center text-sm text-gray-600 dark:text-gray-400">
                    {activePostIndex + 1} of {posts.length}
                    {pagination.totalPages > 1 && (
                      <span>
                        {" "}
                        (Page {pagination.currentPage} of{" "}
                        {pagination.totalPages})
                      </span>
                    )}
                  </div>

                  <motion.button
                    onClick={nextStory}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    disabled={
                      activePostIndex === posts.length - 1 &&
                      pagination.currentPage === pagination.totalPages
                    }
                    className="flex items-center space-x-1 bg-white/90 dark:bg-gray-800/90 py-2 px-4 rounded-full shadow-md disabled:opacity-50 hover:bg-white dark:hover:bg-gray-700 transition-all duration-200"
                  >
                    <span className="text-gray-700 dark:text-gray-300">
                      Next
                    </span>
                    <FaAngleRight className="text-yellow-600 dark:text-yellow-400" />
                  </motion.button>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-20 bg-white/80 dark:bg-gray-800/80 rounded-xl shadow-md">
              <div className="mx-auto w-20 h-20 text-yellow-300 dark:text-yellow-700 opacity-50 mb-4">
                <FaBook className="w-full h-full" />
              </div>
              <p className="text-xl text-gray-600 dark:text-gray-300">
                No notes found
              </p>
              <p className="text-gray-500 dark:text-gray-400 mt-2">
                Be the first to share your class notes
              </p>
              <Link
                href="/submit-post"
                className="mt-6 inline-block bg-gradient-to-r from-yellow-500 to-amber-600 hover:from-yellow-600 hover:to-amber-700 text-white font-medium py-2 px-6 rounded-full shadow-md transition-all duration-300"
              >
                Upload Notes
              </Link>
            </div>
          )}

          {posts.length > 0 && (
            <div className="max-w-3xl mx-auto mt-8 bg-white/90 dark:bg-gray-800/90 rounded-xl p-6 shadow-lg">
              <div className="flex items-center mb-4">
                <FaUniversity className="text-yellow-500 dark:text-yellow-400 text-xl mr-3" />
                <h2 className="text-xl font-bold text-gray-800 dark:text-white">
                  Browse by Subject
                </h2>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {[
                  "Computer Science",
                  "Mathematics",
                  "Physics",
                  "Chemistry",
                  "Biology",
                  "Engineering",
                ].map((subject) => (
                  <button
                    key={subject}
                    className="py-2 px-3 rounded-lg bg-yellow-50 dark:bg-yellow-900/20 text-yellow-800 dark:text-yellow-200 hover:bg-yellow-100 dark:hover:bg-yellow-900/30 transition-colors text-sm font-medium"
                  >
                    {subject}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
