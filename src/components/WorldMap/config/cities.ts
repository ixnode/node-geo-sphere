/* Import db. */
import {cities, TypeCityData} from "../db/cities";

/* Import tools. */
import {getIdFromPlace} from "../tools/interaction";

/**
 * General names.
 */
export const typeCityTypeNameCapital = "capital";
export const typeCityTypeNameStateCapital = "state-capital";
export const typeCityTypeNameCity = 'city';

/**
 * General distances.
 */
export const distanceCityTypeNameCity = 2;
export const distanceCityTypeNameStateCapital = 3;
export const distanceCityTypeNameCapital = 5;

/**
* City map cache.
*/
let cachedCityMap: TypeCityData|null = null;

/**
 * Convert cities to easy accessible array.
 */
export const getCityMap = (): TypeCityData => {
    if (cachedCityMap === null) {
        cachedCityMap = cities.reduce((map, city) => {
            map[getIdFromPlace(city.name)] = city;
            return map;
        }, {} as TypeCityData);
    }
    return cachedCityMap;
};
