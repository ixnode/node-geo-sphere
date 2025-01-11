/**
 * ClickCountryData interface.
 */
export interface ClickCountryData {
    /* Country ID. */
    id: string;

    /* Name of country. */
    name?: string|null;
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