import React, { useState, ChangeEvent, FormEvent } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:3000/api";

const KycUpload: React.FC = () => {
  const [aadhaarFront, setAadhaarFront] = useState<File | null>(null);
  const [aadhaarBack, setAadhaarBack] = useState<File | null>(null);
  const [panCard, setPanCard] = useState<File | null>(null);
  const [selfie, setSelfie] = useState<File | null>(null);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const navigate = useNavigate();

  const onFileChange =
    (setter: React.Dispatch<React.SetStateAction<File | null>>) =>
    (e: ChangeEvent<HTMLInputElement>) => {
      if (e.target.files && e.target.files[0]) {
        setter(e.target.files[0]);
      }
    };

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!aadhaarFront || !aadhaarBack || !panCard || !selfie) {
      setError("All documents are required.");
      return;
    }
    setLoading(true);

    const formData = new FormData();
    formData.append("aadhaarFront", aadhaarFront);
    formData.append("aadhaarBack", aadhaarBack);
    formData.append("panCard", panCard);
    formData.append("selfie", selfie);

    try {
      const token = localStorage.getItem("token");
      const res = await axios.post(`${API_BASE_URL}/kyc/upload`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: `Bearer ${token}`,
        },
      });

      if (res.data.success) {
        setSuccess("Documents uploaded successfully. Waiting for approval.");
        setTimeout(() => {
          navigate("/kyc-status");
        }, 2000);
      } else {
        setError("Failed to upload documents. Please try again.");
      }
    } catch (err: any) {
      setError(err.response?.data?.message || "Upload error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={onSubmit} className="max-w-md mx-auto p-6 bg-white rounded shadow space-y-4">
      <h2 className="text-2xl font-bold mb-4">Upload KYC Documents</h2>

      {error && <p className="text-red-600">{error}</p>}
      {success && <p className="text-green-600">{success}</p>}

      <label>
        Aadhaar Front:
        <input type="file" accept=".jpg,.jpeg,.png,.pdf" onChange={onFileChange(setAadhaarFront)} required />
      </label>

      <label>
        Aadhaar Back:
        <input type="file" accept=".jpg,.jpeg,.png,.pdf" onChange={onFileChange(setAadhaarBack)} required />
      </label>

      <label>
        PAN Card:
        <input type="file" accept=".jpg,.jpeg,.png,.pdf" onChange={onFileChange(setPanCard)} required />
      </label>

      <label>
        Selfie:
        <input type="file" accept=".jpg,.jpeg,.png" onChange={onFileChange(setSelfie)} required />
      </label>

      <button type="submit" disabled={loading} className="btn btn-primary w-full">
        {loading ? "Uploading..." : "Submit"}
      </button>
    </form>
  );
};

export default KycUpload;
