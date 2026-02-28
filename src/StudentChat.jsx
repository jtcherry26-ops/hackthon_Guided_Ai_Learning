import { useState, useEffect, useRef } from "react";

export default function StudentChat() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [config, setConfig] = useState(null);
  const [courses, setCourses] = useState([]);
  const [progress, setProgress] = useState(0);
  const [summary, setSummary] = useState(null);
  const [summaryLoading, setSummaryLoading] = useState(false);
  const bottomRef = useRef(null);
  const TOTAL_STEPS = 8;

  useEffect(() => {
    const all = localStorage.getItem("allCourses");
    if (all) setCourses(JSON.parse(all));
  }, []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const loadCourse = (course) => {
    const savedHistory = localStorage.getItem(`chat_${course.topic}`);
    const savedProgress = localStorage.getItem(`progress_${course.topic}`);
    if (savedHistory) {
      setMessages(JSON.parse(savedHistory));
      setProgress(parseFloat(savedProgress || "0"));
    } else {
      const initialMessages = course.preloadedChat || [
        { role: "assistant", content: `Welcome! Today we're exploring **${course.topic}**. ${course.problems?.length > 0 ? `I'll guide you through ${course.problems.length} practice problems — ready to start?` : "What questions do you have?"}` }
      ];
      setMessages(initialMessages);
      setProgress(0);
    }
    const savedSummary = localStorage.getItem(`summary_${course.topic}`);
setSummary(savedSummary || null);
    setConfig(course);
  };

  const saveToStorage = (msgs, prog, topic) => {
    localStorage.setItem(`chat_${topic}`, JSON.stringify(msgs));
    localStorage.setItem(`progress_${topic}`, prog.toString());
  };

  const clearHistory = () => {
    localStorage.removeItem(`chat_${config.topic}`);
    localStorage.removeItem(`progress_${config.topic}`);
    const initialMessages = config.preloadedChat || [{ role: "assistant", content: `Let's start fresh! Ready to dive into ${config.topic}?` }];
    setMessages(initialMessages);
    setProgress(0);
    setSummary(null);
  };

  const buildSystemPrompt = (cfg) => {
    const problemsText = cfg.problems?.length > 0
      ? `Practice problems to guide through one at a time: ${cfg.problems.map((p, i) => `${i + 1}. ${p}`).join(" | ")}`
      : "";
    return `You are a Socratic tutor helping a student learn about: ${cfg.topic}.
Learning objectives: ${cfg.objectives}
Common misconceptions to watch for: ${cfg.misconceptions}
${problemsText}

CRITICAL RULES:
- NEVER give direct answers
- ALWAYS respond with guiding questions
- Guide through practice problems one at a time
- Celebrate progress briefly then move on
- Be warm, concise — 2-3 sentences max, always end with a question`;
  };

  const generateSummary = async () => {
    setSummaryLoading(true);
    try {
      const response = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": import.meta.env.VITE_ANTHROPIC_API_KEY,
          "anthropic-version": "2023-06-01",
          "anthropic-dangerous-direct-browser-access": "true",
        },
        body: JSON.stringify({
          model: "claude-sonnet-4-20250514",
          max_tokens: 1000,
          system: "You generate concise learning summaries. Given a tutoring conversation, output a clean summary with: 1) Key concepts the student demonstrated understanding of, 2) Questions they answered well, 3) Areas to review. Use simple formatting with emoji bullets. Keep it under 150 words.",
          messages: [{ role: "user", content: `Summarize what this student learned:\n\n${messages.map(m => `${m.role === "user" ? "Student" : "Tutor"}: ${m.content}`).join("\n")}` }],
        }),
      });
      const data = await response.json();
      const summaryText = data.content[0].text;
setSummary(summaryText);
localStorage.setItem(`summary_${config.topic}`, summaryText);
    } catch (err) {
      setSummary("Could not generate summary.");
    }
    setProgress(100);
