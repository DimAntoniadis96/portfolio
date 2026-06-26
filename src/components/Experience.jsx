import { useFadeIn } from '../hooks/useFadeIn';
import './Experience.css';

const EXPERIENCES = [
  {
    title: 'Co-owner & Frontend Developer',
    company: 'study-saga.com',
    companyUrl: 'https://study-saga.com',
    period: 'January 2025 – Present',
    location: 'Remote',
    type: 'current',
    highlights: [
      'Built responsive user interfaces with React, TypeScript, Tailwind CSS and Framer Motion',
      'Integrated Discord Embedded App SDK with Clerk authentication, enabling the platform to run as a Discord Activity',
      'Designed and implemented real-time collaborative study rooms with live chat, social presence and synchronized group timers using Convex',
      'Built gamification features including XP/leveling, quests, virtual currency, in-app shop, referral program and daily rewards',
      'Used PostHog, Sentry, GrowthBook and Cloudflare R2 for analytics, monitoring, feature rollouts and asset delivery',
    ],
  },
  {
    title: 'Customer Service Representative',
    company: 'CQS – Public Power Corporation Project',
    period: 'April 2026 – Present',
    location: 'Remote',
    type: 'current',
    highlights: [
      'Provide inbound customer service and support for customers of Public Power Corporation (PPC/DEI)',
      'Record customer interactions accurately and manage customer data in CRM system',
    ],
  },
  {
    title: 'Data Quality Control Specialist',
    company: 'Archeiothiki – National Cadastre Project',
    period: 'February 2025 – April 2026',
    location: 'Thessaloniki, Greece',
    highlights: [
      'Performed quality control checks on digitized legal and land registry documents',
      'Reviewed and verified data entries to identify inconsistencies and improve accuracy',
    ],
  },
  {
    title: 'Sales & Event Operations Coordinator',
    company: 'Athinaikon Luxury Design',
    period: 'April 2022 – January 2025',
    location: 'Thessaloniki, Greece',
    highlights: [
      'Managed client communication, sales discussions and event bookings for high-profile private clients, business owners and public-sector projects',
      'Coordinated event planning and execution from initial request to final delivery',
    ],
  },
  {
    title: 'Delivery Associate',
    company: 'Amazon',
    period: 'June 2019 – March 2020',
    location: 'Munich, Germany',
    highlights: [
      'Managed daily delivery routes and completed deliveries in a fast-paced, time-sensitive environment',
      'Worked independently while maintaining reliability and a high standard of customer service',
    ],
  },
];

export default function Experience() {
  const { ref, isVisible } = useFadeIn();

  return (
    <section className="experience section" id="experience">
      <div className="container">
        <div ref={ref} className={`fade-in ${isVisible ? 'visible' : ''}`}>
          <div className="experience-header">
            <span className="section-label">Experience</span>
            <h2 className="section-heading">Where I've worked</h2>
            <p>My professional journey — from logistics to software development.</p>
          </div>

          <div className="experience-timeline">
            {EXPERIENCES.map((exp, i) => (
              <div className="experience-item glass-card" key={i}>
                <div className="experience-item-header">
                  <div className="experience-item-left">
                    <h3 className="experience-item-title">{exp.title}</h3>
                    <span className="experience-item-company">
                      {exp.companyUrl ? (
                        <a href={exp.companyUrl} target="_blank" rel="noopener noreferrer">
                          {exp.company}
                        </a>
                      ) : (
                        exp.company
                      )}
                    </span>
                  </div>
                  <div className="experience-item-right">
                    {exp.type === 'current' && <span className="experience-current-badge">Current</span>}
                    <span className="experience-item-period">{exp.period}</span>
                    <span className="experience-item-location">{exp.location}</span>
                  </div>
                </div>
                <ul className="experience-item-highlights">
                  {exp.highlights.map((h, j) => (
                    <li key={j}>{h}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
