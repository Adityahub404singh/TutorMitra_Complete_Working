import React from "react";
import PageTemplate from "./PageTemplate";
import { useNavigate } from "react-router-dom";

const BecomeTutor: React.FC = () => {
  const navigate = useNavigate();

  const handleRegisterClick = () => {
    // Navigate to Tutor Registration page
    navigate("/tutor-registration");
  };

  return (
    <PageTemplate
      title="Become a Tutor"
      description="Join TutorMitra to share your expertise and earn by teaching."
    >
      <p className="mb-6 text-lg text-gray-700 dark:text-yellow-400 leading-relaxed">
        Sign up today to create your tutor profile, set your availability, and start connecting with students from all over the country.
      </p>

      <ul className="list-disc list-inside space-y-3 mb-8 text-gray-700 dark:text-yellow-400 text-lg leading-relaxed">
        <li>Flexible work hours — Teach on your own schedule.</li>
        <li>Access to a wide base of students actively searching for tutors.</li>
        <li>Competitive and transparent pricing structure.</li>
        <li>Reliable platform support and secure payments.</li>
      </ul>

      <button
        onClick={handleRegisterClick}
        className="px-8 py-3 bg-primary hover:bg-primary-dark text-white text-lg rounded-lg transition focus:outline-none focus:ring-4 focus:ring-yellow-400"
        aria-label="Start Tutor Registration"
      >
        Register as Tutor
      </button>
    </PageTemplate>
  );
};

export default BecomeTutor;
