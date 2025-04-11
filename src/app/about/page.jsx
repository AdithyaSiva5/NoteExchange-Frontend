import Link from "next/link";

export default function About() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-gray-900">
      <div className="text-center">
        <h1 className="text-4xl font-bold mb-4">Welcome to the About Page!</h1>
        <p className="text-lg">
          You are never too old to set another goal or to dream a new dream.
        </p>
        <Link href="/" className="text-blue-500 mt-4 inline-block">
          Back to Home
        </Link>
      </div>
    </div>
  );
}
