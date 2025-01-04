/* Import configurations. */
import {TypeCountry} from "../config/countries";

/**
 * Returns the language name of given language.
 *
 * @param language
 */
export const getLanguageName = (language: string): keyof TypeCountry => {
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