"use client";

import Image from "next/image";
import Link from "next/link";
import {
  ArrowLeft,
  ArrowRight,
  Bookmark,
  ChevronRight,
  CircleHelp,
  ExternalLink,
  Flame,
  KeyRound,
  LockKeyhole,
  LogOut,
  Mail,
  Search,
  Share2,
  Skull,
  Sparkles,
  ThumbsUp,
  UserRound,
  X,
} from "lucide-react";
import {
  MdBookmark,
  MdHome,
  MdOutlineBookmark,
  MdOutlineHome,
  MdOutlinePerson,
  MdOutlineWhatshot,
  MdPerson,
  MdWhatshot,
} from "react-icons/md";
import {
  type Difficulty,
  type PublicQuestion,
  type QuestionGrade,
  type Topic,
  type Verdict,
  topics,
} from "@/data/question-types";
import type { AccountViewer, LearningState } from "@/data/account-types";
import { createBrowserSupabaseClient } from "@/lib/supabase/client";
import {
  Fragment,
  useCallback,
  useEffect,
  useLayoutEffect,
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

type QuestionApiResponse = {
  questions: PublicQuestion[];
  meta: {
    total: number;
    next_cursor: string | null;
    topic_counts: Partial<Record<Topic, number>>;
  };
};

function isQuestionGrade(value: unknown): value is QuestionGrade {
  if (!value || typeof value !== "object") return false;
  const grade = value as Partial<QuestionGrade>;
  return (
    typeof grade.questionId === "string" &&
    Number.isInteger(grade.score) &&
    grade.score! >= 0 &&
    grade.score! <= 3 &&
    grade.total === 3 &&
    Boolean(grade.answers) &&
    typeof grade.answers === "object"
  );
}

function isQuestionApiResponse(value: unknown): value is QuestionApiResponse {
  if (!value || typeof value !== "object" || !("questions" in value)) return false;
  const candidate = value as { questions?: unknown; meta?: unknown };
  const meta = candidate.meta as Partial<QuestionApiResponse["meta"]> | undefined;
  return (
    Array.isArray(candidate.questions) &&
    candidate.questions.every(
      (question) =>
        question &&
        typeof question === "object" &&
        "id" in question &&
        typeof question.id === "string" &&
        "prompt" in question &&
        typeof question.prompt === "string" &&
        "author" in question &&
        Boolean(question.author) &&
        typeof question.author === "object" &&
        "handle" in question.author &&
        typeof question.author.handle === "string" &&
        "role" in question.author &&
        typeof question.author.role === "string" &&
        "answers" in question &&
        Array.isArray(question.answers) &&
        question.answers.length === 3,
    ) &&
    Boolean(meta) &&
    Number.isInteger(meta?.total) &&
    meta!.total! >= 0 &&
    (typeof meta?.next_cursor === "string" || meta?.next_cursor === null) &&
    Boolean(meta?.topic_counts) &&
    typeof meta?.topic_counts === "object"
  );
}

async function requestQuestionPage(cursor: string | null, signal?: AbortSignal) {
  const params = new URLSearchParams({ limit: "12" });
  if (cursor) params.set("cursor", cursor);
  const response = await fetch(`/api/questions?${params}`, {
    headers: { Accept: "application/json" },
    signal,
  });
  if (!response.ok) throw new Error("question_feed_unavailable");
  const payload: unknown = await response.json();
  if (!isQuestionApiResponse(payload)) throw new Error("invalid_question_feed");
  return payload;
}

function isLearningState(value: unknown): value is LearningState {
  if (!value || typeof value !== "object") return false;
  const state = value as Partial<LearningState>;
  return (
    Array.isArray(state.savedQuestionIds) &&
    state.savedQuestionIds.every((id) => typeof id === "string") &&
    Array.isArray(state.attemptedQuestionIds) &&
    state.attemptedQuestionIds.every((id) => typeof id === "string") &&
    Array.isArray(state.perfectQuestionIds) &&
    state.perfectQuestionIds.every((id) => typeof id === "string") &&
    Number.isInteger(state.correctJudgments) &&
    Boolean(state.perfectByTopic) &&
    typeof state.perfectByTopic === "object" &&
    Boolean(state.dailyPerfect) &&
    typeof state.dailyPerfect === "object"
  );
}

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

export function StudyApp({
  viewer,
  initialTab = "scroll",
}: {
  viewer: AccountViewer;
  initialTab?: Tab;
}) {
  const isRegistered = viewer.authenticated;
  const [tab, setTab] = useState<Tab>(initialTab);
  const [sheet, setSheet] = useState<Sheet>(null);
  const [activeQuestion, setActiveQuestion] = useState<PublicQuestion | null>(null);
  const [selectedTopic, setSelectedTopic] = useState<(typeof topics)[number]>("All");
  const [levels, setLevels] = useState<Set<Difficulty>>(
    () => new Set<Difficulty>(difficultyLabels),
  );
  const [saved, setSaved] = useState<Set<string>>(() => new Set());
  const [decisions, setDecisions] = useState<Decisions>({});
  const [revealed, setRevealed] = useState(false);
  const [gradeResult, setGradeResult] = useState<QuestionGrade | null>(null);
  const [isGrading, setIsGrading] = useState(false);
  const [completed, setCompleted] = useState<Set<string>>(() => new Set());
  const [perfectQuestions, setPerfectQuestions] = useState<Set<string>>(() => new Set());
  const [correctJudgments, setCorrectJudgments] = useState(0);
  const [perfectByTopic, setPerfectByTopic] = useState<Record<string, number>>({});
  const [dailyPerfect, setDailyPerfect] = useState<Record<string, number>>({});
  const [progressReady, setProgressReady] = useState(false);
  const [questionBank, setQuestionBank] = useState<PublicQuestion[]>([]);
  const [questionLoadState, setQuestionLoadState] = useState<"loading" | "ready" | "error">(
    "loading",
  );
  const [nextQuestionCursor, setNextQuestionCursor] = useState<string | null>(null);
  const [questionTotal, setQuestionTotal] = useState(0);
  const [topicCounts, setTopicCounts] = useState<Partial<Record<Topic, number>>>({});
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [toast, setToast] = useState("");
  const sentinelRef = useRef<HTMLDivElement>(null);
  const appViewRef = useRef<HTMLDivElement>(null);
  const sheetScrollRef = useRef({ app: 0, windowX: 0, windowY: 0 });

  const openSheetAtCurrentPosition = useCallback((nextSheet: Exclude<Sheet, null>) => {
    sheetScrollRef.current = {
      app: appViewRef.current?.scrollTop ?? 0,
      windowX: window.scrollX,
      windowY: window.scrollY,
    };
    setSheet(nextSheet);
  }, []);

  useLayoutEffect(() => {
    if (!sheet) return;
    const savedPosition = sheetScrollRef.current;
    const restoreScroll = () => {
      if (appViewRef.current) appViewRef.current.scrollTop = savedPosition.app;
      window.scrollTo(savedPosition.windowX, savedPosition.windowY);
    };
    let secondFrame = 0;
    restoreScroll();
    const firstFrame = window.requestAnimationFrame(() => {
      restoreScroll();
      secondFrame = window.requestAnimationFrame(restoreScroll);
    });
    return () => {
      window.cancelAnimationFrame(firstFrame);
      window.cancelAnimationFrame(secondFrame);
      restoreScroll();
    };
  }, [sheet]);

  const applyLearningState = useCallback((state: LearningState) => {
    setSaved(new Set(state.savedQuestionIds));
    setCompleted(new Set(state.attemptedQuestionIds));
    setPerfectQuestions(new Set(state.perfectQuestionIds));
    setCorrectJudgments(state.correctJudgments);
    setPerfectByTopic(state.perfectByTopic);
    setDailyPerfect(state.dailyPerfect);
  }, []);

  useEffect(() => {
    if (!isRegistered) {
      const progress = readProgress();
      applyLearningState({
        savedQuestionIds: readSaved(),
        attemptedQuestionIds: progress.attemptedQuestionIds,
        perfectQuestionIds: progress.perfectQuestionIds,
        correctJudgments: progress.correctJudgments,
        perfectByTopic: progress.perfectByTopic,
        dailyPerfect: progress.dailyPerfect,
      });
      setProgressReady(true);
      return;
    }

    const controller = new AbortController();
    async function loadAccountState() {
      try {
        const response = await fetch("/api/account/state", {
          headers: { Accept: "application/json" },
          signal: controller.signal,
        });
        if (!response.ok) throw new Error("state_unavailable");
        const payload: unknown = await response.json();
        const learningState =
          payload && typeof payload === "object" && "learningState" in payload
            ? (payload as { learningState: unknown }).learningState
            : null;
        if (!isLearningState(learningState)) throw new Error("invalid_state");
        applyLearningState(learningState);
      } catch (error) {
        if (!(error instanceof DOMException && error.name === "AbortError")) {
          setToast("Progress sync is unavailable. Try refreshing.");
        }
      } finally {
        if (!controller.signal.aborted) setProgressReady(true);
      }
    }
    void loadAccountState();
    return () => controller.abort();
  }, [applyLearningState, isRegistered]);

  useEffect(() => {
    if (!progressReady || isRegistered) return;
    window.localStorage.setItem(
      "studyscroll-saved",
      JSON.stringify(Array.from(saved)),
    );
  }, [isRegistered, progressReady, saved]);

  useEffect(() => {
    const controller = new AbortController();

    async function loadQuestionBank() {
      try {
        const payload = await requestQuestionPage(null, controller.signal);
        setQuestionBank(payload.questions);
        setNextQuestionCursor(payload.meta.next_cursor);
        setQuestionTotal(payload.meta.total);
        setTopicCounts(payload.meta.topic_counts);
        setQuestionLoadState("ready");
      } catch (error) {
        if (!(error instanceof DOMException && error.name === "AbortError")) {
          console.warn("The question API is unavailable.");
          setQuestionLoadState("error");
        }
      }
    }

    void loadQuestionBank();
    return () => controller.abort();
  }, []);

  useEffect(() => {
    if (!progressReady || isRegistered) return;
    const progress: StoredProgress = {
      attemptedQuestionIds: Array.from(completed),
      perfectQuestionIds: Array.from(perfectQuestions),
      correctJudgments,
      perfectByTopic,
      dailyPerfect,
    };
    window.localStorage.setItem("studyscroll-progress", JSON.stringify(progress));
  }, [completed, correctJudgments, dailyPerfect, isRegistered, perfectByTopic, perfectQuestions, progressReady]);

  useEffect(() => {
    if (!toast) return;
    const timer = window.setTimeout(() => setToast(""), 2200);
    return () => window.clearTimeout(timer);
  }, [toast]);

  const filteredQuestions = useMemo(() => {
    return questionBank.filter((question) => {
      const topicMatches =
        selectedTopic === "All" || question.topic === selectedTopic;
      return topicMatches && levels.has(question.difficulty);
    });
  }, [levels, questionBank, selectedTopic]);

  const feedItems = useMemo(() => {
    return filteredQuestions.map((question, index) => ({
      question,
      instance: index,
    }));
  }, [filteredQuestions]);

  const loadMoreQuestions = useCallback(async () => {
    if (!nextQuestionCursor || isLoadingMore) return;
    setIsLoadingMore(true);
    try {
      const payload = await requestQuestionPage(nextQuestionCursor);
      setQuestionBank((current) => {
        const known = new Set(current.map((question) => question.id));
        return [...current, ...payload.questions.filter((question) => !known.has(question.id))];
      });
      setNextQuestionCursor(payload.meta.next_cursor);
      setQuestionTotal(payload.meta.total);
      setTopicCounts(payload.meta.topic_counts);
    } catch {
      setToast("More questions couldn't load. Try scrolling again.");
    } finally {
      setIsLoadingMore(false);
    }
  }, [isLoadingMore, nextQuestionCursor]);

  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel || tab !== "scroll" || !nextQuestionCursor || isLoadingMore) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) void loadMoreQuestions();
      },
      { rootMargin: "240px" },
    );
    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [isLoadingMore, loadMoreQuestions, nextQuestionCursor, questionBank.length, tab]);

  const openQuestion = useCallback((question: PublicQuestion) => {
    setActiveQuestion(question);
    setDecisions({});
    setGradeResult(null);
    setRevealed(false);
    openSheetAtCurrentPosition("question");
  }, [openSheetAtCurrentPosition]);

  const closeSheet = useCallback(() => {
    setSheet(null);
    setActiveQuestion(null);
    setDecisions({});
    setGradeResult(null);
    setRevealed(false);
  }, []);

  async function toggleSaved(id: string) {
    const wasSaved = saved.has(id);
    const next = new Set(saved);
    if (wasSaved) next.delete(id);
    else next.add(id);
    setSaved(next);
    setToast(wasSaved ? "Removed from saved" : "Saved for later");

    if (!isRegistered) return;
    try {
      const response = await fetch(`/api/account/saved/${encodeURIComponent(id)}`, {
        method: wasSaved ? "DELETE" : "PUT",
        headers: {
          "Content-Type": "application/json",
          "X-StudyScroll-Request": "1",
        },
        body: "{}",
      });
      if (!response.ok) throw new Error("save_failed");
    } catch {
      setSaved((current) => {
        const rollback = new Set(current);
        if (wasSaved) rollback.add(id);
        else rollback.delete(id);
        return rollback;
      });
      setToast("Could not sync that save. Try again.");
    }
  }

  async function shareQuestion(question: PublicQuestion) {
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
          question.prompt + ": " + window.location.href,
        );
        setToast("Challenge copied");
      }
    } catch {
      // A dismissed native share sheet needs no error state.
    }
  }

  async function commitJudgments() {
    if (!activeQuestion || revealed || isGrading) return;
    setIsGrading(true);
    try {
      const response = await fetch(
        `/api/questions/${encodeURIComponent(activeQuestion.id)}/grade`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "X-StudyScroll-Request": "1",
          },
          body: JSON.stringify({
            decisions,
            timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
          }),
        },
      );
      if (!response.ok) throw new Error("grading_failed");
      const payload: unknown = await response.json();
      if (!isQuestionGrade(payload) || payload.questionId !== activeQuestion.id) {
        throw new Error("invalid_grading_response");
      }

      const count = payload.score;
      setGradeResult(payload);
      if (isRegistered) {
        if (!isLearningState(payload.learningState)) {
          throw new Error("missing_learning_state");
        }
        applyLearningState(payload.learningState);
      } else {
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
      }
      setRevealed(true);
    } catch {
      setToast("Could not check this question. Try again.");
    } finally {
      setIsGrading(false);
    }
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
    setGradeResult(null);
    setRevealed(false);
  }

  const savedQuestions = questionBank.filter((question) => saved.has(question.id));
  const rankSubjects = useMemo(
    () => Array.from(new Set(questionBank.map((question) => question.topic))),
    [questionBank],
  );
  const judgedCount = activeQuestion ? Object.keys(decisions).length : 0;
  const allJudged =
    activeQuestion !== null && judgedCount === activeQuestion.answers.length;
  const currentScore = gradeResult?.score ?? 0;

  return (
    <main id="main-content" className="app-stage">
      <div className="app-shell">
        <header className="app-header">
          <Link href="/" className="wordmark" aria-label="StudyScroll home">
            <span>Study</span><span>Scroll</span>
          </Link>
        </header>

        <div ref={appViewRef} className="app-view" aria-live="polite">
          {tab === "scroll" && (
            <FeedView
              feedItems={feedItems}
              filteredCount={filteredQuestions.length}
              hasMore={nextQuestionCursor !== null}
              isLoadingMore={isLoadingMore}
              loadState={questionLoadState}
              levels={levels}
              selectedTopic={selectedTopic}
              saved={saved}
              sentinelRef={sentinelRef}
              onOpen={openQuestion}
              onOpenLevels={() => openSheetAtCurrentPosition("levels")}
              onOpenTopics={() => openSheetAtCurrentPosition("topics")}
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
              isRegistered={isRegistered}
              perfectByTopic={perfectByTopic}
              rankSubjects={rankSubjects}
              onOpenRules={() => openSheetAtCurrentPosition("rankRules")}
            />
          )}
          {tab === "profile" && (
            <ProfileView viewer={viewer} />
          )}
        </div>

        <BottomNav tab={tab} onChange={setTab} />

        {sheet === "question" && activeQuestion && (
          <QuestionSheet
            allJudged={allJudged}
            decisions={decisions}
            gradeResult={gradeResult}
            isGrading={isGrading}
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
            questionTotal={questionTotal}
            selected={selectedTopic}
            topicCounts={topicCounts}
            onClose={() => setSheet(null)}
            onSelect={(topic) => {
              setSelectedTopic(topic);
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

type FeedItem = { question: PublicQuestion; instance: number };

function FeedView({
  feedItems,
  filteredCount,
  hasMore,
  isLoadingMore,
  loadState,
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
  hasMore: boolean;
  isLoadingMore: boolean;
  loadState: "loading" | "ready" | "error";
  levels: Set<Difficulty>;
  selectedTopic: string;
  saved: Set<string>;
  sentinelRef: React.RefObject<HTMLDivElement | null>;
  onOpen: (question: PublicQuestion) => void;
  onOpenLevels: () => void;
  onOpenTopics: () => void;
  onSave: (id: string) => void;
  onShare: (question: PublicQuestion) => void;
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
        {loadState === "loading" ? (
          <FeedSkeleton />
        ) : loadState === "error" ? (
          <div className="empty-state" role="alert">
            <h1>Questions couldn't load</h1>
            <p>Check your connection and try again.</p>
            <button
              type="button"
              className="button button-primary"
              onClick={() => window.location.reload()}
            >
              Try again
            </button>
          </div>
        ) : filteredCount === 0 && !hasMore ? (
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
        {loadState === "ready" && hasMore && (isLoadingMore || filteredCount === 0) && (
          <FeedLoadingMore />
        )}
        <div ref={sentinelRef} className="feed-sentinel" aria-hidden="true" />
      </section>
    </>
  );
}

function FeedSkeleton() {
  return (
    <div className="feed-loading" role="status" aria-live="polite">
      <span className="sr-only">Loading questions</span>
      {[0, 1, 2].map((item) => (
        <div className="question-card question-card-skeleton" aria-hidden="true" key={item}>
          <div className="skeleton-persona">
            <span className="skeleton-block skeleton-avatar" />
            <span className="skeleton-block skeleton-name" />
            <span className="skeleton-block skeleton-badge" />
          </div>
          <span className="skeleton-block skeleton-topic" />
          <span className="skeleton-block skeleton-title" />
          <span className="skeleton-block skeleton-title skeleton-title-short" />
          <span className="skeleton-block skeleton-context" />
          <span className="skeleton-block skeleton-action" />
        </div>
      ))}
    </div>
  );
}

function FeedLoadingMore() {
  return (
    <div className="feed-loading-more" role="status">
      <span className="skeleton-block" aria-hidden="true" />
      <span>Loading more</span>
    </div>
  );
}

function QuestionCard({
  question,
  saved,
  onOpen,
  onSave,
  onShare,
}: {
  question: PublicQuestion;
  saved: boolean;
  onOpen: () => void;
  onSave: () => void;
  onShare: () => void;
}) {
  return (
    <article className="question-card" data-question-id={question.id}>
      <button type="button" className="card-open-area" onClick={onOpen}>
        <span className="persona-row">
          <span className="persona">
            <Image src="/avatar.png" alt="" width={24} height={24} />
            <span>
              <strong>{question.author.handle}</strong>
              <small>{question.author.role}</small>
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
  questions: PublicQuestion[];
  saved: Set<string>;
  onOpen: (question: PublicQuestion) => void;
  onSave: (id: string) => void;
  onShare: (question: PublicQuestion) => void;
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
  isRegistered,
  perfectByTopic,
  rankSubjects,
  onOpenRules,
}: {
  dailyPerfect: Record<string, number>;
  isRegistered: boolean;
  perfectByTopic: Record<string, number>;
  rankSubjects: string[];
  onOpenRules: () => void;
}) {
  const todayPerfect = dailyPerfect[localDateKey()] ?? 0;
  const todayProgress = Math.min(todayPerfect, DAILY_GOAL);
  const streak = calculateStreak(dailyPerfect);
  const earnedSubjects = rankSubjects.filter(
    (subject) => (perfectByTopic[subject] ?? 0) >= rankTiers[1].threshold,
  );
  return (
    <section
      className={`tab-page progress-page${isRegistered ? "" : " progress-locked"}`}
      aria-labelledby="progress-title"
    >
      {!isRegistered && (
        <aside className="account-feature-note" aria-label="Registered users only">
          <LockKeyhole aria-hidden="true" size={17} />
          <p>
            <strong>Registered users only</strong>
            <Link href="/auth?mode=signup">Create an account or log in</Link> to keep your streak and ranks.
          </p>
        </aside>
      )}
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
          <button
            type="button"
            onClick={onOpenRules}
            disabled={!isRegistered}
            aria-label={isRegistered ? "Rank rules" : "Rank rules, registered users only"}
            title={isRegistered ? undefined : "Create an account to view rank rules"}
          >
            <CircleHelp aria-hidden="true" size={17} />
            Rank rules
          </button>
        </div>

        {earnedSubjects.length > 0 ? (
          <div className="rank-list">
            {earnedSubjects.map((subject) => {
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
        ) : (
          <div className="ranks-empty">
            <span aria-hidden="true">5</span>
            <p>
              <strong>Unlock Junior Scroller</strong>
              Complete 5 perfect questions in one subject.
            </p>
          </div>
        )}
      </section>
    </section>
  );
}

function ProfileView({ viewer }: { viewer: AccountViewer }) {
  const isRegistered = viewer.authenticated;
  const [signingOut, setSigningOut] = useState(false);
  const [signOutError, setSignOutError] = useState("");

  async function signOut() {
    if (signingOut) return;
    setSigningOut(true);
    setSignOutError("");
    const { error } = await createBrowserSupabaseClient().auth.signOut();
    if (error) {
      setSignOutError("Could not log you out. Try again.");
      setSigningOut(false);
      return;
    }
    window.location.assign("/");
  }

  return (
    <section className="tab-page profile-page" aria-labelledby="profile-title">
      <div className="tab-heading">
        <p>ACCOUNT</p>
        <h1 id="profile-title">Profile</h1>
      </div>

      <div className="profile-summary">
        <span className="profile-avatar"><UserRound aria-hidden="true" size={34} /></span>
        <div>
          <strong>{isRegistered ? "StudyScroller" : "Guest learner"}</strong>
          <span>{isRegistered ? viewer.email ?? "Your StudyScroll account" : "Register to sync your account"}</span>
        </div>
      </div>

      {isRegistered ? (
        <section className="account-settings" aria-labelledby="account-settings-title">
          <h2 id="account-settings-title">Account settings</h2>
          <Link href="/account" className="account-setting-row">
            <Mail aria-hidden="true" size={19} />
            <span>
              <strong>Edit email</strong>
              <small>Change your sign-in email</small>
            </span>
            <ChevronRight aria-hidden="true" size={18} />
          </Link>
          <Link href="/account" className="account-setting-row">
            <KeyRound aria-hidden="true" size={19} />
            <span>
              <strong>Edit password</strong>
              <small>Choose a new password</small>
            </span>
            <ChevronRight aria-hidden="true" size={18} />
          </Link>
          <button type="button" className="account-setting-row account-logout-row" onClick={signOut} disabled={signingOut}>
            <LogOut aria-hidden="true" size={19} />
            <span>
              <strong>{signingOut ? "Logging out..." : "Log out"}</strong>
              <small>End this session on this device</small>
            </span>
          </button>
          {signOutError && <p className="profile-action-error" role="alert">{signOutError}</p>}
          <Link href="/account" className="delete-account">
            Delete account
          </Link>
        </section>
      ) : (
        <section className="guest-account-card" aria-labelledby="guest-account-title">
          <h2 id="guest-account-title">Keep your progress</h2>
          <p>Create a free account to save your streak, ranks, and personalized feed.</p>
          <Link href="/auth?mode=signup" className="button button-primary">
            Create free account
          </Link>
          <Link href="/auth" className="guest-sign-in">
            Already registered? Sign in
          </Link>
        </section>
      )}

      <Link href="/" className="back-link"><ArrowLeft aria-hidden="true" size={18} />Back to homepage</Link>
    </section>
  );
}

function NavIcon({ id, active }: { id: Tab; active: boolean }) {
  const icons = {
    scroll: active ? MdHome : MdOutlineHome,
    saved: active ? MdBookmark : MdOutlineBookmark,
    progress: active ? MdWhatshot : MdOutlineWhatshot,
    profile: active ? MdPerson : MdOutlinePerson,
  };
  const Icon = icons[id];

  return <Icon className="nav-icon" aria-hidden="true" />;
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
      {items.map(({ id, label }) => {
        const active = tab === id;
        return (
          <button
            key={id}
            type="button"
            className={active ? "active" : ""}
            aria-current={active ? "page" : undefined}
            onClick={() => onChange(id)}
          >
            <span><NavIcon id={id} active={active} /></span>
            {label}
          </button>
        );
      })}
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
  const onCloseRef = useRef(onClose);
  onCloseRef.current = onClose;

  useLayoutEffect(() => {
    const returnFocusTo =
      document.activeElement instanceof HTMLElement ? document.activeElement : null;
    sheetRef.current?.focus({ preventScroll: true });
    function handleKey(event: KeyboardEvent) {
      if (event.key === "Escape") onCloseRef.current();
    }
    window.addEventListener("keydown", handleKey);
    return () => {
      window.removeEventListener("keydown", handleKey);
      returnFocusTo?.focus({ preventScroll: true });
    };
  }, []);
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
  gradeResult,
  isGrading,
  judgedCount,
  allJudged,
  revealed,
  score,
  onDecision,
  onCommit,
  onNext,
  onClose,
}: {
  question: PublicQuestion;
  decisions: Decisions;
  gradeResult: QuestionGrade | null;
  isGrading: boolean;
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
          <a
            className="question-reference"
            href={question.source}
            target="_blank"
            rel="noopener noreferrer"
          >
            Source: {question.clue} <ExternalLink aria-hidden="true" size={14} />
          </a>
        </div>
        <div className="answers-list">
          {question.answers.map((answer) => {
            const choice = decisions[answer.id];
            const result = gradeResult?.answers[answer.id];
            const correct = result?.correct ?? false;
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
                    disabled={revealed || isGrading}
                    onClick={() => onDecision(answer.id, "legit")}
                  >
                    <ThumbsUp aria-hidden="true" size={20} />legit
                  </button>
                  <button
                    type="button"
                    className={choice === "sus" ? "selected" : ""}
                    aria-pressed={choice === "sus"}
                    disabled={revealed || isGrading}
                    onClick={() => onDecision(answer.id, "sus")}
                  >
                    <Skull aria-hidden="true" size={20} />sus
                  </button>
                </div>
                {revealed && (
                  <div className="answer-feedback">
                    <strong>{correct ? "Correct!" : "Careful."}</strong>
                    <p>{result?.feedback}</p>
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
            <button type="button" className="button button-primary" disabled={!allJudged || isGrading} onClick={onCommit}>
              {isGrading ? "Checking..." : "Check my judgments"}
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
  questionTotal,
  selected,
  topicCounts,
  onSelect,
  onClose,
}: {
  questionTotal: number;
  selected: (typeof topics)[number];
  topicCounts: Partial<Record<Topic, number>>;
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
        />
      </label>
      <div className="topic-options" role="listbox" aria-label="Topics">
        {filteredTopics.map((topic) => {
          const count =
            topic === "All"
              ? questionTotal
              : topicCounts[topic] ?? 0;
          return (
            <Fragment key={topic}>
              <button
                type="button"
                role="option"
                aria-selected={selected === topic}
                className={selected === topic ? "selected" : ""}
                onClick={() => onSelect(topic)}
              >
                <span>{topic}</span><span>{count}</span>
              </button>
              {topic === "All" && query.trim() === "" && (
                <button
                  type="button"
                  className="ai-topic-option"
                  aria-label="Create your own with AI, premium users only"
                  disabled
                >
                  <span className="ai-topic-copy">
                    <Sparkles aria-hidden="true" size={16} />
                    <strong>Create your own with AI</strong>
                  </span>
                  <span className="ai-topic-lock">
                    <small>Premium</small>
                    <LockKeyhole aria-hidden="true" size={15} />
                  </span>
                </button>
              )}
            </Fragment>
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

        <ol className="rank-ladder">
          {rankTiers.slice(1).map((tier) => (
            <li key={tier.name}>
              <span>{tier.threshold}</span>
              <strong>{tier.name}</strong>
            </li>
          ))}
        </ol>
      </div>
      <button type="button" className="sheet-done" onClick={onClose}>Got it</button>
    </BottomSheet>
  );
}
