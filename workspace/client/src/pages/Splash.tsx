import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

/* Data for Student Profiles */
const STUDENT_PROFILES = [
  {
    name: "Ananya Kumar",
    intro: "JEE | 12th Grade | Delhi",
    img: "https://randomuser.me/api/portraits/women/44.jpg",
    testimonial: "TutorMitra made complex topics simpler. Tutors are patient and knowledgeable.",
  },
  {
    name: "Yash Verma",
    intro: "NEET Aspirant | 11th Grade | Mumbai",
    img: "https://randomuser.me/api/portraits/men/30.jpg",
    testimonial: "Easy to book sessions and learn at my pace. Highly satisfied!",
  },
  {
    name: "Priya Singh",
    intro: "CBSE | 10th Grade | Hyderabad",
    img: "https://randomuser.me/api/portraits/women/65.jpg",
    testimonial: "Affordable, reliable and clear explanations for tough subjects.",
  },
  {
    name: "Rahul Sharma",
    intro: "Competitive Exams | 12th Grade | Bangalore",
    img: "https://randomuser.me/api/portraits/men/56.jpg",
    testimonial: "Supportive mentors that keep me motivated throughout my preparation.",
  },
];

/* Data for Popular Subjects */
const POPULAR_SUBJECTS = [
  { icon: "➗", label: "Mathematics", bg: "bg-blue-100" },
  { icon: "⚗️", label: "Science", bg: "bg-green-100" },
  { icon: "🔤", label: "Languages", bg: "bg-yellow-100" },
  { icon: "🎨", label: "Arts", bg: "bg-purple-100" },
];

/* Star rating component */
function Star({ filled, onClick }: { filled: boolean; onClick: () => void }) {
  return (
    <svg
      onClick={onClick}
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 20 20"
      fill={filled ? "#FBBF24" : "none"}
      stroke="#FBBF24"
      strokeWidth={1.5}
      className="w-6 h-6 cursor-pointer transition-colors focus:outline-none focus:ring-2 focus:ring-yellow-400 rounded"
      role="button"
      aria-label={filled ? "Star filled" : "Star empty"}
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") onClick();
      }}
    >
      <path d="M10 15l-5.878 3.09 1.124-6.55L.49 6.91l6.561-.954L10 0l2.949 5.957 6.561.954-4.756 4.63 1.124 6.55z" />
    </svg>
  );
}

/* Statistic item component */
function StatItem({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-indigo-900 text-7xl font-extrabold leading-none">{value}</p>
      <p className="text-indigo-700 mt-2 text-xl font-semibold">{label}</p>
    </div>
  );
}

/* Splash Text Animation */
const TYPING_SPEED_MS = 100;
const HEADLINE_TEXT = "Welcome to TutorMitra";

