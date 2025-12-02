import "../styles/VideoMeet.css";
import { useEffect, useRef, useState } from "react";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import io from "socket.io-client";
import { Link, useNavigate } from "react-router-dom";

import Divider from "@mui/material/Divider";
import IconButton from "@mui/material/IconButton";
import SendIcon from "@mui/icons-material/Send";
import Badge from "@mui/material/Badge";
import ChatIcon from "@mui/icons-material/Chat";
import ToggleButton from "@mui/material/ToggleButton";
import ToggleButtonGroup from "@mui/material/ToggleButtonGroup";
import VideocamOutlinedIcon from "@mui/icons-material/VideocamOutlined";
import VideocamOffOutlinedIcon from "@mui/icons-material/VideocamOffOutlined";
import MicNoneOutlinedIcon from "@mui/icons-material/MicNoneOutlined";
import MicOffOutlinedIcon from "@mui/icons-material/MicOffOutlined";
import CallEndOutlinedIcon from "@mui/icons-material/CallEndOutlined";
import ScreenShareOutlinedIcon from "@mui/icons-material/ScreenShareOutlined";
import StopScreenShareOutlinedIcon from "@mui/icons-material/StopScreenShareOutlined";

import { nanoid } from "nanoid";
import server from "../enviornment";
import EmojiPicker from "emoji-picker-react";

const server_url = server;

var connections = {};

const peerConfigConnections = {
  iceServers: [{ urls: "stun:stun.l.google.com:19302" }],
};

