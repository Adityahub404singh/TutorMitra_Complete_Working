// client/src/pages/TutorProfile.tsx
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { Tutor } from "@shared/schema";

function TutorProfile() {
  const { id } = useParams<{ id: string }>();
  const [tutor, setTutor] = useState<Tutor | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;

    fetch("http://localhost:3000/api/tutors/"+id)
      .then((res) => res.json())
      .then((data) => {
        setTutor(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Failed to fetch tutor:", err);
        setLoading(false);
      });
  }, [id]);

  if (loading) return <p>Loading tutor profile...</p>;
  if (!tutor) return <p>Tutor not found</p>;

  return (
    <div className="p-4 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">{tutor.name}</h1>
      <p><strong>Subject:</strong> {tutor.subjects}</p>
      <p><strong>Bio:</strong> {tutor.bio}</p>
      <p><strong>Email:</strong> {tutor.email}</p>
    </div>
  );
}

export default TutorProfile;