export default function Splash() {
  const navigate = useNavigate();

  const [typedText, setTypedText] = useState("");
  const [isTypingFinished, setIsTypingFinished] = useState(false);

  const [subject, setSubject] = useState("all");
  const [location, setLocation] = useState("");
  const [level, setLevel] = useState("any");

  const [ratings, setRatings] = useState<Record<string, number>>({});

  // Typing effect for splash headline
  useEffect(() => {
    let currentIndex = 0;
    const interval = setInterval(() => {
      setTypedText((prev) => prev + HEADLINE_TEXT[currentIndex]);
      currentIndex++;
      if (currentIndex === HEADLINE_TEXT.length) {
        clearInterval(interval);
        setIsTypingFinished(true);
      }
    }, TYPING_SPEED_MS);
    return () => clearInterval(interval);
  }, []);

  const handleRatingChange = (tutorName: string, value: number) => {
    setRatings((prev) => ({ ...prev, [tutorName]: value }));
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Replace /tutors with your actual tutors page route
    navigate(`/tutors?subject=${subject}&location=${location}&level=${level}`);
  };

  return (
    <div className="min-h-screen bg-gray-50 font-sans text-gray-900 select-none">
      {/* Hero Section */}
      <main
        role="main"
        className="relative flex flex-col items-center justify-center bg-gradient-to-tr from-blue-700 to-indigo-900 text-white py-24 px-6"
      >
        <span className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-yellow-400 opacity-30 rounded-full filter blur-3xl animate-blob animation-delay-4000" />
        <span className="absolute bottom-0 right-10 w-72 h-72 bg-yellow-300 opacity-20 rounded-full filter blur-2xl animate-blob animation-delay-2000" />

        <div
          aria-label="TutorMitra Logo"
          role="img"
          className="mb-8 w-24 h-24 md:w-32 md:h-32 object-contain rounded-full shadow-lg bg-white bg-opacity-10 backdrop-blur-sm flex items-center justify-center scale-95 opacity-0 animate-fade-scale-in"
        >
          {/* Add your logo here, for example: */}
          <img src="/logo.png" alt="TutorMitra Logo" className="w-20 h-20" />
        </div>

        <h1
          tabIndex={0}
          aria-live="polite"
          className="text-4xl sm:text-5xl md:text-6xl font-extrabold text-center leading-tight drop-shadow-md h-[4rem] mb-6"
        >
          {typedText}
          <span aria-hidden="true" className="inline-block w-1 h-10 bg-yellow-400 animate-pulse ml-1" />
        </h1>

        <p
          className={`max-w-lg text-center text-lg sm:text-xl md:text-2xl font-light mb-12 drop-shadow-lg text-gray-100 transition-opacity duration-800 ${
            isTypingFinished ? "opacity-100" : "opacity-0"
          }`}
        >
          Your trusted platform to find the perfect tutor, anytime, anywhere.
        </p>

        <button
          onClick={() => navigate("/welcome")}
          aria-label="Get started with TutorMitra"
          className="bg-yellow-400 hover:bg-yellow-500 focus:bg-yellow-500 focus:outline-none focus:ring-4 focus:ring-yellow-300 focus:ring-offset-2 text-blue-900 font-bold text-lg sm:text-xl py-4 px-16 rounded-lg shadow-lg transition-colors mb-20 inline-flex items-center justify-center animate-fade-scale-in delay-1000"
        >
          Get Started
          <svg
            className="ml-3 -mr-1 h-6 w-6"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            viewBox="0 0 24 24"
            aria-hidden="true"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </main>

      {/* Search Filters Section */}
      <section
        className="max-w-7xl mx-auto px-6 py-12 bg-white rounded-lg shadow-lg -mt-24 relative z-10"
        aria-label="Tutor Search Filters"
      >
        <form
          onSubmit={handleSearchSubmit}
          className="flex flex-wrap justify-center items-center gap-6"
        >
          <select
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            aria-label="Subject filter"
            className="min-w-[160px] px-4 py-3 border rounded focus:outline-none focus:ring-2 focus:ring-yellow-400"
          >
            <option value="all">All Subjects</option>
            <option value="Mathematics">Mathematics</option>
            <option value="Science">Science</option>
            <option value="Languages">Languages</option>
            <option value="Arts">Arts</option>
          </select>

          <input
            aria-label="Location filter"
            placeholder="Enter Location"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            className="min-w-[160px] px-4 py-3 border rounded focus:outline-none focus:ring-2 focus:ring-yellow-400"
          />

          <select
            value={level}
            onChange={(e) => setLevel(e.target.value)}
            aria-label="Level filter"
            className="min-w-[160px] px-4 py-3 border rounded focus:outline-none focus:ring-2 focus:ring-yellow-400"
          >
            <option value="any">Any Level</option>
            <option value="school">School</option>
            <option value="college">College</option>
            <option value="competitive">Competitive Exams</option>
          </select>

          <button
            type="submit"
            className="bg-blue-600 hover:bg-blue-700 text-white px-10 py-3 rounded-lg font-semibold shadow transition-colors"
          >
            Find Tutor
          </button>
        </form>
      </section>

      {/* Student Profiles Section */}
      <section className="max-w-7xl mx-auto px-6 py-12 bg-white rounded-lg shadow-lg mb-20">
        <h2 className="text-4xl font-extrabold text-indigo-900 mb-12 text-center">
          Meet Our Students
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
          {STUDENT_PROFILES.map(({ name, intro, img, testimonial }) => (
            <article
              key={name}
              className="flex flex-col bg-indigo-50 rounded-xl p-6 items-center text-center shadow-md"
            >
              <img
                src={img}
                alt={name}
                className="rounded-full w-28 h-28 object-cover mb-6 shadow-md"
                loading="lazy"
              />
              <h3 className="text-indigo-900 font-bold text-xl mb-1">{name}</h3>
              <p className="text-indigo-700 font-semibold text-sm mb-3">{intro}</p>
              <p className="text-gray-700 italic">{testimonial}</p>
              <div
                className="flex justify-center mt-6 space-x-1"
                role="radiogroup"
                aria-label={`Rate ${name}`}
              >
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star
                    key={star}
                    filled={ratings[name] !== undefined && ratings[name] >= star}
                    onClick={() => handleRatingChange(name, star)}
                  />
                ))}
              </div>
            </article>
          ))}
        </div>
      </section>

      {/* Inspirational Banner */}
      <section className="bg-gradient-to-r from-indigo-800 to-indigo-900 py-20 rounded-lg max-w-6xl mx-auto text-center text-white mb-20 shadow-lg px-6">
        <h2 className="text-4xl font-extrabold max-w-3xl mx-auto">
          One skill can change your life – Start today with TutorMitra
        </h2>
      </section>

      {/* Popular Subjects Section */}
      <section className="max-w-7xl mx-auto px-6 py-12 bg-white rounded-lg shadow-md mb-24">
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-3xl font-extrabold text-indigo-900">Popular Subjects</h2>
          <button
            onClick={() => navigate("/courses")}
            className="text-indigo-700 font-semibold hover:underline"
          >
            View All
          </button>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {POPULAR_SUBJECTS.map(({ icon, label, bg }) => (
            <button
              key={label}
              className={`${bg} rounded-lg p-6 flex flex-col items-center shadow hover:scale-105 transition-transform text-indigo-900 font-semibold text-lg`}
              title={label}
              onClick={() => navigate(`/courses?subject=${label}`)}
            >
              <div className="text-4xl mb-3">{icon}</div>
              {label}
            </button>
          ))}
        </div>
      </section>

      {/* Statistics Section */}
      <section className="max-w-7xl mx-auto px-12 mb-24">
        <div className="bg-white p-12 rounded-lg shadow-lg grid grid-cols-2 md:grid-cols-4 gap-16 text-center">
          <StatItem label="Expert Tutors" value="2,500+" />
          <StatItem label="Happy Students" value="15,000+" />
          <StatItem label="Sessions Completed" value="50,000+" />
          <StatItem label="Average Rating" value="4.9" />
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-black text-gray-300 py-20">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-16 px-6">
          <div>
            <h3 className="text-yellow-400 font-extrabold text-3xl mb-8">Trust & Policy</h3>
            <ul className="space-y-6 text-lg leading-relaxed">
              <li>
                <strong>Privacy & Data Protection:</strong> Your personal data is secured with industry-standard encryption.
              </li>
              <li>
                <strong>Safe Learning Environment:</strong> Tutors are verified and reviewed carefully for your safety.
              </li>
              <li>
                <strong>Transparent Payments:</strong> Secure payments for students with instant tutor payouts.
              </li>
              <li>
                <strong>Community Commitment:</strong> We foster honesty, motivation, and growth for a smarter future.
              </li>
            </ul>
          </div>
          <div>
            <h3 className="text-yellow-400 font-extrabold text-3xl mb-8">Contact Us</h3>
            <ul className="space-y-6 text-indigo-400 text-lg">
              <li>
                <a
                  href="mailto:tutorsupport@example.com"
                  className="flex items-center gap-3 hover:underline"
                >
                  <span>📧</span> tutorsupport@example.com
                </a>
              </li>
              <li>
                <a
                  href="tel:+917068003894"
                  className="flex items-center gap-3 hover:underline"
                >
                  <span>📞</span> +91 7068 003894
                </a>
              </li>
              <li>
                <a
                  href="https://wa.me/917068003894"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 hover:underline"
                >
                  <span>💬</span> WhatsApp: +91 7068 003894
                </a>
              </li>
              <li>
                <a href="#" target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 hover:underline">
                  <span>📸</span> Instagram
                </a>
              </li>
              <li>
                <a href="#" target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 hover:underline">
                  <span>🐦</span> Twitter
                </a>
              </li>
              <li>
                <a href="#" target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 hover:underline">
                  <span>🔗</span> LinkedIn
                </a>
              </li>
            </ul>
            <div className="mt-16 text-center text-gray-500 text-sm">© 2025 TutorMitra · All Rights Reserved</div>
          </div>
        </div>
      </footer>

      {/* Animation Styles */}
      <style>{`
        @keyframes fadeScaleIn {
          0% { opacity: 0; transform: scale(0.95);}
          100% { opacity: 1; transform: scale(1);}
        }
        .animate-fade-scale-in {
          animation: fadeScaleIn 1s ease forwards;
        }
        @keyframes blob {
          0%, 100% {transform: translate(0px, 0px) scale(1);}
          33% {transform: translate(30px, -20px) scale(1.2);}
          66% {transform: translate(-20px, 30px) scale(0.8);}
        }
        .animate-blob {
          animation: blob 7s infinite;
        }
        .animation-delay-2000 {
          animation-delay: 2s;
        }
        .animation-delay-4000 {
          animation-delay: 4s;
        }
      `}</style>
    </div>
  );
}
