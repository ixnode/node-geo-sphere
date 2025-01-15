import React from "react";
import {Point} from "../config/interfaces";


/**
 * Get Point from event.
 *
 * @param event
 */
export const getPointFromEvent = (
    event:
        React.MouseEvent<SVGSVGElement, MouseEvent> | SVGSVGElementEventMap["mousedown"] |
        React.TouchEvent<SVGSVGElement> | SVGSVGElementEventMap["touchend"]
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
 */
export const getSvgElementFromSvg = (svg: SVGSVGElement|null, svgPoint: SVGPoint): SVGElement|null => {

    /* No svg element given. */
    if (!svg) {
        return null;
    }

    /* Get all paths. */
    const paths = svg.querySelectorAll('path');
    let svgElement: SVGElement|null = null;

    /* Check every path. */
    paths.forEach((path) => {
        if ((path as SVGGeometryElement).isPointInFill(svgPoint)) {
            svgElement = path as SVGElement;
        }
    });

    /* No path found. */
    if (svgElement === null) {
        return null;
    }

    /* Transfer path with type hint. */
    return svgElement;
};