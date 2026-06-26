import './Hero.css';

export default function Hero() {
  const handleScrollTo = (e, id) => {
    e.preventDefault();
    document.querySelector(id)?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <section className="hero section" id="hero">
      <div className="container">
        <div className="hero-content">
          {/* Left: Text */}
          <div className="hero-text">
            <span className="hero-role">Junior Software Developer</span>

            <h1 className="hero-name">
              Dimitrios<br />
              <span className="gradient-text">Antoniadis</span>
            </h1>

            <p className="hero-subtitle">
              Software Developer and co-owner of{' '}
              <a href="https://study-saga.com" target="_blank" rel="noopener noreferrer" className="hero-link">
                study-saga.com
              </a>
              , a production platform serving <strong>40,000+ users</strong> across web and Discord.
              I build user-focused software with React, TypeScript and modern web technologies.
            </p>

            <div className="hero-cta">
              <a href="#contact" className="btn btn-primary" onClick={(e) => handleScrollTo(e, '#contact')}>
                Get in touch
              </a>
              <a href="#work" className="btn btn-secondary" onClick={(e) => handleScrollTo(e, '#work')}>
                View work
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M5 12h14M12 5l7 7-7 7" />
                </svg>
              </a>
            </div>

            <div className="hero-socials">
              <a href="https://github.com/DimAntoniadis96" target="_blank" rel="noopener noreferrer" className="social-icon" aria-label="GitHub">
                <svg viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                </svg>
              </a>
              <a href="https://linkedin.com/in/dim-antoniadis-dev/" target="_blank" rel="noopener noreferrer" className="social-icon" aria-label="LinkedIn">
                <svg viewBox="0 0 24 24" fill="currentColor">
                  <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                </svg>
              </a>
              <a href="mailto:dim.antoniadis.dev@gmail.com" className="social-icon" aria-label="Email">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="2" y="4" width="20" height="16" rx="2" />
                  <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
                </svg>
              </a>
            </div>

            <div className="hero-location">
              <span className="dot" />
              <span>Thessaloniki, Greece · Open to work</span>
            </div>
          </div>

          {/* Right: Photo */}
          <div className="hero-photo-wrapper">
            <div className="hero-photo-card flip-container">
              <div className="flipper">
                {/* Front: Photo */}
                <div className="front">
                  <div className="photo-tint"></div>
                  <img
                    src="/photo_me.jpg"
                    alt="Dimitrios Antoniadis"
                    className="hero-photo"
                    loading="eager"
                    fetchPriority="high"
                  />
                </div>

                {/* Back: Download CV */}
                <div className="back">
                  <a href="/Dimitrios_Antoniadis_CV.pdf" className="cv-download-content" download="Dimitrios_Antoniadis_CV.pdf">
                    <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="download-icon">
                      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                      <polyline points="7 10 12 15 17 10"></polyline>
                      <line x1="12" y1="15" x2="12" y2="3"></line>
                    </svg>
                    <span>Download my CV</span>
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
