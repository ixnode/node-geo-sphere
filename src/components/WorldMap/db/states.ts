/* Import europa states. */
import statesEuropaGermany from './states/europe/germany.json';

/**
 * General types.
 */
export type TypeStateData = {[key: string]: TypeState};
export type TypeStateTranslation = {
    cs: string|null; /* Czech */
    de: string|null; /* German */
    en: string|null; /* English */
    es: string|null; /* Spanish */
    fr: string|null; /* French */
    hr: string|null; /* Croatian */
    it: string|null; /* Italian */
    pl: string|null; /* Polish */
    sv: string|null; /* Swedish */
};

/**
* State type
*/
export type TypeState = {
    name: string;

    code: string;
    country: string;

    population: number|null;
    area: number|null;

    translation: TypeStateTranslation;
}

export const getStates = (): TypeState[] => {
    return [
        /* Africa cities. */

        /* America cities. */

        /* Asia cities. */

        /* Europa cities. */
        ...(statesEuropaGermany.data as TypeState[]),

        /* Oceania cities. */
    ];
};
