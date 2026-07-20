"use client";

import Image from "next/image";
import Link from "next/link";
import {
  ArrowLeft,
  ArrowRight,
  Bookmark,
  Check,
  CircleHelp,
  Flame,
  Search,
  Share2,
  Skull,
  ThumbsUp,
  UserRound,
  X,
} from "lucide-react";
import {
  type Difficulty,
  type Question,
  type Verdict,
  questions,
  topics,
} from "@/data/questions";
import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

type Tab = "scroll" | "saved" | "progress" | "profile";
type Sheet = "question" | "topics" | "levels" | "rankRules" | null;
type Decisions = Record<string, Verdict>;

const difficultyLabels: Difficulty[] = ["easy", "medium", "hard"];
const DAILY_GOAL = 5;
const rankTiers = [
  { name: "Not ranked yet", threshold: 0 },
  { name: "Junior Scroller", threshold: 5 },
  { name: "Senior Scroller", threshold: 15 },
  { name: "Staff Scroller", threshold: 35 },
  { name: "Principal Scroller", threshold: 65 },
  { name: "CEO of Scrolling", threshold: 120 },
] as const;
const rankSubjects = Array.from(new Set(questions.map((question) => question.topic)));

type StoredProgress = {
  attemptedQuestionIds: string[];
  perfectQuestionIds: string[];
  correctJudgments: number;
  perfectByTopic: Record<string, number>;
  dailyPerfect: Record<string, number>;
};

function localDateKey(date = new Date()) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function calculateStreak(dailyPerfect: Record<string, number>) {
  const cursor = new Date();
  if ((dailyPerfect[localDateKey(cursor)] ?? 0) < DAILY_GOAL) {
    cursor.setDate(cursor.getDate() - 1);
  }

  let streak = 0;
  while ((dailyPerfect[localDateKey(cursor)] ?? 0) >= DAILY_GOAL) {
    streak += 1;
    cursor.setDate(cursor.getDate() - 1);
  }
  return streak;
}

function readProgress(): StoredProgress {
  const empty: StoredProgress = {
    attemptedQuestionIds: [],
    perfectQuestionIds: [],
    correctJudgments: 0,
    perfectByTopic: {},
    dailyPerfect: {},
  };
  if (typeof window === "undefined") return empty;
  try {
    const parsed = JSON.parse(window.localStorage.getItem("studyscroll-progress") ?? "null");
    return parsed ? { ...empty, ...parsed } : empty;
  } catch {
    return empty;
  }
}

function readSaved(): string[] {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(window.localStorage.getItem("studyscroll-saved") ?? "[]");
  } catch {
    return [];
  }
}

