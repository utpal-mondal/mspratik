import { useState } from "react";
import Head from "next/head";
import { Eye, EyeOff, Lock, KeyRound } from "lucide-react";
import { authApi } from "@/lib/api";

const ChangePasswordPage = () => {
  const [formData, setFormData] = useState({
    newPassword: "",
    confirmPassword: "",
  });
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (formData.newPassword.length < 6) {
      setError("New password must be at least 6 characters");
      return;
    }
    if (formData.newPassword !== formData.confirmPassword) {
      setError("New passwords do not match");
      return;
    }

    setIsLoading(true);
    try {
      await authApi.changePassword({
        new_password: formData.newPassword,
        confirm_password: formData.confirmPassword,
      });

      // Password changed - token is revoked server-side, force re-login
      localStorage.removeItem("token");
      window.location.href =
        "/login?message=" +
        encodeURIComponent(
          "Password changed successfully. Please sign in again."
        );
    } catch (err: any) {
      setError(
        err.response?.data?.error || "Failed to change password. Please try again."
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center bg-gradient-to-br from-blue-50 via-cream-50 to-blue-100 py-12 px-4 sm:px-6 lg:px-8">
      <Head>
        <title>Change Password - A unique tell</title>
      </Head>

      <section className="relative z-10 w-full max-w-sm">
        <div className="rounded-xl border border-slate-200 bg-white/95 p-4 shadow-xl backdrop-blur-md">
          {/* Header */}
          <div className="mb-4 text-center">
            <div className="mb-2 flex justify-center">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100">
                <KeyRound size={20} className="text-blue-600" />
              </div>
            </div>
            <h2 className="text-xl font-bold text-slate-800">Change Password</h2>
            <p className="mt-1 text-xs text-slate-500">
              Update your account password
            </p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-3 rounded-lg border-l-4 border-red-500 bg-red-50 px-3 py-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-red-700">{error}</span>
                <button
                  type="button"
                  onClick={() => setError("")}
                  className="text-red-700 hover:text-red-900"
                >
                  <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
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

          {/* Form */}
          <form className="space-y-3" onSubmit={handleSubmit} autoComplete="off">
            {/* New Password */}
            <div>
              <label
                htmlFor="newPassword"
                className="mb-1 block text-xs font-semibold text-slate-700"
              >
                New Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
                  <Lock size={16} className="text-slate-400" />
                </div>
                <input
                  id="newPassword"
                  name="newPassword"
                  type={showNew ? "text" : "password"}
                  autoComplete="new-password"
                  required
                  minLength={6}
                  value={formData.newPassword}
                  onChange={handleChange}
                  placeholder="Enter new password"
                  className="h-9 w-full rounded-md border border-slate-300 pl-9 pr-10 text-sm placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition"
                />
                <button
                  type="button"
                  onClick={() => setShowNew(!showNew)}
                  className="absolute inset-y-0 right-3 flex items-center text-slate-400 hover:text-slate-600"
                >
                  {showNew ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {/* Confirm New Password */}
            <div>
              <label
                htmlFor="confirmPassword"
                className="mb-1 block text-xs font-semibold text-slate-700"
              >
                Confirm New Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
                  <Lock size={16} className="text-slate-400" />
                </div>
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type={showConfirm ? "text" : "password"}
                  autoComplete="new-password"
                  required
                  minLength={6}
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  placeholder="Confirm new password"
                  className="h-9 w-full rounded-md border border-slate-300 pl-9 pr-10 text-sm placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirm(!showConfirm)}
                  className="absolute inset-y-0 right-3 flex items-center text-slate-400 hover:text-slate-600"
                >
                  {showConfirm ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {/* Submit Button */}
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
                  <span>Updating...</span>
                </>
              ) : (
                <>
                  <KeyRound size={16} />
                  <span>Update Password</span>
                </>
              )}
            </button>
          </form>
        </div>
      </section>
    </div>
  );
};

export default ChangePasswordPage;
