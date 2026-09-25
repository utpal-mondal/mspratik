import Head from "next/head";
import Link from "next/link";
import { useRouter } from "next/router";
import { Home, AlertTriangle, ArrowLeft } from "lucide-react";

const ErrorPage = ({ statusCode }: { statusCode?: number }) => {
  const router = useRouter();

  const getErrorMessage = (code?: number) => {
    switch (code) {
      case 404:
        return "The page you're looking for doesn't exist.";
      case 500:
        return "Something went wrong on our end. Please try again later.";
      default:
        return "An unexpected error occurred.";
    }
  };

  const getErrorTitle = (code?: number) => {
    switch (code) {
      case 404:
        return "Page Not Found";
      case 500:
        return "Server Error";
      default:
        return "Something Went Wrong";
    }
  };

  return (
    <>
      <Head>
        <title>
          {statusCode ? `${statusCode} - Error` : "Error"} | A Unique Tell
        </title>
        <meta name="description" content={getErrorMessage(statusCode)} />
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
            {/* Error Icon */}
            <div className="mb-6">
              <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-red-100 to-red-50 rounded-full border-2 border-red-200">
                {statusCode === 404 ? (
                  <span className="text-3xl font-bold text-red-600">404</span>
                ) : (
                  <AlertTriangle size={32} className="text-red-600" />
                )}
              </div>
            </div>

            {/* Error Message */}
            <h1 className="text-2xl font-bold text-gray-800 mb-3">
              {getErrorTitle(statusCode)}
            </h1>

            <p className="text-gray-600 mb-8">{getErrorMessage(statusCode)}</p>

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

              {statusCode === 404 && (
                <Link
                  href="/"
                  className="inline-flex items-center justify-center gap-2 text-blue-600 hover:text-blue-700 font-medium transition-colors"
                >
                  <AlertTriangle size={16} />
                  Search for something else
                </Link>
              )}
            </div>

            {/* Additional Help */}
            <div className="mt-8 pt-6 border-t border-gray-200">
              <p className="text-sm text-gray-500">
                {statusCode === 500
                  ? "If this problem persists, please contact our support team."
                  : "If you think this is an error, please contact our support team."}
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

ErrorPage.getInitialProps = ({ res, err }: { res?: any; err?: any }) => {
  const statusCode = res ? res.statusCode : err ? err.statusCode : 404;
  return { statusCode };
};

export default ErrorPage;
