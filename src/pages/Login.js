import  { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { loginUser } from "./api"; 
import "../styles/Login.css";

const Login = ({ setUser }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const user = await loginUser(email, password);
      setUser(user);

      // Role-based dashboard routing
      const dashboardPaths = {
        admin: "/admin-dashboard",
        farmer: "/farmer-dashboard",
        distributor: "/distributor-dashboard",
        retailer: "/retailer-dashboard",
        customer: "/customer-dashboard",
      };

      const path = dashboardPaths[user.role?.toLowerCase()];
      if (!path) throw new Error("Invalid user role");

      navigate(path);
    } catch (err) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <div className="auth-wrapper">
      <div className="auth-background">
        <div className="floating-element"></div>
        <div className="floating-element"></div>
        <div className="floating-element"></div>
        <div className="floating-element"></div>
        <div className="floating-element"></div>
      </div>
      
      
      <div className="auth-container">
        <div className="auth-box">
          <div className="auth-header">
            <h2>Welcome Back 👋</h2>
            <p>Sign in to your account to continue</p>
          </div>

          <form onSubmit={handleLogin}>
            <div className="input-group">
              <label>Email Address</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="Enter your email"
              />
            </div>

            <div className="input-group">
              <label>Password</label>
              <div className="password-input-container">
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  placeholder="Enter your password"
                />
                <button
                  type="button"
                  className="toggle-password"
                  onClick={togglePasswordVisibility}
                >
                  {showPassword ? "🙈" : "👁️"}
                </button>
              </div>
            </div>

            <div className="forgot-password">
              <Link to="/forgot-password">Forgot your password?</Link>
            </div>

            <button className="btn-primary" type="submit" disabled={loading}>
              {loading ? (
                <>
                  <span style={{ marginRight: '8px' }}>⏳</span>
                  Signing in...
                </>
              ) : (
                "Sign In"
              )}
            </button>
          </form>

          <p className="switch-link">
            Don't have an account? <Link to="/register">Create account</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;