import React, { useState, ChangeEvent, FormEvent } from "react";
import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:3000/api";

const ForgotPassword: React.FC = () => {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    setEmail(e.target.value);
    setError("");
    setMessage("");
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    setMessage("");

    if (!email.trim().match(/^[\w-.]+@([\w-]+\.)+[\w-]{2,4}$/)) {
      setError("Please enter a valid email address.");
      return;
    }

    setLoading(true);
    try {
      const res = await axios.post(
        `${API_BASE_URL}/auth/forgot-password`,
        { email: email.trim().toLowerCase() },
        { headers: { "Content-Type": "application/json" } }
      );
      setMessage(res.data.message || "Password reset email sent");
    } catch (err: any) {
      setError(
        err.response?.data?.error ||
          err.response?.data?.message ||
          "Failed to send reset email. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen flex items-center justify-center p-6 bg-gray-50">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-md bg-white rounded-lg shadow-md p-8"
        noValidate
        aria-live="polite"
      >
        <h2 className="text-2xl font-bold text-center mb-6">Forgot Password</h2>

        {error && (
          <p role="alert" className="mb-4 text-red-600 text-center font-semibold">
            {error}
          </p>
        )}

        {message && (
          <p role="alert" className="mb-4 text-green-600 text-center font-semibold">
            {message}
          </p>
        )}

        <input
          type="email"
          name="email"
          placeholder="Enter your registered email"
          value={email}
          onChange={handleChange}
          required
          aria-label="Email Address"
          className="w-full mb-4 p-3 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-indigo-500"
          autoComplete="email"
        />

        <button
          type="submit"
          disabled={loading}
          className={`w-full py-3 font-semibold text-white rounded ${
            loading ? "bg-indigo-400 cursor-not-allowed" : "bg-indigo-600 hover:bg-indigo-700"
          }`}
          aria-busy={loading}
          aria-label={loading ? "Sending reset email" : "Send reset email"}
        >
          {loading ? "Sending..." : "Send Reset Email"}
        </button>
      </form>
    </main>
  );
};

export default ForgotPassword;
