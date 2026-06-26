import { useFadeIn } from '../hooks/useFadeIn';
import './Education.css';

const EDUCATION = [
  {
    degree: 'Bachelor of Computer Science',
    institution: 'Hellenic Open University',
    period: '2024 – Present',
    location: 'Patras, Greece',
    current: true,
  },
  {
    degree: 'Foundation Program in Music Technology & Sound Engineering',
    institution: 'AKMI',
    period: '2016 – 2018',
    location: 'Thessaloniki, Greece',
    current: false,
  },
];

const LANGUAGES = [
  { language: 'Greek', level: 'Native' },
  { language: 'English', level: 'B2' },
];

export default function Education() {
  const { ref, isVisible } = useFadeIn();

  return (
    <section className="education section" id="education">
      <div className="container">
        <div ref={ref} className={`fade-in ${isVisible ? 'visible' : ''}`}>
          <div className="education-grid">
            {/* Education Column */}
            <div className="education-column">
              <span className="section-label">Education</span>
              <h2 className="section-heading">Academic background</h2>

              <div className="education-items">
                {EDUCATION.map((edu, i) => (
                  <div className="education-item glass-card" key={i}>
                    <div className="education-item-header">
                      <h3 className="education-item-degree">{edu.degree}</h3>
                      {edu.current && <span className="education-current-badge">In Progress</span>}
                    </div>
                    <span className="education-item-institution">{edu.institution}</span>
                    <div className="education-item-meta">
                      <span>{edu.period}</span>
                      <span className="education-item-divider">·</span>
                      <span>{edu.location}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Languages Column */}
            <div className="languages-column">
              <span className="section-label">Languages</span>
              <h2 className="section-heading">I speak</h2>

              <div className="languages-items">
                {LANGUAGES.map((lang, i) => (
                  <div className="language-item glass-card" key={i}>
                    <span className="language-name">{lang.language}</span>
                    <span className="language-level badge">{lang.level}</span>
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
