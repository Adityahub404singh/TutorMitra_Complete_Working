import React, { useState, ChangeEvent, FormEvent } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { FaCamera } from "react-icons/fa";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:3000/api";

interface TutorRegistrationForm {
  name: string;
  phone: string;
  subjects: string;  // comma separated string
  experience: string;
  feePerHour: string;
  mode: "online" | "offline" | "both";
  city: string;
  pin: string;
  mapLink: string;
  slots: string[];
  bio: string;
  education: string;
}

const TutorRegistration: React.FC = () => {
  const navigate = useNavigate();

  const [form, setForm] = useState<TutorRegistrationForm>({
    name: "",
    phone: "",
    subjects: "",
    experience: "",
    feePerHour: "",
    mode: "both",
    city: "",
    pin: "",
    mapLink: "",
    slots: [""],
    bio: "",
    education: "",
  });

  const [profilePic, setProfilePic] = useState<File | null>(null);
  const [profilePicPreview, setProfilePicPreview] = useState<string | null>(null);
  const [qualificationDoc, setQualificationDoc] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  const handleProfilePicChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setProfilePic(file);
      setProfilePicPreview(URL.createObjectURL(file));
    }
  };

  const handleQualificationChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) setQualificationDoc(file);
  };

  const handleChange = (
    e: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSlotChange = (index: number, value: string) => {
    const updatedSlots = [...form.slots];
    updatedSlots[index] = value;
    setForm((prev) => ({ ...prev, slots: updatedSlots }));
  };

  const addSlot = () => {
    setForm((prev) => ({ ...prev, slots: [...prev.slots, ""] }));
  };

  const removeSlot = (index: number) => {
    setForm((prev) => {
      const updatedSlots = prev.slots.filter((_, i) => i !== index);
      return { ...prev, slots: updatedSlots.length ? updatedSlots : [""] };
    });
  };

  const validateForm = () => {
    if (!form.name.trim()) return "Please enter your full name.";
    if (!form.phone.trim() || !/^\d{10,15}$/.test(form.phone))
      return "Please enter a valid phone number (10-15 digits).";
    if (!form.subjects.trim()) return "Please enter your subjects.";
    if (!form.experience || isNaN(Number(form.experience)) || Number(form.experience) < 0)
      return "Please enter a valid experience.";
    if (!form.feePerHour || isNaN(Number(form.feePerHour)) || Number(form.feePerHour) < 0)
      return "Please enter a valid fee per hour.";
    if (!form.city.trim()) return "Please enter your city.";
    if (!form.pin.trim() || !/^\d{4,10}$/.test(form.pin))
      return "Please enter a valid PIN code.";
    if (form.slots.some((slot) => !slot.trim())) return "Please fill or remove all slot fields.";
    if (form.bio.length > 300) return "Bio cannot exceed 300 characters.";
    return "";
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setErrorMsg("");
    setSuccessMsg("");

    const validationError = validateForm();
    if (validationError) {
      setErrorMsg(validationError);
      return;
    }

    setLoading(true);
    try {
      const data = new FormData();
      Object.entries(form).forEach(([key, val]) => {
        if (Array.isArray(val)) {
          data.append(key, JSON.stringify(val));
        } else {
          data.append(key, val);
        }
      });

      if (profilePic) data.append("profileImage", profilePic);
      if (qualificationDoc) data.append("qualificationDoc", qualificationDoc);

      const token = localStorage.getItem("tm_token");

      const res = await axios.post(`${API_BASE_URL}/tutors/profile`, data, {
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: token ? `Bearer ${token}` : "",
        },
      });

      if (res.data.success) {
        setSuccessMsg("Profile saved successfully! Await admin verification.");
        setForm({
          name: "",
          phone: "",
          subjects: "",
          experience: "",
          feePerHour: "",
          mode: "both",
          city: "",
          pin: "",
          mapLink: "",
          slots: [""],
          bio: "",
          education: "",
        });
        setProfilePic(null);
        setQualificationDoc(null);
        setProfilePicPreview(null);
        setTimeout(() => navigate("/tutor/home"), 1200);
      } else {
        setErrorMsg("Failed to save profile. Please try again.");
      }
    } catch (err: any) {
      setErrorMsg(err.response?.data?.message || "An error occurred while saving.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="max-w-xl mx-auto p-8 bg-white rounded-lg shadow-md space-y-6">
      <h2 className="text-3xl font-bold text-center text-indigo-700 mb-6">Tutor Registration</h2>

      {(errorMsg || successMsg) && (
        <div role="alert" className={`p-4 rounded ${errorMsg ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
          {errorMsg || successMsg}
        </div>
      )}

      <div className="flex items-center space-x-6">
        <div className="relative w-24 h-24">
          <img
            src={profilePicPreview || `https://ui-avatars.com/api/?name=${encodeURIComponent(form.name)}&size=96`}
            alt="Profile Preview"
            className="w-full h-full rounded-full object-cover border-2 border-indigo-300"
          />
          <label className="absolute bottom-0 right-0 p-2 bg-indigo-600 text-white rounded-full cursor-pointer hover:bg-indigo-700">
            <FaCamera />
            <input
              type="file"
              accept="image/*"
              onChange={handleProfilePicChange}
              className="hidden"
              aria-label="Upload profile picture"
            />
          </label>
        </div>
        <div className="flex-grow">
          <input
            type="text"
            name="name"
            value={form.name}
            onChange={handleChange}
            placeholder="Full Name"
            required
            className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
            aria-label="Full Name"
          />
          <input
            type="tel"
            name="phone"
            value={form.phone}
            onChange={handleChange}
            placeholder="Phone Number"
            required
            maxLength={15}
            pattern="\d+"
            className="w-full p-3 mt-4 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
            aria-label="Phone Number"
          />
        </div>
      </div>

      <input
        type="text"
        name="subjects"
        value={form.subjects}
        onChange={handleChange}
        placeholder="Subjects (comma separated)"
        required
        className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
        aria-label="Subjects"
      />

      <div className="grid grid-cols-2 gap-4">
        <input
          type="number"
          name="experience"
          value={form.experience}
          onChange={handleChange}
          placeholder="Years of Experience"
          min={0}
          required
          className="p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
          aria-label="Years of Experience"
        />
        <input
          type="number"
          name="feePerHour"
          value={form.feePerHour}
          onChange={handleChange}
          placeholder="Fee per Hour (₹)"
          min={0}
          required
          className="p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
          aria-label="Fee per Hour"
        />
      </div>

      <select
        name="mode"
        value={form.mode}
        onChange={handleChange}
        className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
        aria-label="Teaching mode"
      >
        <option value="online">Online</option>
        <option value="offline">Offline</option>
        <option value="both">Both</option>
      </select>

      <input
        type="text"
        name="city"
        value={form.city}
        onChange={handleChange}
        placeholder="City"
        required
        className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
        aria-label="City"
      />

      <input
        type="text"
        name="pin"
        value={form.pin}
        onChange={handleChange}
        placeholder="PIN Code"
        required
        className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
        aria-label="PIN Code"
      />

      <input
        type="url"
        name="mapLink"
        value={form.mapLink}
        onChange={handleChange}
        placeholder="Map Link (optional)"
        className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
        aria-label="Map Link"
      />

      <textarea
        name="bio"
        value={form.bio}
        onChange={handleChange}
        placeholder="About you (max 300 characters)"
        maxLength={300}
        className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
        aria-label="Bio"
      />

      <input
        type="text"
        name="education"
        value={form.education}
        onChange={handleChange}
        placeholder="Education"
        className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
        aria-label="Education"
      />

      <div className="mb-4">
        <label htmlFor="qualificationDoc" className="block mb-1 font-semibold">Qualification Document</label>
        <input
          type="file"
          id="qualificationDoc"
          accept=".pdf,.jpg,.jpeg,.png"
          onChange={handleQualificationChange}
          className="w-full"
          aria-label="Qualification Document"
        />
      </div>

      <div>
        <label className="block mb-1 font-semibold">Available Slots</label>
        {form.slots.map((slot, idx) => (
          <div key={idx} className="flex items-center space-x-2 mb-2">
            <input
              type="text"
              value={slot}
              onChange={(e) => handleSlotChange(idx, e.target.value)}
              placeholder={`Slot #${idx + 1}`}
              className="flex-grow p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
              aria-label={`Slot #${idx + 1}`}
            />
            {form.slots.length > 1 && (
              <button
                type="button"
                onClick={() => removeSlot(idx)}
                className="text-red-600 hover:text-red-800"
              >
                ×
              </button>
            )}
          </div>
        ))}
        <button
          type="button"
          onClick={addSlot}
          className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          aria-label="Add slot"
        >
          Add Slot
        </button>
      </div>

      <button
        type="submit"
        disabled={loading}
        className={`w-full py-3 mt-6 font-semibold rounded-md text-white ${
          loading ? "bg-indigo-400 cursor-not-allowed" : "bg-indigo-700 hover:bg-indigo-800"
        }`}
        aria-busy={loading}
        aria-label="Save Profile"
      >
        {loading ? "Saving..." : "Save Profile"}
      </button>
    </form>
  );
};

export default TutorRegistration;
