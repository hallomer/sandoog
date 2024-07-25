import React, { useState, useEffect } from 'react';
import '../styles/Header.css';
import logo from '../assets/logo.png';
import { useUser } from '../contexts/UserContext';
import { useTranslation } from 'react-i18next';

const Header = ({ toggleSidebar }) => {
  const [language, setLanguage] = useState('العربية');
  const { user } = useUser();
  const { i18n } = useTranslation();

  useEffect(() => {
    i18n.changeLanguage('en');
    document.body.classList.add('ltr');
  }, [i18n]);

  const toggleLanguage = () => {
    const newLanguage = language === 'العربية' ? 'ar' : 'en';
    setLanguage(newLanguage === 'ar' ? 'English' : 'العربية');
    i18n.changeLanguage(newLanguage);

    // Update body class based on the chosen language
    if (newLanguage === 'ar') {
      document.body.classList.add('rtl');
      document.body.classList.remove('ltr');
    } else {
      document.body.classList.add('ltr');
      document.body.classList.remove('rtl');
    }
  };

  return (
    <header className="header">
      <div className="header-btn">
        {user && (
          <button className="menu-toggle" onClick={toggleSidebar}>
            <span className="hamburger-icon">☰</span>
          </button>
        )}
        <a href="/" className="logo" title="Sandoog">
          <img src={logo} alt="Sandoog logo" />
        </a>
      </div>
      <div className="user-action">
        <button className="change-lang" onClick={toggleLanguage}>
          <span className="lang-text">{language}</span>
        </button>
      </div>
    </header>
  );
};

export default Header;