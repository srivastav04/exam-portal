import { useState } from "react";
import { Routes, Route, useNavigate } from "react-router-dom";
import axios from "axios";
import Result from "./Result";
import "./App.css";

/**
 * Home component (extracted from your original App)
 */
function Home() {
  const [ticket, setTicket] = useState("");
  const [error, setError] = useState("");
  const [status, setStatus] = useState(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const validate = (value) => {
    const v = value.trim();
    if (!v) return "Please enter your hall ticket number.";
    if (!/^[A-Za-z0-9-]{4,20}$/.test(v))
      return "Use 4–20 characters: letters, numbers or hyphen (-).";
    return "";
  };

  const handleChange = (e) => {
    const v = e.target.value;
    setTicket(v);
    if (error) setError(validate(v));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const err = validate(ticket);
    if (err) {
      setError(err);
      setStatus(null);
      return;
    }
    setError("");
    setLoading(true);
    setStatus(`Searching for hall ticket: ${ticket.trim()}`);

    try {
      const res = await axios.get(`http://localhost:3000/${ticket.trim()}`);
      // assume API returns { result: {...} }
      const data = res.data?.result ?? res.data;
      // navigate to result page with data in location.state (fast) and as URL param (deep link)
      navigate(`/result/${encodeURIComponent(ticket.trim())}`, {
        state: { data },
      });
    } catch (err) {
      console.error(err);
      setError(
        err.response?.data?.message ||
          "Could not fetch result. Please try again or contact admin.",
      );
      setStatus(null);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="home-page">
      <form
        className="form"
        onSubmit={handleSubmit}
        noValidate
        aria-labelledby="form-heading"
      >
        <div className="form-row">
          <label htmlFor="hallTicket" className="label" id="form-heading">
            Hall Ticket No.
          </label>
          <input
            id="hallTicket"
            name="hallTicket"
            className="input"
            value={ticket}
            onChange={handleChange}
            inputMode="numeric"
            autoComplete="off"
            maxLength={20}
            aria-describedby={error ? "error-message" : undefined}
            aria-invalid={!!error}
            placeholder="e.g. 2026-000123"
          />
        </div>

        {error && (
          <div id="error-message" className="error" role="alert">
            {error}
          </div>
        )}

        <button
          type="submit"
          className="submit-btn"
          aria-label="Submit hall ticket"
          disabled={loading}
        >
          {loading ? "Searching…" : "Submit"}
        </button>

        {status && (
          <div className="status" role="status" aria-live="polite">
            {status}
          </div>
        )}
      </form>
    </div>
  );
}

/**
 * App with routes
 */
export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/result/:ticket" element={<Result />} />
    </Routes>
  );
}
