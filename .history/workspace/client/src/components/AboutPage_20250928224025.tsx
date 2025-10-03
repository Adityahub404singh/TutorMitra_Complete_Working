import React from "react";

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-gray-50 p-10 flex flex-col items-center">
      {/* Header */}
      <header className="max-w-5xl text-center mb-16">
        <h1 className="text-5xl font-extrabold text-indigo-900 mb-6">
          Welcome to <span className="text-yellow-500">TutorMitra</span>
        </h1>
        <p className="text-xl text-gray-700 max-w-4xl mx-auto">
          TutorMitra ek trusted offline coaching platform hai jahan students apne shehar ke verified tutors se directly connect kar sakte hain.
          Apne liye best tutors chunein, booking karein, aur personalized learning ka maza uthayein. Har step simple, transparent aur secure hai.
        </p>
      </header>

      {/* Features Section */}
      <section className="max-w-7xl w-full grid grid-cols-1 sm:grid-cols-3 gap-14">
        <Feature
          icon="📚"
          title="Vast Subject Range"
          description="Maths, Science, Computers, Languages, Sports aur bahut kuch. Har subject ke liye qualified tutors."
        />
        <Feature
          icon="✅"
          title="Verified & Trusted"
          description="Har tutor ki thorough verification ke baad wajah par hona zaroori hai. Aap payenge genuine aur reliable teachers."
        />
        <Feature
          icon="🎯"
          title="Seamless Booking"
          description="Sirf 3 steps me booking confirm karo. Trial session option ke sath risk-free shuruaat."
        />
      </section>

      {/* Call To Action */}
      <section className="mt-20">
        <button
          className="bg-yellow-500 hover:bg-yellow-600 text-white px-14 py-4 rounded-full font-extrabold shadow-lg transition"
          onClick={() => window.location.href = "/tutors"}
          aria-label="Go to Tutors listings"
        >
          Explore Tutors & Book Now
        </button>
      </section>

      {/* Footer */}
      <footer className="mt-auto text-center text-gray-500 text-sm mt-36">
        &copy; 2025 TutorMitra. All rights reserved.
      </footer>
    </div>
  );
}

function Feature({
  icon,
  title,
  description,
}: {
  icon: string;
  title: string;
  description: string;
}) {
  return (
    <div className="bg-white rounded-xl shadow-lg p-8 flex flex-col items-center text-center cursor-default hover:shadow-2xl transition-all duration-300">
      <div className="text-5xl mb-5">{icon}</div>
      <h3 className="font-bold text-2xl text-indigo-900 mb-3">{title}</h3>
      <p className="text-gray-600">{description}</p>
    </div>
  );
}
