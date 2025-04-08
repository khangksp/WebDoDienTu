import React from 'react';
import { useLanguage } from '../context/LanguageContext';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faGlobe } from "@fortawesome/free-solid-svg-icons";
import './LanguageSwitcher.css';

const LanguageSwitcher = () => {
  const { currentLang, toggleLanguage } = useLanguage();
  
  // Hàm xử lý khi click chuyển ngôn ngữ
  const handleLanguageToggle = (e) => {
    e.preventDefault();
    
    // Thêm class animation trước khi chuyển ngôn ngữ
    const indicator = document.querySelector('.indicator');
    if (indicator) {
      indicator.classList.add('indicator-transitioning');
    }
    
    // Thực hiện chuyển ngôn ngữ
    toggleLanguage();
    
    // Sau khi chuyển ngôn ngữ, đợi animation hoàn tất rồi xóa class
    setTimeout(() => {
      if (indicator) {
        indicator.classList.remove('indicator-transitioning');
      }
      
      // Cập nhật lại indicator sau khi DOM đã cập nhật
      setTimeout(() => {
        const activeTab = document.querySelector(".nav-link.active");
        if (activeTab && indicator) {
          indicator.style.left = `${activeTab.offsetLeft}px`;
          indicator.style.width = `${activeTab.offsetWidth}px`;
        }
      }, 50);
    }, 300);
  };
  
  return (
    <div className="language-switcher">
      <button 
        onClick={handleLanguageToggle} 
        className="lang-btn"
        aria-label="Change language"
        // Ngăn hiệu ứng flash
        onMouseDown={(e) => e.preventDefault()}
      >
        <FontAwesomeIcon icon={faGlobe} className="lang-icon" />
        <div className="lang-container">
          <span className="lang-text">{currentLang === 'vi' ? 'EN' : 'VI'}</span>
        </div>
      </button>
    </div>
  );
};

export default LanguageSwitcher;