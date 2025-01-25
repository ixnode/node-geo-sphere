/* Import configurations. */
import {getCountryMap} from "../config/countries";

/* Import other tools. */
import {textNotAvailable} from "./interaction";

/* Import types. */
import {TypeCountryKey} from "../types/types";

/* Import db types. */
import {TypeCity} from "../db/cities";
import {TypeTranslation} from "../db/_types/typws";

/**
 * Returns the language name of given language.
 *
 * @param language
 */
export const getLanguageNameCountry = (language: string): keyof TypeTranslation => {
    /* Reference a real TypeCountryTranslation object structure for the check. */
    const exampleTranslation: TypeTranslation = {
        cs: '',
        de: '',
        en: '',
        es: '',
        fr: '',
        hr: '',
        it: '',
        pl: '',
        sv: '',
    };

    language = language.toLowerCase();

    /* Check if key exists in exampleCountry */
    if (language in exampleTranslation) {
        return language as keyof TypeTranslation;
    }

    throw new Error(`Invalid language key: ${language}`);
}

/**
 * Returns the language name of given language.
 *
 * @param language
 */
export const getLanguageNamePlace = (language: string): keyof TypeTranslation => {
    /* Reference a real TypeCountry object structure for the check. */
    const exampleTranslation: TypeTranslation = {
        cs: '',
        de: '',
        en: '',
        es: '',
        fr: '',
        hr: '',
        it: '',
        pl: '',
        sv: '',
    };

    language = language.toLowerCase();

    /* Check if key exists in exampleCountry */
    if (language in exampleTranslation) {
        return language as keyof TypeTranslation;
    }

    throw new Error(`Invalid language key: ${language}`);
}

/**
 * Returns the translated name.
 *
 * @param data
 * @param language
 */
export const getTranslatedNamePlace = (data: TypeCity, language: string): string => {

    const languageName = getLanguageNamePlace(language);

    let value = null;

    if (languageName in data.translation) {
        value = data.translation[languageName];
    }

    if (value !== null) {
        return String(value);
    }

    if ('name' in data) {
        value = data.name;
    }

    if (value !== null) {
        return value;
    }

    return textNotAvailable;
}

/**
 * Returns the translation from countryMap.
 *
 * @see countryMap
 */
export const getTranslation = (country: TypeCountryKey|null): TypeTranslation|null => {

    if (country === null) {
        return null;
    }

    country = country.toLowerCase();

    const countryMap = getCountryMap();

    if (!countryMap.hasOwnProperty(country)) {
        return null;
    }

    return countryMap[country].translation;
}
