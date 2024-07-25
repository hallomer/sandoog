import React, { useState, useEffect, useCallback } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faHome, faWallet, faSackDollar, faPieChart, faSignOutAlt } from '@fortawesome/free-solid-svg-icons';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useUser } from '../contexts/UserContext';
import { useTranslation } from 'react-i18next';
import '../styles/Sidebar.css';

const Sidebar = ({ isOpen, handleToggle }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const [activeLink, setActiveLink] = useState(location.pathname);
  const { setUser } = useUser();
  const { t } = useTranslation();

  const handleLinkClick = (path) => {
    setActiveLink(path);
    handleToggle();
  };

  const handleSignOut = (e) => {
    e.preventDefault();
    setUser(null);
    navigate('/user');
    handleToggle();
  };

  const handleClickOutside = useCallback((e) => {
    if (isOpen && !e.target.closest('.sidebar') && !e.target.closest('.menu-toggle')) {
      handleToggle();
    }
  }, [isOpen, handleToggle]);

  useEffect(() => {
    document.addEventListener('click', handleClickOutside);
    return () => {
      document.removeEventListener('click', handleClickOutside);
    };
  }, [handleClickOutside]);

  return (
    <div className={`sidebar ${isOpen ? 'open' : ''}`}>
      <ul>
        <li className={`menu-item ${activeLink === '/' ? 'active' : ''}`}>
          <Link to="/" onClick={() => handleLinkClick('/')}>
            <FontAwesomeIcon icon={faHome} /> {t('dashboard')}
          </Link>
        </li>
        <li className={`menu-item ${activeLink === '/transactions' ? 'active' : ''}`}>
          <Link to="/transactions" onClick={() => handleLinkClick('/transactions')}>
            <FontAwesomeIcon icon={faWallet} /> {t('income_expenses')}
          </Link>
        </li>
        <li className={`menu-item ${activeLink === '/savings' ? 'active' : ''}`}>
          <Link to="/savings" onClick={() => handleLinkClick('/savings')}>
            <FontAwesomeIcon icon={faSackDollar} /> {t('savings')}
          </Link>
        </li>
        <li className={`menu-item ${activeLink === '/budgets' ? 'active' : ''}`}>
          <Link to="/budgets" onClick={() => handleLinkClick('/budgets')}>
            <FontAwesomeIcon icon={faPieChart} /> {t('budgets')}
          </Link>
        </li>
        <li className="menu-item">
          <Link to="#" onClick={handleSignOut}>
            <FontAwesomeIcon icon={faSignOutAlt} /> {t('sign_out')}
          </Link>
        </li>
      </ul>
    </div>
  );
};

export default Sidebar;