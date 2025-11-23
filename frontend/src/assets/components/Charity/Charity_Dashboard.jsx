import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import '../../../css/charity.css';

export function Charity_Dashboard() {
  const [donations, setDonations] = useState([]);
  const [inventory, setInventory] = useState([]);
  const [stats, setStats] = useState({ items: 0, co2: 0, people: 0 });
  const [loading, setLoading] = useState(true);

  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const role = localStorage.getItem('role');

  useEffect(() => {
    if (!user.id || role !== 'charity') {
      window.location.href = '/login';
      return;
    }

    const fetchData = async () => {
      try {
        const donationRes = await fetch(
          `http://localhost:8000/get_donations.php?charity_id=${user.id}`
        );
        const donationData = await donationRes.json();

        const inventoryRes = await fetch(
          `http://localhost:8000/get_inventory.php?charity_id=${user.id}`
        );
        const inventoryData = await inventoryRes.json();

        if (donationData.status === 'success') setDonations(donationData.donations);
        if (inventoryData.status === 'success') setInventory(inventoryData.items);

        const totalItems = donationData.donations?.length || 0;
        setStats({
          items: totalItems,
          co2: (totalItems * 1.5).toFixed(1),
          people: totalItems * 2,
        });

        setLoading(false);
      } catch (err) {
        console.error('Could not fetch charity data:', err);
        setLoading(false);
      }
    };

    fetchData();
  }, [user.id, role]);

  // Inventory Chart
  useEffect(() => {
    if (inventory.length && window.Chart) {
      const xValues = inventory.map((item) => item.type);
      const yValues = inventory.map((item) => item.quantity);
      const barColors = ['#5b7d62', '#76a79b', '#9fc3ab', '#2d484c', '#7e8568'];

      new window.Chart('myChart', {
        type: 'pie',
        data: {
          labels: xValues,
          datasets: [
            {
              backgroundColor: barColors,
              data: yValues,
            },
          ],
        },
        options: {
          title: {
            display: true,
            text: 'Current Inventory Overview',
          },
          responsive: true,
        },
      });
    }
  }, [inventory]);

  return (
    <div className="charity-dashboard-container">
  <div className="dashboard">
  <aside className="links">
            <ul>
              <li>
              <i className="fa-solid fa-shirt"></i>
               <Link to="/charity_inventory"> Inventory</Link>
              </li>
              <li>
              <i className="fa-solid fa-warehouse"></i>
                <Link to="/charity_donations"> Donations</Link>
              </li>
              <li>
              <i className="fa-solid fa-hand-holding-heart"></i>
               <Link to="/charity_approve_donations"> Approve Donations</Link>
              </li>
              <li>
              <i className="fa-solid fa-truck"></i>
               <Link to="/charity_distribution_records"> Distribution Records</Link>
              </li>
              <li>
                <i className="fa-solid fa-arrow-right-from-bracket"></i>
                <button
                  className="logout-btn"
                  type="button"
                  onClick={() => {
                    localStorage.removeItem('user');
                    window.location.href = '/login';
                  }}
                >
                  Logout
                </button>
              </li>
            </ul>
          </aside>

    <main className="dashboard-main">
      <h2>Welcome, {user.name} Staff!</h2>

      {loading ? (
        <p>Loading dashboard...</p>
      ) : (
        <>
          <div className="stats-container">
           

            <div className="stat-card">
              <i className="fa-solid fa-leaf"></i>
              <p className="stat-number">{stats.co2} kg</p>
              <p className="stat-text">CO₂ Saved Today</p>
            </div>

            <div className="stat-card">
              <i className="fa-solid fa-shirt"></i>
              <p className="stat-number">{stats.items}</p>
              <p className="stat-text">Items Donated Today</p>
            </div>

            <div className="stat-card">
              <i className="fa-solid fa-people-group"></i>
              <p className="stat-number">{stats.people}</p>
              <p className="stat-text">People Helped Today</p>
            </div>
          </div>

          <div className="inventory-chart">
            <h3>Inventory Overview</h3>
            <canvas id="myChart" style={{ width: '100%', maxWidth: '700px' }}></canvas>
          </div>
        </>
      )}
    </main>
  </div>

  <div className="donation-history">
    <h3>Recent Donations</h3>
    <table>
      <thead>
        <tr>
          <th>User ID</th>
          <th>Name</th>
          <th>Email</th>
          <th>Category</th>
          <th>Type</th>
          <th>Date Donated</th>
          <th>Status</th>
          <th>Location</th>
        </tr>
      </thead>
      <tbody>
        {donations.length ? (
          donations.map((d) => (
            <tr key={d.donation_ID}>
              <td>{d.user_id || 'N/A'}</td>
              <td>{d.user_name || d.donor_name || 'N/A'}</td>
              <td>{d.user_email || 'N/A'}</td>
              <td>{d.category || d.item_category}</td>
              <td>{d.type || d.item_name}</td>
              <td>{d.donation_date.split(' ')[0]}</td>
              <td>{d.donation_status}</td>
              <td>{d.pickup_address || 'N/A'}</td>
            </tr>
          ))
        ) : (
          <tr>
            <td colSpan="8">No donations yet.</td>
          </tr>
        )}
      </tbody>
    </table>
  </div>
</div>
  );
}

export default Charity_Dashboard;
