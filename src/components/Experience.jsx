import { useFadeIn } from '../hooks/useFadeIn';
import './Experience.css';

const EXPERIENCES = [
  {
    title: 'Co-owner & Frontend Developer',
    company: 'study-saga.com',
    companyUrl: 'https://study-saga.com',
    period: 'Jan 2025 – Present',
    location: 'Remote',
    type: 'current',
    tags: ['React', 'TypeScript', 'Convex', 'Clerk', 'Discord SDK'],
    summary: 'Built and shipped a production platform serving 40,000+ users across web and Discord. Led all frontend development — from responsive UIs and real-time collaboration to gamification, analytics, and feature rollouts.',
  },
  {
    title: 'Customer Service Representative',
    company: 'CQS – Public Power Corporation',
    period: 'Apr 2026 – Present',
    location: 'Remote',
    type: 'current',
    tags: ['CRM', 'Communication'],
    summary: 'Providing inbound customer service and support, managing customer data in CRM systems for one of Greece\'s largest utilities.',
  },
  {
    title: 'Data Quality Control Specialist',
    company: 'Archeiothiki – National Cadastre',
    period: 'Feb 2025 – Apr 2026',
    location: 'Thessaloniki',
    tags: ['Quality Control', 'Data Verification'],
    summary: 'Performed quality control on digitized legal and land registry documents, reviewed and verified data entries to improve accuracy across the national cadastre project.',
  },
  {
    title: 'Sales & Event Operations Coordinator',
    company: 'Athinaikon Luxury Design',
    period: 'Apr 2022 – Jan 2025',
    location: 'Thessaloniki',
    tags: ['Sales', 'Event Planning', 'Client Relations'],
    summary: 'Managed client communication, sales discussions and end-to-end event planning for high-profile private and public-sector clients.',
  },
  {
    title: 'Delivery Associate',
    company: 'Amazon',
    period: 'Jun 2019 – Mar 2020',
    location: 'Munich, Germany',
    tags: ['Logistics', 'Operations'],
    summary: 'Managed daily delivery routes in a fast-paced, time-sensitive environment while maintaining high standards of reliability and customer service.',
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
            <h2 className="section-heading">Where I've Worked</h2>
          </div>

          <div className="exp-zigzag">
            {/* Central vertical line */}
            <div className="exp-center-line" />

            {EXPERIENCES.map((exp, i) => {
              const isLeft = i % 2 === 0;
              return (
                <div className={`exp-zrow ${isLeft ? 'left' : 'right'}`} key={i}>
                  {/* Dot on the center line */}
                  <div className="exp-zdot-wrapper">
                    <div className={`exp-zdot ${exp.type === 'current' ? 'pulse' : ''}`} />
                  </div>

                  {/* Card */}
                  <div className="exp-zcard">
                    <span className="exp-zperiod">{exp.period} · {exp.location}</span>
                    <div className="exp-zcard-top">
                      <h3 className="exp-ztitle">{exp.title}</h3>
                      {exp.type === 'current' && (
                        <span className="exp-zbadge">
                          <span className="exp-zbadge-dot" />
                          Current
                        </span>
                      )}
                    </div>
                    <span className="exp-zcompany">
                      {exp.companyUrl ? (
                        <a href={exp.companyUrl} target="_blank" rel="noopener noreferrer">
                          {exp.company} ↗
                        </a>
                      ) : (
                        exp.company
                      )}
                    </span>
                    <p className="exp-zsummary">{exp.summary}</p>
                    <div className="exp-ztags">
                      {exp.tags.map((tag) => (
                        <span className="exp-ztag" key={tag}>{tag}</span>
                      ))}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
