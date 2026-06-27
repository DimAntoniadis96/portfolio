import { useFadeIn } from '../hooks/useFadeIn';
import './Education.css';

const EDUCATION = [
  {
    degree: 'BSc in Computer Science',
    institution: 'Hellenic Open University',
    period: '2024 – Present',
    location: 'Patras, Greece',
    current: true,
  },
  {
    degree: 'Diploma in Music Technology & Sound Engineering',
    institution: 'AKMI',
    period: '2016 – 2018',
    location: 'Thessaloniki, Greece',
    current: false,
    skills: ['Sound Recording', 'Sound Design', 'Mixing', 'Mastering'],
  },
];

const LANGUAGES = [
  { language: 'Greek', level: 'Native', percentage: 100 },
  { language: 'English', level: 'B2', percentage: 75 },
];

export default function Education() {
  const { ref, isVisible } = useFadeIn();

  return (
    <section className="education section" id="education">
      <div className="container">
        <div ref={ref} className={`fade-in ${isVisible ? 'visible' : ''}`}>
          <div className="edu-split">
            {/* Left column: Education */}
            <div className="edu-col">
              <span className="section-label">Education</span>
              <h2 className="section-heading">Education</h2>

              <div className="edu-cards">
                {EDUCATION.map((edu, i) => (
                  <div className="edu-card" key={i}>
                    <div className="edu-card-accent" />
                    <div className="edu-card-body">
                      <div className="edu-card-top">
                        <h3 className="edu-degree">{edu.degree}</h3>
                        {edu.current && (
                          <span className="edu-badge">
                            <span className="edu-badge-dot" />
                            In Progress
                          </span>
                        )}
                      </div>
                      <span className="edu-institution">{edu.institution}</span>
                      <div className="edu-meta">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                          <line x1="16" y1="2" x2="16" y2="6"></line>
                          <line x1="8" y1="2" x2="8" y2="6"></line>
                          <line x1="3" y1="10" x2="21" y2="10"></line>
                        </svg>
                        <span>{edu.period}</span>
                        <span className="edu-meta-sep">·</span>
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                          <circle cx="12" cy="10" r="3"></circle>
                        </svg>
                        <span>{edu.location}</span>
                      </div>
                      {edu.skills && edu.skills.length > 0 && (
                        <div className="edu-skills">
                          {edu.skills.map((skill) => (
                            <span className="edu-skill-tag" key={skill}>{skill}</span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Right column: Languages */}
            <div className="lang-col">
              <span className="section-label">Languages</span>
              <h2 className="section-heading">Languages</h2>

              <div className="lang-cards">
                {LANGUAGES.map((lang, i) => (
                  <div className="lang-card" key={i}>
                    <div className="lang-top">
                      <span className="lang-name">{lang.language}</span>
                      <span className="lang-level">{lang.level}</span>
                    </div>
                    <div className="lang-bar-track">
                      <div 
                        className="lang-bar-fill" 
                        style={{ width: `${lang.percentage}%` }} 
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
