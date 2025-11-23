import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import '../../../css/my_impact.css';


export function My_Impact() {
  const [donations, setDonations] = useState([]);
  const [loading, setLoading] = useState(true);

  const user = JSON.parse(localStorage.getItem('user') || '{}');

  useEffect(() => {
    if (!user.id) {
      setLoading(false);
      return;
    }

    fetch(`http://localhost:8000/get_donations.php?user_id=${user.id}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.status === 'success') setDonations(data.donations);
        setLoading(false);
      })
      .catch((err) => {
        console.error('Error fetching donations:', err);
        setLoading(false);
      });
  }, [user.id]);

  const totalItems = donations.length;
  const totalCO2 = (totalItems * 1.5).toFixed(1);
  const peopleHelped = totalItems * 2;

  return (
    <main className="dashboard-main">
      <div className="records-container">
        <div className="header-left">
          <h2>My Impact</h2>
        </div>

        <div className="return-right">
          <Link to="/User_dashboard" className="return-link">
            Return
          </Link>
        </div>
      </div>
      <h3>
        {' '}
        <p>
          Track your contributions and see how your donations help the community
          and environment.
        </p>
      </h3>

      {loading ? (
        <p>Loading your impact...</p>
      ) : (
        <div className="impact-grid">
          {/* Total Items Donated */}
          <div className="impact-card">
            <i className="fa-solid fa-shirt fa-2x"></i>
            <h3>{totalItems}</h3>
            <p>Total items you've donated so far.</p>
          </div>

          {/* CO₂ Saved */}
          <div className="impact-card">
            <i className="fa-solid fa-earth-africa fa-2x"></i>
            <h3>{totalCO2} kg</h3>
            <p>
              Estimated CO₂ saved by donating items instead of discarding them.
            </p>
          </div>

          {/* People Helped */}
          <div className="impact-card">
            <i className="fa-solid fa-heart fa-2x"></i>
            <h3>{peopleHelped}</h3>
            <p>Number of people who have benefited from your donations.</p>
          </div>
        </div>
      )}
    </main>
  );
}

export default My_Impact;
