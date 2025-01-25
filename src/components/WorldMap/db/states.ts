/* Import europa states. */
import statesEuropaFrance from './states/europe/france.json';
import statesEuropaGermany from './states/europe/germany.json';
import statesEuropaUnitedKingdom from './states/europe/united-kingdom.json';

/* Import types. */
import {TypeTranslation} from "./_types/types";
import {TypeCity} from "./cities";

/* Import interfaces. */
import {Point, StateData} from "../config/interfaces";

/* Import configuration. */
import {defaultLanguage} from "../../../config/config";

/* Import tools. */
import {getTranslatedName} from "../tools/language";

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

/**
 * State map cache.
 */
let cachedStateMap: TypeStateData|null = null;

/**
 * Return all states.
 */
export const getStates = (): TypeState[] => {
    return [
        /* Africa cities. */

        /* America cities. */

        /* Asia cities. */

        /* Europa cities. */
        ...(statesEuropaFrance.data as TypeState[]),
        ...(statesEuropaGermany.data as TypeState[]),
        ...(statesEuropaUnitedKingdom.data as TypeState[]),

        /* Oceania cities. */
    ];
};

/**
 * Convert states to easy accessible array.
 */
export const getStateMap = (): TypeStateData => {
    if (cachedStateMap === null) {
        cachedStateMap = getStates().reduce((map, country) => {
            map[country.code ?? ''] = country;
            return map;
        }, {} as TypeStateData);
    }
    return cachedStateMap;
};

/**
 * Get the state by given state code.
 *
 * @param stateCode
 */
export const getStateByStateCode = (stateCode: string|null): TypeState|null => {

    if (stateCode === null) {
        return null;
    }

    const stateMap = getStateMap();

    if (!(stateCode in stateMap)) {
        return null;
    }

    return stateMap[stateCode];
}

/**
 * Get the state by given place.
 *
 * @param place
 */
export const getStateByPlace = (place: TypeCity): TypeState|null => {
    return getStateByStateCode(place.state);
}

/**
 * Converts the given TypeState to StateData.
 *
 * @param state
 * @param language
 * @param point
 * @param svgPoint
 */
export const getStateDataByState = (
    state: TypeState,
    point: Point|null = null,
    svgPoint: SVGPoint|null = null,
    language: string = defaultLanguage
): StateData => {

    let data: StateData = {
        id: state.code,
        name: getTranslatedName(state, language),
        area: state.area,
        population: state.population,
    };

    if (point) {
        data.screenPosition = {
            x: point.x,
            y: point.y,
        }
    }

    if (svgPoint) {
        data.svgPosition = {
            x: svgPoint.x,
            y: -svgPoint.y,
        }
    }

    return data;

}































