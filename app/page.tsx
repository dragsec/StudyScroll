import Link from "next/link";
import {
  ArrowDown,
  BookOpen,
  Brain,
  CirclePlay,
  GraduationCap,
  Users,
} from "lucide-react";

const principles = [
  {
    number: "1",
    title: "A technical question appears in your feed",
    body: "Three AI-generated answers come from different personas. Each sounds plausible.",
  },
  {
    number: "2",
    title: "Judge before you reveal",
    body: "Mark every answer Legit or Sus. Commit all three before feedback appears.",
  },
  {
    number: "3",
    title: "Instant feedback",
    body: "Right or wrong, the explanation tells you why and reinforces the idea from another angle.",
  },
];

const evidence = [
  {
    title: "Test yourself. Remember more.",
    body: "Trying to answer helps you remember more than just reading and rereading.",
    source: "Roediger & Karpicke, 2006",
  },
  {
    title: "Mistakes come back",
    body: "Reviewing a mistake a few days later helps the correction stick.",
    source: "Study across 21,415 learners, 2025",
  },
  {
    title: "Tricky = Sticky",
    body: "When a wrong answer sounds believable, you have to think harder. That makes the correction easier to remember.",
    source: "Bjork & Bjork, 2011",
  },
  {
    title: "Same curiosity. Better outcome.",
    body: "You keep scrolling because you never know what comes next. StudyScroll turns that curiosity into learning.",
    source: "Anselme & Robinson, 2018",
  },
];

const comparisons = [
  {
    icon: CirclePlay,
    title: "Courses / Tutorial",
    body: "Watching feels productive, but passive video rarely sticks unless you stop, recall, and practice.",
    kind: "weak",
  },
  {
    icon: BookOpen,
    title: "Books / Textbook",
    body: "You highlight, take notes, close the book, and remember the cover color a week later.",
    kind: "weak",
  },
  {
    icon: Users,
    title: "Socials / Reels",
    body: "Engineered addiction with zero knowledge retention. You scroll for hours and remember nothing.",
    kind: "weak",
  },
  {
    icon: Brain,
    title: "StudyScroll",
    body: "Turns your scroll habit into quick technical judgment. Vote, reveal, understand why.",
    kind: "strong",
  },
];

const topicNames = [
  "Javascript",
  "Python",
  "DSA",
  "JAVA",
  "SQL",
  "System Design",
  "AWS",
  "Spring Boot",
  "Docker",
  "Networking",
  "Linux",
  "Calculus",
  "Operating Systems",
  "Discrete Maths",
];

export default function LandingPage() {
  return (
    <main id="main-content" className="landing">
      <section className="landing-hero landing-section" aria-labelledby="hero-title">
        <header className="landing-brand">
          <span>Study</span>
          <span>Scroll</span>
        </header>
        <div className="hero-inner">
          <p className="hero-kicker">learning tool for the AI era</p>
          <div className="hero-copy">
            <h1 id="hero-title">
              Learn by <span>scrolling.</span>
            </h1>
            <p>Scroll through quick coding challenges. Test your judgment as you go.</p>
          </div>
          <div className="hero-actions">
            <Link className="button button-primary" href="/learn">
              Start learning
            </Link>
            <Link className="button button-secondary" href="/learn">
              Sign up
            </Link>
            <a className="scroll-more" href="#how-it-works">
              <span>scroll for more info</span>
              <ArrowDown aria-hidden="true" size={22} />
            </a>
          </div>
        </div>
      </section>

      <section id="how-it-works" className="landing-section info-panel" aria-labelledby="how-title">
        <div className="section-content">
          <h2 id="how-title">Scroll. Vote. Learn.</h2>
          <ol className="step-list">
            {principles.map((item) => (
              <li key={item.number}>
                <span className="step-number" aria-hidden="true">{item.number}</span>
                <p>
                  <strong>{item.title}.</strong> {item.body}
                </p>
              </li>
            ))}
          </ol>
          <p className="return-note">
            Wrong answers come back automatically after two days. Every combination of right and wrong produces learning. There&apos;s no wasted scroll.
          </p>
        </div>
      </section>

      <section className="landing-section evidence-section" aria-labelledby="evidence-title">
        <div className="section-content">
          <h2 id="evidence-title">Why it works.</h2>
          <p className="section-intro">Built around how memory, feedback, and habits actually work.</p>
          <div className="evidence-list">
            {evidence.map((item) => (
              <article key={item.title} className="evidence-item">
                <h3>{item.title}</h3>
                <p>{item.body}</p>
                <cite>{item.source}</cite>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="landing-section info-panel" aria-labelledby="compare-title">
        <div className="section-content">
          <h2 id="compare-title">Why other options fail you.</h2>
          <div className="comparison-list">
            {comparisons.map(({ icon: Icon, title, body, kind }) => (
              <article key={title} className={"comparison-item comparison-" + kind}>
                <div className="comparison-heading">
                  <span className="comparison-icon"><Icon aria-hidden="true" size={22} /></span>
                  <h3>{title}</h3>
                </div>
                <p>{body}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="landing-section topics-section" aria-labelledby="topics-title">
        <div className="section-content">
          <h2 id="topics-title">14 topics and growing.<br />1,000+ questions each.</h2>
          <p className="section-intro">AI-generated, cross-validated, difficulty-calibrated.</p>
          <div className="topic-cloud" aria-label="Available topics">
            {topicNames.map((topic) => <span key={topic}>{topic}</span>)}
          </div>
          <div className="difficulty-ratio" aria-label="Question difficulty distribution">
            <span><i className="dot-easy" />25% easy</span>
            <span><i className="dot-medium" />50% medium</span>
            <span><i className="dot-hard" />25% hard</span>
          </div>
        </div>
      </section>

      <section className="landing-section cost-section" aria-labelledby="cost-title">
        <div className="section-content">
          <div className="cost-heading">
            <h2 id="cost-title">The core app is free forever.</h2>
            <p>Learn every topic. Build your streak. Climb every rank.</p>
            <span>Personalized practice. Mistakes come back automatically.</span>
          </div>
          <div className="plans">
            <article>
              <span className="plan-kicker">JUMP RIGHT IN</span>
              <h3>without account</h3>
              <ul>
                <li>10 posts/day</li>
                <li>All topics accessible</li>
                <li>No registration needed</li>
              </ul>
            </article>
            <article className="featured-plan">
              <span className="plan-label">CORE EXPERIENCE</span>
              <h3>free account</h3>
              <ul>
                <li>100 posts/day</li>
                <li>Personalized feed</li>
                <li>Mistakes come back</li>
                <li>Streaks and ranks</li>
              </ul>
            </article>
            <article className="premium-plan">
              <span className="plan-label premium-label">OPTIONAL UPGRADE</span>
              <span className="plan-kicker">MAKE IT YOURS</span>
              <h3>premium account</h3>
              <p className="plan-summary">Turn exactly what you want to learn into a custom StudyScroll feed.</p>
              <ul>
                <li>Everything in the free account</li>
                <li>Generate questions with AI</li>
                <li>Build from your own specific prompt</li>
              </ul>
            </article>
          </div>
          <div className="closing-copy">
            <GraduationCap aria-hidden="true" size={30} />
            <h2>StudyScroll doesn&apos;t ask you to study.<br />It asks you to scroll.</h2>
            <p>The learning is a side effect.</p>
          </div>
          <div className="closing-actions">
            <Link className="button button-primary" href="/learn">Start learning</Link>
            <Link className="button button-secondary" href="/learn">Sign up</Link>
          </div>
        </div>
      </section>
    </main>
  );
}
