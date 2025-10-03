// src/pages/TutorDashboard.tsx
import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:3000/api";

const TutorDashboard: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [kycStatus, setKycStatus] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    async function loadProfile() {
      setLoading(true);
      setError(null);

      try {
        const token = localStorage.getItem("tm_token"); // Use tm_token exactly
        if (!token) {
          navigate("/login");
          return;
        }
        const response = await axios.get(`${API_BASE_URL}/tutor/profile`, {
          headers: { Authorization: `Bearer ${token}` }, // Correct token usage
        });
        setKycStatus(response.data.kycStatus);
      } catch (err) {
        setError("Failed to load profile.");
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadProfile();
  }, [navigate]);

  if (loading) return <div>Loading dashboard...</div>;
  if (error) return <div>{error}</div>;

  return (
    <div>
      <h1>Welcome to Tutor Dashboard</h1>
      <p>Your KYC Status: {kycStatus ?? "Unavailable"}</p>

      {(kycStatus === "pending" || kycStatus === "not_started" || kycStatus === "rejected") && (
        <Link to="/kyc/upload" className="btn btn-primary">
          Complete your KYC Now
        </Link>
      )}

      {kycStatus === "verified" && (
        <p>Your account is fully verified. You can create courses and receive payments.</p>
      )}
    </div>
  );
};

export default TutorDashboard;
