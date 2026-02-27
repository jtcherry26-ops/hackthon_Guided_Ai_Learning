import { useState } from "react";
import TeacherConfig from "./TeacherConfig";
import StudentChat from "./StudentChat";

export default function App() {
  const [view, setView] = useState("teacher");

  return (
    <div style={{ fontFamily: "sans-serif", maxWidth: "800px", margin: "0 auto", padding: "20px" }}>
      <h1 style={{ textAlign: "center", marginBottom: "10px" }}>🎓 Socratic Tutor</h1>
      <div style={{ display: "flex", justifyContent: "center", gap: "10px", marginBottom: "30px" }}>
        <button
          onClick={() => setView("teacher")}
          style={{ padding: "10px 20px", background: view === "teacher" ? "#4F46E5" : "#e5e7eb", color: view === "teacher" ? "white" : "black", border: "none", borderRadius: "8px", cursor: "pointer" }}
        >
          Teacher Config
        </button>
        <button
          onClick={() => setView("student")}
          style={{ padding: "10px 20px", background: view === "student" ? "#4F46E5" : "#e5e7eb", color: view === "student" ? "white" : "black", border: "none", borderRadius: "8px", cursor: "pointer" }}
        >
          Student Chat
        </button>
      </div>
      {view === "teacher" ? <TeacherConfig /> : <StudentChat />}
    </div>
  );
}