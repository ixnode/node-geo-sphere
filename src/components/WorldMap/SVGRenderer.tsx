import React, {useEffect, useState, useRef} from 'react';

/* Import configuration. */
import {
    eventMouseDownAsEventListener,
    eventMouseLeaveAsEventListener,
    eventMouseMoveAsEventListener,
    eventMouseUpAsEventListener,
    eventTouchEndAsEventListener,
    eventTouchMoveAsEventListener,
    eventTouchStartAsEventListener,
    eventWheelAsEventListener
} from "./config/events";
import {countryMap} from "./config/countries";
import {defaultLanguage} from "./config/config";

/* Import types. */
import {TypeClickCountry} from "./types/types";

/* Import classes. */
import {TypeSvgContent} from "./classes/GeoJson2Path";

/* Import tools. */
import {getLanguageName} from "./tools/language";

/* SVGRendererProps interface. */
interface SVGRendererProps {
    svgContent: TypeSvgContent;
    country: string | null;
    onClickCountry: TypeClickCountry;
    language: string
}

/* SVGViewBox interface. */
interface SVGViewBox {
    x: number;
    y: number;
    width: number;
    height: number;
}

/* Global variables for panning and pinchToZoom instead of useState -> accessible via addEventListener event. */
let globalIsMousePanningClick = false;
let globalIsMousePanningDoing = false;
let globalIsTouchPanningClick = false;
let globalIsTouchPanningDoing = false;
let globalIsTouchPinchToZoomClick = false;
let globalIsTouchPinchToZoomDoing = false;

/* Other global variables. */
let globalLanguage: string = defaultLanguage;

/**
 * SVGRenderer component.
 *
 * @author Björn Hempel <bjoern@hempel.li>
 * @version 0.1.0 (2024-07-14)
 * @since 0.1.0 (2024-07-14) First version.
 */
