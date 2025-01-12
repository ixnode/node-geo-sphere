import {GeometryChecker} from "./GeometryChecker";
import {boundingBoxEuropeProj4326, defaultMapHeight, defaultMapWidth} from "../config/config";
import {
    TypeBoundingBox,
    TypeBoundingBoxType, TypeCountryKey,
    TypeFeature,
    TypeFeatureMap,
    TypeLine,
    TypeMultiPolygon,
    TypePoint,
    TypePolygon
} from "../types/types";
import {CoordinateConverter} from "./CoordinateConverter";

interface BoundingBoxOptions {

}

/**
 * Class BoundingBox.
 *
 * @author Björn Hempel <bjoern@hempel.li>
 * @version 0.1.0 (2024-07-14)
 * @since 0.1.0 (2024-07-14) First version.
 */
export class BoundingBox {

    private readonly geometryChecker: GeometryChecker = new GeometryChecker();

    private readonly coordinateConverter: CoordinateConverter = new CoordinateConverter();

    private width: number|null = null;

    private height: number|null  = null;

    /**
     * The constructor of WorldMapSvg.
     *
     * @param options
     */
    constructor(options: BoundingBoxOptions = {}) { }

    public setWidth(width: number) {
        this.width = width;
    }

    public setHeight(height: number) {
        this.height = height;
    }

    /**
     * Calculates the bounding box from the given feature map.
     *
     * @param featureMap
     */
    private calculateBoundingBoxAll(featureMap: TypeFeatureMap): TypeBoundingBox {
        let longitudeMin = Infinity,
            latitudeMin = Infinity,
            longitudeMax = -Infinity,
            latitudeMax = -Infinity;

        for (const key in featureMap) {
            if (!featureMap.hasOwnProperty(key)) {
                continue;
            }

            const feature = featureMap[key];
            const {
                longitudeMin: minLongitudeTmp,
                latitudeMin: minLatitudeTmp,
                longitudeMax: maxLongitudeTmp,
                latitudeMax: maxLatitudeTmp
            } = this.calculateBoundingBoxCountry(feature);

            if (minLongitudeTmp < longitudeMin) {
                longitudeMin = minLongitudeTmp;
            }
            if (minLatitudeTmp < latitudeMin) {
                latitudeMin = minLatitudeTmp;
            }
            if (maxLongitudeTmp > longitudeMax) {
                longitudeMax = maxLongitudeTmp;
            }
            if (maxLatitudeTmp > latitudeMax) {
                latitudeMax = maxLatitudeTmp;
            }
        }

        return {
            longitudeMin: longitudeMin,
            latitudeMin: latitudeMin,
            longitudeMax: longitudeMax,
            latitudeMax: latitudeMax,
            width: longitudeMax - longitudeMin,
            height: latitudeMax - latitudeMin
        };
    }

    /**
     * Calculates the bounding box from the given feature.
     *
     * @param feature
     */
    private calculateBoundingBoxCountry(feature: TypeFeature): TypeBoundingBox {
        const geometry = feature.geometry;

        if (this.geometryChecker.isTypePointGeometry(geometry)) {
            return this.calculateBoundingBoxFromPoint(geometry.coordinates);
        }

        if (this.geometryChecker.isTypeLineStringGeometry(geometry)) {
            return this.calculateBoundingBoxLineString(geometry.coordinates);
        }

        if (this.geometryChecker.isTypePolygonGeometry(geometry)) {
            return this.calculateBoundingBoxFromPolygon(geometry.coordinates);
        }

        if (this.geometryChecker.isTypeMultiPolygonGeometry(geometry)) {
            return this.calculateBoundingBoxFromMultiPolygon(geometry.coordinates);
        }

        throw new Error('Invalid geometry type');
    }

    /**
     * Calculates the bounding box for the EU with proj3857 projection.
     */
    private calculateBoundingBoxEu(): TypeBoundingBox {
        /* Converts the boundingBoxEuropeProj4326 from WGS84 to Mercator. */
        const pointMin: TypePoint = this.coordinateConverter.convertCoordinateWgs84ToMercator([boundingBoxEuropeProj4326.longitudeMin, boundingBoxEuropeProj4326.latitudeMin]);
        const pointMax: TypePoint = this.coordinateConverter.convertCoordinateWgs84ToMercator([boundingBoxEuropeProj4326.longitudeMax, boundingBoxEuropeProj4326.latitudeMax]);

        return {
            longitudeMin: pointMin[0],
            latitudeMin: pointMin[1],
            longitudeMax: pointMax[0],
            latitudeMax: pointMax[1],
            width: pointMax[0] - pointMin[0],
            height: pointMax[1] - pointMin[1]
        };
    }

