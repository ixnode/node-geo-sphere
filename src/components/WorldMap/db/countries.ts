/* Import json. */
import countriesGeneral from './countries/_general.json';
import countriesUnknown from './countries/_unknown.json';
import countriesAfrica from './countries/africa.json';
import countriesAmericaNorth from './countries/america-north.json';
import countriesAmericaSouth from './countries/america-south.json';
import countriesAsia from './countries/asia.json';
import countriesEurope from './countries/europe.json';
import countriesOceania from './countries/oceania.json';

/**
 * General types.
 */
export type TypeCountryData = {[key: string]: TypeCountry};
export type TypeCountryTranslation = {
    cs: string; /* Czech */
    de: string; /* German */
    en: string; /* English */
    es: string; /* Spanish */
    fr: string; /* French */
    hr: string; /* Croatian */
    it: string; /* Italian */
    pl: string; /* Polish */
    sv: string; /* Swedish */
};

/**
 * Country type
 */
export type TypeCountry = {
    code: string|null;

    translation: TypeCountryTranslation;
};

export const getCountries = (): TypeCountry[] => {
    return [
        ...(countriesGeneral.data as TypeCountry[]),
        ...(countriesUnknown.data as TypeCountry[]),
        ...(countriesAfrica.data as TypeCountry[]),
        ...(countriesAmericaNorth.data as TypeCountry[]),
        ...(countriesAmericaSouth.data as TypeCountry[]),
        ...(countriesAsia.data as TypeCountry[]),
        ...(countriesEurope.data as TypeCountry[]),
        ...(countriesOceania.data as TypeCountry[]),
    ];
};
