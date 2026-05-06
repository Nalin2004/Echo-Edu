import { useTranslation as useReactTranslation } from 'react-i18next';

export function useTranslation() {
  const { t, i18n, ready } = useReactTranslation();
  return { t, i18n, ready };
}
