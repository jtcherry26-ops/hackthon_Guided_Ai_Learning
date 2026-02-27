import { useState, useEffect, useRef } from "react";

export default function StudentChat() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [config, setConfig] = useState(null);
  const bottomRef = useRef(null);

  useEffect(() => {
    const saved = localStorage.getItem("teacherConfig");
    if (saved) {
      setConfig(JSON.parse(saved));
      setMessages([{ role: "assistant", content: "Hey! I'm here to help you learn. What questions do you have about the topic?" }]);
    } else {
      setMessages([{ role: "assistant", content: "No lesson configured yet. Ask your teacher to set up a topic first." }]);
    }
  }, []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const buildSystemPrompt = (cfg) => {
    return `You are a Socratic tutor helping a student learn about: ${cfg.topic}.

Learning objectives: ${cfg.objectives}

Common misconceptions to watch for: ${cfg.misconceptions}

CRITICAL RULES:
- NEVER give direct answers to questions
- ALWAYS respond with guiding questions that lead the student to discover the answer themselves
- If a student shows a misconception, gently challenge it with a question
- Encourage deeper thinking by asking "why" and "how" questions
- Be warm, encouraging, and patient
- Keep responses concise — 2-3 sentences max, always ending with a question`;
  };

  const sendMessage = async () => {
    if (!input.trim() || loading) return;

    const userMessage = { role: "user", content: input };
    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setInput("");
    setLoading(true);

    try {
      const apiKey = import.meta.env.VITE_ANTHROPIC_API_KEY;
      console.log("Using key:", apiKey ? apiKey.slice(0, 10) + "..." : "NOT FOUND");

      const body = {
        model: "claude-sonnet-4-20250514",
        max_tokens: 1000,
        system: config ? buildSystemPrompt(config) : "You are a Socratic tutor. Never give direct answers, only ask guiding questions.",
        messages: newMessages.map((m) => ({ role: m.role, content: m.content })),
      };

      console.log("Request body:", JSON.stringify(body));

      const response = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": apiKey,
          "anthropic-version": "2023-06-01",
          "anthropic-dangerous-direct-browser-access": "true",
        },
        body: JSON.stringify(body),
      });

      const data = await response.json();
      console.log("FULL RESPONSE:", JSON.stringify(data));

      if (data.error) {
        setMessages([...newMessages, { role: "assistant", content: `Error: ${data.error.message}` }]);
      } else {
        const reply = data.content[0].text;
        setMessages([...newMessages, { role: "assistant", content: reply }]);
      }
    } catch (err) {
      console.error("Fetch error:", err);
      setMessages([...newMessages, { role: "assistant", content: "Something went wrong: " + err.message }]);
    }

    setLoading(false);
  };

  return (
    <div style={{ border: "1px solid #e5e7eb", borderRadius: "12px", overflow: "hidden" }}>
      {config && (
        <div style={{ background: "#EEF2FF", padding: "10px 20px", borderBottom: "1px solid #e5e7eb" }}>
          <strong>Topic:</strong> {config.topic}
        </div>
      )}
      <div style={{ height: "450px", overflowY: "auto", padding: "20px", display: "flex", flexDirection: "column", gap: "12px" }}>
        {messages.map((m, i) => (
          <div key={i} style={{ display: "flex", justifyContent: m.role === "user" ? "flex-end" : "flex-start" }}>
            <div style={{
              maxWidth: "70%", padding: "10px 15px", borderRadius: "12px",
              background: m.role === "user" ? "#4F46E5" : "#F3F4F6",
              color: m.role === "user" ? "white" : "black"
            }}>
              {m.content}
            </div>
          </div>
        ))}
        {loading && (
          <div style={{ display: "flex", justifyContent: "flex-start" }}>
            <div style={{ background: "#F3F4F6", padding: "10px 15px", borderRadius: "12px" }}>Thinking...</div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>
      <div style={{ display: "flex", gap: "10px", padding: "15px", borderTop: "1px solid #e5e7eb" }}>
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && sendMessage()}
          placeholder="Ask a question..."
          style={{ flex: 1, padding: "10px", borderRadius: "8px", border: "1px solid #e5e7eb", fontSize: "14px" }}
        />
        <button
          onClick={sendMessage}
          disabled={loading}
          style={{ padding: "10px 20px", background: "#4F46E5", color: "white", border: "none", borderRadius: "8px", cursor: "pointer" }}
        >
          Send
        </button>
      </div>
    </div>
  );
}