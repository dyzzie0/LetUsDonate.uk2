import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import '../../../css/records.css';


export function My_Profile() {
  const [user, setUser] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
  });
  const [status, setStatus] = useState(null);

  // Load user info from localStorage
  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      const parsed = JSON.parse(storedUser);
      setUser(parsed);
      setFormData({ name: parsed.name, email: parsed.email, password: '' });
    }
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const updatedUser = {
      ...user,
      name: formData.name,
      email: formData.email,
      ...(formData.password ? { password: formData.password } : {}),
    };
    localStorage.setItem('user', JSON.stringify(updatedUser));
    setUser(updatedUser);
    setFormData((prev) => ({ ...prev, password: '' }));
    setStatus({ type: 'success', message: 'Profile updated successfully!' });
    setTimeout(() => setStatus(null), 4000);
  };

  if (!user) return <p>Loading profile...</p>;

  return (
    <main className="dashboard-main">
      <div className="records-container">
        <div className="header-left">
          <h2>My Profile</h2>
        </div>
        <div className="return-right">
          <ul>
            <li>
             <Link to="/User_dashboard" className="return-link">
               Return
             </Link>
            </li>
          </ul>
        </div>
      </div>

      {status && (
        <div className={`form-message ${status.type}`}>{status.message}</div>
      )}

      <div className="table-container profile-form-container">
        <form onSubmit={handleSubmit} className="profile-form">
          <label>
            Name:
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
            />
          </label>

          <label>
            Email:
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
            />
          </label>

          <label>
            Password:
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Leave blank to keep current password"
            />
          </label>

          <button type="submit" className="donation-button">
            Save Changes
          </button>
        </form>
      </div>
    </main>
  );
}

export default My_Profile;
