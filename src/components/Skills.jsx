import { useFadeIn } from '../hooks/useFadeIn';
import './Skills.css';

const SKILL_CATEGORIES = [
  {
    title: 'Interface',
    summary: 'Polished, responsive UI with typed components and careful motion.',
    skills: [
      'React',
      'TypeScript',
      'JavaScript',
      'HTML5',
      'CSS3',
      'Tailwind CSS',
      'Framer Motion',
    ],
  },
  {
    title: 'State & data',
    summary: 'Fast data flows, small stores, and API layers that stay readable.',
    skills: [
      'React Query',
      'Zustand',
      'API Integration',
    ],
  },
  {
    title: 'Services',
    summary: 'Auth, realtime data, databases, and the backend pieces that make apps real.',
    skills: [
      'Python',
      'C',
      'Convex',
      'Supabase',
      'Clerk',
      'Discord SDK',
      'PostgreSQL',
    ],
  },
  {
    title: 'Ship & observe',
    summary: 'Versioning, deployment, testing, analytics, and the feedback loop after launch.',
    skills: [
      'Git',
      'GitHub',
      'Docker',
      'Vercel',
      'Vitest',
      'Playwright',
      'PostHog',
      'Sentry',
      'Godot Engine',
    ],
  },
];

export default function Skills() {
  const { ref, isVisible } = useFadeIn();

  return (
    <section className="skills section" id="skills">
      <div className="container">
        <div ref={ref} className={`fade-in ${isVisible ? 'visible' : ''}`}>
          <div className="skills-header">
            <div>
              <span className="section-label">TECH STACK</span>
              <h2 className="section-heading">
                Technologies <span>I Work With</span>
              </h2>
            </div>
            <p className="skills-description">
              Technologies and tools I use to design, build, and deploy modern web applications.
            </p>
          </div>

          <div className="toolkit-stage" aria-label="Skill toolkit">
            <div className="toolkit-signal" aria-hidden="true">
              <span>Plan</span>
              <span>Build</span>
              <span>Ship</span>
              <span>Learn</span>
            </div>

            <div className="toolkit-rows">
              {SKILL_CATEGORIES.map((cat, index) => (
                <article className="toolkit-row" key={cat.title}>
                  <div className="toolkit-row-meta">
                    <span className="toolkit-row-index">
                      {String(index + 1).padStart(2, '0')}
                    </span>
                    <h3 className="category-title">{cat.title}</h3>
                  </div>
                  <p className="category-summary">{cat.summary}</p>

                  <ul className="toolkit-tools" aria-label={`${cat.title} technologies`}>
                    {cat.skills.map((skill) => (
                      <li className="toolkit-tool" key={skill}>
                        {skill}
                      </li>
                    ))}
                  </ul>
                </article>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
