import "../styles/landing.css";
import { Link, useNavigate } from "react-router-dom";
import { nanoid } from "nanoid";

export default function LandingPage() {
  return (
    <div className="landingPageContiner">
      <Navbar />
      <MainContainer />
    </div>
  );
}

export function Navbar() {
  const router = useNavigate();

  return (
    <nav>
      <div className="nav-section-one">
        <img className="logo" src="/VoidMeet-icon-white.png" />
        <div>VoidMeet</div>
      </div>
      <div className="nav-section-two">
        <div
          onClick={() => {
            router(`/${nanoid(6)}`);
          }}
        >
          Join as Guest
        </div>
        <div
          onClick={() => {
            router("/auth");
          }}
        >
          Register
        </div>
        <button
          onClick={() => {
            router("/auth");
          }}
          className="login-btn"
        >
          Login
        </button>
      </div>
    </nav>
  );
}

export function MainContainer() {
  return (
    <div className="mainContainer">
      <div className="left-container">
        <h1>Connect. Collaborate. Communicate.</h1>&nbsp;
        <p>
          VoidMeet is your seamless video calling solution - <br />
          simple, fast and secure.
        </p>
        {isPrevUser()}
      </div>
      <div className="right-container">
        <img src="/landingPage-call-img.png" alt="landingPage-call-img" />
      </div>
    </div>
  );
}

let isPrevUser = () => {
  let token = window.localStorage.getItem("token");
  return (
    <>
      {!token ? (
        <>
          {" "}
          <Link to={"/auth"}>
            <button>Get Started</button>
          </Link>
        </>
      ) : (
        <>
          {" "}
          <Link to={"/home"}>
            <button>Get Started</button>
          </Link>
        </>
      )}
    </>
  );
};
