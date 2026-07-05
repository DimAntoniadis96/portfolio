import { useState } from 'react';
import './Hero.css';
import { ArrowRightIcon, CvIcon, GitHubIcon, LinkedInIcon, MailIcon } from './SiteIcons';

export default function Hero() {
  const [isFlipped, setIsFlipped] = useState(false);
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
            <span className="hero-role">Junior Software Developer / Frontend</span>

            <h1 className="hero-name">
              Dimitrios<br />
              <span className="hero-name-accent">Antoniadis</span>
            </h1>

            <p className="hero-subtitle">
              Software Developer and co-owner of{' '}
              <a href="https://study-saga.com" target="_blank" rel="noopener noreferrer" className="hero-link">
                study-saga.com
              </a>
              , a production platform serving <strong>40,000+ users</strong> across web, desktop, and Discord.
              I build user-focused software with React, TypeScript and modern web technologies.
            </p>

            <div className="hero-cta">
              <a href="#contact" className="btn btn-primary" onClick={(e) => handleScrollTo(e, '#contact')}>
                Get in touch
              </a>
              <a href="#work" className="btn btn-secondary" onClick={(e) => handleScrollTo(e, '#work')}>
                View work
                <ArrowRightIcon size={16} />
              </a>
            </div>

            <div className="hero-socials">
              <a href="https://github.com/DimAntoniadis96" target="_blank" rel="noopener noreferrer" className="social-icon" aria-label="GitHub">
                <GitHubIcon />
              </a>
              <a href="https://linkedin.com/in/dim-antoniadis-dev/" target="_blank" rel="noopener noreferrer" className="social-icon" aria-label="LinkedIn">
                <LinkedInIcon />
              </a>
              <a href="mailto:dim.antoniadis.dev@gmail.com" className="social-icon" aria-label="Email">
                <MailIcon />
              </a>
            </div>

            <div className="hero-location">
              <span className="dot" />
              <span>Thessaloniki, Greece · Open to work</span>
            </div>
          </div>

          {/* Right: Photo */}
          <div className="hero-photo-wrapper">
            <div 
              className={`hero-photo-card flip-container ${isFlipped ? 'flipped' : ''}`}
              onClick={() => setIsFlipped(!isFlipped)}
            >
              <div className="flipper">
                {/* Front: Photo */}
                <div className="front">
                  <img
                    src="/image_me.jpg"
                    alt="Dimitrios Antoniadis"
                    className="hero-photo"
                    loading="eager"
                    fetchPriority="high"
                  />
                  <span className="hero-photo-caption">CV on the back</span>
                </div>

                {/* Back: Download CV */}
                <div className="back">
                  <a href="/Dimitrios_Antoniadis_CV.pdf" className="cv-download-content" download="Dimitrios_Antoniadis_CV.pdf">
                    <CvIcon size={56} />
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
