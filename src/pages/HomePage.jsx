import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { useTranslation } from '../hooks/useTranslation';
import { useAuth } from '../context/AuthContext';
import '../App.css';

function HomePage() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { user } = useAuth();

  useEffect(() => {
    // Set initial background color
    document.body.style.backgroundColor = '#E6F7FF';
    return () => {
      document.body.style.backgroundColor = '';
    };
  }, []);

  return (
    <>
      <Navbar />

      <section className="section1">
        <div className="ChildImage">
          <img src="/child_first_page.png" width={500} height={550} alt={t("Child learning")} />
        </div>

        <div className="text2">
          <h3>{t("RESONATING WITH EVERY LEARNER")}</h3>
        </div>

        <div className="text1">
          <h1>{t("EchoEdu: The Voice of Every")}<br />{t("Child's Future.")}</h1>
        </div>

        <div className="text3">
          <h2>{t("A voice-first AI tutor that turns any phone into a personal, gamified learning companion. Fully on-device, accessible, and designed for social good.")}</h2>
        </div>

        <div className="buttons">
          <button className="button1" onClick={() => navigate(user ? '/dashboard' : '/signup')}>
            {user ? t("Dashboard") : t("Join the Pilot")}
          </button>
        </div>
      </section>

      <section id="Header1" className="section2">
        <div className="Header1">
          <h1>{t("How it Works")}</h1>
          <p>{t("Three pillars designed to bridge the educational divide using the power of voice and edge AI.")}</p>
        </div>
        <div className="features">
          <div className="box1">
            <div className="icon">
              <i className="ri-user-voice-line"></i>
            </div>
            <h3>{t("Voice-First Interaction")}</h3>
            <p>{t("Designed from the ground up for blind and disabled children, prioritizing speech over complex visual UI.")}</p>
          </div>

          <div className="box2">
            <div className="icon1">
              <i className="ri-magic-line"></i>
            </div>
            <h3>{t("Simple & Intuitive")}</h3>
            <p>{t("Designed to be easy to use, removing barriers to learning through voice interaction.")}</p>
          </div>

          <div className="box3">
            <div className="icon2">
              <i className="ri-gamepad-line"></i>
            </div>
            <h3>{t("Gamified Learning")}</h3>
            <p>{t("Turn every lesson into a quest. Education that feels like play, rewarding curiosity and consistent progress.")}</p>
          </div>
        </div>
      </section>

      <section id="section3content" className="section3">
        <div className="section3content">
          <div className="section3header">
            <h3>{t("OUR MISSION")}</h3>
            <h1>{t("AI for Social Good.")}</h1>
            <p>
              {t("We believe that location, internet access, or physical ability should never be a barrier to quality education. EchoEdu is specifically optimized to run on $50 budget devices, bringing a world-class mentor to children in the most remote corners of the world.")}
            </p>

            <div className="section3stats">
              <div>
                <h2>1M+</h2>
                <span>{t("Children Targeted")}</span>
              </div>
              <div>
                <h2>100%</h2>
                <span>{t("Offline Privacy")}</span>
              </div>
            </div>
          </div>

          <div className="section3image">
            <img src="/section3image.png" alt="mission" />
          </div>
        </div>
      </section>

      <section id="section4container" className="section4">
        <div className="section4container">
          <div className="section4header">
            <span className="tag">{t("DESIGNED FOR ALL")}</span>
            <h1>{t("Radical Inclusivity in Learning")}</h1>
            <p>
              {t("EchoEdu is purposefully built to break down barriers for blind, disabled, and underprivileged children worldwide.")}
            </p>
          </div>

          <div className="section4features">
            <div className="featureCard">
              <div className="iconCircle">👁️</div>
              <div>
                <h3>{t("Screen-Reader Optimization")}</h3>
                <p>
                  {t("Native support for all major screen readers like VoiceOver and TalkBack. Every element is logically structured and annotated for perfect non-visual feedback.")}
                </p>
              </div>
            </div>

            <div className="featureCard">
              <div className="iconCircle">🎤</div>
              <div>
                <h3>{t("Voice-First Navigation")}</h3>
                <p>
                  {t("A revolutionary UI paradigm that requires zero visual interaction. Control the entire experience using natural language and intuitive vocal cues.")}
                </p>
              </div>
            </div>

            <div className="featureCard">
              <div className="iconCircle">🌐</div>
              <div>
                <h3>{t("Indian Language Support")}</h3>
                <p>
                  {t("Ask questions and hear answers in Hindi, Tamil, Bengali, Telugu, Marathi, and 7 more Indian languages. AI answers in your chosen language.")}
                </p>
              </div>
            </div>

            <div className="featureCard">
              <div className="iconCircle">📶</div>
              <div>
                <h3>{t("Offline Reliability")}</h3>
                <p>
                  {t("Powerful AI that runs on $50 budget devices without internet. We ensure no child is left behind due to the digital divide or lack of infrastructure.")}
                </p>
              </div>
            </div>
          </div>

          <div className="section4cta">
            <h2>{t("Ready to change the future of learning?")}</h2>
            <p>
              {t("Join our early pilot program and help us bring the voice of education to those who need it most.")}
            </p>
            <button onClick={() => navigate('/signup')}>{t("Join the Pilot Now")}</button>
          </div>
        </div>
      </section>

      <footer className="footer">
        <div className="footer-container">
          <div className="footer-left">
            <h2>EchoEdu</h2>
            <p>
              {t("Resonating with every learner. Our voice-first AI is built to democratize education for every child, everywhere.")}
            </p>
          </div>

          <div className="footer-right">
            <h4>{t("CONNECT WITH US")}</h4>
            <div className="social-icons">
              <div className="icon">🌐</div>
              <div className="icon">✉️</div>
              <div className="icon">🔗</div>
            </div>
          </div>
        </div>
      </footer>

      <footer className="lastfooter">{t("©2026 EchoEdu. Resonating with every learner.")}</footer>
    </>
  );
}

export default HomePage;
