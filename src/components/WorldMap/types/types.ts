import { FeatureCollection } from 'geojson';

/* Import interfaces. */
import {ClickCountryData} from "../config/interfaces";

export type TypeProperties = {
    name?: string;
    fill?: string;
    stroke?: string;
    "stroke-width"?: number;
    "iso_a2"?: string;
    "iso_a2_eh"?: string;
    [key: string]: any;
};

export type TypePoint = [number, number];

export type TypePointGeometry = {
    type: "Point";
    coordinates: TypePoint;
};

export type TypeLine = TypePoint[];

export type TypeLineStringGeometry = {
    type: "LineString";
    coordinates: TypeLine;
};

export type TypePolygon = TypePoint[][];

export type TypePolygonGeometry = {
    type: "Polygon";
    coordinates: TypePolygon;
};

export type TypeMultiPolygon = TypePoint[][][];

export type TypeMultiPolygonGeometry = {
    type: "MultiPolygon";
    coordinates: TypeMultiPolygon;
};

export type TypeGeometry = TypePointGeometry|TypePolygonGeometry|TypeLineStringGeometry|TypeMultiPolygonGeometry;

export type TypeFeature = {
    type: "Feature";
    id?: string;
    name?: string;
    geometry: TypeGeometry;
    properties: TypeProperties;
};

export interface InterfaceGeoJson extends FeatureCollection {
    type: "FeatureCollection";
    citiesAdded?: boolean;
    features: TypeFeature[];
}

export type TypeFeatureMap = {
    [key: string]: TypeFeature;
};

export type TypeBoundingBoxType = 'country'|'all'|'europe';

export type TypeDataSource = 'tiny'|'low'|'medium';

export type TypeCountryKey = string|null;

export type TypeBoundingBox = {
    longitudeMin: number;
    latitudeMin: number;
    longitudeMax: number;
    latitudeMax: number;
    width: number;
    height: number;
};

export type TypeLanguagesSupported = 'cz'|'de'|'en'|'es'|'fr'|'hr'|'it'|'pl'|'sv';

export type TypeClickCountry = ((data: ClickCountryData) => void)|null;
