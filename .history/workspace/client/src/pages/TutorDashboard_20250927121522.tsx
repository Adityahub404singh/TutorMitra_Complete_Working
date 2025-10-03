import React, { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:3000/api";

const TutorDashboard: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [kycStatus, setKycStatus] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    async function fetchProfile() {
      try {
        const token = localStorage.getItem("tm_token");
        const res = await axios.get(`${API_BASE_URL}/tutors/profile`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setKycStatus(res.data.kycStatus);

        if (res.data.kycStatus === "pending" || res.data.kycStatus === "not_started") {
          // Redirect to KYC page if not completed
          navigate("/tutor/kyc");
        }
      } catch (error) {
        console.error("Error fetching profile:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchProfile();
  }, [navigate]);

  if (loading) return <div>Loading...</div>;

  return (
    <div>
      <h1>Welcome to Tutor Dashboard</h1>
      <p>KYC Status: {kycStatus}</p>
      {(kycStatus === "not_started" || kycStatus === "rejected") && (
        <Link to="/tutor/kyc" className="btn btn-primary">
          Complete Your KYC
        </Link>
      )}
      {/* other dashboard content here */}
    </div>
  );
};

export default TutorDashboard;
