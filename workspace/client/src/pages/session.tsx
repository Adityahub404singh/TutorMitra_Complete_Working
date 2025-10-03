import React, { useEffect, useState } from "react";
import axios from "axios";

interface Session {
  _id: string;
  tutorId: {
    name: string;
    email: string;
  };
  date: string;
  time: string;
  status: string;
}

const Sessions: React.FC = () => {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchSessions = async () => {
      try {
        const { data } = await axios.get("/session/upcoming");
        setSessions(data.sessions);
        setLoading(false);
      } catch (err: any) {
        setError(err.response?.data?.message || "Failed to fetch sessions");
        setLoading(false);
      }
    };

    fetchSessions();
  }, []);

  if (loading) return <p>Loading upcoming sessions...</p>;
  if (error) return <p className="text-red-600">{error}</p>;

  return (
    <div className="max-w-3xl mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6">Upcoming Sessions</h1>
      {sessions.length === 0 ? (
        <p>No upcoming sessions scheduled.</p>
      ) : (
        <ul>
          {sessions.map((session) => (
            <li key={session._id} className="mb-4 border p-4 rounded shadow">
              <p><strong>Tutor:</strong> {session.tutorId.name} ({session.tutorId.email})</p>
              <p><strong>Date:</strong> {new Date(session.date).toLocaleDateString()}</p>
              <p><strong>Time:</strong> {session.time}</p>
              <p><strong>Status:</strong> {session.status}</p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default Sessions;
