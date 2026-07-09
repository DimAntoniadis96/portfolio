import { useState, useEffect, useRef } from 'react';
import { useFadeIn } from '../hooks/useFadeIn';
import './Skills.css';
import { CodeBlockIcon, DataStackIcon, ServiceBoxIcon, ToolMarkIcon } from './SiteIcons';
import HeaderSparkles from './ui/HeaderSparkles';

const SKILL_CATEGORIES = [
  {
    title: 'Frontend',
    icon: <CodeBlockIcon />,
    summary: 'Polished, responsive UI with typed components and careful motion.',
    skills: ['React', 'TypeScript', 'JavaScript', 'HTML5', 'CSS3', 'Tailwind CSS', 'Framer Motion'],
  },
  {
    title: 'State & Data',
    icon: <DataStackIcon />,
    summary: 'Fast data flows, small stores, and API layers that stay readable.',
    skills: ['React Query', 'Zustand', 'API Integration'],
  },
  {
    title: 'Backend',
    icon: <ServiceBoxIcon />,
    summary: 'Auth, realtime data, databases, and the backend pieces that make apps real.',
    skills: ['Python', 'Pygame', 'C', 'Convex', 'Supabase', 'Clerk', 'Discord SDK', 'PostgreSQL'],
  },
  {
    title: 'DevOps & Tools',
    icon: <ToolMarkIcon />,
    summary: 'Versioning, deployment, testing, analytics, and the feedback loop after launch.',
    skills: ['Git', 'GitHub', 'Docker', 'Vercel', 'Vitest', 'Playwright', 'PostHog', 'Sentry', 'Godot Engine'],
  },
];

export default function Skills() {
  const { ref, isVisible } = useFadeIn();
  const [hoveredCard, setHoveredCard] = useState(null);
  const [animatedCards, setAnimatedCards] = useState([]);
  const sectionRef = useRef(null);
  const gridRef = useRef(null);

  const handleMouseMove = (e) => {
    if (!gridRef.current) return;
    const rect = gridRef.current.getBoundingClientRect();
    gridRef.current.style.setProperty('--mouse-x', `${e.clientX - rect.left}px`);
    gridRef.current.style.setProperty('--mouse-y', `${e.clientY - rect.top}px`);
  };

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

          <div className="skills-header">
            <div>
              <span className="section-label">Tech stack</span>
              <div className="section-heading-block">
                <h2 className="section-heading">
                  Technologies <span>I Work With</span>
                </h2>
                <HeaderSparkles />
              </div>
            </div>
            <div className="skills-header-right">
              <p className="skills-description">
                Technologies and tools I use to design, build, and deploy modern web applications.
              </p>
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

          <div 
            className="skills-grid" 
            ref={gridRef}
            onMouseMove={handleMouseMove}
          >
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

                <p className="skill-card-summary">{cat.summary}</p>

                <div className="skill-card-divider" />

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
