import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import LanguageSelector from '../components/LanguageSelector';
import { useTranslation } from '../hooks/useTranslation';
import './PricingPage.css';

export default function PricingPage() {
  const { user, upgradeToPremium } = useAuth();
  const navigate = useNavigate();
  const { t } = useTranslation();

  const ACCESSIBILITY_PLANS = {
    cognitive: {
      label: t('Cognitive Disabilities'),
      needs: [t('Complex text'), t('Too much information at once'), t('Distractions')],
      features: [t('Simple mode UI'), t('Text simplification'), t('Focus mode'), t('Icons + visuals')],
    },
    lowVision: {
      label: t('Low vision / Elderly'),
      needs: [t('Better visibility, not full audio')],
      features: [t('High contrast mode'), t('Font size control'), t('Dark/light themes'), t('Zoom support')],
    },
    hardOfHearing: {
      label: t('Hard of Hearing'),
      needs: [t('Partial audio support')],
      features: [t('Captions'), t('Adjustable audio speed'), t('Volume boost'), t('Clarity controls')],
    },
    lowInternet: {
      label: t('Limited Internet / Low Resources'),
      needs: [t('No stable internet'), t('Low-end devices')],
      features: [t('Offline mode'), t('Low-data mode'), t('Text-first fallback')],
    },
  };

  const handleUpgrade = () => {
    upgradeToPremium();
    navigate('/dashboard');
  };

  const accessibility = user?.disability && ACCESSIBILITY_PLANS[user.disability];

  return (
    <div className="pricing-page" role="main">
      <a href="#pricing-content" className="skip-link">{t('Skip to pricing content')}</a>
      <header className="pricing-header">
        <div>
          <button className="pricing-back" onClick={() => navigate('/dashboard')}>
            ← {t('Back to Dashboard')}
          </button>
          <h1>{t('Choose a plan that fits you')}</h1>
          <p>{t('Compare Free and Premium, then upgrade to unlock full AI support and accessibility tools.')}</p>
        </div>
        <div className="pricing-header-right">
          <LanguageSelector compact />
        </div>
      </header>

      <section className="pricing-content" id="pricing-content">
        <div className="pricing-grid">
          <article className="pricing-card free-card">
            <span className="pricing-label">🎓 {t('Free Plan')}</span>
            <h2>{t('Good for getting started')}</h2>
            <ul>
              <li>{t('Limited AI tutor sessions')}</li>
              <li>{t('Basic language support')}</li>
              <li>{t('Standard accessibility settings')}</li>
              <li>{t('Community learning tips')}</li>
            </ul>
          </article>

          <article className="pricing-card premium-card">
            <span className="pricing-label premium">⭐ {t('Premium Plan')}</span>
            <h2>{t('Best for full learning support')}</h2>
            <strong className="pricing-price">{t('Free upgrade')}</strong>
            <ul>
              <li>{t('Unlimited AI tutor sessions')}</li>
              <li>{t('All languages and faster responses')}</li>
              <li>{t('Advanced accessibility features')}</li>
              <li>{t('Priority learning guidance')}</li>
            </ul>
            <button className="pricing-upgrade" onClick={handleUpgrade}>
              {t('Upgrade to Premium')}
            </button>
          </article>
        </div>

        <div className="pricing-details">
          <div className="pricing-detail">
            <h3>{t('Why Premium matters')}</h3>
            <p>{t('Premium gives you a smoother AI experience with no session limits, faster answers, and smarter support for different learning needs.')}</p>
          </div>

          <div className="pricing-detail">
            <h3>{t('Premium includes')}</h3>
            <ul>
              <li>{t('Unlimited AI help for homework, concepts, and practice')}</li>
              <li>{t('Personalized responses for class level and subject')}</li>
              <li>{t('Accessibility-ready interface for diverse learners')}</li>
              <li>{t('Priority support and responsive tutor behavior')}</li>
            </ul>
          </div>
        </div>

        {accessibility && (
          <aside className="pricing-accessibility">
            <h3>{t('Your accessibility setup')}</h3>
            <p>{t('We tailor EchoEdu based on your chosen preference:')} <strong>{accessibility.label}</strong></p>
            <div className="accessibility-block">
              <div>
                <h4>{t('What you struggle with')}</h4>
                <ul>
                  {accessibility.needs.map((need) => <li key={need}>{need}</li>)}
                </ul>
              </div>
              <div>
                <h4>{t('What Premium adds')}</h4>
                <ul>
                  {accessibility.features.map((feature) => <li key={feature}>{feature}</li>)}
                </ul>
              </div>
            </div>
          </aside>
        )}
      </section>
    </div>
  );
}
