import {InterfaceGeoJson, TypeCountryKey, TypeDataSource, TypeFeature} from "../types/types";
import {countryMap} from "../config/countries";
import {cities, TypeCity} from "../config/cities";
import {CoordinateConverter} from "./CoordinateConverter";
import {countriesDataLow} from "../data/geoJsonLow";
import {countriesDataMedium} from "../data/geoJsonMedium";
import {countriesDataTiny} from "../data/geoJsonTiny";

interface DataConverterOptions {

}

/**
 * Class DataConverter.
 *
 * @author Björn Hempel <bjoern@hempel.li>
 * @version 0.1.0 (2024-07-14)
 * @since 0.1.0 (2024-07-14) First version.
 */
export class DataConverter {

    private coordinateConverter: CoordinateConverter = new CoordinateConverter();

    private readonly propertyCountrySelectedFill: string = '#c0e0c0';

    private readonly propertyCountrySelectedStroke: string = '#a0a0a0';

    private readonly propertyCountrySelectedStrokeWidth: number = .1;

    private readonly propertiesCityFill: string = '#008000';

    private readonly propertiesCityStroke: string = '#008000';

    private readonly propertiesCityStrokeWidth: number = 0.;

    /**
     * The constructor of WorldMapSvg.
     *
     * @param options
     */
    constructor(options: DataConverterOptions = {}) { }

    /**
     * Checks the ISO code for correctness.
     *
     * @param isoCode
     * @private
     */
    private checkIsoCode(isoCode: string): boolean {

        /* The given code must only contain two characters. */
        if (isoCode.length !== 2) {
            return false;
        }

        return /^[A-Z]{2}$/.test(isoCode);
    }

    /**
     * Returns the id from given feature.
     *
     * @param feature
     */
    public getIsoCode(feature: TypeFeature): string {
        let id: string|null = null;

        if (feature.properties.hasOwnProperty('iso_a2')) {
            id = feature.properties.iso_a2 ?? null;
        }

        if ((id === null || !this.checkIsoCode(id)) && feature.properties.hasOwnProperty('iso_a2_eh')) {
            id = feature.properties.iso_a2_eh ?? null;
        }

        if ((id === null || !this.checkIsoCode(id)) && feature.hasOwnProperty('id')) {
            id = feature.id ?? null;
        }

        if (typeof id !== 'string') {
            throw new Error('Can not find feature.id or feature.properties.iso_a2 to determine the country id.');
        }

        return id;
    }

    /**
     * Adds additional config to given country.
     *
     * @param geoJson
     * @param country
     */
    private addConfigToSelectedCountry(geoJson: InterfaceGeoJson, country: string|null): InterfaceGeoJson {
        const convertedFeatures = geoJson.features.map(feature => {
            let properties = {
                ...feature.properties
            };

            /* Adds additional configuration to given country. */
            if (country === feature.id) {
                properties.fill = this.propertyCountrySelectedFill;
                properties.stroke = this.propertyCountrySelectedStroke;
                properties["stroke-width"] = this.propertyCountrySelectedStrokeWidth;
            }

            return {
                ...feature,
                properties
            };
        });

        return {
            ...geoJson,
            features: convertedFeatures
        };
    }

    /**
     * Adds ids and names to geoJson object.
     *
     * @param geoJson
     * @private
     */
    private addIdsAndNames(geoJson: InterfaceGeoJson): InterfaceGeoJson {
        const convertedFeatures = geoJson.features.map(feature => {
            let id = this.getIsoCode(feature);

            let convertedFeature = {
                ...feature,
                id: id
            };

            const country = id.toLowerCase();

            if (!countryMap.hasOwnProperty(country)) {
                return convertedFeature;
            }

            convertedFeature.name = countryMap[country].nameDe;

            return convertedFeature;
        });

        return {
            ...geoJson,
            features: convertedFeatures
        };
    }

    /**
     * Adds ids and names to geoJson object.
     *
     * @param geoJson
     * @private
     */
    private addCountryClasses(geoJson: InterfaceGeoJson): InterfaceGeoJson {
        geoJson.features.forEach(feature => {
            if (feature.properties.class) {
                return;
            }

            feature.properties.class = 'country';
        });
        return geoJson;
    }

    /**
     * Returns a feature from given city.
     *
     * @param city
     * @private
     */
    private getFeatureFromCity(city: TypeCity): TypeFeature {
        return {
            type: "Feature",
            geometry: {
                type: "Point",
                coordinates: city.coordinate
            },
            properties: {
                name: city.name,
                fill: this.propertiesCityFill,
                stroke: this.propertiesCityStroke,
                "stroke-width": this.propertiesCityStrokeWidth,
                class: "place"
            },
            name: city.name,
            id: `place-${city.name.toLowerCase()}`
        };
    }

    /**
     * Adds additional cities from cities.
     *
     * @param geoJson
     * @see cities
     */
    private addCities(geoJson: InterfaceGeoJson): InterfaceGeoJson {
        if (geoJson.citiesAdded) {
            return geoJson;
        }

        cities.forEach((city) => {
            geoJson.features.push(this.getFeatureFromCity(city));
        });

        geoJson.citiesAdded = true;

        return geoJson;
    }

    /**
     * Returns the prepared geoJson data according to given country.
     *
     * @param geoJson
     * @param country
     * @private
     */
    private prepareGeoJsonData(geoJson: InterfaceGeoJson, country: string|null): InterfaceGeoJson {
        geoJson = this.addCountryClasses(geoJson);
        geoJson = this.addCities(geoJson);
        geoJson = this.addIdsAndNames(geoJson);
        geoJson = this.addConfigToSelectedCountry(geoJson, country);

        return  this.coordinateConverter.convertToMercatorProjection(geoJson);
    }

    /**
     * Return the prepared data according to given datasource.
     *
     * @param dataSource
     * @param countryKey
     * @private
     */
    getPreparedData(dataSource: TypeDataSource, countryKey: TypeCountryKey): InterfaceGeoJson {
        if (dataSource === 'tiny') {
            return this.prepareGeoJsonData(countriesDataTiny, countryKey);
        }

        if (dataSource === 'low') {
            return this.prepareGeoJsonData(countriesDataLow, countryKey);
        }

        if (dataSource === 'medium') {
            return this.prepareGeoJsonData(countriesDataMedium, countryKey);
        }

        throw new Error('Unsupported datasource given');
    }
}
