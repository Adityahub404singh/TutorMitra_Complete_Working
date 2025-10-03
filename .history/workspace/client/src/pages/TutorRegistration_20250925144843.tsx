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
  const [errorMsg, setErrorMsg] = useState("");

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

  const validateForm = () => {
    if (!form.name.trim()) return "Please enter your full name.";
    if (!form.subjects.trim()) return "Please enter your subjects.";
    if (!form.experience || isNaN(Number(form.experience)) || Number(form.experience) < 0)
      return "Please enter valid years of experience.";
    if (!form.feePerHour || isNaN(Number(form.feePerHour)) || Number(form.feePerHour) < 0)
      return "Please enter valid fee per hour.";
    if (!form.city.trim()) return "Please enter your city.";
    if (!form.pin.trim()) return "Please enter your pin code.";
    if (form.slots.some((slot) => !slot.trim())) return "Please fill all available slots or remove empty slots.";
    return "";
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    const validationError = validateForm();
    if (validationError) {
      setErrorMsg(validationError);
      return;
    }

    try {
      setErrorMsg("");
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
        setForm({
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
        setProfilePic(null);
        setQualificationDoc(null);
      } else {
        setErrorMsg("Failed to save profile. Please try again.");
      }
    } catch {
      setErrorMsg("Error saving profile. Please check your inputs and try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="max-w-3xl mx-auto p-8 bg-white rounded-xl shadow-lg space-y-6"
      noValidate
    >
      <h2 className="text-3xl font-bold text-indigo-700 text-center mb-6">Tutor Profile Setup</h2>

      {errorMsg && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
          <span className="block sm:inline">{errorMsg}</span>
        </div>
      )}

      <input
        type="text"
        name="name"
        placeholder="Full Name"
        value={form.name}
        onChange={handleChange}
        required
        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none"
        aria-label="Full Name"
      />

      <input
        type="text"
        name="subjects"
        placeholder="Subjects (comma separated)"
        value={form.subjects}
        onChange={handleChange}
        required
        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none"
        aria-label="Subjects"
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
        aria-label="Years of Experience"
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
        aria-label="Fee per Hour"
      />

      <select
        name="mode"
        value={form.mode}
        onChange={handleChange}
        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none"
        required
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
        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none"
        aria-label="City"
      />

      <input
        type="text"
        name="pin"
        placeholder="Pin Code"
        value={form.pin}
        onChange={handleChange}
        required
        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none"
        aria-label="Pin Code"
      />

      <input
        type="url"
        name="mapLink"
        placeholder="Map Link (optional)"
        value={form.mapLink}
        onChange={handleChange}
        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none"
        aria-label="Map Link"
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
            required
            className="w-full p-3 mb-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none"
            aria-label={`Available slot ${i + 1}`}
          />
        ))}
        <button
          type="button"
          onClick={addSlot}
          className="px-5 py-2 bg-indigo-600 text-white rounded-lg shadow hover:bg-indigo-700 transition"
          aria-label="Add slot"
        >
          Add Slot
        </button>
      </div>

      <div>
        <label className="font-semibold block mb-2" htmlFor="profilePic">
          Profile Picture
        </label>
        <input
          id="profilePic"
          type="file"
          accept="image/*"
          onChange={(e) => handleFileChange(setProfilePic, e)}
          className="w-full"
          aria-describedby="profilePicHelp"
        />
        <p id="profilePicHelp" className="text-sm text-gray-500 mt-1">
          Upload a clear profile picture (jpg, png).
        </p>
      </div>

      <div>
        <label className="font-semibold block mb-2" htmlFor="qualificationDoc">
          Qualification Proof
        </label>
        <input
          id="qualificationDoc"
          type="file"
          accept=".pdf,.jpg,.jpeg,.png"
          onChange={(e) => handleFileChange(setQualificationDoc, e)}
          className="w-full"
          aria-describedby="qualificationDocHelp"
        />
        <p id="qualificationDocHelp" className="text-sm text-gray-500 mt-1">
          Upload certificates or proof of qualifications.
        </p>
      </div>

      <button
        type="submit"
        disabled={loading}
        className={`w-full py-4 rounded-lg font-semibold text-white transition ${
          loading ? "bg-indigo-400 cursor-not-allowed" : "bg-indigo-700 hover:bg-indigo-800"
        }`}
        aria-busy={loading}
        aria-label="Save Profile"
      >
        {loading ? "Saving Profile..." : "Save Profile"}
      </button>
    </form>
  );
};

export default TutorRegistration;
