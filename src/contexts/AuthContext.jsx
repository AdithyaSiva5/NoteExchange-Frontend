"use client";

import React, { createContext, useState, useEffect, useContext } from "react";
import api, { loginRoute, profileRoute } from "../lib/api";
import Loading from "../components/Loading";
import { ColoredToast } from "../components/Toast";

const AuthContext = createContext(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within an AuthProvider");
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Check auth state on mount and handle redirect tokens
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const urlParams = new URLSearchParams(window.location.search);
        const tokenFromUrl = urlParams.get("token");
        const error = urlParams.get("error");
        if (error === "user_blocked") {
          ColoredToast(
            "Your account has been blocked. Contact support.",
            "error"
          );
        }
        const refreshTokenFromUrl = urlParams.get("refreshToken");

        if (tokenFromUrl) {
          localStorage.setItem("token", tokenFromUrl);
          if (refreshTokenFromUrl)
            localStorage.setItem("refreshToken", refreshTokenFromUrl);
          // Clear query string from URL and set title
          window.history.replaceState({}, "", "/"); // Use empty string for title arg, set path to "/"
          document.title = "AppName"; // Explicitly set title
        }

        await checkAuth();
      } catch (error) {
        console.error("Auth initialization error:");
      } finally {
        setLoading(false);
      }
    };

    initializeAuth();
  }, []);

  // Check authentication status
  const checkAuth = async () => {
    const token = localStorage.getItem("token");
    if (!token) return;

    try {
      api.defaults.headers.common["Authorization"] = token;
      const response = await api.get(profileRoute);
      const fetchedUser = response.data.user;
      if (
        fetchedUser.premium &&
        fetchedUser.premiumExpiresAt &&
        new Date() > new Date(fetchedUser.premiumExpiresAt)
      ) {
        fetchedUser.premium = false;
        fetchedUser.premiumExpiresAt = null;
      }
      // Store profile picture in localStorage when checking auth
      if (fetchedUser.profilePicture) {
        localStorage.setItem("profilePicture", fetchedUser.profilePicture);
      }
      setUser(fetchedUser);
    } catch (error) {
      if (error.response?.status === 401) {
        localStorage.removeItem("token");
        localStorage.removeItem("profilePicture");
        delete api.defaults.headers.common["Authorization"];
        setUser(null);
        ColoredToast("Session expired, please log in again", "error");
      }
    }
  };

  // Email/password login
  const login = async (credentials) => {
    setLoading(true);
    try {
      const response = await api.post(loginRoute, credentials);
      const { token, refreshToken, user } = response.data;

      localStorage.setItem("token", token);
      if (refreshToken) localStorage.setItem("refreshToken", refreshToken);
      // Store profile picture in localStorage for easy access
      if (user.profilePicture) {
        localStorage.setItem("profilePicture", user.profilePicture);
      }
      api.defaults.headers.common["Authorization"] = token;
      setUser(user);
      ColoredToast("Login successful!", "success");
      window.location.href = "/";
      return true;
    } catch (error) {
      const errorMsg = error.response?.data?.msg || "Login failed";
      ColoredToast(errorMsg, "error");
      throw new Error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  // Google login (redirect-based, updated to handle refresh token post-redirect)
  const loginWithGoogle = async () => {
    setLoading(true);
    try {
      window.location.href = `${process.env.NEXT_PUBLIC_API_URL}/api/user/auth/google`;
      // Note: Token handling happens in useEffect after redirect
    } catch (error) {
      ColoredToast("Google login initiation failed", "error");
    } finally {
      setLoading(false);
    }
  };

  // Logout
  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("refreshToken");
    localStorage.removeItem("profilePicture");
    delete api.defaults.headers.common["Authorization"];
    setUser(null);
    ColoredToast("Logged out successfully", "success");
    window.location.assign("/login");
  };

  // Token refresh
  const refreshToken = async () => {
    try {
      const storedRefreshToken = localStorage.getItem("refreshToken");
      if (!storedRefreshToken) throw new Error("No refresh token available");

      const response = await api.post("/api/user/refresh-token", {
        refreshToken: storedRefreshToken,
      });
      const { token } = response.data;
      localStorage.setItem("token", token);
      api.defaults.headers.common["Authorization"] = token;
      await checkAuth();
      ColoredToast("Session refreshed", "success");
    } catch (error) {
      console.error("Token refresh failed:");
      logout();
    }
  };

  if (loading) return <Loading />;

  return (
    <AuthContext.Provider
      value={{
        user,
        login,
        loginWithGoogle,
        logout,
        loading,
        setUser,
        refreshToken,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export default AuthProvider;
