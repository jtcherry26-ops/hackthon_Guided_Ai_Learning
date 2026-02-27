import { useState } from "react";

export default function TeacherConfig() {
  const [topic, setTopic] = useState("");
  const [objectives, setObjectives] = useState("");
  const [misconceptions, setMisconceptions] = useState(["", "", ""]);
  const [saved, setSaved] = useState(false);

  const handleMisconception = (index, value) => {
    const updated = [...misconceptions];
    updated[index] = value;
    setMisconceptions(updated);
  };

  const handleSubmit = () => {
    const config = {
      topic,
      objectives,
      misconceptions: misconceptions.filter((m) => m.trim() !== "").join(", "),
    };
    localStorage.setItem("teacherConfig", JSON.stringify(config));
    setSaved(true);
  };

  return (
    <div style={{ border: "1px solid #e5e7eb", borderRadius: "12px", padding: "30px" }}>
      <h2 style={{ marginBottom: "20px", fontSize: "20px", fontWeight: "bold" }}>Teacher Configuration</h2>

      <div style={{ marginBottom: "15px" }}>
        <label style={{ display: "block", marginBottom: "5px", fontWeight: "600" }}>Topic</label>
        <input
          value={topic}
          onChange={(e) => setTopic(e.target.value)}
          placeholder="e.g. Photosynthesis, Calculus, World War II"
          style={{ width: "100%", padding: "10px", borderRadius: "8px", border: "1px solid #e5e7eb", fontSize: "14px", boxSizing: "border-box" }}
        />
      </div>

      <div style={{ marginBottom: "15px" }}>
        <label style={{ display: "block", marginBottom: "5px", fontWeight: "600" }}>Learning Objectives</label>
        <textarea
          value={objectives}
          onChange={(e) => setObjectives(e.target.value)}
          placeholder="What should the student understand by the end?"
          rows={3}
          style={{ width: "100%", padding: "10px", borderRadius: "8px", border: "1px solid #e5e7eb", fontSize: "14px", boxSizing: "border-box" }}
        />
      </div>

      <div style={{ marginBottom: "20px" }}>
        <label style={{ display: "block", marginBottom: "5px", fontWeight: "600" }}>Common Misconceptions</label>
        {misconceptions.map((m, i) => (
          <input
            key={i}
            value={m}
            onChange={(e) => handleMisconception(i, e.target.value)}
            placeholder={`Misconception ${i + 1}`}
            style={{ width: "100%", padding: "10px", borderRadius: "8px", border: "1px solid #e5e7eb", fontSize: "14px", boxSizing: "border-box", marginBottom: "8px" }}
          />
        ))}
      </div>

      <button
        onClick={handleSubmit}
        style={{ width: "100%", padding: "12px", background: "#4F46E5", color: "white", border: "none", borderRadius: "8px", fontSize: "16px", cursor: "pointer", fontWeight: "600" }}
      >
        Save Configuration
      </button>

      {saved && (
        <div style={{ marginTop: "15px", padding: "10px", background: "#ECFDF5", borderRadius: "8px", color: "#065F46", textAlign: "center" }}>
          ✅ Config saved! Switch to Student view to test.
        </div>
      )}
    </div>
  );
}