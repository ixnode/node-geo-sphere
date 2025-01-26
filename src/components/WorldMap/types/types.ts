import { FeatureCollection } from 'geojson';

/* Import interfaces. */
import {CountryData, PlaceData} from "../config/interfaces";

/* Import db types. */
import {TypeCitySize, TypeCityType} from "../db/cities";

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
    country?: string;
    geometry: TypeGeometry;
    properties: TypeProperties;
};

export type TypeCropBoundingBox = TypePoint[];

export type TypeZoomGapBoundingBoxFactor = [number, number];

export interface InterfaceGeoJson extends FeatureCollection {
    type: "FeatureCollection";
    citiesAdded?: boolean;
    features: TypeFeature[];
}

export type TypeFeatureMap = {
    [key: string]: TypeFeature;
};

export type TypeBoundingBoxType = 'country'|'all'|'europe';

export type TypeDataSource = 'medium'|'low'|'tiny';

export type TypeCountryKey = string|null;

export type TypeBoundingBox = {
    longitudeMin: number;
    latitudeMin: number;
    longitudeMax: number;
    latitudeMax: number;
    width: number;
    height: number;
};

/**
 * Map click callback types.
 */

/* Return ype when clicked on country. */
export type TypeClickCountry = ((data: CountryData) => void)|null;

/* Return ype when clicked on place. */
export type TypeClickPlace = ((data: PlaceData) => void)|null;



/**
 * TypeSvg types.
 */

/* Supported SVG elements. */
export type TypeSvgElement = 'path'|'circle'|'g';

/* TypeSvgCountry type. */
export type TypeSvgCountry = {
    /* Country properties. */
    id: string|null;
    name: string;
    selected: boolean;

    /* Position. */
    path: string;

    /* Styling. */
    fill?: string;
    stroke?: string;
    "stroke-width"?: number;
}

/* TypeSvgPlace type. */
export type TypeSvgPlace = {
    /* Place properties. */
    id: string|null;
    name: string;
    placeType: TypeCityType;
    priority: number;
    size: TypeCitySize;

    /* Position. */
    x: number;
    y: number;

    /* Styling. */
    r?: number;
    fill?: string;
}

/* TypeSvgContent type. */
export type TypeSvgContent = {
    svgPaths: string;
    svgCircles: string;
    viewBoxLeft: number;
    viewBoxTop: number;
    viewBoxWidth: number;
    viewBoxHeight: number;
}
