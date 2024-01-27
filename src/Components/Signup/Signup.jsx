import React, { useCallback, useState } from "react";

import "./Signup.css";
import { useUserContext } from "../../Store/UserStore";
import { useNavigate } from "react-router-dom";

function Signup() {
  const [userInfo, setUserInfo] = useState({
    userName: "",
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    passwordAgain: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);
  const userContext = useUserContext();
  const navigate = useNavigate();
  const handleSubmit = useCallback(async (userInfo, userContext) => {
    setLoading(true);
    const ENDPOINT = userContext.ENDPOINT;
    await fetch(`${ENDPOINT}/user/register`, {
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
          alert(data.message);
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
    <div className="signup-wrapper">
      <div className="signup-main">
        <form className="signup-form">
          <span className="signup-title">Signup</span>
          <div className="signup-input-group">
            <input
              type="text"
              className={`signup-input ${error ? "error" : ""}`}
              placeholder="Enter your first name..."
              value={userInfo.firstName}
              onChange={(e) => {
                setUserInfo({ ...userInfo, firstName: e.target.value });
              }}
            />
            <input
              type="text"
              className={`signup-input ${error ? "error" : ""}`}
              placeholder="Enter your last name..."
              value={userInfo.lastName}
              onChange={(e) => {
                setUserInfo({ ...userInfo, lastName: e.target.value });
              }}
            />
          </div>
          <input
            type="text"
            className={`signup-input ${error ? "error" : ""}`}
            placeholder="Enter your username..."
            value={userInfo.userName}
            onChange={(e) => {
              setUserInfo({ ...userInfo, userName: e.target.value });
            }}
          />
          <input
            type="text"
            className={`signup-input ${error ? "error" : ""}`}
            placeholder="Enter your email..."
            value={userInfo.email}
            onChange={(e) => {
              setUserInfo({ ...userInfo, email: e.target.value });
            }}
          />
          <div className="signup-input-group">
            <input
              type="password"
              className={`signup-input ${error ? "error" : ""}`}
              placeholder="Enter your password..."
              value={userInfo.password}
              onChange={(e) => {
                setUserInfo({ ...userInfo, password: e.target.value });
              }}
            />
            <input
              type="password"
              className={`signup-input ${error ? "error" : ""}`}
              placeholder="Confirm Password..."
              value={userInfo.passwordAgain}
              onChange={(e) => {
                setUserInfo({ ...userInfo, passwordAgain: e.target.value });
              }}
            />
          </div>
          <button
            className="signup-button"
            disabled={loading}
            onClick={(e) => {
              e.preventDefault();
              handleSubmit(userInfo, userContext);
            }}
          >
            Signup
          </button>
          <span className="signup-link">
            Already have an account? <a href="/login">Login</a>
          </span>
        </form>
      </div>
    </div>
  );
}

export default Signup;
