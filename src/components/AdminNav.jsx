"use client";

import Link from "next/link";
import {
  FaUsers,
  FaBook,
  FaLock,
  FaShieldAlt,
  FaTachometerAlt,
  FaBars,
  FaTimes,
} from "react-icons/fa";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

export default function AdminNav() {
  const [isOpen, setIsOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  // Check if we're on mobile view
  useEffect(() => {
    const checkIfMobile = () => {
      setIsMobile(window.innerWidth < 768); // md breakpoint in tailwind
    };

    // Initial check
    checkIfMobile();

    // Listen for resize events
    window.addEventListener("resize", checkIfMobile);

    // Cleanup
    return () => window.removeEventListener("resize", checkIfMobile);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("adminToken");
    localStorage.removeItem("token");
    window.location.assign("/admin5839201");
  };

  return (
    <>
      {/* Fixed Admin Toggle Button (Mobile) */}
      {isMobile && (
        <button
          className="fixed top-20 right-4 z-50 bg-yellow-700 dark:bg-yellow-800 text-white p-3 rounded-full shadow-lg"
          onClick={() => setIsOpen(!isOpen)}
        >
          {isOpen ? <FaTimes /> : <FaShieldAlt />}
        </button>
      )}

      {/* Admin Navigation */}
      <AnimatePresence>
        {(!isMobile || isOpen) && (
          <motion.nav
            initial={isMobile ? { opacity: 0, x: 300 } : { opacity: 1 }}
            animate={isMobile ? { opacity: 1, x: 0 } : { opacity: 1 }}
            exit={isMobile ? { opacity: 0, x: 300 } : { opacity: 1 }}
            transition={{ duration: 0.3 }}
            className={`bg-gradient-to-r from-yellow-700 to-amber-800 text-white shadow-lg z-40 ${
              isMobile
                ? "fixed top-0 right-0 h-full w-64 pt-20"
                : "fixed top-16 w-full"
            }`}
          >
            <div className="container mx-auto px-4">
              {/* Logo and Nav Items - Only show logo on desktop or at top of mobile menu */}
              <div
                className={`flex ${
                  isMobile
                    ? "pt-4 flex-col"
                    : "justify-between items-center h-16"
                }`}
              >
                {/* Logo */}
                <Link
                  href="/admin5839201/dashboard"
                  className={`flex items-center text-xl font-bold ${
                    isMobile ? "mb-6" : ""
                  }`}
                  onClick={() => isMobile && setIsOpen(false)}
                >
                  <FaShieldAlt className="mr-2" />
                  {/* <span>NotesExchange Admin</span> */}
                </Link>

                {/* Desktop Navigation */}
                {!isMobile && (
                  <div className="flex space-x-1">
                    <NavLink
                      href="/admin5839201/dashboard"
                      icon={<FaTachometerAlt className="mr-2" />}
                      text="Dashboard"
                    />
                    <NavLink
                      href="/admin5839201/users"
                      icon={<FaUsers className="mr-2" />}
                      text="Users"
                    />
                    <NavLink
                      href="/admin5839201/posts"
                      icon={<FaBook className="mr-2" />}
                      text="Notes"
                    />
                    <button
                      onClick={handleLogout}
                      className="px-4 py-2 rounded-md hover:bg-white/10 transition-colors flex items-center"
                    >
                      <FaLock className="mr-2" /> Logout
                    </button>
                  </div>
                )}

                {/* Mobile Navigation Links */}
                {isMobile && (
                  <div className="flex flex-col space-y-2 w-full">
                    <MobileNavLink
                      href="/admin5839201/dashboard"
                      icon={<FaTachometerAlt className="mr-3" />}
                      text="Dashboard"
                      onClick={() => setIsOpen(false)}
                    />
                    <MobileNavLink
                      href="/admin5839201/users"
                      icon={<FaUsers className="mr-3" />}
                      text="Users"
                      onClick={() => setIsOpen(false)}
                    />
                    <MobileNavLink
                      href="/admin5839201/posts"
                      icon={<FaBook className="mr-3" />}
                      text="Notes"
                      onClick={() => setIsOpen(false)}
                    />
                    <button
                      onClick={() => {
                        handleLogout();
                        setIsOpen(false);
                      }}
                      className="px-4 py-3 rounded-md hover:bg-white/10 transition-colors text-left flex items-center"
                    >
                      <FaLock className="mr-3" /> Logout
                    </button>
                  </div>
                )}
              </div>
            </div>
          </motion.nav>
        )}
      </AnimatePresence>

      {/* Overlay for mobile menu */}
      {isMobile && isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-30"
          onClick={() => setIsOpen(false)}
        />
      )}
    </>
  );
}

// Desktop navigation link component
function NavLink({ href, icon, text }) {
  return (
    <Link
      href={href}
      className="px-4 py-2 rounded-md hover:bg-white/10 transition-colors flex items-center"
    >
      {icon} {text}
    </Link>
  );
}

// Mobile navigation link component
function MobileNavLink({ href, icon, text, onClick }) {
  return (
    <Link
      href={href}
      className="px-4 py-3 rounded-md hover:bg-white/10 transition-colors flex items-center w-full"
      onClick={onClick}
    >
      {icon} {text}
    </Link>
  );
}
