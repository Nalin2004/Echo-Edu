import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import LanguageSelector from '../components/LanguageSelector';
import { useTranslation } from '../hooks/useTranslation';
import './Auth.css';

export default function SignupPage() {
  const { signup } = useAuth();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    tier: 'free',
    disability: 'none',
  });
  const [error, setError] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.password) {
      setError(t('All fields are required.'));
      return;
    }
    if (form.password.length < 6) {
      setError(t('Password must be at least 6 characters.'));
      return;
    }
    signup(form.name, form.email, form.password, form.tier, form.disability);
    navigate('/dashboard');
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-header">
          <h1 className="auth-logo" onClick={() => navigate('/')}>EchoEdu</h1>
          <div className="auth-lang"><LanguageSelector compact /></div>
        </div>

        <h2 className="auth-title">{t("Create your account")}</h2>
        <p className="auth-subtitle">{t("Start your learning journey today")}</p>

        {error && <div className="auth-error">{error}</div>}

        <form onSubmit={handleSubmit} className="auth-form">
          <label>{t("Full Name")}</label>
          <input
            type="text"
            placeholder={t("Your name")}
            value={form.name}
            onChange={e => setForm({ ...form, name: e.target.value })}
          />

          <label>{t("Email")}</label>
          <input
            type="email"
            placeholder={t("you@example.com")}
            value={form.email}
            onChange={e => setForm({ ...form, email: e.target.value })}
          />

          <label>{t("Password")}</label>
          <input
            type="password"
            placeholder={t("At least 6 characters")}
            value={form.password}
            onChange={e => setForm({ ...form, password: e.target.value })}
          />

          <label>{t("Choose Plan")}</label>
          <div className="tier-picker">
            <button
              type="button"
              className={`tier-option ${form.tier === 'free' ? 'selected' : ''}`}
              onClick={() => setForm({ ...form, tier: 'free' })}
            >
              <span className="tier-icon">🎓</span>
              <strong>{t("Free")}</strong>
              <span className="tier-desc">{t("Basic AI tutor, limited sessions")}</span>
            </button>
            <button
              type="button"
              className={`tier-option premium ${form.tier === 'premium' ? 'selected' : ''}`}
              onClick={() => setForm({ ...form, tier: 'premium' })}
            >
              <span className="tier-icon">⭐</span>
              <strong>{t("Premium")}</strong>
              <span className="tier-desc">{t("Unlimited sessions, all languages")}</span>
            </button>
          </div>

          <label>{t("Accessibility preference")}</label>
          <select
            value={form.disability}
            onChange={(e) => setForm({ ...form, disability: e.target.value })}
          >
            <option value="none">{t("None / Prefer not to say")}</option>
            <option value="cognitive">{t("Dyslexia / ADHD / Autism spectrum")}</option>
            <option value="lowVision">{t("Partial blindness / Elderly users")}</option>
            <option value="hardOfHearing">{t("Hard of Hearing")}</option>
            <option value="lowInternet">{t("Limited Internet / Low Resources")}</option>
          </select>
          <p className="auth-hint">
            {t("EchoEdu will adapt the interface with simpler text, larger font, captions, or low-data behavior based on your choice.")}
          </p>

          <button type="submit" className="auth-submit">
            {t("Create Account")}
          </button>
        </form>

        <p className="auth-switch">
          {t("Already have an account?")} <Link to="/login">{t("Log in")}</Link>
        </p>
      </div>
    </div>
  );
}
