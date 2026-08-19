import React, { useState, useEffect, useRef } from "react";
import AppLayout from "../layouts/AppLayout";
import { useAuth } from "../contexts/AuthContext";
import { useQuizStore } from "../store/quizStore";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from "recharts";
import { toast } from "sonner";

// ─── Data ─────────────────────────────────────────────────────────────────────

const MOCK_STUDENTS = [
  { name: "Nguyễn Minh Tuấn", answer: "A", correct: true },
  { name: "Lê Thị Lan Anh", answer: "B", correct: false },
  { name: "Trần Văn An", answer: "A", correct: true },
  { name: "Phạm Thị Hoa", answer: "A", correct: true },
  { name: "Đỗ Văn Bình", answer: "C", correct: false },
  { name: "Ngô Thị Mai", answer: "A", correct: true },
  { name: "Vũ Hoàng Nam", answer: "D", correct: false },
  { name: "Bùi Thị Thu", answer: "A", correct: true },
];

const OPTION_COLORS = [
  {
    label: "A",
    bg: "linear-gradient(135deg, #dc2626, #b91c1c)",
    shadow: "rgba(220,38,38,0.4)",
    light: "#fca5a5",
  },
  {
    label: "B",
    bg: "linear-gradient(135deg, #1d4ed8, #1e40af)",
    shadow: "rgba(29,78,216,0.4)",
    light: "#93c5fd",
  },
  {
    label: "C",
    bg: "linear-gradient(135deg, #ca8a04, #a16207)",
    shadow: "rgba(202,138,4,0.4)",
    light: "#fde68a",
  },
  {
    label: "D",
    bg: "linear-gradient(135deg, #16a34a, #15803d)",
    shadow: "rgba(22,163,74,0.4)",
    light: "#86efac",
  },
];
const JOIN_CODE = "GEO-10A1";

// ─── Timer bar component ───────────────────────────────────────────────────────
function TimerBar({
  timeLeft,
  total,
}: {
  timeLeft: number;
  total: number;
}) {
  const pct = (timeLeft / total) * 100;
  const color =
    pct > 60 ? "#34d399" : pct > 30 ? "#fbbf24" : "#fb7185";
  return (
    <div
      style={{
        width: "100%",
        height: 8,
        background: "#1e293b",
        borderRadius: 4,
        overflow: "hidden",
        margin: "12px 0",
      }}
    >
      <div
        style={{
          height: "100%",
          width: `${pct}%`,
          background: color,
          borderRadius: 4,
          transition: "width 1s linear, background 0.5s ease",
          boxShadow: `0 0 8px ${color}80`,
        }}
      />
    </div>
  );
}

// ─── Bar chart for results ─────────────────────────────────────────────────────
function ResultsChart({
  correct,
  total,
  question,
}: {
  correct: string;
  total: number;
  question: { options: string[] };
}) {
  const counts = { A: 0, B: 0, C: 0, D: 0 };
  MOCK_STUDENTS.forEach((s) => {
    const letter = s.answer as "A" | "B" | "C" | "D";
    counts[letter]++;
  });

  const data = Object.entries(counts).map(([letter, count], i) => {
    const pct = Math.round((count / MOCK_STUDENTS.length) * 100);
    const isCorrect = letter === correct;
    return {
      name: question.options[i],
      count,
      pct,
      isCorrect,
      letter,
      fill: isCorrect ? '#34d399' : OPTION_COLORS[i].light,
    };
  });

  return (
    <div style={{ width: "100%", height: 300, marginTop: 16 }}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} layout="vertical" margin={{ top: 0, right: 30, left: 40, bottom: 0 }}>
          <XAxis type="number" hide />
          <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 12 }} width={120} />
          <Tooltip
            cursor={{ fill: '#1e293b' }}
            contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: 8, color: '#f1f5f9' }}
            itemStyle={{ color: '#5eead4' }}
            formatter={(value: number, name: string, props: any) => [`${value} học sinh (${props.payload.pct}%)`, "Lựa chọn"]}
          />
          <Bar dataKey="count" radius={[0, 4, 4, 0]} barSize={24}>
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.fill} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

