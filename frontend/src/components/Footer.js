import React from 'react';
import '../styles/Footer.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEnvelope } from '@fortawesome/free-solid-svg-icons';
import { faGithub, faTwitter, faLinkedin, faWhatsapp, faTelegram } from '@fortawesome/free-brands-svg-icons';
import { useTranslation } from 'react-i18next';

const Footer = () => {
  const { t } = useTranslation();

  return (
    <footer className="footer">
      <div className="footer-copyright">
      <span dir="ltr">© 2024 Sandoog</span> 🇸🇩
      </div>
      <div className="footer-links">
        <a href="https://hallomer.github.io/sandoog-landing/" target="_blank" rel="noreferrer">
          Sandoog Homepage
        </a>
      </div>
      <div className="footer-social">
        <a href="https://github.com/hallomer">
          <FontAwesomeIcon icon={faGithub} />
        </a>
        <a href="mailto:hebaaltayeb2@icloud.com">
          <FontAwesomeIcon icon={faEnvelope} />
        </a>
        <a href="https://x.com/Hibathepro">
          <FontAwesomeIcon icon={faTwitter} />
        </a>
        <a href="https://www.linkedin.com/in/hibaeltayeb/">
          <FontAwesomeIcon icon={faLinkedin} />
        </a>
        <a href="https://wa.me/249117858653">
          <FontAwesomeIcon icon={faWhatsapp} />
        </a>
        <a href="https://t.me/HebaSiddig">
          <FontAwesomeIcon icon={faTelegram} />
        </a>
      </div>
    </footer>
  );
};

export default Footer;