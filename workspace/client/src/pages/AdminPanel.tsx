// src/pages/AdminPanel.tsx

import React, { useEffect, useState } from "react";
import axios from "axios";

interface User {
  id: string;
  name: string;
  email: string;
  role: "student" | "tutor" | "admin";
  isActive: boolean;
}

const AdminPanel: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Fetch all users - backend API for admin only
  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await axios.get("http://localhost:3000/api/admin/users", {
        headers: { Authorization: `Bearer ${localStorage.getItem("tm_token")}` },
      });
      setUsers(res.data.users);
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to load users.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  // Example: Activate/Deactivate user
  const toggleUserStatus = async (userId: string, activate: boolean) => {
    try {
      await axios.patch(
        `http://localhost:3000/api/admin/users/${userId}/status`,
        { active: activate },
        { headers: { Authorization: `Bearer ${localStorage.getItem("tm_token")}` } }
      );
      fetchUsers(); // Refresh list
    } catch (err: any) {
      alert(err.response?.data?.message || "Action failed.");
    }
  };

  return (
    <div className="p-6 max-w-5xl mx-auto bg-white rounded shadow">
      <h1 className="text-3xl font-bold mb-6">Admin Panel - User Management</h1>

      {error && <p className="text-red-600 font-semibold">{error}</p>}

      {loading ? (
        <p>Loading users...</p>
      ) : (
        <table className="w-full table-auto border border-gray-300 rounded">
          <thead>
            <tr className="bg-yellow-400 text-gray-900">
              <th className="border px-4 py-2">Name</th>
              <th className="border px-4 py-2">Email</th>
              <th className="border px-4 py-2">Role</th>
              <th className="border px-4 py-2">Status</th>
              <th className="border px-4 py-2">Action</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user.id} className="text-center">
                <td className="border px-4 py-2">{user.name}</td>
                <td className="border px-4 py-2">{user.email}</td>
                <td className="border px-4 py-2">{user.role}</td>
                <td className="border px-4 py-2">{user.isActive ? "Active" : "Inactive"}</td>
                <td className="border px-4 py-2">
                  {user.isActive ? (
                    <button
                      onClick={() => toggleUserStatus(user.id, false)}
                      className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600"
                    >
                      Deactivate
                    </button>
                  ) : (
                    <button
                      onClick={() => toggleUserStatus(user.id, true)}
                      className="px-3 py-1 bg-green-500 text-white rounded hover:bg-green-600"
                    >
                      Activate
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default AdminPanel;
