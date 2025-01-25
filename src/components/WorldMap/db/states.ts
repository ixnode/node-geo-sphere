/* Import europa states. */
import statesEuropaGermany from './states/europe/germany.json';
import {TypeTranslation} from "./_types/typws";

/**
 * General types.
 */
export type TypeStateData = {[key: string]: TypeState};

/**
* State type
*/
export type TypeState = {
    name: string;

    code: string;
    country: string;

    population: number|null;
    area: number|null;

    translation: TypeTranslation;
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