export default function VideoMeeetComponent() {
  // useRef() is a react hook to store mutable values like DOM elments or live video stamps.

  // it does not re-render when the value changes

  var socketRef = useRef();

  let socketIdRef = useRef(); // our (user's) socket id

  let localVideoRef = useRef(); // our video will be shown/stored here

  let [videoAvailable, setVideoAvailable] = useState(true); // do we have permission of user's video?

  let [audioAvailable, setAudioAvailable] = useState(true); // do we have permission of user's audio?

  let [video, setVideo] = useState([]); // after asking for permisson if user dosen't allow us for video then will show blank video

  let [audio, setAudio] = useState(); //  after asking for permisson if user dosen't allow us for audio then will set audio to blank

  let [screen, setScreen] = useState(); // for screen sharing

  let [showModal, setModal] = useState(false); // something for popup

  let [screenAvailable, setScreenAvailable] = useState(); // if screen share is available or not

  let [messages, setMessages] = useState([]); // handle state of all messages

  let [message, setMessage] = useState(""); // where we will actually write our message

  let [newMessages, setNewMEssages] = useState(0); // new messages like the popup ones

  let [askForUsername, setAskForUsername] = useState(true); // ask for username if user is joining as guest

  let [username, setUsername] = useState("");

  let videoRef = useRef([]);

  let [videos, SetVideos] = useState([]); // main thing

  let routeTo = useNavigate();

  const getPermissions = async () => {
    try {
      // asks permission for video of user
      const videoPermission = await navigator.mediaDevices.getUserMedia({
        video: true,
      });

      if (videoPermission) {
        setVideoAvailable(true);
      } else {
        setVideoAvailable(false);
      }

      // asks permission for audio of user
      const audioPermission = await navigator.mediaDevices.getUserMedia({
        audio: true,
      });

      if (audioPermission) {
        setAudioAvailable(true);
      } else {
        setAudioAvailable(false);
      }

      // screen sharing logic here
      if (navigator.mediaDevices.getDisplayMedia) {
        setScreenAvailable(true);
      } else {
        setScreenAvailable(false);
      }

      // Main video streaming logic here
      if (videoAvailable || audioAvailable) {
        const userMediaStream = await navigator.mediaDevices.getUserMedia({
          video: videoAvailable,
          audio: audioAvailable,
        });

        if (userMediaStream) {
          window.localStream = userMediaStream;

          if (localVideoRef.current) {
            localVideoRef.current.srcObject = userMediaStream;
          }
        }
      }
    } catch (err) {
      console.log(err);
    }
  };

  useEffect(() => {
    getPermissions();
  }, []);

  let getUserMediaSuccess = (stream) => {
    try {
      // Check if the local media stream exists before trying to access its tracks
      if (window.localStream) {
        // Stop all media tracks (both audio and video) to release the camera and microphone
        window.localStream.getTracks().forEach((track) => track.stop());
      }
    } catch (e) {
      // If an error occurs (e.g. localStream is undefined), log the error for debugging
      console.log(e);
    }

    window.localStream = stream;
    localVideoRef.current.srcObject = stream;

    for (let id in connections) {
      if (id === socketIdRef.current) continue;

      connections[id].addStream(window.localStream);

      connections[id].createOffer().then((description) => {
        console.log(description);
        connections[id]
          .setLocalDescription(description)
          .then(() => {
            socketRef.current.emit(
              "signal",
              id,
              JSON.stringify({ sdp: connections[id].localDescription })
            );
          })
          .catch((e) => console.log(e));
      });
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
              connections[id]
                .setLocalDescription(description)
                .then(() => {
                  socketRef.current.emit(
                    "signal",
                    id,
                    JSON.stringify({ sdp: connections[id].localDescription })
                  );
                })
                .catch((e) => console.log(e));
            });
          }
        })
    );
  };

  let silence = () => {
    let ctx = new AudioContext();
    let oscillator = ctx.createOscillator();

    let dst = oscillator.connect(ctx.createMediaStreamDestination());

    oscillator.start();
    ctx.resume();

    return Object.assign(dst.stream.getAudioTracks()[0], { enabled: false });
  };

  let black = ({ width = 600, height = 400 } = {}) => {
    let canvas = Object.assign(document.createElement("canvas"), {
      width,
      height,
    });

    canvas.getContext("2d").fillRect(0, 0, width, height);

    let stream = canvas.captureStream();

    return Object.assign(stream.getVideoTracks()[0], { enabled: false });
  };

  let getUserMedia = () => {
    if ((video && videoAvailable) || (audio && audioAvailable)) {
      navigator.mediaDevices
        .getUserMedia({ video: video, audio: audio })
        .then(getUserMediaSuccess)
        .then((stream) => {})
        .catch((err) => console.log(err));
    } else {
      try {
        let tracks = localVideoRef.current.srcObject.getTracks();
        tracks.forEach((track) => track.stop());
      } catch (err) {
        console.log(err);
      }
    }
  };

  useEffect(() => {
    if (video !== undefined || audio !== undefined) {
      getUserMedia();
    }
  }, [audio, video]);

  let gotMessageFromServer = (fromId, message) => {
    var signal = JSON.parse(message);
    console.log(signal);

    if (fromId !== socketIdRef.current) {
      if (signal && signal.sdp) {
        connections[fromId]
          .setRemoteDescription(new RTCSessionDescription(signal.sdp))
          .then(() => {
            if (signal.sdp.type === "offer") {
              connections[fromId]
                .createAnswer()
                .then((description) => {
                  connections[fromId]
                    .setLocalDescription(description)
                    .then(() => {
                      socketRef.current.emit(
                        "signal",
                        fromId,
                        JSON.stringify({
                          sdp: connections[fromId].localDescription,
                        })
                      );
                    })
                    .catch((e) => console.log(e));
                })
                .catch((e) => console.log(e));
            }
          })
          .catch((e) => console.log(e));
      }

      if (signal.ice) {
        connections[fromId]
          .addIceCandidate(new RTCIceCandidate(signal.ice))
          .catch((e) => console.log(e));
      }
    }
  };

  let addMessage = (data, sender, socketIdSender) => {
    setMessages((prevMessages) => [
      ...prevMessages,
      { sender: sender, data: data },
    ]);

    if (socketIdSender !== socketIdRef.current) {
      setNewMEssages((prevMessages) => prevMessages + 1);
    }
  };

  let connectToSocketServer = () => {
    socketRef.current = io.connect(server_url, { secure: false });

    socketRef.current.on("signal", gotMessageFromServer);

    socketRef.current.on("connect", () => {
      socketRef.current.emit("join-call", window.location.href);

      socketIdRef.current = socketRef.current.id;

      socketRef.current.on("chat-message", addMessage);

      socketRef.current.on("user-left", (id) => {
        SetVideos((videos) => videos.filter((video) => video.socketId !== id));
      });

      socketRef.current.on("user-joined", (id, clients) => {
        clients.forEach((socketListId) => {
          connections[socketListId] = new RTCPeerConnection(
            peerConfigConnections
          );

          connections[socketListId].onicecandidate = function (event) {
            if (event.candidate != null) {
              socketRef.current.emit(
                "signal",
                socketListId,
                JSON.stringify({ ice: event.candidate })
              );
            }
          };

          connections[socketListId].onaddstream = (event) => {
            let videoExists = videoRef.current.find(
              (video) => video.socketId === socketListId
            );

            if (videoExists) {
              SetVideos((videos) => {
                const updatedVideos = videos.map((video) =>
                  video.socketId === socketListId
                    ? { ...video, stream: event.stream }
                    : video
                );
                videoRef.current = updatedVideos;
                return updatedVideos;
              });
            } else {
              let newVideo = {
                socketId: socketListId,
                stream: event.stream,
                autoPlay: true,
                playsinline: true,
              };

              SetVideos((videos) => {
                const updatedVideos = [...videos, newVideo];
                videoRef.current = updatedVideos;
                return updatedVideos;
              });
            }
          };

          if (window.localStream !== undefined && window.localStream !== null) {
            connections[socketListId].addStream(window.localStream);
          } else {
            //todo
            let blackSilence = (...args) =>
              new MediaStream([black(...args), silence()]);
            window.localStream = blackSilence();
            connections[socketListId].addStream(window.localStream);
          }

          if (id === socketIdRef.current) {
            for (let id2 in connections) {
              if (id2 === socketIdRef.current) continue;

              try {
                connections[id2].addStream(window.localStream);
              } catch (e) {
                console.log(e);
              }

              connections[id2].createOffer().then((description) => {
                connections[id2]
                  .setLocalDescription(description)
                  .then(() => {
                    socketRef.current.emit(
                      "signal",
                      id2,
                      JSON.stringify({
                        sdp: connections[id2].localDescription,
                      })
                    );
                  })
                  .catch((e) => console.log(e));
              });
            }
          }
        });
      });
    });
  };

  let getMedia = () => {
    setVideo(videoAvailable);
    setAudio(audioAvailable);
    connectToSocketServer();
  };

  let [isValid, setIsValid] = useState(false);

  let connect = () => {
    if (username === "") {
      setIsValid(true);
    } else {
      setIsValid(false);
      setAskForUsername(false);
      getMedia();
    }
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

    window.localStream = stream;
    localVideoRef.current.srcObject = stream;

    for (let id in connections) {
      if (id === socketIdRef.current) continue;

      connections[id].addStream(window.localStream);
      connections[id].createOffer().then((description) => [
        connections[id]
          .setLocalDescription(description)
          .then(() => {
            socketRef.current.emit(
              "signal",
              id,
              JSON.stringify({ sdp: connections[id].localDescription })
            );
          })
          .catch((e) => console.log(e)),
      ]);
    }

    stream.getTracks().forEach(
      (track) =>
        (track.onended = () => {
          setScreen(false);

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

          getUserMedia();
        })
    );
  };

  let getDisplayMedia = () => {
    if (screen) {
      if (navigator.mediaDevices.getDisplayMedia) {
        navigator.mediaDevices
          .getDisplayMedia({ video: true, audio: true })
          .then(getDisplayMediaSuccess)
          .then((stream) => {})
          .catch((e) => console.log(e));
      }
    }
  };

  useEffect(() => {
    if (screen !== undefined) {
      getDisplayMedia();
    }
  }, [screen]);

  let handleScreen = () => {
    setScreen(!screen);
  };

  let sendMessage = () => {
    if (message === "") return;
    socketRef.current.emit("chat-message", message, username);
    setMessage("");
    setIsEmojiPickerOpen(false);
  };

  let sendEmoji = (EmojiClickData, MouseEvent) => {
    let emoji = EmojiClickData.emoji;
    console.log(emoji);
    setMessage((prev) => prev + emoji);
  };

  let [isEmojiPickerOpen, setIsEmojiPickerOpen] = useState(false);

  let handleEndCall = () => {
    try {
      let tracks = localVideoRef.current.srcObject.getTracks();
      tracks.forEach((track) => track.stop());
      window.location.href = "/home"; // FULL PAGE REFRESH
    } catch (e) {
      console.log(e);
    }

    routeTo("/home");
  };

  let [url, setUrl] = useState(null);

  let ShorttUrl = async () => {
    let res = `${window.location.href}${nanoid(5)}`;
    setUrl(res);
  };

  useEffect(() => {
    let getUrl = async () => {
      let res = `${window.location.href}${nanoid(5)}`;
      setUrl(res);
    };
    getUrl();
  }, []);

  const textRef = useRef();

  const copyText = async () => {
    try {
      await navigator.clipboard.writeText(textRef.current.textContent);
    } catch (e) {
      console.log(e);
    }
  };

  return (
    <div className="contaier">
      {askForUsername === true ? (
        <div>
          <div className="nav-section">
            <Link to={"/home"}>
              <img src="/VoidMeet-icon-black.png" alt="logo" />
            </Link>
            <Link to={"/home"}>
              <h2>VoidMeet</h2>
            </Link>
          </div>

          <div className="prevVideo">
            <div className="heading">
              <div>
                <h2>Video calls and meetings for everyone</h2>
                <br />
                <p>
                  Connect, collaborate, and celebrate from anywhere with
                  VoidMeet
                </p>
              </div>
              <div className="headImg">
                <img src="/call.jpeg" />
              </div>
            </div>
          </div>

          <div className="input-container">
            <h3>Quick check</h3>
            <div className="myVideo">
              <video
                id="userPrevVideo"
                ref={localVideoRef}
                autoPlay
                muted
              ></video>
            </div>
            <div className="askUsername">
              <div className="inpField">
                <TextField
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  label="Enter username.."
                  variant="standard"
                  size="small"
                />
              </div>

              <Button variant="contained" onClick={connect}>
                Join
              </Button>
            </div>
            <div className="err">{isValid ? <NoUserError /> : ""}</div>
          </div>
        </div>
      ) : (
        <div className="videoConatiner">
          <div className="userVideoContainer">
            <video
              className="userVideo"
              ref={localVideoRef}
              autoPlay
              muted
            ></video>
            <p>{username}(You)</p>
          </div>

          {showModal ? (
            <div className="chat-section">
              <h3>Chats</h3>
              <br />
              <Divider />

              <div className="chats-display">
                {messages.length > 0 ? (
                  messages.map((item, index) => {
                    return (
                      <div key={index}>
                        <p style={{ fontWeight: "bold" }}>{item.sender}</p>
                        <p>&nbsp;&nbsp;{item.data}</p>
                      </div>
                    );
                  })
                ) : (
                  <p style={{ textAlign: "center", marginTop: "1rem" }}>
                    Start the Conversation?
                  </p>
                )}
              </div>

              <div className="chat-box">
                <div className="chat-msg">
                  <div>
                    <div
                      style={{ cursor: "pointer" }}
                      onClick={() => {
                        setIsEmojiPickerOpen(!isEmojiPickerOpen);
                      }}
                    >
                      {isEmojiPickerOpen ? "Close X" : "😁"}
                    </div>

                    {isEmojiPickerOpen ? (
                      <EmojiPicker open={true} onEmojiClick={sendEmoji} />
                    ) : null}
                  </div>
                  <input
                    type="text"
                    placeholder="Type Message..."
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && sendMessage()}
                  />
                </div>

                <IconButton onClick={sendMessage}>
                  <SendIcon />
                </IconButton>
              </div>
            </div>
          ) : (
            <></>
          )}

          <div className="newVideos">
            {videos.map((video) => (
              <div key={video.socketId}>
                <video
                  className="newUserVideo"
                  data-socket={video.socketId}
                  ref={(ref) => {
                    if (ref && video.stream) {
                      ref.srcObject = video.stream;
                    }
                  }}
                  autoPlay
                ></video>
              </div>
            ))}
            <div className="features">
              <ToggleButtonGroup>
                <ToggleButton onClick={handleAudio}>
                  {audio ? <MicNoneOutlinedIcon /> : <MicOffOutlinedIcon />}
                </ToggleButton>
                <ToggleButton onClick={handleVideo}>
                  {video ? (
                    <VideocamOutlinedIcon />
                  ) : (
                    <VideocamOffOutlinedIcon />
                  )}
                </ToggleButton>
                {screenAvailable ? (
                  <ToggleButton onClick={handleScreen}>
                    {screen ? (
                      <ScreenShareOutlinedIcon />
                    ) : (
                      <StopScreenShareOutlinedIcon />
                    )}
                  </ToggleButton>
                ) : (
                  <></>
                )}

                <ToggleButton
                  onClick={() => {
                    setModal(!showModal);
                  }}
                >
                  <Badge max={999} badgeContent={newMessages} color="primary">
                    <ChatIcon />
                  </Badge>
                </ToggleButton>
                <ToggleButton onClick={handleEndCall} id="endCall">
                  <CallEndOutlinedIcon />
                </ToggleButton>
              </ToggleButtonGroup>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export function NoUserError() {
  return <p style={{ color: "red" }}>Please Provide Username</p>;
}
