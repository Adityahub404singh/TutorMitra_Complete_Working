import React, { useEffect, useState, ChangeEvent, FormEvent } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../store/AuthProvider";
import ProfileUploaderWithCrop from "../components/ProfileUploaderWithCrop";

const API = import.meta.env.VITE_API_BASE_URL || "http://localhost:3000/api";

interface TutorProfile {
  name: string;
  email: string;
  phone: string;
  subjects: string[];
  experience: number;
  feePerHour: number;
  mode: string;
  city: string;
  pin: string;
  mapLink?: string;
  slots: string[];
  bio: string;
  education?: string;
  profileImage?: string;
  qualificationDoc?: string;
}

export default function EditProfile() {
  const { setUser } = useAuth();
  const navigate = useNavigate();

  const [profile, setProfile] = useState<TutorProfile>({
    name: "",
    email: "",
    phone: "",
    subjects: [],
    experience: 0,
    feePerHour: 0,
    mode: "both",
    city: "",
    pin: "",
    mapLink: "",
    slots: [""],
    bio: "",
    education: "",
    profileImage: "",
    qualificationDoc: "",
  });

  const [profileImageFile, setProfileImageFile] = useState<File | null>(null);
  const [previewImage, setPreviewImage] = useState<string>();
  const [qualificationFile, setQualificationFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>();
  const [successMsg, setSuccessMsg] = useState<string | null>();

  useEffect(() => {
    async function fetchProfile() {
      setLoading(true);
      try {
        const token = localStorage.getItem("tm_token");
        if (!token) {
          navigate("/login");
          return;
        }
        const { data } = await axios.get(`${API}/tutors/profile/me`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (data.success) {
          const prof = data.tutor || data.data;
          setProfile({
            name: prof.name || "",
            email: prof.email || "",
            phone: prof.phone || "",
            subjects: Array.isArray(prof.subjects) ? prof.subjects : [],
            experience: Number(prof.experience) || 0,
            feePerHour: Number(prof.feePerHour) || 0,
            mode: prof.mode || "both",
            city: prof.city || "",
            pin: prof.pin || "",
            mapLink: prof.mapLink || "",
            slots: Array.isArray(prof.slots) && prof.slots.length > 0 ? prof.slots : [""],
            bio: prof.bio || "",
            education: prof.education || "",
            profileImage: prof.profileImage || "",
            qualificationDoc: prof.qualificationDoc || "",
          });
          setPreviewImage(undefined);
          setProfileImageFile(null);
          setQualificationFile(null);
          setErrorMsg(null);
          setSuccessMsg(null);
        } else {
          setErrorMsg("Failed to load profile");
        }
      } catch {
        setErrorMsg("Error loading profile");
      } finally {
        setLoading(false);
      }
    }
    fetchProfile();
  }, [navigate]);

  function handleChange(
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) {
    const { name, value } = e.target;
    if (name === "subjects") {
      setProfile((prev) => ({ ...prev, subjects: value.split(",").map((s) => s.trim()) }));
    } else if (name === "experience" || name === "feePerHour") {
      setProfile((prev) => ({ ...prev, [name]: Number(value) }));
    } else {
      setProfile((prev) => ({ ...prev, [name]: value }));
    }
  }

  function handleSlotChange(index: number, val: string) {
    const newSlots = [...profile.slots];
    newSlots[index] = val;
    setProfile(newSlots.length ? { ...profile, slots: newSlots } : { ...profile, slots: [""] });
  }

  function addSlot() {
    setProfile((prev) => ({ ...prev, slots: [...prev.slots, ""] }));
  }

  function removeSlot(index: number) {
    const newSlots = profile.slots.filter((_, i) => i !== index);
    setProfile(newSlots.length ? { ...profile, slots: newSlots } : { ...profile, slots: [""] });
  }

  function onProfileImageChange(croppedFile: File | null) {
    setProfileImageFile(croppedFile);
    if (previewImage && previewImage.startsWith("blob:")) {
      URL.revokeObjectURL(previewImage);
    }
    if (croppedFile) {
      setPreviewImage(URL.createObjectURL(croppedFile));
    } else {
      setPreviewImage(undefined);
    }
  }

  function handleQualificationChange(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    setQualificationFile(file || null);
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);
    setLoading(true);

    try {
      const token = localStorage.getItem("tm_token");
      if (!token) {
        setErrorMsg("Please login first.");
        setLoading(false);
        return;
      }
      const formData = new FormData();
      formData.append("name", profile.name);
      formData.append("email", profile.email);
      formData.append("phone", profile.phone);
      formData.append("subjects", JSON.stringify(profile.subjects));
      formData.append("experience", String(profile.experience));
      formData.append("feePerHour", String(profile.feePerHour));
      formData.append("mode", profile.mode);
      formData.append("city", profile.city);
      formData.append("pin", profile.pin);
      formData.append("mapLink", profile.mapLink || "");
      formData.append("slots", JSON.stringify(profile.slots));
      formData.append("bio", profile.bio);
      formData.append("education", profile.education || "");
      if (profileImageFile) formData.append("profileImage", profileImageFile);
      if (qualificationFile) formData.append("qualificationDoc", qualificationFile);

      const { data } = await axios.post(`${API}/tutors/profile`, formData, {
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "multipart/form-data" },
      });

      if (data.success) {
        setSuccessMsg("Profile updated successfully.");
        setProfileImageFile(null);
        setQualificationFile(null);
        setPreviewImage(undefined);
        setUser(data.tutor);
      } else {
        setErrorMsg("Error updating profile.");
      }
    } catch (err: any) {
      setErrorMsg(err.response?.data?.message || "Error updating profile.");
    } finally {
      setLoading(false);
    }
  }

  if (loading && !successMsg) {
    return (
      <div className="p-12 text-center font-semibold text-indigo-600 text-xl">
        Loading...
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white rounded shadow mt-6">
      <h1 className="text-4xl font-bold text-indigo-600 mb-6">Edit Profile</h1>
      {errorMsg && (
        <div className="p-4 mb-6 bg-red-100 text-red-700 rounded">{errorMsg}</div>
      )}
      {successMsg && (
        <div className="p-4 mb-6 bg-green-100 text-green-700 rounded">
          {successMsg}
        </div>
      )}
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="flex justify-center mb-8">
          <img
            src={
              previewImage
                ? previewImage
                : profile.profileImage
                ? `http://localhost:3000${profile.profileImage}?${Date.now()}`
                : `https://ui-avatars.com/api/?name=${encodeURIComponent(
                    profile.name
                  )}&size=140`
            }
            alt="Profile Avatar"
            className="w-32 h-32 rounded-full border-4 border-indigo-400 object-cover shadow"
          />
        </div>

        <ProfileUploaderWithCrop
          currentImageUrl={
            profile.profileImage ? `http://localhost:3000${profile.profileImage}?${Date.now()}` : undefined
          }
          name={profile.name}
          onCropped={onProfileImageChange}
        />

        <input
          type="text"
          name="name"
          value={profile.name}
          onChange={handleChange}
          placeholder="Full Name"
          required
          className="w-full p-3 border border-gray-300 rounded"
        />
        <input
          type="email"
          name="email"
          value={profile.email}
          onChange={handleChange}
          placeholder="Email"
          required
          className="w-full p-3 border border-gray-300 rounded"
        />
        <input
          type="tel"
          name="phone"
          value={profile.phone}
          onChange={handleChange}
          placeholder="Phone"
          required
          className="w-full p-3 border border-gray-300 rounded"
        />
        <input
          type="text"
          name="subjects"
          value={profile.subjects.join(",")}
          onChange={handleChange}
          placeholder="Subjects (comma separated)"
          className="w-full p-3 border border-gray-300 rounded"
        />
        <input
          type="number"
          name="experience"
          value={profile.experience}
          onChange={handleChange}
          placeholder="Experience (years)"
          className="w-full p-3 border border-gray-300 rounded"
          min={0}
        />
        <input
          type="number"
          name="feePerHour"
          value={profile.feePerHour}
          onChange={handleChange}
          placeholder="Fee per hour"
          className="w-full p-3 border border-gray-300 rounded"
          min={0}
        />
        <select
          name="mode"
          value={profile.mode}
          onChange={handleChange}
          className="w-full p-3 border border-gray-300 rounded"
        >
          <option value="online">Online</option>
          <option value="offline">Offline</option>
          <option value="both">Both</option>
        </select>
        <input
          type="text"
          name="city"
          value={profile.city}
          onChange={handleChange}
          placeholder="City"
          className="w-full p-3 border border-gray-300 rounded"
        />
        <input
          type="text"
          name="pin"
          value={profile.pin}
          onChange={handleChange}
          placeholder="PIN"
          className="w-full p-3 border border-gray-300 rounded"
        />
        <input
          type="url"
          name="mapLink"
          value={profile.mapLink || ""}
          onChange={handleChange}
          placeholder="Map Link"
          className="w-full p-3 border border-gray-300 rounded"
        />
        <textarea
          name="bio"
          value={profile.bio}
          onChange={handleChange}
          placeholder="Bio"
          className="w-full p-3 border border-gray-300 rounded"
          rows={4}
        />
        <input
          type="text"
          name="education"
          value={profile.education || ""}
          onChange={handleChange}
          placeholder="Education"
          className="w-full p-3 border border-gray-300 rounded"
        />
        <input
          type="file"
          onChange={handleQualificationChange}
          accept=".pdf,.jpg,.jpeg,.png"
          className="w-full p-3 border border-gray-300 rounded"
        />
        {profile.qualificationDoc && (
          <a
            href={`${API}${profile.qualificationDoc}`}
            target="_blank"
            className="text-indigo-600 underline block mt-1"
            rel="noreferrer noopener"
          >
            View Current Document
          </a>
        )}
        <button
          type="submit"
          disabled={loading}
          className={`w-full p-3 mt-4 text-white font-semibold rounded ${
            loading ? "bg-indigo-400 cursor-not-allowed" : "bg-indigo-700 hover:bg-indigo-800"
          }`}
        >
          {loading ? "Updating..." : "Update Profile"}
        </button>
      </form>
    </div>
  );
}
