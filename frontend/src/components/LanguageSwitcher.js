import React from 'react';
import { useLanguage } from '../context/LanguageContext';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faGlobe } from "@fortawesome/free-solid-svg-icons";
import './LanguageSwitcher.css';

const LanguageSwitcher = () => {
  const { currentLang, toggleLanguage } = useLanguage();
  
  return (
    <div className="language-switcher">
      <button 
        onClick={toggleLanguage} 
        className="lang-btn"
        aria-label="Change language"
      >
        <FontAwesomeIcon icon={faGlobe} className="lang-icon" />
        <span className="lang-text">{currentLang === 'vi' ? 'EN' : 'VI'}</span>
      </button>
    </div>
  );
};

export default LanguageSwitcher;