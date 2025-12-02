const server =
  import.meta.env.MODE === "development"
    ? "http://localhost:8080"
    : "https://voidmeet-backend.onrender.com";

export default server;
