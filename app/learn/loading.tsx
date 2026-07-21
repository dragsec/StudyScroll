export default function LearnLoading() {
  return (
    <div className="app-launch-splash route-loading-splash" role="status">
      <div className="app-launch-wordmark" aria-hidden="true">
        <span>Study</span><span>Scroll</span>
      </div>
      <span className="sr-only">Loading StudyScroll</span>
    </div>
  );
}
