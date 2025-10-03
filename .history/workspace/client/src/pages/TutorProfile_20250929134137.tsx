import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { useAuth } from "../store/AuthProvider";
import {
  FaLinkedin, FaInstagram, FaWhatsapp, FaShieldAlt, FaStar,
  FaMapMarkerAlt, FaClock, FaGraduationCap, FaRupeeSign,
  FaCalendarAlt, FaPhone, FaEnvelope, FaBookOpen,
  FaUsers, FaAward, FaHeart, FaShare
} from "react-icons/fa";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:3000/api";

interface Tutor {
  _id: string;
  userId?: {
    _id: string;
    name: string;
    email: string;
    bio?: string;
    city?: string;
    profileImage?: string;
  };
  name?: string;
  bio?: string;
  subjects?: string[] | string;
  experience?: number;
  feePerHour?: number;
  mode?: string;
  city?: string;
  phone?: string;
  email?: string;
  linkedin?: string;
  instagram?: string;
  whatsapp?: string;
  policeVerified?: boolean;
  slots?: string[];
  rating?: number;
  totalStudents?: number;
  completedSessions?: number;
  responseTime?: string;
  languages?: string[];
  achievements?: string[];
  profileImage?: string;
  createdAt?: string;
}

function parseSubjects(subjects: string[] | string | undefined): string[] {
  if (!subjects) return [];
  if (Array.isArray(subjects)) return subjects;
  try {
    let s = subjects.replace(/\\+/g, "");
    if (s[0] !== "[" && s[s.length - 1] !== "]") s = "[" + s + "]";
    const arr = JSON.parse(s);
    if (Array.isArray(arr)) return arr.map((v: any) => String(v).replace(/['"]+/g, "").trim()).filter(Boolean);
  } catch {}
  return subjects.replace(/[\[\]'"]+/g, "").split(",").map((s: string) => s.trim()).filter(Boolean);
}

function getInitialsAvatar(name?: string, size = 140) {
  if (!name) return `https://ui-avatars.com/api/?name=TM&background=0F4C75&color=fff&size=${size}&font-size=0.4`;
  const words = name.split(" ");
  const initials = (words[0]?.[0] || "") + (words[1]?.[0] || words[0]?.[1] || "");
  return `https://ui-avatars.com/api/?name=${initials.toUpperCase()}&background=0F4C75&color=fff&size=${size}&font-size=0.4`;
}

function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-1">
      {[...Array(5)].map((_, i) => (
        <FaStar key={i} className={`${i < rating ? 'text-yellow-400' : 'text-gray-300'} text-lg`} />
      ))}
      <span className="ml-2 text-sm font-semibold text-gray-600">{rating}/5</span>
    </div>
  );
}

export default function TutorProfile() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [tutor, setTutor] = useState<Tutor | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isFavorite, setIsFavorite] = useState(false);
  const [myBooking, setMyBooking] = useState<{ canChat: boolean; privateDetailsUnlocked: boolean } | null>(null);
  const { user } = useAuth();

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    setError(null);
    const fetchTutor = async () => {
      try {
        const token = localStorage.getItem("tm_token");
        const res = await axios.get(`${API_BASE_URL}/tutors/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const tutorData = res.data.tutor || res.data.data || res.data;
        const enhancedTutor = {
          ...tutorData,
          rating: tutorData.rating || 4.5,
          totalStudents: tutorData.totalStudents || 150,
          completedSessions: tutorData.completedSessions || 500,
          responseTime: tutorData.responseTime || "Within 2 hours",
          languages: tutorData.languages || ["Hindi", "English"],
          achievements: tutorData.achievements || ["Top Rated Teacher", "Expert in Math"]
        };
        setTutor(enhancedTutor);
      } catch (err: any) {
        setError(
          err?.response?.data?.error ||
          err?.response?.data?.message ||
          "Failed to fetch tutor profile (API or network error)."
        );
      } finally {
        setLoading(false);
      }
    };
    fetchTutor();
  }, [id]);

  // Booking status unlock chat/details
  useEffect(() => {
    if (!id) return;
    const token = localStorage.getItem("tm_token");
    fetch(`${API_BASE_URL}/bookings/my-booking-with-tutor/${id}`, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(res => setMyBooking(res.data || null))
      .catch(() => setMyBooking(null));
  }, [id]);

  const handleBooking = (type = "tutor") => {
    if (!tutor?._id) {
      alert("Sorry, booking is not available at the moment.");
      return;
    }
    navigate(`/booking/${tutor._id}?type=${type}`);
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-24 space-y-4">
        <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
        <div className="text-2xl font-bold text-blue-600 animate-pulse">Loading tutor profile...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 to-red-100">
        <div className="text-center p-12 bg-white rounded-3xl shadow-2xl border border-red-200">
          <div className="text-6xl text-red-500 mb-4">⚠️</div>
          <h2 className="text-2xl font-bold text-red-700 mb-4">Oops! Something went wrong</h2>
          <p className="text-red-600 mb-8">{error}</p>
          <div className="space-x-4">
            <button onClick={() => navigate(-1)} className="px-8 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-bold rounded-full shadow-lg hover:shadow-xl transform hover:scale-105 transition-all">← Go Back</button>
            <button onClick={() => window.location.reload()} className="px-8 py-3 bg-gradient-to-r from-green-600 to-teal-600 text-white font-bold rounded-full shadow-lg hover:shadow-xl transform hover:scale-105 transition-all">Try Again</button>
          </div>
        </div>
      </div>
    );
  }

  if (!tutor) {
    return (
      <div className="text-center py-24 bg-gradient-to-br from-gray-50 to-gray-100 min-h-screen flex items-center justify-center">
        <div className="bg-white p-16 rounded-3xl shadow-2xl">
          <div className="text-8xl mb-6">🔍</div>
          <h2 className="text-3xl font-bold text-gray-700 mb-4">Tutor Not Found</h2>
          <p className="text-gray-500 mb-8">The tutor profile you're looking for doesn't exist.</p>
          <button onClick={() => navigate(-1)} className="px-8 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-bold rounded-full shadow-lg hover:shadow-xl transform hover:scale-105 transition-all">← Back to Search</button>
        </div>
      </div>
    );
  }

  const tutorName = tutor.name || tutor.userId?.name || "Tutor";
  const tutorCity = tutor.city || tutor.userId?.city || "Location not specified";
  const tutorBio = tutor.bio || tutor.userId?.bio || "";
  const subjects = parseSubjects(tutor.subjects);
  const imagePath = tutor.userId?.profileImage || tutor.profileImage || "";
  const tutorProfileImage = imagePath
    ? (imagePath.startsWith("http")
        ? `${imagePath}?t=${Date.now()}`
        : `http://localhost:3000${imagePath}?t=${Date.now()}`)
    : getInitialsAvatar(tutorName);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 py-8 px-4">
      <div className="max-w-5xl mx-auto">
        {/* Header Section */}
        <div className="relative bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 rounded-3xl p-8 mb-8 text-white overflow-hidden">
          {/* Decorative Background */}
          <div className="absolute top-0 right-0 w-96 h-96 bg-white opacity-10 rounded-full -mr-48 -mt-48"></div>
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-white opacity-10 rounded-full -ml-32 -mb-32"></div>
          {/* TutorMitra Badge */}
          <div className="absolute top-4 right-4 bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full">
            <span className="text-white font-bold text-sm">🎓 TutorMitra</span>
          </div>
          {/* Main Profile Section */}
          <div className="relative z-10 flex flex-col lg:flex-row items-center gap-8">
            <div className="relative">
              <img src={tutorProfileImage} alt="Profile" className="w-32 h-32 lg:w-40 lg:h-40 rounded-full border-4 border-white shadow-2xl object-cover bg-white" loading="lazy" />
              {tutor.policeVerified && (
                <div className="absolute -bottom-2 -right-2 bg-green-500 text-white p-3 rounded-full shadow-lg">
                  <FaShieldAlt className="text-lg" />
                </div>
              )}
            </div>
            <div className="flex-1 text-center lg:text-left">
              <h1 className="text-4xl lg:text-5xl font-black mb-2">{tutorName}</h1>
              <div className="flex flex-wrap items-center justify-center lg:justify-start gap-4 mb-4">
                <span className="flex items-center gap-2 bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full">
                  <FaMapMarkerAlt />
                  {tutorCity}
                </span>
                {tutor.rating && (
                  <div className="bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full">
                    <StarRating rating={tutor.rating} />
                  </div>
                )}
              </div>
              <p className="text-lg opacity-90 mb-6 max-w-2xl">{tutorBio || "Passionate educator committed to student success"}</p>
              {/* Action Buttons */}
              <div className="flex flex-wrap gap-4 justify-center lg:justify-start">
                <button
                  onClick={() => setIsFavorite(!isFavorite)}
                  className={`flex items-center gap-2 px-6 py-3 rounded-full font-semibold transition-all transform hover:scale-105 ${
                    isFavorite
                      ? 'bg-red-500 text-white shadow-lg'
                      : 'bg-white/20 backdrop-blur-sm text-white hover:bg-white/30'
                  }`}
                >
                  <FaHeart className={isFavorite ? 'text-white' : 'text-red-300'} />
                  {isFavorite ? 'Favorited' : 'Add to Favorites'}
                </button>
                <button className="flex items-center gap-2 px-6 py-3 bg-white/20 backdrop-blur-sm text-white rounded-full font-semibold hover:bg-white/30 transition-all transform hover:scale-105">
                  <FaShare />
                  Share Profile
                </button>
              </div>
            </div>
          </div>
        </div>
        {/* GRID MAIN */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Quick Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-shadow border border-gray-100">
                <div className="text-3xl text-blue-500 mb-2"><FaUsers /></div>
                <div className="text-2xl font-bold text-gray-800">{tutor.totalStudents}+</div>
                <div className="text-sm text-gray-600">Students Taught</div>
              </div>
              <div className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-shadow border border-gray-100">
                <div className="text-3xl text-green-500 mb-2"><FaBookOpen /></div>
                <div className="text-2xl font-bold text-gray-800">{tutor.completedSessions}+</div>
                <div className="text-sm text-gray-600">Sessions Done</div>
              </div>
              <div className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-shadow border border-gray-100">
                <div className="text-3xl text-purple-500 mb-2"><FaClock /></div>
                <div className="text-2xl font-bold text-gray-800">{tutor.experience || 0}+</div>
                <div className="text-sm text-gray-600">Years Exp.</div>
              </div>
              <div className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-shadow border border-gray-100">
                <div className="text-3xl text-yellow-500 mb-2"><FaAward /></div>
                <div className="text-2xl font-bold text-gray-800">4.8</div>
                <div className="text-sm text-gray-600">Avg Rating</div>
              </div>
            </div>
            {/* Subjects */}
            <div className="bg-white rounded-3xl p-8 shadow-lg border border-gray-100">
              <h3 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-3">
                <FaGraduationCap className="text-blue-500" />
                Subjects & Expertise
              </h3>
              <div className="flex flex-wrap gap-3">
                {subjects.map((subject, index) => (
                  <span key={index}
                    className="px-4 py-2 bg-gradient-to-r from-blue-100 to-purple-100 text-blue-800 rounded-full font-medium text-sm border border-blue-200 hover:from-blue-200 hover:to-purple-200 transition-all cursor-default">
                    #{subject}
                  </span>
                ))}
              </div>
            </div>
            {/* Teaching Info */}
            <div className="bg-white rounded-3xl p-8 shadow-lg border border-gray-100">
              <h3 className="text-2xl font-bold text-gray-800 mb-6">Teaching Details</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-blue-100 rounded-full">
                    <FaRupeeSign className="text-blue-600 text-xl" />
                  </div>
                  <div>
                    <div className="font-semibold text-gray-700">Fee per Hour</div>
                    <div className="text-2xl font-bold text-green-600">₹{tutor.feePerHour || "500"}</div>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-green-100 rounded-full">
                    <FaClock className="text-green-600 text-xl" />
                  </div>
                  <div>
                    <div className="font-semibold text-gray-700">Response Time</div>
                    <div className="text-lg font-bold text-gray-800">{tutor.responseTime}</div>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-purple-100 rounded-full">
                    <FaCalendarAlt className="text-purple-600 text-xl" />
                  </div>
                  <div>
                    <div className="font-semibold text-gray-700">Teaching Mode</div>
                    <div className="text-lg font-bold text-gray-800">{tutor.mode || "Both Online & Offline"}</div>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-yellow-100 rounded-full">
                    <FaUsers className="text-yellow-600 text-xl" />
                  </div>
                  <div>
                    <div className="font-semibold text-gray-700">Languages</div>
                    <div className="text-lg font-bold text-gray-800">{tutor.languages?.join(", ")}</div>
                  </div>
                </div>
              </div>
            </div>
            {/* Available Slots */}
            {tutor.slots && tutor.slots.length > 0 && (
              <div className="bg-white rounded-3xl p-8 shadow-lg border border-gray-100">
                <h3 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-3">
                  <FaClock className="text-green-500" />
                  Available Time Slots
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {tutor.slots.map((slot, index) => (
                    <div key={index} className="p-3 bg-green-50 border border-green-200 rounded-xl text-center">
                      <div className="font-semibold text-green-700">{slot}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
          {/* Sidebar Booking/Chat */}
          <div className="space-y-6">
            <div className="bg-white rounded-3xl p-6 shadow-lg border border-gray-100 sticky top-6">
              <h3 className="text-xl font-bold mb-6">Book Your Session</h3>
              {myBooking?.canChat && myBooking?.privateDetailsUnlocked ? (
                <div>
                  <div className="p-4 bg-green-50 border border-green-200 rounded-2xl mb-4">
                    <div className="text-green-700 font-bold mb-2">✅ Booking Confirmed!</div>
                    <div className="text-sm text-green-600">You can now contact your tutor directly</div>
                  </div>
                  <div className="space-y-3">
                    <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-xl">
                      <FaPhone className="text-blue-600" />
                      <div>
                        <div className="font-semibold text-blue-700">Phone</div>
                        <a href={`tel:${tutor.phone}`} className="text-blue-600 hover:underline">
                          {tutor.phone || "Not provided"}
                        </a>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 p-3 bg-purple-50 rounded-xl">
                      <FaEnvelope className="text-purple-600" />
                      <div>
                        <div className="font-semibold text-purple-700">Email</div>
                        <a href={`mailto:${tutor.email || tutor.userId?.email}`} className="text-purple-600 hover:underline text-sm">
                          {tutor.email || tutor.userId?.email || "Not provided"}
                        </a>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 p-3 bg-green-50 rounded-xl">
                      <FaWhatsapp className="text-green-600" />
                      <div>
                        <div className="font-semibold text-green-700">WhatsApp</div>
                        <span>{tutor.whatsapp || "Not provided"}</span>
                      </div>
                    </div>
                  </div>
                  <button
                    disabled={!user || !tutor.userId?._id}
                    onClick={() => {
                      if (user && tutor.userId?._id) {
                        navigate(`/chat/${user._id || user.id}/${tutor.userId._id || tutor._id}`);
                      }
                    }}
                    className={`w-full py-3 mt-4 ${( !user || !tutor.userId?._id
                      ? "bg-gray-300 text-gray-600 cursor-not-allowed"
                      : "bg-green-600 text-white hover:bg-green-700"
                    )} rounded-xl shadow-lg transition`}
                  >
                    💬 Start Chat
                  </button>
                </div>
              ) : (
                <div>
                  <button
                    onClick={() => handleBooking("tutor")}
                    className="w-full py-4 mb-3 bg-blue-600 text-white rounded-xl shadow-lg hover:bg-blue-700 transition"
                  >
                    📚 Book Regular - ₹{tutor.feePerHour || 500}/hr
                  </button>
                  <button
                    onClick={() => handleBooking("trial")}
                    className="w-full py-3 bg-yellow-500 text-white rounded-xl hover:bg-yellow-600 transition mb-3"
                  >
                    🆓 Book Trial (3 days)
                  </button>
                  <button
                    disabled
                    className="w-full py-3 bg-gray-300 text-gray-600 cursor-not-allowed rounded-xl"
                  >
                    💬 Chat (Available after booking)
                  </button>
                  <p className="mt-2 text-center text-gray-500 text-sm italic">
                    Contact details unlock after booking & payment.
                  </p>
                </div>
              )}
            </div>
            {/* Social Links */}
            {(tutor.linkedin || tutor.instagram || tutor.whatsapp) && (
              <div className="bg-white rounded-3xl p-6 shadow-lg border border-gray-100">
                <h3 className="text-xl font-bold text-gray-800 mb-4">Connect Socially</h3>
                <div className="flex justify-center gap-4">
                  {tutor.linkedin && (
                    <a href={tutor.linkedin} target="_blank" rel="noopener noreferrer"
                      className="p-4 bg-blue-100 text-blue-600 rounded-full hover:bg-blue-200 transition-colors transform hover:scale-110">
                      <FaLinkedin className="text-2xl" />
                    </a>
                  )}
                  {tutor.instagram && (
                    <a href={tutor.instagram} target="_blank" rel="noopener noreferrer"
                      className="p-4 bg-pink-100 text-pink-600 rounded-full hover:bg-pink-200 transition-colors transform hover:scale-110">
                      <FaInstagram className="text-2xl" />
                    </a>
                  )}
                  {tutor.whatsapp && (
                    <a href={`https://wa.me/${tutor.whatsapp.replace(/\D/g, "")}`} target="_blank" rel="noopener noreferrer"
                      className="p-4 bg-green-100 text-green-600 rounded-full hover:bg-green-200 transition-colors transform hover:scale-110">
                      <FaWhatsapp className="text-2xl" />
                    </a>
                  )}
                </div>
              </div>
            )}
            {/* Achievements */}
            {tutor.achievements && tutor.achievements.length > 0 && (
              <div className="bg-white rounded-3xl p-6 shadow-lg border border-gray-100">
                <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                  <FaAward className="text-yellow-500" />
                  Achievements
                </h3>
                <div className="space-y-2">
                  {tutor.achievements.map((achievement, index) => (
                    <div key={index} className="flex items-center gap-3 p-3 bg-yellow-50 border border-yellow-200 rounded-xl">
                      <div className="text-yellow-500">🏆</div>
                      <div className="font-semibold text-yellow-700">{achievement}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
        {/* Back Button */}
        <div className="mt-12 text-center">
          <button
            onClick={() => navigate(-1)}
            className="px-8 py-4 bg-gradient-to-r from-gray-600 to-gray-700 text-white font-bold rounded-full shadow-lg hover:shadow-xl transform hover:scale-105 transition-all"
          >
            ← Back to Search
          </button>
        </div>
      </div>
    </div>
  );
}