// ─── Main page ────────────────────────────────────────────────────────────────
export default function QuizLivePage() {
  const { user } = useAuth();
  const liveQuizData = useQuizStore(state => state.liveQuizData);

  const QUIZ_QUESTIONS = liveQuizData ? liveQuizData.map((q: any) => ({
    id: q.id,
    text: q.question,
    options: q.options.map((opt: any) => `${opt.key}. ${opt.text}`),
    correct: q.correctAnswer,
    timeLimit: 15
  })) : [
    {
      id: "q1",
      text: "Lực Coriolis làm gió ở bán cầu Bắc lệch về hướng nào?",
      options: ["A. Phải", "B. Trái", "C. Bắc", "D. Nam"],
      correct: "A",
      timeLimit: 20,
    },
    {
      id: "q2",
      text: "Việt Nam thuộc múi giờ nào?",
      options: ["A. UTC+5", "B. UTC+6", "C. UTC+7", "D. UTC+8"],
      correct: "C",
      timeLimit: 15,
    },
    {
      id: "q3",
      text: "Triều cường xảy ra khi Trái Đất, Mặt Trăng và Mặt Trời",
      options: ["A. Thẳng hàng", "B. Vuông góc", "C. Cách đều nhau", "D. Song song"],
      correct: "A",
      timeLimit: 20,
    },
    {
      id: "q4",
      text: "Khí áp giảm khi lên cao vì",
      options: [
        "A. Không khí loãng hơn",
        "B. Nhiệt độ cao hơn",
        "C. Gió mạnh hơn",
        "D. Biển xa hơn",
      ],
      correct: "A",
      timeLimit: 20,
    },
    {
      id: "q5",
      text: "Núi lửa thường xuất hiện ở",
      options: ["A. Vành đai lửa", "B. Đồng bằng", "C. Sa mạc", "D. Rừng nhiệt đới"],
      correct: "A",
      timeLimit: 15,
    },
  ];

  // Role: teacher or student
  const [role, setRole] = useState<"teacher" | "student">("teacher");
  const [currentQ, setCurrentQ] = useState(0);
  const [timeLeft, setTimeLeft] = useState(QUIZ_QUESTIONS[0].timeLimit);
  const [phase, setPhase] = useState<"question" | "results" | "final">(
    "question"
  );
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [scores, setScores] = useState<Record<string, number>>({});
  const [timerActive, setTimerActive] = useState(true);
  const [fullscreen, setFullscreen] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const currentQuestion = QUIZ_QUESTIONS[currentQ];

  // Timer countdown
  useEffect(() => {
    if (!timerActive || phase !== "question") return;
    intervalRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(intervalRef.current!);
          setPhase("results");
          setTimerActive(false);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(intervalRef.current!);
  }, [timerActive, phase, currentQ]);

  const nextQuestion = () => {
    if (currentQ + 1 >= QUIZ_QUESTIONS.length) {
      setPhase("final");
      return;
    }
    const next = currentQ + 1;
    setCurrentQ(next);
    setTimeLeft(QUIZ_QUESTIONS[next].timeLimit);
    setPhase("question");
    setSelectedAnswer(null);
    setTimerActive(true);
  };

  const handleStudentAnswer = (letter: string) => {
    if (selectedAnswer || phase === "results") return;
    setSelectedAnswer(letter);
    if (letter === currentQuestion.correct) {
      const pts = Math.max(100, timeLeft * 10);
      setScores((prev) => ({
        ...prev,
        [user?.name ?? "Tôi"]:
          (prev[user?.name ?? "Tôi"] ?? 0) + pts,
      }));
    }
  };

  const viewResults = () => {
    clearInterval(intervalRef.current!);
    setPhase("results");
    setTimerActive(false);
  };

  // Leaderboard
  const leaderboard = [
    { name: "Nguyễn Minh Tuấn", score: 450 },
    { name: "Phạm Thị Hoa", score: 380 },
    { name: "Bùi Thị Thu", score: 310 },
    { name: "Lê Thị Lan Anh", score: 180 },
    { name: "Trần Văn An", score: 140 },
  ];

  const correctCount = MOCK_STUDENTS.filter((s) => s.correct).length;
  const responseCount = phase === "question"
    ? Math.min(MOCK_STUDENTS.length, Math.max(1, MOCK_STUDENTS.length - Math.ceil(timeLeft / 8)))
    : MOCK_STUDENTS.length;
  const responseRate = Math.round((responseCount / MOCK_STUDENTS.length) * 100);

  const copyJoinCode = async () => {
    try {
      await navigator.clipboard.writeText(JOIN_CODE);
      toast.success("Đã sao chép mã tham gia.");
    } catch {
      toast.info(`Mã tham gia: ${JOIN_CODE}`);
    }
  };

  return (
    <AppLayout>
      <style>{`
        @keyframes pulse-scale { 0%,100%{transform:scale(1)} 50%{transform:scale(1.04)} }
        @keyframes slide-in { from{transform:translateY(20px);opacity:0} to{transform:translateY(0);opacity:1} }
        @keyframes pop-in { from{transform:scale(0.8);opacity:0} to{transform:scale(1);opacity:1} }
        .option-btn:hover:not(:disabled) { transform: scale(1.02) !important; filter: brightness(1.1); }
        .quiz-correct { animation: pop-in 0.4s ease; }
        .quiz-wrong { animation: pop-in 0.4s ease; }
      `}</style>

      <div
        style={{
          minHeight: "calc(100vh - 64px)",
          background: "linear-gradient(135deg, #0f172a 0%, #1e1b4b 50%, #0f172a 100%)",
          padding: fullscreen ? 0 : "24px",
          boxSizing: "border-box",
        }}
      >
        {/* ── Role / control bar ─────────────────── */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            flexWrap: "wrap",
            gap: 12,
            marginBottom: 20,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
            <div
              style={{
                background: "#1e293b",
                border: "1px solid #334155",
                borderRadius: 10,
                padding: "4px",
                display: "flex",
                gap: 4,
              }}
            >
              {(["teacher", "student"] as const).map((r) => (
                <button
                  key={r}
                  onClick={() => setRole(r)}
                  style={{
                    border: "none",
                    borderRadius: 8,
                    padding: "6px 16px",
                    fontSize: 12,
                    fontWeight: 600,
                    cursor: "pointer",
                    transition: "all 0.2s",
                    background:
                      role === r
                        ? "linear-gradient(135deg, #7c3aed, #4f46e5)"
                        : "transparent",
                    color: role === r ? "#fff" : "#64748b",
                    fontFamily: "inherit",
                  }}
                >
                  {r === "teacher" ? "👩🏫 Giáo viên" : "👨🎓 Học sinh"}
                </button>
              ))}
            </div>
            <div
              style={{
                color: "#64748b",
                fontSize: 13,
                background: "#1e293b",
                border: "1px solid #334155",
                borderRadius: 8,
                padding: "6px 14px",
              }}
            >
              Câu {currentQ + 1} / {QUIZ_QUESTIONS.length}
            </div>
            <button
              onClick={copyJoinCode}
              style={{
                color: "#5eead4",
                fontSize: 13,
                background: "rgba(20,184,166,0.1)",
                border: "1px solid rgba(20,184,166,0.25)",
                borderRadius: 8,
                padding: "6px 14px",
                cursor: "pointer",
                fontWeight: 700,
                fontFamily: "inherit",
              }}
            >
              Mã lớp: {JOIN_CODE}
            </button>
            <div
              style={{
                color: "#94a3b8",
                fontSize: 13,
                background: "#1e293b",
                border: "1px solid #334155",
                borderRadius: 8,
                padding: "6px 14px",
              }}
            >
              Đã trả lời {responseCount}/{MOCK_STUDENTS.length} · {responseRate}%
            </div>
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            {phase === "question" && (
              <button
                onClick={() => setTimerActive(v => !v)}
                style={{
                  background: timerActive ? "rgba(251,191,36,0.12)" : "rgba(52,211,153,0.12)",
                  border: `1px solid ${timerActive ? "rgba(251,191,36,0.35)" : "rgba(52,211,153,0.35)"}`,
                  borderRadius: 8,
                  padding: "6px 14px",
                  color: timerActive ? "#fbbf24" : "#34d399",
                  fontSize: 12,
                  cursor: "pointer",
                  fontFamily: "inherit",
                  fontWeight: 700,
                }}
              >
                {timerActive ? "⏸ Tạm dừng" : "▶ Tiếp tục"}
              </button>
            )}
            <button
              onClick={() => setFullscreen(!fullscreen)}
              style={{
                background: "#1e293b",
                border: "1px solid #334155",
                borderRadius: 8,
                padding: "6px 14px",
                color: "#94a3b8",
                fontSize: 12,
                cursor: "pointer",
                fontFamily: "inherit",
              }}
            >
              {fullscreen ? "⊡ Thu nhỏ" : "⊞ Toàn màn hình"}
            </button>
          </div>
        </div>

        {/* ── FINAL SCREEN ───────────────────────── */}
        {phase === "final" && (
          <div
            style={{
              maxWidth: 640,
              margin: "0 auto",
              textAlign: "center",
              animation: "slide-in 0.5s ease",
            }}
          >
            <div style={{ fontSize: 64, marginBottom: 12 }}>🏆</div>
            <h1
              style={{
                color: "#f1f5f9",
                fontSize: 28,
                fontWeight: 800,
                margin: "0 0 8px",
              }}
            >
              Kết quả cuối cùng!
            </h1>
            <p style={{ color: "#64748b", marginBottom: 24 }}>
              Bảng xếp hạng lớp học
            </p>
            {leaderboard.map((s, i) => (
              <div
                key={s.name}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 12,
                  padding: "14px 20px",
                  background:
                    i === 0
                      ? "linear-gradient(135deg, rgba(251,191,36,0.15), rgba(251,191,36,0.05))"
                      : "#1e293b",
                  border: `1px solid ${i === 0 ? "#fbbf24" : "#334155"}`,
                  borderRadius: 12,
                  marginBottom: 8,
                  animation: `slide-in 0.${3 + i}s ease`,
                }}
              >
                <span
                  style={{
                    fontSize: 20,
                    fontWeight: 800,
                    color:
                      i === 0
                        ? "#fbbf24"
                        : i === 1
                        ? "#d1d5db"
                        : i === 2
                        ? "#b45309"
                        : "#64748b",
                    width: 32,
                    textAlign: "center",
                  }}
                >
                  {i === 0 ? "🥇" : i === 1 ? "🥈" : i === 2 ? "🥉" : `#${i + 1}`}
                </span>
                <span
                  style={{
                    flex: 1,
                    color: "#f1f5f9",
                    fontWeight: 600,
                    fontSize: 15,
                    textAlign: "left",
                  }}
                >
                  {s.name}
                </span>
                <span
                  style={{
                    color: "#5eead4",
                    fontWeight: 800,
                    fontSize: 18,
                  }}
                >
                  {s.score.toLocaleString()}
                </span>
                <span style={{ color: "#475569", fontSize: 11 }}>điểm</span>
              </div>
            ))}
            <button
              onClick={() => {
                setCurrentQ(0);
                setTimeLeft(QUIZ_QUESTIONS[0].timeLimit);
                setPhase("question");
                setSelectedAnswer(null);
                setTimerActive(true);
              }}
              style={{
                marginTop: 24,
                padding: "12px 32px",
                background: "linear-gradient(135deg, #7c3aed, #4f46e5)",
                border: "none",
                borderRadius: 12,
                color: "#fff",
                fontSize: 15,
                fontWeight: 600,
                cursor: "pointer",
                fontFamily: "inherit",
              }}
            >
              🔄 Chơi lại
            </button>
          </div>
        )}

        {/* ── QUESTION & RESULTS PHASE ───────────── */}
        {phase !== "final" && (
          <div style={{ maxWidth: 900, margin: "0 auto" }}>
            {/* Question card */}
            <div
              style={{
                background: "rgba(30,41,59,0.8)",
                border: "1px solid #334155",
                borderRadius: 20,
                padding: "32px",
                backdropFilter: "blur(12px)",
                marginBottom: 20,
                animation: "slide-in 0.4s ease",
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  marginBottom: 16,
                }}
              >
                <span
                  style={{
                    background: "linear-gradient(135deg, #7c3aed, #4f46e5)",
                    color: "#fff",
                    fontSize: 12,
                    fontWeight: 700,
                    padding: "4px 12px",
                    borderRadius: 20,
                  }}
                >
                  Câu {currentQ + 1}
                </span>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                    color:
                      timeLeft > 10
                        ? "#34d399"
                        : timeLeft > 5
                        ? "#fbbf24"
                        : "#fb7185",
                    fontWeight: 800,
                    fontSize: 22,
                    fontVariantNumeric: "tabular-nums",
                  }}
                >
                  ⏱ {timeLeft}s
                </div>
              </div>
              <TimerBar timeLeft={timeLeft} total={currentQuestion.timeLimit} />
              <h2
                style={{
                  color: "#f1f5f9",
                  fontSize: 20,
                  fontWeight: 700,
                  lineHeight: 1.5,
                  margin: "16px 0 0",
                  textAlign: "center",
                }}
              >
                {currentQuestion.text}
              </h2>
            </div>

            {/* ── TEACHER view: options + results ─── */}
            {role === "teacher" && (
              <div>
                {/* Options grid */}
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr",
                    gap: 12,
                    marginBottom: 20,
                  }}
                >
                  {currentQuestion.options.map((opt, i) => {
                    const col = OPTION_COLORS[i];
                    const letter = String.fromCharCode(65 + i);
                    const isCorrect = letter === currentQuestion.correct;
                    return (
                      <div
                        key={opt}
                        style={{
                          background:
                            phase === "results" && isCorrect
                              ? "linear-gradient(135deg, #059669, #34d399)"
                              : col.bg,
                          borderRadius: 14,
                          padding: "18px 20px",
                          display: "flex",
                          alignItems: "center",
                          gap: 12,
                          boxShadow:
                            phase === "results" && isCorrect
                              ? "0 4px 20px rgba(52,211,153,0.4)"
                              : `0 4px 16px ${col.shadow}`,
                          position: "relative",
                          overflow: "hidden",
                          opacity: phase === "results" && !isCorrect ? 0.5 : 1,
                          transition: "all 0.3s ease",
                        }}
                      >
                        <span
                          style={{
                            width: 36,
                            height: 36,
                            borderRadius: "50%",
                            background: "rgba(255,255,255,0.2)",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            fontWeight: 800,
                            fontSize: 16,
                            color: "#fff",
                            flexShrink: 0,
                          }}
                        >
                          {letter}
                        </span>
                        <span
                          style={{
                            color: "#fff",
                            fontWeight: 600,
                            fontSize: 14,
                          }}
                        >
                          {opt}
                        </span>
                        {phase === "results" && isCorrect && (
                          <span
                            style={{
                              position: "absolute",
                              right: 16,
                              fontSize: 20,
                            }}
                          >
                            ✓
                          </span>
                        )}
                      </div>
                    );
                  })}
                </div>

                {/* Results panel */}
                {phase === "results" && (
                  <div
                    style={{
                      background: "rgba(30,41,59,0.9)",
                      border: "1px solid #334155",
                      borderRadius: 16,
                      padding: "20px 24px",
                      marginBottom: 16,
                      animation: "slide-in 0.4s ease",
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        marginBottom: 8,
                      }}
                    >
                      <h3
                        style={{
                          color: "#f1f5f9",
                          fontSize: 15,
                          fontWeight: 700,
                          margin: 0,
                        }}
                      >
                        📊 Kết quả câu {currentQ + 1}
                      </h3>
                      <span style={{ color: "#34d399", fontWeight: 700 }}>
                        {correctCount}/{MOCK_STUDENTS.length} đúng (
                        {Math.round(
                          (correctCount / MOCK_STUDENTS.length) * 100
                        )}
                        %)
                      </span>
                    </div>
                    <ResultsChart
                      correct={currentQuestion.correct}
                      total={MOCK_STUDENTS.length}
                      question={currentQuestion}
                    />

                    {/* Student list */}
                    <div
                      style={{
                        display: "flex",
                        flexWrap: "wrap",
                        gap: 8,
                        marginTop: 16,
                      }}
                    >
                      {MOCK_STUDENTS.map((s) => (
                        <div
                          key={s.name}
                          style={{
                            padding: "4px 10px",
                            borderRadius: 20,
                            fontSize: 11,
                            fontWeight: 600,
                            background: s.correct
                              ? "rgba(52,211,153,0.15)"
                              : "rgba(251,113,133,0.15)",
                            border: `1px solid ${
                              s.correct ? "#34d399" : "#fb7185"
                            }`,
                            color: s.correct ? "#34d399" : "#fb7185",
                          }}
                        >
                          {s.correct ? "✓" : "✗"} {s.name}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Buttons */}
                <div style={{ display: "flex", gap: 12, justifyContent: "center" }}>
                  {phase === "question" && (
                    <button
                      onClick={viewResults}
                      style={{
                        padding: "12px 28px",
                        background: "linear-gradient(135deg, #ea580c, #dc2626)",
                        border: "none",
                        borderRadius: 12,
                        color: "#fff",
                        fontWeight: 700,
                        fontSize: 14,
                        cursor: "pointer",
                        fontFamily: "inherit",
                        boxShadow: "0 4px 16px rgba(234,88,12,0.4)",
                      }}
                    >
                      📊 Xem kết quả
                    </button>
                  )}
                  {phase === "results" && (
                    <button
                      onClick={nextQuestion}
                      style={{
                        padding: "12px 28px",
                        background:
                          "linear-gradient(135deg, #7c3aed, #4f46e5)",
                        border: "none",
                        borderRadius: 12,
                        color: "#fff",
                        fontWeight: 700,
                        fontSize: 14,
                        cursor: "pointer",
                        fontFamily: "inherit",
                        boxShadow: "0 4px 16px rgba(124,58,237,0.4)",
                      }}
                    >
                      {currentQ + 1 >= QUIZ_QUESTIONS.length
                        ? "🏆 Xem bảng xếp hạng"
                        : "➡️ Câu tiếp theo"}
                    </button>
                  )}
                </div>
              </div>
            )}

            {/* ── STUDENT view ────────────────────── */}
            {role === "student" && (
              <div>
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr",
                    gap: 16,
                    marginBottom: 20,
                  }}
                >
                  {currentQuestion.options.map((opt, i) => {
                    const col = OPTION_COLORS[i];
                    const letter = String.fromCharCode(65 + i);
                    const isSelected = selectedAnswer === letter;
                    const isCorrect = letter === currentQuestion.correct;
                    const revealed = phase === "results";

                    let bgStyle = col.bg;
                    let borderColor = "transparent";
                    let opacity = 1;

                    if (revealed) {
                      if (isCorrect) {
                        bgStyle = "linear-gradient(135deg, #059669, #34d399)";
                        borderColor = "#34d399";
                      } else if (isSelected && !isCorrect) {
                        opacity = 0.5;
                      } else {
                        opacity = 0.4;
                      }
                    } else if (isSelected) {
                      borderColor = "#fff";
                    }

                    return (
                      <button
                        key={opt}
                        className="option-btn"
                        disabled={!!selectedAnswer}
                        onClick={() => handleStudentAnswer(letter)}
                        style={{
                          background: bgStyle,
                          border: `2px solid ${borderColor}`,
                          borderRadius: 16,
                          padding: "24px 20px",
                          cursor: selectedAnswer ? "default" : "pointer",
                          display: "flex",
                          alignItems: "center",
                          gap: 14,
                          boxShadow: `0 6px 24px ${col.shadow}`,
                          transition: "all 0.25s ease",
                          opacity,
                          textAlign: "left",
                          fontFamily: "inherit",
                          minHeight: 80,
                        }}
                      >
                        <span
                          style={{
                            width: 42,
                            height: 42,
                            borderRadius: "50%",
                            background: "rgba(255,255,255,0.25)",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            fontWeight: 900,
                            fontSize: 18,
                            color: "#fff",
                            flexShrink: 0,
                          }}
                        >
                          {letter}
                        </span>
                        <span
                          style={{
                            color: "#fff",
                            fontWeight: 600,
                            fontSize: 15,
                            lineHeight: 1.4,
                          }}
                        >
                          {opt}
                        </span>
                        {revealed && isCorrect && (
                          <span style={{ fontSize: 22, marginLeft: "auto" }}>✓</span>
                        )}
                        {revealed && isSelected && !isCorrect && (
                          <span style={{ fontSize: 22, marginLeft: "auto" }}>✗</span>
                        )}
                      </button>
                    );
                  })}
                </div>

                {/* Status after answering */}
                {selectedAnswer && phase === "question" && (
                  <div
                    style={{
                      textAlign: "center",
                      padding: "20px",
                      background: "rgba(30,41,59,0.8)",
                      border: "1px solid #334155",
                      borderRadius: 16,
                      animation: "pop-in 0.3s ease",
                    }}
                  >
                    <div style={{ fontSize: 32, marginBottom: 8 }}>⏳</div>
                    <p
                      style={{
                        color: "#94a3b8",
                        fontSize: 15,
                        fontWeight: 600,
                        margin: 0,
                      }}
                    >
                      ✓ Đã chọn{" "}
                      <strong style={{ color: "#5eead4" }}>
                        {selectedAnswer}
                      </strong>
                      {" – "}Đang chờ giáo viên công bố kết quả...
                    </p>
                  </div>
                )}

                {/* Result after reveal */}
                {phase === "results" && selectedAnswer && (
                  <div
                    style={{
                      textAlign: "center",
                      padding: "24px",
                      background:
                        selectedAnswer === currentQuestion.correct
                          ? "rgba(52,211,153,0.1)"
                          : "rgba(251,113,133,0.1)",
                      border: `1px solid ${
                        selectedAnswer === currentQuestion.correct
                          ? "#34d399"
                          : "#fb7185"
                      }`,
                      borderRadius: 16,
                      animation: "pop-in 0.4s ease",
                    }}
                  >
                    {selectedAnswer === currentQuestion.correct ? (
                      <>
                        <div style={{ fontSize: 48, marginBottom: 8 }}>🎉</div>
                        <p
                          style={{
                            color: "#34d399",
                            fontSize: 20,
                            fontWeight: 800,
                            margin: "0 0 4px",
                          }}
                        >
                          Chính xác!
                        </p>
                        <p style={{ color: "#64748b", margin: 0 }}>
                          +{Math.max(100, timeLeft * 10)} điểm
                        </p>
                      </>
                    ) : (
                      <>
                        <div style={{ fontSize: 48, marginBottom: 8 }}>😅</div>
                        <p
                          style={{
                            color: "#fb7185",
                            fontSize: 20,
                            fontWeight: 800,
                            margin: "0 0 4px",
                          }}
                        >
                          Chưa đúng!
                        </p>
                        <p style={{ color: "#64748b", margin: 0 }}>
                          Đáp án đúng:{" "}
                          <strong style={{ color: "#34d399" }}>
                            {currentQuestion.correct}
                          </strong>
                        </p>
                      </>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </AppLayout>
  );
}
