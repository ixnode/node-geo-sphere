/* Import configurations. */
import {TypeCountry} from "../config/countries";
import {TypeCity} from "../config/cities";
import {textNotAvailable} from "./interaction";

/**
 * Returns the language name of given language.
 *
 * @param language
 */
export const getLanguageNameCountry = (language: string): keyof TypeCountry => {
    /* Builds nameCz, nameDe, etc. */
    const key = 'name' + language.charAt(0).toUpperCase() + language.slice(1);

    /* Reference a real TypeCountry object structure for the check. */
    const exampleCountry: TypeCountry = {
        code: null,

        nameCz: '',
        nameDe: '',
        nameEn: '',
        nameEs: '',
        nameFr: '',
        nameHr: '',
        nameIt: '',
        namePl: '',
        nameSv: '',
    };

    /* Check if key exists in exampleCountry */
    if (key in exampleCountry) {
        return key as keyof TypeCountry;
    }

    throw new Error(`Invalid language key: ${language}`);
}

/**
 * Returns the language name of given language.
 *
 * @param language
 */
export const getLanguageNamePlace = (language: string): keyof TypeCity => {
    /* Builds nameCz, nameDe, etc. */
    const key = 'name' + language.charAt(0).toUpperCase() + language.slice(1);

    /* Reference a real TypeCountry object structure for the check. */
    const exampleCountry: TypeCity = {
        coordinate: [.0, .0],

        country: '',
        type: 'city',

        name: '',
        nameCz: '',
        nameDe: '',
        nameEn: '',
        nameEs: '',
        nameFr: '',
        nameHr: '',
        nameIt: '',
        namePl: '',
        nameSv: '',

        population: 0
    };

    /* Check if key exists in exampleCountry */
    if (key in exampleCountry) {
        return key as keyof TypeCity;
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

    if (languageName in data) {
        value = data[languageName];
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