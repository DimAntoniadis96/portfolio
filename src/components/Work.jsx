import { useFadeIn } from '../hooks/useFadeIn';
import './Work.css';

const PROJECTS = [
  {
    featured: true,
    badge: 'Featured · Production',
    stats: '40K+ users',
    title: 'Study Saga',
    subtitle: 'Co-owner & Frontend Developer · January 2025 – present',
    meta: 'Web & Discord Platform',
    description:
      'Production platform serving 40,000+ users across web and Discord, with a mobile app in development. Features real-time collaborative study rooms with live chat, social presence and synchronized group timers, gamification (XP/leveling, quests, virtual currency, in-app shop, referral program, daily rewards), and full Discord Activity integration via Clerk auth.',
    tech: ['React', 'TypeScript', 'Tailwind CSS', 'Framer Motion', 'Convex', 'Clerk', 'Discord SDK', 'PostHog', 'Sentry', 'GrowthBook', 'Cloudflare R2'],
    links: {
      website: 'https://study-saga.com',
    },
    highlights: [
      'Built responsive UIs with React, TypeScript, Tailwind CSS & Framer Motion',
      'Integrated Discord Embedded App SDK with Clerk authentication',
      'Designed real-time collaborative study rooms using Convex',
      'Built gamification features: XP/leveling, quests, virtual currency & shop',
      'Used PostHog, Sentry, GrowthBook & Cloudflare R2 for analytics and delivery',
    ],
  },
];

export default function Work() {
  const { ref, isVisible } = useFadeIn();

  return (
    <section className="work section" id="work">
      <div className="container">
        <div ref={ref} className={`fade-in ${isVisible ? 'visible' : ''}`}>
          <div className="work-header">
            <span className="section-label">Work</span>
            <h2 className="section-heading">What I've built</h2>
            <p>My flagship project — a production platform serving tens of thousands of users.</p>
          </div>

          <div className="work-grid">
            {PROJECTS.map((project) => (
              <div
                className={`project-card glass-card ${project.featured ? 'featured' : ''}`}
                key={project.title}
              >
                <div className="project-header-area">
                  <div className="project-header-badges">
                    {project.badge && (
                      <span className="project-featured-badge">{project.badge}</span>
                    )}
                    {project.stats && (
                      <span className="project-stats-badge">{project.stats}</span>
                    )}
                  </div>
                </div>

                <div className="project-body">
                  <span className="project-meta">{project.meta}</span>
                  <h3 className="project-title">{project.title}</h3>
                  <span className="project-subtitle">{project.subtitle}</span>
                  <p className="project-desc">{project.description}</p>

                  {project.highlights && (
                    <ul className="project-highlights">
                      {project.highlights.map((h, i) => (
                        <li key={i}>{h}</li>
                      ))}
                    </ul>
                  )}

                  <div className="project-tech">
                    {project.tech.map((t) => (
                      <span className="badge" key={t}>{t}</span>
                    ))}
                  </div>

                  <div className="project-actions">
                    {project.links.website && (
                      <a href={project.links.website} className="btn btn-primary" target="_blank" rel="noopener noreferrer">
                        Visit website
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M7 17L17 7M17 7H7M17 7v10" />
                        </svg>
                      </a>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
