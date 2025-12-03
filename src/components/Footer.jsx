import "../styles/Footer.css";
import { Link } from "react-router-dom";

export default function Footer() {
  return (
    <div>
      <footer>
        <div className="top-section">
          <div>
            <img src="/VoidMeet-icon-black.png" />
            <h3>VoidMeet</h3>
          </div>
          <div className="para">
            <p>Effortless video meetings. Free. Fast. No downloads.</p>
          </div>
        </div>
        <div className="middle-section">
          <div>
            <p>Quick Links</p>
            <ul>
              {" "}
              <li>
                <Link to={"/home"}>Home </Link>
              </li>{" "}
              <li>
                <Link to={"#"}>Features</Link>
              </li>
              <li>
                <Link to={"#"}>How it Works</Link>
              </li>
              <li>
                {" "}
                <Link to={"#"}>FAQ</Link>
              </li>
              <li>
                {" "}
                <Link to={"#"}>Contact Us</Link>
              </li>
            </ul>
          </div>
          <div>
            <p>Social Media</p>
            <ul>
              <li>
                {" "}
                <Link
                  to={"https://www.linkedin.com/in/dhiraj-dhande-1a7262237"}
                >
                  LinkdIn{" "}
                </Link>
              </li>
              <li>
                <Link to={"https://x.com/DhirajDhande8"}>Twitter </Link>
              </li>{" "}
              <li>
                {" "}
                <Link to={"https://github.com/dhirajdhande19"}>GitHub</Link>
              </li>
            </ul>
          </div>
          <div>
            <p>Legal</p>
            <ul>
              <li>
                {" "}
                <Link to={"#"}>Privacy Policy </Link>
              </li>{" "}
              <li>
                {" "}
                <Link to={"#"}>Terms of Service </Link>
              </li>
            </ul>
          </div>
        </div>
        <div className="bottom-section">
          <p>&copy; VoidMeet. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
