/**
 * CountryData interface.
 */
export interface CountryData {
    /* Country ID. */
    id: string;

    /* Name of country. */
    name?: string|null;

    /* Latitude on svg. */
    latitude?: number;

    /* Longitude on svg. */
    longitude?: number;

    /* Clicked position on screen. */
    screenPosition?: {
        /* Clicked x position on screen (longitude). */
        x: number;
        /* Clicked y position on screen (latitude). */
        y: number;
    }

    /* Clicked postion on svg. */
    svgPosition?: {
        /* Clicked x position on svg (longitude). */
        x: number;
        /* Clicked y position on svg (latitude). */
        y: number;
    }
}

/**
 * PlaceData interface.
 */
export interface PlaceData {
    /* Place ID. */
    id: string;

    /* Name of the place. */
    name?: string|null;

    /* Population of the place. */
    population?: number|null;

    /* Latitude on svg. */
    latitude?: number;

    /* Longitude on svg. */
    longitude?: number;

    /* Clicked position on screen. */
    screenPosition?: {
        /* Clicked x position on screen (longitude). */
        x: number;
        /* Clicked y position on screen (latitude). */
        y: number;
    }

    /* Clicked postion on svg. */
    svgPosition?: {
        /* Clicked x position on svg (longitude). */
        x: number;
        /* Clicked y position on svg (latitude). */
        y: number;
    }
}

/**
 * SVGViewBox interface.
 */
export interface SVGViewBox {
    x: number;
    y: number;
    width: number;
    height: number;
    viewWidth?: number;
    viewHeight?: number;
}

/**
 * DebugContent interface.
 */
export interface DebugContent {
    [key: string]: string | number;
}

/**
 * Point interface.
 */
export interface Point {
    x: number;
    y: number;
}