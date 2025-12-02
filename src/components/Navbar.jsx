import { Link } from "react-router-dom";
import "../styles/Navbar.css";
import IconButton from "@mui/material/IconButton";
import MenuIcon from "@mui/icons-material/Menu";
import CloseIcon from "@mui/icons-material/Close";
import { useEffect, useState } from "react";
import Button from "@mui/material/Button";
import { useNavigate } from "react-router-dom";
import HomeIcon from "@mui/icons-material/Home";
import RestoreIcon from "@mui/icons-material/Restore";
import LogoutIcon from "@mui/icons-material/Logout";
import { nanoid } from "nanoid";

export default function Navbar() {
  let navigate = useNavigate();
  let [isOpen, setIsOpen] = useState(true);

  let changeState = () => {
    setIsOpen(!isOpen);
  };

  let logoutBtn = () => {
    return (
      <Button
        id="logoutBtn"
        variant="contained"
        color="error"
        onClick={() => {
          localStorage.removeItem("token");
          navigate("/auth");
        }}
      >
        <LogoutIcon />
        &nbsp; LogOut
      </Button>
    );
  };

  let RegisterBtn = () => {
    return (
      <div>
        {" "}
        <Button
          variant="outlined"
          onClick={() => {
            navigate("/auth");
          }}
        >
          &nbsp; Register
        </Button>
      </div>
    );
  };

  let LoginBtn = () => {
    return (
      <div>
        {" "}
        <Button
          variant="contained"
          color="success"
          onClick={() => {
            navigate("/auth");
          }}
        >
          &nbsp; Login
        </Button>
      </div>
    );
  };

  let [isLoggedIn, setIsLoggedIn] = useState();

  useEffect(() => {
    let checkIfUserExist = () => {
      let userToken = localStorage.getItem("token");

      if (userToken) {
        setIsLoggedIn(true);
      } else {
        setIsLoggedIn(false);
      }
    };
    checkIfUserExist();
  });

  let loggedInDrawer = () => {
    return (
      <>
        {isLoggedIn ? (
          <>
            <Link to={"/home"}>
              <p>Home</p>
            </Link>
            <Link to={"/history"}>
              <p>History</p>
            </Link>
            <p>{logoutBtn()}</p>
          </>
        ) : (
          <>
            <Link to={`/${nanoid(6)}`}>
              <p>Join as Guest?</p>
            </Link>
            <p>{RegisterBtn()}</p>
            <p>{LoginBtn()}</p>
          </>
        )}
      </>
    );
  };

  let loggedInMenu = () => {
    return (
      <>
        {isLoggedIn ? (
          <>
            <div>
              <Link to={"/home"}>
                <IconButton>
                  <HomeIcon />
                </IconButton>
                Home
              </Link>
            </div>
            <div>
              <Link to={"/history"}>
                <IconButton>
                  <RestoreIcon />
                </IconButton>
                History
              </Link>
            </div>
            <div>{logoutBtn()}</div>
          </>
        ) : (
          <>
            <div>
              <Link
                style={{ textDecoration: "none", color: "black" }}
                to={`/${nanoid(6)}`}
              >
                Join as Guest?
              </Link>
            </div>
            <div>{RegisterBtn()}</div>
            <div>{LoginBtn()}</div>
          </>
        )}
      </>
    );
  };

  return (
    <>
      <div className="nav-container">
        <div className="nav-right-section">
          <Link to={"/home"}>
            <img src="/VoidMeet-icon-black.png" />
          </Link>

          <Link to={"/home"}>
            {" "}
            <h2>VoidMeet</h2>
          </Link>
        </div>
        <div className="nav-middle-section">{loggedInMenu()}</div>
        <div className="nav-left-section">
          <IconButton onClick={changeState}>
            {isOpen ? <MenuIcon /> : <CloseIcon />}
          </IconButton>
        </div>
      </div>
      {isOpen ? <></> : <div className="drawer">{loggedInDrawer()}</div>}
    </>
  );
}
