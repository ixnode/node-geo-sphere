import React, {useEffect, useState, useRef} from 'react';
import {createRoot, Root} from "react-dom/client";
import {useTranslation} from "react-i18next";

/* Import configuration (WorldMap). */
import {
    eventMouseDownAsEventListener,
    eventMouseDownEnabled,
    eventMouseEnterAsEventListener,
    eventMouseEnterEnabled,
    eventMouseLeaveAsEventListener,
    eventMouseLeaveEnabled,
    eventMouseMoveAsEventListener,
    eventMouseMoveEnabled,
    eventMouseOverAsEventListener,
    eventMouseOverEnabled,
    eventMouseUpAsEventListener,
    eventMouseUpEnabled,
    eventTouchEndAsEventListener,
    eventTouchEndEnabled,
    eventTouchMoveAsEventListener,
    eventTouchMoveEnabled,
    eventTouchStartAsEventListener,
    eventTouchStartEnabled,
    eventWheelAsEventListener,
    eventWheelEnabled,
} from "../config/events";
import {countryMap} from "../config/countries";
import {defaultDebug, defaultMapHeight, defaultMapWidth, scaleFactor} from "../config/config";
import {CountryData, PlaceData, DebugContent, Point, SVGViewBox} from "../config/interfaces";
import {
    classNameSvgCircle,
    classNameSvgG,
    classNameSvgPath,
    eventNameMouseDown,
    eventNameMouseEnter,
    eventNameMouseLeave,
    eventNameMouseMove,
    eventNameMouseOver,
    eventNameMouseUp,
    eventNameTouchEnd,
    eventNameTouchMove,
    eventNameTouchStart,
    eventNameWheel,
    idDebugMapContent,
    idDebugMapType,
    idSvgMap,
    tagNameCircle,
    tagNameG,
    tagNamePath,
    tagNameTitle,
} from "../config/elementNames";

/* Import configuration (global). */
import {defaultLanguage} from "../../../config/config";

/* Import types. */
import {TypeClickCountry, TypeClickPlace, TypeSvgContent} from "../types/types";

/* Import classes. */
import {CoordinateConverter} from "../classes/CoordinateConverter";

/* Import tools. */
import {getLanguageNameCountry, getTranslatedNamePlace} from "../tools/language";
import {calculateZoomViewBox} from "../tools/zoom";
import {hideScrollHint, hideScrollHintDelayed, showScrollHint} from "../tools/layer";
import {
    addHoverClass, addHoverSubtitle,
    addHoverTitle,
    getPointFromEvent,
    getSvgElementFromSvg,
    getSvgPointFromSvg,
    removeHoverClassCirclePlace,
    removeHoverClassGPlaceGroup,
    removeHoverClassPathCountry, removeSubtitle,
    resetTitle,
    textNotAvailable
} from "../tools/interaction";

/* Import configurations. */
import {cityMap, TypeCity} from "../config/cities";

/* SVGRendererProps interface. */
interface SVGRendererProps {
    svgContent: TypeSvgContent,
    country: string | null,
    onClickCountry: TypeClickCountry,
    onClickPlace: TypeClickPlace,
    onHoverCountry: TypeClickCountry,
    onHoverPlace: TypeClickPlace,
    language: string,
    stateZoomIn?: number,
    stateZoomOut?: number,
    debug?: boolean,
    width?: number,
    height?: number,
}

/* Global variables for panning and pinchToZoom instead of useState -> accessible via addEventListener event. */
let isMouseDownGlobal = false;
let isMouseMoveGlobal = false;
let isTouchStartPanningGlobal = false;
let isTouchStartPinchToZoomGlobal = false;
let isTouchMovePanningGlobal = false;
let isTouchMovePinchToZoomGlobal = false;

/* Other global variables. */
let languageGlobal: string = defaultLanguage;
let rootDebugMapType: Root|null = null;
let rootDebugMapContent: Root|null = null;

