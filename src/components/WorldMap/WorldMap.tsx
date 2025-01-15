import React, {useEffect, useRef, useState} from 'react';
import { useTranslation } from 'react-i18next';

/* Import configuration (global). */
import {
    defaultLanguage,
    defaultCountry,
} from "../../config/config";

/* Import configuration (WorldMap). */
import {TypeCountry} from "./config/countries";
import {zoomCountry} from "./config/general";
import {
    defaultDataSource,
    defaultDebug,
    defaultLogo,
    defaultMapHeight,
    defaultMapWidth
} from "./config/config";
import {ClickCountryData} from "./config/interfaces";
import {TypeLanguagesSupported} from "../../config/types";
import {eventWheelAsEventListener} from "./config/events";

/* Import types. */
import {TypeDataSource} from "./types/types";

/* Import classes. */
import {TypeSvgContent} from "./classes/GeoJson2Path";
import {WorldMapSvg} from "./classes/WorldMapSvg";

/* Import components. */
import SVGRenderer from "./components/SVGRenderer";

/* Import tools. */
import {getLanguageName} from "./tools/language";
import {hideScrollHint} from "./tools/layer";

/* Import Styles. */
import './WorldMap.scss';
import {Logo} from "../../helper/Logo/Logo";

/* Import translation libraries. */
import { i18n } from "../../config/i18n";

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

    /* Set refs. */
    const hintsRef = useRef<HTMLDivElement|null>(null);

    /* Set states. */
    const [svgContent, setSvgContent] = useState<TypeSvgContent|null>(null);
    const [translation, setTranslation] = useState<TypeCountry|null>(null);
    const [stateZoomIn, setStateZoomIn] = useState<number>(0);
    const [stateZoomOut, setStateZoomOut] = useState<number>(0);

    /* Import translation. */
    const { t } = useTranslation();

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
     * Function to handle mouse wheel.
     */
    const handleWheel = (event: React.WheelEvent<HTMLDivElement> | WheelEvent) => {

        /* Hint is not available or ctrl is not pressed. */
        if (!event.ctrlKey || !hintsRef.current) {
            return;
        }

        /* Prevent event bubbling. */
        event.preventDefault();

        /* Show scroll hint. */
        hideScrollHint();
    };

    /**
     * ====================
     * Use effect functions
     * ====================
     */
    /* Change map properties. */
    useEffect(() => {
        worldMapSvg.setDataSource(dataSource as TypeDataSource);
        worldMapSvg.setCountry(country);

        setTranslation(worldMapSvg.getTranslation());
        setSvgContent(worldMapSvg.generateSvgByCountry(country));
    }, [dataSource, country, width, height, language]);

    /* Change default language. */
    useEffect(() => {
        i18n.changeLanguage(language).then();
    }, [language]);

    /* Register event listener. */
    useEffect(() => {

        /* Hint is not available -> stop handle. */
        if (!hintsRef.current) {
            return;
        }

        let hintElement = hintsRef.current;

        /* svgElement.addEventListener('wheel') vs. svg.onWheel */
        eventWheelAsEventListener && hintElement.addEventListener('wheel', handleWheel, { passive: false });

        return () => {
            hintElement.removeEventListener('wheel', handleWheel);
        };
    }, []);

    /**
     * ===========
     * Map Builder
     * ===========
     */
    return (
        <div className="gs-world-map">
            <div
                className="world-map__hints"
                ref={hintsRef}
                onWheel={!eventWheelAsEventListener ? handleWheel : undefined}
            >
                { t('TEXT_HOLD_CTRL_AND_SCROLL' as any) }
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
