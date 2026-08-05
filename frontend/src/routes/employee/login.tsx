import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import API_URL from "../../config/api";

export const Route = createFileRoute("/employee/login")({
  component: EmployeeLogin,
});

function EmployeeLogin() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    setLoading(true);
    setError("");

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

      localStorage.setItem("employee", JSON.stringify(data.employee));

      navigate({
        to: "/employee/dashboard",
      });
    } catch (err) {
      console.log(err);
      setError("Unable to connect to server.");
    }

    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-slate-100 flex items-center justify-center">
      <form
        onSubmit={handleLogin}
        className="bg-white w-full max-w-md rounded-xl shadow-lg p-8 space-y-5"
      >
        <div>
          <h1 className="text-3xl font-bold">Employee Login</h1>

          <p className="text-slate-500 mt-2">Digital Dental Designers</p>
        </div>

        {error && <div className="bg-red-100 text-red-600 p-3 rounded">{error}</div>}

        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full border rounded-lg px-4 py-3"
        />

        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full border rounded-lg px-4 py-3"
        />

        <button
          disabled={loading}
          className="w-full bg-[#1D5C5A] text-white rounded-lg py-3 font-semibold"
        >
          {loading ? "Logging in..." : "Login"}
        </button>
      </form>
    </div>
  );
}
