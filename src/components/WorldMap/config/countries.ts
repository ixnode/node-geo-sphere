/* Import db. */
import {countries, TypeCountryData} from "../db/countries";

/**
 * Country map cache.
 */
let cachedCountryMap: TypeCountryData|null = null;

/**
 * Convert countries to easy accessible array.
 */
export const getCountryMap = (): TypeCountryData => {
    if (cachedCountryMap === null) {
        cachedCountryMap = countries.reduce((map, country) => {
            map[country.code ?? ''] = country;
            return map;
        }, {} as TypeCountryData);
    }
    return cachedCountryMap;
};
