import { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { askAI } from '../utils/groq';
import LanguageSelector from '../components/LanguageSelector';
import { useTranslation } from '../hooks/useTranslation';
import useTTS from '../hooks/useTTS';
import useVoiceInput from '../hooks/useVoiceInput';
import './TutorPage.css';

const MAX_TTS_CHARS = 2000;

const cleanTutorText = (text = '') => {
  return text
    .replace(/\r/g, '')
    .replace(/```[\s\S]*?```/g, '')
    .replace(/^#{1,6}\s*/gm, '')
    .replace(/^\s*[-*•]+\s+/gm, '')
    .replace(/^---+\s*$/gm, '')
    .replace(/[*_`~]/g, '')
    .replace(/[\p{Extended_Pictographic}]/gu, '')
    .replace(/[^\S\n]+/g, ' ')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
};

const SUBJECT_CHAPTER_LIBRARY = {
  Mathematics: [
    { title: 'Numbers Adventure', topics: ['Place value magic', 'Comparing numbers', 'Number patterns', 'Mental math tricks'] },
    { title: 'Addition and Subtraction World', topics: ['Story sums', 'Carrying and borrowing', 'Quick estimation', 'Check your answer'] },
    { title: 'Multiplication and Division Lab', topics: ['Times tables fun', 'Multiplication patterns', 'Division with remainders', 'Real-life sharing problems'] },
    { title: 'Fractions and Decimals Park', topics: ['What is a fraction?', 'Equivalent fractions', 'Decimal basics', 'Fraction-decimal conversion'] },
    { title: 'Shapes and Geometry', topics: ['2D and 3D shapes', 'Lines and angles', 'Symmetry hunt', 'Perimeter and area basics'] },
    { title: 'Data and Measurement', topics: ['Length, weight, capacity', 'Time and calendar', 'Reading graphs', 'Data collection projects'] },
  ],
  Science: [
    { title: 'Living Things Explorer', topics: ['Plants and their parts', 'Animal groups', 'Food chains', 'Habitats and adaptation'] },
    { title: 'Matter and Materials', topics: ['States of matter', 'Changes in materials', 'Mixtures and solutions', 'Recycling science'] },
    { title: 'Forces and Motion', topics: ['Push and pull', 'Speed and movement', 'Friction facts', 'Simple machines'] },
    { title: 'Energy Everywhere', topics: ['Sources of energy', 'Heat and light', 'Sound energy', 'Saving energy'] },
    { title: 'Earth and Space', topics: ['Layers of Earth', 'Weather and climate', 'Day and night', 'Our solar system'] },
    { title: 'Science in Daily Life', topics: ['Kitchen science', 'Health and hygiene', 'Safety at home', 'Science experiments'] },
  ],
  English: [
    { title: 'Reading Skills', topics: ['Main idea finding', 'Story sequence', 'Character clues', 'Inference practice'] },
    { title: 'Grammar Basics', topics: ['Nouns and pronouns', 'Verbs and tenses', 'Adjectives and adverbs', 'Prepositions and conjunctions'] },
    { title: 'Writing Workshop', topics: ['Sentence building', 'Paragraph writing', 'Creative story writing', 'Editing and proofreading'] },
    { title: 'Vocabulary Builder', topics: ['Synonyms and antonyms', 'Word families', 'Context clues', 'Phrasal verbs'] },
    { title: 'Speaking and Listening', topics: ['Conversation practice', 'Public speaking basics', 'Listening for details', 'Pronunciation support'] },
    { title: 'Poetry and Drama', topics: ['Rhythm and rhyme', 'Poetic devices', 'Dialogue writing', 'Role play'] },
  ],
  Hindi: [
    { title: 'वर्ण और शब्द (Letters & Words)', topics: ['स्वर और व्यंजन', 'शब्द बनाना', 'मात्राएं', 'उच्चारण अभ्यास'] },
    { title: 'व्याकरण (Grammar)', topics: ['संज्ञा और सर्वनाम', 'क्रिया', 'विशेषण', 'लिंग और वचन'] },
    { title: 'पठन कौशल (Reading)', topics: ['गद्य पाठ', 'कविता पठन', 'मुख्य विचार', 'प्रश्न-उत्तर'] },
    { title: 'लेखन कौशल (Writing)', topics: ['वाक्य रचना', 'अनुच्छेद लेखन', 'चित्र वर्णन', 'पत्र लेखन'] },
    { title: 'शब्द भंडार (Vocabulary)', topics: ['पर्यायवाची', 'विलोम', 'मुहावरे', 'लोकोक्तियां'] },
    { title: 'रचनात्मक हिंदी', topics: ['कहानी लेखन', 'संवाद लेखन', 'भाषण', 'पुनरावृत्ति अभ्यास'] },
  ],
  'Social Studies': [
    { title: 'Our Community', topics: ['Family and neighborhood', 'Rules and responsibility', 'Local government', 'Citizenship values'] },
    { title: 'History Time Travel', topics: ['Ancient civilizations', 'Important leaders', 'Freedom movement', 'Historic monuments'] },
    { title: 'Geography Explorer', topics: ['Maps and directions', 'Landforms and water bodies', 'Natural resources', 'Climate zones'] },
    { title: 'Economics for Kids', topics: ['Needs and wants', 'Saving and spending', 'Jobs in society', 'Markets and trade'] },
    { title: 'Culture and Heritage', topics: ['Festivals of India', 'Food and clothing', 'Art and music', 'Unity in diversity'] },
    { title: 'World Around Us', topics: ['Continents and oceans', 'Neighbouring countries', 'Global issues', 'Sustainable future'] },
  ],
  'Computer Science': [
    { title: 'Computer Basics', topics: ['Parts of computer', 'Input and output devices', 'File management', 'Internet safety'] },
    { title: 'Coding for Beginners', topics: ['Algorithms and logic', 'Loops and conditions', 'Debugging basics', 'Mini coding challenges'] },
    { title: 'Digital Creativity', topics: ['Presentations', 'Digital drawing', 'Audio/video basics', 'Design thinking'] },
    { title: 'AI and Robotics', topics: ['What is AI?', 'Sensors and robots', 'Machine learning basics', 'Ethics in AI'] },
    { title: 'Cyber Safety', topics: ['Strong passwords', 'Phishing awareness', 'Privacy protection', 'Digital citizenship'] },
    { title: 'Future Technologies', topics: ['Cloud computing', 'AR/VR introduction', 'Smart devices', 'Careers in tech'] },
  ],
  Physics: [
    { title: 'Motion and Force', topics: ['Scalars and vectors', 'Laws of motion', 'Friction dynamics', 'Numerical practice'] },
    { title: 'Work, Energy and Power', topics: ['Work-energy theorem', 'Conservation of energy', 'Power calculations', 'Application problems'] },
    { title: 'Waves and Sound', topics: ['Wave properties', 'Sound propagation', 'Resonance', 'Numerical quiz'] },
    { title: 'Electricity and Magnetism', topics: ['Current and voltage', 'Ohm’s law', 'Magnetic effects', 'Circuit analysis'] },
    { title: 'Optics', topics: ['Reflection and mirrors', 'Refraction and lenses', 'Optical instruments', 'Ray diagrams'] },
    { title: 'Modern Physics', topics: ['Atomic structure', 'Nuclear physics', 'Semiconductors', 'Communication systems'] },
  ],
  Chemistry: [
    { title: 'Atomic World', topics: ['Atomic models', 'Periodic table trends', 'Chemical bonding', 'Valency practice'] },
    { title: 'Reactions and Equations', topics: ['Types of reactions', 'Balancing equations', 'Redox basics', 'Practical examples'] },
    { title: 'Acids, Bases and Salts', topics: ['pH scale', 'Neutralization', 'Indicators', 'Daily life chemistry'] },
    { title: 'Metals and Non-Metals', topics: ['Properties comparison', 'Reactivity series', 'Extraction basics', 'Corrosion'] },
    { title: 'Organic Chemistry Intro', topics: ['Hydrocarbons', 'Functional groups', 'Isomerism basics', 'Nomenclature drills'] },
    { title: 'Chemistry in Action', topics: ['Polymers', 'Soaps and detergents', 'Fertilizers', 'Environmental chemistry'] },
  ],
  Biology: [
    { title: 'Cell and Tissues', topics: ['Cell organelles', 'Plant tissues', 'Animal tissues', 'Microscope skills'] },
    { title: 'Human Body Systems', topics: ['Digestive system', 'Respiratory system', 'Circulatory system', 'Nervous control'] },
    { title: 'Plants and Reproduction', topics: ['Photosynthesis', 'Transpiration', 'Plant reproduction', 'Crop improvement'] },
    { title: 'Genetics and Evolution', topics: ['Heredity principles', 'DNA and genes', 'Natural selection', 'Evolution evidence'] },
    { title: 'Health and Diseases', topics: ['Immunity', 'Infectious diseases', 'Nutrition and health', 'Public health habits'] },
    { title: 'Ecology and Environment', topics: ['Ecosystems', 'Food webs', 'Biodiversity', 'Conservation actions'] },
  ],
  History: [
    { title: 'Ancient India', topics: ['Harappan civilization', 'Vedic period', 'Mahajanapadas', 'Mauryan empire'] },
    { title: 'Medieval India', topics: ['Delhi Sultanate', 'Mughal empire', 'Bhakti movement', 'Regional kingdoms'] },
    { title: 'Modern India', topics: ['European arrival', '1857 revolt', 'National movement', 'Independence and partition'] },
    { title: 'World History', topics: ['Renaissance', 'Industrial revolution', 'World wars', 'United Nations'] },
    { title: 'Constitution and Democracy', topics: ['Making of constitution', 'Fundamental rights', 'Elections', 'Institutions'] },
    { title: 'Project and Revision', topics: ['Timeline creation', 'Source analysis', 'Map history', 'Practice questions'] },
  ],
  Geography: [
    { title: 'Earth and Maps', topics: ['Latitudes and longitudes', 'Map scales', 'Topographic maps', 'Navigation basics'] },
    { title: 'Physical Geography', topics: ['Mountains and plains', 'Rivers and lakes', 'Volcanoes and earthquakes', 'Weathering'] },
    { title: 'Climate and Weather', topics: ['Atmosphere layers', 'Monsoon system', 'Cyclones', 'Climate change'] },
    { title: 'Resources and Development', topics: ['Natural resources', 'Water management', 'Agriculture', 'Industries'] },
    { title: 'India Geography', topics: ['Physiographic divisions', 'Soils and crops', 'Population patterns', 'Transport networks'] },
    { title: 'Human Geography', topics: ['Settlements', 'Migration', 'Urbanization', 'Sustainable cities'] },
  ],
};

export default function TutorPage() {
  const { user, language, currentLang } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useTranslation();
  const { speak, stopSpeech, isSpeaking, generateSpeech, playAudio, stopAudio, isLoading: ttsLoading } = useTTS();

  // Class 1–8 only (per accessibility/educational scope requirements)
  const classOptions = Array.from({ length: 8 }, (_, i) => `Class ${i + 1}`);
  const [selectedClass, setSelectedClass] = useState(() => localStorage.getItem('echoedu_selected_class') || location.state?.selectedClass || 'Class 1');
  const [selectedSubject, setSelectedSubject] = useState(() => localStorage.getItem('echoedu_selected_subject') || 'Mathematics');
  const [completedChapters, setCompletedChapters] = useState(() => Number(localStorage.getItem('echoedu_completed_chapters')) || 0);
  const [rewardPoints, setRewardPoints] = useState(() => Number(localStorage.getItem('echoedu_reward_points')) || 0);
  const [currentChapter, setCurrentChapter] = useState(() => Number(localStorage.getItem('echoedu_current_chapter')) || 1);
  const [selectedTopic, setSelectedTopic] = useState(() => localStorage.getItem('echoedu_selected_topic') || '');
  const [quizRequestedByUnit, setQuizRequestedByUnit] = useState(() => {
    try { return JSON.parse(localStorage.getItem('echoedu_quiz_requested_units') || '{}'); } catch { return {}; }
  });
  const [quizAnsweredByUnit, setQuizAnsweredByUnit] = useState(() => {
    try { return JSON.parse(localStorage.getItem('echoedu_quiz_answered_units') || '{}'); } catch { return {}; }
  });
  const [todayQuestions, setTodayQuestions] = useState(() => Number(localStorage.getItem('echoedu_today_questions')) || 0);
  const [todayChapters, setTodayChapters] = useState(() => Number(localStorage.getItem('echoedu_today_chapters')) || 0);
  const [streakDays, setStreakDays] = useState(() => Number(localStorage.getItem('echoedu_learning_streak')) || 1);
  const [lastActiveDate, setLastActiveDate] = useState(() => localStorage.getItem('echoedu_last_active_date') || '');
  const [lastBonusDate, setLastBonusDate] = useState(() => localStorage.getItem('echoedu_last_bonus_date') || '');
  const [celebrationText, setCelebrationText] = useState('');

  const getSubjectOptions = (classLevel) => {
    const classNumber = Number(classLevel.replace('Class ', '')) || 1;
    if (classNumber <= 5) return ['Mathematics', 'Science', 'English', 'Hindi', 'Social Studies'];
    if (classNumber <= 8) return ['Mathematics', 'Science', 'English', 'Hindi', 'Social Studies', 'Computer Science'];
    if (classNumber <= 10) return ['Mathematics', 'Science', 'English', 'History', 'Geography', 'Computer Science'];
    return ['Physics', 'Chemistry', 'Biology', 'Mathematics', 'English', 'Computer Science'];
  };

  const subjectOptions = getSubjectOptions(selectedClass);
  const chapterData = useMemo(
    () => SUBJECT_CHAPTER_LIBRARY[selectedSubject] || [
      { title: `${selectedSubject} Foundations`, topics: ['Basics', 'Key concepts', 'Guided examples', 'Practice questions'] },
      { title: `${selectedSubject} Intermediate`, topics: ['Core principles', 'Applications', 'Problem-solving', 'Quick revision'] },
      { title: `${selectedSubject} Advanced`, topics: ['Deep learning', 'Case studies', 'Challenge tasks', 'Assessment prep'] },
    ],
    [selectedSubject]
  );
  const totalChapters = chapterData.length;
  const activeChapter = chapterData[Math.max(currentChapter - 1, 0)] || chapterData[0];
  const activeTopics = activeChapter?.topics || [];
  const currentUnitKey = `${selectedClass}|${selectedSubject}|${currentChapter}`;
  const hasRequestedUnitQuiz = Boolean(quizRequestedByUnit[currentUnitKey]);
  const hasAnsweredUnitQuiz = Boolean(quizAnsweredByUnit[currentUnitKey]);
  const canMarkCurrentChapter = hasAnsweredUnitQuiz && completedChapters < currentChapter;
  const todayKey = new Date().toISOString().slice(0, 10);
  const dailyQuestionGoal = 5;
  const dailyChapterGoal = 1;
  const xp = rewardPoints * 10;
  const level = Math.floor(xp / 120) + 1;
  const currentLevelXp = xp % 120;
  const questProgress = Math.min(100, Math.round(((Math.min(todayQuestions, dailyQuestionGoal) / dailyQuestionGoal) * 60) + ((Math.min(todayChapters, dailyChapterGoal) / dailyChapterGoal) * 40)));
  const unlockedBadges = [
    { label: 'Curious Star', icon: '🌟', unlocked: todayQuestions >= 3 },
    { label: 'Quiz Hero', icon: '🧩', unlocked: Object.keys(quizAnsweredByUnit).length >= 2 },
    { label: 'Chapter Champ', icon: '🏆', unlocked: completedChapters >= 3 },
    { label: 'Streak Master', icon: '🔥', unlocked: streakDays >= 3 },
  ];

  useEffect(() => {
    const savedClass = location.state?.selectedClass;
    if (savedClass) {
      setSelectedClass(savedClass);
      localStorage.setItem('echoedu_selected_class', savedClass);
      window.history.replaceState({}, '');
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.state]);

  useEffect(() => {
    localStorage.setItem('echoedu_selected_class', selectedClass);
    if (!subjectOptions.includes(selectedSubject)) {
      const fallbackSubject = subjectOptions[0];
      setSelectedSubject(fallbackSubject);
      localStorage.setItem('echoedu_selected_subject', fallbackSubject);
    }
  }, [selectedClass, subjectOptions, selectedSubject]);

  useEffect(() => {
    localStorage.setItem('echoedu_selected_subject', selectedSubject);
    setCurrentChapter(1);
    setCompletedChapters(0);
  }, [selectedSubject]);

  useEffect(() => {
    localStorage.setItem('echoedu_completed_chapters', completedChapters);
  }, [completedChapters]);

  useEffect(() => {
    localStorage.setItem('echoedu_reward_points', rewardPoints);
  }, [rewardPoints]);

  useEffect(() => {
    if (currentChapter > totalChapters) {
      setCurrentChapter(totalChapters);
      return;
    }
    localStorage.setItem('echoedu_current_chapter', String(currentChapter));
  }, [currentChapter, totalChapters]);

  useEffect(() => {
    const defaultTopic = chapterData[Math.max(currentChapter - 1, 0)]?.topics?.[0] || '';
    if (!activeTopics.includes(selectedTopic)) setSelectedTopic(defaultTopic);
  }, [chapterData, currentChapter, selectedTopic, activeTopics]);

  useEffect(() => {
    localStorage.setItem('echoedu_selected_topic', selectedTopic);
  }, [selectedTopic]);

  useEffect(() => {
    localStorage.setItem('echoedu_quiz_requested_units', JSON.stringify(quizRequestedByUnit));
  }, [quizRequestedByUnit]);

  useEffect(() => {
    localStorage.setItem('echoedu_quiz_answered_units', JSON.stringify(quizAnsweredByUnit));
  }, [quizAnsweredByUnit]);

  useEffect(() => {
    if (!lastActiveDate) {
      setLastActiveDate(todayKey);
      localStorage.setItem('echoedu_last_active_date', todayKey);
      return;
    }

    if (lastActiveDate === todayKey) return;

    const diffDays = Math.round((new Date(todayKey) - new Date(lastActiveDate)) / (1000 * 60 * 60 * 24));
    const nextStreak = diffDays === 1 ? streakDays + 1 : 1;
    setStreakDays(nextStreak);
    setTodayQuestions(0);
    setTodayChapters(0);
    setLastActiveDate(todayKey);
    localStorage.setItem('echoedu_today_questions', '0');
    localStorage.setItem('echoedu_today_chapters', '0');
    localStorage.setItem('echoedu_learning_streak', String(nextStreak));
    localStorage.setItem('echoedu_last_active_date', todayKey);
  }, [lastActiveDate, streakDays, todayKey]);

  useEffect(() => {
    localStorage.setItem('echoedu_today_questions', String(todayQuestions));
  }, [todayQuestions]);

  useEffect(() => {
    localStorage.setItem('echoedu_today_chapters', String(todayChapters));
  }, [todayChapters]);

  useEffect(() => {
    localStorage.setItem('echoedu_learning_streak', String(streakDays));
  }, [streakDays]);

  useEffect(() => {
    if (!celebrationText) return undefined;
    const timeout = setTimeout(() => setCelebrationText(''), 2400);
    return () => clearTimeout(timeout);
  }, [celebrationText]);

  const defaultHighContrast = user?.disability === 'lowVision';
  const defaultSimpleMode = user?.disability === 'cognitive';
  const defaultFontSize = user?.disability === 'lowVision' ? 'xlarge' : 'normal';
  const highContrast = localStorage.getItem('echoedu_hc') === '1' || defaultHighContrast;
  const switchAccess = localStorage.getItem('echoedu_sa') === '1';
  const fontSize = localStorage.getItem('echoedu_fs') || defaultFontSize;
  const simpleMode = localStorage.getItem('echoedu_simple') === '1' || defaultSimpleMode;

  const [messages, setMessages] = useState([{
    role: 'assistant',
    content: cleanTutorText(`${t('Hello! I am EchoEdu, your personal AI tutor.')}\n${t('Pick a chapter and topic, then tap')} "${t('Teach this topic')}" ${t('for a guided lesson.')}\n\n${t('After the lesson, you can ask doubts and request')} "${t('Give me questions')}".`),
  }]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [ttsMessageIndex, setTtsMessageIndex] = useState(null);
  const chatEndRef = useRef(null);
  const inputRef = useRef(null);
  // Ref to always hold the latest sendMessage — prevents stale closure in voice callbacks
  const sendMessageRef = useRef(null);

  useEffect(() => {
    const autoAsk = location.state?.autoAsk;
    if (autoAsk) {
      window.history.replaceState({}, '');
      setTimeout(() => sendMessage(autoAsk), 400);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    if (!switchAccess) return undefined;
    const handleKey = (e) => {
      if (e.key === 'Enter' && document.activeElement !== inputRef.current && document.activeElement !== document.body) {
        e.preventDefault();
        if (document.activeElement?.click) document.activeElement.click();
      }
    };
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, [switchAccess]);

  const speakAssistantText = (text, messageIndex) => {
    const speakableText = text?.slice(0, MAX_TTS_CHARS);
    if (!speakableText) return;

    setTtsMessageIndex(messageIndex);
    // Use browser SpeechSynthesis via the updated useTTS hook
    speak(speakableText, language);
    // Clear the playing indicator after a short delay (utterance handles state)
    setTimeout(() => setTtsMessageIndex(null), 500);
  };

  const sendMessage = async (text, options = {}) => {
    const { isSystemPrompt = false } = options;
    const trimmed = (text || input).trim();
    if (!trimmed || loading) return;

    setInput('');
    setError('');
    // Stop any ongoing speech before sending a new message
    stopSpeech();
    stopAudio();

    if (!isSystemPrompt && hasRequestedUnitQuiz && !hasAnsweredUnitQuiz) {
      setQuizAnsweredByUnit((prev) => ({ ...prev, [currentUnitKey]: true }));
    }

    const newMessages = [...messages, { role: 'user', content: trimmed }];
    setMessages(newMessages);
    setLoading(true);

    try {
      const apiMessages = newMessages.map((m) => ({ role: m.role, content: m.content }));
      const reply = await askAI(apiMessages, language, selectedClass, selectedSubject);
      const questionCount = newMessages.filter((m) => m.role === 'user').length;
      let motivationalMessage = '';
      if (questionCount % 5 === 0) {
        const motivations = [
          t("Great questions! You're learning fast!"),
          t("Keep it up! You're becoming a subject expert!"),
          t("Amazing curiosity! That's how champions learn!"),
          t("You're doing fantastic. Learning is your superpower!"),
        ];
        motivationalMessage = `\n\n${motivations[Math.floor(Math.random() * motivations.length)]}`;
      }
      const cleanedReply = cleanTutorText(`${reply}${motivationalMessage}`);
      const assistantIndex = newMessages.length;
      setMessages([...newMessages, { role: 'assistant', content: cleanedReply }]);
      setRewardPoints((prev) => prev + 1);
      setTodayQuestions((prev) => prev + 1);
      speakAssistantText(cleanedReply, assistantIndex);
    } catch (err) {
      setError(err.message || 'Failed to get a response. Check your API key.');
    } finally {
      setLoading(false);
    }
  };

  // Keep sendMessageRef current so the voice hook always calls the latest version
  // (avoids stale closure over `loading`, `messages`, etc.)
  useEffect(() => {
    sendMessageRef.current = sendMessage;
  });

  const handleTTSForMessage = (messageIndex) => {
    const message = messages[messageIndex];
    if (!message || message.role !== 'assistant') return;
    // Stop current speech then replay the selected message
    stopSpeech();
    speakAssistantText(message.content, messageIndex);
  };

  const buildTopicPrompt = (mode = 'teach') => {
    const chapterTitle = activeChapter?.title || `${t('Chapter')} ${currentChapter}`;
    const topic = selectedTopic || activeTopics[0];
    if (!topic) return '';

    if (mode === 'quiz') {
      return `Create a short quiz for ${selectedClass} ${selectedSubject}, chapter "${chapterTitle}", topic "${topic}". Ask 5 kid-friendly questions with mixed formats (MCQ and short answer), then say: "Answer when ready and I will check your work."`;
    }

    return `Teach this topic for ${selectedClass}: subject "${selectedSubject}", chapter "${chapterTitle}", topic "${topic}". Keep explanation simple and kid-friendly, include one real-life example, one memory trick, then ask 3 practice questions and invite student doubts.`;
  };

  const startTopicLesson = () => {
    const prompt = buildTopicPrompt('teach');
    if (prompt) sendMessage(prompt);
  };

  const startTopicQuiz = () => {
    const prompt = buildTopicPrompt('quiz');
    if (prompt) {
      setQuizRequestedByUnit((prev) => ({ ...prev, [currentUnitKey]: true }));
      sendMessage(prompt, { isSystemPrompt: true });
    }
  };

  const claimDailyBonus = () => {
    if (lastBonusDate === todayKey) return;
    const bonus = 2 + Math.floor(Math.random() * 7);
    setRewardPoints((prev) => prev + bonus);
    setLastBonusDate(todayKey);
    localStorage.setItem('echoedu_last_bonus_date', todayKey);
    setCelebrationText(`🎁 Daily bonus unlocked: +${bonus} points!`);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  // Voice input hook — auto-sends when speech recognition ends
  const { isListening, isSupported: micSupported, transcript: liveTranscript, startListening, stopListening } = useVoiceInput({
    language,
    // Use the ref so we always call the freshest sendMessage, never a stale copy
    onTranscript: (text) => {
      sendMessageRef.current?.(text);
    },
  });

  // While listening, mirror live transcript into the textarea
  useEffect(() => {
    if (isListening && liveTranscript) {
      setInput(liveTranscript);
    }
  }, [liveTranscript, isListening]);

  const handleMicClick = () => {
    if (isListening) {
      stopListening();
    } else {
      // Clear input before starting so only voice text appears
      setInput('');
      startListening();
    }
  };

  const handleStopSpeaking = () => {
    stopSpeech();
  };

  const rootClass = [
    'tutor-page',
    highContrast ? 'high-contrast' : '',
    switchAccess ? 'switch-access' : '',
    simpleMode ? 'simple-mode' : '',
    `font-size-${fontSize}`,
  ].filter(Boolean).join(' ');

  return (
    <div className={rootClass} role="main">
      <a href="#chat-area" className="skip-link">{t('Skip to chat')}</a>

      <div className="tutor-header" role="banner">
        <button className="tutor-back" onClick={() => navigate('/dashboard')} aria-label={t('Go back to dashboard')}>← {t('Back')}</button>
        <div className="tutor-title-area">
          <h1>{t('EchoEdu AI Tutor')}</h1>
          <span className="tutor-lang-tag" aria-label={`Current language: ${currentLang.name}`}>🌐 {currentLang.native}</span>
        </div>
        <div className="tutor-header-right">
          <LanguageSelector compact />
        </div>
      </div>

      <div className="tutor-body">
        <aside className="tutor-sidepanel" aria-label={t('Class and subject selection')}>
          <div className="panel-block">
            <h2>{t('Learning level')}</h2>
            <p className="panel-note">{t('Choose your class for right difficulty.')}</p>
            <label htmlFor="tutor-class-select">{t('Class')}</label>
            <select id="tutor-class-select" value={selectedClass} onChange={(e) => setSelectedClass(e.target.value)} aria-label={t('Select class level')}>
              {classOptions.map((className) => <option key={className} value={className}>{className}</option>)}
            </select>
          </div>

          <div className="panel-block">
            <h2>{t('Subject')}</h2>
            <p className="panel-note">{t('Pick a subject to unlock topic-wise learning.')}</p>
            <label htmlFor="tutor-subject-select">{t('Subject')}</label>
            <select id="tutor-subject-select" value={selectedSubject} onChange={(e) => setSelectedSubject(e.target.value)} aria-label={t('Select subject')}>
              {subjectOptions.map((subject) => <option key={subject} value={subject}>{subject}</option>)}
            </select>
          </div>

          <div className="panel-block">
            <h2>{t('Chapters and Topics')}</h2>
            <p className="panel-note">{t('Every chapter has focused topics. Choose one and start learning!')}</p>
            <label htmlFor="tutor-chapters-select">{t('Chapter')}</label>
            <select id="tutor-chapters-select" value={currentChapter} onChange={(e) => setCurrentChapter(Number(e.target.value))} aria-label={t('Select chapter')}>
              {chapterData.map((chapter, idx) => (
                <option key={chapter.title} value={idx + 1}>{t('Chapter')} {idx + 1}: {chapter.title}</option>
              ))}
            </select>

            <div className="chapter-progress">
              <div className="progress-header">
                <span>{t('Progress')}: {completedChapters}/{totalChapters}</span>
                <span className="reward-points">⭐ {rewardPoints} {t('points')}</span>
              </div>
              <div className="progress-bar">
                <div className="progress-fill" style={{ width: `${(completedChapters / totalChapters) * 100}%` }} />
              </div>

              <div className="chapter-navigation">
                <button className="chapter-btn" onClick={() => setCurrentChapter(Math.max(1, currentChapter - 1))} disabled={currentChapter <= 1} aria-label={t('Previous chapter')}>←</button>
                <span className="current-chapter">{activeChapter?.title || `${t('Chapter')} ${currentChapter}`}</span>
                <button className="chapter-btn" onClick={() => setCurrentChapter(Math.min(totalChapters, currentChapter + 1))} disabled={currentChapter >= totalChapters} aria-label={t('Next chapter')}>→</button>
              </div>

              <div className="topic-picker">
                <p className="topic-title">{t('Topics in this chapter')}</p>
                <div className="topic-list">
                  {activeTopics.map((topic) => (
                    <button key={topic} type="button" className={`topic-chip ${selectedTopic === topic ? 'active' : ''}`} onClick={() => setSelectedTopic(topic)}>
                      {topic}
                    </button>
                  ))}
                </div>
              </div>

              <button
                className="complete-chapter-btn"
                onClick={() => {
                  if (canMarkCurrentChapter) {
                    setCompletedChapters(currentChapter);
                    setRewardPoints((prev) => prev + 10);
                    setTodayChapters((prev) => prev + 1);
                    setCelebrationText('🎉 Chapter complete! You unlocked bonus XP!');
                    if (currentChapter < totalChapters) setCurrentChapter(currentChapter + 1);
                  }
                }}
                disabled={!canMarkCurrentChapter}
              >
                {completedChapters >= currentChapter
                  ? t('Completed ✓')
                  : canMarkCurrentChapter
                    ? t('Mark Complete')
                    : t('Solve unit questions first')}
              </button>
              {!hasRequestedUnitQuiz && completedChapters < currentChapter && (
                <p className="unit-rule-note">📝 {t('Tap "Give me questions" for this chapter to unlock completion.')}</p>
              )}
              {hasRequestedUnitQuiz && !hasAnsweredUnitQuiz && completedChapters < currentChapter && (
                <p className="unit-rule-note">✅ {t('Now answer the quiz in chat to unlock completion.')}</p>
              )}
            </div>
          </div>

          <div className="panel-block panel-summary">
            <h2>{t('Current focus')}</h2>
            <p>{t('EchoEdu will answer as a teacher for')} {selectedClass} {t('in')} <strong>{` ${selectedSubject}`}</strong>.</p>
            <p>{t('Current chapter')}: <strong>{activeChapter?.title || `${t('Chapter')} ${currentChapter}`}</strong></p>
            <p>{t('Selected topic')}: <strong>{selectedTopic || activeTopics[0]}</strong></p>

            <div className="gamification-summary">
              <div className="achievement-badges">
                {completedChapters >= 5 && <span className="badge" title={t('5 Chapters Completed!')}>🏅</span>}
                {completedChapters >= 10 && <span className="badge" title={t('10 Chapters Completed!')}>🎖️</span>}
                {completedChapters >= totalChapters && <span className="badge" title={t('Subject Master!')}>👑</span>}
              </div>
              <div className="topic-actions">
                <button className="topic-action-btn" onClick={startTopicLesson} type="button">🧠 {t('Teach this topic')}</button>
                <button className="topic-action-btn secondary" onClick={startTopicQuiz} type="button">📝 {t('Give me questions')}</button>
              </div>
            </div>
          </div>

        </aside>

        <div className="tutor-main">
          {celebrationText && <div className="celebration-banner">{celebrationText}</div>}
          <div className="tutor-chat" id="chat-area" role="log" aria-label={t('Conversation')} aria-live="polite">
            {messages.map((msg, i) => (
              <div key={i} className={`chat-bubble-wrap ${msg.role}`}>
                <div className={`chat-bubble ${msg.role}`} role="article" aria-label={msg.role === 'assistant' ? t('AI Tutor message') : t('Your message')}>
                  <span className="bubble-author" aria-hidden="true">{msg.role === 'assistant' ? '🤖 EchoEdu' : '👤 You'}</span>
                  {msg.role === 'assistant' && (
                    <div className="msg-controls">
                      <button
                        type="button"
                        className={`tts-msg-btn ${ttsMessageIndex === i ? 'playing' : ''}`}
                        onClick={() => handleTTSForMessage(i)}
                        disabled={ttsLoading}
                        aria-label={t('Speak this message aloud')}
                        title={t('Speak this message')}
                      >
                        {ttsLoading && ttsMessageIndex === i ? '🔄' : '🔊'}
                      </button>
                      {/* Stop speaking button — only visible while AI is speaking this message */}
                      {isSpeaking && ttsMessageIndex === i && (
                        <button
                          type="button"
                          className="stop-speaking-btn"
                          onClick={handleStopSpeaking}
                          aria-label={t('Stop speaking')}
                          title={t('Stop speaking')}
                        >
                          ⏹
                        </button>
                      )}
                    </div>
                  )}
                  <p>{msg.content}</p>
                </div>
              </div>
            ))}
            {loading && (
              <div className="chat-bubble-wrap assistant" role="status" aria-label={t('AI is thinking')}>
                <div className="chat-bubble assistant typing">
                  <span className="bubble-author">🤖 EchoEdu</span>
                  <div className="typing-dots" aria-hidden="true"><span /><span /><span /></div>
                </div>
              </div>
            )}
            {error && (
              <div className="tutor-error" role="alert">
                ⚠️ {error}
                {error.includes('API key') && <span> — {t('Edit your .env file and set VITE_GROQ_API_KEY')}</span>}
              </div>
            )}
            <div ref={chatEndRef} aria-hidden="true" />
          </div>

          <div className="tutor-input-area" role="form" aria-label={t('Send a message')}>
            <div className="tutor-input-row">
              <textarea
                ref={inputRef}
                className="tutor-textarea"
                placeholder={isListening ? t('Listening…') : `${t('Ask anything in')} ${currentLang.native}…`}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                rows={1}
                disabled={loading}
                aria-label={`${t('Type your question in')} ${currentLang.name}`}
                aria-multiline="false"
              />
              {/* Mic button — only shown if browser supports SpeechRecognition */}
              {micSupported && (
                <button
                  type="button"
                  className={`mic-btn${isListening ? ' listening' : ''}`}
                  onClick={handleMicClick}
                  disabled={loading}
                  aria-label={isListening ? t('Stop listening') : t('Start voice input')}
                  aria-pressed={isListening}
                  title={isListening ? t('Stop listening') : t('Speak your question')}
                >
                  {isListening ? '🔴' : '🎤'}
                </button>
              )}
              <button className="send-btn" onClick={() => sendMessage()} disabled={loading || !input.trim()} aria-label={t('Send message')}>➤</button>
            </div>
            <p className="tutor-hint" aria-live="polite">
              {isListening
                ? t('Listening… speak now')
                : isSpeaking
                ? t('AI is speaking…')
                : t('Press Enter to send')}
              {switchAccess && ` • ${t('Tab to navigate, Enter to activate')}`}
            </p>
            {/* Global stop-speaking button — visible whenever AI is speaking, regardless of message index */}
            {isSpeaking && (
              <button
                type="button"
                className="stop-speaking-btn stop-speaking-global"
                onClick={handleStopSpeaking}
                aria-label={t('Stop speaking')}
                title={t('Stop AI voice')}
              >
                ⏹ {t('Stop speaking')}
              </button>
            )}
          </div>
        </div>

        <aside className="tutor-gamepanel" aria-label={t('Game zone')}>
          <div className="panel-block game-zone">
            <h2>🎮 {t('Game Zone')}</h2>
            <p className="panel-note">{t('Level up by learning every day!')}</p>

            <div className="level-card">
              <div className="level-head">
                <span>⭐ {t('Level')} {level}</span>
                <span>{currentLevelXp}/120 XP</span>
              </div>
              <div className="level-bar">
                <div className="level-fill" style={{ width: `${(currentLevelXp / 120) * 100}%` }} />
              </div>
              <p className="streak-chip">🔥 {streakDays} {t('day streak')}</p>
            </div>

            <div className="mission-card">
              <p><strong>{t('Daily Missions')}</strong></p>
              <p>💬 {todayQuestions}/{dailyQuestionGoal} {t('questions asked')}</p>
              <p>📘 {todayChapters}/{dailyChapterGoal} {t('chapters completed')}</p>
              <div className="mission-bar">
                <div className="mission-fill" style={{ width: `${questProgress}%` }} />
              </div>
            </div>

            <div className="badge-row">
              {unlockedBadges.filter((b) => b.unlocked).map((badge) => (
                <span key={badge.label} className="mini-badge" title={badge.label}>{badge.icon}</span>
              ))}
              {unlockedBadges.every((b) => !b.unlocked) && <span className="no-badge">{t('Earn badges by learning!')}</span>}
            </div>

            <button
              type="button"
              className="daily-bonus-btn"
              onClick={claimDailyBonus}
              disabled={lastBonusDate === todayKey}
            >
              {lastBonusDate === todayKey ? `✅ ${t('Daily bonus claimed')}` : `🎁 ${t('Claim daily bonus')}`}
            </button>
          </div>
        </aside>
      </div>
    </div>
  );
}
