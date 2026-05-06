import { createContext, useContext, useState, useEffect } from 'react';
import { loadLanguageResources } from '../i18n';

const AuthContext = createContext(null);

export const INDIAN_LANGUAGES = [
  { code: 'en', name: 'English', native: 'English' },
  { code: 'hi', name: 'Hindi', native: 'हिंदी' },
  { code: 'bn', name: 'Bengali', native: 'বাংলা' },
  { code: 'te', name: 'Telugu', native: 'తెలుగు' },
  { code: 'mr', name: 'Marathi', native: 'मराठी' },
  { code: 'ta', name: 'Tamil', native: 'தமிழ்' },
  { code: 'gu', name: 'Gujarati', native: 'ગુજરાતી' },
  { code: 'kn', name: 'Kannada', native: 'ಕನ್ನಡ' },
  { code: 'ml', name: 'Malayalam', native: 'മലയാളം' },
  { code: 'pa', name: 'Punjabi', native: 'ਪੰਜਾਬੀ' },
  { code: 'or', name: 'Odia', native: 'ଓଡ଼ିଆ' },
  { code: 'ur', name: 'Urdu', native: 'اردو' },
];

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const stored = localStorage.getItem('echoedu_user');
    return stored ? JSON.parse(stored) : null;
  });

  const [language, setLanguage] = useState(() => {
    return localStorage.getItem('echoedu_lang') || 'en';
  });

  useEffect(() => {
    if (user) localStorage.setItem('echoedu_user', JSON.stringify(user));
    else localStorage.removeItem('echoedu_user');
  }, [user]);

  useEffect(() => {
    localStorage.setItem('echoedu_lang', language);
    loadLanguageResources(language);
  }, [language]);

  const resetLearningGamificationData = () => {
    const resetKeys = [
      'echoedu_reward_points',
      'echoedu_completed_chapters',
      'echoedu_current_chapter',
      'echoedu_selected_topic',
      'echoedu_today_questions',
      'echoedu_today_chapters',
      'echoedu_learning_streak',
      'echoedu_last_active_date',
      'echoedu_last_bonus_date',
      'echoedu_quiz_requested_units',
      'echoedu_quiz_answered_units',
      'echoedu_purchased_items',
    ];

    resetKeys.forEach((key) => localStorage.removeItem(key));

    // Fresh defaults for every newly created account.
    localStorage.setItem('echoedu_reward_points', '0');
    localStorage.setItem('echoedu_completed_chapters', '0');
    localStorage.setItem('echoedu_current_chapter', '1');
    localStorage.setItem('echoedu_quiz_requested_units', JSON.stringify({}));
    localStorage.setItem('echoedu_quiz_answered_units', JSON.stringify({}));
    localStorage.setItem('echoedu_purchased_items', JSON.stringify([]));
  };

  const signup = (name, email, password, tier = 'free', disability = 'none') => {
    resetLearningGamificationData();
    const newUser = { name, email, password, tier, disability, createdAt: Date.now() };
    setUser(newUser);
    return newUser;
  };

  const login = (email, password) => {
    const stored = localStorage.getItem('echoedu_user');
    if (!stored) return { error: 'No account found. Please sign up.' };
    const u = JSON.parse(stored);
    if (u.email !== email) return { error: 'Email not found.' };
    if (u.password !== password) return { error: 'Incorrect password.' };
    setUser(u);
    return { success: true };
  };

  const logout = () => setUser(null);

  const upgradeToPremium = () => {
    const updated = { ...user, tier: 'premium' };
    setUser(updated);
  };

  const currentLang = INDIAN_LANGUAGES.find(l => l.code === language) || INDIAN_LANGUAGES[0];

  return (
    <AuthContext.Provider value={{ user, language, currentLang, setLanguage, signup, login, logout, upgradeToPremium }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
