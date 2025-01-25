/* Import json. */
import countriesGeneral from './countries/_general.json';
import countriesUnknown from './countries/_unknown.json';
import countriesAfrica from './countries/africa.json';
import countriesAmericaNorth from './countries/america-north.json';
import countriesAmericaSouth from './countries/america-south.json';
import countriesAsia from './countries/asia.json';
import countriesEurope from './countries/europe.json';
import countriesOceania from './countries/oceania.json';

/* Import types. */
import {TypeTranslation} from "./_types/types";

/* Import interfaces. */
import {CountryData, Point} from "../config/interfaces";

/* Import configuration. */
import {defaultLanguage} from "../../../config/config";

/* Import tools. */
import {getTranslatedName} from "../tools/language";
import {textNotAvailable} from "../tools/interaction";
import {TypeCity} from "./cities";

/**
 * General types.
 */
export type TypeCountryData = {[key: string]: TypeCountry};

/**
 * Country type
 */
export type TypeCountry = {
    code: string|null;

    translation: TypeTranslation;
};

/**
 * Country map cache.
 */
let cachedCountryMap: TypeCountryData|null = null;

/**
 * Returns all countries.
 */
export const getCountries = (): TypeCountry[] => {
    return [
        /* Add general countries. */
        ...(countriesGeneral.data as TypeCountry[]),
        ...(countriesUnknown.data as TypeCountry[]),

        /* Add real countries. */
        ...(countriesAfrica.data as TypeCountry[]),
        ...(countriesAmericaNorth.data as TypeCountry[]),
        ...(countriesAmericaSouth.data as TypeCountry[]),
        ...(countriesAsia.data as TypeCountry[]),
        ...(countriesEurope.data as TypeCountry[]),
        ...(countriesOceania.data as TypeCountry[]),
    ];
};

/**
 * Convert countries to easy accessible array (map).
 */
export const getCountryMap = (): TypeCountryData => {
    if (cachedCountryMap === null) {
        cachedCountryMap = getCountries().reduce((map, country) => {
            map[country.code ?? ''] = country;
            return map;
        }, {} as TypeCountryData);
    }
    return cachedCountryMap;
};

/**
 * Get country by given country code.
 */
export const getCountryByCountryCode = (countryCode: string|null): TypeCountry|null => {

    if (countryCode === null) {
        return null;
    }

    const countryMap = getCountryMap();

    if (!(countryCode in countryMap)) {
        return null;
    }

    return countryMap[countryCode];
};

/**
 * Get country by given place
 */
export const getCountryByPlace = (place: TypeCity): TypeCountry|null => {
    return getCountryByCountryCode(place.country);
}

/**
 * Converts the given TypeCountry to CountryData.
 *
 * @param country
 * @param language
 * @param point
 * @param svgPoint
 */
export const getCountryDataByCountry = (
    country: TypeCountry,
    point: Point|null = null,
    svgPoint: SVGPoint|null = null,
    language: string = defaultLanguage
): CountryData => {

    let data: CountryData = {
        id: country.code ?? textNotAvailable,
        name: getTranslatedName(country, language),
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
            y: svgPoint.y,
        }
    }

    return data;
}
