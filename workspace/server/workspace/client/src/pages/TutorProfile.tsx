import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import type { Tutor } from '../shared/schema';

const cardStyle = {
  background: "#fff",
  borderRadius: 12,
  boxShadow: "0 4px 24px 0 #eee",
  padding: 32,
  margin: "40px auto",
  maxWidth: 500
};

const avatarStyle = {
  width: 120,
  height: 120,
  borderRadius: "50%",
  objectFit: "cover",
  marginBottom: 24,
  boxShadow: "0 4px 16px #e9e9e9"
};

function TutorProfile() {
  const { id } = useParams<{ id: string }>();
  const [tutor, setTutor] = useState<Tutor | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    fetch(`${import.meta.env.VITE_API_BASE_URL ?? window.location.origin}/api/tutors/${id}`)
      .then((res) => res.json())
      .then((data) => {
        setTutor(data.data || null);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [id]);

  if (loading) return <div style={cardStyle}>Loading tutor profile...</div>;
  if (!tutor) return <div style={cardStyle}>Tutor not found</div>;

  return (
    <div style={cardStyle}>
      <img
        src={tutor.imageUrl || "https://i.ibb.co/ZYW3VTp/brown-brim.png"}
        alt={tutor.name}
        style={avatarStyle}
      />
      <h2 style={{ fontWeight: 700, fontSize: 26, marginBottom: 4 }}>{tutor.name}</h2>
      <div style={{ color: "#888", marginBottom: 6 }}>{tutor.email}</div>
      <div style={{ marginBottom: 14 }}>
        <strong>Subjects:</strong> {tutor.subjects.join(", ")}
      </div>
      <div><strong>Experience:</strong> {tutor.experience}</div>
      <div><strong>Rating:</strong> <span style={{ color: "#ffa500" }}>{tutor.rating}★</span></div>
      <div><strong>Hourly Rate:</strong> ₹{tutor.hourlyRate}</div>
      <div style={{ margin: "14px 0" }}><strong>Bio:</strong> {tutor.bio}</div>
      <div>
        <strong>Availability:</strong>{" "}
        {Array.isArray(tutor.availability?.days)
          ? tutor.availability.days.join(", ")
          : tutor.availability}
      </div>
      <div><strong>Sessions:</strong> {tutor.sessionTypes?.join(", ")}</div>
      <div style={{ color: "#aaa", fontSize: 13, marginTop: 18 }}>
        Joined: {new Date(tutor.createdAt).toLocaleDateString()}
      </div>
    </div>
  );
}

export default TutorProfile;
