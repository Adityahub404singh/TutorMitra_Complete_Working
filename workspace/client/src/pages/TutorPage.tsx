    
import { useEffect, useState } from "react";
import { type Tutor } from "@shared/schema";
import TutorCard from "../components/tutor-card";

export default function TutorPage() {
  const [tutors, setTutors] = useState<Tutor[]>([]);

  useEffect(() => {
    // Replace with your actual backend endpoint
    fetch("http://localhost:3000/api/tutors")
      .then((res) => res.json())
      .then((data) => setTutors(data))
      .catch((err) => console.error("Failed to fetch tutors:", err));
  }, []);

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 p-6">
      {tutors.length === 0 ? (
        <p>No tutors found.</p>
      ) : (
        tutors.map((tutor) => <TutorCard key={tutor.id} tutor={tutor} />)
      )}
    </div>
  );
}
