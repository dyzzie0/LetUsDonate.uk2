import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import "../../../css/records.css";

// Component to manage charities and their staff
export function Manage_Charity() {
  const [charities, setCharities] = useState([]); // All charities fetched from API
  const [loading, setLoading] = useState(true);  // Loading state
  const [editingId, setEditingId] = useState(null); // ID of charity being edited
  const [editData, setEditData] = useState({
    charity_name: "",
    charity_address: "",
    charity_email: "",
    contact_person: "",
  });

  // Fetch charities on component mount
  useEffect(() => {
    fetchCharities();
  }, []);

  // Fetch charities including staff from API
  const fetchCharities = async () => {
    try {
      const res = await fetch("http://localhost:8000/api/charities");
      const data = await res.json();
      // Data should include staff array
      setCharities(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Error fetching charities:", err);
      setCharities([]);
    } finally {
      setLoading(false);
    }
  };

  // Start editing a charity
  const startEditing = (charity) => {
    setEditingId(charity.charity_ID);
    setEditData({
      charity_name: charity.charity_name,
      charity_address: charity.charity_address,
      charity_email: charity.charity_email,
      contact_person: charity.contact_person,
    });
  };

  // Handle changes in the edit form
  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setEditData((prev) => ({ ...prev, [name]: value }));
  };

  // Save edited charity
  const saveEdit = async (id) => {
    try {
      const res = await fetch(`http://localhost:8000/api/charities/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editData),
      });
      const data = await res.json();
      if (data.status === "success") {
        fetchCharities(); // Refresh list after update
        setEditingId(null); // Close edit form
      } else {
        alert("Error updating charity: " + data.message);
      }
    } catch (err) {
      alert("Network error. Please try again.");
    }
  };

  // Cancel editing
  const cancelEdit = () => setEditingId(null);

  // Delete charity
  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this charity?")) return;
    try {
      const res = await fetch(`http://localhost:8000/api/charities/${id}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (data.status === "success") {
        fetchCharities();
      } else {
        alert("Error deleting charity: " + data.message);
      }
    } catch (err) {
      alert("Network error. Please try again.");
    }
  };

  return (
    <main className="dashboard-main">
      <div className="records-container">
        <div className="header-left">
          <h2>Manage Charities</h2>
        </div>
        <div className="return-right">
          <ul>
            <li>
              <Link to="/add_charity">Return</Link>
            </li>
          </ul>
        </div>
      </div>

      <div className="table-container">
        {loading ? (
          <p>Loading charities...</p>
        ) : (
          <table className="table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Address</th>
                <th>Email</th>
                <th>Contact</th>
                <th>Staff</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {Array.isArray(charities) && charities.length > 0 ? (
                charities.map((c) => (
                  <tr key={c.charity_ID}>
                    {editingId === c.charity_ID ? (
                      <>
                        <td>
                          <input
                            type="text"
                            name="charity_name"
                            value={editData.charity_name}
                            onChange={handleEditChange}
                          />
                        </td>
                        <td>
                          <input
                            type="text"
                            name="charity_address"
                            value={editData.charity_address}
                            onChange={handleEditChange}
                          />
                        </td>
                        <td>
                          <input
                            type="email"
                            name="charity_email"
                            value={editData.charity_email}
                            onChange={handleEditChange}
                          />
                        </td>
                        <td>
                          <input
                            type="text"
                            name="contact_person"
                            value={editData.contact_person}
                            onChange={handleEditChange}
                          />
                        </td>
                        <td>
                          {c.staff.map((s) => s.user_name).join(", ")}
                        </td>
                        <td>
                          <button onClick={() => saveEdit(c.charity_ID)}>
                            Save
                          </button>
                          <button onClick={cancelEdit}>Cancel</button>
                        </td>
                      </>
                    ) : (
                      <>
                        <td>{c.charity_name || "N/A"}</td>
                        <td>{c.charity_address || "N/A"}</td>
                        <td>{c.charity_email || "N/A"}</td>
                        <td>{c.contact_person || "N/A"}</td>
                        <td>{c.staff.map((s) => s.user_name).join(", ")}</td>
                        <td>
                          <button onClick={() => startEditing(c)}>Edit</button>
                          <button onClick={() => handleDelete(c.charity_ID)}>
                            Delete
                          </button>
                        </td>
                      </>
                    )}
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6">No charities found.</td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>
    </main>
  );
}

export default Manage_Charity;
