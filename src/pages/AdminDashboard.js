import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { API, logoutUser } from "./api"; 
import "../styles/admin.css";
import { FaEye, FaEyeSlash } from "react-icons/fa";

const AdminDashboard = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null); // State for error message
  const [editingRoleId, setEditingRoleId] = useState(null);
  const [newRole, setNewRole] = useState("");
  const [showPasswordIds, setShowPasswordIds] = useState([]);
  const navigate = useNavigate();

  const roles = ["farmer", "distributor", "retailer", "customer"];

  useEffect(() => {
    const fetchUsers = async () => {
      setLoading(true);
      setError(null);
      const storedUser = JSON.parse(localStorage.getItem("user"));
      
      // 1. Basic Auth Check & Token Log
      if (!storedUser || storedUser.role.toLowerCase() !== "admin") {
        console.warn("ADMIN CHECK FAILED: User is not logged in or not an Admin.");
        alert("Access denied. Admins only.");
        logoutUser();
        navigate("/login");
        return;
      }
      
      if (!storedUser.token) {
          console.error("TOKEN MISSING: Admin user object found, but JWT token is missing.");
          setError("Admin token is missing. Please log in again.");
          setLoading(false);
          return;
      }

      console.log("Token Status: Token is present in localStorage.");
      
      try {
        // 2. Fetch using the secure API instance
        const response = await API.get("/all-with-passwords");
        console.log("Fetch Successful! Data received:", response.data.length, "users.");
        setUsers(response.data);
      } catch (error) {
        console.error("Admin Fetch Error Details:", error.message, error.response);
        
        // 3. Handle specific HTTP errors
        if (error.response) {
            if (error.response.status === 401 || error.response.status === 403) {
                // This means the token was sent but rejected (expired or invalid role)
                const rejectionMessage = error.response.data?.message || (error.response.status === 403 ? "Forbidden (Token role check failed)" : "Unauthorized (Token expired/invalid)");
                alert(`Authorization Failed: ${rejectionMessage}. Logging out.`);
                logoutUser();
                navigate("/login");
            } else if (error.response.status >= 500) {
                 // Server-side error
                 setError(`Server Error (${error.response.status}): Check your Spring Boot logs.`);
            } else {
                 // Other HTTP errors (e.g., 404)
                 setError(error.response.data?.message || `HTTP Error ${error.response.status}`);
            }
        } else {
            // Network failure (server down, CORS block, or unhandled request error)
            setError("Failed to connect to server. Check if Spring Boot is running on localhost:8080.");
        }
        
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, [navigate]);

  const handleLogout = () => {
    logoutUser();
    navigate("/login");
  };

  const handleDelete = async (userId) => {
    const user = users.find(u => u.id === userId);
    if (user.role.toLowerCase() === "admin") {
        alert("Admin cannot be deleted");
        return;
    }

    if (!window.confirm("Are you sure?")) return;

    try {
      await API.delete(`/${userId}`);
      setUsers(users.filter(u => u.id !== userId));
    } catch (error) {
      console.error(error);
      alert(error.response?.data?.message || "Failed to delete user.");
    }
  };

  const startEditingRole = (userId, currentRole) => {
    const user = users.find(u => u.id === userId);
    if (user.role.toLowerCase() === "admin") {
        alert("Admin role cannot be changed");
        return;
    }
    setEditingRoleId(userId);
    setNewRole(currentRole);
  };

  const saveRole = async (userId) => {
    try {
      await API.put(`/${userId}/role`, { role: newRole });
      setUsers(users.map(u => (u.id === userId ? { ...u, role: newRole } : u)));
      setEditingRoleId(null);
    } catch (error) {
      console.error(error);
      alert(error.response?.data?.message || "Failed to update role.");
    }
  };

  const togglePassword = (id) => {
    setShowPasswordIds(prev => 
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  if (loading) return <div className="loading-state">⏳ Loading all users...</div>;
  
  return (
    <div className="admin-dashboard">
      <h2>Admin Dashboard</h2>
      <button className="btn-logout" onClick={handleLogout}>Logout</button>

      {/* Display error message */}
      {error && <div className="error-message">Error: {error}</div>}

      <div className="table-wrapper">
        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>Username</th>
              <th>Name</th>
              <th>Email</th>
              <th>Password (hashed)</th>
              <th>Role</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.length === 0 && !error ? (
              <tr><td colSpan="7">No users found.</td></tr>
            ) : (
              users.map(user => (
                <tr key={user.id}>
                  <td>{user.id}</td>
                  <td>{user.username}</td>
                  <td>{user.name}</td>
                  <td>{user.email}</td>
                  <td>
                    {showPasswordIds.includes(user.id) ? user.password : "••••••••"}
                    <span
                      className="password-toggle"
                      onClick={() => togglePassword(user.id)}
                    >
                      {showPasswordIds.includes(user.id) ? <FaEyeSlash /> : <FaEye />}
                    </span>
                  </td>
                  <td>
                    {editingRoleId === user.id ? (
                      <select value={newRole} onChange={(e) => setNewRole(e.target.value)}>
                        {roles.map(role => <option key={role} value={role}>{role}</option>)}
                      </select>
                    ) : (
                      <span className={`role-badge role-${user.role.toLowerCase()}`}>{user.role}</span>
                    )}
                  </td>
                  <td>
                    {editingRoleId === user.id ? (
                      <button onClick={() => saveRole(user.id)} className="btn-save">Save</button>
                    ) : (
                      <>
                        <button onClick={() => startEditingRole(user.id, user.role)} disabled={user.role.toLowerCase() === "admin"} className="btn-edit">Edit</button>
                        <button onClick={() => handleDelete(user.id)} disabled={user.role.toLowerCase() === "admin"} className="btn-delete">Delete</button>
                      </>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdminDashboard;
