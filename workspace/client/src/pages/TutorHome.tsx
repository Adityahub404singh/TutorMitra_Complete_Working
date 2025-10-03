import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { io, Socket } from "socket.io-client";
import { useAuth } from "../store/AuthProvider";

import {
  UserCircle,
  CalendarDays,
  TrendingUp,
  Star,
  Bell,
  ArrowRight,
  CheckCircle,
  CalendarCheck,
  Edit,
  Plus,
} from "lucide-react";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";
const SOCKET_SERVER_URL = API_BASE_URL;

interface Notification {
  id: number;
  message: string;
  icon: React.ReactNode;
}
interface Activity {
  id: number;
  content: string;
  icon: React.ReactNode;
}
interface Stats {
  label: string;
  value: number | string;
  icon: React.ReactNode;
}
interface ChatRequest {
  id: string;
  studentId: string;
  studentName: string;
  message: string;
  time: string;
}

export default function TutorHome() {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [stats, setStats] = useState<Stats[]>([
    { label: "Total Students", value: 12, icon: <UserCircle className="h-6 w-6 text-indigo-600" /> },
    { label: "Sessions Completed", value: 48, icon: <TrendingUp className="h-6 w-6 text-yellow-500" /> },
    { label: "Avg. Rating", value: "4.9", icon: <Star className="h-6 w-6 text-yellow-400" /> },
    { label: "Active Bookings", value: 4, icon: <CalendarDays className="h-6 w-6 text-green-500" /> },
  ]);
  const [notifications, setNotifications] = useState<Notification[]>([
    { id: 1, message: "You received a new booking request", icon: <Bell className="text-yellow-500 w-5" /> },
    { id: 2, message: "New review from student Priya", icon: <Star className="text-yellow-400 w-5" /> },
    { id: 3, message: "Profile approved by admin", icon: <CheckCircle className="text-green-500 w-5" /> },
  ]);
  const [recentActivity, setRecentActivity] = useState<Activity[]>([
    { id: 1, content: "You completed a session with Aman", icon: <CalendarCheck className="text-blue-500 w-5" /> },
    { id: 2, content: "Updated your available slots", icon: <UserCircle className="text-indigo-600 w-5" /> },
    { id: 3, content: "Accepted booking for Physics on Sep 2", icon: <ArrowRight className="text-green-600 w-5" /> },
  ]);
  const [chatRequests, setChatRequests] = useState<ChatRequest[]>([]);
  const [socket, setSocket] = useState<Socket | null>(null);
  
  // New state for KYC status
  const [kycStatus, setKycStatus] = useState<string | null>(null);

  useEffect(() => {
    const tutorId = localStorage.getItem("tm_user_id");
    const token = localStorage.getItem("tm_token");
    if (!tutorId || !token) return;

    // Fetch tutor profile to get KYC status
    fetch(`${API_BASE_URL}/tutors/profile`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then((res) => res.json())
      .then((data) => {
        // Adjust 'kycStatus' field name as per backend response
        if(data && data.kycStatus) {
          setKycStatus(data.kycStatus);
        }
      })
      .catch(err => {
        console.error("Failed to fetch profile for KYC check:", err);
      });

    const socketIo = io(SOCKET_SERVER_URL, {
      transports: ["websocket"],
      auth: { token },
      query: { userId: tutorId },
    });

    setSocket(socketIo);

    socketIo.on("connect", () => {
      console.log("[TutorHome] Socket connected:", socketIo.id);
      socketIo.emit("register", tutorId);
    });

    socketIo.on("connect_error", (err) => {
      console.error("[TutorHome] Socket error:", err);
      toast.error("Socket connection failed. Please refresh.");
    });

    socketIo.on("chatRequest", (req: ChatRequest) => {
      setChatRequests((prev) => [req, ...prev]);
      toast.info(`New chat request from ${req.studentName}`);
    });

    socketIo.emit("getChatRequestsForTutor", tutorId, (pending: ChatRequest[]) => {
      if (pending?.length) setChatRequests(pending);
    });

    socketIo.on("notification", (n: Notification) => {
      setNotifications((prev) => [n, ...prev]);
      toast.info(n.message);
    });

    socketIo.on("statsUpdate", (updatedStats: Stats[]) => setStats(updatedStats));
    socketIo.on("activityUpdate", (activity: Activity) =>
      setRecentActivity((prev) => [activity, ...prev])
    );

    return () => {
      socketIo.disconnect();
    };
  }, []);

  return (
    <main className="max-w-7xl mx-auto p-8 space-y-12 font-sans">
      {/* Show KYC incomplete banner */}
      {kycStatus !== "verified" && (
        <section
          className="bg-yellow-100 border-l-4 border-yellow-400 text-yellow-700 p-4 rounded shadow-md"
          role="alert"
          aria-live="polite"
        >
          <p>
            Your KYC verification is pending. Please complete your KYC to unlock all features.
          </p>
          <button
            onClick={() => navigate("/kyc/upload")}
            className="mt-2 px-4 py-2 bg-yellow-500 text-yellow-900 font-semibold rounded hover:bg-yellow-600"
            aria-label="Complete KYC Verification"
          >
            Complete KYC Now
          </button>
        </section>
      )}

      {/* Top Action Buttons Section */}
      <section className="flex flex-wrap justify-center gap-4 mb-8">
        <button
          onClick={() => navigate("/edit-profile")}
          className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 px-6 rounded shadow transition focus:outline-none focus:ring-2 focus:ring-indigo-500"
          aria-label="Edit Profile"
        >
          <Edit size={20} /> Edit Profile
        </button>
        <button
          onClick={() => navigate("/add-course")}
          className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white font-semibold py-3 px-6 rounded shadow transition focus:outline-none focus:ring-2 focus:ring-green-500"
          aria-label="Add Course"
        >
          <Plus size={20} /> Add Course
        </button>
      </section>

      {/* Chat Requests Panel */}
      {chatRequests.length > 0 && (
        <section aria-label="Chat Requests" className="mb-8">
          <h2 className="text-2xl font-bold text-indigo-700 mb-6 border-b border-yellow-400 w-max pb-1">
            Chat Requests
          </h2>
          <ul className="space-y-3 max-w-4xl mx-auto">
            {chatRequests.map(({ id, studentId, studentName, message, time }) => (
              <li
                key={id}
                className="bg-indigo-50 border-l-8 border-yellow-400 p-5 flex flex-col sm:flex-row items-center gap-5 rounded-lg shadow hover:shadow-lg"
              >
                <div className="flex-1 min-w-0">
                  <div className="text-indigo-800 font-bold">
                    {studentName}
                    <span className="ml-2 text-xs text-slate-400 font-normal">
                      {new Date(time).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                  </div>
                  <div className="text-indigo-600 text-sm mt-1 break-words">{message}</div>
                </div>
                <button
                  onClick={() => navigate(`/chat/${studentId}/${user?._id || user?.id}`)}
                  className="bg-yellow-500 hover:bg-yellow-600 text-white font-semibold px-5 py-2 rounded-lg shadow transition focus:outline-none focus:ring-2 focus:ring-yellow-400"
                  aria-label={`Reply to ${studentName}`}
                >
                  Open Chat
                </button>
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* Welcome Section */}
      <section className="text-center">
        <h1 className="text-5xl font-extrabold text-indigo-700 mb-4 drop-shadow-lg tracking-tight animate-fade-in">
          Empower The Future 🌟
        </h1>
        <p className="text-xl font-semibold text-yellow-700 opacity-90 max-w-3xl mx-auto animate-fade-in delay-100">
          Your dedication shapes young minds — keep raising the bar high!
        </p>
      </section>

      {/* Stats Cards Section */}
      <section
        className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8"
        aria-label="Statistics Cards"
      >
        {stats.map(({ label, value, icon }) => (
          <div
            key={label}
            className="flex items-center gap-4 bg-gradient-to-br from-indigo-100 to-yellow-100 p-6 rounded-xl shadow-lg border border-indigo-300 hover:shadow-2xl transition-shadow duration-300"
            role="region"
            aria-label={label}
          >
            <div className="bg-indigo-300 p-3 rounded-full text-indigo-700">{icon}</div>
            <div>
              <p className="text-indigo-900 font-extrabold text-3xl">{value}</p>
              <p className="text-indigo-800 font-semibold text-lg">{label}</p>
            </div>
          </div>
        ))}
      </section>

      {/* Notifications Panel */}
      <section aria-label="Notifications Panel">
        <h2 className="text-2xl font-bold text-indigo-700 mb-6 border-b border-yellow-400">
          Notifications
        </h2>
        <ul className="space-y-3 max-w-4xl mx-auto">
          {notifications.map(({ id, message, icon }) => (
            <li
              key={id}
              className="bg-yellow-50 border-l-4 border-yellow-400 text-yellow-700 p-4 rounded shadow cursor-pointer"
              tabIndex={0}
              role="button"
              aria-label={message}
              onClick={() => alert(message)}
              onKeyDown={(e) => {
                if (e.key === "Enter") alert(message);
              }}
            >
              <span className="inline-block mr-2">{icon}</span>
              {message}
            </li>
          ))}
        </ul>
      </section>

      {/* Main Actions Section */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
        <ActionCard
          icon={<UserCircle className="h-14 w-14 text-indigo-600" />}
          title="View Profile"
          description="See your full tutor profile and registration details."
          link={`/tutor-profile/${user?._id || ""}`}
          linkText="View Profile"
          bgFrom="indigo-50"
          bgTo="yellow-50"
          borderColor="yellow-400"
        />
        <ActionCard
          icon={<CalendarDays className="h-14 w-14 text-yellow-500" />}
          title="Booking Requests"
          description="Manage incoming student bookings quickly from one place."
          link="/my-bookings"
          linkText="View Bookings"
          bgFrom="yellow-50"
          bgTo="indigo-100"
          borderColor="yellow-400"
        />
      </section>

      {/* Recent Activity Section */}
      <section>
        <h2 className="text-2xl font-bold text-indigo-700 mb-6 border-b border-indigo-400">
          Recent Activity
        </h2>
        <ul className="space-y-4 max-w-4xl mx-auto">
          {recentActivity.map(({ id, content, icon }) => (
            <li
              key={id}
              className="flex items-center gap-4 bg-indigo-50 rounded-lg p-5 shadow border border-indigo-200 hover:shadow-md"
            >
              <div className="bg-indigo-100 p-3 rounded-full text-indigo-600">{icon}</div>
              <p className="text-indigo-800 font-medium text-lg">{content}</p>
            </li>
          ))}
        </ul>
      </section>

      {/* Footer Section */}
      <section className="text-center mt-16 p-8 bg-gradient-to-r from-yellow-300 via-yellow-400 to-yellow-500 rounded shadow-xl text-indigo-900 font-extrabold text-lg animate-pulse select-none">
        Every lesson you give lights up a path to success. Keep inspiring!
      </section>
    </main>
  );
}

function ActionCard({
  icon,
  title,
  description,
  link,
  linkText,
  bgFrom,
  bgTo,
  borderColor,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
  link: string;
  linkText: string;
  bgFrom: string;
  bgTo: string;
  borderColor: string;
}) {
  return (
    <article
      className={`cursor-pointer border-l-8 rounded-3xl p-8 shadow-xl flex flex-col gap-5 transform transition-transform hover:scale-105`}
      style={{
        background: `linear-gradient(to bottom, var(--tw-gradient-stops))`,
      }}
      role="region"
      aria-label={title}
    >
      <div className="mb-2">{icon}</div>
      <h3 className="text-3xl font-bold text-indigo-900">{title}</h3>
      <p className="text-indigo-800 font-semibold text-lg">{description}</p>
      <Link
        to={link}
        aria-label={linkText}
        className="mt-auto underline font-semibold text-yellow-700 hover:text-yellow-900"
      >
        {linkText} &rarr;
      </Link>
    </article>
  );
}
