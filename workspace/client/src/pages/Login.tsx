import React, { useState, ChangeEvent, FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:3000/api";

interface LoginForm {
  email: string;
  password: string;
}

const Login: React.FC = () => {
  const navigate = useNavigate();

  const [form, setForm] = useState<LoginForm>({ email: "", password: "" });
  const [role, setRole] = useState<"student" | "tutor">("student");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    if (name === "role") setRole(value as "student" | "tutor");
    else setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    const emailPattern = /^[\w-.]+@([\w-]+\.)+[\w-]{2,4}$/;
    if (!emailPattern.test(form.email.trim())) {
      setError("Please enter a valid email address.");
      setLoading(false);
      return;
    }

    if (form.password.trim().length < 6) {
      setError("Password must be at least 6 characters.");
      setLoading(false);
      return;
    }

    try {
      const response = await axios.post(
        `${API_BASE_URL}/auth/login`,
        {
          email: form.email.trim().toLowerCase(),
          password: form.password.trim(),
          role,
        },
        {
          headers: { "Content-Type": "application/json" },
        }
      );

      const userObj = response.data?.user || response.data?.data || null;
      if (!userObj) {
        setError("Login failed: user information not received.");
        setLoading(false);
        return;
      }

      localStorage.clear();
      localStorage.setItem("tm_user", JSON.stringify(userObj));
      if (response.data.token) localStorage.setItem("tm_token", response.data.token);
      localStorage.setItem("tm_user_id", userObj._id);

      if (userObj.role === "student") navigate("/student-home");
      else if (userObj.role === "tutor") navigate("/tutor-home");
      else navigate("/");
    } catch (err: any) {
      setError(
        err.response?.data?.error ||
          err.response?.data?.message ||
          "Login failed. Please check your credentials and try again."
      );
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen flex items-center justify-center bg-gradient-to-tr from-indigo-50 to-yellow-50 p-6">
      <form
        onSubmit={handleSubmit}
        className="max-w-md w-full bg-white dark:bg-gray-900 p-8 rounded-3xl shadow-lg space-y-6"
        noValidate
        aria-live="polite"
      >
        <h2 className="text-3xl font-extrabold text-indigo-700 dark:text-yellow-400 text-center">
          Login
        </h2>

        {error && (
          <p className="text-red-600 text-center font-semibold" role="alert">
            {error}
          </p>
        )}

        <input
          type="email"
          name="email"
          placeholder="Email Address"
          value={form.email}
          onChange={handleChange}
          required
          aria-label="Email Address"
          autoComplete="email"
          className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-4 focus:ring-yellow-400 dark:bg-gray-800 dark:border-gray-600 dark:text-yellow-300"
        />

        <input
          type="password"
          name="password"
          placeholder="Password"
          value={form.password}
          onChange={handleChange}
          required
          aria-label="Password"
          autoComplete="current-password"
          minLength={6}
          className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-4 focus:ring-yellow-400 dark:bg-gray-800 dark:border-gray-600 dark:text-yellow-300"
        />

        <select
          name="role"
          value={role}
          onChange={handleChange}
          className="w-full p-3 border border-gray-300 rounded-lg cursor-pointer focus:outline-none focus:ring-4 focus:ring-yellow-400 dark:bg-gray-800 dark:border-gray-600 dark:text-yellow-300"
          aria-label="Select Role"
        >
          <option value="student">Student</option>
          <option value="tutor">Tutor</option>
        </select>

        <button
          type="submit"
          disabled={loading}
          className={`w-full py-3 rounded-lg font-semibold text-white transition ${
            loading ? "bg-indigo-400 cursor-not-allowed" : "bg-indigo-700 hover:bg-indigo-800"
          }`}
          aria-busy={loading}
          aria-label={loading ? "Logging in" : "Login"}
        >
          {loading ? "Logging in..." : "Login"}
        </button>

        <p className="text-center mt-4 text-sm text-indigo-600 hover:underline cursor-pointer">
          <a href="/forgot-password">Forgot Password?</a>
        </p>

        <div className="text-xs text-gray-500 mt-4 text-center">
          Debug: Check browser console for login info.
        </div>
      </form>
    </main>
  );
};

export default Login;
