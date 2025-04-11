import { useState } from "react";
import Image from "next/image";
import { FaUserCircle } from "react-icons/fa";

const ProfileImage = ({
  src,
  size = 40,
  className = "",
  alt = "Profile picture",
  useNextImage = false, // Add a prop to choose which image component to use
  ...rest
}) => {
  const [imageError, setImageError] = useState(false);

  // Fallback icon when image is missing or fails to load
  if (!src || imageError) {
    return (
      <div
        className={`flex items-center justify-center bg-gray-100 dark:bg-gray-800 rounded-full ${className}`}
        style={{ width: size, height: size }}
        {...rest}
      >
        <FaUserCircle
          size={size * 0.8}
          className="text-gray-400 dark:text-gray-500"
        />
      </div>
    );
  }

  // Check if the image URL is from a domain configured in next.config.js
  // You can expand this list with other domains you've configured
  const configuredDomains = ["lh3.googleusercontent.com"];
  const isConfiguredDomain = configuredDomains.some((domain) =>
    src.includes(domain)
  );

  // Use Next Image for configured domains, regular img for others
  const shouldUseNextImage = useNextImage && isConfiguredDomain;

  return (
    <div
      className={`relative rounded-full overflow-hidden ${className}`}
      style={{ width: size, height: size }}
    >
      {shouldUseNextImage ? (
        <Image
          src={src}
          alt={alt}
          width={size}
          height={size}
          className="object-cover"
          onError={() => setImageError(true)}
          {...rest}
        />
      ) : (
        <img
          src={src}
          alt={alt}
          width={size}
          height={size}
          className="object-cover w-full h-full"
          onError={() => setImageError(true)}
          {...rest}
        />
      )}
    </div>
  );
};

export default ProfileImage;
