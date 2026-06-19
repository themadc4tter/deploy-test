function DashboardHeader({ activeCount, completedCount, visitorId }) {
  const shortVisitorId = visitorId.slice(0, 8);

  return (
    <header className="dashboard-header">
      <div>
        <p className="eyebrow">Anonymous workspace</p>
        <h1>Dashboard To-Do</h1>
        <p className="visitor-id">Visitor ID: {shortVisitorId}</p>
      </div>

      <dl className="summary-cards" aria-label="To-do summary">
        <div className="summary-card">
          <dt>Active</dt>
          <dd>{activeCount}</dd>
        </div>

        <div className="summary-card">
          <dt>Completed</dt>
          <dd>{completedCount}</dd>
        </div>
      </dl>
    </header>
  );
}

export default DashboardHeader;
