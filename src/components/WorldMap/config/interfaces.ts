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
}