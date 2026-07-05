import './Footer.css';
import { GitHubIcon, LinkedInIcon, MailIcon } from './SiteIcons';

export default function Footer() {
  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-content">
          <span className="footer-name">~ Dimitrios Antoniadis ~</span>

          <div className="footer-socials">
            <a href="https://github.com/DimAntoniadis96" target="_blank" rel="noopener noreferrer" className="social-icon" aria-label="GitHub">
              <GitHubIcon />
            </a>
            <a href="https://linkedin.com/in/dim-antoniadis-dev/" target="_blank" rel="noopener noreferrer" className="social-icon" aria-label="LinkedIn">
              <LinkedInIcon />
            </a>
            <a href="mailto:dim.antoniadis.dev@gmail.com" className="social-icon" aria-label="Email">
              <MailIcon />
            </a>
          </div>

          <p className="footer-copy">
            © {new Date().getFullYear()} Dimitrios Antoniadis. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
