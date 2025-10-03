import React from "react";
import { useNavigate } from "react-router-dom";

const FEATURED_TUTORS = [
  { name: "Arun Mishra", subject: "Maths", area: "Ghaziabad", rating: 4.9, img: "https://randomuser.me/api/portraits/men/34.jpg" },
  { name: "Sonal Mehta", subject: "Biology", area: "Lucknow", rating: 4.8, img: "https://randomuser.me/api/portraits/women/65.jpg" },
  { name: "Rajesh Singh", subject: "Physics", area: "Jaipur", rating: 4.7, img: "https://randomuser.me/api/portraits/men/58.jpg" },
];

const STUDENT_REVIEWS = [
  { name: "Ananya", area: "Delhi", text: "Best mentor, concepts crystal clear!", rating: 5 },
  { name: "Yash", area: "Mumbai", text: "Ghar par coaching, flexible time slot. Professional!", rating: 4.8 },
  { name: "Priya", area: "Hyderabad", text: "Paise sahi, results guarantee. Thank you TutorMitra!", rating: 4.7 },
];

const STATS = [
  { label: "Tutors Available", value: "3,500+" },
  { label: "Successful Sessions", value: "22,000+" },
  { label: "Offline Cities", value: "48" },
  { label: "Avg. Rating", value: "4.9★" },
];

