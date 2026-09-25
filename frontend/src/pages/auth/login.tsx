// frontend/src/pages/login.tsx
import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import Link from "next/link";
import Head from "next/head";
import { useAuth } from "../../contexts/AuthContext";
import { Eye, EyeOff, Lock, User, LogIn } from "lucide-react";
import SampleCredentials from "./(component)/SampleCredentials";

const isStaging = process.env.NEXT_PUBLIC_STAGING === "true";

const LoginPage = () => {
  const router = useRouter();
  const { login, user } = useAuth();
  const [formData, setFormData] = useState({
    username: "",
    password: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

  // Already authenticated (e.g. visited / or /login in another tab) - go to dashboard
  useEffect(() => {
    if (user) {
      router.replace("/dashboard");
    }
  }, [user, router]);

  useEffect(() => {
    // Session expired or token revoked - redirected here by the API interceptor
    if (router.query.session === "expired") {
      setError("Your session has expired or was signed out. Please sign in again.");
      const cleanUrl = window.location.pathname;
      window.history.replaceState({}, document.title, cleanUrl);
      return;
    }

    // Check for success message in URL query
    if (router.query.message) {
      setSuccessMessage(router.query.message as string);
      // Clean up the URL
      const cleanUrl = window.location.pathname;
      window.history.replaceState({}, document.title, cleanUrl);
    }

    // Check for remember me data
    // const rememberedUsername = localStorage.getItem("rememberedUsername");
    // const rememberedPassword = localStorage.getItem("rememberedPassword");

    // if (rememberedUsername) {
    //   setFormData((prev) => ({
    //     ...prev,
    //     username: rememberedUsername,
    //     password: rememberedPassword || "",
    //     remember: true,
    //   }));
    // }
  }, [router]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // const { name, value, type, checked } = e.target;

    // if (name === "remember" && !checked) {
    //   // Clear remembered data when unchecking remember me
    //   localStorage.removeItem("rememberedUsername");
    //   localStorage.removeItem("rememberedPassword");
    // }
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
  //     [name]: type === "checkbox" ? checked : value,
  //   }));
  // };

  // const clearRememberedData = () => {
  //   localStorage.removeItem("rememberedUsername");
  //   localStorage.removeItem("rememberedPassword");
  //   setFormData((prev) => ({
  //     ...prev,
  //     username: "",
  //     password: "",
  //     remember: false,
   [name]: value,
    }));
  };

  const handleCredentialSelect = ({
    userName,
    password,
  }: {
    userName: string;
    password: string;
  }) => {
    setFormData((prev) => ({
      ...prev,
      username: userName,
      password: password,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      // Use AuthContext login method with username as email
      await login(formData.username, formData.password);

      // Save credentials to localStorage if remember me is checked
      // if (formData.remember) {
      //   localStorage.setItem("rememberedUsername", formData.username);
      //   localStorage.setItem("rememberedPassword", formData.password);
      // } else {
      //   localStorage.removeItem("rememberedUsername");
      //   localStorage.removeItem("rememberedPassword");
      // }

      // AuthContext login method handles the redirect automatically
    } catch (err: any) {
      setError(err.message || "Login failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-cream-50 to-blue-100 py-12 px-4 sm:px-6 lg:px-8">
      <Head>
        <title>Login - A unique tell</title>
      </Head>

      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 bg-blue-200 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob"></div>
        <div className="absolute top-40 right-10 w-72 h-72 bg-cream-200 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-2000"></div>
        <div className="absolute -bottom-8 left-1/2 w-72 h-72 bg-blue-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-4000"></div>
      </div>

      <section className="relative z-10 w-full max-w-sm">
        <div className="rounded-xl border border-slate-200 bg-white/95 p-4 shadow-xl backdrop-blur-md">
          {/* Logo */}
          <div className="mb-4 flex justify-center">
            <img
              src="/images/pratik-transport-logo.png"
              alt="pratik-transport-logo"
              className="h-10 w-auto object-contain"
            />
          </div>

          {/* Header */}
          <div className="mb-4 text-center">
            <h2 className="text-xl font-bold text-slate-800">Welcome Back</h2>

            <p className="mt-1 text-xs text-slate-500">
              Sign in to access your WMS dashboard
            </p>
          </div>

          {/* Success Message */}
          {successMessage && (
            <div className="mb-3 rounded-lg border-l-4 border-green-500 bg-green-50 px-3 py-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-green-700">
                  {successMessage}
                </span>

                <button
                  type="button"
                  onClick={() => setSuccessMessage("")}
                  className="text-green-700 hover:text-green-900"
                >
                  <svg
                    className="h-4 w-4"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      clipRule="evenodd"
                      d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                    />
                  </svg>
                </button>
              </div>
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="mb-3 rounded-lg border-l-4 border-red-500 bg-red-50 px-3 py-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-red-700">
                  {error}
                </span>

                <button
                  type="button"
                  onClick={() => setError("")}
                  className="text-red-700 hover:text-red-900"
                >
                  <svg
                    className="h-4 w-4"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      clipRule="evenodd"
                      d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                    />
                  </svg>
                </button>
              </div>
            </div>
          )}

          {/* Login Form */}
          <form className="space-y-3" onSubmit={handleSubmit} autoComplete="off">
            {/* Username */}
            <div>
              <label
                htmlFor="username"
                className="mb-1 block text-xs font-semibold text-slate-700"
              >
                Username or Email
              </label>

              <div className="relative">
                <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
                  <User size={16} className="text-slate-400" />
                </div>

                <input
                  id="username"
                  name="username"
                  type="text"
                  autoComplete="off"
                  required
                  value={formData.username}
                  onChange={handleChange}
                  placeholder="Enter username or email"
                  className="h-9 w-full rounded-md border border-slate-300 pl-9 pr-3 text-sm placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label
                htmlFor="password"
                className="mb-1 block text-xs font-semibold text-slate-700"
              >
                Password
              </label>

              <div className="relative">
                <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
                  <Lock size={16} className="text-slate-400" />
                </div>

                <input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="new-password"
                  required
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Enter password"
                  className="h-9 w-full rounded-md border border-slate-300 pl-9 pr-10 text-sm placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition"
                />

                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-3 flex items-center text-slate-400 hover:text-slate-600"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {/* Forgot password */}
            <div className="text-right text-xs">
              <a
                href="#"
                className="font-medium text-blue-600 hover:text-blue-700"
              >
                Forgot password?
              </a>
            </div>

            {/* Login Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="flex h-9 w-full items-center justify-center gap-2 rounded-md bg-blue-600 text-sm font-semibold text-white transition hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isLoading ? (
                <>
                  <svg
                    className="h-4 w-4 animate-spin"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    />
                  </svg>

                  <span>Signing in...</span>
                </>
              ) : (
                <>
                  <LogIn size={16} />
                  <span>Sign In</span>
                </>
              )}
            </button>

            {/* Register */}
            {/* <div className="pt-1 text-center text-xs text-slate-500">
              Don't have an account?{" "}
              <Link
                href="/register"
                className="font-semibold text-blue-600 hover:text-blue-700"
              >
                Create Account
              </Link>
            </div> */}
          </form>

        </div>
          {isStaging && (
            <SampleCredentials onSelect={handleCredentialSelect} />
          )}


      </section>
    </div>
  );
};

// Define a custom layout for this page (no layout)
LoginPage.getLayout = (page: React.ReactElement) => page;

export default LoginPage;
