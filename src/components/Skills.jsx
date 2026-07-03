import { useState, useEffect, useRef } from 'react';
import { useFadeIn } from '../hooks/useFadeIn';
import './Skills.css';

const SKILL_CATEGORIES = [
  {
    title: 'Frontend',
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="16 18 22 12 16 6" /><polyline points="8 6 2 12 8 18" />
      </svg>
    ),
    summary: 'Polished, responsive UI with typed components and careful motion.',
    skills: ['React', 'TypeScript', 'JavaScript', 'HTML5', 'CSS3', 'Tailwind CSS', 'Framer Motion'],
  },
  {
    title: 'State & Data',
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <ellipse cx="12" cy="5" rx="9" ry="3" /><path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3" /><path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5" />
      </svg>
    ),
    summary: 'Fast data flows, small stores, and API layers that stay readable.',
    skills: ['React Query', 'Zustand', 'API Integration'],
  },
  {
    title: 'Backend',
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="2" y="2" width="20" height="8" rx="2" ry="2" /><rect x="2" y="14" width="20" height="8" rx="2" ry="2" /><line x1="6" y1="6" x2="6.01" y2="6" /><line x1="6" y1="18" x2="6.01" y2="18" />
      </svg>
    ),
    summary: 'Auth, realtime data, databases, and the backend pieces that make apps real.',
    skills: ['Python', 'Pygame', 'C', 'Convex', 'Supabase', 'Clerk', 'Discord SDK', 'PostgreSQL'],
  },
  {
    title: 'DevOps & Tools',
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" />
      </svg>
    ),
    summary: 'Versioning, deployment, testing, analytics, and the feedback loop after launch.',
    skills: ['Git', 'GitHub', 'Docker', 'Vercel', 'Vitest', 'Playwright', 'PostHog', 'Sentry', 'Godot Engine'],
  },
];

export default function Skills() {
  const { ref, isVisible } = useFadeIn();
  const [hoveredCard, setHoveredCard] = useState(null);
  const [animatedCards, setAnimatedCards] = useState([]);
  const sectionRef = useRef(null);

  // Staggered card entrance animation
  useEffect(() => {
    if (!isVisible) return;
    const timers = [];
    SKILL_CATEGORIES.forEach((_, i) => {
      const timer = setTimeout(() => {
        setAnimatedCards(prev => [...prev, i]);
      }, 200 * i);
      timers.push(timer);
    });
    return () => timers.forEach(t => clearTimeout(t));
  }, [isVisible]);

  const totalSkills = SKILL_CATEGORIES.reduce((sum, cat) => sum + cat.skills.length, 0);

  return (
    <section className="skills section" id="skills" ref={sectionRef}>
      <div className="container">
        <div ref={ref} className={`fade-in ${isVisible ? 'visible' : ''}`}>

          {/* ── Header ── */}
          <div className="skills-header">
            <div>
              <span className="section-label">TECH STACK</span>
              <h2 className="section-heading">
                Technologies <span>I Work With</span>
              </h2>
            </div>
            <div className="skills-header-right">
              <p className="skills-description">
                Technologies and tools I use to design, build, and deploy modern web applications.
              </p>
              {/* Stats bar */}
              <div className="skills-stats">
                <div className="skills-stat">
                  <span className="skills-stat-number">{SKILL_CATEGORIES.length}</span>
                  <span className="skills-stat-label">Categories</span>
                </div>
                <div className="skills-stat-divider" />
                <div className="skills-stat">
                  <span className="skills-stat-number">{totalSkills}</span>
                  <span className="skills-stat-label">Technologies</span>
                </div>
              </div>
            </div>
          </div>

          {/* ── Cards Grid ── */}
          <div className="skills-grid">
            {SKILL_CATEGORIES.map((cat, index) => (
              <article
                className={[
                  'skill-card',
                  hoveredCard === index ? 'skill-card--active' : '',
                  animatedCards.includes(index) ? 'skill-card--visible' : '',
                ].filter(Boolean).join(' ')}
                key={cat.title}
                onMouseEnter={() => setHoveredCard(index)}
                onMouseLeave={() => setHoveredCard(null)}
              >
                {/* Glow effect */}
                <div className="skill-card-glow" aria-hidden="true" />

                {/* Card header */}
                <div className="skill-card-header">
                  <div className="skill-card-icon">
                    {cat.icon}
                  </div>
                  <div className="skill-card-title-group">
                    <span className="skill-card-number">{String(index + 1).padStart(2, '0')}</span>
                    <h3 className="skill-card-title">{cat.title}</h3>
                  </div>
                  <span className="skill-card-count">{cat.skills.length} tools</span>
                </div>

                {/* Summary */}
                <p className="skill-card-summary">{cat.summary}</p>

                {/* Divider */}
                <div className="skill-card-divider" />

                {/* Skills */}
                <ul className="skill-card-tools" aria-label={`${cat.title} technologies`}>
                  {cat.skills.map((skill, i) => (
                    <li
                      className="skill-pill"
                      key={skill}
                      style={{ animationDelay: `${0.05 * i}s` }}
                    >
                      <span className="skill-pill-dot" aria-hidden="true" />
                      {skill}
                    </li>
                  ))}
                </ul>
              </article>
            ))}
          </div>

        </div>
      </div>
    </section>
  );
}
