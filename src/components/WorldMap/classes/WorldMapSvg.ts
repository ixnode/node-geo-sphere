/* Import configuration. */
import {defaultDataSource} from "../config/config";
import {defaultLanguage} from "../../../config/config";
import {TypeLanguagesSupported} from "../../../config/types";

/* Import types. */
import {
    InterfaceGeoJson,
    TypeCountryKey,
    TypeDataSource,
    TypeFeatureMap,
    TypeShowBoundingBox,
    TypeSvgContent
} from "../types/types";

/* Import classes. */
import {BoundingBox} from "./BoundingBox";
import {DataConverter} from "./DataConverter";
import {GeoJson2Path} from "./GeoJson2Path";
import {countryCropBoundingBox} from "../config/countries";

/* WorldMapSvgOptions interface. */
interface WorldMapSvgOptions {
    country?: string | null;
    width?: number;
    height?: number;
    dataSource?: TypeDataSource;
    zoomCountry?: boolean;
    language?: TypeLanguagesSupported;
}

/**
 * Class WorldMapSvg.
 *
 * @author Björn Hempel <bjoern@hempel.li>
 * @version 0.1.0 (2024-07-14)
 * @since 0.1.0 (2024-07-14) First version.
 */
export class WorldMapSvg {

    private country: TypeCountryKey;

    private countryKey: TypeCountryKey;

    private width: number;

    private height: number;

    private readonly zoomCountry: boolean;

    private language: TypeLanguagesSupported;

    private dataSource: TypeDataSource = 'low';

    private data: InterfaceGeoJson;

    private dataIdMap: TypeFeatureMap;

    private dataConverter: DataConverter = new DataConverter();

    private boundingBox: BoundingBox;

    private geoJson2Path: GeoJson2Path;

    private readonly propertyCountryDefault: TypeCountryKey = null;

    private readonly propertyWidthDefault: number = 200;

    private readonly propertyHeightDefault: number = 110;

    private readonly propertyDataSourceDefault: TypeDataSource = defaultDataSource;

    private readonly propertyZoomCountryDefault: boolean = true;

    private readonly propertyLanguageDefault: TypeLanguagesSupported = defaultLanguage;

    private readonly zoomGapBoundingBoxLongitudeFactor = .2;

    private readonly zoomGapBoundingBoxLatitudeFactor = .2;

    private readonly zoomGapBoundingBoxLongitudeFactorAll = .05;

    private readonly zoomGapBoundingBoxLatitudeFactorAll = .05;

    /**
     * The constructor of WorldMapSvg.
     *
     * @param options
     */
    constructor(options: WorldMapSvgOptions = {}) {
        /* Initialize the given options. */
        this.country = options.country ?? this.propertyCountryDefault;
        this.width = options.width ?? this.propertyWidthDefault;
        this.height = options.height ?? this.propertyHeightDefault;
        this.dataSource = options.dataSource ?? this.propertyDataSourceDefault;
        this.zoomCountry = options.zoomCountry ?? this.propertyZoomCountryDefault;
        this.language = options.language ?? this.propertyLanguageDefault;
        this.boundingBox = new BoundingBox();
        this.boundingBox.setWidth(this.width);
        this.boundingBox.setHeight(this.height);

        /* Build GeoJson2Path with configuration. */
        this.geoJson2Path = new GeoJson2Path({
            language: this.language
        });

        /* Calculates the needed properties from given properties. */
        this.countryKey = this.getCountryKey(this.country);
        this.data = this.dataConverter.getPreparedData(this.dataSource, this.countryKey);
        this.dataIdMap = this.transformGeoJsonToFeatureMap(this.data);
        this.fixCountryKeyToAvailableData();
    }

    /**
     * Sets the dimensions.
     *
     * @param width
     * @param height
     */
    public setDimensions(width: number, height: number): void {
        this.width = width;
        this.height = height;
    }

    /**
     * Sets the language.
     *
     * @param language
     */
    public setLanguage(language: TypeLanguagesSupported): void {
        this.language = language;
    }

    /**
     * Sets the country.
     *
     * @param country
     */
    public setCountry(country: TypeCountryKey): void {
        this.country = country;
        this.countryKey = this.getCountryKey(this.country);
        this.fixCountryKeyToAvailableData();
    }

    /**
     * Sets the data source.
     *
     * @param dataSource
     */
    public setDataSource(dataSource: TypeDataSource): void {
        this.dataSource = dataSource;
        this.data = this.dataConverter.getPreparedData(this.dataSource, this.countryKey);
        this.dataIdMap = this.transformGeoJsonToFeatureMap(this.data);
        this.fixCountryKeyToAvailableData();
    }

    /**
     * Transform the given GeoJSON data into a feature key object.
     *
     * @param geoJson
     */
    private transformGeoJsonToFeatureMap(geoJson: InterfaceGeoJson): TypeFeatureMap {
        const countryMap: TypeFeatureMap = {};

        geoJson.features.forEach(feature => {
            countryMap[this.dataConverter.getIsoCode(feature)] = feature;
        });

        return countryMap;
    }

    /**
     * Returns the country key from given country code.
     *
     * @param country
     * @private
     */
    private getCountryKey(country: TypeCountryKey): TypeCountryKey {
        return country !== null ? country.toUpperCase() : null
    }

    /**
     * Sets the country key to null if there is no country as given.
     *
     * @private
     */
    private fixCountryKeyToAvailableData(): void {
        if (this.countryKey !== null && !this.dataIdMap.hasOwnProperty(this.countryKey)) {
            this.countryKey = null;
        }
    }

    /**
     * Generates the svg string by given country.
     *
     * @param country
     */
    public generateSvgByCountry(
        country: string|null
    ): TypeSvgContent {
        let boundingType = this.boundingBox.getBoundingType(this.country, this.countryKey, this.zoomCountry);

        /* Get country crop bounding box. */
        const showBoundingBox: TypeShowBoundingBox|null = country !== null && (country in countryCropBoundingBox) ?
            countryCropBoundingBox[country] :
            null;

        /* Calculates the bounding box without gap or centering ("raw" bounding box). */
        let boundingBox = this.boundingBox.calculateBoundingBox(
            this.dataIdMap,
            boundingType,
            this.countryKey,
            showBoundingBox
        );

        const factorGapLongitude = boundingType === 'country' ? this.zoomGapBoundingBoxLongitudeFactor : this.zoomGapBoundingBoxLongitudeFactorAll;
        const factorGapLatitude = boundingType === 'country' ? this.zoomGapBoundingBoxLatitudeFactor : this.zoomGapBoundingBoxLatitudeFactorAll;

        /* Centers the bounding box to output svg and add a gap. */
        boundingBox = this.boundingBox.centerBoundingBox(
            boundingBox,
            this.width,
            this.height,
            factorGapLongitude,
            factorGapLatitude
        );

        return this.geoJson2Path.generateSVG(this.data, boundingBox, country);
    }
}