export function StudyApp() {
  const [tab, setTab] = useState<Tab>("scroll");
  const [sheet, setSheet] = useState<Sheet>(null);
  const [activeQuestion, setActiveQuestion] = useState<Question | null>(null);
  const [selectedTopic, setSelectedTopic] = useState<(typeof topics)[number]>("All");
  const [levels, setLevels] = useState<Set<Difficulty>>(
    () => new Set<Difficulty>(difficultyLabels),
  );
  const [saved, setSaved] = useState<Set<string>>(() => new Set());
  const [decisions, setDecisions] = useState<Decisions>({});
  const [revealed, setRevealed] = useState(false);
  const [completed, setCompleted] = useState<Set<string>>(() => new Set());
  const [perfectQuestions, setPerfectQuestions] = useState<Set<string>>(() => new Set());
  const [correctJudgments, setCorrectJudgments] = useState(0);
  const [perfectByTopic, setPerfectByTopic] = useState<Record<string, number>>({});
  const [dailyPerfect, setDailyPerfect] = useState<Record<string, number>>({});
  const [progressReady, setProgressReady] = useState(false);
  const [visibleCount, setVisibleCount] = useState(6);
  const [toast, setToast] = useState("");
  const sentinelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setSaved(new Set(readSaved()));
    const progress = readProgress();
    setCompleted(new Set(progress.attemptedQuestionIds));
    setPerfectQuestions(new Set(progress.perfectQuestionIds));
    setCorrectJudgments(progress.correctJudgments);
    setPerfectByTopic(progress.perfectByTopic);
    setDailyPerfect(progress.dailyPerfect);
    setProgressReady(true);
  }, []);

  useEffect(() => {
    window.localStorage.setItem(
      "studyscroll-saved",
      JSON.stringify(Array.from(saved)),
    );
  }, [saved]);

  useEffect(() => {
    if (!progressReady) return;
    const progress: StoredProgress = {
      attemptedQuestionIds: Array.from(completed),
      perfectQuestionIds: Array.from(perfectQuestions),
      correctJudgments,
      perfectByTopic,
      dailyPerfect,
    };
    window.localStorage.setItem("studyscroll-progress", JSON.stringify(progress));
  }, [completed, correctJudgments, dailyPerfect, perfectByTopic, perfectQuestions, progressReady]);

  useEffect(() => {
    if (!toast) return;
    const timer = window.setTimeout(() => setToast(""), 2200);
    return () => window.clearTimeout(timer);
  }, [toast]);

  const filteredQuestions = useMemo(() => {
    return questions.filter((question) => {
      const topicMatches =
        selectedTopic === "All" || question.topic === selectedTopic;
      return topicMatches && levels.has(question.difficulty);
    });
  }, [levels, selectedTopic]);

  const feedItems = useMemo(() => {
    if (filteredQuestions.length === 0) return [];
    return Array.from({ length: visibleCount }, (_, index) => ({
      question: filteredQuestions[index % filteredQuestions.length],
      instance: index,
    }));
  }, [filteredQuestions, visibleCount]);

  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel || tab !== "scroll" || filteredQuestions.length === 0) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisibleCount((count) => Math.min(count + 4, 40));
        }
      },
      { rootMargin: "240px" },
    );
    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [filteredQuestions.length, tab]);

  const openQuestion = useCallback((question: Question) => {
    setActiveQuestion(question);
    setDecisions({});
    setRevealed(false);
    setSheet("question");
  }, []);

  const closeSheet = useCallback(() => {
    setSheet(null);
    setActiveQuestion(null);
    setDecisions({});
    setRevealed(false);
  }, []);

  function toggleSaved(id: string) {
    setSaved((current) => {
      const next = new Set(current);
      if (next.has(id)) {
        next.delete(id);
        setToast("Removed from saved");
      } else {
        next.add(id);
        setToast("Saved for later");
      }
      return next;
    });
  }

  async function shareQuestion(question: Question) {
    const shareData = {
      title: "StudyScroll challenge",
      text: question.prompt,
      url: window.location.href,
    };
    try {
      if (navigator.share) {
        await navigator.share(shareData);
      } else {
        await navigator.clipboard.writeText(
          question.prompt + " — " + window.location.href,
        );
        setToast("Challenge copied");
      }
    } catch {
      // A dismissed native share sheet needs no error state.
    }
  }

  function commitJudgments() {
    if (!activeQuestion || revealed) return;
    const count = activeQuestion.answers.reduce((score, answer) => {
      return score + (decisions[answer.id] === answer.verdict ? 1 : 0);
    }, 0);
    if (!completed.has(activeQuestion.id)) {
      setCorrectJudgments((total) => total + count);
      setCompleted((current) => new Set(current).add(activeQuestion.id));
    }
    if (count === 3 && !perfectQuestions.has(activeQuestion.id)) {
      const today = localDateKey();
      setPerfectQuestions((current) => new Set(current).add(activeQuestion.id));
      setPerfectByTopic((current) => ({
        ...current,
        [activeQuestion.topic]: (current[activeQuestion.topic] ?? 0) + 1,
      }));
      setDailyPerfect((current) => ({
        ...current,
        [today]: (current[today] ?? 0) + 1,
      }));
    }
    setRevealed(true);
  }

  function nextQuestion() {
    if (!activeQuestion || filteredQuestions.length === 0) {
      closeSheet();
      return;
    }
    const index = filteredQuestions.findIndex(
      (question) => question.id === activeQuestion.id,
    );
    const next = filteredQuestions[(index + 1) % filteredQuestions.length];
    setActiveQuestion(next);
    setDecisions({});
    setRevealed(false);
  }

  const savedQuestions = questions.filter((question) => saved.has(question.id));
  const judgedCount = activeQuestion ? Object.keys(decisions).length : 0;
  const allJudged =
    activeQuestion !== null && judgedCount === activeQuestion.answers.length;
  const currentScore =
    activeQuestion?.answers.reduce(
      (score, answer) =>
        score + (decisions[answer.id] === answer.verdict ? 1 : 0),
      0,
    ) ?? 0;

  return (
    <main id="main-content" className="app-stage">
      <div className="app-shell">
        <header className="app-header">
          <Link href="/" className="wordmark" aria-label="StudyScroll home">
            <span>Study</span><span>Scroll</span>
          </Link>
        </header>

        <div className="app-view" aria-live="polite">
          {tab === "scroll" && (
            <FeedView
              feedItems={feedItems}
              filteredCount={filteredQuestions.length}
              levels={levels}
              selectedTopic={selectedTopic}
              saved={saved}
              sentinelRef={sentinelRef}
              onOpen={openQuestion}
              onOpenLevels={() => setSheet("levels")}
              onOpenTopics={() => setSheet("topics")}
              onSave={toggleSaved}
              onShare={shareQuestion}
            />
          )}
          {tab === "saved" && (
            <SavedView
              questions={savedQuestions}
              saved={saved}
              onOpen={openQuestion}
              onSave={toggleSaved}
              onShare={shareQuestion}
              onExplore={() => setTab("scroll")}
            />
          )}
          {tab === "progress" && (
            <ProgressView
              dailyPerfect={dailyPerfect}
              perfectByTopic={perfectByTopic}
              onOpenRules={() => setSheet("rankRules")}
            />
          )}
          {tab === "profile" && <ProfileView />}
        </div>

        <BottomNav tab={tab} onChange={setTab} />

        {sheet === "question" && activeQuestion && (
          <QuestionSheet
            allJudged={allJudged}
            decisions={decisions}
            judgedCount={judgedCount}
            onClose={closeSheet}
            onCommit={commitJudgments}
            onDecision={(answerId, verdict) =>
              setDecisions((current) => ({
                ...current,
                [answerId]: verdict,
              }))
            }
            onNext={nextQuestion}
            question={activeQuestion}
            revealed={revealed}
            score={currentScore}
          />
        )}

        {sheet === "topics" && (
          <TopicSheet
            selected={selectedTopic}
            onClose={() => setSheet(null)}
            onSelect={(topic) => {
              setSelectedTopic(topic);
              setVisibleCount(6);
            }}
          />
        )}

        {sheet === "levels" && (
          <LevelSheet
            selected={levels}
            onClose={() => setSheet(null)}
            onToggle={(level) => {
              setLevels((current) => {
                const next = new Set(current);
                if (next.has(level)) {
                  if (next.size > 1) next.delete(level);
                } else {
                  next.add(level);
                }
                return next;
              });
              setVisibleCount(6);
            }}
          />
        )}

        {sheet === "rankRules" && (
          <RankRulesSheet onClose={() => setSheet(null)} />
        )}

        {toast && <div className="toast" role="status">{toast}</div>}
      </div>
    </main>
  );
}

