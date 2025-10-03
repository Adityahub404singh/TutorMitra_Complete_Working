import React from "react";

export default function AboutPage() {
  return (
    <div className="bg-white rounded-lg shadow-lg p-8 mb-10 max-w-3xl mx-auto">
      <h2 className="text-3xl font-bold text-indigo-900 mb-3 text-center">
        Why TutorMitra?
      </h2>
      <p className="text-center text-gray-700 mb-3">
        TutorMitra helps students find trusted offline and online tutors in their city. Quick booking, trial sessions, verified teachers, and full transparency!
      </p>
      <div className="flex flex-wrap justify-center gap-4 text-center mt-5">
        <div className="p-3 w-48 rounded-lg bg-blue-50 shadow">
          <div className="text-2xl mb-1">✅</div>
          <span className="font-semibold">Verified Experts</span>
        </div>
        <div className="p-3 w-48 rounded-lg bg-green-50 shadow">
          <div className="text-2xl mb-1">🕒</div>
          <span className="font-semibold">Flexible Booking</span>
        </div>
        <div className="p-3 w-48 rounded-lg bg-purple-50 shadow">
          <div className="text-2xl mb-1">🤝</div>
          <span className="font-semibold">Easy Connect</span>
        </div>
      </div>
    </div>
  );
}
