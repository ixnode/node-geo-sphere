/* Import capitals. */
import citiesAfrica from './cities/africa.json';
import citiesAmerica from './cities/america.json';
import citiesAsia from './cities/asia.json';
import citiesEurope from './cities/europe.json';
import citiesOceania from './cities/oceania.json';

/* Import europa cities. */
import citiesEuropaFrance from './cities/europe/france.json';
import citiesEuropaGermany from './cities/europe/germany.json';
import citiesEuropaUnitedKingdom from './cities/europe/united-kingdom.json';

/**
 * General types.
 */
export type TypeCityData = {[key: string]: TypeCity};
export type TypeCityType = "capital"|"state-capital"|"city";
export type TypeCitySize = "standard"|"smaller"|"bigger";
export type TypeCityCoordinate = {
    longitude: number;
    latitude: number;
};
export type TypeCityTranslation = {
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
* City type
*/
export type TypeCity = {
    coordinate: TypeCityCoordinate;
    priority: number;
    size: TypeCitySize;

    country: string;
    type: TypeCityType;

    name: string;

    translation: TypeCityTranslation;

    population: number|null;
}

export const getCities = (): TypeCity[] => {
    return [
        /* Capitals. */
        ...(citiesAfrica.data as TypeCity[]),
        ...(citiesAmerica.data as TypeCity[]),
        ...(citiesAsia.data as TypeCity[]),
        ...(citiesEurope.data as TypeCity[]),
        ...(citiesOceania.data as TypeCity[]),

        /* Africa cities. */

        /* America cities. */

        /* Asia cities. */

        /* Europa cities. */
        ...(citiesEuropaFrance.data as TypeCity[]),
        ...(citiesEuropaGermany.data as TypeCity[]),
        ...(citiesEuropaUnitedKingdom.data as TypeCity[]),

        /* Oceania cities. */
    ];
};
