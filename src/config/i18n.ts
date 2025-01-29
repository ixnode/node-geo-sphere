import i18n from 'i18next';
import {initReactI18next} from 'react-i18next';

import translationCS from '../locales/cs/translation.json';
import translationDE from '../locales/de/translation.json';
import translationEN from '../locales/en/translation.json';
import translationES from '../locales/es/translation.json';
import translationFR from '../locales/fr/translation.json';
import translationHR from '../locales/hr/translation.json';
import translationIT from '../locales/it/translation.json';
import translationPL from '../locales/pl/translation.json';
import translationSV from '../locales/sv/translation.json';

/* Import configurations. */
import {defaultLanguage} from "./config";

/* General translation */
const resources = {
    cs: { translation: translationCS, },
    de: { translation: translationDE, },
    en: { translation: translationEN, },
    es: { translation: translationES, },
    fr: { translation: translationFR, },
    hr: { translation: translationHR, },
    it: { translation: translationIT, },
    pl: { translation: translationPL, },
    sv: { translation: translationSV, },
};

i18n
    .use(initReactI18next)
    .init({
        resources,
        lng: defaultLanguage,
        fallbackLng: defaultLanguage,
        interpolation: {
            escapeValue: false,
        },
    })
;

export {
    i18n
};

export const defaultLanguageOptions = {
    Croatian: 'hr',
    Czech: 'cs',
    English: 'en',
    French: 'fr',
    German: 'de',
    Italian: 'it',
    Polish: 'pl',
    Spanish: 'es',
    Swedish: 'sv',
} as const;