import React, { useEffect, useState } from "react";
import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:3000/api";

interface UserProfile {
  name: string;
  email: string;
  phone?: string;
  role: string;
  // ...add more fields as needed
}

export default function Profile() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [form, setForm] = useState<UserProfile | null>(null);
  const [editMode, setEditMode] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string>("");

  // Fetched once, or re-fetched after update
  const fetchProfile = async () => {
    setLoading(true);
    setError("");
    try {
      const token = localStorage.getItem("tm_token");
      const res = await axios.get(`${API_BASE_URL}/user/me`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setProfile(res.data.data);
      setForm(res.data.data); // Reset edit form to newest data
    } catch (err: any) {
      setError(err.response?.data?.error || "Failed to fetch profile.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  // Edit form handlers
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!form) return;
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  // Submit & sync profile
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError("");
    try {
      const token = localStorage.getItem("tm_token");
      // Only send editable fields!
      const { name, phone } = form!;
      await axios.put(`${API_BASE_URL}/user/me`, { name, phone }, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setEditMode(false);
      await fetchProfile(); // UPDATE: Always fetch fresh data after update!
    } catch (err: any) {
      setError(err.response?.data?.error || "Profile update failed.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="text-center py-12">Loading profile...</div>;
  if (error) return <div className="text-center text-red-600 py-12">{error}</div>;
  if (!profile) return <div className="text-center py-12">No profile data found.</div>;

  return (
    <div className="max-w-3xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">My Profile</h1>
      {editMode && form ? (
        <form onSubmit={handleSubmit} className="space-y-5 max-w-lg">
          <div>
            <label className="block font-semibold mb-1">Name</label>
            <input
              type="text"
              name="name"
              value={form.name}
              onChange={handleChange}
              required
              className="w-full p-2 border rounded"
            />
          </div>
          <div>
            <label className="block font-semibold mb-1">Email</label>
            <input
              type="email"
              name="email"
              value={form.email}
              disabled
              className="w-full p-2 border rounded bg-gray-100 text-gray-500"
            />
          </div>
          <div>
            <label className="block font-semibold mb-1">Phone</label>
            <input
              type="text"
              name="phone"
              value={form.phone || ""}
              onChange={handleChange}
              className="w-full p-2 border rounded"
            />
          </div>
          <button
            type="submit"
            disabled={saving}
            className="px-6 py-2 bg-yellow-500 hover:bg-yellow-600 font-bold text-white rounded shadow"
          >
            {saving ? "Saving..." : "Save"}
          </button>
          <button
            type="button"
            onClick={() => setEditMode(false)}
            className="ml-4 px-6 py-2 bg-gray-200 font-bold rounded shadow"
          >
            Cancel
          </button>
        </form>
      ) : (
        <div className="space-y-2">
          <p><b>Name:</b> {profile.name}</p>
          <p><b>Email:</b> {profile.email}</p>
          <p><b>Phone:</b> {profile.phone || "—"}</p>
          <p><b>Role:</b> {profile.role}</p>
          <button
            onClick={() => setEditMode(true)}
            className="mt-4 px-6 py-2 bg-yellow-500 hover:bg-yellow-600 font-bold text-white rounded shadow"
          >
            Edit Profile
          </button>
        </div>
      )}
    </div>
  );
}
