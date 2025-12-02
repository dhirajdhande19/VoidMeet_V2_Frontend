import axios from "axios";
import { useContext, useEffect, useState } from "react";
import "../styles/Authentication.css";
import Button from "@mui/material/Button";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import TextField from "@mui/material/TextField";
import { AuthContext } from "../contexts/AuthContext";
import Snackbar from "@mui/material/Snackbar";

const URL = `https://api.unsplash.com/photos/random?client_id=${import.meta.env.VITE_UNSPLASH_CLIENT_ID}`;

export default function Authentication() {
  const [data, setData] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await axios.get(URL);
        setData(res.data.urls.full);
      } catch (e) {
        console.log("ERROR:", e.message);
        return res.json({
          error: "Failed to fetch Image URL from unsplash  API",
          message: e.message,
        });
      }
    };

    fetchData();
  }, []);

  let [form, setForm] = useState(true);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [error, setError] = useState();
  const [message, setMessage] = useState();
  const [open, setOpen] = useState(false);

  const { handleRegister, handleLogin } = useContext(AuthContext);

  let handleAuth = async () => {
    try {
      if (form === true) {
        /* i.e if login? */
        let result = await handleLogin(email, password);
        setMessage(result);
        setError("");
      }
      if (form === false) {
        /* i.e if register? */

        if (!name || !email || !password) {
          return setError("Please provide data to continue");
        }

        let result = await handleRegister(name, email, password);
        console.log(result);
        setMessage(result);
        setOpen(true);
        setError("");
        setName("");
        setEmail("");
        setPassword("");
        setForm(true);
      }
    } catch (err) {
      //return console.log("err: ", err);
      let message = err.response.data.message;
      setError(message);
    }
  };

  const handleGoogleLogin = () => {
    window.location.href = `${import.meta.env.VITE_BACKEND_URL}/api/v1/auth/google`;
  };

  return (
    <div className="container">
      <div className="img-section">
        <img src={data} />
      </div>
      <div className="auth-section">
        <div className="btns">
          <Button
            className="formBtn"
            variant={form ? "contained" : "outlined"}
            onClick={() => {
              setForm(true);
            }}
          >
            Login
          </Button>
          <Button
            className="formBtn"
            variant={form ? "outlined" : "contained"}
            onClick={() => {
              setForm(false);
            }}
          >
            Register
          </Button>
        </div>

        {/* checks conditons for "form" and renders component based on answer */}

        <Card className="form">
          <CardContent>
            <form action="">
              {form ? (
                <>
                  {" "}
                  {/* For Login */}
                  <h2>🔐Sign in to continue</h2>
                  <br />
                </>
              ) : (
                <>
                  {/* For Register */}
                  <h2>📝Create your account</h2>
                  <br />
                  <div>
                    <TextField
                      id="name"
                      label="Full Name"
                      variant="standard"
                      value={name}
                      required
                      onChange={(e) => {
                        setName(e.target.value);
                      }}
                    />
                  </div>
                  <br />
                </>
              )}

              <div>
                <TextField
                  id="email"
                  label="Email"
                  variant="standard"
                  value={email}
                  required
                  onChange={(e) => {
                    setEmail(e.target.value);
                  }}
                />
              </div>
              <br />
              <div>
                <TextField
                  id="password"
                  label="Password"
                  variant="standard"
                  value={password}
                  required
                  onChange={(e) => {
                    setPassword(e.target.value);
                  }}
                />
              </div>
              <br />
              <br />
              <p style={{ color: "red" }}>{error}</p>
              <br />
              <Button onClick={handleAuth} type="button" variant="outlined">
                {form ? "LogIn" : "Register"}
              </Button>
              <br />
              <p
                style={{ color: "blue", cursor: "pointer" }}
                onClick={() => {
                  setForm(!form);
                }}
              >
                {form ? "New Here? Register!" : "Already a User? Login!"}
              </p>
              <h4 style={{ padding: "0.5rem" }}>OR</h4>
              <div>
                <Button
                  className="formBtn"
                  variant="contained"
                  onClick={handleGoogleLogin}
                >
                  Continue with Google
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
        <Snackbar open={open} autoHideDuration={4000} message={message} />
      </div>
    </div>
  );
}
