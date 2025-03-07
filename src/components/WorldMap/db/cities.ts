/* Import capitals. */
import citiesAfrica from './cities/africa.json';
import citiesAmerica from './cities/america.json';
import citiesAsia from './cities/asia.json';
import citiesEurope from './cities/europe.json';
import citiesOceania from './cities/oceania.json';

/* Import american cities. */
import citiesAmericaUnitedStates from './cities/america/united-states.json';

/* Import europa cities. */
import citiesEuropaCzech from './cities/europe/czechia.json';
import citiesEuropaFrance from './cities/europe/france.json';
import citiesEuropaGermany from './cities/europe/germany.json';
import citiesEuropaPoland from './cities/europe/poland.json';
import citiesEuropaSpain from './cities/europe/spain.json';
import citiesEuropaUnitedKingdom from './cities/europe/united-kingdom.json';

/* Import types. */
import {TypeTranslation} from "./_types/types";

/* Import tools. */
import {getIdFromPlace} from "../tools/interaction";
import {getTranslatedName} from "../tools/language";

/* Import interfaces. */
import {PlaceData, Point} from "../config/interfaces";

/* Import configuration. */
import {defaultLanguage} from "../../../config/config";
import {getCountryByPlace, getCountryDataByCountry} from "./countries";
import {getStateByPlace, getStateDataByState} from "./states";

/**
 * General types.
 */
export type TypeCityData = {[key: string]: TypeCity};
export type TypeCityType = "capital"|"state-capital"|"city";
export type TypeCitySize = "smallest"|"smaller"|"standard"|"bigger"|"biggest";
export type TypeCityAlignment = "left"|"right"|"top"|"bottom";
export type TypeCityCoordinate = {
    longitude: number;
    latitude: number;
};
export type TypeCityMoveText = {
    x: number;
    y: number;
};
export type TypeSvgClass = "move"|"zoom"|"pointer";

/**
 * City type
 *
 * @see: JSON schema - src/components/WorldMap/db/cities/_schema/cities.schema.json
 */
export type TypeCity = {
    /* General properties. */
    name: string;
    type: TypeCityType;
    state: string|null;
    country: string;

    /* Other properties. */
    coordinate: TypeCityCoordinate;
    coordinateDisplay?: TypeCityCoordinate;
    moveText?: TypeCityMoveText;
    priority: number;
    population: number|null;
    area?: number|null;
    altitude?: number|null;

    /* Translations. */
    translation: TypeTranslation;

    /* Styles. */
    size: TypeCitySize;
    alignment?: TypeCityAlignment;
}

/**
 * City map cache.
 */
let cachedCityMap: TypeCityData|null = null;

/**
 * Returns all cities.
 */
export const getCities = (): TypeCity[] => {
    return [
        /* Capitals. */
        ...(citiesAfrica.data as TypeCity[]),
        ...(citiesAmerica.data as TypeCity[]),
        ...(citiesAsia.data as TypeCity[]),
        ...(citiesEurope.data as TypeCity[]),

        /* Africa cities. */

        /* America cities. */
        ...(citiesAmericaUnitedStates.data as TypeCity[]),

        /* Asia cities. */

        /* Europa cities. */
        ...(citiesOceania.data as TypeCity[]),
        ...(citiesEuropaCzech.data as TypeCity[]),
        ...(citiesEuropaFrance.data as TypeCity[]),
        ...(citiesEuropaGermany.data as TypeCity[]),
        ...(citiesEuropaPoland.data as TypeCity[]),
        ...(citiesEuropaSpain.data as TypeCity[]),
        ...(citiesEuropaUnitedKingdom.data as TypeCity[]),

        /* Oceania cities. */
    ];
};

/**
 * Convert cities to easy accessible array.
 */
export const getCityMap = (): TypeCityData => {
    if (cachedCityMap === null) {
        cachedCityMap = getCities().reduce((map, city) => {
            map[getIdFromPlace(city.name)] = city;
            return map;
        }, {} as TypeCityData);
    }
    return cachedCityMap;
};



/**
 * Returns the place by given place id.
 *
 * @param placeId
 */
export const getPlaceByPlaceId = (placeId: string): TypeCity|null => {

    const cityMap = getCityMap();

    if (!(placeId in cityMap)) {
        return null;
    }

    return cityMap[placeId];
}

/**
 * Converts the given TypeCity to PlaceData.
 *
 * @param place
 * @param language
 * @param point
 * @param svgPoint
 */
export const getPlaceDataByPlace = (
    place: TypeCity,
    point: Point|null = null,
    svgPoint: SVGPoint|null = null,
    language: string = defaultLanguage
): PlaceData => {
    let data: PlaceData = {
        id: getIdFromPlace(place.name),
        name: getTranslatedName(place, language),
        longitude: place.coordinate.longitude,
        latitude: place.coordinate.latitude,
    };

    /* Add point. */
    if (point) {
        data.screenPosition = {
            x: point.x,
            y: point.y,
        }
    }

    /* Add svg point. */
    if (svgPoint) {
        data.svgPosition = {
            x: svgPoint.x,
            y: -svgPoint.y,
        }
    }

    /* Add country. */
    const country = getCountryByPlace(place);
    if (country) {
        data.country = getCountryDataByCountry(country, null, null, language);
    }

    /* Add state. */
    const state = getStateByPlace(place);
    if (state) {
        data.state = getStateDataByState(state, null, null, language);
    }

    /* Add population. */
    if (place.population) {
        data.population = place.population;
    }

    /* Add area. */
    if (place.area) {
         data.area = place.area;
    }

    /* Add altitude. */
    if (place.altitude) {
         data.altitude = place.altitude;
    }

    return data;
}

