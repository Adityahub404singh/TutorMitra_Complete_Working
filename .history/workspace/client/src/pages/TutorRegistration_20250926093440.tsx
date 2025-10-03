import React, { useState, ChangeEvent, FormEvent } from "react";
import http from "../api/http";

const TutorRegistration: React.FC = () => {
  const [form, setForm] = useState({
    name: "",
    subjects: "",
    experience: "",
    feePerHour: "",
    mode: "both",
    city: "",
    pin: "",
    mapLink: "",
    slots: [""],
  });

  const [profilePic, setProfilePic] = useState<File | null>(null);
  const [qualificationDoc, setQualificationDoc] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);

  const handleChange = (
    e: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSlotChange = (index: number, value: string) => {
    const newSlots = [...form.slots];
    newSlots[index] = value;
    setForm({ ...form, slots: newSlots });
  };

  const addSlot = () => {
    setForm({ ...form, slots: [...form.slots, ""] });
  };

  const handleFileChange = (
    setter: React.Dispatch<React.SetStateAction<File | null>>,
    e: ChangeEvent<HTMLInputElement>
  ) => {
    if (e.target.files && e.target.files[0]) {
      setter(e.target.files[0]);
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    // Simple validations
    if (!form.name.trim()) {
      alert("Please enter your full name.");
      return;
    }
    if (!form.subjects.trim()) {
      alert("Please enter your subjects.");
      return;
    }
    if (!form.experience || +form.experience < 0) {
      alert("Please enter valid years of experience.");
      return;
    }
    if (!form.feePerHour || +form.feePerHour < 0) {
      alert("Please enter valid fee per hour.");
      return;
    }
    if (!form.city.trim()) {
      alert("Please enter your city.");
      return;
    }
    if (!form.pin.trim()) {
      alert("Please enter your pin code.");
      return;
    }
    if (form.slots.some((slot) => !slot.trim())) {
      alert("Please fill all available slots or remove empty slots.");
      return;
    }

    try {
      setLoading(true);
      const data = new FormData();

      Object.entries(form).forEach(([key, val]) => {
        if (key === "slots") data.append(key, JSON.stringify(val));
        else data.append(key, val as string);
      });

      if (profilePic) data.append("profilePic", profilePic);
      if (qualificationDoc) data.append("qualificationDoc", qualificationDoc);

      const res = await http.post("/tutor/profile", data, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      if (res.data.success)
        alert("Profile saved successfully. Waiting for admin verification.");
      else alert("Failed to save profile. Please try again.");
    } catch (error) {
      alert("Error saving profile. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="max-w-3xl mx-auto p-8 bg-white rounded-xl shadow-lg space-y-6"
    >
      <h2 className="text-3xl font-bold text-indigo-700 text-center mb-6">
        Tutor Profile Setup
      </h2>

      {/* Form Fields (Name, Subjects, etc.) */}
      <input
        type="text"
        name="name"
        placeholder="Full Name"
        value={form.name}
        onChange={handleChange}
        required
        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:ring-2 focus:outline-none"
      />

      {/* Other inputs follow same pattern: subjects, experience, feePerHour... */}

      {/* Your other inputs here */}

      {/* Available slots inputs with add button */}
      <div>
        <label className="font-semibold block mb-2">Available Slots</label>
        {form.slots.map((slot, i) => (
          <input
            key={i}
            type="text"
            value={slot}
            onChange={(e) => handleSlotChange(i, e.target.value)}
            placeholder="e.g. Mon-Fri 5-7 PM"
            required
            className="w-full p-3 mb-3 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:ring-2 focus:outline-none"
          />
        ))}
        <button
          type="button"
          onClick={addSlot}
          className="px-5 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition"
        >
          Add Slot
        </button>
      </div>

      {/* File uploads */}
      <div>
        <label className="font-semibold block mb-2">Profile Picture</label>
        <input
          type="file"
          accept="image/*"
          onChange={(e) => handleFileChange(setProfilePic, e)}
          className="w-full"
          aria-label="Upload profile picture"
        />
      </div>

      <div>
        <label className="font-semibold block mb-2">Qualification Proof</label>
        <input
          type="file"
          accept=".pdf,.jpg,.jpeg,.png"
          onChange={(e) => handleFileChange(setQualificationDoc, e)}
          className="w-full"
          aria-label="Upload qualification document"
        />
      </div>

      {/* --- Submit Button --- */}
      <button
        type="submit"
        disabled={loading}
        className={`w-full py-4 rounded-lg font-semibold text-white transition ${
          loading ? "bg-indigo-400 cursor-not-allowed" : "bg-indigo-700 hover:bg-indigo-800"
        }`}
      >
        {loading ? "Saving Profile..." : "Save Profile"}
      </button>
      {/* --- Submit Button END --- */}
    </form>
  );
};

export default TutorRegistration;
