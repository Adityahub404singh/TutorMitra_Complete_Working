import React, { useState, useEffect, ChangeEvent, FormEvent } from "react";
import axios from "axios";
import { useAuth } from "../store/AuthProvider"; // make sure this path matches YOUR provider!
import { useNavigate } from "react-router-dom";

const API = import.meta.env.VITE_API_BASE_URL || "http://localhost:3000/api";

type CourseForm = {
  instructorId: string;
  instructorName: string;
  location: string;
  subjects: string[];
  title: string;
  description: string;
  price: number | "";
  coachingType: "online" | "offline" | "both";
  category: string;
};

export default function AddCourse() {
  const { user, loading } = useAuth(); // use from correct provider!
  const navigate = useNavigate();

  const [form, setForm] = useState<CourseForm>({
    instructorId: "",
    instructorName: "",
    location: "",
    subjects: [],
    title: "",
    description: "",
    price: "",
    coachingType: "offline",
    category: "",
  });

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      setForm((prev) => ({
        ...prev,
        instructorId: user._id ?? user.id ?? "",
        instructorName: user.name ?? "",
        location: user.city ?? "",
        subjects: Array.isArray(user.subjects) ? user.subjects : [],
      }));
    }
  }, [user]);

  function handleChange(
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) {
    const { name, value } = e.target;
    if (name === "price") {
      const num = parseFloat(value);
      setForm((f) => ({ ...f, price: isNaN(num) ? "" : num }));
    } else if (name === "subjects") {
      setForm((f) => ({
        ...f,
        subjects: value.split(",").map((s) => s.trim()),
      }));
    } else {
      setForm((f) => ({ ...f, [name]: value }));
    }
  }

  async function submitCourse(e: FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    setSuccess(null);

    if (!form.category) {
      setError("Please select a category.");
      setSubmitting(false);
      return;
    }

    const token = localStorage.getItem("tm_token");
    if (!user || !token) {
      setError("Please login to add courses.");
      setSubmitting(false);
      return;
    }

    try {
      const payload = {
        title: form.title,
        description: form.description,
        price: Number(form.price),
        category: form.category,
        location: form.location,
        subjects: form.subjects,
        coachingType: form.coachingType,
        tutor: form.instructorId,
        instructor: form.instructorId,
      };

      const res = await axios.post(`${API}/courses`, payload, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.data.success) {
        setSuccess("Course added successfully!");
        setForm((f) => ({
          ...f,
          title: "",
          description: "",
          price: "",
          category: "",
          coachingType: "offline",
        }));
      } else {
        setError("Failed to add the course. Please try again.");
      }
    } catch (err: any) {
      setError(
        err.response?.data?.message || "Unexpected error occurred."
      );
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) {
    return (
      <div className="p-10 text-center text-indigo-700 text-xl font-bold">
        Loading...
      </div>
    );
  }

  if (!user) {
    return (
      <div className="max-w-lg mx-auto mt-12 p-8 bg-white rounded shadow text-center">
        <h2 className="text-2xl font-bold mb-3 text-indigo-700">Add a New Course</h2>
        <div className="bg-red-100 text-red-700 p-3 rounded">
          Please <a href="/login" className="underline text-blue-800">login</a> first to add courses.
        </div>
      </div>
    );
  }

  if (user.role !== "tutor") {
    return (
      <div className="max-w-lg mx-auto mt-12 p-8 bg-white rounded shadow text-center">
        <h2 className="text-2xl font-bold mb-3 text-indigo-700">Add a New Course</h2>
        <div className="bg-red-100 text-red-700 p-3 rounded">
          Only tutors can add courses.
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-lg mx-auto mt-10 p-6 bg-white rounded shadow-lg border">
      <h2 className="text-2xl font-bold mb-6 text-indigo-700">Add a New Course</h2>

      {success && (
        <div className="bg-green-100 text-green-700 p-3 rounded mb-4">{success}</div>
      )}
      {error && (
        <div className="bg-red-100 text-red-700 p-3 rounded mb-4">{error}</div>
      )}

      <form onSubmit={submitCourse} className="space-y-4" noValidate>
        <input type="hidden" name="instructorId" value={form.instructorId} />

        <div>
          <label className="block mb-1 font-semibold">Course Title <span className="text-red-600">*</span></label>
          <input
            type="text"
            name="title"
            value={form.title}
            onChange={handleChange}
            required
            placeholder="Enter course title"
            className="w-full border border-gray-300 rounded p-2"
          />
        </div>

        <div>
          <label className="block mb-1 font-semibold">Description <span className="text-red-600">*</span></label>
          <textarea
            name="description"
            value={form.description}
            onChange={handleChange}
            required
            placeholder="Describe your course"
            rows={4}
            className="w-full border border-gray-300 rounded p-2"
          />
        </div>

        <div>
          <label className="block mb-1 font-semibold">Category <span className="text-red-600">*</span></label>
          <select
            name="category"
            value={form.category}
            onChange={handleChange}
            required
            className="w-full border border-gray-300 rounded p-2"
          >
            <option value="">Select Category</option>
            <option value="academic">Academic</option>
            <option value="programming">Programming</option>
            <option value="language">Language</option>
            <option value="music">Music</option>
            <option value="arts">Arts</option>
            <option value="sports">Sports</option>
            <option value="science">Science</option>
            <option value="mathematics">Mathematics</option>
            <option value="other">Other</option>
          </select>
        </div>

        <div>
          <label className="block mb-1 font-semibold">Price (₹) <span className="text-red-600">*</span></label>
          <input
            type="number"
            name="price"
            value={form.price}
            onChange={handleChange}
            required
            min={0}
            placeholder="Course fee per hour"
            className="w-full border border-gray-300 rounded p-2"
          />
        </div>

        <div>
          <label className="block mb-1 font-semibold">Location <span className="text-red-600">*</span></label>
          <input
            type="text"
            name="location"
            value={form.location}
            onChange={handleChange}
            required
            placeholder="Where course will be held"
            className="w-full border border-gray-300 rounded p-2"
          />
        </div>

        <div>
          <label className="block mb-1 font-semibold">Subjects <span className="text-red-600">*</span></label>
          <input
            type="text"
            name="subjects"
            value={form.subjects.join(", ")}
            onChange={handleChange}
            required
            placeholder="Comma separated, e.g. Maths, English"
            className="w-full border border-gray-300 rounded p-2"
          />
        </div>

        <div>
          <label className="block mb-1 font-semibold">Coaching Type <span className="text-red-600">*</span></label>
          <select
            name="coachingType"
            value={form.coachingType}
            onChange={handleChange}
            required
            className="w-full border border-gray-300 rounded p-2"
          >
            <option value="online">Online</option>
            <option value="offline">Offline</option>
            <option value="both">Both</option>
          </select>
        </div>

        <button
          type="submit"
          disabled={submitting}
          className={`w-full py-2 mt-4 rounded font-semibold ${
            submitting
              ? "bg-gray-400 cursor-not-allowed"
              : "bg-yellow-400 text-indigo-900 hover:bg-yellow-500"
          }`}
        >
          {submitting ? "Adding Course..." : "Add Course"}
        </button>
      </form>
    </div>
  );
}
