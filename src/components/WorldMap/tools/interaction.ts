import React from "react";

/* Import configurations. */
import {Point} from "../config/interfaces";
import {TypeSvgElement} from "../types/types";
import {tagNameCircle, tagNamePath} from "../config/elementNames";

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
 * @param svg
 * @param svgPoint
 * @param svgTypes
 * @param firstSvgType
 */
export const getSvgElementFromSvg = (
    svg: SVGSVGElement|null,
    svgPoint: SVGPoint,
    svgTypes: TypeSvgElement[] = [tagNamePath],
    firstSvgType: TypeSvgElement|null = null
): SVGElement|null => {

    /* No svg element given. */
    if (!svg) {
        return null;
    }

    /* Get all paths and circles. */
    const svgElements = svg.querySelectorAll(svgTypes.join(', '));

    /* Found svg elements. */
    let svgElementPath: SVGPathElement|null = null;
    let svgElementCircle: SVGCircleElement|null = null;

    /* Check every path. */
    svgElements.forEach((svgElement) => {

        /* Elements already found. */
        if (firstSvgType === tagNamePath && svgElementPath !== null) {
            return;
        }
        if (firstSvgType === tagNameCircle && svgElementCircle !== null) {
            return;
        }
        if (svgElementPath !== null && svgElementCircle !== null) {
            return;
        }

        /* Calculate whether the mouse is in the element. */
        const isInFill = (svgElement as SVGGeometryElement).isPointInFill(svgPoint);
        const isInStroke = svgElement.tagName === tagNameCircle && (svgElement as SVGGeometryElement).isPointInStroke(svgPoint);

        /* Elements outside the mouse. */
        if (!isInFill && !isInStroke) {
            return;
        }

        /* check found element. */
        switch (svgElement.tagName.toLowerCase()) {

            /* Found path element. */
            case tagNamePath:
                svgElementPath = svgElement as SVGPathElement;
                return;

            /* Found circle element. */
            case tagNameCircle:
                svgElementCircle = svgElement as SVGCircleElement;
                return;

            /* Unknown case. */
            default:
                throw new Error('Unsupported svg Element');
        }
    });

    /* No path or circle found. */
    if (svgElementPath === null && svgElementCircle === null) {
        return null;
    }

    /* Return path. */
    if (firstSvgType === tagNamePath && svgElementPath !== null) {
        return svgElementPath;
    }

    /* Return circle. */
    if (firstSvgType === tagNameCircle && svgElementCircle !== null) {
        return svgElementCircle;
    }

    /* Return path or circle. */
    return svgElementPath || svgElementPath || null;
};