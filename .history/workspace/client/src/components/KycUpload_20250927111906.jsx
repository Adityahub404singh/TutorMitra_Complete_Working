import React, { useState } from 'react';
import axios from 'axios';

const KycUpload = () => {
  const [file, setFile] = useState(null);
  const [message, setMessage] = useState('');

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleUpload = async () => {
    if (!file) {
      alert('Please select a file.');
      return;
    }
    const formData = new FormData();
    formData.append('kycDoc', file);

    try {
      const res = await axios.post('/api/kyc/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setMessage('Document uploaded successfully! Your KYC is under review.');
    } catch (error) {
      setMessage('Upload failed. Please try again.');
    }
  };

  return (
    <div>
      <h2>Upload KYC Documents</h2>
      <input type="file" onChange={handleFileChange} />
      <button onClick={handleUpload}>Upload</button>
      <div>{message}</div>
    </div>
  );
};

export default KycUpload;
