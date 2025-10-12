import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import axios from "axios";
import "../styles/Register.css";

const Register = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    role: "",
  });
  const [loading, setLoading] = useState(false);
  const [passwordError, setPasswordError] = useState("");

  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });

    // Real-time password validation
    if (name === "confirmPassword" || name === "password") {
      if (formData.password && value && formData.password !== value) {
        setPasswordError("Passwords do not match!");
      } else {
        setPasswordError("");
      }
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();

    if (formData.password !== formData.confirmPassword) {
      alert("Passwords do not match!");
      return;
    }

    const userData = {
      name: formData.name,
      email: formData.email,
      password: formData.password,
      role: formData.role,
    };

    setLoading(true);
    try {
      const response = await axios.post(
        "http://localhost:8080/api/users/register",
        userData
      );

      alert("Registration Success: " + response.data.message);
      navigate("/login");
    } catch (error) {
      if (error.response?.data?.message) {
        alert("Registration Failed: " + error.response.data.message);
      } else {
        alert("Registration Failed: " + error.message);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-wrapper">
      <div className="auth-container">
        <div className="auth-box">
          <div className="auth-header">
            <h2>Create Account ✨</h2>
            <p>Join us and select your role</p>
          </div>

          <form onSubmit={handleRegister}>
            <div className="input-group">
              <label>Full Name</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                placeholder="Enter your full name"
              />
            </div>

            <div className="input-group">
              <label>Email Address</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                placeholder="Enter your email"
              />
            </div>

            <div className="input-group">
              <label>Password</label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                required
                placeholder="Create a password"
                minLength="6"
              />
            </div>

            <div className="input-group">
              <label>Confirm Password</label>
              <input
                type="password"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                required
                placeholder="Confirm your password"
                className={
                  passwordError
                    ? "password-mismatch"
                    : formData.confirmPassword
                    ? "password-match"
                    : ""
                }
              />
              {passwordError && (
                <div className="validation-message error">
                  ⚠️ {passwordError}
                </div>
              )}
            </div>

            <div className="roles-group">
              <label>Select Your Role</label>
              <div className="roles">
                {["farmer", "distributor", "retailer", "customer"].map(
                  (roleOption) => (
                    <label key={roleOption}>
                      <input
                        type="radio"
                        name="role"
                        value={roleOption}
                        checked={formData.role === roleOption}
                        onChange={handleChange}
                      />
                      <span className="radio-custom"></span>
                      {roleOption.charAt(0).toUpperCase() + roleOption.slice(1)}
                    </label>
                  )
                )}
              </div>
            </div>

            <button className="btn-primary" type="submit" disabled={loading}>
              {loading ? "Creating Account..." : "Create Account"}
            </button>
          </form>

          <p className="switch-link">
            Already have an account? <Link to="/login">Sign In</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;
