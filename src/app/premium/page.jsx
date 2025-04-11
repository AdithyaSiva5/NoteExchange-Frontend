"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../../contexts/AuthContext";
import api from "../../lib/api";
import { ColoredToast } from "../../components/Toast";
import {
  FaGraduationCap,
  FaLock,
  FaBook,
  FaCheckCircle,
  FaArrowRight,
  FaSpinner,
  FaCheck,
  FaInfoCircle,
  FaShieldAlt,
  FaDownload,
  FaSearch,
  FaUniversity,
} from "react-icons/fa";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";

export default function Premium() {
  const { user, setUser } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [scriptLoaded, setScriptLoaded] = useState(false);
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [showTermsModal, setShowTermsModal] = useState(false);
  const [modalContent, setModalContent] = useState("terms"); // "terms" or "privacy"

  useEffect(() => {
    if (!window.Razorpay && !user?.premium) {
      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.async = true;
      script.onload = () => setScriptLoaded(true);
      script.onerror = () =>
        ColoredToast("Failed to load payment service", "error");
      document.body.appendChild(script);
      return () => document.body.removeChild(script);
    } else if (window.Razorpay) {
      setScriptLoaded(true);
    }
  }, [user]);

  useEffect(() => {
    if (user?.premium && user.premiumExpiresAt) {
      const expiresAt = new Date(user.premiumExpiresAt);
      const now = new Date();
      const daysLeft = Math.ceil((expiresAt - now) / (1000 * 60 * 60 * 24));
      if (daysLeft <= 3) {
        ColoredToast(
          `Your Pro subscription expires in ${daysLeft} day${
            daysLeft === 1 ? "" : "s"
          }`,
          "warning"
        );
      }
    }
  }, [user]);

  const handlePayment = async () => {
    if (!scriptLoaded) {
      ColoredToast("Payment service is still loading, please wait", "warning");
      return;
    }

    if (!termsAccepted) {
      ColoredToast(
        "Please accept the Terms & Conditions to continue",
        "warning"
      );
      return;
    }

    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const response = await api.post(
        "/api/payment/create-order",
        {},
        { headers: { Authorization: token } }
      );
      const { orderId, amount, currency } = response.data;

      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
        amount,
        currency,
        order_id: orderId,
        name: "NotesExchange Pro",
        description: "Unlock complete notes for 1 month",
        handler: async (response) => {
          try {
            const updateResponse = await api.post("/api/user/premium");
            setUser(updateResponse.data.user);
            ColoredToast(
              "Pro activated! Expires on " +
                new Date(
                  updateResponse.data.user.premiumExpiresAt
                ).toLocaleDateString(),
              "success"
            );
            router.push("/");
          } catch (error) {
            ColoredToast("Failed to activate Pro subscription", "error");
          }
        },
        prefill: { name: user.name, email: user.email },
        theme: { color: "#EAB308" },
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (error) {
      ColoredToast("Failed to initiate payment", "error");
    } finally {
      setLoading(false);
    }
  };

  const openTermsModal = (content) => {
    setModalContent(content);
    setShowTermsModal(true);
    // Prevent background scrolling when modal is open
    document.body.style.overflow = "hidden";
  };

  const closeTermsModal = () => {
    setShowTermsModal(false);
    // Re-enable scrolling
    document.body.style.overflow = "auto";
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-yellow-50 to-amber-100 dark:from-gray-900 dark:to-amber-900">
        <div className="text-center bg-white/80 dark:bg-gray-800/80 p-8 rounded-xl shadow-lg">
          <FaLock className="mx-auto text-4xl text-yellow-500 dark:text-yellow-400 mb-4 opacity-70" />
          <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-2">
            Please Log In
          </h2>
          <p className="text-gray-600 dark:text-gray-300 mb-6">
            You need to log in to access Pro features.
          </p>
          <button
            onClick={() => router.push("/login")}
            className="px-6 py-2 bg-gradient-to-r from-yellow-500 to-amber-600 text-white rounded-full hover:from-yellow-600 hover:to-amber-700 transition-all shadow-md"
          >
            Log In <FaArrowRight className="inline ml-1" />
          </button>
        </div>
      </div>
    );
  }

  const features = [
    {
      icon: <FaBook />,
      title: "Complete Notes",
      description:
        "Access every note from start to finish without any limitations",
    },
    {
      icon: <FaDownload />,
      title: "Unlimited Downloads",
      description: "Download as many study materials as you need",
    },
    {
      icon: <FaSearch />,
      title: "Advanced Search",
      description: "Find exactly what you need with powerful search filters",
    },
  ];

  // Modal component for Terms and Privacy Policy
  const TermsModal = () => {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div
          className="absolute inset-0 bg-black/60"
          onClick={closeTermsModal}
        ></div>
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl w-full max-w-lg max-h-[100vh] overflow-hidden relative z-10"
        >
          <div className="p-5 bg-gradient-to-r from-yellow-500 to-amber-600 text-white">
            <h3 className="text-xl font-bold">
              {modalContent === "terms"
                ? "Terms & Conditions"
                : "Privacy Policy"}
            </h3>
            <p className="text-sm text-white/80">
              Last updated on Mar 17th, 2025
            </p>
          </div>

          <div className="p-6 pb-12 overflow-y-auto max-h-[calc(85vh-140px)]">
            {modalContent === "terms" ? (
              <div className="text-gray-700 dark:text-gray-300 text-sm space-y-4">
                <p>
                  For the purpose of these Terms and Conditions, The term "we",
                  "us", "our" used anywhere on this page shall mean
                  NotesExchange. "you", "your", "user", "visitor" shall mean any
                  natural or legal person who is visiting our website and/or
                  agreed to purchase from us.
                </p>

                <p className="font-medium">
                  Your use of the website and/or purchase from us are governed
                  by following Terms and Conditions:
                </p>

                <ul className="list-disc pl-5 space-y-2">
                  <li>
                    The content of the pages of this website is subject to
                    change without notice.
                  </li>
                  <li>
                    Neither we nor any third parties provide any warranty or
                    guarantee as to the accuracy, timeliness, performance,
                    completeness or suitability of the information and materials
                    found or offered on this website for any particular purpose.
                  </li>
                  <li>
                    Your use of any information or materials on our website
                    and/or product pages is entirely at your own risk, for which
                    we shall not be liable.
                  </li>
                  <li>
                    Our website contains material which is owned by or licensed
                    to us. This material includes, but is not limited to, the
                    design, layout, look, appearance and graphics.
                  </li>
                  <li>
                    All trademarks reproduced in our website which are not the
                    property of, or licensed to, the operator are acknowledged
                    on the website.
                  </li>
                  <li>
                    Unauthorized use of information provided by us shall give
                    rise to a claim for damages and/or be a criminal offense.
                  </li>
                  <li>
                    From time to time our website may also include links to
                    other websites. These links are provided for your
                    convenience to provide further information.
                  </li>
                  <li>
                    You may not create a link to our website from another
                    website or document without prior written consent.
                  </li>
                  <li>
                    Any dispute arising out of use of our website and/or
                    purchase with us and/or any engagement with us is subject to
                    the laws of India.
                  </li>
                  <li>
                    We shall be under no liability whatsoever in respect of any
                    loss or damage arising directly or indirectly out of the
                    decline of authorization for any Transaction.
                  </li>
                </ul>

                <p className="font-medium mt-4">Contact Information</p>
                <p>Email: support@notesexchange.com</p>
              </div>
            ) : (
              <div className="text-gray-700 dark:text-gray-300 text-sm space-y-4">
                <p>
                  This privacy policy sets out how NotesExchange uses and
                  protects any information that you provide when you use this
                  website.
                </p>

                <p>We may collect the following information:</p>
                <ul className="list-disc pl-5 space-y-1">
                  <li>Name</li>
                  <li>Contact information including email address</li>
                  <li>
                    Demographic information such as preferences and interests
                  </li>
                  <li>
                    Other information relevant to customer surveys and/or offers
                  </li>
                </ul>

                <p className="font-medium mt-2">
                  What we do with the information we gather:
                </p>
                <ul className="list-disc pl-5 space-y-1">
                  <li>Internal record keeping</li>
                  <li>Improving our products and services</li>
                  <li>
                    Sending promotional emails about new features or other
                    information which we think you may find interesting
                  </li>
                  <li>Contacting you for market research purposes</li>
                </ul>

                <p>
                  We are committed to ensuring that your information is secure
                  and have put in suitable measures to prevent unauthorized
                  access or disclosure.
                </p>

                <p className="font-medium mt-2">Cookies</p>
                <p>
                  A cookie is a small file which asks permission to be placed on
                  your computer's hard drive. We use traffic log cookies to
                  identify which pages are being used. This helps us analyze
                  data about webpage traffic and improve our website in order to
                  tailor it to customer needs.
                </p>

                <p className="font-medium mt-2">Cancellation & Refund Policy</p>
                <p>
                  Cancellations will be considered only if the request is made
                  within 1-2 days of placing the order. In case of any Refunds
                  approved, it'll take 1-2 days for the refund to be processed
                  to the end customer.
                </p>
              </div>
            )}
          </div>

          <div className="p-6 border-t border-gray-200 dark:border-gray-700 flex justify-end min-h-[60px]">
            <button
              onClick={closeTermsModal}
              className="px-5 py-2 bg-gradient-to-r from-yellow-500 to-amber-600 text-white font-medium rounded-lg hover:from-yellow-600 hover:to-amber-700 transition-all shadow-md"
            >
              Close
            </button>
          </div>
        </motion.div>
      </div>
    );
  };

  return (
    <div className="min-h-screen pt-20 bg-gradient-to-br from-yellow-50 to-amber-100 dark:from-gray-900 dark:to-amber-900">
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto">
          {user.premium ? (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
              className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl overflow-hidden"
            >
              <div className="bg-gradient-to-r from-yellow-500 to-amber-600 py-6 px-8 text-white">
                <FaGraduationCap className="text-3xl mb-3 text-white" />
                <h1 className="text-2xl md:text-3xl font-bold">
                  Pro Membership Active
                </h1>
              </div>

              <div className="p-8 text-center">
                <div className="mb-6 inline-block px-4 py-2 rounded-full bg-yellow-100 dark:bg-yellow-900/40 text-yellow-800 dark:text-yellow-200">
                  <span className="font-medium">Expires on: </span>
                  <span className="font-bold">
                    {new Date(user.premiumExpiresAt).toLocaleDateString()}
                  </span>
                </div>

                <p className="text-gray-600 dark:text-gray-300 mb-8 max-w-md mx-auto">
                  Thank you for supporting our student community! You now have
                  access to all Pro features.
                </p>

                <div className="grid md:grid-cols-3 gap-6 mb-8 max-w-2xl mx-auto">
                  {features.map((feature, index) => (
                    <div
                      key={index}
                      className="p-5 bg-gray-50 dark:bg-gray-800/50 rounded-xl"
                    >
                      <div className="text-yellow-500 dark:text-yellow-400 text-xl mb-3">
                        {feature.icon}
                      </div>
                      <h3 className="font-semibold text-gray-800 dark:text-white mb-1">
                        {feature.title}
                      </h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {feature.description}
                      </p>
                    </div>
                  ))}
                </div>

                <button
                  onClick={() => router.push("/")}
                  className="px-6 py-3 bg-gradient-to-r from-yellow-500 to-amber-600 text-white font-medium rounded-full hover:from-yellow-600 hover:to-amber-700 transition-all shadow-md"
                >
                  Back to Notes
                </button>
              </div>
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
              className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl overflow-hidden"
            >
              <div className="bg-gradient-to-r from-yellow-500 to-amber-600 py-6 px-8 text-white">
                <h1 className="text-2xl md:text-3xl font-bold mb-2">
                  Upgrade to Pro
                </h1>
                <p className="text-white/80">
                  Unlock the full study experience
                </p>
              </div>

              <div className="p-8">
                <div className="grid md:grid-cols-2 gap-8">
                  <div>
                    <h2 className="text-xl font-semibold mb-4 text-gray-800 dark:text-white flex items-center">
                      <FaGraduationCap className="text-yellow-400 mr-2" /> Pro
                      Features
                    </h2>

                    <div className="space-y-4 mb-6">
                      {features.map((feature, index) => (
                        <div key={index} className="flex items-start">
                          <div className="mt-1 mr-3 flex-shrink-0 text-yellow-500 dark:text-yellow-400">
                            {feature.icon}
                          </div>
                          <div>
                            <h3 className="font-medium text-gray-800 dark:text-white">
                              {feature.title}
                            </h3>
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                              {feature.description}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="mt-6 bg-yellow-50 dark:bg-yellow-900/10 rounded-lg p-4 border border-yellow-100 dark:border-yellow-800/20">
                      <div className="flex items-start mb-2">
                        <FaInfoCircle className="text-yellow-500 dark:text-yellow-400 mt-1 mr-2 flex-shrink-0" />
                        <p className="text-sm text-gray-700 dark:text-gray-300">
                          Pro membership gives you full access to all features
                          for 1 month. Your subscription will automatically
                          expire after 1 month.
                        </p>
                      </div>

                      <div className="text-xs text-gray-500 dark:text-gray-400 ml-6">
                        Need help? Contact us at{" "}
                        <span className="text-yellow-600 dark:text-yellow-400">
                          support@notesexchange.com
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col">
                    <div className="bg-gradient-to-br from-yellow-50 to-amber-50 dark:from-gray-800 dark:to-amber-900/30 p-6 rounded-xl border border-yellow-100 dark:border-amber-900/20 shadow-sm flex-1">
                      <div className="text-center mb-6">
                        <h3 className="font-bold text-3xl text-gray-800 dark:text-white mb-1">
                          ₹40
                        </h3>
                        <div className="flex items-center justify-center">
                          <span className="text-sm bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300 px-2 py-0.5 rounded-full">
                            1 month
                          </span>
                        </div>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                          Less than the cost of a coffee
                        </p>
                      </div>

                      <div className="space-y-3 mb-6">
                        <div className="flex items-center">
                          <FaCheck className="text-green-500 mr-2 flex-shrink-0" />
                          <span className="text-sm text-gray-700 dark:text-gray-300">
                            Access complete study notes
                          </span>
                        </div>
                        <div className="flex items-center">
                          <FaCheck className="text-green-500 mr-2 flex-shrink-0" />
                          <span className="text-sm text-gray-700 dark:text-gray-300">
                            Pro badge on your profile
                          </span>
                        </div>
                        <div className="flex items-center">
                          <FaCheck className="text-green-500 mr-2 flex-shrink-0" />
                          <span className="text-sm text-gray-700 dark:text-gray-300">
                            Supporting our student community
                          </span>
                        </div>
                      </div>

                      <div className="flex items-start space-x-3 mb-6">
                        <div className="flex-shrink-0 mt-0.5">
                          <button
                            onClick={() => setTermsAccepted(!termsAccepted)}
                            className={`w-5 h-5 rounded flex items-center justify-center ${
                              termsAccepted
                                ? "bg-yellow-500 text-white"
                                : "border border-gray-300 dark:border-gray-600"
                            }`}
                          >
                            {termsAccepted && <FaCheck className="text-xs" />}
                          </button>
                        </div>
                        <div className="text-xs text-gray-600 dark:text-gray-400">
                          I agree to the{" "}
                          <button
                            onClick={() => openTermsModal("terms")}
                            className="text-yellow-600 dark:text-yellow-400 hover:underline"
                          >
                            Terms & Conditions
                          </button>{" "}
                          and{" "}
                          <button
                            onClick={() => openTermsModal("privacy")}
                            className="text-yellow-600 dark:text-yellow-400 hover:underline"
                          >
                            Privacy Policy
                          </button>
                        </div>
                      </div>

                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={handlePayment}
                        disabled={loading || !scriptLoaded || !termsAccepted}
                        className="w-full py-3 px-8 bg-gradient-to-r from-yellow-500 to-amber-600 text-white font-medium rounded-full hover:from-yellow-600 hover:to-amber-700 transition-all shadow-md disabled:opacity-70 flex items-center justify-center"
                      >
                        {loading ? (
                          <>
                            <FaSpinner className="animate-spin mr-2" />{" "}
                            Processing...
                          </>
                        ) : (
                          <>Subscribe Now</>
                        )}
                      </motion.button>

                      <div className="flex items-center justify-center mt-4">
                        <FaShieldAlt className="text-green-500 mr-1 text-xs" />
                        <p className="text-xs text-gray-500 dark:text-gray-500">
                          Secure payment powered by Razorpay
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </div>
      </div>

      {/* Modal */}
      <AnimatePresence>{showTermsModal && <TermsModal />}</AnimatePresence>
    </div>
  );
}
