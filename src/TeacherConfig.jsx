import { useState, useEffect } from "react";

const DEMO_COURSES = [
  {
    topic: "Calculus: Derivatives",
    objectives: "Understand what a derivative represents, how to apply basic differentiation rules, and interpret slope as a rate of change.",
    misconceptions: "dy/dx is a fraction, derivatives are just slopes of lines, the derivative of a constant is 1",
    problems: [
      "Find the derivative of f(x) = x³ + 2x",
      "What is the derivative of f(x) = 5x² - 3x + 7?",
      "If f(x) = x⁴, what is f'(x)?"
    ],
    preloadedChat: [
      { role: "assistant", content: "Welcome to Calculus: Derivatives! Before we dive in — what do you think a derivative actually measures in the real world? Take a guess!" },
      { role: "user", content: "I think it has something to do with slope?" },
      { role: "assistant", content: "Good instinct! But slope of what exactly — a straight line or something more complex? And do you think the slope of a curve like x² stays the same everywhere on it?" },
      { role: "user", content: "No I guess it changes depending on where you are on the curve" },
      { role: "assistant", content: "Exactly! So if the slope is always changing, how would you even measure it at one specific point? What mathematical tool do you think could help us zoom in on a single point?" },
      { role: "user", content: "Maybe like a limit? Zoom in until it looks like a straight line?" },
      { role: "assistant", content: "That's precisely it — you just described the core idea behind derivatives! Now let's put it to work. If f(x) = x³ + 2x, what do you think happens to the slope as x gets larger — does it grow, shrink, or stay the same?" },
      { role: "user", content: "It probably grows since x³ gets big fast" },
      { role: "assistant", content: "Great intuition! Let's verify that. Using the power rule — which says the derivative of xⁿ is nxⁿ⁻¹ — can you try applying that to just the x³ part of f(x) = x³ + 2x?" }
    ]
  },
  {
    topic: "World War II: Causes",
    objectives: "Understand the political, economic, and social factors that led to the outbreak of World War II.",
    misconceptions: "Hitler alone caused WW2, the Treaty of Versailles directly caused the war, appeasement was cowardly and obviously wrong",
    problems: [
      "How did the Great Depression contribute to the rise of extremism in Europe?",
      "Why did Britain and France adopt a policy of appeasement toward Hitler?",
      "What role did nationalism play in the lead-up to war?"
    ],
    preloadedChat: [
      { role: "assistant", content: "Welcome to WW2: Causes! Let's start with a bold claim — most people say Hitler caused World War II. Do you think one person can really cause a world war? What conditions would need to exist first?" },
      { role: "user", content: "Probably not just him, like the country had to be in a bad place for people to follow him" },
      { role: "assistant", content: "Really good thinking. So what was Germany experiencing in the late 1920s and early 1930s that might have made people desperate enough to follow an extremist leader?" },
      { role: "user", content: "Wasn't there like massive inflation and unemployment after WW1?" },
      { role: "assistant", content: "Exactly right — the Great Depression hit Germany especially hard, with unemployment reaching 30%. Now here's a deeper question: why do economic crises so often lead people toward extreme political movements? What psychological need does that fulfill?" },
      { role: "user", content: "People want someone to blame and someone to promise things will get better?" },
      { role: "assistant", content: "That's a really mature analysis. Now apply that to the Treaty of Versailles — Germany was forced to accept full blame for WW1 and pay massive reparations. How do you think that humiliation combined with economic collapse shaped the German public's appetite for nationalism?" },
      { role: "user", content: "It probably made them really resentful and want to restore national pride" },
      { role: "assistant", content: "Precisely — and that resentment became the fuel Hitler used. So was the Treaty of Versailles the cause of WW2, or was it one ingredient in a larger recipe? What else needed to be present for war to actually break out?" }
    ]
  },
  {
    topic: "Intro to Machine Learning",
    objectives: "Understand what machine learning is, how models learn from data, and the difference between supervised and unsupervised learning.",
    misconceptions: "ML models think like humans, more data always means better results, ML can solve any problem given enough compute",
    problems: [
      "What is the difference between supervised and unsupervised learning?",
      "Why does a model overfit, and how do you prevent it?",
      "You have a dataset with 1000 features and 50 samples — what problems might you face?"
    ],
    preloadedChat: [
      { role: "assistant", content: "Welcome to Intro to Machine Learning! Let's start simple — what do you think it means for a machine to 'learn' something? How is that different from just being programmed?" },
      { role: "user", content: "I guess instead of telling it exactly what to do you show it examples and it figures out the pattern?" },
      { role: "assistant", content: "That's a really clean definition — you basically just described supervised learning. So if the machine learns from examples, what do you think it actually needs those examples to look like? What information does each example need to contain?" },
      { role: "user", content: "It probably needs the input and the correct answer so it knows if it got it right?" },
      { role: "assistant", content: "Exactly — we call those labels. Input + label = training data. Now here's a challenge: what if you have a million images but none of them are labeled? Can a machine still learn something useful from them, and if so, what?" },
      { role: "user", content: "Maybe it could group similar images together even without knowing what they are?" },
      { role: "assistant", content: "Perfect — you just described unsupervised learning, specifically clustering. Now think about this: a model trained on cat and dog photos gets 99% accuracy on training data but only 60% on new photos. What do you think went wrong?" },
      { role: "user", content: "It memorized the training data instead of learning the actual pattern?" },
      { role: "assistant", content: "Spot on — that's called overfitting. So what would you do to prevent a model from just memorizing? Think about what changes you could make to either the data or the training process." }
    ]
  }
];
export default function TeacherConfig() {
  const [topic, setTopic] = useState("");
  const [objectives, setObjectives] = useState("");
  const [misconceptions, setMisconceptions] = useState(["", "", ""]);
  const [problems, setProblems] = useState(["", "", ""]);
  const [saved, setSaved] = useState(false);
  const [courses, setCourses] = useState([]);

  useEffect(() => {
    const existing = localStorage.getItem("allCourses");
    if (existing) {
      setCourses(JSON.parse(existing));
    } else {
      localStorage.setItem("allCourses", JSON.stringify(DEMO_COURSES));
      setCourses(DEMO_COURSES);
    }
  }, []);

  const handleMisconception = (i, v) => { const u = [...misconceptions]; u[i] = v; setMisconceptions(u); };
  const handleProblem = (i, v) => { const u = [...problems]; u[i] = v; setProblems(u); };

  const handleSubmit = () => {
    const config = {
      topic,
      objectives,
      misconceptions: misconceptions.filter(m => m.trim() !== "").join(", "),
      problems: problems.filter(p => p.trim() !== ""),
    };
    const updated = [...courses.filter(c => c.topic !== topic), config];
    localStorage.setItem("allCourses", JSON.stringify(updated));
    setCourses(updated);
    setSaved(true);
    setTopic(""); setObjectives(""); setMisconceptions(["","",""]); setProblems(["","",""]);
  };

  const deleteCourse = (t) => {
    const updated = courses.filter(c => c.topic !== t);
    localStorage.setItem("allCourses", JSON.stringify(updated));
    setCourses(updated);
  };

  const inputStyle = { width: "100%", padding: "10px", borderRadius: "8px", border: "1px solid #e5e7eb", fontSize: "14px", boxSizing: "border-box", marginBottom: "8px" };

  return (
    <div style={{ border: "1px solid #e5e7eb", borderRadius: "12px", padding: "30px" }}>
      <h2 style={{ marginBottom: "6px", fontSize: "20px", fontWeight: "bold" }}>Teacher Configuration</h2>
      <p style={{ color: "#6B7280", fontSize: "14px", marginBottom: "20px" }}>4 demo courses are pre-loaded. Add your own below.</p>

      {/* Saved Courses */}
      <div style={{ marginBottom: "24px" }}>
        <p style={{ fontWeight: "600", marginBottom: "8px" }}>Active Courses ({courses.length})</p>
        {courses.map((c, i) => (
          <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 14px", background: "#F5F3FF", borderRadius: "8px", marginBottom: "6px", border: "1px solid #E0E7FF" }}>
            <div>
              <span style={{ fontWeight: "600", color: "#4F46E5" }}>{c.topic}</span>
              {c.problems?.length > 0 && <span style={{ marginLeft: "8px", fontSize: "12px", color: "#7C3AED" }}>📝 {c.problems.length} problems</span>}
            </div>
            <button onClick={() => deleteCourse(c.topic)} style={{ background: "none", border: "none", color: "#EF4444", cursor: "pointer", fontSize: "12px" }}>Remove</button>
          </div>
        ))}
      </div>

      {/* Add new course */}
      <div style={{ borderTop: "1px solid #e5e7eb", paddingTop: "20px" }}>
        <p style={{ fontWeight: "600", marginBottom: "16px" }}>Add New Course</p>

        <label style={{ display: "block", marginBottom: "5px", fontWeight: "600", fontSize: "14px" }}>Topic</label>
        <input value={topic} onChange={(e) => setTopic(e.target.value)} placeholder="e.g. Cell Biology" style={inputStyle} />

        <label style={{ display: "block", marginBottom: "5px", fontWeight: "600", fontSize: "14px", marginTop: "8px" }}>Learning Objectives</label>
        <textarea value={objectives} onChange={(e) => setObjectives(e.target.value)} placeholder="What should students understand by the end?" rows={2} style={{ ...inputStyle, resize: "vertical" }} />

        <label style={{ display: "block", marginBottom: "5px", fontWeight: "600", fontSize: "14px", marginTop: "8px" }}>Common Misconceptions</label>
        {misconceptions.map((m, i) => (
          <input key={i} value={m} onChange={(e) => handleMisconception(i, e.target.value)} placeholder={`Misconception ${i + 1}`} style={inputStyle} />
        ))}

        <label style={{ display: "block", marginBottom: "5px", fontWeight: "600", fontSize: "14px", marginTop: "8px" }}>Practice Problems</label>
        {problems.map((p, i) => (
          <input key={i} value={p} onChange={(e) => handleProblem(i, e.target.value)} placeholder={`Problem ${i + 1}`} style={inputStyle} />
        ))}

        <button onClick={handleSubmit} disabled={!topic} style={{ width: "100%", padding: "12px", background: topic ? "#4F46E5" : "#9CA3AF", color: "white", border: "none", borderRadius: "8px", fontSize: "16px", cursor: topic ? "pointer" : "not-allowed", fontWeight: "600", marginTop: "8px" }}>
          Save Course
        </button>

        {saved && (
          <div style={{ marginTop: "12px", padding: "10px", background: "#ECFDF5", borderRadius: "8px", color: "#065F46", textAlign: "center" }}>
            ✅ Course saved! Switch to Student view to test.
          </div>
        )}
      </div>
    </div>
  );
}