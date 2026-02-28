import { useState } from "react";
import TeacherConfig from "./TeacherConfig";
import StudentChat from "./StudentChat";

export default function App() {
  const [view, setView] = useState("student");

  return (
    <div style={{ fontFamily: "'Inter', system-ui, sans-serif", minHeight: "100vh", background: "#F9FAFB" }}>
      <div style={{ background: "white", borderBottom: "1px solid #E5E7EB", padding: "0 32px", display: "flex", alignItems: "center", justifyContent: "space-between", height: "60px", position: "sticky", top: 0, zIndex: 10 }}>
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <span style={{ fontSize: "22px" }}>🎓</span>
          <span style={{ fontWeight: "700", fontSize: "18px", color: "#111827", letterSpacing: "-0.3px" }}>Socratic Tutor</span>
        </div>
        <div style={{ display: "flex", background: "#F3F4F6", borderRadius: "10px", padding: "4px", gap: "4px" }}>
          <button
            onClick={() => setView("student")}
            style={{ padding: "7px 18px", borderRadius: "7px", border: "none", cursor: "pointer", fontSize: "14px", fontWeight: "600", background: view === "student" ? "white" : "transparent", color: view === "student" ? "#111827" : "#6B7280", boxShadow: view === "student" ? "0 1px 3px rgba(0,0,0,0.1)" : "none", transition: "all 0.15s" }}
          >
            Student
          </button>
          <button
            onClick={() => setView("teacher")}
            style={{ padding: "7px 18px", borderRadius: "7px", border: "none", cursor: "pointer", fontSize: "14px", fontWeight: "600", background: view === "teacher" ? "white" : "transparent", color: view === "teacher" ? "#111827" : "#6B7280", boxShadow: view === "teacher" ? "0 1px 3px rgba(0,0,0,0.1)" : "none", transition: "all 0.15s" }}
          >
            Teacher
          </button>
        </div>
      </div>
      <div style={{ maxWidth: "900px", margin: "24px auto", padding: "0 24px" }}>
        {view === "student" ? <StudentChat /> : <TeacherConfig />}
      </div>
    </div>
  );
}