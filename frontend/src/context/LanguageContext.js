import React, { createContext, useState, useContext, useEffect } from 'react';

import viTranslations from '../locales/vi.json';
import enTranslations from '../locales/en.json';

const translations = {
  vi: viTranslations,
  en: enTranslations
};

// Tạo context
const LanguageContext = createContext();

export const LanguageProvider = ({ children }) => {
  const [currentLang, setCurrentLang] = useState(
    localStorage.getItem('language') || 'vi'
  );
  
  const toggleLanguage = () => {
    const newLang = currentLang === 'vi' ? 'en' : 'vi';
    setCurrentLang(newLang);
    localStorage.setItem('language', newLang);
  };
  
  const t = (key) => {
    return translations[currentLang][key] || key;
  };
  
  useEffect(() => {
    document.documentElement.lang = currentLang;
  }, [currentLang]);
  
  return (
    <LanguageContext.Provider value={{ currentLang, toggleLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => useContext(LanguageContext);
