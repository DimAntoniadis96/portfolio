import { useState } from 'react';
import { useFadeIn } from '../hooks/useFadeIn';
import './Experience.css';
import { ArrowLeftIcon, ArrowRightIcon, ExternalArrowIcon } from './SiteIcons';

const EXPERIENCES = [
  {
    title: 'Co-owner & Frontend Developer',
    company: 'study-saga.com',
    companyUrl: 'https://study-saga.com',
    period: 'Jan 2025 – Present',
    location: 'Remote',
    type: 'current',
    tags: ['React', 'TypeScript', 'Convex', 'Clerk', 'Discord SDK'],
    summary: 'Built and shipped a production platform serving 40,000+ users across web, desktop, and Discord. Led all frontend development — from responsive UIs and real-time collaboration to gamification, analytics, and feature rollouts.',
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



function getExperienceMeta(experience) {
  return [experience.period, experience.location].filter(Boolean).join(' · ');
}

export default function Experience() {
  const { ref, isVisible } = useFadeIn();
  const [activeIndex, setActiveIndex] = useState(0);
  const [direction, setDirection] = useState(1);

  const activeExperience = EXPERIENCES[activeIndex];

  const handleNext = () => {
    setDirection(1);
    setActiveIndex((currentIndex) => (currentIndex + 1) % EXPERIENCES.length);
  };

  const handlePrev = () => {
    setDirection(-1);
    setActiveIndex((currentIndex) => (
      currentIndex - 1 + EXPERIENCES.length
    ) % EXPERIENCES.length);
  };

  const handleTabClick = (index) => {
    if (index === activeIndex) return;

    setDirection(index > activeIndex ? 1 : -1);
    setActiveIndex(index);
  };



  return (
    <section className="experience section" id="experience">
      <div className="container">
        <div ref={ref} className={`fade-in ${isVisible ? 'visible' : ''}`}>
          <div className="experience-header">
            <span className="section-label">Experience</span>
            <h2 className="section-heading">Where I've Worked</h2>
          </div>

          <div className="experience-tabs">
            <div className="experience-tabs-list" aria-label="Experience timeline">
              {EXPERIENCES.map((experience, index) => {
                const isActive = activeIndex === index;

                return (
                  <button
                    type="button"
                    className={`experience-tab ${isActive ? 'active' : ''}`}
                    onClick={() => handleTabClick(index)}
                    aria-pressed={isActive}
                    key={`${experience.company}-${experience.title}`}
                  >
                    <span className="experience-tab-index">/{String(index + 1).padStart(2, '0')}</span>
                    <span className="experience-tab-copy">
                      <span className="experience-tab-title">{experience.title}</span>
                      <span className="experience-tab-company">{experience.company}</span>
                    </span>
                  </button>
                );
              })}
            </div>

            <article
              className={`experience-panel ${direction > 0 ? 'from-next' : 'from-prev'}`}
              key={`${activeExperience.company}-${activeExperience.title}`}
            >
              <div className="experience-panel-inner">
                <div className="experience-panel-topline">
                  <span>{getExperienceMeta(activeExperience)}</span>
                  {activeExperience.type === 'current' && (
                    <span className="experience-current-badge">
                      <span className="experience-current-dot" />
                      Current
                    </span>
                  )}
                </div>

                <div className="experience-panel-main">
                  <span className="experience-panel-number">{String(activeIndex + 1).padStart(2, '0')}</span>
                  <div>
                    <h3>{activeExperience.title}</h3>
                    <p className="experience-panel-company">
                      {activeExperience.companyUrl ? (
                        <a href={activeExperience.companyUrl} target="_blank" rel="noopener noreferrer">
                          {activeExperience.company}
                          <ExternalArrowIcon size={14} />
                        </a>
                      ) : (
                        activeExperience.company
                      )}
                    </p>
                  </div>
                </div>

                <p className="experience-panel-summary">{activeExperience.summary}</p>

                <div className="experience-panel-tags">
                  {activeExperience.tags.map((tag) => (
                    <span className="experience-panel-tag" key={tag}>{tag}</span>
                  ))}
                </div>

                <div className="experience-panel-actions">
                  <button type="button" onClick={handlePrev} aria-label="Previous experience">
                    <ArrowLeftIcon size={17} />
                  </button>
                  <button type="button" onClick={handleNext} aria-label="Next experience">
                    <ArrowRightIcon size={17} />
                  </button>
                </div>
              </div>
            </article>
          </div>
        </div>
      </div>
    </section>
  );
}
