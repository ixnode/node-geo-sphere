/* Import json. */
import countriesGeneral from './countries/_general.json';
import countriesUnknown from './countries/_unknown.json';
import countriesAfrica from './countries/africa.json';
import countriesAmericaNorth from './countries/america-north.json';
import countriesAmericaSouth from './countries/america-south.json';
import countriesAsia from './countries/asia.json';
import countriesEurope from './countries/europe.json';
import countriesOceania from './countries/oceania.json';
import {TypeTranslation} from "./_types/typws";

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
