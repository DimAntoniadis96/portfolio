import { useFadeIn } from '../hooks/useFadeIn';
import './Contact.css';
import { ArrowRightIcon, ExternalArrowIcon, GitHubIcon, LinkedInIcon, MailIcon, PhoneIcon, PinIcon } from './SiteIcons';

const CONTACT_LINKS = [
  {
    label: 'Email',
    value: 'dim.antoniadis.dev@gmail.com',
    href: 'mailto:dim.antoniadis.dev@gmail.com',
    icon: <MailIcon />,
  },
  {
    label: 'Phone',
    value: '+30 6976825450',
    href: 'tel:+306976825450',
    icon: <PhoneIcon />,
  },
  {
    label: 'Location',
    value: 'Thessaloniki, Greece',
    href: 'https://www.google.com/maps/search/?api=1&query=Thessaloniki%2C%20Greece',
    icon: <PinIcon />,
  },
];

const SOCIALS = [
  {
    label: 'GitHub',
    href: 'https://github.com/DimAntoniadis96',
    icon: <GitHubIcon />,
  },
  {
    label: 'LinkedIn',
    href: 'https://linkedin.com/in/dim-antoniadis-dev/',
    icon: <LinkedInIcon />,
  },
];

export default function Contact() {
  const { ref, isVisible } = useFadeIn();

  return (
    <section className="contact section" id="contact">
      <div className="container">
        <div ref={ref} className={`fade-in ${isVisible ? 'visible' : ''}`}>
          <div className="contact-layout">
            {/* Left: Headline + CTA */}
            <div className="contact-left">
              <span className="section-label">Contact</span>
              <h2 className="contact-heading">Let's Build<br />Something <span className="heading-accent">Together</span></h2>
              <p className="contact-text">
                I'm always open to new opportunities, collaborations, or just a
                friendly conversation about tech. Feel free to reach out.
              </p>
              <div className="contact-actions">
                <a href="mailto:dim.antoniadis.dev@gmail.com" className="btn btn-primary">
                  Get in touch
                  <ArrowRightIcon size={16} />
                </a>
                <div className="contact-socials">
                  {SOCIALS.map((social) => (
                    <a 
                      key={social.label}
                      href={social.href} 
                      target="_blank" 
                      rel="noopener noreferrer" 
                      className="social-icon" 
                      aria-label={social.label}
                    >
                      {social.icon}
                    </a>
                  ))}
                </div>
              </div>
            </div>

            {/* Right: Contact Info Cards */}
            <div className="contact-right">
              {CONTACT_LINKS.map((link) => {
                const Wrapper = link.href ? 'a' : 'div';
                const isExternal = link.href?.startsWith('http');
                const wrapperProps = link.href
                  ? {
                      href: link.href,
                      'aria-label': `${link.label}: ${link.value}`,
                      ...(isExternal ? { target: '_blank', rel: 'noopener noreferrer' } : {}),
                    }
                  : {};

                return (
                  <Wrapper className="contact-info-card" key={link.label} {...wrapperProps}>
                    <div className="contact-info-icon">{link.icon}</div>
                    <div className="contact-info-text">
                      <span className="contact-info-label">{link.label}</span>
                      <span className="contact-info-value">{link.value}</span>
                    </div>
                    {link.href && (
                      <ExternalArrowIcon className="contact-info-arrow" size={16} />
                    )}
                  </Wrapper>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
