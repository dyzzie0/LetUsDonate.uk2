import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import "../../css/sign_up_login.css";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    try {
      const response = await fetch("http://localhost:8000/api/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();
      console.log("Login response:", response.status, data);

      if (response.ok && data.status === "success") {
        localStorage.setItem("user", JSON.stringify(data.user));
        localStorage.setItem("role", String(data.user.role_id));

        const role = String(data.user.role_id);

        if (role === "12") {
          navigate("/admin_dashboard");
        } else if (role === "11") {
          navigate("/charity_dashboard");
        } else if (role === "10") {
          navigate("/user_dashboard");
        } else {
          console.log("Unknown role_id:", role);
          setError("Login failed: Unknown role assigned to account");
        }
      } else {
        //show the actual error message from the server
        setError(data.message || "Invalid email or password");
      }
    } catch (err) {
      console.error("Login error:", err);
      setError("Error connecting to server");
    }
  };

  return (
    <div className="middle">
      <div className="return_home">
        <Link to="/">Return</Link>
      </div>
      <h2>Welcome Back</h2>
      <p>Sign in to your account</p>

      <form onSubmit={handleSubmit}>
        <div className="input-box">
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <i className="fa-solid fa-envelope"></i>
        </div>

        <div className="input-box">
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <i className="fa-solid fa-lock"></i>
        </div>

        {error && <p style={{ color: "red" }}>{error}</p>}

        <div className="signup_link">
          <Link to="/sign_up">Don't have an account?</Link>
        </div>

        <div className="sub-btn">
          <button type="submit" className="btn">
            Login
          </button>
        </div>
      </form>
    </div>
  );
}
