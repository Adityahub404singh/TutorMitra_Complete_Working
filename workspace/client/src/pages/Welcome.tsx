import React from "react";
import { useNavigate } from "react-router-dom";

export default function Welcome() {
  const navigate = useNavigate();

  return (
    <main className="min-h-screen flex flex-col items-center justify-center bg-white px-6 md:px-12">
      <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900 mb-12" tabIndex={0}>
        Login as
      </h2>

      <div className="flex flex-col sm:flex-row gap-8 mb-14 w-full max-w-md">
        <button
          aria-label="Login as Student"
          onClick={() => navigate("/login?role=student")}
          className="flex-1 bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-4 focus:ring-blue-300 text-white font-semibold py-4 px-8 rounded-lg shadow-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Student
        </button>

        <button
          aria-label="Login as Tutor"
          onClick={() => navigate("/login?role=tutor")}
          className="flex-1 bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-4 focus:ring-green-300 text-white font-semibold py-4 px-8 rounded-lg shadow-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Tutor
        </button>
      </div>

      <p className="max-w-md text-center text-gray-600 text-sm leading-relaxed">
        By continuing, you agree to our{" "}
        <a
          href="/terms"
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-600 hover:text-blue-800 underline"
        >
          Terms & Conditions
        </a>
        .
      </p>
    </main>
  );
}
