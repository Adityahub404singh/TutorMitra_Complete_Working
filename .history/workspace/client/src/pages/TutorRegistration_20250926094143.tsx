
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

    // Simple client-side validation example
    if (!form.name.trim()) {
      alert("Please enter your full name.");
      return;
    }
    if (!form.subjects.trim()) {
      alert("Please enter your subjects.");
      return;
    }
    if (!form.experience || isNaN(Number(form.experience)) || Number(form.experience) < 0) {
      alert("Please enter valid years of experience.");
      return;
    }
    if (!form.feePerHour || isNaN(Number(form.feePerHour)) || Number(form.feePerHour) < 0) {
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
        if (key === "slots") {
          data.append(key, JSON.stringify(val));
        } else {
          data.append(key, val as string);
        }
      });

      if (profilePic) data.append("profilePic", profilePic);
      if (qualificationDoc) data.append("qualificationDoc", qualificationDoc);

      const res = await http.post("/tutor/profile", data, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      if (res.data.success) {
        alert("Profile saved successfully. Waiting for admin verification.");
      } else {
        alert("Failed to save profile. Please try again.");
      }
    } catch (error) {
      alert("Error saving profile. Please check your inputs and try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="max-w-3xl mx-auto p-8 bg-white rounded-xl shadow-lg space-y-6"
    >
      <h2 className="text-3xl font-bold mb-6 text-center text-indigo-700">
        Tutor Profile Setup
      </h2>

      <input
        type="text"
        name="name"
        placeholder="Full Name"
        value={form.name}
        onChange={handleChange}
        required
        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none"
      />

      <input
        type="text"
        name="subjects"
        placeholder="Subjects (comma separated)"
        value={form.subjects}
        onChange={handleChange}
        required
        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none"
      />

      <input
        type="number"
        name="experience"
        placeholder="Years of Experience"
        value={form.experience}
        onChange={handleChange}
        required
        min={0}
        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none"
      />

      <input
        type="number"
        name="feePerHour"
        placeholder="Fee per Hour (₹)"
        value={form.feePerHour}
        onChange={handleChange}
        required
        min={0}
        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none"
      />

      <select
        name="mode"
        value={form.mode}
        onChange={handleChange}
        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none"
        required
      >
        <option value="online">Online</option>
        <option value="offline">Offline</option>
        <option value="both">Both</option>
      </select>

      <input
        type="text"
        name="city"
        placeholder="City"
        value={form.city}
        onChange={handleChange}
        required
        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none"
      />

      <input
        type="text"
        name="pin"
        placeholder="Pin Code"
        value={form.pin}
        onChange={handleChange}
        required
        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none"
      />

      <input
        type="url"
        name="mapLink"
        placeholder="Map Link (optional)"
        value={form.mapLink}
        onChange={handleChange}
        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none"
      />

      <div>
        <label className="font-semibold block mb-2">Available Slots</label>
        {form.slots.map((slot, i) => (
          <input
            key={i}
            type="text"
            value={slot}
            onChange={(e) => handleSlotChange(i, e.target.value)}
            placeholder="e.g. Mon-Fri 5-7 PM"
            className="w-full p-3 mb-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none"
            required
          />
        ))}
        <button
          type="button"
          onClick={addSlot}
          className="px-5 py-2 bg-indigo-600 text-white rounded-lg shadow hover:bg-indigo-700 transition"
        >
          Add Slot
        </button>
      </div>

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

      <button
        type="submit"
        disabled={loading}
        className={`w-full py-4 rounded-lg font-semibold text-white transition ${
          loading ? "bg-indigo-400 cursor-not-allowed" : "bg-indigo-700 hover:bg-indigo-800"
        }`}
      >
        {loading ? "Saving Profile..." : "Save Profile"}
      </button>
    </form>
  );
};

export default TutorRegistration;
