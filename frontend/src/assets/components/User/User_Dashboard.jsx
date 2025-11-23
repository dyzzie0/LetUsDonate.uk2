import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import "../../../css/user.css";

export default function User_Dashboard() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [donations, setDonations] = useState([]);
  const [charities, setCharities] = useState([]);
  const [loadingCharities, setLoadingCharities] = useState(true);
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [status, setStatus] = useState(null);

  // Check for logged-in user
  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (!storedUser) {
      navigate("/login");
      return;
    }
    setUser(JSON.parse(storedUser));
  }, [navigate]);

  // Fetch donations for the user
  useEffect(() => {
    if (!user?.id) return;
    fetch(`http://localhost:8000/get_donations.php?user_id=${user.id}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.status === "success") setDonations(data.donations);
      });
  }, [user]);

  // Fetch charities
  useEffect(() => {
    fetch("http://localhost:8000/get_charities.php")
      .then((res) => res.json())
      .then((data) => {
        if (data.status === "success") setCharities(data.charities);
        setLoadingCharities(false);
      })
      .catch(() => setLoadingCharities(false));
  }, []);

  // File upload handling
  const handleChange = (e) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      setPreview(URL.createObjectURL(selectedFile));
    }
  };

  const handleDeleteFile = () => {
    setFile(null);
    setPreview(null);
  };

  // Submit new donation
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user?.id) return;

    const formData = new FormData(e.target);
    formData.append("user_id", user.id);
    if (file) formData.append("item_image", file);

    try {
      const res = await fetch("http://localhost:8000/add_donation.php", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      if (data.status === "success") {
        setStatus({ type: "success", message: data.message });
        e.target.reset();
        setFile(null);

        // Refresh donations
        fetch(`http://localhost:8000/get_donations.php?user_id=${user.id}`)
          .then((res) => res.json())
          .then((data) => {
            if (data.status === "success") setDonations(data.donations);
          });
      } else {
        setStatus({ type: "error", message: data.message });
      }
    } catch (err) {
      setStatus({ type: "error", message: "Network error. Please try again." });
    }

    setTimeout(() => setStatus(null), 6000);
  };

  // Logout
  const handleLogout = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("role");
    navigate("/login");
  };

  return (
    <>
      <div className="user-dashboard-container">
        <div className="dashboard-left">
          <div className="dashboard">
            <aside className="links">
              <ul>
                <li>
                  <i className="fa-solid fa-gauge"></i>
                <Link to ="/my_impact">My Impact</Link>
                </li>
                <li>
                  <i className="fa-solid fa-inbox"></i>
                <Link to ="/my_donations">My Donations</Link>
                </li>
                <li>
                  <i className="fa-solid fa-user"></i>
              <Link to ="/my_profile">Profile Settings</Link>
                </li>
                <li>
                  <i className="fa-solid fa-arrow-right-from-bracket"></i>
                  <button className="logout-btn" onClick={handleLogout}>
                    Logout
                  </button>
                </li>
              </ul>
            </aside>

            <main className="dashboard-main">
              <h2>Welcome, {user?.name}</h2>

              <div className="stats-container">
                <div className="stat-card">
                  <ii className="fa-solid fa-earth-africa"></ii>
                  <p className="stat-number">{(donations.length * 1.5).toFixed(1)}kg</p>
                  <p className="stat-text">CO₂ Saved</p>
                </div>

                <div className="stat-card">
                  <ii className="fa-solid fa-shirt"></ii>
                  <p className="stat-number">{donations.length}</p>
                  <p className="stat-text">Total Items Donated</p>
                </div>

                <div className="stat-card">
                  <ii className="fa-solid fa-heart"></ii>
                  <p className="stat-number">{donations.length * 2}</p>
                  <p className="stat-text">People Helped</p>
                </div>
              </div>
            </main>
          </div>
        </div>

        <div className="dashboard-right">
          <form className="new-donation" onSubmit={handleSubmit}>
            <h3>Make a New Donation</h3>
            {status && <div className={`form-message ${status.type}`}>{status.message}</div>}

            <input type="text" name="item_name" placeholder="Item Name" required />

            <select name="category" required>
              <option value="">Category</option>
              <option value="womens">Women's</option>
              <option value="mens">Men's</option>
              <option value="girls">Girl's</option>
              <option value="boys">Boy's</option>
            </select>

            <select name="type" required>
              <option value="">Type</option>
              <option value="shirt">Shirt</option>
              <option value="trouser">Trouser</option>
              <option value="jacket">Jacket</option>
              <option value="shoe">Shoes</option>
              <option value="other">Other</option>
            </select>

            <input type="number" name="quantity" min="1" placeholder="Quantity" required />
            <select name="condition" required>
              <option value="">Condition</option>
              <option value="new">New</option>
              <option value="like-new">Like New</option>
              <option value="used-good">Used - Good</option>
              <option value="used-fair">Used - Fair</option>
            </select>

            <textarea name="description" className="description" placeholder="Description" required />

            <div className="file-upload">
              <input type="file" accept="image/*" onChange={handleChange} />
              {file && preview && (
                <div className="file-preview">
                  <div className="image-preview">
                    <img src={preview} alt="Preview" className="thumbnail" onClick={() => setModalOpen(true)} />
                    <button type="button" onClick={handleDeleteFile} className="remove-btn">
                      Remove
                    </button>
                  </div>

                  {modalOpen && (
                    <div className="image-mode" onClick={() => setModalOpen(false)}>
                      <div className="mode-content" onClick={(e) => e.stopPropagation()}>
                        <img src={preview} alt="Full Preview" className="full-image" />
                        <button type="button" className="close-modal-btn" onClick={() => setModalOpen(false)}>
                          ✕
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            <input type="text" name="pickup_address" placeholder="Pickup Address" required />

            {loadingCharities ? (
              <p>Loading charities...</p>
            ) : (
              <select name="charity_name" required>
                <option value="">Select Charity</option>
                {charities.map((c) => (
                  <option key={c.charity_ID} value={c.charity_name}>
                    {c.charity_name}
                  </option>
                ))}
              </select>
            )}

            <button type="submit">Submit Donation</button>
          </form>
        </div>
      </div>

      <div className="donation-history full-width">
        <h3>Recent Donations</h3>
        <table>
          <thead>
            <tr>
              <th>Item</th>
              <th>Image</th>
              <th>Date Submitted</th>
              <th>Charity Selected</th>
              <th>Status</th>
              <th>Pickup Address</th>
            </tr>
          </thead>
          <tbody>
            {donations.length > 0 ? (
              donations.slice(0, 4).map((d) => (
                <tr key={d.donation_ID}>
                  <td>{d.item_name}</td>
                  <td>
                    {d.item_image ? (
                      <a href={`http://localhost:8000/${d.item_image}`} target="_blank" rel="noopener noreferrer">
                        <img
                          src={`http://localhost:8000/${d.item_image}`}
                          alt={d.item_name}
                          style={{ width: "50px", height: "auto", borderRadius: "4px" }}
                        />
                      </a>
                    ) : (
                      "N/A"
                    )}
                  </td>
                  <td>{d.donation_date.split(" ")[0]}</td>
                  <td>{d.charity_name}</td>
                  <td>{d.donation_status}</td>
                  <td>{d.pickup_address || "n/a"}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="6">No donations yet.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </>
  );
}
