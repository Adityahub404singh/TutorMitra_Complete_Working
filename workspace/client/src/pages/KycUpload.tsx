import React, { useState, ChangeEvent, FormEvent } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const API_BASE_URL = import.meta.env.VITE_API_URL ?? "http://localhost:3000/api";

const KycUpload: React.FC = () => {
  const [files, setFiles] = useState<{
    aadhaarFront: File | null;
    aadhaarBack: File | null;
    panCard: File | null;
    selfie: File | null;
  }>({
    aadhaarFront: null,
    aadhaarBack: null,
    panCard: null,
    selfie: null,
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: "error" | "success"; text: string } | null>(null);

  const navigate = useNavigate();

  // Unified file change handler
  const onFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const { name, files: selectedFiles } = event.target;
    if (selectedFiles && selectedFiles.length > 0) {
      setFiles(prev => ({
        ...prev,
        [name]: selectedFiles[0],
      }));
    }
  };

  // Validate all files present
  const allFilesSelected = () => {
    return Object.values(files).every(file => file !== null);
  };

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setMessage(null);

    if (!allFilesSelected()) {
      setMessage({ type: "error", text: "Please upload all required documents before submitting." });
      return;
    }

    try {
      setLoading(true);
      const token = localStorage.getItem("tm_token");
      const formData = new FormData();

      // Append files dynamically
      (Object.entries(files) as [keyof typeof files, File][]).forEach(([fieldName, file]) => {
        if (file) formData.append(fieldName, file);
      });

      const { data } = await axios.post(`${API_BASE_URL}/kyc/upload`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: token ? `Bearer ${token}` : "",
        },
      });

      if (data.success) {
        setMessage({ type: "success", text: "Documents uploaded successfully! Redirecting..." });
        setTimeout(() => navigate("/kyc/status"), 2000);
      } else {
        setMessage({ type: "error", text: data.message || "Upload failed, please try again." });
      }
    } catch (error: any) {
      const errMsg =
        error.response?.data?.message ?? error.message ?? "An unexpected error occurred. Please try again.";
      setMessage({ type: "error", text: errMsg });
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={onSubmit} className="max-w-lg mx-auto p-6 bg-white rounded shadow space-y-6">
      <h2 className="text-3xl font-semibold text-center mb-6">Upload Your KYC Documents</h2>

      {message && (
        <div
          className={`p-3 rounded ${
            message.type === "error" ? "bg-red-100 text-red-700" : "bg-green-100 text-green-700"
          }`}
          role="alert"
        >
          {message.text}
        </div>
      )}

      {(["aadhaarFront", "aadhaarBack", "panCard", "selfie"] as const).map(field => (
        <label key={field} className="block">
          <span className="font-medium capitalize mb-1 block">
            {field === "selfie" ? "Selfie" : field.replace(/([A-Z])/g, " $1")}
          </span>
          <input
            type="file"
            name={field}
            accept={field === "selfie" ? "image/jpeg,image/jpg,image/png" : "image/jpeg,image/jpg,image/png,application/pdf"}
            onChange={onFileChange}
            required
            className="mt-1 block w-full rounded border border-gray-300 p-2"
            disabled={loading}
          />
        </label>
      ))}

      <button
        type="submit"
        disabled={loading}
        className={`w-full py-3 rounded text-white font-semibold ${
          loading ? "bg-blue-400 cursor-not-allowed" : "bg-blue-600 hover:bg-blue-700"
        } transition`}
      >
        {loading ? "Uploading..." : "Submit"}
      </button>
    </form>
  );
};

export default KycUpload;
