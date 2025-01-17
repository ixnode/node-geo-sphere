import proj4 from "proj4";

/* Import types. */
import {
    InterfaceGeoJson,
    TypeGeometry,
    TypeLineStringGeometry, TypeMultiPolygonGeometry, TypePoint,
    TypePointGeometry,
    TypePolygonGeometry
} from "../types/types";

/* Import configuration. */
import {proj3857, proj4326, scaleFactor} from "../config/config";

/* Import classes. */
import {GeometryChecker} from "./GeometryChecker";

interface CoordinateConverterOptions {

}

/**
 * Class CoordinateConverter.
 *
 * @author Björn Hempel <bjoern@hempel.li>
 * @version 0.1.0 (2024-07-14)
 * @since 0.1.0 (2024-07-14) First version.
 */
export class CoordinateConverter {

    private readonly geometryChecker: GeometryChecker = new GeometryChecker();

    /**
     * The constructor of WorldMapSvg.
     *
     * @param options
     */
    constructor(options: CoordinateConverterOptions = {}) { }

    /**
     * Converts given WSG84 projection into mercator projection.
     *
     * @param coordinate
     */
    public convertCoordinateWgs84ToMercator(coordinate: TypePoint): TypePoint {
        const [x, y] = proj4(proj4326, proj3857, coordinate);

        return [x / scaleFactor, y / scaleFactor];
    }

    /**
     * Converts given mercator projection into WSG84 projection.
     *
     * @param coordinate
     */
    public convertCoordinateMercatorToWgs84(coordinate: TypePoint): TypePoint {
        const [x, y] = coordinate;

        return proj4(proj3857, proj4326, [x * scaleFactor, y * scaleFactor]);
    }

    private calculateMercatorFromPoint(geometry: TypePointGeometry): TypePointGeometry {
        return {
            type: 'Point',
            coordinates: this.convertCoordinateWgs84ToMercator(geometry.coordinates)
        };
    }

    private calculateMercatorFromLineString(geometry: TypeLineStringGeometry): TypeLineStringGeometry {
        return {
            type: 'LineString',
            coordinates: geometry.coordinates.map(this.convertCoordinateWgs84ToMercator)
        };
    }

    private calculateMercatorFromPolygon(geometry: TypePolygonGeometry): TypePolygonGeometry {
        return {
            type: 'Polygon',
            coordinates: geometry.coordinates.map(ring => ring.map(this.convertCoordinateWgs84ToMercator))
        };
    }

    private calculateMercatorFromMultiPolygon(geometry: TypeMultiPolygonGeometry): TypeMultiPolygonGeometry {
        return {
            type: 'MultiPolygon',
            coordinates: geometry.coordinates.map(polygon => polygon.map(ring => ring.map(this.convertCoordinateWgs84ToMercator)))
        };
    }

    /**
     * Calculates the mercator projection from given geometry data.
     *
     * @param geometry
     */
    private calculateMercatorFromGeometry(geometry: TypeGeometry): TypeGeometry
    {
        if (this.geometryChecker.isTypePointGeometry(geometry)) {
            return this.calculateMercatorFromPoint(geometry);
        }

        if (this.geometryChecker.isTypeLineStringGeometry(geometry)) {
            return this.calculateMercatorFromLineString(geometry);
        }

        if (this.geometryChecker.isTypePolygonGeometry(geometry)) {
            return this.calculateMercatorFromPolygon(geometry);
        }

        if (this.geometryChecker.isTypeMultiPolygonGeometry(geometry)) {
            return this.calculateMercatorFromMultiPolygon(geometry);
        }

        throw new Error('Invalid geometry type');
    }

    /**
     * Converts all coordinates to mercator projection.
     *
     * @param geoJson
     * @private
     */
    public convertToMercatorProjection(geoJson: InterfaceGeoJson): InterfaceGeoJson {
        const convertedFeatures = geoJson.features.map(feature => {
            return {
                ...feature,
                geometry: this.calculateMercatorFromGeometry(feature.geometry)
            };
        });

        return {
            ...geoJson,
            features: convertedFeatures
        };
    }
}
