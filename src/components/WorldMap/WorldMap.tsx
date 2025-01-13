import React, {useEffect, useState} from 'react';

/* Import configuration. */
import {TypeCountry} from "./config/countries";
import {zoomCountry} from "./config/general";
import {
    defaultCountry,
    defaultDataSource,
    defaultDebug,
    defaultLanguage,
    defaultLogo,
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
import {Logo} from "../../helper/Logo/Logo";

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

    /** Should the debug mode be used? */
    debug?: boolean;

    /** Should the logo be displayed? */
    logo?: boolean;
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
    debug = defaultDebug,
    logo = defaultLogo,
}) => {

    /* Set states. */
    const [svgContent, setSvgContent] = useState<TypeSvgContent|null>(null);
    const [translation, setTranslation] = useState<TypeCountry|null>(null);
    const [stateZoomIn, setStateZoomIn] = useState<number>(0);
    const [stateZoomOut, setStateZoomOut] = useState<number>(0);

    /* Build WorldMapSvg instance. */
    const worldMapSvg = new WorldMapSvg({
        country, width, height, zoomCountry, language
    });

    /**
     * Function to handle zoom in (+).
     */
    const handleZoomIn = () => {
        setStateZoomIn(stateZoomIn + 1);
    };

    /**
     * Function to handle zoom out (-).
     */
    const handleZoomOut = () => {
        setStateZoomOut(stateZoomOut + 1);
    };

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
            <div className="world-map__hints">
                Hold Ctrl and scroll to zoom the map.
            </div>

            <div className="world-map__title">
                {translation ? translation[getLanguageName(language)] : 'World Map'}
            </div>

            <div className="world-map__copyright">
                Copyright © 2025
            </div>

            {
                logo && <div className="world-map__logo">
                    <Logo size="small" type="css"/>
                </div>
            }

            <button className="zoom-btn zoom-in" onClick={handleZoomIn}>
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none"
                     stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="12" y1="5" x2="12" y2="19"></line>
                    <line x1="5" y1="12" x2="19" y2="12"></line>
                </svg>
            </button>
            <button className="zoom-btn zoom-out" onClick={handleZoomOut}>
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none"
                     stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="5" y1="12" x2="19" y2="12"></line>
                </svg>
            </button>

            {
                debug && <div className="world-map__debug">
                    <div className="table-structured distance ratio-1-2">
                        <div className="grid">
                            <div className="label">Debug</div>
                            <div className="value" id="debug-map-type">No interaction yet.</div>
                        </div>
                    </div>
                    <div id="debug-map-content"></div>
                </div>
            }
            {
                svgContent && <SVGRenderer
                    svgContent={svgContent}
                    country={country}
                    onClickCountry={onClickCountry}
                    language={language}
                    stateZoomIn={stateZoomIn}
                    stateZoomOut={stateZoomOut}
                    debug={debug}
                    width={width}
                    height={height}
                />
            }
        </div>
    );
};