type FeedItem = { question: Question; instance: number };

function FeedView({
  feedItems,
  filteredCount,
  levels,
  selectedTopic,
  saved,
  sentinelRef,
  onOpen,
  onOpenLevels,
  onOpenTopics,
  onSave,
  onShare,
}: {
  feedItems: FeedItem[];
  filteredCount: number;
  levels: Set<Difficulty>;
  selectedTopic: string;
  saved: Set<string>;
  sentinelRef: React.RefObject<HTMLDivElement | null>;
  onOpen: (question: Question) => void;
  onOpenLevels: () => void;
  onOpenTopics: () => void;
  onSave: (id: string) => void;
  onShare: (question: Question) => void;
}) {
  return (
    <>
      <div className="filter-row">
        <button type="button" className="filter-button" onClick={onOpenTopics}>
          {selectedTopic === "All" ? "All topics" : selectedTopic}
        </button>
        <button type="button" className="filter-button" onClick={onOpenLevels}>
          difficulty <span className="filter-count">{levels.size}</span>
        </button>
      </div>
      <section className="feed" aria-label="Learning feed">
        {filteredCount === 0 ? (
          <div className="empty-state">
            <h1>No cards match</h1>
            <p>Turn on another difficulty or choose a different topic.</p>
            <button type="button" className="button button-primary" onClick={onOpenLevels}>
              Change difficulty
            </button>
          </div>
        ) : (
          feedItems.map(({ question, instance }) => (
            <QuestionCard
              key={question.id + "-" + instance}
              question={question}
              saved={saved.has(question.id)}
              onOpen={() => onOpen(question)}
              onSave={() => onSave(question.id)}
              onShare={() => onShare(question)}
            />
          ))
        )}
        <div ref={sentinelRef} className="feed-sentinel" aria-hidden="true" />
      </section>
    </>
  );
}

