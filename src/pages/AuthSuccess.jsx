import { useEffect } from "react";
import Loader from "../components/Loader";

export default function AuthSuccess() {
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get("token");

    if (token) {
      localStorage.setItem("token", token);

      setTimeout(() => {
        window.location.href = "/home";
      }, 300);
    }
  }, []);

  return <Loader />;
}