saveToStorage(messages, 100, config.topic);
    setSummaryLoading(false);
  };

  const sendMessage = async () => {
    if (!input.trim() || loading) return;
    const userMessage = { role: "user", content: input };
    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setInput("");
    setLoading(true);
    const newProgress = Math.min((newMessages.length / (TOTAL_STEPS * 2)) * 100, 95);
    setProgress(newProgress);

    try {
      const response = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": import.meta.env.VITE_ANTHROPIC_API_KEY,
          "anthropic-version": "2023-06-01",
          "anthropic-dangerous-direct-browser-access": "true",
        },
        body: JSON.stringify({
          model: "claude-sonnet-4-20250514",
          max_tokens: 1000,
          system: buildSystemPrompt(config),
          messages: newMessages.map((m) => ({ role: m.role, content: m.content })),
        }),
      });

      const data = await response.json();
      if (data.error) {
        setMessages([...newMessages, { role: "assistant", content: `Error: ${data.error.message}` }]);
      } else {
        const reply = data.content[0].text;
        const finalMessages = [...newMessages, { role: "assistant", content: reply }];
        setMessages(finalMessages);
        saveToStorage(finalMessages, newProgress, config.topic);
      }
    } catch (err) {
      setMessages([...newMessages, { role: "assistant", content: "Something went wrong: " + err.message }]);
    }
    setLoading(false);
  };

  if (!config) {
    return (
      <div style={{ border: "1px solid #e5e7eb", borderRadius: "12px", padding: "30px", background: "white" }}>
        <h2 style={{ marginBottom: "6px", fontSize: "20px", fontWeight: "bold" }}>Choose a Course</h2>
        <p style={{ color: "#6B7280", marginBottom: "20px", fontSize: "14px" }}>Select a topic to start learning</p>
        {courses.length === 0 ? (
          <div style={{ textAlign: "center", padding: "40px", color: "#9CA3AF" }}>No courses yet. Ask your teacher to set one up.</div>
        ) : (
          courses.map((c, i) => {
            const hasHistory = !!localStorage.getItem(`chat_${c.topic}`);
            const savedProgress = parseFloat(localStorage.getItem(`progress_${c.topic}`) || "0");
            return (
              <div key={i} onClick={() => loadCourse(c)}
                style={{ padding: "16px 20px", background: "#F5F3FF", borderRadius: "10px", marginBottom: "10px", border: "1px solid #E0E7FF", cursor: "pointer" }}
                onMouseOver={e => e.currentTarget.style.background = "#EDE9FE"}
                onMouseOut={e => e.currentTarget.style.background = "#F5F3FF"}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <p style={{ fontWeight: "700", color: "#4F46E5", fontSize: "16px", marginBottom: "4px" }}>{c.topic}</p>
                  {hasHistory && <span style={{ fontSize: "11px", color: "#7C3AED", background: "#EDE9FE", padding: "2px 8px", borderRadius: "999px" }}>In progress</span>}
                </div>
                <p style={{ color: "#6B7280", fontSize: "13px", marginBottom: "6px" }}>{c.objectives?.slice(0, 80)}...</p>
                {hasHistory && (
                  <div style={{ background: "rgba(255,255,255,0.6)", borderRadius: "999px", height: "4px", marginTop: "6px" }}>
                    <div style={{ background: "#4F46E5", borderRadius: "999px", height: "4px", width: `${savedProgress}%` }} />
                  </div>
                )}
                {c.problems?.length > 0 && <p style={{ color: "#7C3AED", fontSize: "12px", marginTop: "6px" }}>📝 {c.problems.length} practice problems</p>}
              </div>
            );
          })
        )}
      </div>
    );
  }

  return (
    <div style={{ border: "1px solid #e5e7eb", borderRadius: "12px", overflow: "hidden", background: "white" }}>
      {/* Header */}
      <div style={{ background: "#4F46E5", padding: "16px 20px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
          <span style={{ color: "white", fontWeight: "700", fontSize: "16px" }}>{config.topic}</span>
          <div style={{ display: "flex", gap: "8px" }}>
            <button onClick={clearHistory} style={{ background: "rgba(255,255,255,0.15)", border: "none", color: "white", padding: "4px 10px", borderRadius: "6px", cursor: "pointer", fontSize: "11px" }}>Restart</button>
            <button onClick={() => { setConfig(null); setMessages([]); }} style={{ background: "rgba(255,255,255,0.15)", border: "none", color: "white", padding: "4px 10px", borderRadius: "6px", cursor: "pointer", fontSize: "11px" }}>← Courses</button>
          </div>
        </div>
        <div style={{ background: "rgba(255,255,255,0.2)", borderRadius: "999px", height: "6px" }}>
          <div style={{ background: "white", borderRadius: "999px", height: "6px", width: `${progress}%`, transition: "width 0.5s ease" }} />
        </div>
        <p style={{ color: "#C7D2FE", fontSize: "11px", marginTop: "4px" }}>{Math.round(progress)}% through the lesson</p>
      </div>

      {/* Objectives bar */}
      <div style={{ background: "#F5F3FF", padding: "10px 20px", borderBottom: "1px solid #E0E7FF" }}>
        <p style={{ fontSize: "12px", color: "#6D28D9", fontWeight: "600" }}>🎯 {config.objectives}</p>
      </div>

      {/* Chat */}
      <div style={{ height: "360px", overflowY: "auto", padding: "20px", display: "flex", flexDirection: "column", gap: "12px" }}>
        {messages.map((m, i) => (
          <div key={i} style={{ display: "flex", justifyContent: m.role === "user" ? "flex-end" : "flex-start" }}>
            <div style={{ maxWidth: "70%", padding: "10px 15px", borderRadius: "12px", background: m.role === "user" ? "#4F46E5" : "#F3F4F6", color: m.role === "user" ? "white" : "black", fontSize: "14px", lineHeight: "1.5" }}>
              {m.content}
            </div>
          </div>
        ))}
        {loading && (
          <div style={{ display: "flex", justifyContent: "flex-start" }}>
            <div style={{ background: "#F3F4F6", padding: "10px 15px", borderRadius: "12px", color: "#9CA3AF" }}>Thinking...</div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div style={{ display: "flex", gap: "10px", padding: "15px", borderTop: "1px solid #e5e7eb" }}>
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && sendMessage()}
          placeholder="Answer the problem or ask a question..."
          style={{ flex: 1, padding: "10px", borderRadius: "8px", border: "1px solid #e5e7eb", fontSize: "14px" }}
        />
        <button onClick={sendMessage} disabled={loading} style={{ padding: "10px 20px", background: "#4F46E5", color: "white", border: "none", borderRadius: "8px", cursor: "pointer", fontWeight: "600" }}>
          Send
        </button>
      </div>

      {/* Summary button */}
      {messages.length >= 6 && !summary && (
        <div style={{ padding: "0 15px 15px" }}>
          <button onClick={generateSummary} disabled={summaryLoading} style={{ width: "100%", padding: "10px", background: "#ECFDF5", color: "#065F46", border: "1px solid #6EE7B7", borderRadius: "8px", cursor: "pointer", fontWeight: "600", fontSize: "14px" }}>
            {summaryLoading ? "Generating summary..." : "✅ Complete Lesson & Get Summary"}
          </button>
        </div>
      )}

      {/* Summary output */}
      {summary && (
        <div style={{ margin: "0 15px 15px", padding: "16px", background: "#ECFDF5", borderRadius: "10px", border: "1px solid #6EE7B7" }}>
          <p style={{ fontWeight: "700", color: "#065F46", marginBottom: "10px" }}>📋 Lesson Summary</p>
          <p style={{ fontSize: "14px", color: "#374151", lineHeight: "1.7", whiteSpace: "pre-wrap" }}>{summary}</p>
        </div>
      )}
    </div>
  );
}