function QuestionCard({
  question,
  saved,
  onOpen,
  onSave,
  onShare,
}: {
  question: Question;
  saved: boolean;
  onOpen: () => void;
  onSave: () => void;
  onShare: () => void;
}) {
  return (
    <article className="question-card">
      <button type="button" className="card-open-area" onClick={onOpen}>
        <span className="persona-row">
          <span className="persona">
            <Image src="/avatar.png" alt="" width={24} height={24} />
            <span>
              <strong>{question.answers[0].handle}</strong>
              <small>{question.answers[0].role}</small>
            </span>
          </span>
          <DifficultyBadge level={question.difficulty} />
        </span>
        <span className="topic-label">{question.topic}</span>
        <span className="question-title">{question.prompt}</span>
        <code>{question.clue}</code>
      </button>
      <footer className="card-footer">
        <button type="button" className="answer-link" onClick={onOpen}>
          ANSWER <ArrowRight aria-hidden="true" size={17} strokeWidth={1.8} />
        </button>
        <div>
          <button type="button" className="icon-button" onClick={onShare} aria-label="Share challenge">
            <Share2 aria-hidden="true" size={21} />
          </button>
          <button
            type="button"
            className={"icon-button" + (saved ? " is-saved" : "")}
            onClick={onSave}
            aria-label={saved ? "Remove from saved" : "Save challenge"}
            aria-pressed={saved}
          >
            <Bookmark aria-hidden="true" size={21} fill={saved ? "currentColor" : "none"} />
          </button>
        </div>
      </footer>
    </article>
  );
}

function DifficultyBadge({ level }: { level: Difficulty }) {
  return (
    <span className={"difficulty-badge difficulty-" + level}>
      <i aria-hidden="true" />{level}
    </span>
  );
}

