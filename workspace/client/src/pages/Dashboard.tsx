import React, { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../store/auth.js";
import http from "../api/http";

interface Tutor {
  _id: string;
  name: string;
  avatar?: string;
  subjects?: string[];
  rating?: number;
  contact?: string;
}

interface Student {
  _id: string;
  name: string;
  avatar?: string;
  contact?: string;
}

interface Booking {
  _id: string;
  tutorName?: string;
  studentName?: string;
  date: string;
  status: string;
  subject?: string;
  timeSlot?: string;
}

const statusColors: { [key: string]: string } = {
  Pending: "bg-yellow-200 text-yellow-800",
  Confirmed: "bg-green-200 text-green-800",
  Cancelled: "bg-red-200 text-red-800",
  Completed: "bg-blue-200 text-blue-800",
};

export default function Dashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [tutors, setTutors] = useState<Tutor[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!user) return setLoading(false);

    const fetchData = async () => {
      try {
        setLoading(true);
        setError("");
        if (user.role === "student") {
          const [tutRes, bookRes] = await Promise.all([
            http.get("/tutor"),
            http.get("/booking/my"),
          ]);
          setTutors(tutRes.data.tutors || []);
          setBookings(bookRes.data.bookings || []);
        } else if (user.role === "tutor") {
          const [studRes, bookRes] = await Promise.all([
            http.get("/student"),
            http.get("/booking/my"),
          ]);
          setStudents(studRes.data.students || []);
          setBookings(bookRes.data.bookings || []);
        }
      } catch (err) {
        setError("Failed to load dashboard data. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user]);

  if (!user)
    return (
      <div className="min-h-screen flex items-center justify-center p-6 text-center">
        <p className="text-lg">
          Please{" "}
          <Link
            to="/login"
            className="text-blue-600 underline hover:text-blue-800 transition"
          >
            login
          </Link>{" "}
          to access your dashboard.
        </p>
      </div>
    );

  if (loading)
    return (
      <div className="min-h-screen flex items-center justify-center p-6">
        <p className="text-lg animate-pulse text-gray-700 dark:text-gray-300">
          Loading dashboard...
        </p>
      </div>
    );

  if (error)
    return (
      <div className="min-h-screen flex items-center justify-center p-6">
        <p className="text-red-600 text-lg font-semibold">{error}</p>
      </div>
    );

  return (
    <main className="max-w-7xl mx-auto p-6 space-y-12">
      <h1 className="text-5xl font-extrabold text-center text-primary dark:text-yellow-400">
        Dashboard
      </h1>

      {user.role === "student" && (
        <>
          <section>
            <h2 className="text-3xl font-semibold mb-6 border-b border-yellow-400 pb-2">
              Available Tutors
            </h2>
            {tutors.length === 0 ? (
              <p className="text-center text-gray-600 dark:text-gray-400">
                No tutors are currently available.
              </p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                {tutors.map(({ _id, name, avatar, subjects, rating }) => (
                  <Link
                    key={_id}
                    to={`/tutor/${_id}`}
                    className="group bg-white dark:bg-gray-900 p-6 rounded-lg shadow-md hover:shadow-xl transition-transform duration-300 transform hover:-translate-y-1 focus:outline-none focus:ring-4 focus:ring-yellow-400"
                    title={`View profile of ${name}`}
                  >
                    <img
                      src={avatar || "https://via.placeholder.com/80"}
                      alt={`${name}'s avatar`}
                      className="w-20 h-20 rounded-full mx-auto mb-4 object-cover border-2 border-yellow-400 transition group-hover:border-yellow-500"
                      loading="lazy"
                    />
                    <h3 className="text-2xl font-semibold text-center mb-2 text-gray-900 dark:text-yellow-300 group-hover:text-yellow-400 truncate">
                      {name}
                    </h3>
                    <p className="text-center text-gray-600 dark:text-gray-400 mb-2 truncate">
                      {subjects?.length ? subjects.join(", ") : "Subjects not specified"}
                    </p>
                    <div className="text-center text-yellow-400 font-semibold text-lg">
                      {rating?.toFixed(1) ?? "N/A"} ★
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </section>

          <section>
            <h2 className="text-3xl font-semibold mb-6 border-b border-yellow-400 pb-2">
              My Booking History
            </h2>
            {bookings.length === 0 ? (
              <p className="text-center text-gray-600 dark:text-gray-400">
                You have no bookings at present.
              </p>
            ) : (
              <ul className="space-y-5">
                {bookings.map(({ _id, tutorName, date, status, subject, timeSlot }) => (
                  <li
                    key={_id}
                    className="bg-white dark:bg-gray-900 p-5 rounded-lg shadow flex flex-col space-y-1 border-l-4"
                    style={{
                      borderColor: statusColors[status] ? statusColors[status].split(" ")[0] : "transparent",
                    }}
                    tabIndex={0}
                    aria-label={`Booking with tutor ${tutorName} on ${new Date(date).toLocaleDateString()}, status ${status}`}
                  >
                    <p>
                      <strong className="font-semibold">Tutor:</strong> {tutorName}
                    </p>
                    <p>
                      <strong className="font-semibold">Date:</strong>{" "}
                      {new Date(date).toLocaleDateString()}
                    </p>
                    {timeSlot && (
                      <p>
                        <strong className="font-semibold">Time Slot:</strong> {timeSlot}
                      </p>
                    )}
                    {subject && (
                      <p>
                        <strong className="font-semibold">Subject:</strong> {subject}
                      </p>
                    )}
                    <p>
                      <strong className="font-semibold">Status:</strong>{" "}
                      <span
                        className={`inline-block px-2 py-0.5 rounded text-sm font-semibold ${
                          statusColors[status] ?? "bg-gray-300 text-gray-700"
                        }`}
                      >
                        {status}
                      </span>
                    </p>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </>
      )}

      {user.role === "tutor" && (
        <>
          <section>
            <h2 className="text-3xl font-semibold mb-6 border-b border-yellow-400 pb-2">
              My Students
            </h2>
            {students.length === 0 ? (
              <p className="text-center text-gray-600 dark:text-gray-400">
                You have no assigned students yet.
              </p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                {students.map(({ _id, name, avatar }) => (
                  <div
                    key={_id}
                    className="bg-white dark:bg-gray-900 p-6 rounded-lg shadow text-center focus:outline-none focus:ring-4 focus:ring-yellow-400"
                    tabIndex={0}
                    aria-label={`Student: ${name}`}
                  >
                    <img
                      src={avatar || "https://via.placeholder.com/80"}
                      alt={`${name}'s avatar`}
                      className="mx-auto w-20 h-20 rounded-full mb-4 object-cover border-2 border-yellow-400"
                      loading="lazy"
                    />
                    <h3 className="text-xl font-semibold text-gray-900 dark:text-yellow-300">{name}</h3>
                  </div>
                ))}
              </div>
            )}
          </section>

          <section>
            <h2 className="text-3xl font-semibold mb-6 border-b border-yellow-400 pb-2">
              My Bookings
            </h2>
            {bookings.length === 0 ? (
              <p className="text-center text-gray-600 dark:text-gray-400">No bookings found.</p>
            ) : (
              <ul className="space-y-5">
                {bookings.map(({ _id, studentName, date, status, subject, timeSlot }) => (
                  <li
                    key={_id}
                    className="bg-white dark:bg-gray-900 p-5 rounded-lg shadow flex flex-col space-y-1 border-l-4"
                    style={{
                      borderColor: statusColors[status] ? statusColors[status].split(" ")[0] : "transparent",
                    }}
                    tabIndex={0}
                    aria-label={`Booking with student ${studentName} on ${new Date(date).toLocaleDateString()}, status ${status}`}
                  >
                    <p>
                      <strong className="font-semibold">Student:</strong> {studentName}
                    </p>
                    <p>
                      <strong className="font-semibold">Date:</strong>{" "}
                      {new Date(date).toLocaleDateString()}
                    </p>
                    {timeSlot && (
                      <p>
                        <strong className="font-semibold">Time Slot:</strong> {timeSlot}
                      </p>
                    )}
                    {subject && (
                      <p>
                        <strong className="font-semibold">Subject:</strong> {subject}
                      </p>
                    )}
                    <p>
                      <strong className="font-semibold">Status:</strong>{" "}
                      <span
                        className={`inline-block px-2 py-0.5 rounded text-sm font-semibold ${
                          statusColors[status] ?? "bg-gray-300 text-gray-700"
                        }`}
                      >
                        {status}
                      </span>
                    </p>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </>
      )}
    </main>
  );
}
