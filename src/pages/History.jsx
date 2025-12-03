import { useContext, useEffect, useState } from "react";
import { AuthContext } from "../contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import HistoryIcon from "@mui/icons-material/History";
import SentimentVeryDissatisfiedIcon from "@mui/icons-material/SentimentVeryDissatisfied";
import WithAuth from "../utils/withAuth";
import "../styles/History.css";

function History() {
  const { getUserHistory, clearOneMeetingCode, clearAllHistory } =
    useContext(AuthContext);

  const [meetings, setMeetings] = useState([]);

  const routeTo = useNavigate();

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const history = await getUserHistory();
        setMeetings(history);
        console.log(history);
      } catch (e) {
        setMeetings([]);
      }
    };
    fetchHistory();
  }, []);

  let formatDate = (dateString) => {
    const date = new Date(dateString);
    const day = date.getDate().toString().padStart(2, "0");
    const month = (date.getMonth() + 1).toString().padStart(2, "0");
    const year = date.getFullYear();

    return `${day}/${month}/${year}`;
  };

  const clearOne = async (id) => {
    try {
      await clearOneMeetingCode(id);
      setMeetings((prev) => prev.filter((m) => m._id !== id)); // removes (filters) the card with this "id" from all meetings arr -> Update's UI
    } catch (e) {
      console.error(e);
    }
  };

  const clearAll = async () => {
    try {
      await clearAllHistory();
      setMeetings([]); // removes (filters) the card with this "id" from all meetings arr -> Update's UI
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="history-container">
      {meetings.length === 0 ? (
        <h3>
          No History yet!
          <SentimentVeryDissatisfiedIcon />
        </h3>
      ) : (
        <h3>
          {" "}
          Your Meeting History{" "}
          <button
            onClick={() => clearAll()}
            style={{
              padding: "8px 14px",
              background: "#d9534f", // soft red (Bootstrap danger tone)
              color: "white",
              border: "none",
              borderRadius: "5px",
              cursor: "pointer",
              fontSize: "14px",
              transition: "0.2s",
            }}
            onMouseEnter={(e) => (e.target.style.background = "#c9302c")} // darker red
            onMouseLeave={(e) => (e.target.style.background = "#d9534f")}
          >
            clear all history
          </button>
          <HistoryIcon />
        </h3>
      )}

      {meetings.length !== 0 ? (
        meetings.map((e, i) => {
          return (
            <div className="one-card" key={i}>
              <Card>
                <CardContent key={e._id}>
                  <p className="card-head">Meeting Details</p>
                  <p>Code: {e.meetingCode}</p>
                  <p>Date: {formatDate(e.date)}</p>
                  <button
                    onClick={() => clearOne(e._id)}
                    style={{
                      padding: "6px 12px",
                      background: "white",
                      color: "#d9534f",
                      border: "1px solid #d9534f",
                      borderRadius: "4px",
                      cursor: "pointer",
                      fontSize: "13px",
                      transition: "0.2s",
                      marginTop: "0.5rem",
                    }}
                    onMouseEnter={(e) => {
                      e.target.style.background = "#d9534f";
                      e.target.style.color = "white";
                    }}
                    onMouseLeave={(e) => {
                      e.target.style.background = "white";
                      e.target.style.color = "#d9534f";
                    }}
                  >
                    delete
                  </button>
                </CardContent>
              </Card>
              <br />
            </div>
          );
        })
      ) : (
        <></>
      )}
    </div>
  );
}

export default WithAuth(History);
