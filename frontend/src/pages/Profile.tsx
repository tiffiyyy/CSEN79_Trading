import "./Profile.css";

export function Profile() {
  return (
    <main className="profile-page">
      <h1 className="profile-page__title">Profile</h1>
      <p className="profile-page__subtitle">Your trading statistics</p>

      <section className="profile-stats">
        <div className="profile-stat-card">
          <span className="profile-stat-card__label">Total trades</span>
          <span className="profile-stat-card__value">—</span>
        </div>
        <div className="profile-stat-card">
          <span className="profile-stat-card__label">Portfolio value</span>
          <span className="profile-stat-card__value">—</span>
        </div>
        <div className="profile-stat-card">
          <span className="profile-stat-card__label">Open positions</span>
          <span className="profile-stat-card__value">—</span>
        </div>
        <div className="profile-stat-card">
          <span className="profile-stat-card__label">Total return</span>
          <span className="profile-stat-card__value">—</span>
        </div>
      </section>
    </main>
  );
}
