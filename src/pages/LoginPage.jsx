import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import LanguageSelector from '../components/LanguageSelector';
import { useTranslation } from '../hooks/useTranslation';
import './Auth.css';

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    const result = login(form.email, form.password);
    if (result.error) {
      setError(result.error);
    } else {
      navigate('/dashboard');
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-header">
          <h1 className="auth-logo" onClick={() => navigate('/')}>EchoEdu</h1>
          <div className="auth-lang"><LanguageSelector compact /></div>
        </div>

        <h2 className="auth-title">{t("Welcome back!")}</h2>
        <p className="auth-subtitle">{t("Log in to continue learning")}</p>

        {error && <div className="auth-error">{t(error)}</div>}

        <form onSubmit={handleSubmit} className="auth-form">
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
            placeholder={t("Your password")}
            value={form.password}
            onChange={e => setForm({ ...form, password: e.target.value })}
          />

          <button type="submit" className="auth-submit">{t("Log In")}</button>
        </form>

        <p className="auth-switch">
          {t("Don't have an account?")} <Link to="/signup">{t("Sign up free")}</Link>
        </p>
      </div>
    </div>
  );
}
