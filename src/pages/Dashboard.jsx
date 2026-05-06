import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import LanguageSelector from '../components/LanguageSelector';
import { useTranslation } from '../hooks/useTranslation';
import './Dashboard.css';

const AMD_CAREER_TOPICS = [
  { icon: '🖥️', title: 'What is a CPU?', prompt: 'Explain what a CPU (Central Processing Unit) is in simple terms, including how AMD EPYC processors work.' },
  { icon: '🎮', title: 'GPU & Gaming', prompt: 'Explain how AMD Radeon GPUs work and why they matter for gaming and AI.' },
  { icon: '🤖', title: 'AI & Machine Learning', prompt: 'How is AI used in education? Explain AMD ROCm and how GPUs accelerate AI.' },
  { icon: '💻', title: 'Computer Engineering', prompt: 'What does a computer hardware engineer do? How do AMD chip designers work?' },
  { icon: '🔬', title: 'Semiconductor Tech', prompt: 'Explain what semiconductors are and how AMD designs and manufactures computer chips.' },
  { icon: '📡', title: 'Data Centers', prompt: 'What is a data center? How do AMD EPYC servers power cloud computing and AI?' },
];

const HOW_TO_STEPS = [
  { number: '1', emoji: '🎓', title: 'Pick your class', desc: 'Select the class you are studying so the AI gives the right explanation.' },
  { number: '2', emoji: '📚', title: 'Choose a subject', desc: 'Pick a subject you love, like Maths, Science, or English.' },
  { number: '3', emoji: '📖', title: 'Open a chapter', desc: 'Choose a chapter so the AI can explain it like a story.' },
  { number: '4', emoji: '💬', title: 'Ask your AI buddy', desc: 'Type a question and watch the AI answer in a friendly way.' },
];

