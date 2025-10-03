import { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function TutorRegistration() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: "",
    email: "",
    subjects: "",
    experience: "",
    rating: "",
    hourlyRate: "",
    bio: "",
    imageUrl: "",
    availability: "",
    sessionTypes: "",
  });

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    const payload = {
      ...form,
      rating: Number(form.rating),
      hourlyRate: Number(form.hourlyRate),
      subjects: form.subjects.split(",").map(s => s.trim()),
      sessionTypes: form.sessionTypes.split(",").map(s => s.trim()),
      availability: { days: form.availability.split(",").map(s => s.trim()), timeSlots: [] },
    };
    try {
      const res = await fetch(`${import.meta.env.VITE_API_BASE_URL ?? window.location.origin}/api/tutors`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error("Failed to register tutor");
      alert("Registration successful!");
      navigate("/tutors");
    } catch (err) {
      alert(err.message || "Registration failed");
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-blue-100 via-white to-blue-50">
      <form
        onSubmit={handleSubmit}
        className="bg-white shadow-xl rounded-xl px-10 py-8 max-w-md w-full space-y-5"
      >
        <h2 className="text-2xl font-semibold text-center mb-4">Tutor Registration</h2>
        <input className="input" name="name" placeholder="Full Name" value={form.name} onChange={handleChange} required />
        <input className="input" name="email" placeholder="Email" value={form.email} onChange={handleChange} required />
        <input className="input" name="subjects" placeholder="Subjects (comma separated)" value={form.subjects} onChange={handleChange} required />
        <input className="input" name="experience" placeholder="Experience (e.g. 5 years)" value={form.experience} onChange={handleChange} required />
        <input className="input" name="rating" placeholder="Rating (0-5)" value={form.rating} onChange={handleChange} type="number" min="0" max="5" step="0.1" />
        <input className="input" name="hourlyRate" placeholder="Hourly Rate (INR)" value={form.hourlyRate} type="number" min="0" onChange={handleChange} />
        <textarea className="input" name="bio" placeholder="Short Bio" value={form.bio} onChange={handleChange}/>
        <input className="input" name="imageUrl" placeholder="Profile Image URL (optional)" value={form.imageUrl} onChange={handleChange} />
        <input className="input" name="availability" placeholder="Available Days (comma separated e.g. Mon,Tue,Wed)" value={form.availability} onChange={handleChange} required/>
        <input className="input" name="sessionTypes" placeholder="Session Types (Online,Offline)" value={form.sessionTypes} onChange={handleChange} required/>
        <button className="w-full bg-blue-600 text-white font-bold py-2 text-lg rounded-xl hover:bg-blue-700" type="submit">
          Register
        </button>
      </form>
    </div>
  );
}