    /**
     * Returns an empty bounding box.
     */
    private calculateBoundingBoxEmpty(): TypeBoundingBox {
        return {
            longitudeMin: .0,
            latitudeMin: .0,
            longitudeMax: 1.,
            latitudeMax: 1.,
            width: 1.,
            height: 1.
        };
    }

    /**
     * Calculates the bounding box from given data and bounding box type.
     */
    public calculateBoundingBox(
        dataIdMap: TypeFeatureMap,
        boundingType: TypeBoundingBoxType,
        countryKey: TypeCountryKey
    ): TypeBoundingBox {
        let boundingBox = this.calculateBoundingBoxEmpty();

        switch (boundingType) {
            case 'all':
                boundingBox = this.calculateBoundingBoxAll(dataIdMap);
                break;

            case 'europe':
                boundingBox = this.calculateBoundingBoxEu();
                break;

            case "country":
                if (countryKey === null) {
                    throw new Error('Unsupported case. Country must not be null.');
                }

                boundingBox = this.calculateBoundingBoxCountry(dataIdMap[countryKey]);
                break
        }

        return boundingBox;
    }

    /**
     * Fixes given latitude and longitude values to dimensions.
     *
     * @param boundingBox
     * @param wantedWidth
     * @param wantedHeight
     */
    private adjustBoundingBox = (
        boundingBox: TypeBoundingBox,
        wantedWidth: number,
        wantedHeight: number
    ) => {
        const {longitudeMin, longitudeMax, latitudeMin, latitudeMax} = boundingBox;

        const width = longitudeMax - longitudeMin;
        const height = latitudeMax - latitudeMin;

        const currentAspectRatio = width / height;
        const wantedAspectRatio = wantedWidth / wantedHeight;

        const longitudeCenter = (longitudeMin + longitudeMax) / 2;
        const latitudeCenter = (latitudeMin + latitudeMax) / 2;

        let adjustedWidth = width;
        let adjustedHeight = height;

        if (currentAspectRatio > wantedAspectRatio) {
            adjustedHeight = width / wantedAspectRatio;
        } else if (currentAspectRatio < wantedAspectRatio) {
            adjustedWidth = height * wantedAspectRatio;
        }

        const newLongitudeMin = longitudeCenter - adjustedWidth / 2;
        const newLongitudeMax = longitudeCenter + adjustedWidth / 2;
        const newLatitudeMin = latitudeCenter - adjustedHeight / 2;
        const newLatitudeMax = latitudeCenter + adjustedHeight / 2;

        return {
            longitudeMin: newLongitudeMin,
            latitudeMin: newLatitudeMin,

            longitudeMax: newLongitudeMax,
            latitudeMax: newLatitudeMax,

            width: newLongitudeMax - newLongitudeMin,
            height: newLatitudeMax - newLatitudeMin,
        };
    };

    /**
     * Calculates the bounding box from the given point.
     *
     * @param point
     */
    private calculateBoundingBoxFromPoint(point: TypePoint): TypeBoundingBox {
        let longitudeMin = point[0],
            latitudeMin = point[1],
            longitudeMax = point[0],
            latitudeMax = point[1];

        return {
            longitudeMin: longitudeMin,
            latitudeMin: latitudeMin,
            longitudeMax: longitudeMax,
            latitudeMax: latitudeMax,
            width: longitudeMax - longitudeMin,
            height: latitudeMax - latitudeMin
        };
    }

    /**
     * Calculate the bounding box from the given line.
     *
     * @param line
     */
    private calculateBoundingBoxLineString(line: TypeLine): TypeBoundingBox {
        let longitudeMin = Infinity,
            latitudeMin = Infinity,
            longitudeMax = -Infinity,
            latitudeMax = -Infinity;

        for (const [longitude, latitude] of line) {
            if (longitude < longitudeMin) {
                longitudeMin = longitude;
            }
            if (latitude < latitudeMin) {
                latitudeMin = latitude;
            }
            if (longitude > longitudeMax) {
                longitudeMax = longitude;
            }
            if (latitude > latitudeMax) {
                latitudeMax = latitude;
            }
        }

        return {
            longitudeMin: longitudeMin,
            latitudeMin: latitudeMin,
            longitudeMax: longitudeMax,
            latitudeMax: latitudeMax,
            width: longitudeMax - longitudeMin,
            height: latitudeMax - latitudeMin
        };
    }

