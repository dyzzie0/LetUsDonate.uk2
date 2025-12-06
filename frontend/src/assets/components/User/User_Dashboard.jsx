import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { QRCodeCanvas } from "qrcode.react";
import "../../../css/user.css";
import "../../../css/modal.css";

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
  const [modalImage, setModalImage] = useState(null);
  const [remoteSessionId, setRemoteSessionId] = useState(null);
  const [remoteModalOpen, setRemoteModalOpen] = useState(false);
  const [polling, setPolling] = useState(false);

  // Load logged in user
  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (!storedUser) {
      navigate("/login");
      return;
    }
    setUser(JSON.parse(storedUser));
  }, [navigate]);

  // Load donations
  useEffect(() => {
    if (!user?.donor?.donor_ID) return;

    fetch(`http://localhost:8000/api/donations/user/${user.donor.donor_ID}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.status === "success") setDonations(data.donations);
      })
      .catch((err) => console.error("Donation fetch error:", err));
  }, [user]);

  // Load charities
  useEffect(() => {
    fetch("http://localhost:8000/api/charities")
      .then((res) => res.json())
      .then((data) => {
        setCharities(data);
        setLoadingCharities(false);
      })
      .catch(() => setLoadingCharities(false));
  }, []);

  const getCharityName = (id) => {
    const c = charities.find((x) => x.charity_ID === id);
    return c ? c.charity_name : "Unknown";
  };

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

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user?.donor?.donor_ID) return;

    const formData = new FormData();
    const fields = new FormData(e.target);

    formData.append("item_name", fields.get("item_name"));
    formData.append("category", fields.get("category"));
    formData.append("quantity", fields.get("quantity"));
    formData.append("size", fields.get("size"));
    formData.append("condition", fields.get("condition"));
    formData.append("description", fields.get("description"));
    formData.append("pickup_address", fields.get("pickup_address"));
    formData.append("charity_ID", fields.get("charity_ID"));
    formData.append("donor_ID", user.donor.donor_ID);

    if (file) formData.append("image", file);

    try {
      const res = await fetch("http://localhost:8000/api/donations", {
        method: "POST",
        headers: { Accept: "application/json" },
        body: formData,
      });

      const data = await res.json();

      if (data.status === "success") {
        setStatus({ type: "success", message: data.message });
        e.target.reset();
        setFile(null);

        fetch(`http://localhost:8000/api/donations/user/${user.donor.donor_ID}`)
          .then((res) => res.json())
          .then((data) => {
            if (data.status === "success") setDonations(data.donations);
          });
      } else {
        setStatus({ type: "error", message: data.message });
      }
    } catch (err) {
      setStatus({ type: "error", message: "Network error. Try again." });
    }

    setTimeout(() => setStatus(null), 6000);
  };

  const handleLogout = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("role");
    navigate("/login");
  };

  // Create phone-session
  const startRemoteSession = async () => {
    try {
      const res = await fetch("http://localhost:8000/api/remote-sessions", {
        method: "POST",
        headers: { Accept: "application/json" },
      });
      const data = await res.json();

      if (data.status === "success") {
        setRemoteSessionId(data.session_id);
        setRemoteModalOpen(true);
        setPolling(true);
      }
    } catch (err) {
      console.error("Remote session error:", err);
    }
  };

  // Poll for phone-uploaded image
  useEffect(() => {
    if (!remoteSessionId || !polling) return;

    const interval = setInterval(async () => {
      try {
        const res = await fetch(
          `http://localhost:8000/api/remote-upload/${remoteSessionId}`
        );
        const data = await res.json();

        if (data.status === "ready" && data.image_url) {
          setPolling(false);

          const fullUrl = data.image_url.startsWith("http")
            ? data.image_url
            : `http://localhost:8000${data.image_url}`;

          const resp = await fetch(fullUrl);
          const blob = await resp.blob();
          const filename = `remote-${remoteSessionId}.jpg`;

          const fileFromRemote = new File([blob], filename, {
            type: blob.type,
          });

          setFile(fileFromRemote);
          setPreview(URL.createObjectURL(fileFromRemote));
          setRemoteModalOpen(false);
        }
      } catch (err) {
        console.error("Polling error:", err);
      }
    }, 2000);

    return () => clearInterval(interval);
  }, [remoteSessionId, polling]);

  return (
    <>
      <div className="user-dashboard-container">
        <div className="dashboard-left">
          <div className="dashboard">
            <aside className="links">
              <ul>
                <li>
                  <i className="fa-solid fa-gauge"></i>
                  <Link to="/my_impact">My Impact</Link>
                </li>
                <li>
                  <i className="fa-solid fa-inbox"></i>
                  <Link to="/my_donations">My Donations</Link>
                </li>
                <li>
                  <i className="fa-solid fa-user"></i>
                  <Link to="/my_profile">Profile Settings</Link>
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
                  <i className="fa-solid fa-earth-africa"></i>
                  <p className="stat-number">
                    {(donations.length * 1.5).toFixed(1)}kg
                  </p>
                  <p className="stat-text">CO₂ Saved</p>
                </div>

                <div className="stat-card">
                  <i className="fa-solid fa-shirt"></i>
                  <p className="stat-number">{donations.length}</p>
                  <p className="stat-text">Total Items Donated</p>
                </div>

                <div className="stat-card">
                  <i className="fa-solid fa-heart"></i>
                  <p className="stat-number">{donations.length * 1}</p>
                  <p className="stat-text">People Helped</p>
                </div>
              </div>
            </main>
          </div>
        </div>

        <div className="dashboard-right">
          <form className="new-donation" onSubmit={handleSubmit}>
            <h3>Make a New Donation</h3>

            {status && (
              <div className={`form-message ${status.type}`}>
                {status.message}
              </div>
            )}

            <input type="text" name="item_name" placeholder="Item Name" required />

            <select name="category" required>
              <option value="">Category</option>
              <option value="womens">Women's</option>
              <option value="mens">Men's</option>
              <option value="girls">Girl's</option>
              <option value="boys">Boy's</option>
            </select>

            <select name="size" required>
              <option value="">Size</option>
              <option value="XS">XS</option>
              <option value="S">S</option>
              <option value="M">M</option>
              <option value="L">L</option>
              <option value="XL">XL</option>
              <option value="XXL">XXL</option>
              </select>

            <select name="condition" required>
              <option value="">Condition</option>
              <option value="new">New</option>
              <option value="like-new">Like New</option>
              <option value="used-good">Used - Good</option>
              <option value="used-fair">Used - Fair</option>
            </select>

            <textarea
              name="description"
              className="description"
              placeholder="Description"
            ></textarea>

            <div className="file-upload">
              <label htmlFor="image">Upload Image:</label>
              <input
                type="file"
                name="image"
                id="image"
                accept="image/*"
                onChange={handleChange}
              />

              <button
                type="button"
                style={{ marginTop: "0.5rem" }}
                onClick={startRemoteSession}
              >
                Use phone camera
              </button>

              {file && preview && (
                <div className="image-preview">
                  <img
                    src={preview}
                    alt="Preview"
                    className="thumbnail"
                    onClick={() => {
                      setModalImage(preview);
                      setModalOpen(true);
                    }}
                  />
                  <button
                    type="button"
                    className="remove-btn"
                    onClick={handleDeleteFile}
                  >
                    Remove
                  </button>
                </div>
              )}
            </div>

            <input
              type="text"
              name="pickup_address"
              placeholder="Pickup Address"
              required
            />

            {loadingCharities ? (
              <p>Loading charities...</p>
            ) : (
              <select name="charity_ID" required>
                <option value="">Select Charity</option>
                {charities.map((c) => (
                  <option key={c.charity_ID} value={c.charity_ID}>
                    {c.charity_name}
                  </option>
                ))}
              </select>
            )}

            <button type="submit">Submit Donation</button>
            </form>
            </div>
            </div>

            {/* Donation history */}
            <div className="donation-history full-width">
            <h3>Recent Donations</h3>

            <table>
            <thead>
            <tr>
              <th>Item</th>
              <th>Size</th>
              <th>Image</th>
              <th>Date Submitted</th>
              <th>Charity</th>
              <th>Status</th>
              <th>Pickup Address</th>
            </tr>
            </thead>

            <tbody>
            {donations.length > 0 ? (
              donations.slice(0, 4).map((d) => {
                const item = d.items?.[0];
                const imgUrl = item?.item_image
                  ? (() => {
                      let path = item.item_image
                        .replace(/^public\//, "")
                        .replace(/^\/+/, "");
                      return path.startsWith("http")
                        ? path
                        : `http://localhost:8000/storage/${path}`;
                    })()
                  : null;

                return (
                  <tr key={d.donation_ID}>
                    <td>{item?.item_name ?? "N/A"}</td>
                    <td>{item?.item_size ?? "N/A"}</td>
                    <td>
                      {imgUrl ? (
                        <img
                          src={imgUrl}
                          alt={item?.item_name}
                          style={{
                            width: "50px",
                            height: "auto",
                            borderRadius: "4px",
                            cursor: "pointer",
                          }}
                          onClick={() => {
                            setModalImage(imgUrl);
                            setModalOpen(true);
                          }}
                        />
                      ) : (
                        "N/A"
                      )}
                    </td>
                    <td>{new Date(d.donation_date).toLocaleDateString()}</td>
                    <td>{getCharityName(d.charity_ID)}</td>
                    <td>{d.donation_status}</td>
                    <td>{d.pickup_address || "N/A"}</td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan="7">No donations yet.</td>
              </tr>
            )}
            </tbody>
            </table>

            {/* IMAGE PREVIEW MODAL */}
            {modalOpen && modalImage && (
            <div className="image-modal" onClick={() => setModalOpen(false)}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              <img src={modalImage} alt="Full Preview" className="full-image" />
              <button
                className="close-modal-btn"
                onClick={() => setModalOpen(false)}
              >
                ✕
              </button>
            </div>
            </div>
            )}

            {/* 🔥 PHONE QR UPLOAD MODAL (ADDED HERE) */}
            {remoteModalOpen && remoteSessionId && (
            <div className="image-modal" onClick={() => setRemoteModalOpen(false)}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              <h3>Scan with your phone</h3>
              <p>Use your phone camera to take a photo remotely.</p>

              <QRCodeCanvas
                value={`http://localhost:5173/phone-upload/${remoteSessionId}`}
                size={220}
                includeMargin={true}
              />

              <p style={{ marginTop: "1rem", fontSize: "0.85rem" }}>
                Or enter manually:  
                <br />
                <code>http://localhost:5173/phone-upload/{remoteSessionId}</code>
              </p>

              <button
                className="close-modal-btn"
                onClick={() => setRemoteModalOpen(false)}
              >
                ✕
              </button>
            </div>
            </div>
            )}
            </div>
            </>
            );
            }
