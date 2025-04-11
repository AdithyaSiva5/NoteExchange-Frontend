"use client";

import Link from "next/link";
import { useAuth } from "../contexts/AuthContext";
import {
  FaBook,
  FaSignOutAlt,
  FaSun,
  FaMoon,
  FaPen,
  FaUser,
  FaGraduationCap,
  FaCheck,
  FaSortAmountDown,
  FaFilter,
  FaLightbulb,
} from "react-icons/fa";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import ProfileImage from "./ProfileImage";

export default function Navbar({ toggleTheme, theme }) {
  const { user, logout } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [sortBy, setSortBy] = useState("newest"); // Add sort state to Navbar

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const closeMenu = () => setIsMenuOpen(false);

  // Handle sort change and dispatch event
  const handleSortChange = (e) => {
    const newSort = e.target.value;
    setSortBy(newSort);
    if (typeof window !== "undefined") {
      window.dispatchEvent(new CustomEvent("sortChange", { detail: newSort }));
    }
  };

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? "py-2 bg-white/90 dark:bg-gray-900/90 backdrop-blur-md shadow-md"
          : "py-4 bg-transparent"
      }`}
    >
      <div className="container mx-auto px-4 flex justify-between items-center">
        <Link href="/" className="flex items-center space-x-2">
          <span className="text-yellow-500 dark:text-yellow-400">
            <FaBook className="w-6 h-6" />
          </span>
          <span className="text-xl font-bold text-gray-800 dark:text-white">
            NotesExchange
          </span>
        </Link>

        {/* Desktop Menu */}
        <div className="hidden md:flex items-center space-x-1">
          <Link
            href="/"
            className="px-3 py-2 rounded-md text-gray-700 dark:text-gray-200 hover:text-yellow-600 dark:hover:text-yellow-400 transition-colors"
          >
            Home
          </Link>

          {user ? (
            <>
              <Link
                href="/submit-post"
                className="px-3 py-2 rounded-md text-gray-700 dark:text-gray-200 hover:text-yellow-600 dark:hover:text-yellow-400 transition-colors flex items-center"
              >
                <FaPen className="mr-1 text-xs" /> Upload
              </Link>

              {user.creator && (
                <Link
                  href="/creator-posts"
                  className="px-3 py-2 rounded-md text-gray-700 dark:text-gray-200 hover:text-yellow-600 dark:hover:text-yellow-400 transition-colors flex items-center"
                >
                  <FaCheck className="mr-1 text-xs" /> Review
                </Link>
              )}

              {!user.premium && (
                <Link
                  href="/premium"
                  className="px-3 py-2 rounded-md text-yellow-600 dark:text-yellow-400 hover:text-yellow-700 dark:hover:text-yellow-300 transition-colors flex items-center"
                >
                  <FaGraduationCap className="mr-1 text-xs" /> Go Pro
                </Link>
              )}

              {/* Premium Until Label */}
              {user.premium && user.premiumExpiresAt && (
                <span className="px-3 py-1 bg-yellow-100 dark:bg-yellow-900/40 text-yellow-800 dark:text-yellow-200 rounded-full text-sm">
                  Pro until:{" "}
                  {new Date(user.premiumExpiresAt).toLocaleDateString()}
                </span>
              )}

              {/* Sorting Dropdown */}
              <div className="relative">
                <select
                  id="sort"
                  value={sortBy}
                  onChange={handleSortChange}
                  className="pl-3 pr-8 py-2 rounded-full bg-white/80 dark:bg-gray-800/80 border border-yellow-200 dark:border-yellow-800 text-gray-800 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-yellow-400 appearance-none"
                >
                  <option value="newest">Newest</option>
                  <option value="oldest">Oldest</option>
                  <option value="mostLiked">Most Popular</option>
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700 dark:text-gray-300">
                  <FaSortAmountDown className="h-4 w-4" />
                </div>
              </div>

              <Link href="/profile" className="relative group">
                <div className="p-2 rounded-full overflow-hidden border-2 border-transparent group-hover:border-yellow-300 dark:group-hover:border-yellow-800 transition-all">
                  {user.profilePicture ? (
                    <ProfileImage
                      src={user.profilePicture}
                      alt={user.name}
                      size={32}
                    />
                  ) : (
                    <FaUser className="w-5 h-5 text-gray-700 dark:text-gray-300" />
                  )}
                </div>
                {user.premium && (
                  <div className="absolute -top-1 -right-1 bg-yellow-600 text-white rounded-full p-1">
                    <FaGraduationCap className="w-3 h-3" />
                  </div>
                )}
              </Link>

              <button
                onClick={logout}
                className="p-2 rounded-full text-gray-600 dark:text-gray-400 hover:bg-yellow-100 dark:hover:bg-yellow-900/30 hover:text-yellow-600 dark:hover:text-yellow-400 transition-colors"
                aria-label="Logout"
              >
                <FaSignOutAlt className="w-5 h-5" />
              </button>
            </>
          ) : (
            <>
              <Link
                href="/login"
                className="px-4 py-2 rounded-md text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              >
                Login
              </Link>
            </>
          )}

          <button
            onClick={toggleTheme}
            className="p-2 rounded-full text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            aria-label={
              theme === "light" ? "Switch to dark mode" : "Switch to light mode"
            }
          >
            {theme === "light" ? (
              <FaMoon className="w-5 h-5" />
            ) : (
              <FaSun className="w-5 h-5" />
            )}
          </button>
        </div>

        {/* Mobile menu button */}
        <div className="flex items-center space-x-3 md:hidden">
          <button
            onClick={toggleTheme}
            className="p-2 rounded-full text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            aria-label={
              theme === "light" ? "Switch to dark mode" : "Switch to light mode"
            }
          >
            {theme === "light" ? (
              <FaMoon className="w-5 h-5" />
            ) : (
              <FaSun className="w-5 h-5" />
            )}
          </button>

          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="p-2 rounded-md text-gray-600 dark:text-gray-400 hover:text-yellow-600 dark:hover:text-yellow-400"
            aria-label="Toggle mobile menu"
          >
            <div className="w-6 flex flex-col items-end justify-center space-y-1.5">
              <span
                className={`block h-0.5 rounded-full bg-current transition-all ${
                  isMenuOpen ? "w-6 -rotate-45 translate-y-2" : "w-6"
                }`}
              ></span>
              <span
                className={`block h-0.5 rounded-full bg-current transition-all ${
                  isMenuOpen ? "opacity-0" : "w-4"
                }`}
              ></span>
              <span
                className={`block h-0.5 rounded-full bg-current transition-all ${
                  isMenuOpen ? "w-6 rotate-45 -translate-y-2" : "w-5"
                }`}
              ></span>
            </div>
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden overflow-hidden bg-white/95 dark:bg-gray-900/95 backdrop-blur-sm shadow-lg"
          >
            <div className="container mx-auto px-4 py-3 flex flex-col space-y-2">
              <Link
                href="/"
                onClick={closeMenu}
                className="px-4 py-3 rounded-md hover:bg-yellow-50 dark:hover:bg-yellow-900/20 text-gray-800 dark:text-gray-200"
              >
                Home
              </Link>

              {user ? (
                <>
                  <Link
                    href="/profile"
                    onClick={closeMenu}
                    className="px-4 py-3 rounded-md hover:bg-yellow-50 dark:hover:bg-yellow-900/20 text-gray-800 dark:text-gray-200 flex items-center"
                  >
                    {user.profilePicture ? (
                      <img
                        src={user.profilePicture}
                        alt={user.name}
                        className="w-6 h-6 rounded-full mr-3"
                      />
                    ) : (
                      <FaUser className="w-5 h-5 mr-3 text-gray-700 dark:text-gray-300" />
                    )}
                    Profile{" "}
                    {user.premium && (
                      <FaGraduationCap className="ml-2 text-xs text-yellow-500" />
                    )}
                  </Link>

                  <Link
                    href="/submit-post"
                    onClick={closeMenu}
                    className="px-4 py-3 rounded-md hover:bg-yellow-50 dark:hover:bg-yellow-900/20 text-gray-800 dark:text-gray-200 flex items-center"
                  >
                    <FaPen className="mr-3 text-gray-700 dark:text-gray-300" />{" "}
                    Upload Notes
                  </Link>

                  {user.creator && (
                    <Link
                      href="/creator-posts"
                      onClick={closeMenu}
                      className="px-4 py-3 rounded-md hover:bg-yellow-50 dark:hover:bg-yellow-900/20 text-gray-800 dark:text-gray-200 flex items-center"
                    >
                      <FaCheck className="mr-3 text-gray-700 dark:text-gray-300" />{" "}
                      Review Notes
                    </Link>
                  )}

                  {!user.premium && (
                    <Link
                      href="/premium"
                      onClick={closeMenu}
                      className="px-4 py-3 rounded-md bg-gradient-to-r from-yellow-500/10 to-amber-500/10 text-yellow-700 dark:text-yellow-300 flex items-center"
                    >
                      <FaGraduationCap className="mr-3" /> Upgrade to Pro
                    </Link>
                  )}

                  {/* Add Sorting to Mobile Menu */}
                  <div className="relative px-4 py-3">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Sort Notes By
                    </label>
                    <select
                      id="sort-mobile"
                      value={sortBy}
                      onChange={handleSortChange}
                      className="w-full pl-3 pr-8 py-2 rounded-md bg-white/80 dark:bg-gray-800/80 border border-yellow-200 dark:border-yellow-800 text-gray-800 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-yellow-400 appearance-none"
                    >
                      <option value="newest">Newest</option>
                      <option value="oldest">Oldest</option>
                      <option value="mostLiked">Most Popular</option>
                    </select>
                    <div className="pointer-events-none absolute inset-y-0 right-6 flex items-center px-2 text-gray-700 dark:text-gray-300">
                      <FaSortAmountDown className="h-4 w-4" />
                    </div>
                  </div>

                  <button
                    onClick={() => {
                      logout();
                      closeMenu();
                    }}
                    className="px-4 py-3 rounded-md hover:bg-yellow-50 dark:hover:bg-yellow-900/20 text-gray-800 dark:text-gray-200 flex items-center text-left w-full"
                  >
                    <FaSignOutAlt className="mr-3 text-gray-700 dark:text-gray-300" />{" "}
                    Sign Out
                  </button>
                </>
              ) : (
                <>
                  <Link
                    href="/login"
                    onClick={closeMenu}
                    className="px-4 py-3 rounded-md hover:bg-yellow-50 dark:hover:bg-yellow-900/20 text-gray-800 dark:text-gray-200"
                  >
                    Login
                  </Link>
                </>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
