import { useState } from "react";
import { FaEye, FaEyeSlash, FaExclamationCircle } from "react-icons/fa";

export default function FormField({
  type,
  placeholder,
  setFunc,
  value,
  error,
  required = false,
  label,
  maxLength,
  icon,
  className = "",
}) {
  const [isFocused, setIsFocused] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [charCount, setCharCount] = useState(value?.length || 0);

  const handleChange = (e) => {
    setFunc(e.target.value);
    if (maxLength) {
      setCharCount(e.target.value.length);
    }
  };

  // Define base styles
  const baseInputClass = `w-full p-3 border rounded-lg transition-all duration-200 focus:ring-0 focus:outline-none dark:bg-gray-800 dark:text-white ${
    error
      ? "border-red-300 dark:border-red-700 bg-red-50 dark:bg-red-900/20"
      : isFocused
      ? "border-pink-400 dark:border-pink-600 ring-2 ring-pink-100 dark:ring-pink-900/30"
      : "border-gray-200 dark:border-gray-700"
  }`;

  // Determine if we should show the password-toggle button
  const isPasswordField = type === "password";
  const actualType = isPasswordField && showPassword ? "text" : type;

  return (
    <div className={`mb-5 ${className}`}>
      {label && (
        <label className="block text-sm font-medium mb-1.5 text-gray-700 dark:text-gray-300">
          {label} {required && <span className="text-red-500">*</span>}
        </label>
      )}

      <div className="relative">
        {icon && (
          <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500">
            {icon}
          </div>
        )}

        {type === "textarea" ? (
          <textarea
            className={`${baseInputClass} min-h-[120px] resize-y ${
              icon ? "pl-10" : ""
            }`}
            placeholder={placeholder}
            value={value}
            onChange={handleChange}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            required={required}
            maxLength={maxLength}
          />
        ) : (
          <input
            type={actualType}
            className={`${baseInputClass} ${icon ? "pl-10" : ""} ${
              isPasswordField ? "pr-10" : ""
            }`}
            placeholder={placeholder}
            value={value}
            onChange={handleChange}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            required={required}
            maxLength={maxLength}
          />
        )}

        {isPasswordField && (
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300 transition-colors focus:outline-none"
          >
            {showPassword ? <FaEyeSlash size={18} /> : <FaEye size={18} />}
          </button>
        )}

        {error && (
          <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-red-500">
            <FaExclamationCircle size={18} />
          </div>
        )}
      </div>

      <div className="mt-1 flex justify-between items-center">
        {error && (
          <p className="text-red-500 text-sm flex items-center">{error}</p>
        )}

        {maxLength && !error && (
          <p
            className={`text-xs ml-auto ${
              charCount > maxLength * 0.8
                ? charCount >= maxLength
                  ? "text-red-500"
                  : "text-yellow-500"
                : "text-gray-400 dark:text-gray-500"
            }`}
          >
            {charCount}/{maxLength}
          </p>
        )}
      </div>
    </div>
  );
}