/* Delays */
const delayMousePanning = null;



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
    onClickPlace = null,
    onHoverCountry = null,
    onHoverPlace = null,
    language = defaultLanguage,
    stateZoomIn = 0,
    stateZoomOut = 0,
    debug = defaultDebug,
    width = defaultMapWidth,
    height = defaultMapHeight,
}) => {

    /* Set states interaction. */
    const [isMouseDown, setIsMouseDown] = useState(false);
    const [isMouseMove, setIsMouseMove] = useState(false);
    const [isTouchStart, setIsTouchStart] = useState(false);
    const [isTouchMove, setIsTouchMove] = useState(false);

    /* Set states others. */
    const [startPoint, setStartPoint] = useState({x: 0, y: 0});
    const [viewBox, setViewBox] = useState<SVGViewBox>({
        x: svgContent.viewBoxLeft,
        y: svgContent.viewBoxTop,
        width: svgContent.viewBoxWidth,
        height: svgContent.viewBoxHeight
    });
    const [previousDeltaY, setPreviousDeltaY] = useState<number>(0);
    const [isTouchpadThrottling, setIsTouchpadThrottling] = useState<boolean>(false);
    const [touchpadZoomTimeout, setTouchpadZoomTimeout] = useState<number|ReturnType<typeof setTimeout>|null>(null);
    const [lastHoverCountryId, setLastHoverCountryId] = useState<string|null>(null);
    const [lastHoverPlaceId, setLastHoverPlaceId] = useState<string|null>(null);

    /* Set references. */
    const svgRef = useRef<SVGSVGElement>(null!);
    const initialDistanceRef = useRef<number|null>(null);
    const initialViewBoxRef = useRef<SVGViewBox|null>(null);
    const lastEvent = useRef<
        React.MouseEvent<SVGSVGElement, MouseEvent> | SVGSVGElementEventMap["mousedown"] |
        React.TouchEvent<SVGSVGElement> | SVGSVGElementEventMap["touchstart"] |
        null
    >(null);

    /* Set global variables. */
    languageGlobal = language;

    /* Import translation. */
    const { t } = useTranslation();



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
    const handleMouseDown = (event: React.MouseEvent<SVGSVGElement, MouseEvent> | SVGSVGElementEventMap["mousedown"]) => {
        /* Print debug information. */
        setDebugType(handleMouseDown.name);

        /* Prevent event bubbling. */
        event.preventDefault();

        /* Set start point. */
        setStartPoint({ x: event.clientX, y: event.clientY });

        /* Mark "start panning". */
        setIsMouseDownGlobal(true);

        /* Set last element. */
        lastEvent.current = event;
    };

    /**
     * "mousemove" event.
     *
     * @param event
     */
    const handleMouseMove = (event: React.MouseEvent<SVGSVGElement, MouseEvent> | SVGSVGElementEventMap["mousemove"]) => {

        /* Svg is not available -> stop handle. */
        if (!svgRef.current) {
            return;
        }

        /* Execution depending on status. */
        switch (isMouseDownGlobal) {

            /* Handle eventNameMouseMove event with mouse down. */
            case true:
                handleMouseMoveWithMouseDown(event);
                break;

            /* "isMouseDownGlobal" is not triggered yet. */
            case false:
                handleMouseMoveWithMouseUp(event);
                break;

            /* Unexpected case. */
            default:
                throw new Error('Unknown value for isMouseDownGlobal.');
        }
    };

    /**
     * "mousemove" event with mouse up.
     *
     * @param event
     */
    const handleMouseMoveWithMouseUp = (event: React.MouseEvent<SVGSVGElement, MouseEvent> | SVGSVGElementEventMap["mousemove"]) => {

        /* Print debug information. */
        setDebugType(handleMouseMove.name + ` (${eventNameMouseUp})`);

        /* Get clicked point from event. */
        const point = getPointFromEvent(event);

        /* Create point. */
        const svgPoint = getSvgPointFromSvg(svgRef.current, point);

        /* No SVGPoint found. */
        if (!svgPoint) {
            return null;
        }

        /* Try to get element from given event. */
        const element = getSvgElementFromSvg(svgRef.current, point, svgPoint, [tagNamePath, tagNameG], tagNameG);

        /* No element found. */
        if (element === null) {

            /* Remove hover classes. */
            removeHoverClassPathCountry();
            removeHoverClassCirclePlace();
            removeHoverClassGPlaceGroup();

            /* Reset title. */
            resetTitle();

            /* Log position. */
            setDebugContent({
                "mouse position x": svgPoint.x,
                "mouse position y": -svgPoint.y,
            } as DebugContent);

            return;
        }

        /* Handle path.country element. */
        if (element.tagName === tagNamePath && element.classList.contains(classNameSvgPath)) {
            handleHoverPathCountry(element, point, svgPoint);
            return;
        }

        /* Handle circle.place element. */
        if (element.tagName === tagNameCircle && element.classList.contains(classNameSvgCircle)) {
            handleHoverCirclePlace(element, point, svgPoint);
            return;
        }

        /* Handle g.place-group element. */
        if (element.tagName === tagNameG && element.classList.contains(classNameSvgG)) {
            handleHoverGPlaceGroup(element, point, svgPoint);
            return;
        }

        /* Log position and element type of unknown type. */
        setDebugContent({
            "mouse position x": svgPoint.x,
            "mouse position y": -svgPoint.y,
            "type": element.tagName,
        } as DebugContent);
    }

    /**
     * "mousemove" event with mouse down.
     *
     * @param event
     */
    const handleMouseMoveWithMouseDown = (event: React.MouseEvent<SVGSVGElement, MouseEvent> | SVGSVGElementEventMap["mousemove"]) => {

        /* Print debug information. */
        setDebugType(handleMouseMove.name + ` (${eventNameMouseDown})`);

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
            y: viewBox.y + distanceY,
            viewWidth: svgRect.width,
            viewHeight: svgRect.height,
        });

        /* Set start point. */
        setStartPoint({x: event.clientX, y: event.clientY});

        /* Mark "start panning". */
        if (distance > 2) {
            setIsMouseMoveGlobal(true);
        }
    }

    /**
     * "mouseup" event.
     */
    const handleMouseUp = (event: React.MouseEvent<SVGSVGElement, MouseEvent> | SVGSVGElementEventMap["mouseup"]) => {

        /* Print debug information. */
        setDebugType(handleMouseUp.name);

        /* Execute click callback function. */
        if (!isMouseMoveGlobal && lastEvent.current !== null) {
            handleSvgClick(lastEvent.current);
        }

        /* Mark "stop panning". */
        setIsMouseDownGlobal(false, delayMousePanning);
        setIsMouseMoveGlobal(false, delayMousePanning);

        /* Set last element. */
        lastEvent.current = null;
    };

    /**
     * "mouseleave" event.
     */
    const handleMouseLeave = (event: React.MouseEvent<SVGSVGElement, MouseEvent> | SVGSVGElementEventMap["mouseleave"]) => {

        /* Print debug information. */
        setDebugType(handleMouseLeave.name);

        /* Disable isMouseDownGlobal */
        setIsMouseDownGlobal(false);
        setIsMouseMoveGlobal(false);

        /* Remover hover classes. */
        removeHoverClassPathCountry();
        removeHoverClassCirclePlace();
        removeHoverClassGPlaceGroup();

        /* Resets the title. */
        resetTitle();
    }

    /**
     * "mouseenter" event.
     */
    const handleMouseEnter = (event: React.MouseEvent<SVGSVGElement, MouseEvent> | SVGSVGElementEventMap["mouseenter"]) => {

        /* Print debug information. */
        setDebugType(handleMouseEnter.name);
    };

    /**
     * "mouseover" event.
     */
    const handleMouseOver = (event: React.MouseEvent<SVGSVGElement, MouseEvent> | SVGSVGElementEventMap["mouseover"]) => {

        /* Print debug information. */
        setDebugType(handleMouseOver.name);
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
    const handleTouchStart = (event: React.TouchEvent<SVGSVGElement> | SVGSVGElementEventMap["touchstart"]) => {

        /* Svg is not available -> stop handle. */
        if (!svgRef.current) {
            return;
        }

        /* Set last element. */
        lastEvent.current = event;

        /**
         * Handle touch number:
         * 1 - panning map
         * 2 - zoom map
         */
        switch (event.touches.length) {
            /* Move map. */
            case 1:
                handleTouchStartPanning(event);
                break;

            /* Zoom map. */
            case 2:
                handleTouchStartPinchToZoom(event);
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
    const handleTouchStartPanning = (event: React.TouchEvent<SVGSVGElement> | SVGSVGElementEventMap["touchstart"]) => {

        /* Only 1 touch is supported. */
        if (event.touches.length !== 1) {
            return;
        }

        /* Print debug information. */
        setDebugType(handleTouchStartPanning.name);

        /* Prevent event bubbling. */
        event.preventDefault();

        /* Set start point. */
        setStartPoint({x: event.touches[0].clientX, y: event.touches[0].clientY});

        /* Mark "start panning". */
        setIsTouchStartPanningGlobal(true);
    };

    /**
     * "touchstart" event (pinch to zoom).
     *
     * @param event
     */
    const handleTouchStartPinchToZoom = (event: React.TouchEvent<SVGSVGElement> | SVGSVGElementEventMap["touchstart"]) => {

        /* Only 2 touch is supported. */
        if (event.touches.length !== 2) {
            return;
        }

        /* Print debug information. */
        setDebugType(handleTouchStartPinchToZoom.name);

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
        setIsTouchStartPinchToZoomGlobal(true);
    };

    /**
     * "touchmove" event (main).
     *
     * @param event
     */
    const handleTouchMove = (event: React.TouchEvent<SVGSVGElement> | SVGSVGElementEventMap["touchmove"]) => {

        /**
         * Handle touch number:
         * 1 - move map
         * 2 - zoom map
         */
        switch (event.touches.length) {
            /* Move map. */
            case 1:
                handleTouchMovePanning(event);
                break;

            /* Zoom map. */
            case 2:
                handleTouchMovePinchToZoom(event);
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
    const handleTouchMovePanning = (event: React.TouchEvent<SVGSVGElement> | SVGSVGElementEventMap["touchmove"]) => {

        /* handleTouchStartMove is not triggered yet or svg is not available -> stop handle. */
        if (!isTouchStartPanningGlobal || !svgRef.current) {
            return;
        }

        /* Only 1 touch is supported. */
        if (event.touches.length !== 1) {
            return;
        }

        /* Print debug information. */
        setDebugType(handleTouchMovePanning.name);

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
            y: viewBox.y + distanceY,
            viewWidth: svgRect.width,
            viewHeight: svgRect.height,
        });

        /* Set start point. */
        setStartPoint({x: clientX, y: clientY});

        /* Mark "start panning". */
        if (distance > 1000 / scaleFactor) {
            setIsTouchMovePanningGlobal(true);
        }
    }

    /**
     * "touchmove" event (zoom).
     *
     * @param event
     */
    const handleTouchMovePinchToZoom = (event: React.TouchEvent<SVGSVGElement> | SVGSVGElementEventMap["touchmove"]) => {

        /* handleTouchStartZoom is not triggered yet or svg is not available -> stop handle. */
        if (!isTouchStartPinchToZoomGlobal || !svgRef.current || !initialDistanceRef.current || !initialViewBoxRef.current) {
            return;
        }

        /* Only 2 touch is supported. */
        if (event.touches.length !== 2) {
            return;
        }

        /* Print debug information. */
        setDebugType(handleTouchMovePinchToZoom.name);

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
            height: newHeight,
            viewWidth: svgRect.width,
            viewHeight: svgRect.height,
        }, scale);

        /* Mark "start panning". */
        if (distance > 1000 / scaleFactor) {
            setIsTouchMovePinchToZoomGlobal(true);
        }
    }

    /**
     * "touchend" event.
     */
    const handleTouchEnd = (event: React.TouchEvent<SVGSVGElement> | SVGSVGElementEventMap["touchend"]) => {

        /* Print debug information. */
        setDebugType(handleTouchEnd.name);

        /* Execute click callback function. */
        if (!isTouchMovePanningGlobal && !isTouchMovePinchToZoomGlobal && lastEvent.current !== null) {
            handleSvgClick(lastEvent.current);
        }

        /* Finish "panning". */
        setIsTouchStartPanningGlobal(false, 50);
        setIsTouchMovePanningGlobal(false, 50);

        /* Finish "pinch to zoom". */
        setIsTouchStartPinchToZoomGlobal(false, 50);
        setIsTouchMovePinchToZoomGlobal(false, 50);

        /* Reset initial distance. */
        initialDistanceRef.current = null;
        initialViewBoxRef.current = null;

        /* Reset the last element. */
        lastEvent.current = null;
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

        const isTouchpad = isTouchpadUsed(event);

        if (isTouchpad) {
            handleWheelTouchpad(event);
            return;
        }

        handleWheelMouse(event);
    };

    /**
     * "wheel" event (mouse).
     */
    const handleWheelMouse = (event: React.WheelEvent<SVGSVGElement> | WheelEvent) => {

        /* Svg is not available -> stop handle. */
        if (!svgRef.current) {
            return;
        }

        if (!event.ctrlKey) {
            /* Show scroll hint. */
            showScrollHint();

            /* Hide scroll hint after some time. */
            hideScrollHintDelayed();

            return;
        }

        /* Print debug information. */
        setDebugType(handleWheel.name);

        /* Prevent event bubbling. */
        event.preventDefault();

        /* Get event data. */
        const {clientX, clientY, deltaY} = event;

        /* Get SVG dimensions. */
        const svgRect = svgRef.current.getBoundingClientRect();

        const mouseX = clientX - svgRect.left;
        const mouseY = clientY - svgRect.top;

        /* Save new viewBox. */
        setViewBoxAndShowDebug(calculateZoomViewBox(
            viewBox,        /* Current viewBox. */
            svgRect.width,  /* Width of svg area. */
            svgRect.height, /* Height of svg area. */
            mouseX,         /* X-Position of the mouse. */
            mouseY,         /* Y-Position of the mouse. */
            deltaY,         /* Zoom width. */
        ));
    };

    /**
     * Calculated smoothed deltaY for touchpads.
     *
     * @param deltaY
     * @param smoothingFactor
     */
    const smoothDeltaY = (deltaY: number, smoothingFactor = 0.8): number => {
        /* Use smoothingFactor from previousDeltaY and the rest of the new deltaY. */
        const smoothedDeltaY = smoothingFactor * previousDeltaY + (1 - smoothingFactor) * deltaY;

        setPreviousDeltaY(smoothedDeltaY);

        return smoothedDeltaY * 50;
    };

    /**
     * Resets the previousDeltaY value.
     */
    const resetDeltaY = () => {
        setPreviousDeltaY(0);
        setIsTouchpadThrottling(false);
    };

    /**
     * Function to detect touchpad usage.
     *
     * @param event
     */
    const isTouchpadUsed = (event: React.WheelEvent<SVGSVGElement> | WheelEvent): boolean => {
        return Math.abs(event.deltaY) < 100;
    };

    /**
     * "wheel" event (touchpad).
     */
    const handleWheelTouchpad = (event: React.WheelEvent<SVGSVGElement> | WheelEvent) => {

        /* Svg is not available -> stop handle. */
        if (!svgRef.current) {
            return;
        }

        /* Prevent event bubbling. */
        event.preventDefault();

        /* Get event data. */
        const {deltaY} = event;

        /* Normalize deltaY for touchpad. */
        const normalizedDeltaY = smoothDeltaY(deltaY);

        /* Skip some touchpad events. */
        if (isTouchpadThrottling) {
            return;
        }

        /* Enable throttling. */
        setIsTouchpadThrottling(true);

        /* Print debug information. */
        setDebugType(handleWheel.name);

        /* Match touchpad wheel with monitor refresh rate. */
        requestAnimationFrame(() => {

            /* Get event data. */
            const {clientX, clientY} = event;

            /* Get SVG dimensions. */
            const svgRect = svgRef.current.getBoundingClientRect();

            const mouseX = clientX - svgRect.left;
            const mouseY = clientY - svgRect.top;

            /* Clears the previousDeltaY after some time. */
            clearTimeout(touchpadZoomTimeout as number);
            setTouchpadZoomTimeout(setTimeout(resetDeltaY, 200));

            /* Save new viewBox. */
            setViewBoxAndShowDebug(calculateZoomViewBox(
                viewBox,          /* Current viewBox. */
                svgRect.width,    /* Width of svg area. */
                svgRect.height,   /* Height of svg area. */
                mouseX,           /* X-Position of the mouse. */
                mouseY,           /* Y-Position of the mouse. */
                normalizedDeltaY > 0 ? 150 : -150, /* Zoom width. */
            ));

            /* Disable throttling. */
            setIsTouchpadThrottling(false);
        });
    };



    /**
     * =====================
     * D) Click Zoom Events.
     * =====================
     */

    /**
     * Click zoom in event.
     */
    const handleZoomIn = () => {
        /* Svg is not available -> stop handle. */
        if (!svgRef.current) {
            return;
        }

        /* Print debug information. */
        setDebugType(handleZoomIn.name);

        const deltaY = -100; /* Zoom in */

        /* Get SVG dimensions. */
        const svgRect = svgRef.current.getBoundingClientRect();

        /* Save new viewBox. */
        setViewBoxAndShowDebug(calculateZoomViewBox(
            viewBox,            /* Current viewBox. */
            svgRect.width,      /* Width of svg area. */
            svgRect.height,     /* Height of svg area. */
            svgRect.width / 2,  /* X-Position of the mouse -> in that case the center of the svg area. */
            svgRect.height / 2, /* Y-Position of the mouse -> in that case the center of the svg area. */
            deltaY,             /* Zoom width. */
        ));
    };

    /**
     * Click zoom out event.
     */
    const handleZoomOut = () => {
        /* Svg is not available -> stop handle. */
        if (!svgRef.current) {
            return;
        }

        /* Print debug information. */
        setDebugType(handleZoomIn.name);

        const deltaY = 100; /* Zoom out */

        /* Get SVG dimensions. */
        const svgRect = svgRef.current.getBoundingClientRect();

        /* Save new viewBox. */
        setViewBoxAndShowDebug(calculateZoomViewBox(
            viewBox,            /* Current viewBox. */
            svgRect.width,      /* Width of svg area. */
            svgRect.height,     /* Height of svg area. */
            svgRect.width / 2,  /* X-Position of the mouse -> in that case the center of the svg area. */
            svgRect.height / 2, /* Y-Position of the mouse -> in that case the center of the svg area. */
            deltaY,             /* Zoom width. */
        ));
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

        if (!debug) {
            return;
        }

        let debugContent: DebugContent = {
            "position x": viewBox.x,
            "position y": viewBox.y,
            "svg width": viewBox.width,
            "svg height": viewBox.height,
        };

        if (viewBox.viewWidth && viewBox.viewHeight) {
            const viewRatio = viewBox.viewWidth / viewBox.viewHeight;
            debugContent["view dimensions"] = viewBox.viewWidth.toFixed(2) + ' x ' + viewBox.viewHeight.toFixed(2) + ' (' + viewRatio.toFixed(2) + ')';
        } else {
            debugContent["view dimensions"] = textNotAvailable;
        }

        if (width && height) {
            const ratio = width / height;
            debugContent["given dimensions"] = width.toFixed(2) + ' x ' + height.toFixed(2) + ' (' + ratio.toFixed(2) + ')';
        } else {
            debugContent["given dimensions"] = textNotAvailable;
        }

        if (lastEvent.current !== null) {
            const target = lastEvent.current.target as SVGPathElement;
            debugContent['last element'] = target.tagName;
        } else {
            debugContent['last element'] = textNotAvailable;
        }

        if (scale !== null) {
            debugContent["scale"] = scale;
        } else {
            debugContent["scale"] = textNotAvailable;
        }

        setDebugContent(debugContent);
    };

    /**
     * Sets the debug type.
     *
     * @param type
     */
    const setDebugType = (type: string) => {

        /* Debug is disabled. */
        if (!debug) {
            return;
        }

        /* Try to get debug map type area. */
        const element = document.getElementById(idDebugMapType);

        /* Debug map type area element was not found. */
        if (!element) {
            return;
        }

        if (rootDebugMapType === null) {
            rootDebugMapType = createRoot(element);
        }

        rootDebugMapType.render(type);
    }

    /**
     * Sets the debug content.
     *
     * @param content
     */
    const setDebugContent = (content: DebugContent) => {

        /* Debug is disabled. */
        if (!debug) {
            return;
        }

        /* Try to get debug map type content. */
        const element = document.getElementById(idDebugMapContent);

        /* Debug map type content element was not found. */
        if (!element) {
            return;
        }

        if (rootDebugMapContent === null) {
            rootDebugMapContent = createRoot(element);
        }

        rootDebugMapContent.render(
            <div className="table-structured separated ratio-1-2">
                <div className="grid">
                    {Object.entries(content).map(([key, value]) => (
                        <React.Fragment key={key}>
                            <div className="label">{key}</div>
                            <div className="value">{typeof value === 'number' ? value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : value}</div>
                        </React.Fragment>
                    ))}
                </div>
            </div>
        )
    }

    /**
     * setIsMouseDown (global).
     *
     * @param isMouseDown
     * @param delay
     */
    const setIsMouseDownGlobal = (isMouseDown: boolean, delay: number | null = null) => {

        if (delay !== null && delay > 0) {
            window.setTimeout(() => {
                setIsMouseDown(isMouseDown);
                isMouseDownGlobal = isMouseDown;
            }, delay);
            return;
        }

        setIsMouseDown(isMouseDown);
        isMouseDownGlobal = isMouseDown;
    }

    /**
     * setIsMouseMove (global).
     *
     * @param isMouseMove
     * @param delay
     */
    const setIsMouseMoveGlobal = (isMouseMove: boolean, delay: number | null = null) => {

        if (delay !== null && delay > 0) {
            window.setTimeout(() => {
                setIsMouseMove(isMouseMove);
                isMouseMoveGlobal = isMouseMove;
            }, delay);
            return;
        }

        setIsMouseMove(isMouseMove);
        isMouseMoveGlobal = isMouseMove;
    }

    /**
     * set isTouchStartPanning with delay.
     *
     * @param isTouchStart
     * @param delay
     */
    const setIsTouchStartPanningGlobal = (isTouchStart: boolean, delay: number|null = null) => {

        if (delay !== null && delay > 0) {
            window.setTimeout(() => {
                setIsTouchStart(isTouchStart);
                isTouchStartPanningGlobal = isTouchStart;
            }, delay);
            return;
        }

        setIsTouchStart(isTouchStart);
        isTouchStartPanningGlobal = isTouchStart;
    }

    /**
     * set isTouchMovePanning with delay.
     *
     * @param isTouchMove
     * @param delay
     */
    const setIsTouchMovePanningGlobal = (isTouchMove: boolean, delay: number|null = null) => {

        if (delay !== null && delay > 0) {
            window.setTimeout(() => {
                setIsTouchMove(isTouchMove);
                isTouchMovePanningGlobal = isTouchMove;
            }, delay);
            return;
        }

        setIsTouchMove(isTouchMove);
        isTouchMovePanningGlobal = isTouchMove;
    }

    /**
     * setIsMousePanning with delay.
     *
     * @param isTouchStart
     * @param delay
     */
    const setIsTouchStartPinchToZoomGlobal = (isTouchStart: boolean, delay: number|null = null) => {

        if (delay !== null && delay > 0) {
            window.setTimeout(() => {
                setIsTouchStart(isTouchStart);
                isTouchStartPinchToZoomGlobal = isTouchStart;
            }, delay);
            return;
        }

        setIsTouchStart(isTouchStart);
        isTouchStartPinchToZoomGlobal = isTouchStart;
    }

    /**
     * setIsMousePanning with delay.
     *
     * @param isTouchMove
     * @param delay
     */
    const setIsTouchMovePinchToZoomGlobal = (isTouchMove: boolean, delay: number|null = null) => {

        if (delay !== null && delay > 0) {
            window.setTimeout(() => {
                setIsTouchMove(isTouchMove);
                isTouchMovePinchToZoomGlobal = isTouchMove;
            }, delay);
            return;
        }

        setIsTouchMove(isTouchMove);
        isTouchMovePinchToZoomGlobal = isTouchMove;
    }

    /**
     * Handle svg click.
     *
     * @param event
     */
    const handleSvgClick = (
        event:
            React.MouseEvent<SVGSVGElement, MouseEvent> | SVGSVGElementEventMap["mousedown"] |
            React.TouchEvent<SVGSVGElement> | SVGSVGElementEventMap["touchstart"]
    ) => {

        /* Print debug information. */
        setDebugType(handleSvgClick.name);

        /* Get clicked point from event. */
        const point = getPointFromEvent(event);

        /* Create point. */
        const svgPoint = getSvgPointFromSvg(svgRef.current, point);

        /* No SVGPoint found. */
        if (!svgPoint) {
            return null;
        }

        /* Try to get element from given event. */
        const element = getSvgElementFromSvg(svgRef.current, point, svgPoint, [tagNamePath, tagNameG], tagNameG);

        /* No element found. */
        if (element === null) {
            return;
        }

        /* Handle path.country. */
        if (element instanceof SVGPathElement && element.classList.contains(classNameSvgPath)) {
            handleCountryClick(element, point, svgPoint);
            return;
        }

        /* Handle g.place-group. */
        if (element instanceof SVGGElement && element.classList.contains(classNameSvgG)) {
            handlePlaceClick(element, point, svgPoint);
            return;
        }

        console.warn('Unsupported tag name: ' + element.tagName);
    };

    /**
     * Handle country click.
     *
     * @param element
     * @param point
     * @param svgPoint
     */
    const handleCountryClick = (
        element: SVGPathElement,
        point: Point|null = null,
        svgPoint: SVGPoint|null = null
    ) => {

        /* No onClickCountry found. */
        if (onClickCountry === null) {
            return;
        }

        /* Prevent click if panning or pinch-to-zoom is active. */
        if (isMouseMoveGlobal || isTouchMovePanningGlobal || isTouchMovePinchToZoomGlobal) {
            return;
        }

        /* No target or id found. */
        if (!element || !element.id) {
            return;
        }

        const countryId = element.id;

        /* No country map found. */
        if (!(countryId in countryMap)) {
            onClickCountry({
                id: countryId
            });

            return;
        }

        /* Get country map data. */
        const countryData = countryMap[countryId];

        /* Build click (callback) data. */
        const clickData: CountryData = {
            id: countryId,
            name: countryData[getLanguageNameCountry(languageGlobal)]
        };

        /* Add point (screen position). */
        if (point !== null) {
            clickData.screenPosition = {
                x: point.x,
                y: point.y
            };
        }

        /* Add svg and wgs84 point. */
        if (svgPoint !== null) {

            /* Transform svg coordinates (mercator) to wgs84. */
            const coordinateConverter = new CoordinateConverter();
            const pointWgs84 = coordinateConverter.convertCoordinateMercatorToWgs84([svgPoint.x, -svgPoint.y]);

            /* Add data. */
            clickData.svgPosition = {
                x: svgPoint.x,
                y: -svgPoint.y
            };
            clickData.latitude = pointWgs84[1];
            clickData.longitude = pointWgs84[0];
        }

        /* Return date from clicked map. */
        onClickCountry(clickData);
    };

    /**
     * Handle place-group click.
     *
     * @param element
     * @param point
     * @param svgPoint
     */
    const handlePlaceClick = (
        element: SVGGElement,
        point: Point|null = null,
        svgPoint: SVGPoint|null = null
    ) => {

        /* No onClickPlace found. */
        if (onClickPlace === null) {
            return;
        }

        /* Prevent click if panning or pinch-to-zoom is active. */
        if (isMouseMoveGlobal || isTouchMovePanningGlobal || isTouchMovePinchToZoomGlobal) {
            return;
        }

        /* No target or id found. */
        if (!element || !element.id) {
            return;
        }

        const placeId = element.id;

        /* No cityMap found. */
        if (!(placeId in cityMap)) {
            onClickPlace({
                id: placeId
            });

            return;
        }

        /* Get city map data. */
        const placeData = cityMap[placeId];

        /* Build click (callback) data. */
        const clickData: PlaceData = {
            id: placeId,
            name: getTranslatedNamePlace(placeData, languageGlobal),
            population: placeData.population,
        };

        /* Add point (screen position). */
        if (point !== null) {
            clickData.screenPosition = {
                x: point.x,
                y: point.y,
            };
        }

        /* Add svg and wgs84 point. */
        if (svgPoint !== null) {

            /* Add data. */
            clickData.svgPosition = {
                x: svgPoint.x,
                y: -svgPoint.y
            };
        }

        /* Add coordinate of the clicked place. */
        clickData.latitude = placeData.coordinate[1];
        clickData.longitude = placeData.coordinate[0];

        /* Return date from clicked map. */
        onClickPlace(clickData);
    };

    /**
     * Handle hover path.country.
     *
     * @param elementPath
     * @param point
     * @param svgPoint
     */
    const handleHoverPathCountry = (
        elementPath: SVGElement,
        point: Point|null = null,
        svgPoint: SVGPoint|null = null
    ) => {

        let countryId = elementPath.id;
        let countryData = null;
        let countryName = null;

        /* No svgPoint is given. */
        if (svgPoint === null) {
            return;
        }

        /* Only handle svg.path[class=country] elements. */
        if (elementPath.tagName !== tagNamePath || !elementPath.classList.contains(classNameSvgPath)) {
            return;
        }

        /* countryMap value found. */
        if (countryId in countryMap) {
            countryData = countryMap[countryId];
            countryName = countryData[getLanguageNameCountry(languageGlobal)];
        }

        /* Remove hover class from all svg.path[class=country] and svg.circle[class=place] elements. */
        removeHoverClassPathCountry();
        removeHoverClassCirclePlace();
        removeHoverClassGPlaceGroup();

        /* Add hover to current element. */
        addHoverClass(elementPath);

        /* Add title. */
        addHoverTitle(countryName ?? textNotAvailable);
        removeSubtitle();

        /* Element already hovered. */
        if (!debug && (countryId in countryMap) && countryId === lastHoverCountryId) {
            return;
        }

        /* Set last hover id. */
        setLastHoverCountryId(countryId);

        /* Execute hover callback. */
        if (onHoverCountry !== null) {
            onHoverCountry({
                id: countryId,
                name: countryName,
                screenPosition: {
                    x: point?.x,
                    y: point?.y,
                },
                svgPosition: {
                    x: svgPoint.x,
                    y: svgPoint.y,
                }
            } as CountryData);
        }

        /* No debut output needed. */
        if (!debug) {
            return;
        }

        /* Log position and element type. */
        setDebugContent({
            "mouse position x": svgPoint.x,
            "mouse position y": -svgPoint.y,
            "type": elementPath.tagName,
            "id": countryId,
            "name": countryName,
        } as DebugContent);
    };

    /**
     * Handle hover circle.place.
     *
     * @param elementCircle
     * @param point
     * @param svgPoint
     */
    const handleHoverCirclePlace = (
        elementCircle: SVGElement,
        point: Point|null = null,
        svgPoint: SVGPoint|null = null
    ) => {

        let name = null;

        /* No svgPoint is given. */
        if (svgPoint === null) {
            return;
        }

        /* Only handle svg.path[class=country] elements. */
        if (elementCircle.tagName !== tagNameCircle || !elementCircle.classList.contains(classNameSvgCircle)) {
            return;
        }

        /* Extract the name (title) of the circle element. */
        const title = elementCircle.querySelector(tagNameTitle);
        if (title) {
            name = title.textContent;
        }

        /* Remove hover class from all svg.circle[class=place] elements. */
        removeHoverClassCirclePlace();

        /* Add hover to current element. */
        addHoverClass(elementCircle);

        /* Add title. */
        addHoverTitle(name ?? textNotAvailable);
        removeSubtitle();

        /* Log position and element type. */
        setDebugContent({
            "mouse position x": svgPoint.x,
            "mouse position y": -svgPoint.y,
            "type": elementCircle.tagName,
            "name": name,
        } as DebugContent);
    }

    /**
     * Handle hover g.place-group.
     *
     * @param elementG
     * @param point
     * @param svgPoint
     */
    const handleHoverGPlaceGroup = (
        elementG: SVGElement,
        point: Point|null = null,
        svgPoint: SVGPoint|null = null
    ) => {

        let placeId = elementG.id;
        let placeData = null;
        let placeName = null;
        let placePopulation: number|null = null;
        let placeCountry = null;
        let countryId = null;
        let countryData = null;
        let countryName = null;

        /* No svgPoint is given. */
        if (svgPoint === null) {
            return;
        }

        /* Only handle svg.g[class=place-group] elements. */
        if (elementG.tagName !== tagNameG || !elementG.classList.contains(classNameSvgG)) {
            return;
        }

        /* cityMap value found. */
        if (placeId in cityMap) {
            placeData = cityMap[placeId] as TypeCity;
            placeName = getTranslatedNamePlace(placeData, languageGlobal);
            placePopulation = placeData.population;
            placeCountry = placeData.country;
        }

        /* countryMap value found. */
        if (placeCountry !== null && placeCountry in countryMap) {
            countryId = placeCountry;
            countryData = countryMap[placeCountry];
            countryName = countryData[getLanguageNameCountry(languageGlobal)];
        }

        /* Remove hover class from all svg.g[class=place-group] elements. */
        removeHoverClassPathCountry();
        removeHoverClassGPlaceGroup();

        /* Add hover to current element. */
        addHoverClass(elementG);
        countryId && addHoverClass(countryId);

        /* Add title and subtitle. */
        addHoverTitle(countryName ?? textNotAvailable);
        addHoverSubtitle(placeName ?? textNotAvailable, placePopulation, t);

        /* Element already hovered. */
        if (!debug && (placeId in cityMap) && placeId === lastHoverPlaceId) {
            return;
        }

        /* Set last hover id. */
        setLastHoverPlaceId(placeId);

        /* Execute hover callback. */
        if (onHoverPlace !== null) {
            onHoverPlace({
                id: placeId,
                name: placeName,
                screenPosition: {
                    x: point?.x,
                    y: point?.y,
                },
                svgPosition: {
                    x: svgPoint.x,
                    y: svgPoint.y,
                }
            } as PlaceData);
        }

        /* No debut output needed. */
        if (!debug) {
            return;
        }

        let debugContent: DebugContent = {
            "mouse position x": svgPoint.x,
            "mouse position y": -svgPoint.y,
            "type": elementG.tagName,
            "id": placeId,
            "name": placeName,
        } as DebugContent;

        if (countryId) {
            debugContent["id (ctry.)"] = countryId;
            debugContent["name (ctry.)"] = countryName ?? textNotAvailable;
        }

        /* Log position and element type. */
        setDebugContent(debugContent);
    }



    /**
     * =======================
     * 2) Use effect functions
     * =======================
     */

    /**
     * Component reloaded or updated
     */
    useEffect(() => {
        rootDebugMapType = null;
        rootDebugMapContent = null;
    }, []);
    useEffect(() => {
        rootDebugMapType = null;
        rootDebugMapContent = null;
    }, [debug]);

    /**
     * Add mousedown event listener.
     */
    useEffect(() => {
        document.addEventListener(eventNameMouseDown, hideScrollHint);

        return () => {
            document.removeEventListener(eventNameMouseDown, hideScrollHint);
        };
    }, []); /* Register mousedown listener to the whole page whenever any value of this component is changed. */

    /**
     * Handle zoom in trigger actions.
     */
    useEffect(() => {
        if (stateZoomIn > 0) {
            handleZoomIn();
        }
    }, [
        stateZoomIn
    ]); /* Run this effect whenever the stateZoomIn value changes. */

    /**
     * Handle zoom out trigger actions.
     */
    useEffect(() => {
        if (stateZoomOut > 0) {
            handleZoomOut();
        }
    }, [
        stateZoomOut
    ]); /* Run this effect whenever the stateZoomOut value changes. */

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
        /* 1) svgElement.addEventListener(eventNameMouseDown) vs. svg.onMouseDown */
        eventMouseDownEnabled && eventMouseDownAsEventListener && svgElement.addEventListener(eventNameMouseDown, handleMouseDown, { passive: false });
        /* 2) svgElement.addEventListener(eventNameMouseMove) vs. svg.onMouseMove */
        eventMouseMoveEnabled && eventMouseMoveAsEventListener && svgElement.addEventListener(eventNameMouseMove, handleMouseMove, { passive: false });
        /* 3) svgElement.addEventListener(eventNameMouseUp) vs. svg.onMouseUp */
        eventMouseUpEnabled && eventMouseUpAsEventListener && svgElement.addEventListener(eventNameMouseUp, handleMouseUp, { passive: false });
        /* 4) svgElement.addEventListener(eventNameMouseLeave) vs. svg.onMouseLeave */
        eventMouseLeaveEnabled && eventMouseLeaveAsEventListener && svgElement.addEventListener(eventNameMouseLeave, handleMouseLeave, { passive: false });
        /* 5) svgElement.addEventListener(eventNameMouseEnter) vs. svg.onMouseEnter */
        eventMouseEnterEnabled && eventMouseEnterAsEventListener && svgElement.addEventListener(eventNameMouseEnter, handleMouseEnter, { passive: false });
        /* 6) svgElement.addEventListener(eventNameMouseOver) vs. svg.onMouseOver */
        eventMouseOverEnabled && eventMouseOverAsEventListener && svgElement.addEventListener(eventNameMouseOver, handleMouseOver, { passive: false });

        /**
         * ================
         * B) Touch Events.
         * ================
         */
        /* 1) svgElement.addEventListener(eventNameTouchStart) vs. svg.onTouchStart */
        eventTouchStartEnabled && eventTouchStartAsEventListener && svgElement.addEventListener(eventNameTouchStart, handleTouchStart, { passive: false });
        /* 2) svgElement.addEventListener(eventNameTouchMove) vs. svg.onTouchMove */
        eventTouchMoveEnabled && eventTouchMoveAsEventListener && svgElement.addEventListener(eventNameTouchMove, handleTouchMove, { passive: false });
        /* 3) svgElement.addEventListener(eventNameTouchEnd) vs. svg.onTouchEnd */
        eventTouchEndEnabled && eventTouchEndAsEventListener && svgElement.addEventListener(eventNameTouchEnd, handleTouchEnd, { passive: false });

        /**
         * =========================
         * C) Wheel and Zoom Events.
         * =========================
         */
        /* 1) svgElement.addEventListener(eventNameWheel) vs. svg.onWheel */
        eventWheelEnabled && eventWheelAsEventListener && svgElement.addEventListener(eventNameWheel, handleWheel, { passive: false });

        /**
         * Unregister part.
         */
        return () => {

            /**
             * ================
             * A) Mouse Events.
             * ================
             */
            /* 1) svgElement.addEventListener(eventNameMouseDown) vs. svg.onMouseDown */
            eventMouseDownEnabled && eventMouseDownAsEventListener && svgElement.removeEventListener(eventNameMouseDown, handleMouseDown);
            /* 2) svgElement.addEventListener(eventNameMouseMove) vs. svg.onMouseMove */
            eventMouseMoveEnabled && eventMouseMoveAsEventListener && svgElement.removeEventListener(eventNameMouseMove, handleMouseMove);
            /* 3) svgElement.addEventListener(eventNameMouseUp) vs. svg.onMouseUp */
            eventMouseUpEnabled && eventMouseUpAsEventListener && svgElement.removeEventListener(eventNameMouseUp, handleMouseUp);
            /* 4) svgElement.addEventListener(eventNameMouseLeave) vs. svg.onMouseLeave */
            eventMouseLeaveEnabled && eventMouseLeaveAsEventListener && svgElement.removeEventListener(eventNameMouseLeave, handleMouseLeave);
            /* 5) svgElement.addEventListener(eventNameMouseEnter) vs. svg.onMouseEnter */
            eventMouseEnterEnabled && eventMouseEnterAsEventListener && svgElement.removeEventListener(eventNameMouseEnter, handleMouseEnter);
            /* 6) svgElement.addEventListener(eventNameMouseOver) vs. svg.onMouseOver */
            eventMouseOverEnabled && eventMouseOverAsEventListener && svgElement.removeEventListener(eventNameMouseOver, handleMouseOver);

            /**
             * ================
             * B) Touch Events.
             * ================
             */
            /* 1) svgElement.addEventListener(eventNameTouchStart) vs. svg.onTouchStart */
            eventTouchStartEnabled && eventTouchStartAsEventListener && svgElement.removeEventListener(eventNameTouchStart, handleTouchStart);
            /* 2) svgElement.addEventListener(eventNameTouchMove) vs. svg.onTouchMove */
            eventTouchMoveEnabled && eventTouchMoveAsEventListener && svgElement.removeEventListener(eventNameTouchMove, handleTouchMove);
            /* 3) svgElement.addEventListener(eventNameTouchEnd) vs. svg.onTouchEnd */
            eventTouchEndEnabled && eventTouchEndAsEventListener && svgElement.removeEventListener(eventNameTouchEnd, handleTouchEnd);

            /**
             * =========================
             * C) Wheel and Zoom Events.
             * =========================
             */
            /* 1) svgElement.addEventListener(eventNameWheel) vs. svg.onWheel */
            eventWheelEnabled && eventWheelAsEventListener && svgElement.removeEventListener(eventNameWheel, handleWheel);
        };
    }, [
        viewBox,
        startPoint
    ]); /* Run this effect whenever the viewBox or startPoint value changes. */

    /**
     * Initializes the rendering process.
     */
    useEffect(() => {

        /* Print debug information. */
        setDebugType('Initial render');

        if (svgRef.current) {
            const svgRect = svgRef.current.getBoundingClientRect();

            /* Save new viewBox. */
            setViewBoxAndShowDebug({
                x: svgContent.viewBoxLeft,
                y: svgContent.viewBoxTop,
                width: svgContent.viewBoxWidth,
                height: svgContent.viewBoxHeight,
                viewWidth: svgRect.width,
                viewHeight: svgRect.height,
            });
        }

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
    ]); /* Run this effect whenever the svgContent or country value changes. */



    /**
     * ==============
     * 3) SVG Builder
     * ==============
     */
    return (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            ref={svgRef}
            id={idSvgMap}
            className={[
                /* Mouse classes. */
                // (isMouseDown || isMouseMove) && "mouse-event",
                // isMouseDown && "mouse-down",
                // isMouseMove && "mouse-move",

                /* Touch classes. */
                // (isTouchStart || isTouchMove) && "touch-event",
                // isTouchStart && "touch-start",
                // isTouchMove && "touch-move",
            ].filter(Boolean).join(' ')}
            viewBox={`${viewBox.x} ${viewBox.y} ${viewBox.width} ${viewBox.height}`}
            dangerouslySetInnerHTML={{ __html: svgContent.svgPaths + svgContent.svgCircles }}

            /**
             * ================
             * A) Mouse Events.
             * ================
             */
            onMouseDown={(eventMouseDownEnabled && !eventMouseDownAsEventListener) ? handleMouseDown : undefined}
            onMouseMove={(eventMouseMoveEnabled && !eventMouseMoveAsEventListener) ? handleMouseMove : undefined}
            onMouseUp={(eventMouseUpEnabled && !eventMouseUpAsEventListener) ? handleMouseUp : undefined}
            onMouseLeave={(eventMouseLeaveEnabled && !eventMouseLeaveAsEventListener) ? handleMouseLeave : undefined}
            onMouseEnter={(eventMouseEnterEnabled && !eventMouseEnterAsEventListener) ? handleMouseEnter : undefined}
            onMouseOver={(eventMouseOverEnabled && !eventMouseOverAsEventListener) ? handleMouseOver : undefined}


            /**
             * ================
             * B) Touch Events.
             * ================
             */
            onTouchStart={(eventTouchStartEnabled && !eventTouchStartAsEventListener) ? handleTouchStart : undefined}
            onTouchMove={(eventTouchMoveEnabled && !eventTouchMoveAsEventListener) ? handleTouchMove : undefined}
            onTouchEnd={(eventTouchEndEnabled && !eventTouchEndAsEventListener) ? handleTouchEnd : undefined}

            /**
             * =========================
             * C) Wheel and Zoom Events.
             * =========================
             */
            onWheel={(eventWheelEnabled && !eventWheelAsEventListener) ? handleWheel : undefined}
        />
    );
};

export default SVGRenderer;