export default function Home() {
  const navigate = useNavigate();

  return (
    <section className="min-h-screen bg-gradient-to-br from-blue-100 via-white to-yellow-100 flex flex-col pb-16">

      {/* Hero Section */}
      <header className="flex flex-col items-center justify-center px-6 pt-12 pb-8">
        <h1 className="text-5xl font-extrabold text-indigo-900 text-center leading-snug mb-4 font-montserrat"
          style={{ fontFamily: "Montserrat, sans-serif" }}>
          India’s Trusted <span className="text-yellow-500">Offline Tutors</span> Platform
        </h1>
        <p className="text-xl text-indigo-700 text-center max-w-2xl mb-6 font-semibold">
          “Seekho. Sikhao. Badho.”<br />
          Paas wala coach ghar tak, paise ka options, mentorship guaranteed.
        </p>
        <div className="flex gap-7 mt-2">
          <button
            onClick={() => navigate("/signup?role=student")}
            className="bg-indigo-700 text-white font-bold px-10 py-3 rounded-2xl shadow hover:bg-indigo-800 transition text-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            aria-label="Sign up as student"
          >
            I am Student
          </button>
          <button
            onClick={() => navigate("/signup?role=tutor")}
            className="bg-white text-indigo-900 border-2 border-yellow-400 font-bold px-10 py-3 rounded-2xl shadow hover:bg-yellow-200 transition text-lg focus:outline-none focus:ring-2 focus:ring-yellow-300"
            aria-label="Sign up as tutor"
          >
            Become a Tutor
          </button>
        </div>
        <p className="text-sm text-indigo-700 mt-4 italic max-w-sm text-center">
          Apna talent sikhao, ghar baith ke paise kamayen — part time/full time for local students.
        </p>
      </header>

      {/* Stats Banner */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-5xl w-full mx-auto mt-8 mb-4 bg-white/60 rounded-2xl p-6 shadow-lg">
        {STATS.map(({ label, value }) => (
          <div key={label} className="text-center" role="region" aria-label={label}>
            <div className="text-3xl font-bold text-yellow-500">{value}</div>
            <div className="text-indigo-900 font-semibold mt-1 text-lg">{label}</div>
          </div>
        ))}
      </div>

      {/* Search Tutors Section */}
      <div
        className="max-w-3xl mx-auto bg-white/90 rounded-2xl p-8 shadow-lg flex flex-col items-center my-10"
        role="search"
        aria-label="Search tutors"
      >
        <h2 className="text-xl font-bold text-indigo-900 mb-4">Find Best Tutor In Your Area</h2>
        <form
          className="flex flex-wrap gap-4 w-full justify-center"
          onSubmit={(e) => {
            e.preventDefault();
            navigate("/tutors");
          }}
        >
          <input
            type="text"
            placeholder="Subject"
            className="py-3 px-5 rounded-xl border focus:ring focus:ring-yellow-400 w-40"
            aria-label="Subject"
          />
          <input
            type="text"
            placeholder="Location/Area"
            className="py-3 px-5 rounded-xl border focus:ring focus:ring-yellow-400 w-40"
            aria-label="Location or area"
          />
          <select
            aria-label="Select level/class"
            className="py-3 px-5 rounded-xl border focus:ring focus:ring-yellow-400 w-40"
          >
            <option value="">Level/Class</option>
            <option value="10th">10th</option>
            <option value="12th">12th</option>
            <option value="JEE">JEE</option>
            <option value="NEET">NEET</option>
            <option value="CBSE">CBSE</option>
          </select>
          <button
            type="submit"
            className="bg-yellow-400 text-indigo-900 px-10 py-3 rounded-xl font-bold shadow hover:bg-yellow-500 transition focus:outline-none focus:ring-2 focus:ring-yellow-300"
            aria-label="Search tutors"
          >
            Search
          </button>
        </form>
      </div>

      {/* Featured Tutors Section */}
      <div
        className="max-w-5xl w-full mx-auto grid grid-cols-1 md:grid-cols-3 gap-8 px-6 mb-12"
        aria-label="Featured tutors"
      >
        {FEATURED_TUTORS.map((tutor) => (
          <article
            key={tutor.name}
            className="bg-white rounded-2xl shadow-lg p-7 flex flex-col items-center transition-transform transform hover:scale-105 group focus-within:ring-4 focus-within:ring-yellow-300"
            tabIndex={0}
            aria-describedby={`tutor-description-${tutor.name.replace(/\s/g, "")}`}
          >
            <img
              src={tutor.img}
              alt={`Photo of ${tutor.name}`}
              className="w-24 h-24 rounded-full border-4 border-yellow-400 mb-4 object-cover shadow-md"
              loading="lazy"
            />
            <h3 className="text-xl font-bold text-indigo-900 group-hover:text-indigo-700 mb-1">{tutor.name}</h3>
            <p id={`tutor-description-${tutor.name.replace(/\s/g, "")}`} className="text-indigo-700 font-semibold">
              {tutor.subject} — {tutor.area}
            </p>
            <div className="mt-2 text-yellow-500 font-extrabold text-lg" aria-label={`Rating ${tutor.rating} stars`}>
              ★ {tutor.rating}
            </div>
            <button
              onClick={() => navigate(`/tutor-profile/${encodeURIComponent(tutor.name)}`)}
              className="mt-5 px-6 py-2 bg-indigo-700 text-white font-semibold rounded-xl shadow hover:bg-indigo-800 transition focus:outline-none focus:ring-2 focus:ring-indigo-600"
              aria-label={`View profile of ${tutor.name}`}
            >
              See Profile
            </button>
          </article>
        ))}
      </div>

      <div className="flex justify-center mb-12">
        <button
          onClick={() => navigate("/tutors")}
          className="bg-yellow-400 px-10 py-3 rounded-xl shadow font-bold text-indigo-900 hover:bg-yellow-500 transition focus:outline-none focus:ring-2 focus:ring-yellow-300"
          aria-label="View all tutors"
        >
          View All Tutors
        </button>
      </div>

      {/* Student Reviews Section */}
      <section
        className="max-w-5xl mx-auto mb-14 px-6"
        aria-label="Student success stories"
      >
        <h2 className="text-2xl font-bold text-indigo-900 mb-6">Student Success Stories</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {STUDENT_REVIEWS.map((review) => (
            <blockquote
              key={review.name}
              className="bg-indigo-50 rounded-2xl shadow p-6 flex flex-col items-center focus-within:ring-4 focus-within:ring-yellow-300"
              tabIndex={0}
            >
              <p className="italic text-indigo-900 font-medium mb-3" aria-label={`Review by ${review.name}`}>
                "{review.text}"
              </p>
              <footer className="text-lg font-semibold text-indigo-700">{review.name} ({review.area})</footer>
              <div className="mt-2 text-yellow-500 font-bold" aria-label={`Rating ${review.rating} stars`}>
                ★ {review.rating}
              </div>
            </blockquote>
          ))}
        </div>
        <div className="text-center mt-6">
          <button
            onClick={() => navigate("/reviews")}
            className="bg-indigo-700 px-7 py-3 rounded-xl font-bold shadow text-white hover:bg-indigo-900 transition focus:outline-none focus:ring-2 focus:ring-indigo-600"
            aria-label="See all reviews"
          >
            See All Reviews
          </button>
        </div>
      </section>

      {/* Inspiration Banner */}
      <section
        className="bg-gradient-to-br from-indigo-800 via-purple-400 to-yellow-200 rounded-2xl py-12 px-6 max-w-4xl mx-auto text-center mb-12 shadow-lg"
        aria-label="Inspiration banner"
      >
        <h2 className="text-2xl font-extrabold text-white mb-2">“Apne Sapno ko Udaan do!”</h2>
        <p className="text-white text-lg font-semibold">
          Jo Seekhna hai — pao expert coaching.<br />
          Jo Sikhaana hai — talent se paise kamayen, ghar baith kaam.
        </p>
      </section>
    </section>
  );
}
