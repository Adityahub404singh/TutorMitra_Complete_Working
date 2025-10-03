import React from "react";

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-gray-50 p-6 flex flex-col items-center">
      {/* Header */}
      <header className="max-w-4xl text-center mb-14">
        <h1 className="text-5xl font-extrabold text-indigo-900 mb-4">
          Welcome to TutorMitra
        </h1>
        <p className="text-lg text-gray-700 max-w-3xl mx-auto">
          TutorMitra ek trusted offline coaching platform hai jahan par students apne shehar ke verified aur experienced tutors se directly connect kar sakte hain. Apni coaching requirements ke liye best tutor dhoondhein, booking karein aur personalized coaching ka fayda uthayein.
        </p>
      </header>

      {/* Features Section */}
      <section className="max-w-6xl w-full grid grid-cols-1 sm:grid-cols-3 gap-10 mb-20">
        <Feature 
          icon="📚" 
          title="Har Subject Ke Tutors" 
          description="Maths, Science, Programming, Sports... Har tarah ke subjects ka wide pool." 
        />
        <Feature 
          icon="✅" 
          title="Verified Tutors" 
          description="Har tutor thorough verification ke baad hi platform par listed hota hai. Quality aur safety ka assurance." 
        />
        <Feature 
          icon="🎯" 
          title="Asaan Booking" 
          description="3 simple steps me tutor select karein, date set karein aur booking confirm karein. Trial sessions bhi available." 
        />
      </section>

      {/* Call To Action */}
      <section className="mb-20">
        <button 
          className="bg-indigo-700 hover:bg-indigo-800 text-white py-3 px-10 rounded-full font-semibold shadow-lg transition"
          onClick={() => window.location.href = '/tutors'}
          aria-label="Explore tutors"
        >
          Explore Tutors & Book Now
        </button>
      </section>

      {/* Footer */}
      <footer className="text-center text-gray-500 text-sm">
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
    <div className="bg-white rounded-lg shadow-md p-6 flex flex-col items-center cursor-default hover:shadow-lg transition">
      <div className="text-5xl mb-4">{icon}</div>
      <h3 className="font-semibold text-xl mb-2 text-indigo-900">{title}</h3>
      <p className="text-gray-600 text-center">{description}</p>
    </div>
  );
}
