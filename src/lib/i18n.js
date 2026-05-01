import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

import fr from '../locales/fr.json'
import en from '../locales/en.json'

i18n 
    .use(LanguageDetector)
    .use(initReactI18next)
    .init({
        fallbackLng: 'fr',
        resources: {
            fr: { transalation: fr},
            en: { transalation: en}
        }
    })
    
export default i18n;