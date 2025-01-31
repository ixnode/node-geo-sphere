import React from "react";
import {TFunction} from "i18next";

/* Import interfaces. */
import {Point} from "../config/interfaces";

/* Import configuration. */
import {
    classNameHover,
    classNameSvgCircle,
    classNameSvgG,
    classNameSvgPath,
    classNameVisible,
    idSvgMap,
    idWorldMapSubtitle,
    idWorldMapTitle,
    tagNameCircle,
    tagNameG,
    tagNamePath,
    tagNameSvg
} from "../config/elementNames";

/* Import types. */
import {TypeSvgElement} from "../types/types";

/* Import other tools. */
import {ucFirst} from "./string";

/* Import db data and types. */
import {getCountryMap, TypeCountry} from "../db/countries";
import {getCityMap, TypeCity, TypeSvgClass} from "../db/cities";

/**
 * Default texts
 */
export const textDefaultWorldMapTitle = 'World Map';
export const textDefaultWorldMapSubtitle = '';
export const textDefaultWorldMapSubtitleEmpty = '';
export const textNotAvailable = 'n/a';

/**
 * Builds the id of the given place string.
 *
 * @param place
 */
export const getIdFromPlace = (place: string): string => {
    return `${classNameSvgCircle}-${place.toLowerCase().replace(/[\s,]+/g, '-').replace(/[^a-z0-9\-]/g, '')}`;
}

/**
 * Get Point from event.
 *
 * @param event
 */
export const getPointFromEvent = (
    event:
        React.MouseEvent<SVGSVGElement, MouseEvent> |
            SVGSVGElementEventMap["mousedown"] |
            SVGSVGElementEventMap["mousemove"] |
        React.TouchEvent<SVGSVGElement> |
            SVGSVGElementEventMap["touchend"]
): Point => {

    let x: number;
    let y: number;

    if ('touches' in event) {
        const touch = event.touches[0];
        x = touch.clientX;
        y = touch.clientY;
    } else {
        y = event.clientY;
        x = event.clientX;
    }

    return {x, y};
}


/**
 * Get SVGPoint from svg.
 *
 * @param svg
 * @param point
 */
export const getSvgPointFromSvg = (
    svg: SVGSVGElement|null,
    point: Point,
): SVGPoint|null => {

    /* No svg element given. */
    if (!svg) {
        return null;
    }

    /* Create point. */
    const svgPoint = Object.assign(svg.createSVGPoint(), { x: point.x, y: point.y });

    /* Translate point. */
    return svgPoint.matrixTransform(svg.getScreenCTM()?.inverse());
}

/**
 * Get SVGElement from point
 *
 * @param point
 * @param svg
 * @param svgPoint
 * @param svgTypes
 * @param firstSvgType
 */
export const getSvgElementFromSvg = (
    svg: SVGSVGElement|null,                    /* SVG reference. */
    point: Point,                               /* Current clicked point with screen coordinates (used for elements that don't have a fill or stroke - e.g. <p>). */
    svgPoint: SVGPoint,                         /* Current clicked point with svg coordinates (used for elements that have a fill or stroke - e.g. <circle>, <path>). */
    svgTypes: TypeSvgElement[] = [tagNamePath], /* The elements to be checked within the svg element (tagNamePath, tagNameCircle, tagNameG). */
    firstSvgType: TypeSvgElement|null = null,   /* Forces a given svg element to be returned. */
): SVGElement|null => {
    /* No svg element given. */
    if (!svg) {
        return null;
    }

    /* Get all paths and circles. */
    const svgElements: SVGGeometryElement[] = [...svg.querySelectorAll<SVGGeometryElement>(svgTypes.join(', '))];

    /* Found svg elements. */
    let svgElementCircle: SVGCircleElement|null = null;
    let svgElementG: SVGGElement|null = null;
    let svgElementPath: SVGPathElement|null = null;

    /* Check every path. */
    svgElements.forEach((svgElement: SVGGeometryElement): void => {

        /* Single element already found. */
        if (firstSvgType === tagNameCircle && svgElementCircle !== null) { return; }
        if (firstSvgType === tagNameG && svgElementG !== null) { return; }
        if (firstSvgType === tagNamePath && svgElementPath !== null) { return;}

        /* All elements already found. */
        if (svgElementCircle !== null && svgElementG !== null && svgElementPath !== null) {
            return;
        }

        /* Calculate whether the mouse is in the element. */
        const isInFill = svgElement.tagName === tagNamePath && svgElement.isPointInFill(svgPoint);
        const isInStroke = svgElement.tagName === tagNameCircle && svgElement.isPointInStroke(svgPoint);
        let isInG = false;

        if (svgElement.tagName === tagNameG) {
            const svgBounds = svgElement.getBoundingClientRect();

            isInG = point.x >= svgBounds.left && point.x <= svgBounds.right && point.y >= svgBounds.top && point.y <= svgBounds.bottom;
        }

        /* Elements outside the mouse. */
        if (!isInFill && !isInStroke && !isInG) {
            return;
        }

        /* check found element. */
        switch (svgElement.tagName.toLowerCase()) {

            /* Found circle element. */
            case tagNameCircle:
                svgElementCircle = svgElement as SVGCircleElement;
                return;

            /* Found g element. */
            case tagNameG:
                svgElementG = svgElement as SVGGElement;
                return;

            /* Found path element. */
            case tagNamePath:
                svgElementPath = svgElement as SVGPathElement;
                return;

            /* Unknown case. */
            default:
                throw new Error('Unsupported svg Element');
        }
    });

    /* No path or circle found. */
    if (svgElementCircle === null && svgElementG === null && svgElementPath === null) {
        return null;
    }

    /* Return circle. */
    if (firstSvgType === tagNameCircle && svgElementCircle !== null) {
        return svgElementCircle;
    }

    /* Return g. */
    if (firstSvgType === tagNameG && svgElementG !== null) {
        return svgElementG;
    }

    /* Return path. */
    if (firstSvgType === tagNamePath && svgElementPath !== null) {
        return svgElementPath;
    }

    /* Return path or circle. */
    return svgElementPath || svgElementCircle || svgElementG || null;
};

