import React, { useContext, useState } from "react";
import withAuth from "../utils/withAuth";
import { useNavigate } from "react-router-dom";
import styles from "../styles/homeComponent.module.css";
import RestoreIcon from "@mui/icons-material/Restore";
import { TextField, Button, Badge, IconButton } from "@mui/material";
// import { addToHistory } from "../../../backend/src/controllers/user.controller";
import { AuthContext } from "../contexts/AuthContext";


function HomeComponent() {
  let navigate = useNavigate();

  const [meetingCode, setMeetingCode] = useState("");

  const { addToUserHistory } = useContext(AuthContext);

  let handleJoinVideoCall = async () => {
    await addToUserHistory(meetingCode);
    navigate(`/${meetingCode}`);
  };

  return (
    <>
      <div className={styles.navbar}>
        <div className={styles.logoContainer}>
          <h2>IndianWalaCall</h2>
        </div>

        <div className={styles.heroSection}>
          <h1 className={styles.heroTitle}>
            Video call and meeting for <br /> everyone
          </h1>
          <div>
            <h2 className={styles.heroSubtitle}>
              <span className={`${styles.badge} ${styles.badgeConnect}`}>
                Connect
              </span>
              <span className={`${styles.badge} ${styles.badgeCollaborate}`}>
                Collaborate
              </span>
              <span className={`${styles.badge} ${styles.badgeGossip}`}>
                Gossip
              </span>{" "}
              all in one place
            </h2>
          </div>
        </div>

        <div className={styles.historyLogoutContainer}>
          <IconButton
            onClick={() => {
              navigate("/history");
            }}
          >
            <RestoreIcon />
          </IconButton>
          <p>History</p>
          <Button
            onClick={() => {
              localStorage.removeItem("token");
              navigate("/login");
            }}
          >
            LogOut
          </Button>
        </div>
      </div>

      <div className={styles.meetContainer}>
        <div className={styles.joinContainer}>
          <TextField
            onChange={(e) => setMeetingCode(e.target.value)}
            id="outlined-basic"
            label="Meeting Code"
            variant="outlined"
          ></TextField>
          <Button
            style={{
              borderRadius: "30px",
              paddingInline: "30px",
              paddingBlock: "10px",
            }}
            onClick={handleJoinVideoCall}
            variant="contained"
          >
            Join
          </Button>
        </div>
      </div>

      <div className={styles.dividerContainer}>
        <div className={styles.divider}></div>
      </div>

      <div className={styles.cardRow}>
        <div
          className={styles.card}
          style={{ backgroundImage: 'url("/collaboration.png")' }}
        ></div>
        <div
          className={styles.card}
          style={{ backgroundImage: 'url("/video_call.png")' }}
        ></div>
        <div
          className={styles.card}
          style={{ backgroundImage: 'url("/selfie.png")' }}
        ></div>
      </div>
    </>
  );
}

export default HomeComponent;
