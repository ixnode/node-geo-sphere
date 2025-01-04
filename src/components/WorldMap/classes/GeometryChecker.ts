import {
    TypeGeometry,
    TypeLineStringGeometry, TypeMultiPolygonGeometry,
    TypePointGeometry,
    TypePolygonGeometry
} from "../types/types";

interface GeometryCheckerOptions {

}

/**
 * Class GeometryChecker.
 *
 * @author Björn Hempel <bjoern@hempel.li>
 * @version 0.1.0 (2024-07-14)
 * @since 0.1.0 (2024-07-14) First version.
 */
export class GeometryChecker {

    /**
     * The constructor of WorldMapSvg.
     *
     * @param options
     */
    constructor(options: GeometryCheckerOptions = {}) { }

    /**
     * Returns whether the given geometry is of type TypePointGeometry.
     *
     * @param geometry
     */
    public isTypePointGeometry(geometry: TypeGeometry): geometry is TypePointGeometry {
        return geometry.type === 'Point';
    }

    /**
     * Returns whether the given geometry is of type TypeLineStringGeometry.
     *
     * @param geometry
     */
    public isTypeLineStringGeometry(geometry: TypeGeometry): geometry is TypeLineStringGeometry {
        return geometry.type === 'LineString';
    }

    /**
     * Returns whether the given geometry is of type TypePolygonGeometry.
     *
     * @param geometry
     */
    public isTypePolygonGeometry(geometry: TypeGeometry): geometry is TypePolygonGeometry {
        return geometry.type === 'Polygon';
    }

    /**
     * Returns whether the given geometry is of type TypeMultiPolygonGeometry.
     *
     * @param geometry
     */
    public isTypeMultiPolygonGeometry(geometry: TypeGeometry): geometry is TypeMultiPolygonGeometry {
        return geometry.type === 'MultiPolygon';
    }
}
