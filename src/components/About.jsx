import { useFadeIn } from '../hooks/useFadeIn';
import './About.css';

export default function About() {
  const { ref, isVisible } = useFadeIn();

  return (
    <section className="about section" id="about">
      <div className="container">
        <div ref={ref} className={`about-content fade-in ${isVisible ? 'visible' : ''}`}>
          <div className="about-header">
            <span className="section-label">About</span>
            <h2 className="section-heading">A bit about me</h2>
          </div>

          <div className="about-grid">
            <div className="about-stats">
              <div className="about-stat">
                <span className="about-stat-value">40K+</span>
                <span className="about-stat-label">Users served</span>
              </div>
              <div className="about-stat">
                <span className="about-stat-value">2</span>
                <span className="about-stat-label">Platforms</span>
              </div>
              <div className="about-stat">
                <span className="about-stat-value">BSc</span>
                <span className="about-stat-label">CS in progress</span>
              </div>
            </div>

            <div className="about-text">
              <p>
                I'm <strong>Dimitrios Antoniadis</strong>, a <strong>junior software developer</strong> based
                in <strong>Thessaloniki, Greece</strong>. I'm the co-owner and frontend developer
                of <a href="https://study-saga.com" target="_blank" rel="noopener noreferrer">study-saga.com</a>,
                a production platform serving <strong>40,000+ users</strong> across web and Discord, with a mobile
                app currently in development.
              </p>
              <p>
                I build user-focused software with <strong>React</strong>, <strong>TypeScript</strong> and
                modern web technologies. My work spans responsive UIs, real-time collaborative features,
                gamification systems, and integrations with services like Discord, Clerk, and Convex.
              </p>
              <p>
                I'm currently pursuing a <strong>BSc in Computer Science</strong> at the Hellenic Open University,
                combining academic foundations with hands-on production experience. I'm always looking for
                opportunities to grow and build software that makes a real impact.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