/**
 * Sets the svg class.
 */
export const setSvgClass = (type: TypeSvgClass) => {
    const svg = document.getElementById(idSvgMap);

    if (!svg) {
        return;
    }

    svg.classList.add(type);
}

/**
 * Resets the svg class.
 */
export const resetSvgClass = () => {
    const svg = document.getElementById(idSvgMap);

    if (!svg) {
        return;
    }

    svg.classList.value = '';
}

/**
 * Remove hover class from path.country.
 */
export const removeHoverClassPathCountry = () => {

    /* Find hovered elements. */
    const paths = document.querySelectorAll(`${tagNameSvg}#${idSvgMap} ${tagNamePath}.${classNameSvgPath}.${classNameHover}`);

    /* Remove hover class. */
    paths.forEach((path) => path.classList.remove(classNameHover));
}

/**
 * Remove hover class from circle.place.
 */
export const removeHoverClassCirclePlace = () => {

    /* Find hovered elements. */
    const circles = document.querySelectorAll(`${tagNameSvg}#${idSvgMap} ${tagNameCircle}.${classNameSvgCircle}.${classNameHover}`);

    /* Remove hover class. */
    circles.forEach((circle) => circle.classList.remove(classNameHover));
}

/**
 * Remove hover class from g.place-group.
 */
export const removeHoverClassGPlaceGroup = () => {

    /* Find hovered elements. */
    const gElements = document.querySelectorAll(`${tagNameSvg}#${idSvgMap} ${tagNameG}.${classNameSvgG}.${classNameHover}`);

    /* Remove hover class. */
    gElements.forEach((gElement) => gElement.classList.remove(classNameHover));
}

/**
 * Add hover class to given target element.
 *
 * @param target
 */
export const addHoverClass = (target: SVGElement|string): void => {

    /* Add hover class directly. */
    if (target instanceof SVGElement) {
        target.classList.add(classNameHover);
        return;
    }

    /* Try to get element by id. */
    const element = document.getElementById(target);
    if (element && element instanceof SVGElement) {
        element.classList.add(classNameHover);
        return;
    }

    console.error("Invalid target type. Expected SVGElement or string.");
}

/**
 * Adds title to map.
 *
 * @param title
 */
export const addHoverTitle = (title: string): void => {
    const elementTitle = document.getElementById(idWorldMapTitle);

    if (!elementTitle) {
        return;
    }

    elementTitle.textContent = title;
}

/**
 * Adds subtitle to map.
 *
 * @param subtitle
 * @param state
 * @param population
 * @param t
 */
export const addHoverSubtitle = (
    subtitle: string,
    state: string|null = null,
    population: number|null = null,
    t: TFunction<"translation", undefined>|null = null
): void => {
    const elementSubtitle = document.getElementById(idWorldMapSubtitle);

    if (!elementSubtitle) {
        return;
    }

    let subtitleBuild = subtitle;

    if (state !== null) {
        subtitleBuild += `, ${state}`;
    }

    if (population !== null) {
        subtitleBuild += t === null ?
            ` (${population.toLocaleString('de-DE')})` :
            ` (${ucFirst(t('TEXT_WORD_POPULATION' as any))}: ${population.toLocaleString('de-DE')})`
        ;
    }

    elementSubtitle.textContent = subtitleBuild;

    if (subtitleBuild.length > 0) {
        elementSubtitle.classList.add(classNameVisible);
    } else {
        elementSubtitle.classList.remove(classNameVisible);
    }
}

/**
 * Removes the title from map.
 */
export const removeTitle = (): void => {
    const elementTitle = document.getElementById(idWorldMapTitle);

    if (!elementTitle) {
        return;
    }

    elementTitle.textContent = elementTitle.dataset.defaultTitle ?? textDefaultWorldMapTitle;
}

/**
 * Removes the subtitle.
 */
export const removeSubtitle = () => {
    const elementSubtitle = document.getElementById(idWorldMapSubtitle);

    if (!elementSubtitle) {
        return;
    }

    elementSubtitle.textContent = textDefaultWorldMapSubtitle;

    if (textDefaultWorldMapSubtitle.length > 0) {
        elementSubtitle.classList.add(classNameVisible);
    } else {
        elementSubtitle.classList.remove(classNameVisible);
    }
}

/**
 * Adds default title to map.
 */
export const resetTitle = (): void => {
    removeTitle();
    removeSubtitle();
}

/**
 * Returns the countryMap element by given id.
 *
 * @param id
 */
export const getCountryMapElement = (id: string|null): TypeCountry|null => {
    if (id === null) {
        return null;
    }

    const countryMap = getCountryMap();

    if (!(id in countryMap)) {
        return null;
    }

    return countryMap[id];
}

/**
 * Returns the cityMap element by given id.
 *
 * @param id
 */
export const getCityMapElement = (id: string|null): TypeCity|null => {
    if (id === null) {
        return null;
    }

    const cityMap = getCityMap();

    if (!(id in cityMap)) {
        return null;
    }

    return cityMap[id];
}
