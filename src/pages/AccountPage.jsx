import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTranslation } from '../hooks/useTranslation';
import './Dashboard.css';

export default function AccountPage() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const { t } = useTranslation();

  if (!user) return null;

  return (
    <div className="dashboard-page" role="main">
      <main className="dashboard-main" id="main-content" tabIndex={-1}>
        <div className="dashboard-topbar">
          <div>
            <h1 className="dashboard-welcome">{t('Account Details')}</h1>
            <p className="dashboard-sub">{t('Manage your profile and logout from here.')}</p>
          </div>
        </div>

        <div className="account-info">
          <h3>{t('Account Details')}</h3>
          <div className="account-row">
            <span>{t('Name')}</span>
            <strong>{user.name}</strong>
          </div>
          <div className="account-row">
            <span>{t('Email')}</span>
            <strong>{user.email}</strong>
          </div>
          <div className="account-row">
            <span>{t('Plan')}</span>
            <strong className={user.tier}>{user.tier === 'premium' ? t('Premium') : t('Free')}</strong>
          </div>

          <div className="account-actions">
            <button className="dash-card-btn" type="button" onClick={() => navigate('/dashboard')}>
              ← {t('Go back to dashboard')}
            </button>
            <button className="upgrade-btn" type="button" onClick={() => { logout(); navigate('/'); }}>
              {t('Logout')}
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}
