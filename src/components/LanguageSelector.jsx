import { useState } from 'react';
import { useAuth, INDIAN_LANGUAGES } from '../context/AuthContext';
import { useTranslation } from '../hooks/useTranslation';
import './LanguageSelector.css';

export default function LanguageSelector({ compact = false }) {
  const { language, setLanguage } = useAuth();
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  const current = INDIAN_LANGUAGES.find(l => l.code === language) || INDIAN_LANGUAGES[0];

  return (
    <div className={`lang-selector ${compact ? 'compact' : ''}`}>
      <button className="lang-trigger" onClick={() => setOpen(!open)} title={t("Change language")}> 
        <span className="lang-globe">🌐</span>
        <span className="lang-name">{current.native}</span>
        <span className="lang-arrow">{open ? '▲' : '▼'}</span>
      </button>

      {open && (
        <div className="lang-dropdown">
          {INDIAN_LANGUAGES.map(lang => (
            <button
              key={lang.code}
              className={`lang-option ${language === lang.code ? 'active' : ''}`}
              onClick={() => { setLanguage(lang.code); setOpen(false); }}
            >
              <span className="lang-native">{lang.native}</span>
              <span className="lang-english">{lang.name}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
