/* Import configuration. */
import {getCountryMap} from "../config/countries";
import {classNameSvgCircle} from "../config/elementNames";

/* Import types. */
import {InterfaceGeoJson, TypeCountryKey, TypeDataSource, TypeFeature} from "../types/types";

/* Import classes. */
import {CoordinateConverter} from "./CoordinateConverter";

/* Import tools. */
import {getIdFromPlace} from "../tools/interaction";

/* Import data. */
import {countriesDataLow} from "../data/geoJsonLow";
import {countriesDataMedium} from "../data/geoJsonMedium";
import {countriesDataTiny} from "../data/geoJsonTiny";

/* Import db and db types. */
import {cities, TypeCity} from "../db/cities";
import {TypeCountryData} from "../db/countries";

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

    private readonly countryMap: TypeCountryData = getCountryMap();

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

            if (!this.countryMap.hasOwnProperty(country)) {
                return convertedFeature;
            }

            convertedFeature.name = this.countryMap[country].translation.de;

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
                class: classNameSvgCircle,
                id: getIdFromPlace(city.name)
            },
            name: city.name,
            country: city.country.toLowerCase(),
            id: getIdFromPlace(city.name)
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