function SavedView({
  questions: savedQuestions,
  saved,
  onOpen,
  onSave,
  onShare,
  onExplore,
}: {
  questions: Question[];
  saved: Set<string>;
  onOpen: (question: Question) => void;
  onSave: (id: string) => void;
  onShare: (question: Question) => void;
  onExplore: () => void;
}) {
  return (
    <section className="tab-page" aria-labelledby="saved-title">
      <div className="tab-heading">
        <p>YOUR LIBRARY</p>
        <h1 id="saved-title">Saved cards</h1>
      </div>
      {savedQuestions.length === 0 ? (
        <div className="empty-state">
          <Bookmark aria-hidden="true" size={34} />
          <h2>Nothing saved yet</h2>
          <p>Save a challenge when you want to judge it again later.</p>
          <button type="button" className="button button-primary" onClick={onExplore}>
            Explore the feed
          </button>
        </div>
      ) : (
        <div className="feed saved-feed">
          {savedQuestions.map((question) => (
            <QuestionCard
              key={question.id}
              question={question}
              saved={saved.has(question.id)}
              onOpen={() => onOpen(question)}
              onSave={() => onSave(question.id)}
              onShare={() => onShare(question)}
            />
          ))}
        </div>
      )}
    </section>
  );
}

function getRankProgress(correct: number) {
  let currentIndex = 0;
  for (let index = rankTiers.length - 1; index >= 0; index -= 1) {
    if (correct >= rankTiers[index].threshold) {
      currentIndex = index;
      break;
    }
  }

  const current = rankTiers[currentIndex];
  const next = rankTiers[currentIndex + 1];
  if (!next) {
    return {
      current,
      currentIndex,
      percent: 1,
      message: "Maximum rank reached",
    };
  }

  const stageSize = next.threshold - current.threshold;
  const stageProgress = correct - current.threshold;
  const remaining = next.threshold - correct;
  return {
    current,
    currentIndex,
    percent: Math.min(stageProgress / stageSize, 1),
    message:
      currentIndex === 0
        ? `${remaining} more to unlock Junior Scroller`
        : `${remaining} more to reach ${next.name}`,
  };
}

function ProgressView({
  dailyPerfect,
  perfectByTopic,
  onOpenRules,
}: {
  dailyPerfect: Record<string, number>;
  perfectByTopic: Record<string, number>;
  onOpenRules: () => void;
}) {
  const todayPerfect = dailyPerfect[localDateKey()] ?? 0;
  const todayProgress = Math.min(todayPerfect, DAILY_GOAL);
  const streak = calculateStreak(dailyPerfect);
  return (
    <section className="tab-page progress-page" aria-labelledby="progress-title">
      <div className="streak-stage">
        <div className="streak-kicker">
          <Flame aria-hidden="true" size={22} />
          <span>Your momentum</span>
        </div>
        <h1 id="progress-title">
          <span>{streak}</span> {streak === 1 ? "day" : "days"} streak
        </h1>
        <div className="today-goal-heading">
          <span>Today</span>
          <strong>{todayProgress}/{DAILY_GOAL}</strong>
        </div>
        <div
          className="today-track"
          role="progressbar"
          aria-label="Today's perfect questions"
          aria-valuemin={0}
          aria-valuemax={DAILY_GOAL}
          aria-valuenow={todayProgress}
        >
          <span style={{ transform: `scaleX(${todayProgress / DAILY_GOAL})` }} />
        </div>
        <p>
          {todayProgress >= DAILY_GOAL
            ? "Daily goal complete. Your streak is protected."
            : `Complete ${DAILY_GOAL - todayProgress} more perfect ${DAILY_GOAL - todayProgress === 1 ? "question" : "questions"} today.`}
        </p>
      </div>

      <section className="ranks-section" aria-labelledby="ranks-title">
        <div className="ranks-heading">
          <div>
            <p>Subject mastery</p>
            <h2 id="ranks-title">Your ranks</h2>
          </div>
          <button type="button" onClick={onOpenRules}>
            <CircleHelp aria-hidden="true" size={17} />
            Rank rules
          </button>
        </div>

        <div className="rank-list">
          {rankSubjects.map((subject) => {
            const correct = perfectByTopic[subject] ?? 0;
            const rank = getRankProgress(correct);
            return (
              <article className="rank-row" data-tier={rank.currentIndex} key={subject}>
                <div className="rank-row-heading">
                  <div>
                    <h3>{subject}</h3>
                    <span className="rank-badge">{rank.current.name}</span>
                  </div>
                  <strong>{correct} correct</strong>
                </div>
                <div
                  className="rank-track"
                  role="progressbar"
                  aria-label={`${subject}: ${rank.message}`}
                  aria-valuemin={0}
                  aria-valuemax={100}
                  aria-valuenow={Math.round(rank.percent * 100)}
                >
                  <span style={{ transform: `scaleX(${rank.percent})` }} />
                </div>
                <p>{rank.message}</p>
              </article>
            );
          })}
        </div>
      </section>
    </section>
  );
}

