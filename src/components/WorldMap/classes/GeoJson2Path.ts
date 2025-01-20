/* Import configuration. */
import {getCountryMap} from "../config/countries";
import {defaultLanguage} from "../../../config/config";
import {
    classNameSvgPath,
    classNameSelected,
    classNameSvgCircle,
    classNameSvgText,
    classNameSvgG, classNameSvgGCapital, classNameSvgGStateCapital, classNameSvgGCity
} from "../config/elementNames";

/* Import types. */
import {InterfaceGeoJson, TypeBoundingBox, TypeSvgContent, TypeSvgCountry, TypeSvgPlace} from "../types/types";

/* Import tools. */
import {getLanguageNameCountry, getTranslatedNamePlace} from "../tools/language";
import {getCityMapElement} from "../tools/interaction";
import {
    getCityMap,
    distanceCityTypeNameCapital, distanceCityTypeNameCity, distanceCityTypeNameStateCapital,
    TypeCityType,
    typeCityTypeNameCapital,
    typeCityTypeNameCity,
    typeCityTypeNameStateCapital
} from "../config/cities";

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
    ): (TypeSvgCountry | TypeSvgPlace)[] {
        const svgElements: (TypeSvgCountry | TypeSvgPlace)[] = [];

        //const radiusCircle = this.mapWidthToPointSize(boundingBoxWidth);
        //const borderWidth = Math.round(boundingBoxWidth / 1500);
        const languageName = getLanguageNameCountry(this.options.language);

        /* Get country map. */
        const countryMap = getCountryMap();

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
                    svgElements.push({
                        /* Place properties. */
                        id: id,
                        name: name ?? 'Unknown country',
                        selected: sameCountry,

                        /* Position. */
                        path: this.convertCoordsToPath(ring),

                        /* Styles. */
                        //"stroke-width": borderWidth
                    } as TypeSvgCountry);
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

                svgElements.push({
                    /* Place properties. */
                    id: id,
                    name: name ?? 'Unknown country',
                    selected: sameCountry,

                    /* Position. */
                    path: multiPolygonPath,

                    /* Styles. */
                    //"stroke-width": borderWidth
                } as TypeSvgCountry);

            /**
             * Add point (place).
             */
            } else if (type === 'Point') {
                const [x, y] = coordinates as number[];
                const name = feature.name ?? 'Unknown place';
                const cityMapElement = getCityMapElement(feature.id ?? null);

                const svgPlace: TypeSvgPlace = {
                    /* Place properties. */
                    id: feature.id ?? '',
                    name: name,
                    placeType: cityMapElement ? cityMapElement.type : typeCityTypeNameCity,
                    priority: cityMapElement ? cityMapElement.priority : 1,
                    size: cityMapElement ? cityMapElement.size : 'standard',

                    /* Position. */
                    x: x,
                    y: this.invertY(y),

                    /* Styles. */
                    //r: radiusCircle,
                };

                svgElements.push(svgPlace);
            }
        });

        return svgElements;
    }

    /**
     * Generates the svg string.
     *
     * @param geoJSON
     * @param boundingBox
     * @param country
     */
    public generateSVG(
        geoJSON: InterfaceGeoJson,
        boundingBox: TypeBoundingBox,
        country: string|null
    ): TypeSvgContent {
        const viewBoxLeft = boundingBox.longitudeMin;
        const viewBoxTop = -boundingBox.latitudeMax;
        const viewBoxWidth = (boundingBox.longitudeMax - boundingBox.longitudeMin);
        const viewBoxHeight = boundingBox.latitudeMax - boundingBox.latitudeMin;

        /* Get TypeSvgCountry and TypeSvgPlace elements. */
        const elements = this.convert(geoJSON, country, viewBoxWidth);

        /* Build svg countries. */
        const svgPaths = elements
            .filter((element): element is TypeSvgCountry => 'path' in element)
            .map((element) => this.getSvgCountry(element))
            .join('');

        /* Build svg places. */
        const svgCircles = elements
            .filter((element): element is TypeSvgPlace => 'x' in element && 'y' in element)
            .map((element) => this.getSvgPlace(element))
            .join('');

        return { svgPaths, svgCircles, viewBoxLeft, viewBoxTop, viewBoxWidth, viewBoxHeight };
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
     * Build country element (svg path element).
     *
     * @param element
     * @private
     */
    private getSvgCountry(element: TypeSvgCountry): string {
        const {id , name, path, selected, fill, stroke, 'stroke-width': strokeWidth} = element;

        const idName = id ? id.toLowerCase() : null;

        return `
            <path class="${[classNameSvgPath, selected ? classNameSelected : ''].filter(Boolean).join(' ')}" id="${idName}" d="${path}"${fill !== undefined ? ` fill="${fill}"` : ''}${stroke !== undefined ? ` stroke="${stroke}"` : ''}${strokeWidth !== undefined ? ` stroke-width="${strokeWidth}"` : ''}>
                <title>${name}</title>
            </path>
        `;
    };

    /**
     * Build place element (svg circle and text group element).
     *
     * @param element
     * @private
     */
    private getSvgPlace(element: TypeSvgPlace): string {
        const {id, x, y, r, fill, name, size, priority} = element;
        const idName = id ? id.toLowerCase() : null;
        let nameTranslated = name;

        if ([3].includes(priority)) {
            return '';
        }

        const cityMap = getCityMap();

        if ((id !== null) && (id in cityMap)) {
            const dataCity = cityMap[id];
            nameTranslated = getTranslatedNamePlace(dataCity, this.options.language);
        }

        return `
            <g class="${[classNameSvgG, `${classNameSvgG}-${size}`, this.getSvgPlaceClassNameType(element.placeType)].filter(Boolean).join(' ')}" id="${idName}">
                <circle class="${classNameSvgCircle}" cx="${x}" cy="${y}"${fill !== undefined ? ` fill="${fill}"` : ''}${r !== undefined ? ` r="${r}"` : ''}>
                    <title>${nameTranslated}</title>
                </circle>
                <text class="${classNameSvgText}" x="${x + (r || distanceCityTypeNameCity) * 2 + this.getSvgPlaceTextDistance(element.placeType)}" y="${y + 2}"${fill !== undefined ? ` fill="${fill}"` : ''}>${nameTranslated}</text>
            </g>
        `;
    };

    /**
     * Returns the SVG place class name.
     *
     * @param cityType
     * @private
     */
    private getSvgPlaceClassNameType(cityType: TypeCityType): string {
        if (cityType === typeCityTypeNameCapital) {
            return classNameSvgGCapital;
        }

        if (cityType === typeCityTypeNameStateCapital) {
            return classNameSvgGStateCapital;
        }

        return classNameSvgGCity;
    }

    /**
     * Returns the SVG place class name.
     *
     * @param cityType
     * @private
     */
    private getSvgPlaceTextDistance(cityType: TypeCityType): number {
        if (cityType === typeCityTypeNameCapital) {
            return distanceCityTypeNameCapital;
        }

        if (cityType === typeCityTypeNameStateCapital) {
            return distanceCityTypeNameStateCapital;
        }

        return distanceCityTypeNameCity;
    }

}
