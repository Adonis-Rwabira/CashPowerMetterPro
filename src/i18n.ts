import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import HttpApi from 'i18next-http-backend';

i18n
  .use(HttpApi) // Charge les traductions via http
  .use(LanguageDetector) // Détecte la langue de l'utilisateur
  .use(initReactI18next) // Passe l'instance i18n à react-i18next
  .init({
    supportedLngs: ['en', 'fr', 'sw'],
    fallbackLng: 'fr', // Langue par défaut si la détection échoue
    debug: import.meta.env.DEV, // Active les logs en mode développement

    interpolation: {
      escapeValue: false, // React échappe déjà les valeurs
    },

    backend: {
      loadPath: '/locales/{{lng}}/{{ns}}.json', // Chemin vers les fichiers de traduction
    },
    react: {
      useSuspense: true, // Utilise React Suspense pour le chargement
    },
  });

export default i18n;
