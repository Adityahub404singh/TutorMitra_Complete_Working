import React, { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:3000/api";

function isProfileComplete(profile: any) {
  // Ye criteria tum customize kar sakte ho
  return Boolean(profile.name && profile.phone && profile.subjects);
}

const TutorAuthWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function checkAuth() {
      const token = localStorage.getItem("tm_token");
      if (!token) {
        navigate("/login"); // Agar login nahi hai to login page pe bhejo
        return;
      }
      try {
        const res = await axios.get(`${API_BASE_URL}/tutors/profile`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const profile = res.data;

        if (!isProfileComplete(profile)) {
          // Profile incomplete → registration page pe redirect karna
          if (location.pathname !== "/tutor-register") {
            navigate("/tutor-register");
            return;
          }
        } else if (profile.kycStatus !== "verified") {
          // KYC incomplete → KYC upload page pe redirect karna
          if (!location.pathname.startsWith("/kyc")) {
            navigate("/kyc/upload");
            return;
          }
        } else {
          // Profile & KYC dono complete hain
          // Agar register ya kyc page pe hai to home pe redirect karo
          if (
            location.pathname === "/tutor-register" ||
            location.pathname.startsWith("/kyc")
          ) {
            navigate("/tutor-home");
            return;
          }
        }
      } catch (error) {
        // Error aaye to login page pe bhejdo
        navigate("/login");
        return;
      } finally {
        setLoading(false);
      }
    }
    checkAuth();
  }, [location.pathname]);

  if (loading) return <div>Loading...</div>;

  return <>{children}</>;
};

export default TutorAuthWrapper;