export default function Dashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { t } = useTranslation();

  const [selectedClass, setSelectedClass] = useState(
    () => localStorage.getItem('echoedu_selected_class') || 'Class 1'
  );

  const defaultHighContrast = user?.disability === 'lowVision';
  const defaultSimpleMode   = user?.disability === 'cognitive';
  const defaultFontSize     = user?.disability === 'lowVision' ? 'xlarge' : 'normal';

  const [highContrast, setHighContrast] = useState(
    () => localStorage.getItem('echoedu_hc') === '1' || defaultHighContrast
  );
  const [switchAccess, setSwitchAccess] = useState(
    () => localStorage.getItem('echoedu_sa') === '1'
  );
  const [fontSize, setFontSize] = useState(
    () => localStorage.getItem('echoedu_fs') || defaultFontSize
  );
  const [simpleMode, setSimpleMode] = useState(
    () => localStorage.getItem('echoedu_simple') === '1' || defaultSimpleMode
  );
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [rewardPoints] = useState(() => Number(localStorage.getItem('echoedu_reward_points')) || 0);

  const handleClassChange = (e) => {
    const value = e.target.value;
    setSelectedClass(value);
    localStorage.setItem('echoedu_selected_class', value);
  };

  const toggleHighContrast = () => {
    const next = !highContrast;
    setHighContrast(next);
    localStorage.setItem('echoedu_hc', next ? '1' : '0');
  };
  const toggleSwitchAccess = () => {
    const next = !switchAccess;
    setSwitchAccess(next);
    localStorage.setItem('echoedu_sa', next ? '1' : '0');
  };
  const cycleFontSize = () => {
    const sizes = ['normal', 'large', 'xlarge'];
    const next = sizes[(sizes.indexOf(fontSize) + 1) % sizes.length];
    setFontSize(next);
    localStorage.setItem('echoedu_fs', next);
  };

  if (!user) { navigate('/login'); return null; }

  const rootClass = [
    'dashboard-page',
    highContrast  ? 'high-contrast' : '',
    switchAccess  ? 'switch-access' : '',
    simpleMode    ? 'simple-mode'   : '',
    `font-size-${fontSize}`,
  ].filter(Boolean).join(' ');

  const fontLabel =
    fontSize === 'normal' ? t('Normal') :
    fontSize === 'large'  ? t('Large')  : t('X-Large');

  return (
    <div className={rootClass} role="main">
      <a href="#main-content" className="skip-link">{t('Skip to main content')}</a>

      {/* ───── SIDEBAR ───── */}
      <aside className={`dashboard-sidebar ${sidebarOpen ? 'sidebar-open' : ''}`} aria-label={t('Navigation')}>
        <div
          className="sidebar-logo"
          onClick={() => navigate('/')}
          role="button"
          tabIndex={0}
          aria-label={t('Go to home')}
        >
          <span className="logo-echo">Echo</span><span className="logo-edu">Edu</span>
        </div>

        <nav className="sidebar-nav" aria-label={t('Main navigation')}>
          <button className="sidebar-item active" aria-current="page">
            <span className="sidebar-icon">🏠</span> {t('Dashboard')}
          </button>
          <button className="sidebar-item" onClick={() => navigate('/tutor', { state: { selectedClass } })}>
            <span className="sidebar-icon">🤖</span> {t('AI Tutor')}
          </button>
          <button className="sidebar-item" onClick={() => navigate('/rewards')}>
            <span className="sidebar-icon">⭐</span> {t('Rewards')}
          </button>
          <button className="sidebar-item" onClick={() => navigate('/')}>
            <span className="sidebar-icon">🌐</span> {t('Home')}
          </button>
        </nav>

        <div className="sidebar-a11y" aria-label={t('Accessibility settings')}>
          <p className="a11y-label">♿ {t('Accessibility')}</p>
          <button
            className={`a11y-btn ${highContrast ? 'active' : ''}`}
            onClick={toggleHighContrast}
            aria-pressed={highContrast}
          >
            {highContrast ? `🌑 ${t('High Contrast: ON')}` : `🌗 ${t('High Contrast')}`}
          </button>
          <button
            className={`a11y-btn ${switchAccess ? 'active' : ''}`}
            onClick={toggleSwitchAccess}
            aria-pressed={switchAccess}
          >
            {switchAccess ? `⌨️ ${t('Switch Access: ON')}` : `⌨️ ${t('Switch Access')}`}
          </button>
          <button className="a11y-btn" onClick={cycleFontSize}>
            🔤 {t('Text')}: {fontLabel}
          </button>
        </div>
      </aside>

      {/* ───── MAIN ───── */}
      <main className="dashboard-main" id="main-content" tabIndex={-1}>

        {/* Topbar */}
        <header className="dashboard-topbar">
          <button
            className="hamburger"
            onClick={() => setSidebarOpen(o => !o)}
            aria-label={t('Toggle menu')}
          >
            ☰
          </button>
          <div className="topbar-greeting">
            <h1 className="dashboard-welcome">
              {t('Hi')}, <span className="welcome-name">{user.name}</span>! 👋
            </h1>
            <p className="dashboard-sub">{t('Ready to learn something new today?')}</p>
          </div>
          <div className="topbar-actions">
            <LanguageSelector compact />
            <button
              type="button"
              className="profile-icon-btn"
              onClick={() => navigate('/account')}
              aria-label={t('Account Details')}
            >
              <img src="/user.png" alt={t('Account Details')} />
            </button>
          </div>
        </header>

        {/* Upgrade / Premium banner */}
        {user.tier === 'free' && (
          <div className="upgrade-banner" role="complementary">
            <div className="upgrade-text">
              <h2>🚀 {t('Unlock Premium Learning')}</h2>
              <p>{t('Unlimited sessions, all Indian languages, and priority AI responses.')}</p>
            </div>
            <button className="upgrade-btn" onClick={() => navigate('/pricing')}>
              ⭐ {t('See Plans')}
            </button>
          </div>
        )}

        {user.tier === 'premium' && (
          <div className="premium-banner" role="status">
            <span className="premium-star">⭐</span>
            <div>
              <strong>{t("You're on Premium!")}</strong>
              <p>{t('Enjoy unlimited access to all EchoEdu features.')}</p>
            </div>
          </div>
        )}

        {/* ── Big CTA card ── */}
        <section className="cta-section">
          <div
            className="cta-card"
            role="button"
            tabIndex={0}
            onClick={() => navigate('/tutor', { state: { selectedClass } })}
            onKeyDown={e => e.key === 'Enter' && navigate('/tutor', { state: { selectedClass } })}
            aria-label={t('Start learning with AI Tutor')}
          >
            <div className="cta-left">
              <span className="cta-emoji" aria-hidden="true">🤖</span>
              <div>
                <h2>{t('AI Tutor')}</h2>
                <p>{t('Pick your class, choose a subject, and ask your doubt!')}</p>
              </div>
            </div>
            <span className="cta-arrow" aria-hidden="true">→</span>
          </div>
        </section>

        {/* ── How To Steps ── */}
        <section className="steps-section" aria-labelledby="steps-heading">
          <h2 id="steps-heading" className="section-title">
            🗺️ {t('How to use EchoEdu')}
          </h2>
          <div className="steps-grid">
            {HOW_TO_STEPS.map(step => (
              <div className="step-card" key={step.number}>
                <div className="step-badge">{step.number}</div>
                <span className="step-emoji" aria-hidden="true">{step.emoji}</span>
                <h3>{t(step.title)}</h3>
                <p>{t(step.desc)}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="reward-store-section" aria-labelledby="reward-store-heading">
          <h2 id="reward-store-heading" className="section-title">
            🏪 {t('Reward Store')}
          </h2>
          <div className="reward-store-card">
            <div className="reward-store-copy">
              <h3>{t('Spend your learning points')}</h3>
              <p>{t('You have')} <strong>{rewardPoints}</strong> {t('points. Redeem badges, themes, and learning goodies!')}</p>
            </div>
            <button className="reward-store-btn" onClick={() => navigate('/rewards')}>
              ⭐ {t('Open Reward Store')}
            </button>
          </div>
        </section>

        {/* ── AMD Career Topics ── */}
        <section className="career-section" aria-labelledby="career-heading">
          <h2 id="career-heading" className="section-title">
            🚀 {t('AMD Tech Career Topics')}
          </h2>
          <p className="section-sub">
            {t('Click any topic to start a conversation with your AI tutor!')}
          </p>
          <div className="career-grid" role="list">
            {AMD_CAREER_TOPICS.map((topic, i) => (
              <button
                key={i}
                className="career-card"
                role="listitem"
                onClick={() => navigate('/tutor', { state: { autoAsk: topic.prompt } })}
                aria-label={`${t('Learn about')} ${topic.title}`}
              >
                <span className="career-emoji" aria-hidden="true">{topic.icon}</span>
                <span className="career-title">{topic.title}</span>
                <span className="career-arrow" aria-hidden="true">→</span>
              </button>
            ))}
          </div>
        </section>

        {/* ── Braille note ── */}
        <div className="braille-note" role="note">
          <span aria-hidden="true">⠿</span>
          <p>{t('EchoEdu responses are formatted for Braille display and screen reader compatibility.')}</p>
        </div>

      </main>

      {/* Overlay to close sidebar on mobile */}
      {sidebarOpen && (
        <div
          className="sidebar-overlay"
          onClick={() => setSidebarOpen(false)}
          aria-hidden="true"
        />
      )}
    </div>
  );
}