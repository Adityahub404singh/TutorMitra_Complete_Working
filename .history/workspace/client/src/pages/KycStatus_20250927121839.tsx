import React, { useEffect, useState } from "react";
import axios from "axios";

const KycStatus: React.FC = () => {
  const [status, setStatus] = useState("Loading...");
  const [documents, setDocuments] = useState<string[]>([]);

  useEffect(() => {
    axios
      .get("/api/kyc/status")
      .then((response) => {
        setStatus(response.data.status);
        setDocuments(response.data.documents || []);
      })
      .catch(() => {
        setStatus("Failed to load status");
      });
  }, []);

  return (
    <div>
      <h2>Your KYC Status</h2>
      <p>Status: {status}</p>

      <h3>Uploaded Documents</h3>
      {documents.length === 0 ? (
        <p>No documents uploaded</p>
      ) : (
        <ul>
          {documents.map((doc, i) => (
            <li key={i}>
              <a href={doc} target="_blank" rel="noopener noreferrer">
                Document {i + 1}
              </a>
            </li>
          ))}
        </ul>
      )}

      {status.toLowerCase() === "rejected" && (
        <p>Your documents were rejected. Please upload again.</p>
      )}
    </div>
  );
};

export default KycStatus;
