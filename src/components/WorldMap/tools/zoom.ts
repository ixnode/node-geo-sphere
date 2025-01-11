/* Import configuration. */
import {SVGViewBox} from "../config/interfaces";

/**
 * Calculates the new zoom box according to given parameter.
 *
 * @param viewBox
 * @param svgRectWidth
 * @param svgRectHeight
 * @param mouseX
 * @param mouseY
 * @param deltaY
 */
export const calculateZoomViewBox = (
    viewBox: SVGViewBox,
    svgRectWidth: number,
    svgRectHeight: number,
    mouseX: number,
    mouseY: number,
    deltaY: number,
): SVGViewBox => {
    /* Calculate scale from delta. */
    const scale = 1 + deltaY / 1000;

    const newWidth = viewBox.width * scale;
    const newHeight = viewBox.height * scale;

    const distanceX = (mouseX / svgRectWidth) * (viewBox.width - newWidth);
    const distanceY = (mouseY / svgRectHeight) * (viewBox.height - newHeight);

    /* Save new viewBox. */
    return {
        x: viewBox.x + distanceX,
        y: viewBox.y + distanceY,
        width: newWidth,
        height: newHeight
    };
};