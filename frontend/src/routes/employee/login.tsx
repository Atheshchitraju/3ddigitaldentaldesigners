import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import API_URL from "../../config/api";

export const Route = createFileRoute("/employee/login")({
  component: EmployeeLogin,
});

function EmployeeLogin() {
  const navigate = useNavigate();

  const [isForgotPassword, setIsForgotPassword] = useState(false);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // ─────────────────────────────────────────────
  // LOGIN
  // ─────────────────────────────────────────────

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    setLoading(true);
    setError("");
    setSuccess("");

    try {
      const response = await fetch(`${API_URL}/api/employee/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          password,
        }),
      });

      const data = await response.json();

      if (!data.success) {
        setError(data.message);
        setLoading(false);
        return;
      }

      localStorage.setItem("employeeToken", data.token);

      localStorage.setItem(
        "employee",
        JSON.stringify(data.employee)
      );

      navigate({
        to: "/employee/dashboard",
      });
    } catch (err) {
      console.log(err);
      setError("Unable to connect to server.");
    }

    setLoading(false);
  };

  // ─────────────────────────────────────────────
  // FORGOT PASSWORD
  // ─────────────────────────────────────────────

  const handleForgotPassword = async (
    e: React.FormEvent
  ) => {
    e.preventDefault();

    if (!email.trim()) {
      setError("Please enter your email address.");
      return;
    }

    setLoading(true);
    setError("");
    setSuccess("");

    try {
      const response = await fetch(
        `${API_URL}/api/employee/forgot-password`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email,
          }),
        }
      );

      const data = await response.json();

      if (!data.success) {
        setError(data.message);
        setLoading(false);
        return;
      }

      setSuccess(data.message);
    } catch (err) {
      console.log(err);
      setError("Unable to connect to server.");
    }

    setLoading(false);
  };

  // ─────────────────────────────────────────────
  // FORGOT PASSWORD SCREEN
  // ─────────────────────────────────────────────

  if (isForgotPassword) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-100 px-4">
        <div className="w-full max-w-md bg-white rounded-2xl shadow-lg p-8">

          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-slate-800">
              Forgot Password?
            </h1>

            <p className="text-slate-500 mt-2">
              Digital Dental Designers
            </p>

            <p className="text-sm text-slate-500 mt-4">
              Enter your employee email address and we
              will send you instructions to reset your password.
            </p>
          </div>

          {error && (
            <div className="bg-red-100 text-red-600 p-3 rounded-lg mb-4">
              {error}
            </div>
          )}

          {success && (
            <div className="bg-green-100 text-green-700 p-3 rounded-lg mb-4">
              {success}
            </div>
          )}

          <form
            onSubmit={handleForgotPassword}
            className="space-y-4"
          >
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Employee Email
              </label>

              <input
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full border rounded-lg px-4 py-3 outline-none focus:ring-2 focus:ring-[#1D5C5A]"
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#1D5C5A] text-white rounded-lg py-3 font-semibold disabled:opacity-50"
            >
              {loading
                ? "Sending..."
                : "Send Reset Instructions"}
            </button>
          </form>

          <button
            type="button"
            onClick={() => {
              setIsForgotPassword(false);
              setError("");
              setSuccess("");
            }}
            className="w-full mt-4 text-[#1D5C5A] font-medium hover:underline"
          >
            ← Back to Login
          </button>

        </div>
      </div>
    );
  }

  // ─────────────────────────────────────────────
  // LOGIN SCREEN
  // ─────────────────────────────────────────────

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-100 px-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-lg p-8">

        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-slate-800">
            Employee Login
          </h1>

          <p className="text-slate-500 mt-2">
            Digital Dental Designers
          </p>
        </div>

        {error && (
          <div className="bg-red-100 text-red-600 p-3 rounded-lg mb-4">
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4">

          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full border rounded-lg px-4 py-3"
            required
          />

          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full border rounded-lg px-4 py-3"
            required
          />

          <div className="flex items-center justify-between text-sm">

            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                className="w-4 h-4"
              />

              <span className="text-slate-600">
                Remember me
              </span>
            </label>

            <button
              type="button"
              onClick={() => {
                setIsForgotPassword(true);
                setError("");
                setSuccess("");
              }}
              className="text-[#1D5C5A] font-medium hover:underline"
            >
              Forgot Password?
            </button>

          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#1D5C5A] text-white rounded-lg py-3 font-semibold disabled:opacity-50"
          >
            {loading ? "Logging in..." : "Login"}
          </button>

        </form>

      </div>
    </div>
  );
}