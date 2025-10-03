import React, { useState, ChangeEvent, FormEvent } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { FaCamera } from "react-icons/fa";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:3000/api";

const TutorRegistration: React.FC = () => {
  const navigate = useNavigate();

  const [form, setForm] = useState({
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

  // Preview image logic
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
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSlotChange = (index: number, value: string) => {
    const updatedSlots = [...form.slots];
    updatedSlots[index] = value;
    setForm(prev => ({ ...prev, slots: updatedSlots }));
  };

  const addSlot = () => {
    setForm(prev => ({ ...prev, slots: [...prev.slots, ""] }));
  };

  const removeSlot = (index: number) => {
    setForm(prev => {
      const updatedSlots = prev.slots.filter((_, i) => i !== index);
      return { ...prev, slots: updatedSlots.length ? updatedSlots : [""] };
    });
  };

  const validateForm = () => {
    if (!form.name.trim()) return "Please enter your full name.";
    if (!form.phone.trim() || !/^\d{10,}$/.test(form.phone))
      return "Please enter a valid phone number.";
    if (!form.subjects.trim()) return "Please enter your subjects.";
    if (!form.experience || isNaN(Number(form.experience)) || Number(form.experience) < 0)
      return "Please enter experience (years).";
    if (!form.feePerHour || isNaN(Number(form.feePerHour)) || Number(form.feePerHour) < 0)
      return "Please enter a valid fee per hour.";
    if (!form.city.trim()) return "Please enter your city.";
    if (!form.pin.trim()) return "Please enter your pin code.";
    if (form.slots.some(slot => !slot.trim())) return "Fill or remove all slot fields.";
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
      
      // FIXED: Changed from /tutor/profile to /tutors/profile
      const res = await axios.post(
        `${API_BASE_URL}/tutors/profile`,  // <-- MAIN FIX: PLURAL TUTORS
        data,
        {
          headers: {
            "Content-Type": "multipart/form-data",  // ADDED: Proper content type
            Authorization: token ? `Bearer ${token}` : "",
          }
        }
      );

      console.log("✅ Profile save response:", res.data);
lse {
        setErrorMsg("Failed to save profile. Please try again.");
      }
    } catch (err: any) {
      console.error("❌ Profile save error:", err);
      setErrorMsg(
        err.response?.data?.message ||
        err.response?.data?.error ||
        "An error occurred while saving. Please check inputs and try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="max-w-3xl mx-auto p-8 bg-white rounded-2xl shadow-lg space-y-6"
      noValidate
      aria-label="Tutor Registration Form"
    >
      <h2 className="text-3xl font-bold text-indigo-700 text-center mb-6">Tutor Profile Setup</h2>
      
      {(errorMsg || successMsg) && (
        <div
          role="alert"
          className={`border rounded px-4 py-2 mb-6 ${errorMsg
            ? "bg-red-100 border-red-400 text-red-700"
            : "bg-green-100 border-green-400 text-green-700"
            }`}
        >
          {errorMsg || successMsg}
        </div>
      )}

      {/* PROFILE PIC PREVIEW + UPLOAD */}
      <div className="flex flex-col md:flex-row items-center md:gap-10">
        <div className="relative h-28 w-28 md:h-36 md:w-36 my-2">
          <img
            src={
              profilePicPreview ||
              "https://api.dicebear.com/7.x/initials/svg?seed=" + form.name
            }
            alt="Profile Preview"
            className="rounded-full w-full h-full object-cover border-4 border-indigo-200"
          />
          <label className="absolute bottom-2 right-2 bg-indigo-600 text-white p-2 rounded-full shadow-lg cursor-pointer hover:bg-indigo-700 transition">
            <FaCamera />
            <input
              type="file"
              accept="image/*"
              onChange={handleProfilePicChange}
              className="hidden"
              aria-label="Profile Picture"
            />
          </label>
        </div>
        <div className="flex-1 w-full mt-3 md:mt-0">
          <input
            type="text"
            name="name"
            placeholder="Full Name"
            value={form.name}
            onChange={handleChange}
            required
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
            aria-label="Full Name"
          />
        </div>
      </div>

      {/* PHONE */}
      <input
        type="tel"
        name="phone"
        placeholder="Phone Number"
        value={form.phone}
        onChange={handleChange}
        required
        maxLength={15}
        pattern="[0-9]+"
        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
        aria-label="Phone Number"
      />

      <input
        type="text"
        name="subjects"
        placeholder="Subjects (comma separated)"
        value={form.subjects}
        onChange={handleChange}
        required
        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
        aria-label="Subjects"
      />

      <input
        type="number"
        name="experience"
        placeholder="Years of Experience"
        value={form.experience}
        onChange={handleChange}
        min={0}
        required
        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
        aria-label="Years of Experience"
      />

      <input
        type="number"
        name="feePerHour"
        placeholder="Fee per Hour (₹)"
        value={form.feePerHour}
        onChange={handleChange}
        min={0}
        required
        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
        aria-label="Fee per Hour"
      />

      <select
        name="mode"
        value={form.mode}
        onChange={handleChange}
        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
        aria-label="Teaching Mode"
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
        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
        aria-label="City"
      />

      <input
        type="text"
        name="pin"
        placeholder="PIN Code"
        value={form.pin}
        onChange={handleChange}
        required
        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
        aria-label="PIN Code"
      />

      <input
        type="url"
        name="mapLink"
        placeholder="Map Link (optional)"
        value={form.mapLink}
        onChange={handleChange}
        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
        aria-label="Map Link"
      />

      <textarea
        name="bio"
        placeholder="About you (bio, max 300 chars)"
        maxLength={300}
        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
        value={form.bio}
        onChange={handleChange}
        rows={3}
      />

      <input
        type="text"
        name="education"
        placeholder="Education / Qualification (optional)"
        value={form.education}
        onChange={handleChange}
        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
      />

      {/* Available slots dynamic */}
      <div>
        <label className="font-semibold mb-2 block">Available Slots</label>
        {form.slots.map((slot, index) => (
          <div key={index} className="flex mb-3 space-x-3 items-center">
            <input
              type="text"
              value={slot}
              onChange={(e) => handleSlotChange(index, e.target.value)}
              placeholder="e.g. Mon-Fri 5-7 PM"
              required
              className="flex-grow p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
              aria-label={`Slot ${index + 1}`}
            />
            {form.slots.length > 1 && (
              <button
                type="button"
                onClick={() => removeSlot(index)}
                className="text-red-600 hover:text-red-800"
                aria-label={`Remove slot ${index + 1}`}
              >
                &times;
              </button>
            )}
          </div>
        ))}
        <button
          type="button"
          onClick={addSlot}
          className="px-5 py-2 rounded bg-indigo-600 text-white hover:bg-indigo-700 transition mt-1"
          aria-label="Add slot"
        >
          Add Slot
        </button>
      </div>

      {/* Qualification upload */}
      <div>
        <label htmlFor="qualificationDoc" className="block font-semibold mb-2">
          Qualification Document
        </label>
        <input
          id="qualificationDoc"
          type="file"
          accept=".pdf,.jpg,.jpeg,.png"
          onChange={handleQualificationChange}
          className="w-full"
          aria-describedby="qualificationDocHelp"
        />
        <p id="qualificationDocHelp" className="text-sm text-gray-500 mt-1">
          Upload relevant certificates/proof (PDF, image)
        </p>
      </div>

      <button
        type="submit"
        disabled={loading}
        className={`w-full py-4 rounded-xl font-semibold text-white transition ${loading ? "bg-indigo-400 cursor-not-allowed" : "bg-indigo-700 hover:bg-indigo-800"
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
