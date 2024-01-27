import React, { useCallback, useState } from "react";
import "./Login.css";
import { useUserContext } from "../../Store/UserStore";
import { useNavigate } from "react-router-dom";

function Login() {
  const [userInfo, setUserInfo] = useState({ name: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);
  const userContext = useUserContext();
  const navigate = useNavigate();
  const handleSubmit = useCallback(async (userInfo, userContext) => {
    setLoading(true);
    const ENDPOINT = userContext.ENDPOINT;
    await fetch(`${ENDPOINT}/user/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(userInfo),
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.message) {
          setError(true);
          setLoading(false);
          return;
        }
        userContext.setUser({
          firstName: data.firstName,
          lastName: data.lastName,
          userName: data.userName,
          email: data.email,
          token: data.token,
        });
        navigate("/");
        setLoading(false);
      });
  }, []);
  return (
    <div className="login-wrapper">
      <div className="login-main">
        <div className="login-left">
          <form className="login-form">
            <span className="login-title">Login</span>
            <input
              type="text"
              className={`login-input ${error ? "error" : ""}`}
              placeholder="Enter your email or username..."
              value={userInfo.name}
              onChange={(e) => {
                setUserInfo({ ...userInfo, name: e.target.value });
              }}
            />
            <input
              type="password"
              className={`login-input ${error ? "error" : ""}`}
              placeholder="Enter your password..."
              value={userInfo.password}
              onChange={(e) => {
                setUserInfo({ ...userInfo, password: e.target.value });
              }}
            />
            <button
              className={`login-button ${loading ? "loading" : ""}`}
              disabled={loading}
              onClick={(e) => {
                e.preventDefault();
                handleSubmit(userInfo, userContext);
              }}
            >
              Login
            </button>
            <span className="login-link">
              Don't have an account? <a href="/signup">Signup</a>
            </span>
          </form>
        </div>
        <div className="login-right">
          <img
            src="https://picsum.photos/500/800"
            alt="login"
            className="login-bg"
          />
        </div>
      </div>
    </div>
  );
}

export default Login;
