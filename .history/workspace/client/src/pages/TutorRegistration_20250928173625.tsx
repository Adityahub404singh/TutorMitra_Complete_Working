import React, { useState, ChangeEvent, FormEvent } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { FaCamera } from "react-icons/fa";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:3000/api";

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
    if (!form.phone.trim() || !/^\d{10}$/.test(form.phone))
      return "Please enter a valid 10-digit phone number.";
    if (!form.subjects.trim()) return "Please enter subjects.";
    if (!form.experience || isNaN(Number(form.experience)) || Number(form.experience) < 0)
      return "Invalid experience.";
    if (!form.feePerHour || isNaN(Number(form.feePerHour)) || Number(form.feePerHour) < 0)
      return "Invalid fee per hour.";
    if (!form.city.trim()) return "Please enter your city.";
    if (!form.pin.trim()) return "Please enter your pin code.";
    if (form.slots.some((slot) => !slot.trim())) return "Fill or remove all slots.";
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
      for (const [key, val] of Object.entries(form)) {
        if (Array.isArray(val)) {
          data.append(key, JSON.stringify(val));
        } else {
          data.append(key, val as string);
        }
      }

      if (profilePic) data.append("profileImage", profilePic);
      if (qualificationDoc) data.append("qualificationDoc", qualificationDoc);

      const token = localStorage.getItem("tm_token");

      // Save profile first
      const saveRes = await axios.post(`${API_BASE_URL}/tutors/profile`, data, {
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: token ? `Bearer ${token}` : "",
        },
      });

      if (!saveRes.data.success) {
        setErrorMsg("Failed to save profile");
        setLoading(false);
        return;
      }

      // Fetch updated profile to check KYC
      const profileRes = await axios.get(`${API_BASE_URL}/tutors/profile`, {
        headers: {
          Authorization: token ? `Bearer ${token}` : "",
        },
      });

      const profileData = profileRes.data;

      setSuccessMsg("Profile saved successfully!");

      // Reset form and files after save
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

      // Conditional redirect based on KYC status
      if (profileData.kycStatus === "verified") {
        navigate("/tutor-home");
      } else {
        navigate("/kyc/upload");
      }
    } catch (err: any) {
      setErrorMsg(err.response?.data?.message || "Error saving profile");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="max-w-3xl mx-auto p-8 bg-white rounded-2xl shadow-lg space-y-6" aria-label="Tutor Registration Form">
      <h2 className="text-3xl font-bold text-indigo-700 text-center mb-6">Tutor Registration</h2>

      {(errorMsg || successMsg) && (
        <div role="alert" className={`border rounded px-4 py-2 mb-6 ${errorMsg ? "bg-red-100 border-red-400 text-red-700" : "bg-green-100 border-green-400 text-green-700"}`}>
          {errorMsg || successMsg}
        </div>
      )}

      {/* Rest of the form fields and slots & file upload UI as in your existing code, unchanged */}
      {/* Example for profile picture and name input */}
      <div className="flex items-center gap-6">
        <div className="relative w-28 h-28">
          <img
            src={profilePicPreview || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(form.name)}`}
            alt="Profile Preview"
            className="rounded-full border-4 border-indigo-200 w-full h-full object-cover"
          />
          <label className="absolute bottom-2 right-2 cursor-pointer bg-indigo-600 text-white p-2 rounded-full shadow-lg hover:bg-indigo-700">
            <FaCamera />
            <input type="file" accept="image/*" onChange={handleProfilePicChange} className="hidden" aria-label="Upload Profile Picture" />
          </label>
        </div>
        <input
          name="name"
          type="text"
          value={form.name}
          onChange={handleChange}
          placeholder="Full Name"
          required
          className="flex-grow p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
          aria-label="Full Name"
        />
      </div>

      {/* Add your remaining form fields, slots UI and file upload for qualification */}
      {/* ... */}

      <button
        type="submit"
        disabled={loading}
        className={`w-full py-4 rounded-xl font-semibold text-white transition ${loading ? "bg-indigo-400 cursor-not-allowed" : "bg-indigo-700 hover:bg-indigo-800"}`}
        aria-busy={loading}
        aria-label="Save Profile"
      >
        {loading ? "Saving..." : "Save Profile"}
      </button>
    </form>
  );
};

export default TutorRegistration;
