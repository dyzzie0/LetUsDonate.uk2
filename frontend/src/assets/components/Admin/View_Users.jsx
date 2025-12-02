import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import "../../../css/records.css";

export function View_Users() {
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState("");
  const [loading, setLoading] = useState(true);

  // Fetch users from Laravel API
  useEffect(() => {
    fetch("http://localhost:8000/api/view-users")
      .then((res) => res.json())
      .then((data) => {
        if (data.status === "success") {
          setUsers(data.users);
          setFilteredUsers(data.users);
        } else {
          console.error("Error fetching users:", data.message);
        }
        setLoading(false);
      })
      .catch((err) => {
        console.error("Network error:", err);
        setLoading(false);
      });
  }, []);

  useEffect(() => {
    let results = users;

    // Filter by search
    if (searchTerm.trim()) {
      results = results.filter((u) =>
        u.user_name.toLowerCase().includes(searchTerm.toLowerCase()),
      );
    }

    // Filter by role
    if (roleFilter.trim()) {
      results = results.filter(
        (u) => (u.role_name || "").toLowerCase() === roleFilter.toLowerCase(),
      );
    }

    setFilteredUsers(results);
  }, [searchTerm, roleFilter, users]);

  const handleFilter = () => {
    let results = users;
    setFilteredUsers(results);
  };

  return (
    <main className="dashboard-main">
      <div className="records-container">
        <div className="header-left">
          <h2>View Users</h2>
        </div>

        <div className="return-right">
          <ul>
            <li>
              <Link to="/admin_dashboard">Return</Link>
            </li>
            <li>
              <Link to="/add_charity">Add Charity</Link>
            </li>
          </ul>
        </div>
      </div>

      <div className="filter-bar">
        <input
          type="text"
          placeholder="Search by name..."
          className="search-input"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <select
          className="status-filter"
          value={roleFilter}
          onChange={(e) => setRoleFilter(e.target.value)}
        >
          <option value="">All Roles</option>
          <option value="donor">Donor</option>
          <option value="charity_staff">Charity Staff</option>
          <option value="admin">Admin</option>
        </select>
        <button className="filter-button" onClick={handleFilter}>
          Reset
        </button>
      </div>

      <div className="table-container">
        {loading ? (
          <p>Loading users...</p>
        ) : (
          <table className="table">
            <thead>
              <tr>
                <th>User ID</th>
                <th>Name</th>
                <th>Email</th>
                <th>Role</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.length > 0 ? (
                filteredUsers.map((user) => (
                  <tr key={user.user_ID}>
                    <td>{user.user_ID}</td>
                    <td>{user.user_name}</td>
                    <td>{user.user_email}</td>
                    <td>{user.role_name}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5">No users found.</td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>
    </main>
  );
}

export default View_Users;
