import { useFadeIn } from '../hooks/useFadeIn';
import './Skills.css';

const SKILL_CATEGORIES = [
  {
    title: 'Languages',
    description: 'Core programming languages I build with daily.',
    skills: ['TypeScript', 'JavaScript', 'Python', 'C'],
  },
  {
    title: 'Frontend & UI',
    description: 'Responsive interfaces and modern design systems.',
    skills: ['React', 'HTML5', 'CSS3', 'Tailwind CSS', 'Framer Motion'],
  },
  {
    title: 'State, Data & APIs',
    description: 'Data flow, state management and API layer.',
    skills: ['React Query', 'Zustand', 'API Integration'],
  },
  {
    title: 'Backend & Services',
    description: 'Server-side logic, auth, and platform services.',
    skills: ['Convex', 'Supabase', 'Clerk', 'Discord Embedded SDK'],
  },
  {
    title: 'Databases',
    description: 'Storage layers for production application data.',
    skills: ['PostgreSQL'],
  },
  {
    title: 'Testing & QA',
    description: 'Automated testing for quality and reliability.',
    skills: ['Vitest', 'Playwright'],
  },
  {
    title: 'Tools & Deployment',
    description: 'Version control, CI/CD, hosting and analytics.',
    skills: ['Git', 'GitHub', 'Docker', 'Vercel', 'PostHog', 'Sentry', 'GrowthBook', 'Cloudflare R2'],
  },
  {
    title: 'Additional',
    description: 'Other technologies I explore and work with.',
    skills: ['Godot Engine'],
  },
];

export default function Skills() {
  const { ref, isVisible } = useFadeIn();

  return (
    <section className="skills section" id="skills">
      <div className="container">
        <div ref={ref} className={`fade-in ${isVisible ? 'visible' : ''}`}>
          <div className="skills-header">
            <span className="section-label">Skill Tree</span>
            <h2 className="section-heading">The tools behind the work</h2>
            <p>
              Technologies I use in production every day, grouped by domain.
            </p>
          </div>

          <div className="skills-grid">
            {SKILL_CATEGORIES.map((cat) => (
              <div className="skill-card glass-card" key={cat.title}>
                <div className="skill-card-header">
                  <span className="skill-card-title">{cat.title}</span>
                  <span className="skill-card-count">{cat.skills.length}</span>
                </div>
                <p className="skill-card-desc">{cat.description}</p>
                <div className="skill-badges">
                  {cat.skills.map((skill) => (
                    <span className="badge" key={skill}>{skill}</span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
