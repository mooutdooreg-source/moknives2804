export default function Home() {
  return (
    <main>
      <header className="site-header">
        <div className="announcement-bar">
          <div className="announcement-track">
            <div className="announcement-copy">Mo Knives — Hand Forged Since 2015</div>
            <div className="announcement-copy">Field Proven. No Theater.</div>
            <div className="announcement-copy">Built for Real Use</div>
          </div>
        </div>

        <div className="header-row">
          <div className="brand-lockup">
            <div className="brand-mark">MG</div>
            <span className="brand-name">Mo Knives</span>
          </div>

          <nav className="header-nav">
            <a href="#" className="nav-link">Home</a>
            <a href="#" className="nav-link">Vault</a>
            <a href="#" className="nav-link">Why Mo</a>
            <a href="#" className="nav-link">Contact</a>
          </nav>

          <a href="#" className="request-button">Request Entry</a>
        </div>
      </header>

      <section className="hero">
        <div className="hero-inner">
          <p className="eyebrow">American Bladesmith Society Member</p>
          <h1 className="hero-title">
            Forging Your <span>Future History</span>
          </h1>
          <p className="hero-copy">
            Functional legacies. Built for the wild, the mission, and the fire.
          </p>

          <div className="hero-actions">
            <a href="#" className="button-primary">Request Entry</a>
            <a href="#" className="button-secondary">Enter The Vault</a>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container split">
          <div>
            <p className="section-label">Field Foundation</p>
            <h2 className="section-title">Before the Forge, There Was the Field</h2>
            <p className="section-copy">
              Built from real use — not theory. Every blade begins where performance matters.
            </p>
          </div>

          <div className="proof-card">Media placeholder (assets next step)</div>
        </div>
      </section>

      <footer className="site-footer">
        <div className="footer-inner">
          <span>© {new Date().getFullYear()} Mo Knives</span>
          <span>Hand-Forged. Field-Proven.</span>
        </div>
      </footer>
    </main>
  );
}
