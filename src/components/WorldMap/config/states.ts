/* Import db. */
import {getStates, TypeStateData} from "../db/states";

/**
 * State map cache.
 */
let cachedStateMap: TypeStateData|null = null;

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