function ProfileView() {
  return (
    <section className="tab-page" aria-labelledby="profile-title">
      <div className="tab-heading">
        <p>ACCOUNT</p>
        <h1 id="profile-title">Guest learner</h1>
      </div>
      <div className="profile-card">
        <span className="profile-avatar"><UserRound aria-hidden="true" size={34} /></span>
        <h2>Your practice stays on this device</h2>
        <p>You can explore every topic without registering. Account sync and personalized review come later.</p>
        <button type="button" className="button button-secondary" disabled>
          Account creation coming soon
        </button>
      </div>
      <Link href="/" className="back-link"><ArrowLeft aria-hidden="true" size={18} />Back to homepage</Link>
    </section>
  );
}

function NavIcon({ id }: { id: Tab }) {
  const shared = {
    className: "nav-icon",
    viewBox: "0 0 24 24",
    "aria-hidden": true,
  } as const;

  if (id === "scroll") {
    return (
      <svg {...shared}>
        <path className="nav-icon-shape" d="M3.5 10.2 12 3l8.5 7.2v10.3h-17Z" />
        <path className="nav-icon-cutout" d="M9.25 20.5v-7h5.5v7Z" />
      </svg>
    );
  }

  if (id === "saved") {
    return (
      <svg {...shared}>
        <path className="nav-icon-shape" d="M5.5 3.5h13v17l-6.5-3.8-6.5 3.8Z" />
      </svg>
    );
  }

  if (id === "progress") {
    return (
      <svg {...shared}>
        <path className="nav-icon-shape" d="M12 2c1 4-3 5-3 9 0 1.5.7 2.5 1.8 3.3-.2-2 1.2-3.4 2.4-4.4.2 2.1 2.5 3.4 2.5 6.1A5.3 5.3 0 0 1 5.5 16C5.5 11 9.5 9 12 2Z" />
        <path className="nav-icon-cutout" d="M12.3 12.1c1.4 1.2 2.2 2.3 2.2 3.6a2.3 2.3 0 0 1-4.6 0c0-1.1.6-1.9 1.4-2.7.5-.4.8-.7 1-1Z" />
      </svg>
    );
  }

  return (
    <svg {...shared}>
      <circle className="nav-icon-shape" cx="12" cy="7" r="3.25" />
      <path className="nav-icon-shape" d="M4.5 20.5v-1.7c0-3.1 3.1-5.3 7.5-5.3s7.5 2.2 7.5 5.3v1.7Z" />
    </svg>
  );
}

