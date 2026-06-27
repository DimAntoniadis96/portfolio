import { useFadeIn } from '../hooks/useFadeIn';
import './Work.css';

const PROJECTS = [
  {
    featured: true,
    badge: 'Featured',
    stats: '40K users reached',
    title: 'Study Saga',
    subtitle: 'Lofi Pomodoro & Study Timer · 2025 – present',
    meta: 'Web & Discord Platform',
    image: {
      src: '/projects/study-saga.png',
      alt: 'Study Saga landing page with a lofi pomodoro study timer hero',
      ratio: '2856 / 1498',
    },
    description:
      'A lo-fi Pomodoro study timer with a game layer on top. Earn XP, level up, and study alongside thousands of other students.',
    tech: ['React', 'Tailwind', 'TypeScript', 'Convex', 'Cloudflare R2', 'GitHub Actions', 'Docker', 'Vite', 'DataDog', 'Discord.js', 'PostHog', 'GrowthBook', 'Vercel', 'Sentry'],
    links: {
      website: 'https://study-saga.com',
    },
  },
  {
    badge: 'Client Website',
    title: 'POX Academy',
    subtitle: 'Football academy website',
    meta: 'Sports Academy Landing Page',
    image: {
      src: '/projects/pox-academy.png',
      alt: 'POX Academy football academy landing page',
      ratio: '2864 / 1472',
    },
    description:
      'A Greek football academy website for Π.Ο. Ξηροκρήνης with programs, schedules, registration calls to action, and clear information for parents.',
    tech: ['Responsive UI', 'Greek Content', 'Sports Academy', 'Vercel', 'Contact Flow'],
    links: {
      website: 'https://pox-academy2.vercel.app/',
    },
  },
  {
    badge: 'Restaurant Website',
    title: 'Routina',
    subtitle: 'Cocktail & pizza bar landing page',
    meta: 'Hospitality Landing Page',
    image: {
      src: '/projects/routina.png',
      alt: 'Routina cocktail and pizza bar landing page',
      fit: 'contain',
      ratio: '2850 / 1350',
    },
    description:
      'A restaurant landing page for Routina Cocktail & Pizza Bar, presenting wood-fired pizza, cocktails, menu highlights, opening hours, and the brand atmosphere.',
    tech: ['Next.js', 'Responsive UI', 'Menu Design', 'Greek Content', 'Vercel'],
    links: {
      website: 'https://routina-landing-page.vercel.app/',
    },
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
            <p>Selected products and client websites I've designed, built, and shipped.</p>
          </div>

          <div className="work-grid">
            {PROJECTS.map((project) => (
              <div
                className={`project-card glass-card ${project.featured ? 'featured' : ''}`}
                key={project.title}
              >
                {project.image && (
                  <div
                    className="project-media"
                    style={{ aspectRatio: project.image.ratio }}
                  >
                    <img
                      src={project.image.src}
                      alt={project.image.alt}
                      className={project.image.fit === 'contain' ? 'contain' : undefined}
                      loading="lazy"
                      decoding="async"
                    />
                  </div>
                )}

                <div className="project-body">
                  <div className="project-header-badges">
                    {project.badge && (
                      <span className="project-featured-badge">{project.badge}</span>
                    )}
                    {project.stats && (
                      <span className="project-stats-badge">{project.stats}</span>
                    )}
                  </div>

                  <span className="project-meta">{project.meta}</span>
                  <h3 className="project-title">{project.title}</h3>
                  <span className="project-subtitle">{project.subtitle}</span>
                  <p className="project-desc">{project.description}</p>

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
