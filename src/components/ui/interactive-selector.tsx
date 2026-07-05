import { cloneElement, useEffect, useState } from 'react';
import type { KeyboardEvent, ReactElement } from 'react';
import './interactive-selector.css';
import { ArrowLeftIcon, ArrowRightIcon, ExternalArrowIcon } from '../SiteIcons';

export interface InteractiveSelectorOption {
  title: string;
  subtitle?: string;
  meta?: string;
  image: string;
  icon: ReactElement<any>;
  stats?: string;
  description: string;
  tags?: string[];
  url?: string;
}

interface InteractiveSelectorProps {
  options?: InteractiveSelectorOption[];
}

const clampProjectIndex = (index: number, total: number) => (
  (index + total) % total
);

export default function InteractiveSelector({ options = [] }: InteractiveSelectorProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [animatedOptions, setAnimatedOptions] = useState<number[]>([]);
  const optionCount = options.length;
  const activeOption = options[activeIndex];

  useEffect(() => {
    const timers: ReturnType<typeof setTimeout>[] = [];
    setAnimatedOptions([]);

    options.forEach((_, index) => {
      const timer = setTimeout(() => {
        setAnimatedOptions((current) => [...current, index]);
      }, 90 * index);
      timers.push(timer);
    });

    return () => timers.forEach((timer) => clearTimeout(timer));
  }, [options]);

  if (!optionCount || !activeOption) return null;

  const previousProject = options[clampProjectIndex(activeIndex - 1, optionCount)];
  const nextProject = options[clampProjectIndex(activeIndex + 1, optionCount)];
  const showProject = (index: number) => setActiveIndex(clampProjectIndex(index, optionCount));
  const showPreviousProject = () => showProject(activeIndex - 1);
  const showNextProject = () => showProject(activeIndex + 1);

  const handleProjectKeyDown = (event: KeyboardEvent<HTMLButtonElement>, index: number) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      showProject(index);
      return;
    }

    if (event.key === 'ArrowDown' || event.key === 'ArrowRight') {
      event.preventDefault();
      showProject(index + 1);
    }

    if (event.key === 'ArrowUp' || event.key === 'ArrowLeft') {
      event.preventDefault();
      showProject(index - 1);
    }
  };

  return (
    <div className="project-selector">
      <div className="project-selector-list" role="tablist" aria-label="Choose project">
        {options.map((option, index) => {
          const isActive = activeIndex === index;

          return (
            <button
              key={option.title}
              type="button"
              role="tab"
              id={`project-tab-${index}`}
              aria-selected={isActive}
              aria-controls={`project-panel-${index}`}
              className={[
                'project-selector-item',
                isActive ? 'active' : '',
                animatedOptions.includes(index) ? 'is-visible' : '',
              ].filter(Boolean).join(' ')}
              onClick={() => showProject(index)}
              onKeyDown={(event) => handleProjectKeyDown(event, index)}
            >
              <span className="project-selector-icon">
                {cloneElement(option.icon, { size: 20 })}
              </span>
              <span className="project-selector-copy">
                <span className="project-selector-index">{String(index + 1).padStart(2, '0')}</span>
                <span className="project-selector-title">{option.title}</span>
                {option.meta && <span className="project-selector-meta">{option.meta}</span>}
              </span>
            </button>
          );
        })}
      </div>

      <article
        className="project-preview"
        id={`project-panel-${activeIndex}`}
        aria-labelledby={`project-tab-${activeIndex}`}
        role="tabpanel"
        key={activeOption.title}
      >
        <div className="project-preview-media">
          <img src={activeOption.image} alt={`${activeOption.title} project screenshot`} />
        </div>

        <div className="project-preview-content">
          <div className="project-preview-heading">
            <span className="project-preview-mark">
              {cloneElement(activeOption.icon, { size: 22 })}
            </span>
            <div>
              <span className="project-preview-kicker">{activeOption.subtitle || activeOption.meta}</span>
              <h3>{activeOption.title}</h3>
            </div>
          </div>

          {activeOption.stats && (
            <p className="project-preview-stat">{activeOption.stats}</p>
          )}

          <p className="project-preview-description">{activeOption.description}</p>

          {activeOption.tags && (
            <ul className="project-preview-tags" aria-label={`${activeOption.title} technologies`}>
              {activeOption.tags.slice(0, 8).map((tag) => (
                <li key={tag}>{tag}</li>
              ))}
            </ul>
          )}

          <div className="project-preview-footer">
            {activeOption.url && (
              <a className="project-preview-link" href={activeOption.url} target="_blank" rel="noopener noreferrer">
                View project
                <ExternalArrowIcon size={15} />
              </a>
            )}

            <div className="project-preview-controls" role="group" aria-label="Project navigation">
              <button
                type="button"
                className="project-preview-nav-button"
                onClick={showPreviousProject}
                aria-label={`Show previous project: ${previousProject.title}`}
                title={`Previous: ${previousProject.title}`}
              >
                <ArrowLeftIcon size={16} />
                <span>Previous</span>
              </button>
              <button
                type="button"
                className="project-preview-nav-button project-preview-nav-button--next"
                onClick={showNextProject}
                aria-label={`Show next project: ${nextProject.title}`}
                title={`Next: ${nextProject.title}`}
              >
                <span>Next</span>
                <ArrowRightIcon size={16} />
              </button>
            </div>
          </div>
        </div>
      </article>
    </div>
  );
}
