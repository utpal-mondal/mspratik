import Head from "next/head";
import Link from "next/link";
import { useRouter } from "next/router";
import { Home, Search, ArrowLeft } from "lucide-react";

const Custom404 = () => {
  const router = useRouter();

  return (
    <>
      <Head>
        <title>404 - Page Not Found | A Unique Tell</title>
        <meta
          name="description"
          content="The page you're looking for doesn't exist."
        />
      </Head>

      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-cream-50 to-blue-100 flex items-center justify-center px-4">
        {/* Animated background elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-20 left-10 w-72 h-72 bg-blue-200 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob"></div>
          <div className="absolute top-40 right-10 w-72 h-72 bg-cream-200 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-2000"></div>
          <div className="absolute -bottom-8 left-1/2 w-72 h-72 bg-blue-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-4000"></div>
        </div>

        <div className="relative z-10 max-w-md w-full">
          <div className="bg-white/80 backdrop-blur-lg p-8 rounded-2xl shadow-2xl border border-white/20 text-center">
            {/* 404 Icon */}
            <div className="mb-6">
              <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-blue-100 to-blue-50 rounded-full border-2 border-blue-200">
                <span className="text-3xl font-bold text-blue-600">404</span>
              </div>
            </div>

            {/* Error Message */}
            <h1 className="text-2xl font-bold text-gray-800 mb-3">
              Page Not Found
            </h1>

            <p className="text-gray-600 mb-8">
              The page you're looking for doesn't exist or has been moved.
            </p>

            {/* Action Buttons */}
            <div className="space-y-3">
              <Link
                href="/dashboard"
                className="w-full inline-flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-medium rounded-xl transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl"
              >
                <Home size={20} />
                Go to Dashboard
              </Link>

              <button
                onClick={() => router.back()}
                className="w-full inline-flex items-center justify-center gap-2 px-6 py-3 bg-white border border-gray-300 text-gray-700 font-medium rounded-xl hover:bg-gray-50 transition-all duration-300"
              >
                <ArrowLeft size={20} />
                Go Back
              </button>

              <Link
                href="/"
                className="inline-flex items-center justify-center gap-2 text-blue-600 hover:text-blue-700 font-medium transition-colors"
              >
                <Search size={16} />
                Search for something else
              </Link>
            </div>

            {/* Additional Help */}
            <div className="mt-8 pt-6 border-t border-gray-200">
              <p className="text-sm text-gray-500">
                If you think this is an error, please contact our support team.
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Custom404;
