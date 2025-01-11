import {TypeLanguagesSupported, TypeBoundingBox} from "../types/types";

export const boundingBoxEuropeProj4326: TypeBoundingBox = {
    longitudeMin: -31.266001,
    latitudeMin: 34.5428,
    longitudeMax: 39.869301,
    latitudeMax: 71.185474,
    width: 1,
    height: 1
};

export const proj4326 = 'EPSG:4326';

export const proj3857 = 'EPSG:3857';

export const defaultMapWidth = 1000;

export const defaultMapHeight = 500;

export const defaultCountry = 'de';

export const defaultLanguage: TypeLanguagesSupported = 'en';

export const defaultDataSource = 'low';

export const defaultDebug = false;

export const defaultLogo = true;