function BottomNav({ tab, onChange }: { tab: Tab; onChange: (tab: Tab) => void }) {
  const items: { id: Tab; label: string }[] = [
    { id: "scroll", label: "scroll" },
    { id: "saved", label: "saved" },
    { id: "progress", label: "progress" },
    { id: "profile", label: "profile" },
  ];
  return (
    <nav className="bottom-nav" aria-label="App navigation">
      {items.map(({ id, label }) => (
        <button
          key={id}
          type="button"
          className={tab === id ? "active" : ""}
          aria-current={tab === id ? "page" : undefined}
          onClick={() => onChange(id)}
        >
          <span><NavIcon id={id} /></span>
          {label}
        </button>
      ))}
    </nav>
  );
}
function BottomSheet({
  title,
  children,
  onClose,
  className = "",
}: {
  title: string;
  children: React.ReactNode;
  onClose: () => void;
  className?: string;
}) {
  const sheetRef = useRef<HTMLElement>(null);
  useEffect(() => {
    sheetRef.current?.focus();
    function handleKey(event: KeyboardEvent) {
      if (event.key === "Escape") onClose();
    }
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [onClose]);
  return (
    <div className="sheet-layer" role="presentation">
      <button type="button" className="sheet-backdrop" onClick={onClose} aria-label="Close sheet" />
      <section
        ref={sheetRef}
        tabIndex={-1}
        className={"bottom-sheet " + className}
        role="dialog"
        aria-modal="true"
        aria-label={title}
      >
        <div className="sheet-handle" aria-hidden="true" />
        <button type="button" className="sheet-close" onClick={onClose} aria-label={"Close " + title}>
          <X aria-hidden="true" size={20} />
        </button>
        {children}
      </section>
    </div>
  );
}

function QuestionSheet({
  question,
  decisions,
  judgedCount,
  allJudged,
  revealed,
  score,
  onDecision,
  onCommit,
  onNext,
  onClose,
}: {
  question: Question;
  decisions: Decisions;
  judgedCount: number;
  allJudged: boolean;
  revealed: boolean;
  score: number;
  onDecision: (answerId: string, verdict: Verdict) => void;
  onCommit: () => void;
  onNext: () => void;
  onClose: () => void;
}) {
  return (
    <BottomSheet title="Answer challenge" onClose={onClose} className="question-sheet">
      <div className="sheet-scroll">
        <div className="question-context">
          <div><span className="topic-chip">{question.topic}</span><DifficultyBadge level={question.difficulty} /></div>
          <h2>{question.prompt}</h2>
          <code>{question.clue}</code>
        </div>
        <div className="answers-list">
          {question.answers.map((answer) => {
            const choice = decisions[answer.id];
            const correct = choice === answer.verdict;
            const stateClass = revealed ? (correct ? " answer-correct" : " answer-wrong") : "";
            return (
              <article key={answer.id} className={"answer-card" + stateClass}>
                <div className="persona answer-persona">
                  <Image src="/avatar.png" alt="" width={24} height={24} />
                  <span><strong>{answer.handle}</strong><small>{answer.role}</small></span>
                </div>
                <p>{answer.text}</p>
                <div className="judgment-buttons" aria-label={"Judge answer from " + answer.handle}>
                  <button
                    type="button"
                    className={choice === "legit" ? "selected" : ""}
                    aria-pressed={choice === "legit"}
                    disabled={revealed}
                    onClick={() => onDecision(answer.id, "legit")}
                  >
                    <ThumbsUp aria-hidden="true" size={20} />legit
                  </button>
                  <button
                    type="button"
                    className={choice === "sus" ? "selected" : ""}
                    aria-pressed={choice === "sus"}
                    disabled={revealed}
                    onClick={() => onDecision(answer.id, "sus")}
                  >
                    <Skull aria-hidden="true" size={20} />sus
                  </button>
                </div>
                {revealed && (
                  <div className="answer-feedback">
                    <strong>{correct ? "Correct!" : "Careful."}</strong>
                    <p>{answer.feedback}</p>
                  </div>
                )}
              </article>
            );
          })}
        </div>
      </div>
      <footer className="sheet-actions">
        {!revealed ? (
          <>
            <p><strong>{judgedCount}/3</strong> judgments made</p>
            <button type="button" className="button button-primary" disabled={!allJudged} onClick={onCommit}>
              Check my judgments
            </button>
          </>
        ) : (
          <>
            <p><strong>{score}/3 judged well</strong><span>Review the explanations, then continue when you are ready.</span></p>
            <button type="button" className="button button-primary" onClick={onNext}>Next card</button>
            <button type="button" className="button button-secondary" onClick={onClose}>Back to feed</button>
          </>
        )}
      </footer>
    </BottomSheet>
  );
}

function TopicSheet({
  selected,
  onSelect,
  onClose,
}: {
  selected: (typeof topics)[number];
  onSelect: (topic: (typeof topics)[number]) => void;
  onClose: () => void;
}) {
  const [query, setQuery] = useState("");
  const filteredTopics = topics.filter((topic) =>
    topic.toLowerCase().includes(query.trim().toLowerCase()),
  );
  return (
    <BottomSheet title="Choose topics" onClose={onClose} className="filter-sheet">
      <div className="filter-sheet-heading">
        <h2>Topics</h2>
        <p>Choose one to start learning.</p>
      </div>
      <label className="search-field">
        <span className="sr-only">Search topics</span>
        <Search aria-hidden="true" size={18} />
        <input
          type="search"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Search topics"
          autoFocus
        />
      </label>
      <div className="topic-options" role="listbox" aria-label="Topics">
        {filteredTopics.map((topic) => {
          const count =
            topic === "All"
              ? questions.length
              : questions.filter((question) => question.topic === topic).length;
          return (
            <button
              key={topic}
              type="button"
              role="option"
              aria-selected={selected === topic}
              className={selected === topic ? "selected" : ""}
              onClick={() => onSelect(topic)}
            >
              <span>{topic}</span><span>{count}</span>
            </button>
          );
        })}
        {filteredTopics.length === 0 && <p className="no-results">No topics found.</p>}
      </div>
      <button type="button" className="sheet-done" onClick={onClose}>Done</button>
    </BottomSheet>
  );
}

function LevelSheet({
  selected,
  onToggle,
  onClose,
}: {
  selected: Set<Difficulty>;
  onToggle: (level: Difficulty) => void;
  onClose: () => void;
}) {
  return (
    <BottomSheet title="Filter by level" onClose={onClose} className="level-sheet">
      <div className="filter-sheet-heading">
        <h2>Level</h2>
        <p>Filter cards by difficulty.</p>
      </div>
      <div className="level-options">
        {difficultyLabels.map((level) => (
          <button
            key={level}
            type="button"
            className={selected.has(level) ? "selected" : ""}
            aria-pressed={selected.has(level)}
            onClick={() => onToggle(level)}
          >
            <span>{level[0].toUpperCase() + level.slice(1)}</span>
            <span>{selected.has(level) ? "ON" : "OFF"}</span>
          </button>
        ))}
      </div>
      <button type="button" className="sheet-done" onClick={onClose}>Done</button>
    </BottomSheet>
  );
}

function RankRulesSheet({ onClose }: { onClose: () => void }) {
  return (
    <BottomSheet title="Rank rules" onClose={onClose} className="rank-rules-sheet">
      <div className="sheet-scroll rank-rules-scroll">
        <div className="filter-sheet-heading">
          <h2>Rank rules</h2>
        </div>

        <div className="perfect-rule">
          <Check aria-hidden="true" size={20} />
          <p>
            <strong>One question counts</strong>
            only when all three of your Legit/Sus judgments are correct.
          </p>
        </div>

        <ol className="rank-ladder">
          {rankTiers.slice(1).map((tier) => (
            <li key={tier.name}>
              <span>{tier.threshold}</span>
              <div>
                <strong>{tier.name}</strong>
                <p>{tier.threshold} total perfect questions in one subject</p>
              </div>
            </li>
          ))}
        </ol>

        <div className="rules-notes">
          <p><strong>Ranks are subject-specific.</strong> Five perfect JavaScript questions unlock Junior Scroller in JavaScript, not everywhere.</p>
          <p>Mistakes never remove rank progress. Retry, learn why, and earn the point when all three judgments are right.</p>
        </div>
      </div>
      <button type="button" className="sheet-done" onClick={onClose}>Got it</button>
    </BottomSheet>
  );
}
