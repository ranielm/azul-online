import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { translations, Language } from './translations';

interface LanguageStore {
  language: Language;
  setLanguage: (language: Language) => void;
}

export const useLanguageStore = create<LanguageStore>()(
  persist(
    (set) => ({
      language: 'pt-BR',
      setLanguage: (language) => set({ language }),
    }),
    {
      name: 'ladrilho-language',
    }
  )
);

export function useTranslation() {
  const { language } = useLanguageStore();
  const t = translations[language];
  return { t, language };
}
