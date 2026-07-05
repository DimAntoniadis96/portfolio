import { useFadeIn } from '../hooks/useFadeIn';
import './Work.css';
import InteractiveSelector from './ui/interactive-selector';
import { AcademyIcon, GameIcon, HospitalityIcon, StudySagaIcon } from './SiteIcons';

const PROJECTS = [
  {
    featured: true,
    badge: 'Featured',
    stats: '40K users reached',
    title: 'Study Saga',
    subtitle: 'Lofi Pomodoro & Study Timer',
    meta: 'Web, Desktop & Discord Platform',
    image: {
      src: '/projects/study-saga.jpg',
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
      src: '/projects/pox-academy.jpg',
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
      src: '/projects/routina.jpg',
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
  {
    badge: 'Desktop Game',
    title: 'Pong',
    subtitle: 'Classic 2D Arcade Game',
    meta: 'Python & Pygame',
    image: {
      src: '/projects/pong.png',
      alt: 'Pong game screenshot',
      ratio: '2850 / 1350',
    },
    description:
      'A fully functional 2D recreation of the classic Pong game built with Python. Simply download and run the .exe file to play instantly without any setup.',
    tech: ['Python', 'Pygame', 'OOP', 'Game Development'],
    links: {
      website: 'https://github.com/DimAntoniadis96/Pong-game',
    },
  },
];

export default function Work() {
  const { ref, isVisible } = useFadeIn();

  const interactiveOptions = PROJECTS.map((project, index) => {
    let Icon = StudySagaIcon;
    if (index === 1) Icon = AcademyIcon;
    else if (index === 2) Icon = HospitalityIcon;
    else if (index === 3) Icon = GameIcon;

    return {
      title: project.title,
      subtitle: project.subtitle,
      meta: project.meta,
      description: project.description,
      image: project.image.src,
      icon: <Icon size={22} />,
      url: project.links.website,
      stats: project.stats,
      tags: project.tech
    };
  });

  return (
    <section className="work section" id="work">
      <div className="container">
        <div ref={ref} className={`fade-in ${isVisible ? 'visible' : ''}`}>
          <div className="work-header">
            <div>
              <span className="section-label">Work</span>
              <h2 className="section-heading">What I've Built</h2>
            </div>
            <p>Selected products and client websites I've designed, built, and shipped.</p>
          </div>

          <div className="work-selector-shell">
            <InteractiveSelector options={interactiveOptions} />
          </div>
        </div>
      </div>
    </section>
  );
}
