import React, { useEffect, useRef, useState } from "react";

// MUI Components
import { TextField, Button, Badge, IconButton } from "@mui/material";

// MUI Icons
import {
  MicOff as MicOffIcon,
  Mic as MicIcon,
  CallEnd as CallEndIcon,
  Videocam as VideocamIcon,
  VideocamOff as VideocamOffIcon,
  ScreenShare as ScreenShareIcon,
  StopScreenShare as StopScreenShareIcon,
  Chat as ChatIcon,
  Padding,
} from "@mui/icons-material";

import { data, Navigate, useHref, useNavigate } from "react-router-dom";
import { io } from "socket.io-client";

import styles from "../styles/videoComponent.module.css";
import server from "../environment";


const server_url = server;


var connections = {};
// Queue ICE candidates that arrive before remoteDescription is set
var pendingCandidates = {};

const peerConfigConnections = {
  iceServers: [
    {
      urls: "stun:stun.l.google.com:19302",
    },
  ],
};

// simple debugger helper
const dbg = (...args) => console.log("[VideoMeet]", ...args);

export default function VideoMeetComponent() {
  var socketRef = useRef();
  let socketIdRef = useRef();

  let localVideoRef = useRef();

  let [videoAvailable, setVideoAvailable] = useState(true);
  let [audioAvailable, setAudioAvailable] = useState(true);

  // videoToggle boolean (was previously ambiguous)
  let [video, setVideo] = useState(false);
  let [audio, setAudio] = useState(false);

  let [screen, setScreen] = useState();
  let [showModel, setModel] = useState(true);
  let [screenAvailable, setScreenAvailable] = useState();

  let [messages, setMessages] = useState([]);
  let [message, setMessage] = useState("");

  let [newMessages, setNewMessages] = useState(0);

  // keep lobby visible until user clicks Connect (optional)
  let [askForUsername, setAskForUserName] = useState(true);
  let [username, setUserName] = useState("");

  const videoRef = useRef([]); // array mirror of videos
  let [videos, setVideos] = useState([]); // array of { socketId, stream, ... }

  // store current local stream so we can cleanup and reuse
  const [localStream, setLocalStream] = useState(null);

  /* ---------- media logic (unchanged, minimal) ---------- */

  const navigate = useNavigate();

  const getPermission = async () => {
    try {
      const userMediaStream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true,
      });
      setVideoAvailable(userMediaStream.getVideoTracks().length > 0);
      setAudioAvailable(userMediaStream.getAudioTracks().length > 0);
      setScreenAvailable(
        typeof navigator.mediaDevices.getDisplayMedia === "function"
      );

      if (localVideoRef.current) {
        try {
          localVideoRef.current.muted = true;
          localVideoRef.current.autoplay = true;
          localVideoRef.current.srcObject = userMediaStream;
          localVideoRef.current.onloadedmetadata = () => {
            try {
              localVideoRef.current.play();
            } catch (e) {}
          };
        } catch (err) {
          localVideoRef.current.src =
            window.URL.createObjectURL(userMediaStream);
        }
      }

      window.localStream = userMediaStream;
      setLocalStream(userMediaStream);
      return userMediaStream;
    } catch (err) {
      console.error("getPermission/getUserMedia error:", err);
      setVideoAvailable(false);
      setAudioAvailable(false);
      setScreenAvailable(
        typeof navigator.mediaDevices.getDisplayMedia === "function"
      );
      return null;
    }
  };

  let routeTo = useNavigate;

  let silence = () => {
    let ctx = new AudioContext();
    let oscillator = ctx.createOscillator();

    let dst = oscillator.connect(ctx.createMediaStreamDestination());

    oscillator.start();
    ctx.resume();
    return Object.assign(dst.stream.getAudioTracks()[0], { enabled: false });
  };

  let black = ({ width = 640, height = 480 } = {}) => {
    let canvas = Object.assign(document.createElement("canvas"), {
      width,
      height,
    });

    canvas.getContext("2d").fillRect(0, 0, width, height);
    let stream = canvas.captureStream();
    return Object.assign(stream.getVideoTracks()[0], { enabled: false });
  };

  let getUserMedia = () => {
    const wantVideo = !!video && videoAvailable;
    const wantAudio = !!audio && audioAvailable;

    if (wantVideo || wantAudio) {
      navigator.mediaDevices
        .getUserMedia({ video: wantVideo, audio: wantAudio })
        .then(getUserMediaSuccess)
        .catch((e) => console.log("getUserMedia error:", e));
    } else {
      try {
        const s =
          (localVideoRef.current && localVideoRef.current.srcObject) ||
          localStream;
        if (s && s.getTracks) {
          s.getTracks().forEach((track) => {
            try {
              track.stop();
            } catch (e) {}
          });
        }
      } catch (e) {}
    }
  };

  useEffect(() => {
    if (video !== undefined && audio !== undefined) {
      getUserMedia();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [video, audio]);

  /* ---------- signaling handlers ---------- */

  // called when server forwards a signal from another peer
  // ---------- signaling handlers ----------
  let gotMessageFromServer = (fromId, message) => {
    dbg("signal IN from", fromId, message);

    if (fromId === socketIdRef.current) return; // ignore our own

    let signal;
    try {
      signal = typeof message === "string" ? JSON.parse(message) : message;
    } catch (e) {
      console.error("Invalid signal payload", e, message);
      return;
    }

    if (!connections[fromId]) {
      console.warn("No RTCPeerConnection found for", fromId);
      return;
    }

    const pc = connections[fromId];

    if (signal.sdp) {
      pc.setRemoteDescription(new RTCSessionDescription(signal.sdp))
        .then(() => {
          if (signal.sdp.type === "offer") {
            pc.createAnswer()
              .then((description) => {
                pc.setLocalDescription(description)
                  .then(() => {
                    socketRef.current.emit(
                      "signal",
                      fromId,
                      JSON.stringify({ sdp: pc.localDescription })
                    );
                  })
                  .catch((e) =>
                    console.log("setLocalDescription(answer) error:", e)
                  );
              })
              .catch((e) => console.log("createAnswer error:", e));
          }
        })
        .catch((e) => console.log("setRemoteDescription error:", e));
    }

    if (signal.ice) {
      pc.addIceCandidate(new RTCIceCandidate(signal.ice)).catch((e) =>
        console.log("addIceCandidate error:", e)
      );
    }
  };

  let addMessage = (data, sender, socketIdSender) => {
    setMessages((prevMessages) => [
      ...prevMessages,
      { sender: sender, data: data },
    ]);

    if (socketIdSender !== socketIdRef.current) {
      setNewMessages((prevMessages) => prevMessages + 1);
    }
  };

  /* ---------- connect to socket + register handlers ---------- */
  let connectToSocketServer = () => {
    socketRef.current = io(server_url, { transports: ["websocket"] });

    socketRef.current.on("connect", () => {
      socketIdRef.current = socketRef.current.id;
      dbg("socket connected:", socketRef.current.id);

      const path = window.location.pathname; // "/as23"
      const segments = path.split("/").filter(Boolean);
      const roomId = segments.length
        ? segments[segments.length - 1]
        : "default-room";

      console.log(
        "[client] about to join room:",
        roomId,
        "socket connected:",
        socketRef.current.id
      );

      socketRef.current.emit("join-call", roomId);
    });

    socketRef.current.on("signal", (fromId, payload) => {
      dbg(
        "signal event (raw) from",
        fromId,
        payload &&
          (typeof payload === "string" ? payload.substring(0, 200) : payload)
      );
      gotMessageFromServer(fromId, payload);
    });

    socketRef.current.on("chat-message", addMessage);

    socketRef.current.on("user-left", (id) => {
      setVideos((prev) => {
        const updated = prev.filter((v) => v.socketId !== id);
        videoRef.current = updated;
        return updated;
      });
    });

    socketRef.current.on("disconnect", (reason) => {
      dbg("socket disconnected", reason);
    });

    socketRef.current.on("user-joined", (id, clients) => {
      console.log(
        "[client] user-joined event received. id:",
        id,
        "clients:",
        clients
      );

      clients.forEach((socketListId) => {
        if (!connections[socketListId]) {
          connections[socketListId] = new RTCPeerConnection(
            peerConfigConnections
          );

          // send ICE to peer
          connections[socketListId].onicecandidate = (event) => {
            if (event.candidate) {
              socketRef.current.emit(
                "signal",
                socketListId,
                JSON.stringify({ ice: event.candidate })
              );
            }
          };

          // receive remote stream (use onaddstream here, as in repo)
          connections[socketListId].onaddstream = (event) => {
            console.log("onaddstream from", socketListId, event.stream);

            setVideos((prev) => {
              const exists = prev.find(
                (video) => video.socketId === socketListId
              );
              if (exists) {
                const updated = prev.map((video) =>
                  video.socketId === socketListId
                    ? { ...video, stream: event.stream }
                    : video
                );
                videoRef.current = updated;
                return updated;
              } else {
                const newVideo = {
                  socketId: socketListId,
                  stream: event.stream,
                  autoplay: true,
                };
                const updated = [...prev, newVideo];
                videoRef.current = updated;
                return updated;
              }
            });
          };

          // add local stream
          if (window.localStream) {
            connections[socketListId].addStream(window.localStream);
          } else {
            let blackSilence = (...args) =>
              new MediaStream([black(...args), silence()]);
            window.localStream = blackSilence();
            connections[socketListId].addStream(window.localStream);
          }
        }
      });

      // if it's me who just joined, create offers
      if (id === socketIdRef.current) {
        for (let id2 in connections) {
          if (id2 === socketIdRef.current) continue;

          try {
            connections[id2].addStream(window.localStream);
          } catch (e) {}

          connections[id2]
            .createOffer()
            .then((description) => {
              connections[id2]
                .setLocalDescription(description)
                .then(() => {
                  socketRef.current.emit(
                    "signal",
                    id2,
                    JSON.stringify({ sdp: connections[id2].localDescription })
                  );
                })
                .catch((e) =>
                  console.log("setLocalDescription(offer) error:", e)
                );
            })
            .catch((e) => console.log("createOffer error:", e));
        }
      }
    });
  };

  /* ---------- auto-request permission if meeting id present ---------- */
  useEffect(() => {
    const parts = window.location.pathname.split("/").filter(Boolean);
    const lastSegment = parts.length ? parts[parts.length - 1] : null;

    if (lastSegment) {
      getPermission().then((s) => {
        // don't auto-hide lobby here
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  let getUserMediaSuccess = (stream) => {
    try {
      window.localStream.getTracks().forEach((track) => track.stop());
    } catch (e) {
      console.log(e);
    }

    window.localStream = stream;
    localVideoRef.current.srcObject = stream;

    for (let id in connections) {
      if (id === socketIdRef.current) continue;

      connections[id].addStream(window.localStream);

      connections[id]
        .createOffer()
        .then((description) =>
          connections[id].setLocalDescription(description).then(() => {
            socketRef.current.emit(
              "signal",
              id,
              JSON.stringify({ sdp: description })
            );
          })
        )
        .catch((e) => console.log(e));
    }

    stream.getTracks().forEach(
      (track) =>
        (track.onended = () => {
          setVideo(false);
          setAudio(false);

          try {
            let tracks = localVideoRef.current.srcObject.getTracks();
            tracks.forEach((track) => track.stop());
          } catch (e) {
            console.log(e);
          }

          let blackSilence = (...args) =>
            new MediaStream([black(...args), silence()]);
          window.localStream = blackSilence();
          localVideoRef.current.srcObject = window.localStream;

          for (let id in connections) {
            connections[id].addStream(window.localStream);
            connections[id].createOffer().then((description) => {
              connections[id].setLocalDescription(description).then(() => {
                socketRef.current.emit(
                  "signal",
                  id,
                  JSON.stringify({ sdp: description })
                );
              });
            });
          }
        })
    );
  };

  useEffect(() => {
    console.log("VIDEOS STATE UPDATED:", videos);
  }, [videos]);

  /* ---------- cleanup on unmount ---------- */
  useEffect(() => {
    return () => {
      const s =
        localStream ||
        (localVideoRef.current && localVideoRef.current.srcObject);
      if (s && s.getTracks) {
        s.getTracks().forEach((t) => {
          try {
            t.stop();
          } catch (e) {}
        });
      }

      if (socketRef.current && socketRef.current.connected) {
        try {
          socketRef.current.disconnect();
        } catch (e) {}
        socketRef.current = null;
      }
    };
  }, [localStream]);

  /* ---------- join/connect UI handlers ---------- */
  let getMedia = () => {
    setVideo(videoAvailable);
    setAudio(audioAvailable);
  };

  let connect = () => {
    if (localStream || window.localStream) {
      getMedia();
      setAskForUserName(false);

      // connect socket now that we have media
      if (!socketRef.current || !socketRef.current.connected) {
        connectToSocketServer();
      }
      return;
    }

    getPermission().then((s) => {
      if (!s) return;
      getMedia();
      setAskForUserName(false);

      // connect socket now that we have media
      if (!socketRef.current || !socketRef.current.connected) {
        connectToSocketServer();
      }
    });
  };

  let handleVideo = () => {
    setVideo(!video);
  };

  let handleAudio = () => {
    setAudio(!audio);
  };

  let getDisplayMediaSuccess = (stream) => {
    try {
      window.localStream.getTracks().forEach((track) => track.stop());
    } catch (e) {
      console.log(e);
    }

    // Replace localStream with the screen stream
    window.localStream = stream;

    // Update your local video element
    if (localVideoRef.current) {
      try {
        localVideoRef.current.srcObject = stream;
      } catch (err) {
        try {
          localVideoRef.current.src = window.URL.createObjectURL(stream);
        } catch (e) {}
      }
    }

    // Send updated stream to all peers
    for (let id in connections) {
      if (id === socketIdRef.current) continue;

      try {
        connections[id].addStream(window.localStream);
      } catch (e) {
        console.log("addStream error:", e);
      }

      connections[id]
        .createOffer()
        .then((description) => {
          return connections[id].setLocalDescription(description);
        })
        .then(() => {
          socketRef.current.emit(
            "signal",
            id,
            JSON.stringify({ sdp: connections[id].localDescription })
          );
        })
        .catch((e) => console.log(e));
    }

    // Handle when user stops sharing screen
    stream.getTracks().forEach((track) => {
      track.onended = () => {
        setScreen(false);

        try {
          let tracks =
            localVideoRef.current && localVideoRef.current.srcObject
              ? localVideoRef.current.srcObject.getTracks()
              : [];
          tracks.forEach((t) => t.stop());
        } catch (e) {
          console.log(e);
        }

        let blackSilence = (...args) =>
          new MediaStream([black(...args), silence()]);
        window.localStream = blackSilence();
        if (localVideoRef.current)
          localVideoRef.current.srcObject = window.localStream;

        // Go back to camera
        getUserMedia();
      };
    });
  };

  let getDisplayMedia = () => {
    if (screen && navigator.mediaDevices.getDisplayMedia) {
      navigator.mediaDevices
        .getDisplayMedia({ video: true, audio: true })
        .then(getDisplayMediaSuccess)
        .catch((e) => console.log(e));
    }
  };

  useEffect(() => {
    if (screen) {
      getDisplayMedia();
    }
  }, [screen]);

  let handleScreen = () => {
    setScreen(!screen);
  };

  let sendMessage = () => {
    socketRef.current.emit("chat-message", message, username);
    setMessage("");
  };

  let handleEndCall = () => {
    const s =
      (localVideoRef.current && localVideoRef.current.srcObject) || localStream;

    if (s && s.getTracks) {
      s.getTracks().forEach((track) => {
        try {
          track.stop();
        } catch {}
      });
    }

    if (socketRef.current && socketRef.current.connected) {
      socketRef.current.disconnect();
    }

    navigate("/home");
  };

  /* ---------- render ---------- */
  return (
    <div>
      {askForUsername ? (
        <div>
          <h2>Enter into Lobby</h2>
          <TextField
            id="outlined-username"
            label="Username"
            value={username}
            onChange={(e) => setUserName(e.target.value)}
            variant="outlined"
          />
          <Button variant="contained" onClick={connect}>
            Connect
          </Button>

          <div>
            <video ref={localVideoRef} autoPlay muted />
          </div>
        </div>
      ) : (
        <div className={styles.meetVideoContainer}>
          {showModel ? (
            <div className={styles.chatroom}>
              <div className={styles.chatContainer}>
                <h2>Chat</h2>

                <div className="chattingDisplay">
                  {messages.length > 0 ? (
                    messages.map((item, index) => {
                      return (
                        <div style={{ marginBottom: "20px" }} key={index}>
                          <p style={{ fontWeight: "bold" }}> {item.sender} </p>
                          <p>{item.data}</p>
                        </div>
                      );
                    })
                  ) : (
                    <p>No Messages Yet</p>
                  )}
                </div>

                <div className={styles.chattingArea}>
                  <TextField
                    id="standard-basic"
                    label="Enter Your Chat"
                    variant="filled"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                  />
                  <Button variant="contained" onClick={sendMessage}>
                    Send
                  </Button>
                </div>
              </div>
            </div>
          ) : (
            <></>
          )}

          <div className={styles.buttonContainers}>
            <IconButton onClick={handleVideo} style={{ color: "beige" }}>
              {video === true ? <VideocamIcon /> : <VideocamOffIcon />}
            </IconButton>

            <IconButton onClick={handleEndCall} style={{ color: "red" }}>
              <CallEndIcon />
            </IconButton>

            <IconButton onClick={handleAudio} style={{ color: "beige" }}>
              {audio === true ? <MicIcon /> : <MicOffIcon />}
            </IconButton>

            {screenAvailable === true ? (
              <IconButton onClick={handleScreen} style={{ color: "beige" }}>
                {screen === true ? (
                  <ScreenShareIcon />
                ) : (
                  <StopScreenShareIcon />
                )}
              </IconButton>
            ) : (
              <> </>
            )}

            <Badge
              badgeContent={newMessages}
              max={999}
              color="primary"
              sx={{ color: "white" }}
            >
              <IconButton
                onClick={() => setModel(!showModel)}
                style={{ color: "beige" }}
              >
                <ChatIcon />
              </IconButton>
            </Badge>
          </div>

          <video
            className={styles.meetUserVideo}
            ref={localVideoRef}
            autoPlay
            muted
          />

          <div className={styles.conferenceView}>
            {videos.map((remote) => (
              <div key={remote.socketId}>
                <video
                  data-socket={remote.socketId}
                  ref={(ref) => {
                    if (ref && remote.stream) {
                      try {
                        ref.srcObject = remote.stream;
                        ref.autoplay = true;
                        ref.muted = true; // mute remote autoplay to allow autoplay
                        ref.onloadedmetadata = () => {
                          try {
                            ref.play().catch(() => {});
                          } catch (e) {}
                        };
                      } catch (e) {
                        try {
                          ref.src = window.URL.createObjectURL(remote.stream);
                        } catch (err) {}
                      }
                    }
                  }}
                  autoPlay
                  muted
                />
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
