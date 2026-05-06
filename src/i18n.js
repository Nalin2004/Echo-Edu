import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import { UI_STRINGS } from './utils/translate';
import hiTranslations from './translations/hi.json';
import bnTranslations from './translations/bn.json';
import teTranslations from './translations/te.json';
import mrTranslations from './translations/mr.json';
import taTranslations from './translations/ta.json';
import guTranslations from './translations/gu.json';
import knTranslations from './translations/kn.json';
import mlTranslations from './translations/ml.json';
import paTranslations from './translations/pa.json';
import orTranslations from './translations/or.json';
import urTranslations from './translations/ur.json';

const resources = {
  en: {
    translation: UI_STRINGS,
  },
  hi: {
    translation: hiTranslations,
  },
  bn: {
    translation: bnTranslations,
  },
  te: {
    translation: teTranslations,
  },
  mr: {
    translation: mrTranslations,
  },
  ta: {
    translation: taTranslations,
  },
  gu: {
    translation: guTranslations,
  },
  kn: {
    translation: knTranslations,
  },
  ml: {
    translation: mlTranslations,
  },
  pa: {
    translation: paTranslations,
  },
  or: {
    translation: orTranslations,
  },
  ur: {
    translation: urTranslations,
  },
};

export async function loadLanguageResources(lang) {
  if (lang === 'en') {
    i18n.addResourceBundle('en', 'translation', UI_STRINGS, true, true);
    await i18n.changeLanguage('en');
    return;
  }

  if (!resources[lang]) {
    await i18n.changeLanguage('en');
    return;
  }

  i18n.addResourceBundle(lang, 'translation', resources[lang].translation, true, true);
  await i18n.changeLanguage(lang);
}

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: 'en',
    fallbackLng: 'en',
    interpolation: { escapeValue: false },
    react: { useSuspense: false },
  });

export default i18n;
