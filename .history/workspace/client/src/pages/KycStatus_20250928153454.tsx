// src/pages/KycStatus.tsx

import React, { useEffect, useState } from "react";
import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:3000/api";

const KycStatus: React.FC = () => {
  const [status, setStatus] = useState<string>("Loading...");
  const [documents, setDocuments] = useState<string[]>([]);

  useEffect(() => {
    const fetchKycStatus = async () => {
      try {
        // Make sure to call full API path with base URL
        const response = await axios.get(`${API_BASE_URL}/kyc/status`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("tmtoken")}`,
          },
        });
        // Assuming backend returns status and documents array with document paths
        setStatus(response.data.status || "Unknown");
        setDocuments(response.data.documents || []);
      } catch (error) {
        setStatus("Failed to load status");
      }
    };
    fetchKycStatus();
  }, []);

  return (
    <div className="max-w-md mx-auto p-6 bg-white rounded shadow">
      <h2 className="text-xl font-bold mb-4">Your KYC Status</h2>
      <p className="mb-4">
        <strong>Status:</strong> {status}
      </p>

      <h3 className="font-semibold mb-2">Uploaded Documents</h3>
      {documents.length === 0 ? (
        <p>No documents uploaded</p>
      ) : (
        <ul className="list-disc pl-5 mb-4">
          {documents.map((doc, index) => (
            <li key={index}>
              <a href={doc} target="_blank" rel="noopener noreferrer" className="text-blue-600 underline">
                Document {index + 1}
              </a>
            </li>
          ))}
        </ul>
      )}

      {status.toLowerCase() === "rejected" && (
        <p className="text-red-600 font-semibold">Your documents were rejected. Please upload again.</p>
      )}
    </div>
  );
};

export default KycStatus;
