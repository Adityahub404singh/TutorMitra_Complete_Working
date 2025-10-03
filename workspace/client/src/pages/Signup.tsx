import React, { useState, ChangeEvent, FormEvent } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:3000/api";

interface FormState {
  name: string;
  email: string;
  password: string;
  role: "student" | "tutor";
}

const Signup: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const query = new URLSearchParams(location.search);
  const initialRole = query.get("role") === "tutor" ? "tutor" : "student";

  const [form, setForm] = useState<FormState>({
    name: "",
    email: "",
    password: "",
    role: initialRole,
  });

  const [error, setError] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);

  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: name === "role" ? (value as "student" | "tutor") : value,
    }));
  };

  const validateEmail = (email: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  const validatePassword = (password: string) => password.length >= 6;

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");

    if (!form.name.trim()) {
      setError("Please enter your full name.");
      return;
    }
    if (!validateEmail(form.email.trim())) {
      setError("Please enter a valid email address.");
      return;
    }
    if (!validatePassword(form.password)) {
      setError("Password must be at least 6 characters long.");
      return;
    }

    setLoading(true);
    try {
      const res = await axios.post(`${API_BASE_URL}/auth/signup`, form);
      localStorage.setItem("tm_token", res.data.token);
      const userRole = res.data.role || form.role;
      localStorage.setItem("auth_role", userRole);

      if (userRole === "tutor") {
        navigate("/tutor-registration");
      } else {
        navigate("/student-home");
      }
    } catch (err: any) {
      setError(err.response?.data?.message || "Signup failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      noValidate
      aria-label="Signup Form"
      className="max-w-md mx-auto bg-white rounded-3xl p-10 shadow-lg font-sans select-text"
    >
      <h2 className="text-4xl font-extrabold mb-8 text-center text-indigo-900">
        Sign Up as <span className="capitalize text-yellow-600">{form.role}</span>
      </h2>

      {error && (
        <div
          role="alert"
          className="bg-red-100 text-red-700 border border-red-400 rounded-md p-3 mb-6 text-center font-medium"
        >
          {error}
        </div>
      )}

      <label htmlFor="name" className="block mb-4">
        <span className="text-gray-700 font-semibold">Full Name</span>
        <input
          type="text"
          id="name"
          name="name"
          value={form.name}
          onChange={handleChange}
          required
          placeholder="Your full name"
          className="mt-1 w-full px-4 py-3 border rounded-lg border-gray-300 focus:outline-none focus:ring-2 focus:ring-yellow-500 transition"
          maxLength={50}
          aria-describedby="nameHelp"
        />
      </label>

      <label htmlFor="email" className="block mb-4">
        <span className="text-gray-700 font-semibold">Email Address</span>
        <input
          type="email"
          id="email"
          name="email"
          value={form.email}
          onChange={handleChange}
          required
          placeholder="email@example.com"
          className="mt-1 w-full px-4 py-3 border rounded-lg border-gray-300 focus:outline-none focus:ring-2 focus:ring-yellow-500 transition"
          aria-describedby="emailHelp"
        />
      </label>

      <label htmlFor="password" className="block mb-4">
        <span className="text-gray-700 font-semibold">Password</span>
        <input
          type="password"
          id="password"
          name="password"
          value={form.password}
          onChange={handleChange}
          required
          minLength={6}
          placeholder="Create a password"
          className="mt-1 w-full px-4 py-3 border rounded-lg border-gray-300 focus:outline-none focus:ring-2 focus:ring-yellow-500 transition"
          aria-describedby="passwordHelp"
        />
        <small id="passwordHelp" className="text-gray-500 block mt-1">
          At least 6 characters
        </small>
      </label>

      <label htmlFor="role" className="block mb-8">
        <span className="text-gray-700 font-semibold">Select Role</span>
        <select
          id="role"
          name="role"
          value={form.role}
          onChange={handleChange}
          className="mt-1 w-full px-4 py-3 border rounded-lg border-gray-300 focus:outline-none focus:ring-2 focus:ring-yellow-500 transition"
          aria-required="true"
        >
          <option value="student">Student</option>
          <option value="tutor">Tutor</option>
        </select>
      </label>

      <button
        type="submit"
        disabled={loading}
        aria-busy={loading}
        className={`w-full py-4 font-semibold rounded-xl text-white transition ${
          loading ? "bg-yellow-400 cursor-not-allowed" : "bg-yellow-600 hover:bg-yellow-700"
        }`}
      >
        {loading ? "Creating Account..." : "Sign Up"}
      </button>
    </form>
  );
};

export default Signup;
