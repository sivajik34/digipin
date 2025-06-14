import React, { useEffect, useState } from "react";
import { listAllUsers } from "../services/api";

export default function AdminUsersList() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await listAllUsers();
        setUsers(response.data);
      } catch (err) {
        setError("Failed to load users");
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  if (loading) return <p>Loading users...</p>;
  if (error) return <p>{error}</p>;

  return (
    <div>
      <h2 className="text-xl font-bold mb-4">All Registered Users</h2>
      <table className="w-full border-collapse border border-gray-300">
        <thead>
          <tr className="bg-gray-200">
            <th className="border border-gray-300 p-2 text-left">ID</th>
            <th className="border border-gray-300 p-2 text-left">Email</th>
            <th className="border border-gray-300 p-2 text-left">Full Name</th>
            <th className="border border-gray-300 p-2 text-left">Active</th>
            <th className="border border-gray-300 p-2 text-left">Superuser</th>
            <th className="border border-gray-300 p-2 text-left">Verified</th>
            <th className="border border-gray-300 p-2 text-left">Phone</th>
            <th className="border border-gray-300 p-2 text-left">Role</th>
          </tr>
        </thead>
        <tbody>
          {users.length === 0 && (
            <tr>
              <td colSpan="8" className="text-center p-4">
                No users found.
              </td>
            </tr>
          )}
          {users.map((user) => (
            <tr key={user.id} className="hover:bg-gray-100">
              <td className="border border-gray-300 p-2">{user.id}</td>
              <td className="border border-gray-300 p-2">{user.email}</td>
              <td className="border border-gray-300 p-2">{user.full_name || "-"}</td>
              <td className="border border-gray-300 p-2">{user.is_active ? "Yes" : "No"}</td>
              <td className="border border-gray-300 p-2">{user.is_superuser ? "Yes" : "No"}</td>
              <td className="border border-gray-300 p-2">{user.is_verified ? "Yes" : "No"}</td>
              <td className="border border-gray-300 p-2">{user.phone_number || "-"}</td>
              <td className="border border-gray-300 p-2">{user.role || "-"}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
