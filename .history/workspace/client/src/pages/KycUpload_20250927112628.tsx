// src/pages/KycUpload.tsx
import React, { useState } from "react";
import axios from "axios";

const KycUpload: React.FC = () => {
  const [file, setFile] = useState<File | null>(null);
  const [message, setMessage] = useState<string>("");

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setFile(e.target.files[0]);
    }
  };

  const handleUpload = async () => {
    if (!file) {
      alert("Please select a file.");
      return;
    }
    const formData = new FormData();
    formData.append("kycDoc", file);

    try {
      await axios.post("/api/kyc/upload", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setMessage("Document uploaded successfully! Please wait for approval.");
    } catch (err) {
      setMessage("Upload failed. Please try again.");
    }
  };

  return (
    <div>
      <h2>Upload Your KYC Documents</h2>
      <input type="file" onChange={handleFileChange} />
      <button onClick={handleUpload}>Upload</button>
      {message && <p>{message}</p>}
    </div>
  );
};

export default KycUpload;