    /**
     * Calculates the bounding box from the given polygon.
     *
     * @param polygon
     */
    private calculateBoundingBoxFromPolygon(polygon: TypePolygon): TypeBoundingBox {
        let longitudeMin = Infinity,
            latitudeMin = Infinity,
            longitudeMax = -Infinity,
            latitudeMax = -Infinity;

        for (const ring of polygon) {
            for (const [longitude, latitude] of ring) {
                if (longitude < longitudeMin) longitudeMin = longitude;
                if (latitude < latitudeMin) latitudeMin = latitude;
                if (longitude > longitudeMax) longitudeMax = longitude;
                if (latitude > latitudeMax) latitudeMax = latitude;
            }
        }

        return {
            longitudeMin: longitudeMin,
            latitudeMin: latitudeMin,
            longitudeMax: longitudeMax,
            latitudeMax: latitudeMax,
            width: longitudeMax - longitudeMin,
            height: latitudeMax - latitudeMin
        };
    }

    /**
     * Calculates the bounding box from the given multipolygon.
     *
     * @param multipolygon
     */
    private calculateBoundingBoxFromMultiPolygon(multipolygon: TypeMultiPolygon): TypeBoundingBox {
        let longitudeMin = Infinity,
            latitudeMin = Infinity,
            longitudeMax = -Infinity,
            latitudeMax = -Infinity;

        for (const polygon of multipolygon) {
            for (const ring of polygon) {
                for (const [longitude, latitude] of ring) {
                    if (longitude < longitudeMin) longitudeMin = longitude;
                    if (latitude < latitudeMin) latitudeMin = latitude;
                    if (longitude > longitudeMax) longitudeMax = longitude;
                    if (latitude > latitudeMax) latitudeMax = latitude;
                }
            }
        }

        return {
            longitudeMin: longitudeMin,
            latitudeMin: latitudeMin,
            longitudeMax: longitudeMax,
            latitudeMax: latitudeMax,
            width: longitudeMax - longitudeMin,
            height: latitudeMax - latitudeMin
        };
    }

    /**
     * Calculates the centered and filled with gap bounding box.
     *
     * @param boundingBox
     * @param width
     * @param height
     * @param factorGapLongitude
     * @param factorGapLatitude
     */
    centerBoundingBox(
        boundingBox: TypeBoundingBox,
        width: number,
        height: number,
        factorGapLongitude: number,
        factorGapLatitude: number
    ): TypeBoundingBox {

        /* Adjust bounding box to given width and height. */
        boundingBox = this.adjustBoundingBox(boundingBox, width, height);

        /* No gap given. */
        if (factorGapLongitude <= 0 || factorGapLatitude <= 0) {
            return boundingBox;
        }

        /* Calculate the distance of the current bounding box. */
        const longitudeDistance = boundingBox.longitudeMax - boundingBox.longitudeMin;
        const latitudeDistance = boundingBox.latitudeMax - boundingBox.latitudeMin;

        const gapLongitude = longitudeDistance * factorGapLongitude / 2;
        const gapLatitude = latitudeDistance * factorGapLatitude / 2;

        const longitudeMin = boundingBox.longitudeMin - gapLongitude;
        const longitudeMax = boundingBox.longitudeMax + gapLongitude;

        const latitudeMin = boundingBox.latitudeMin - gapLatitude;
        const latitudeMax = boundingBox.latitudeMax + gapLatitude;

        return {
            longitudeMin: longitudeMin,
            longitudeMax: longitudeMax,

            latitudeMin: latitudeMin,
            latitudeMax: latitudeMax,

            width: longitudeMax - longitudeMin,
            height: latitudeMax - latitudeMin,
        };
    }

    /**
     * Returns the point size of given bounding box and type.
     *
     * @param boundingBox
     * @param boundingType
     * @private
     */
    public getPointSizeByBoundingBox(boundingBox: TypeBoundingBox, boundingType: TypeBoundingBoxType): number {

        if (boundingType === 'all') {
            return .4;
        }

        if (boundingType === 'europe') {
            return .4;
        }

        return .8;
    }

    /**
     * Returns the type of bounding box.
     *
     * @param countryGiven
     * @param countryKey
     * @param zoomCountry
     * @private
     */
    public getBoundingType(countryGiven: string|null, countryKey: string|null, zoomCountry: boolean): TypeBoundingBoxType {
        if (!zoomCountry || countryGiven === 'all') {
            return 'all';
        }

        if (countryGiven === 'europe' || countryKey === null) {
            return 'europe';
        }

        return 'country';
    }
}
