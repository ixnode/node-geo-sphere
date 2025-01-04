/* Import configuration. */
import {countryMap} from "../config/countries";
import {defaultLanguage} from "../config/config";

/* Import types. */
import {InterfaceGeoJson, TypeLanguagesSupported, TypeBoundingBox} from "../types/types";

/* Import tools. */
import {getLanguageName} from "../tools/language";

/* GeoJson2PathOptions interface. */
interface GeoJson2PathOptionsLazy {

    /** Which language should be used? */
    language?: string;
}

/* GeoJson2PathOptions interface. */
interface GeoJson2PathOptions {

    /** Which language should be used? */
    language: string;
}

/* TypeSvgPath type. */
export type TypeSvgPath = {
    type: "path";
    fill: string;
    stroke: string;
    "stroke-width": number;
    path: string;
    id: string|null;
    name: string;
}

/* TypeSvgCircle type. */
export type TypeSvgCircle = {
    type: "circle";
    x: number;
    y: number;
    r: number;
    fill: string;
    name: string;
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

/**
 * Class GeoJson2Path.
 *
 * @author Björn Hempel <bjoern@hempel.li>
 * @version 0.1.0 (2024-07-15)
 * @since 0.1.0 (2024-07-15) First version.
 */
export class GeoJson2Path {

    options: GeoJson2PathOptions;

    /**
     * The constructor of WorldMapSvg.
     *
     * @param options
     */
    constructor(options: GeoJson2PathOptionsLazy = {})
    {
        const { language = defaultLanguage, ...restOptions } = options;
        this.options = { language, ...restOptions };
    }

    /**
     * Invert function.
     *
     * @param y
     * @private
     */
    private invertY(y: number): number {
        return -y;
    }

    /**
     * Converts given coordinates to svg path.
     *
     * @param coordinates
     * @private
     */
    private convertCoordsToPath(coordinates: number[][]): string {
        return coordinates.map((point, index) => {
            const [x, y] = point;
            return `${index === 0 ? 'M' : ''}${x},${this.invertY(y)}`;
        }).join(' ') + 'Z';
    }

    /**
     * Converts the given width to point size.
     *
     * @param width
     * @private
     */
    private mapWidthToPointSize(width: number): number {
        const pointSizeFactor = 0.2;
        const increaseSpeed = 0.75;

        return Math.round(pointSizeFactor * Math.pow(width, increaseSpeed));
    };

    /**
     * Build TypeSvgPath and TypeSvgPath elements from given geoJSON object.
     *
     * @param geoJSON
     * @param country
     * @param boundingBoxWidth
     */
    public convert(
        geoJSON: InterfaceGeoJson,
        country: string|null,
        boundingBoxWidth: number
    ): (TypeSvgPath | TypeSvgCircle)[] {
        const paths: (TypeSvgPath | TypeSvgCircle)[] = [];

        const radiusCircle = this.mapWidthToPointSize(boundingBoxWidth);
        const borderWidth = Math.round(boundingBoxWidth / 1500);
        const languageName = getLanguageName(this.options.language);

        geoJSON.features.forEach(feature => {
            const { type, coordinates } = feature.geometry;

            /**
             * Add simple polygon.
             */
            if (type === 'Polygon') {
                const sameCountry = (country ? country.toUpperCase() : null) === feature.id;
                const id = feature.id ? feature.id.toUpperCase() : 'XX';
                const name = id.toLowerCase() in countryMap ? countryMap[id.toLowerCase()][languageName] : id;

                (coordinates as number[][][]).forEach(ring => {
                    paths.push({
                        type: "path",
                        path: this.convertCoordsToPath(ring),
                        fill: sameCountry ? '#c0e0c0' : '#d0d0d0',
                        stroke: '#a0a0a0',
                        "stroke-width": borderWidth,
                        id: id,
                        name: name ?? 'unknown',
                    });
                });

            /**
             * Add multi polygon.
             */
            } else if (type === 'MultiPolygon') {
                const sameCountry = (country ? country?.toUpperCase() : null) === feature.id;
                const id = feature.id ? feature.id.toUpperCase() : 'XX';
                const name = id.toLowerCase() in countryMap ? countryMap[id.toLowerCase()][languageName] : id;

                const multiPolygonPath = (coordinates as number[][][][]).map(polygon => {
                    return polygon.map(ring => this.convertCoordsToPath(ring)).join(' ');
                }).join(' ');

                paths.push({
                    type: "path",
                    path: multiPolygonPath,
                    fill: sameCountry ? '#c0e0c0' : '#d0d0d0',
                    stroke: '#a0a0a0',
                    "stroke-width": borderWidth,
                    id: id,
                    name: name ?? 'unknown',
                });

            /**
             * Add point.
             */
            } else if (type === 'Point') {
                const [x, y] = coordinates as number[];
                const name = feature.name ? feature.name : 'Unknown city';

                paths.push({
                    type: "circle",
                    x: x,
                    y: this.invertY(y),
                    r: radiusCircle,
                    fill: '#008000',
                    name: name
                });
            }
        });

        return paths;
    }

    /**
     * Generates the svg string.
     *
     * @param geoJSON
     * @param boundingBox
     * @param country
     * @param width
     * @param height
     */
    public generateSVG(
        geoJSON: InterfaceGeoJson,
        boundingBox: TypeBoundingBox,
        country: string|null,
        width: number,
        height: number
    ): TypeSvgContent {
        const viewBoxLeft = boundingBox.longitudeMin;
        const viewBoxTop = -boundingBox.latitudeMax;
        const viewBoxWidth = (boundingBox.longitudeMax - boundingBox.longitudeMin) * width / height;
        const viewBoxHeight = boundingBox.latitudeMax - boundingBox.latitudeMin;

        const elements = this.convert(geoJSON, country, viewBoxWidth);

        const svgPaths = elements
            .filter((element): element is TypeSvgPath => 'path' in element)
            .map(({ path, fill, stroke, 'stroke-width': strokeWidth, id , name}) => {
                const idName = id ? id.toLowerCase() : null;

                return `
                    <path id="${idName}" class="country" d="${path}" fill="${fill}" stroke="${stroke}" stroke-width="${strokeWidth}">
                        <title>${name}</title>
                    </path>
                `;
            })
            .join('');

        const svgCircles = elements
            .filter((element): element is TypeSvgCircle => 'x' in element && 'y' in element)
            .map(({ x, y, r, fill, name}) => {
                return `
                    <circle r="${r}" cx="${x}" cy="${y}" fill="${fill}" class="place">
                        <title>${name}</title>
                    </circle>
                `;
            })
            .join('');

        return { svgPaths, svgCircles, viewBoxLeft, viewBoxTop, viewBoxWidth, viewBoxHeight };
    }
}
