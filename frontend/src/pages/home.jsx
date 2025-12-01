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
        <div style={{ paddingLeft: "10px", paddingTop: "10px" }}>
          <h2>IndianWalaCall</h2>
        </div>

        <div
          style={{ paddingTop: "100px", textAlign: "center", fontSize: "26px" }}
        >
          <h1 style={{ fontWeight: "400" }}>
            Video call and meeting for <br /> everyone
          </h1>
          <div>
            <h2
              style={{
                fontSize: "35px",
                paddingTop: "15px",
                fontWeight: "lighter",
                color: " rgba(94, 105, 112, 1)",
              }}
            >
              <span
                style={{
                  backgroundColor: "#9ec3cfff",
                  borderRadius: "30px",
                  marginRight: "8px",
                  padding: "9px 14px",
                }}
              >
                Connect
              </span>
              <span
                style={{
                  backgroundColor: "#9ecfaaff",
                  borderRadius: "30px",
                  marginRight: "8px",
                  padding: "9px 14px",
                }}
              >
                Collaborate
              </span>
              <span
                style={{
                  backgroundColor: "#cf9ea5ff",
                  borderRadius: "30px",
                  marginRight: "8px",
                  padding: "9px 14px",
                }}
              >
                Gossip
              </span>{" "}
              all in one place
            </h2>
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "center" }}>
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
        <div
          style={{
            display: "flex",
            gap: "10px",
            justifyContent: "center",
            paddingTop: "65px",
          }}
        >
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

      <div
        style={{
          display: "flex",
          justifyContent: "center",
        }}
      >
        <div
          style={{
            borderBottom: "1px solid black",
            width: "50%",
            paddingTop: "70px",
          }}
        ></div>
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
