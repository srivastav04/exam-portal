import React, { useEffect, useState } from "react";
import { useLocation, useParams, useNavigate } from "react-router-dom";
import axios from "axios";

/**
 * Result page:
 * - Uses location.state.data if present (fast, no refetch)
 * - Otherwise fetches using the :ticket URL param
 */
export default function Result() {
    const location = useLocation();
    const params = useParams();
    const navigate = useNavigate();

    const initial = location.state?.data ?? null;
    const [data, setData] = useState(initial);
    const [loading, setLoading] = useState(!initial);
    const [error, setError] = useState("");

    useEffect(() => {
        // if we already have data (via navigate state), no fetch needed
        if (data) return;

        const ticket = params.ticket;
        if (!ticket) {
            setError("No hall ticket provided.");
            setLoading(false);
            return;
        }

        let cancelled = false;
        async function fetchData() {
            setLoading(true);
            try {
                const res = await axios.get(`http://localhost:3000/${ticket}`);
                const result = res.data?.result ?? res.data;
                if (!cancelled) setData(result);
            } catch (err) {
                if (!cancelled) {
                    console.error(err);
                    setError(
                        err.response?.data?.message ||
                        "Failed to load result. Please try again or contact admin."
                    );
                }
            } finally {
                if (!cancelled) setLoading(false);
            }
        }
        fetchData();
        return () => {
            cancelled = true;
        };
    }, [data, params.ticket]);

    const renderKeyValueTable = (obj) => {
        if (!obj || typeof obj !== "object") return null;
        const entries = Object.entries(obj);
        return (
            <table className="info-table" role="table" aria-label="Student info">
                <thead>
                    <tr>
                        <th>Field</th>
                        <th>Value</th>
                    </tr>
                </thead>
                <tbody>
                    {entries.map(([k, v]) => (
                        <tr key={k}>
                            <td>{k}</td>
                            <td>
                                {typeof v === "object" ? JSON.stringify(v) : String(v ?? "")}
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        );
    };

    const renderMarksTable = (marks) => {
        if (!Array.isArray(marks) || marks.length === 0) return null;

        // try to infer columns from the first item
        const cols = Object.keys(marks[0]);
        return (
            <table className="marks-table" role="table" aria-label="Marks table">
                <thead>
                    <tr>
                        {cols.map((c) => (
                            <th key={c}>{c}</th>
                        ))}
                    </tr>
                </thead>
                <tbody>
                    {marks.map((row, idx) => (
                        <tr key={idx}>
                            {cols.map((c) => (
                                <td key={c + idx}>
                                    {typeof row[c] === "object" ? JSON.stringify(row[c]) : row[c]}
                                </td>
                            ))}
                        </tr>
                    ))}
                </tbody>
            </table>
        );
    };

    if (loading)
        return (
            <div className="result-page">
                <p role="status" aria-live="polite">
                    Loading result…
                </p>
            </div>
        );

    if (error)
        return (
            <div className="result-page">
                <div role="alert" className="error">
                    {error}
                </div>
                <button onClick={() => navigate(-1)}>Back</button>
            </div>
        );

    if (!data)
        return (
            <div className="result-page">
                <p>No result data available.</p>
                <button onClick={() => navigate(-1)}>Back</button>
            </div>
        );

    // Common possible shapes: { student: {..}, marks: [...] }, or { info: {...}, results: [...] }
    const studentInfo = data.student ?? data.info ?? data.personal ?? null;
    const marks = data.marks ?? data.results ?? data.exams ?? null;

    return (
        <div className="result-page">
            <h1>Result — {params.ticket ?? "Hall Ticket"}</h1>

            <div className="controls">
                <button onClick={() => navigate(-1)} aria-label="Go back">
                    Back
                </button>
                <button onClick={() => window.print()} aria-label="Print result">
                    Print
                </button>
            </div>

            {studentInfo ? (
                <>
                    <h2>Student Info</h2>
                    {renderKeyValueTable(studentInfo)}
                </>
            ) : null}

            {marks ? (
                <>
                    <h2>Marks / Results</h2>
                    {renderMarksTable(marks)}
                </>
            ) : null}

            {/* If nothing matched, show the raw JSON for debugging */}
            {!studentInfo && !marks && (
                <>
                    <h2>Raw response</h2>
                    <pre className="raw-json">{JSON.stringify(data, null, 2)}</pre>
                </>
            )}
        </div>
    );
}
