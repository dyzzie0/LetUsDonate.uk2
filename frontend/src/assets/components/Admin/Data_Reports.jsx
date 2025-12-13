import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import Papa from "papaparse";
import { saveAs } from "file-saver";
import "../../../css/data_reports.css";

export function Data_Reports() {
  const [donations, setDonations] = useState([]);
  const [users, setUsers] = useState([]);
  const [charities, setCharities] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const fetchJSON = async (url) => {
          const res = await fetch(url);
          if (!res.ok) throw new Error("Failed to fetch");
          return res.json();
        };

        const [donRes, userRes, charityRes] = await Promise.all([
          fetchJSON("http://127.0.0.1:8000/api/donations"),
          fetchJSON("http://127.0.0.1:8000/api/users"),
          fetchJSON("http://127.0.0.1:8000/api/charities"),
        ]);

        if (donRes.status === "success") setDonations(donRes.donations);
        if (userRes.status === "success") setUsers(userRes.users);
        if (charityRes.status === "success") setCharities(charityRes.charities);

        setLoading(false);
      } catch (err) {
        console.error("Error loading reports:", err);
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const downloadCSV = (data, filename) => {
    const csv = Papa.unparse(data);
    saveAs(
      new Blob([csv], { type: "text/csv;charset=utf-8;" }),
      filename
    );
  };

  const donationReport = () =>
    downloadCSV(
      donations.map((d) => ({
        Date: d.donation_date,
        Status: d.donation_status,
        DonorID: d.donor_ID,
        Items: d.total_items ?? d.items?.length ?? 0,
      })),
      "donations_report.csv"
    );

  const userReport = () =>
    downloadCSV(
      users.map((u) => ({
        ID: u.id,
        Name: u.name,
        Email: u.email,
        Registered: u.created_at,
      })),
      "users_report.csv"
    );

  const sustainabilityReport = () =>
    downloadCSV(
      [
        {
          Total_CO2_Reduced_kg: donations.reduce(
            (sum, d) =>
              sum + (d.total_items ?? d.items?.length ?? 0) * 1.5,
            0
          ),
        },
      ],
      "sustainability_report.csv"
    );

  const charityReport = () =>
    downloadCSV(
      charities.map((c) => ({
        Charity: c.charity_name,
        DonationsReceived: donations.filter(
          (d) => d.charity?.id === c.id
        ).length,
        Contact: c.contact_person,
        Email: c.charity_email,
        Address: c.charity_address,
      })),
      "charity_report.csv"
    );

  const downloadAll = () => {
    donationReport();
    userReport();
    sustainabilityReport();
    charityReport();
  };

  return (
    <main>
      <div className="records-container">
        <h2>Generate Reports</h2>
        <Link to="/admin_dashboard">Return</Link>
      </div>

      {loading ? (
        <p>Loading data...</p>
      ) : (
        <div className="table-container">
          <table className="table">
            <thead>
              <tr>
                <th>Report</th>
                <th>Description</th>
                <th>Download</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Donations</td>
                <td>Donation history and status</td>
                <td>
                  <button onClick={donationReport}>Download</button>
                </td>
              </tr>

              <tr>
                <td>Users</td>
                <td>Registered users</td>
                <td>
                  <button onClick={userReport}>Download</button>
                </td>
              </tr>

              <tr>
                <td>Sustainability</td>
                <td>Total CO₂ reduction</td>
                <td>
                  <button onClick={sustainabilityReport}>Download</button>
                </td>
              </tr>

              <tr>
                <td>Charities</td>
                <td>Charity donation totals</td>
                <td>
                  <button onClick={charityReport}>Download</button>
                </td>
              </tr>

              <tr>
                <td>
                  <strong>All Reports</strong>
                </td>
                <td>Download every report</td>
                <td>
                  <button onClick={downloadAll}>Download All</button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      )}
    </main>
  );
}

export default Data_Reports;
