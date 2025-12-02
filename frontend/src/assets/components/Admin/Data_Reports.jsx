import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { saveAs } from "file-saver";
import "../../../css/data_reports.css";
import Papa from "papaparse";

export function Data_Reports() {
  const [donations, setDonations] = useState([]);
  const [users, setUsers] = useState([]);
  const [charities, setCharities] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetching all necessary data
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [donRes, userRes, charityRes] = await Promise.all([
          fetch("http://127.0.0.1:8000/api/donations").then((res) =>
            res.json(),
          ),
          fetch("http://127.0.0.1:8000/api/users").then((res) => res.json()),
          fetch("http://127.0.0.1:8000/api/charities").then((res) =>
            res.json(),
          ),
        ]);

        if (donRes.status === "success") setDonations(donRes.donations);
        if (userRes.status === "success") setUsers(userRes.users);
        if (charityRes.status === "success") setCharities(charityRes.charities);

        setLoading(false);
      } catch (err) {
        console.error("Error fetching data:", err);
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Controlling report generation

  const generateReportDonations = () => {
    const donationData = donations.map((d) => ({
      Date: d.donation_date,
      Status: d.donation_status,
      DonorID: d.donor_ID,
      Items: d.items?.length || 0,
    }));

    const csv = Papa.unparse(donationData);
    saveAs(
      new Blob([csv], { type: "text/csv;charset=utf-8;" }),
      "donation_report.csv",
    );
  };

  const generateReportUsers = () => {
    const userData = users.map((u) => ({
      UserID: u.user_ID,
      Name: u.name,
      Email: u.email,
      Registered: u.registered_date,
    }));

    const csv = Papa.unparse(userData);
    saveAs(
      new Blob([csv], { type: "text/csv;charset=utf-8;" }),
      "users_report.csv",
    );
  };

  const generateReportSustainability = () => {
    const totalCO2 = donations.reduce(
      (sum, d) => sum + (d.items?.length || 0) * 1.5,
      0,
    );
    const sustainabilityData = [{ TotalCO2Reduced_kg: totalCO2 }];

    const csv = Papa.unparse(sustainabilityData);
    saveAs(
      new Blob([csv], { type: "text/csv;charset=utf-8;" }),
      "sustainability_report.csv",
    );
  };

  const generateReportCharities = () => {
    const charityData = charities.map((c) => {
      const donationsReceived = donations.filter(
        (d) => d.charity?.charity_ID === c.charity_ID,
      ).length;
      return {
        Charity: c.charity_name,
        DonationsReceived: donationsReceived,
        Contact: c.contact_person,
        Email: c.charity_email,
        Address: c.charity_address,
      };
    });

    const csv = Papa.unparse(charityData);
    saveAs(
      new Blob([csv], { type: "text/csv;charset=utf-8;" }),
      "charity_report.csv",
    );
  };

  // Generate all reports at once
  const generateAllReports = () => {
    generateReportDonations();
    generateReportUsers();
    generateReportSustainability();
    generateReportCharities();
  };

  return (
    <main>
      <div className="records-container">
        <div className="header-left">
          <h2>Generate Reports</h2>
        </div>

        <div className="return-right">
          <ul>
            <li>
              <Link to="/admin_dashboard">Return</Link>
            </li>
          </ul>
        </div>
      </div>

      {loading ? (
        <p>Loading data...</p>
      ) : (
        <div className="table-container">
          <table className="table">
            <thead>
              <tr>
                <th>Report Type</th>
                <th>Description</th>
                <th>Download</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Donations Report</td>
                <td>Shows number of donations per day.</td>
                <td>
                  <button onClick={generateReportDonations}>Download</button>
                </td>
              </tr>

              <tr>
                <td>User Report</td>
                <td>Lists new registered users for the period.</td>
                <td>
                  <button onClick={generateReportUsers}>Download</button>
                </td>
              </tr>

              <tr>
                <td>Sustainability Report</td>
                <td>Displays total CO₂ reduced through donations.</td>
                <td>
                  <button onClick={generateReportSustainability}>
                    Download
                  </button>
                </td>
              </tr>

              <tr>
                <td>Charity Report</td>
                <td>
                  Shows each charity’s total donations received with contact
                  info.
                </td>
                <td>
                  <button onClick={generateReportCharities}>Download</button>
                </td>
              </tr>

              <tr>
                <td>
                  <strong>All Reports</strong>
                </td>
                <td>Generate and download all reports at once.</td>
                <td>
                  <button onClick={generateAllReports}>Download All</button>
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