const SVGRenderer: React.FC<SVGRendererProps> = ({
    svgContent,
    country,
    onClickCountry = null,
    language
}) => {

    /* Set states. */
    const [isMousePanningDoing, setIsMousePanningDoing] = useState(false);
    const [startPoint, setStartPoint] = useState({x: 0, y: 0});
    const [viewBox, setViewBox] = useState<SVGViewBox>({
        x: svgContent.viewBoxLeft,
        y: svgContent.viewBoxTop,
        width: svgContent.viewBoxWidth,
        height: svgContent.viewBoxHeight
    });

    /* Set references. */
    const svgRef = useRef<SVGSVGElement>(null!);
    const initialDistanceRef = useRef<number|null>(null);
    const initialViewBoxRef = useRef<SVGViewBox|null>(null);

    /* Set global variables. */
    globalLanguage = language;



    /**
     * ================
     * A) Mouse Events.
     * ================
     */

    /**
     * "mousedown" event.
     *
     * @param event
     */
    const handleMouseDown = (
        event: React.MouseEvent<SVGSVGElement, MouseEvent> | SVGSVGElementEventMap["mousedown"]
    ) => {

        /* Print debug information. */
        setDebugType('handleMouseDown');

        /* Prevent event bubbling. */
        event.preventDefault();

        /* Set start point. */
        setStartPoint({ x: event.clientX, y: event.clientY });

        /* Mark "start panning". */
        globalIsMousePanningClick = true;
    };

    /**
     * "mousemove" event.
     *
     * @param event
     */
    const handleMouseMove = (
        event: React.MouseEvent<SVGSVGElement, MouseEvent> | SVGSVGElementEventMap["mousemove"]
    ) => {

        /* "handleMouseDown" is not triggered yet or svg is not available -> stop handle. */
        if (!globalIsMousePanningClick || !svgRef.current) {
            return;
        }

        /* Print debug information. */
        setDebugType('handleMouseMove');

        /* Prevent event bubbling. */
        event.preventDefault();

        /* Get SVG dimensions. */
        const svgRect = svgRef.current.getBoundingClientRect();

        /* Calculate moved distance. */
        const distanceX = (startPoint.x - event.clientX) * (viewBox.width / svgRect.width);
        const distanceY = (startPoint.y - event.clientY) * (viewBox.height / svgRect.height);
        const distance = Math.sqrt(Math.pow(distanceX, 2) + Math.pow(distanceY, 2));

        /* Save new viewBox. */
        setViewBoxAndShowDebug({
            width: viewBox.width,
            height: viewBox.height,
            x: viewBox.x + distanceX,
            y: viewBox.y + distanceY
        });

        /* Set start point. */
        setStartPoint({x: event.clientX, y: event.clientY});

        /* Mark "start panning". */
        if (distance > 2) {
            setIsMousePanningDoing(true);
            globalIsMousePanningDoing = true;
        }
    };

    /**
     * "mouseup" and "mouseleave" event.
     */
    const handleMouseUp = () => {

        /* Print debug information. */
        setDebugType('handleMouseUp');

        /* Mark "stop panning". */
        setIsMousePanningDelay(false, 0);
    };



    /**
     * ================
     * B) Touch Events.
     * ================
     */

    /**
     * "touchstart" event (main).
     *
     * @param event
     */
    const handleTouchClick = (event: React.TouchEvent<SVGSVGElement> | SVGSVGElementEventMap["touchstart"]) => {

        /**
         * Handle touch number:
         * 1 - panning map
         * 2 - zoom map
         */
        switch (event.touches.length) {
            /* Move map. */
            case 1:
                handleTouchPanningClick(event);
                break;

            /* Zoom map. */
            case 2:
                handleTouchPinchToZoomClick(event);
                break;

            /* Unsupported state. */
            default:
                console.warn('Number of touch events is not supported');
                break;
        }
    };

    /**
     * "touchstart" event (panning).
     *
     * @param event
     */
    const handleTouchPanningClick = (event: React.TouchEvent<SVGSVGElement> | SVGSVGElementEventMap["touchstart"]) => {

        /* Only 1 touch is supported. */
        if (event.touches.length !== 1) {
            return;
        }

        /* Print debug information. */
        setDebugType('handleTouchPanningClick');

        /* Prevent event bubbling. */
        event.preventDefault();

        /* Set start point. */
        setStartPoint({x: event.touches[0].clientX, y: event.touches[0].clientY});

        /* Mark "start panning". */
        globalIsTouchPanningClick = true;
    };

    /**
     * "touchstart" event (zoom).
     *
     * @param event
     */
    const handleTouchPinchToZoomClick = (event: React.TouchEvent<SVGSVGElement> | SVGSVGElementEventMap["touchstart"]) => {

        /* Only 2 touch is supported. */
        if (event.touches.length !== 2) {
            return;
        }

        /* Print debug information. */
        setDebugType('handleTouchPinchToZoomClick');

        /* Prevent event bubbling. */
        event.preventDefault();

        /* Remember current state. */
        initialDistanceRef.current = Math.hypot(
            event.touches[1].clientX - event.touches[0].clientX,
            event.touches[1].clientY - event.touches[0].clientY
        );
        initialViewBoxRef.current = viewBox;

        /* Set start point. */
        setStartPoint({x: event.touches[0].clientX, y: event.touches[0].clientY});

        /* Mark "start pinch to zoom". */
        globalIsTouchPinchToZoomClick = true;
    };

    /**
     * "touchmove" event (main).
     *
     * @param event
     */
    const handleTouchDoing = (event: React.TouchEvent<SVGSVGElement> | SVGSVGElementEventMap["touchmove"]) => {

        /**
         * Handle touch number:
         * 1 - move map
         * 2 - zoom map
         */
        switch (event.touches.length) {
            /* Move map. */
            case 1:
                handleTouchPanningDoing(event);
                break;

            /* Zoom map. */
            case 2:
                handleTouchDoingPinchToZoomDoing(event);
                break;

            /* Unsupported state. */
            default:
                console.warn('Number of touch events is not supported');
                break;
        }
    };

    /**
     * "touchmove" event (panning).
     *
     * @param event
     */
    const handleTouchPanningDoing = (event: React.TouchEvent<SVGSVGElement> | SVGSVGElementEventMap["touchmove"]) => {

        /* handleTouchStartMove is not triggered yet or svg is not available -> stop handle. */
        if (!globalIsTouchPanningClick || !svgRef.current) {
            return;
        }

        /* Only 1 touch is supported. */
        if (event.touches.length !== 1) {
            return;
        }

        /* Print debug information. */
        setDebugType('handleTouchPanningDoing');

        /* Prevent event bubbling. */
        event.preventDefault();

        /* Get SVG dimensions. */
        const svgRect = svgRef.current.getBoundingClientRect();

        const clientX = event.touches[0].clientX;
        const clientY = event.touches[0].clientY;

        const distanceX = (startPoint.x - clientX) * (viewBox.width / svgRect.width);
        const distanceY = (startPoint.y - clientY) * (viewBox.height / svgRect.height);
        const distance = Math.sqrt(Math.pow(distanceX, 2) + Math.pow(distanceY, 2));

        /* Save new viewBox. */
        setViewBoxAndShowDebug({
            width: viewBox.width,
            height: viewBox.height,
            x: viewBox.x + distanceX,
            y: viewBox.y + distanceY
        });

        /* Set start point. */
        setStartPoint({x: clientX, y: clientY});

        /* Mark "start panning". */
        if (distance > 10000) {
            globalIsTouchPanningDoing = true;
        }
    }

    /**
     * "touchmove" event (zoom).
     *
     * @param event
     */
    const handleTouchDoingPinchToZoomDoing = (event: React.TouchEvent<SVGSVGElement> | SVGSVGElementEventMap["touchmove"]) => {

        /* handleTouchStartZoom is not triggered yet or svg is not available -> stop handle. */
        if (!globalIsTouchPinchToZoomClick || !svgRef.current || !initialDistanceRef.current || !initialViewBoxRef.current) {
            return;
        }

        /* Only 2 touch is supported. */
        if (event.touches.length !== 2) {
            return;
        }

        /* Print debug information. */
        setDebugType('handleTouchDoingPinchToZoomDoing');

        /* Prevent event bubbling. */
        event.preventDefault();

        /* Get SVG dimensions. */
        const svgRect = svgRef.current.getBoundingClientRect();

        const touch1 = event.touches[0];
        const touch2 = event.touches[1];

        const newDistance = Math.hypot(touch2.clientX - touch1.clientX, touch2.clientY - touch1.clientY);

        const scale = newDistance / initialDistanceRef.current;

        const centerX = (touch1.clientX + touch2.clientX) / 2 - svgRect.left;
        const centerY = (touch1.clientY + touch2.clientY) / 2 - svgRect.top;

        const newWidth = initialViewBoxRef.current?.width / scale;
        const newHeight = initialViewBoxRef.current?.height / scale;

        const distanceX = (centerX / svgRect.width) * (initialViewBoxRef.current?.width - newWidth);
        const distanceY = (centerY / svgRect.height) * (initialViewBoxRef.current?.height - newHeight);
        const distance = Math.sqrt(Math.pow(distanceX, 2) + Math.pow(distanceY, 2));

        /* Save new viewBox. */
        setViewBoxAndShowDebug({
            x: initialViewBoxRef.current?.x + distanceX,
            y: initialViewBoxRef.current?.y + distanceY,
            width: newWidth,
            height: newHeight
        }, scale);

        /* Mark "start panning". */
        if (distance > 2) {
            globalIsTouchPinchToZoomDoing = true;
        }
    }

    /**
     * "touchend" event.
     */
    const handleTouchEnd = () => {

        /* Print debug information. */
        setDebugType('handleTouchEnd');

        /* Mark "stop panning" and "pinch to zoom". */
        setIsTouchPanningDelay(false, 50);
        setIsTouchPinchToZoomDelay(false, 50);

        /* Reset initial distance. */
        initialDistanceRef.current = null;
        initialViewBoxRef.current = null;
    };



    /**
     * =========================
     * C) Wheel and Zoom Events.
     * =========================
     */

    /**
     * "wheel" event.
     */
    const handleWheel = (event: React.WheelEvent<SVGSVGElement> | WheelEvent) => {

        /* Svg is not available -> stop handle. */
        if (!svgRef.current) {
            return;
        }

        /* Print debug information. */
        setDebugType('handleWheel');

        /* Prevent event bubbling. */
        event.preventDefault();

        /* Get event data. */
        const {
            /* type */
            // type,

            /* mouse position */
            clientX,
            clientY,

            /* keys */
            // altKey,
            // shiftKey,

            /* delta */
            deltaY,
            // wheelDelta
        } = event;

        /* Calculate scale from wheel delta. */
        const scale = 1 + deltaY / 1000;

        /* Get SVG dimensions. */
        const svgRect = svgRef.current.getBoundingClientRect();

        const mouseX = clientX - svgRect.left;
        const mouseY = clientY - svgRect.top;

        const newWidth = viewBox.width * scale;
        const newHeight = viewBox.height * scale;

        const distanceX = (mouseX / svgRect.width) * (viewBox.width - newWidth);
        const distanceY = (mouseY / svgRect.height) * (viewBox.height - newHeight);

        /* Save new viewBox. */
        setViewBoxAndShowDebug({
            x: viewBox.x + distanceX,
            y: viewBox.y + distanceY,
            width: newWidth,
            height: newHeight
        });
    };



    /**
     * ===================
     * 1) Helper functions
     * ===================
     */

    /**
     * Sets the viewBox and display debug information.
     *
     * @param viewBoxNew
     * @param scale
     */
    const setViewBoxAndShowDebug = (
        viewBoxNew: SVGViewBox,
        scale: number|null = null
    ) => {
        setViewBox(viewBoxNew);

        let debugContent = 'x=' + viewBox.x + '<br>y=' + viewBox.y + '<br>width=' + viewBox.width + '<br>height=' + viewBox.height;

        if (scale !== null) {
            debugContent += '<br>scale = ' + scale;
        }

        setDebugContent(debugContent);
    };

    /**
     * Sets the debug type.
     *
     * @param type
     */
    const setDebugType = (type: string) => {
        const element = document.getElementById('debug-map-type');

        if (!element) {
            return;
        }

        element.innerHTML = type;
    }

    /**
     * Sets the debug content.
     *
     * @param content
     */
    const setDebugContent = (content: string) => {
        const element = document.getElementById('debug-map-content');

        if (!element) {
            return;
        }

        element.innerHTML = content;
    }

    /**
     * setIsMousePanning with delay.
     *
     * @param isMousePanning
     * @param delay
     */
    const setIsMousePanningDelay = (isMousePanning: boolean, delay: number|null = null) => {

        if (delay === null) {
            setIsMousePanningDoing(isMousePanning);
            globalIsMousePanningClick = isMousePanning;
            globalIsMousePanningDoing = isMousePanning;
            return;
        }

        window.setTimeout(() => {
            setIsMousePanningDoing(isMousePanning);
            globalIsMousePanningClick = isMousePanning;
            globalIsMousePanningDoing = isMousePanning;
        }, delay);
    }

    /**
     * setIsMousePanning with delay.
     *
     * @param isTouchPanning
     * @param delay
     */
    const setIsTouchPanningDelay = (isTouchPanning: boolean, delay: number|null = null) => {

        if (delay === null) {
            globalIsTouchPanningClick = isTouchPanning;
            globalIsTouchPanningDoing = isTouchPanning;
            return;
        }

        window.setTimeout(() => {
            globalIsTouchPanningClick = isTouchPanning;
            globalIsTouchPanningDoing = isTouchPanning;
        }, delay);
    }

    /**
     * setIsMousePanning with delay.
     *
     * @param isTouchPinchToZoom
     * @param delay
     */
    const setIsTouchPinchToZoomDelay = (isTouchPinchToZoom: boolean, delay: number|null = null) => {

        if (delay === null) {
            globalIsTouchPinchToZoomClick = isTouchPinchToZoom;
            globalIsTouchPinchToZoomDoing = isTouchPinchToZoom;
            return;
        }

        window.setTimeout(() => {
            globalIsTouchPinchToZoomClick = isTouchPinchToZoom;
            globalIsTouchPinchToZoomDoing = isTouchPinchToZoom;
        }, delay);
    }

    /**
     * Handle country click.
     *
     * @param event
     */

    const handleClick = (event: Event) => {

        /* No onClickCountry found. */
        if (onClickCountry === null) {
            return;
        }

        /* Prevent click if panning or pinch-to-zoom is active. */
        if (globalIsMousePanningDoing || globalIsTouchPanningDoing || globalIsTouchPinchToZoomDoing) {
            return;
        }

        const target = event.target as SVGPathElement;

        /* No target or id found. */
        if (!target || !target.id) {
            return;
        }

        const id = target.id;

        /* No countryMap found. */
        if (!(id in countryMap)) {
            onClickCountry({
                id: id
            });

            return;
        }

        const countryData = countryMap[id];

        /* Return date from clicked map. */
        onClickCountry({
            id: id,
            name: countryData[getLanguageName(globalLanguage)]
        });
    };



    /**
     * =======================
     * 2) Use effect functions
     * =======================
     */

    /**
     * Register mouse, wheel and touch events. Also add tidy up (unregister) mouse, wheel and touch events, when
     * unmounting component.
     */
    useEffect(() => {

        /* Svg is not available -> stop handle. */
        if (!svgRef.current) {
            return;
        }

        /* Easy access. */
        const svgElement = svgRef.current;

        /**
         * ================
         * A) Mouse Events.
         * ================
         */
        /* svgElement.addEventListener('mousedown') vs. svg.onMouseDown */
        eventMouseDownAsEventListener && svgElement.addEventListener('mousedown', handleMouseDown, { passive: false });
        /* svgElement.addEventListener('mousemove') vs. svg.onMouseMove */
        eventMouseMoveAsEventListener && svgElement.addEventListener('mousemove', handleMouseMove, { passive: false });
        /* svgElement.addEventListener('mouseup') vs. svg.onMouseUp */
        eventMouseUpAsEventListener && svgElement.addEventListener('mouseup', handleMouseUp, { passive: false });
        /* svgElement.addEventListener('mouseleave') vs. svg.onMouseLeave */
        //eventMouseLeaveAsEventListener && svgElement.addEventListener('mouseleave', handleMouseUp, { passive: false });

        /**
         * ================
         * B) Touch Events.
         * ================
         */
        /* svgElement.addEventListener('touchstart') vs. svg.onTouchStart */
        eventTouchStartAsEventListener && svgElement.addEventListener('touchstart', handleTouchClick, { passive: false });
        /* svgElement.addEventListener('touchmove') vs. svg.onTouchMove */
        eventTouchMoveAsEventListener && svgElement.addEventListener('touchmove', handleTouchDoing, { passive: false });
        /* svgElement.addEventListener('touchend') vs. svg.onTouchEnd */
        eventTouchEndAsEventListener && svgElement.addEventListener('touchend', handleTouchEnd, { passive: false });

        /**
         * =========================
         * C) Wheel and Zoom Events.
         * =========================
         */
        /* svgElement.addEventListener('wheel') vs. svg.onWheel */
        eventWheelAsEventListener && svgElement.addEventListener('wheel', handleWheel, { passive: false });

        /**
         * Unregister part.
         */
        return () => {

            /**
             * ================
             * A) Mouse Events.
             * ================
             */
            eventMouseDownAsEventListener && svgElement.removeEventListener('mousedown', handleMouseDown);
            eventMouseMoveAsEventListener && svgElement.removeEventListener('mousemove', handleMouseMove);
            eventMouseUpAsEventListener && svgElement.removeEventListener('mouseup', handleMouseUp);
            eventMouseLeaveAsEventListener && svgElement.removeEventListener('mouseleave', handleMouseUp);

            /**
             * ================
             * B) Touch Events.
             * ================
             */
            eventTouchStartAsEventListener && svgElement.removeEventListener('touchstart', handleTouchClick);
            eventTouchMoveAsEventListener && svgElement.removeEventListener('touchmove', handleTouchDoing);
            eventTouchEndAsEventListener && svgElement.removeEventListener('touchend', handleTouchEnd);

            /**
             * =========================
             * C) Wheel and Zoom Events.
             * =========================
             */
            eventWheelAsEventListener && svgElement.removeEventListener('wheel', handleWheel);
        };
    }, [
        viewBox,
        startPoint
    ]);

    /**
     * Initializes the rendering process.
     */
    useEffect(() => {

        /* Print debug information. */
        setDebugType('Initial render');

        /* Save new viewBox. */
        setViewBoxAndShowDebug({
            x: svgContent.viewBoxLeft,
            y: svgContent.viewBoxTop,
            width: svgContent.viewBoxWidth,
            height: svgContent.viewBoxHeight
        });

    }, [
        svgContent,
        country
    ]); /* Run this effect whenever the svgContent or country changes. */

    /**
     * Adds click handlers to all paths with class "country" after rendering.
     */
    useEffect(() => {

        /* Svg is not available -> stop handle. */
        if (!svgRef.current) {
            return;
        }

        /* Easy access. */
        const svgElement = svgRef.current;

        /* Select all paths with class "country" */
        const countryPaths = svgElement.querySelectorAll('path.country');

        /* Add event listeners to each path. */
        countryPaths.forEach((path) => {
            path.addEventListener('click', handleClick);
            path.addEventListener('touchend', handleClick, { passive: false });
        });

        /* Cleanup event listeners on component unmount or when content changes. */
        return () => {
            countryPaths.forEach((path) => {
                path.removeEventListener('click', handleClick);
                path.removeEventListener('touchend', handleClick);
            });
        };
    }, [svgContent]); /* Run this effect whenever the svgContent changes. */



    /**
     * ==============
     * 3) SVG Builder
     * ==============
     */
    return (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            ref={svgRef}
            id="svg-map"
            style={{ cursor: isMousePanningDoing ? 'move' : 'default' }}
            viewBox={`${viewBox.x} ${viewBox.y} ${viewBox.width} ${viewBox.height}`}
            dangerouslySetInnerHTML={{ __html: svgContent.svgPaths + svgContent.svgCircles }}

            /**
             * ================
             * A) Mouse Events.
             * ================
             */
            onMouseDown={!eventMouseDownAsEventListener ? handleMouseDown : undefined}
            onMouseMove={!eventMouseMoveAsEventListener ? handleMouseMove : undefined}
            onMouseUp={!eventMouseUpAsEventListener ? handleMouseUp : undefined}
            //onMouseLeave={!eventMouseLeaveAsEventListener ? handleMouseUp : undefined}

            /**
             * ================
             * B) Touch Events.
             * ================
             */
            onTouchStart={!eventTouchStartAsEventListener ? handleTouchClick : undefined}
            onTouchMove={!eventTouchMoveAsEventListener ? handleTouchDoing : undefined}
            onTouchEnd={!eventTouchEndAsEventListener ? handleTouchEnd : undefined}

            /**
             * =========================
             * C) Wheel and Zoom Events.
             * =========================
             */
            onWheel={!eventWheelAsEventListener ? handleWheel: undefined}
        />
    );
};

export default SVGRenderer;
