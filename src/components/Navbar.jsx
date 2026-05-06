import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import LanguageSelector from './LanguageSelector';
import { useTranslation } from '../hooks/useTranslation';
import '../Navbar.css';

function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const { t } = useTranslation();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <div className="navbar-logo" onClick={() => navigate('/')} style={{ cursor: 'pointer' }}>
          EchoEdu
        </div>

        <ul className="navbar-links">
          <li className="navbar-item"><a href="/#Header1">{t("Features")}</a></li>
          <li className="navbar-item"><a href="/#section3content">{t("About")}</a></li>
          <li className="navbar-item"><a href="/#section4container">{t("Accessibility")}</a></li>
        </ul>

        <div className="navbar-right">
          <LanguageSelector />

          {user ? (
            <div className="navbar-user-menu">
              <span className="navbar-username">👤 {user.name}</span>
              <span className={`tier-badge ${user.tier}`}>{user.tier === 'premium' ? `⭐ ${t("Premium")}` : t("Free")}</span>
              <button className="navbar-btn-outline" onClick={() => navigate('/dashboard')}>{t("Dashboard")}</button>
              <button className="navbar-btn-outline" onClick={handleLogout}>{t("Logout")}</button>
            </div>
          ) : (
            <div className="navbar-auth">
              <button className="navbar-btn-outline" onClick={() => navigate('/login')}>{t("Login")}</button>
              <button className="navbar-item1" onClick={() => navigate('/signup')}>{t("Sign Up Free")}</button>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}

export default Navbar;
