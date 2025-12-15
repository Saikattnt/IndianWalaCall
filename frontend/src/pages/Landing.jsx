import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

export default function LandingPage() {
  const router = useNavigate();

  return (
    <div className="landingPageContainer">
      <nav>
        <div className="navHeader">
          <h2>Indianwalacall</h2>
        </div>
        <h1>
          <span style={{ color: "#FF9839" }}>Connect</span>{" "}
          <span className="connectTalk">Talk</span>
        </h1>
        <div className="navlist">
          <div role="button" className="glassButton">
            <p
              onClick={() => {
               router("/qwq23")
              }}
            >
              Join as Guest
            </p>
          </div>
          <div role="button">
            <p>
              <Link
                className="glassButton"
                to={"/login?mode=signup"}
                style={{ textDecoration: "none" }}
              >
                Register
              </Link>
            </p>
          </div>
          <div role="button">
            <p>
              <Link
                className="glassButton"
                to={"/login?mode=singin"}
                style={{ textDecoration: "none" }}
              >
                Sign In
              </Link>
            </p>
          </div>
        </div>
      </nav>

      <div className="landingMainContainer">
        <div role="button">
          <Link to="/login" className="glassButton">
            Get Started
          </Link>
        </div>
      </div>
    </div>
  );
}
