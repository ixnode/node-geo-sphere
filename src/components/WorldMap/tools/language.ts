/* Import other tools. */
import {textNotAvailable} from "./interaction";

/* Import types. */
import {TypeCountryKey} from "../types/types";

/* Import db types. */
import {TypeCity} from "../db/cities";

/* Import db data and types. */
import {TypeTranslation} from "../db/_types/types";
import {getCountryMap, TypeCountry} from "../db/countries";
import {TypeState} from "../db/states";

/**
 * Returns the language name of given language.
 *
 * @param language
 */
export const getLanguageName = (language: string): keyof TypeTranslation => {
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
 * Returns the translated name from given element (TypeCountry|TypeState|TypeCity).
 *
 * @param data
 * @param language
 */
export const getTranslatedName = (data: TypeCountry|TypeState|TypeCity, language: string): string => {

    const languageName = getLanguageName(language);

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
export const getTranslationCountry = (country: TypeCountryKey|null): TypeTranslation|null => {

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
