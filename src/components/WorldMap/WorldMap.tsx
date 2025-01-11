import React, {useEffect, useState} from 'react';

/* Import configuration. */
import {TypeCountry} from "./config/countries";
import {zoomCountry} from "./config/general";
import {
    debug,
    defaultCountry,
    defaultDataSource,
    defaultLanguage,
    defaultMapHeight,
    defaultMapWidth
} from "./config/config";
import {ClickCountryData} from "./config/interfaces";

/* Import types. */
import {TypeDataSource, TypeLanguagesSupported} from "./types/types";

/* Import classes. */
import {TypeSvgContent} from "./classes/GeoJson2Path";
import {WorldMapSvg} from "./classes/WorldMapSvg";
import SVGRenderer from "./components/SVGRenderer";

/* Import tools. */
import {getLanguageName} from "./tools/language";

/* Import Styles. */
import './WorldMap.scss';

/* WorldMapProps interface. */
export interface WorldMapProps {
    /** Which type and size of data source should be used? */
    dataSource?: TypeDataSource;

    /** Which country should be marked? */
    country?: string|null;

    /** The width of the map. */
    width?: number;

    /** The height of the map. */
    height?: number;

    /** Optional click handler (`country`) */
    onClickCountry?: ((data: ClickCountryData) => void)|null;

    /** Which language should be used? */
    language?: TypeLanguagesSupported;
}

/**
 * WorldMap component.
 *
 * @author Björn Hempel <bjoern@hempel.li>
 * @version 0.1.0 (2025-01-04)
 * @since 0.1.0 (2025-01-04) First version.
 */
export const WorldMap: React.FC<WorldMapProps> = ({
    dataSource = defaultDataSource,
    country = defaultCountry,
    width = defaultMapWidth,
    height = defaultMapHeight,
    onClickCountry = null,
    language = defaultLanguage,
}) => {

    /* Set states. */
    const [svgContent, setSvgContent] = useState<TypeSvgContent|null>(null);
    const [translation, setTranslation] = useState<TypeCountry|null>(null);

    /* Build WorldMapSvg instance. */
    const worldMapSvg = new WorldMapSvg({
        country, width, height, zoomCountry, language
    });

    /**
     * ====================
     * Use effect functions
     * ====================
     */
    useEffect(() => {
        worldMapSvg.setDataSource(dataSource as TypeDataSource);
        worldMapSvg.setCountry(country);

        setTranslation(worldMapSvg.getTranslation());
        setSvgContent(worldMapSvg.generateSvgByCountry(country));
    }, [dataSource, country, width, height, language]);

    /**
     * ===========
     * Map Builder
     * ===========
     */
    return (
        <div className="gs-world-map">
            <div className="world-map__title">
                {translation ? translation[getLanguageName(language)] : 'World Map'}
            </div>

            <div className="world-map__copyright">
                Copyright © 2025
            </div>
            {
                debug && <div className="world-map__debug">
                    <div><span style={{fontWeight: 'bold'}}>Debug</span>: <span id="debug-map-type"></span></div>
                    <div id="debug-map-content"></div>
                </div>
            }
            {
                svgContent && <SVGRenderer svgContent={svgContent} country={country} onClickCountry={onClickCountry} language={language} />
            }
        </div>
    );
};
