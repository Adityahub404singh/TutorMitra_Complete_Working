import React, { useEffect, useState } from 'react';
import axios from 'axios';

const KycStatus = () => {
  const [status, setStatus] = useState('');
  const [documents, setDocuments] = useState([]);

  useEffect(() => {
    axios.get('/api/kyc/status')
      .then(res => {
        setStatus(res.data.kycStatus);
        setDocuments(res.data.kycDocuments);
      })
      .catch(() => setStatus('Error loading status'));
  }, []);

  return (
    <div>
      <h2>KYC Status</h2>
      <p>Status: {status}</p>
      <h3>Uploaded Documents:</h3>
      <ul>
        {documents.map((doc, idx) => (
          <li key={idx}>
            <a href={doc} target="_blank" rel="noopener noreferrer">Document {idx + 1}</a>
          </li>
        ))}
      </ul>
      {status === 'rejected' && (
        <p>Your KYC was rejected. Please upload documents again.</p>
      )}
    </div>
  );
};

export default KycStatus;
