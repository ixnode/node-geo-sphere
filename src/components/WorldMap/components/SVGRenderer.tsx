import React, {useEffect, useState, useRef} from 'react';
import {createRoot, Root} from "react-dom/client";

/* Import configuration (WorldMap). */
import {
    eventMouseDownAsEventListener,
    eventMouseMoveAsEventListener,
    eventMouseUpAsEventListener,
    eventTouchEndAsEventListener,
    eventTouchMoveAsEventListener,
    eventTouchStartAsEventListener,
    eventWheelAsEventListener
} from "../config/events";
import {countryMap} from "../config/countries";
import {defaultDebug, defaultMapHeight, defaultMapWidth} from "../config/config";
import {ClickCountryData, DebugContent, Point, SVGViewBox} from "../config/interfaces";

/* Import configuration (global). */
import {defaultLanguage} from "../../../config/config";

/* Import types. */
import {TypeClickCountry} from "../types/types";

/* Import classes. */
import {TypeSvgContent} from "../classes/GeoJson2Path";

/* Import tools. */
import {getLanguageName} from "../tools/language";
import {calculateZoomViewBox} from "../tools/zoom";
import {hideScrollHint, showScrollHint} from "../tools/layer";
import {getPointFromEvent, getSvgElementFromSvg, getSvgPointFromSvg} from "../tools/interaction";
import {CoordinateConverter} from "../classes/CoordinateConverter";

/* SVGRendererProps interface. */
interface SVGRendererProps {
    svgContent: TypeSvgContent,
    country: string | null,
    onClickCountry: TypeClickCountry,
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
const delayShowWorldMapScrollHint = 3000; /* unit in ms */
const delayMousePanning = null;

/* Timeout variables. */
let worldMapScrollHintTimeoutId: ReturnType<typeof setTimeout> | null = null;



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
    const handleMouseMove = (
        event:
            React.MouseEvent<SVGSVGElement, MouseEvent> | SVGSVGElementEventMap["mousemove"]
    ) => {

        /* "handleMouseDown" is not triggered yet or svg is not available -> stop handle. */
        if (!isMouseDownGlobal || !svgRef.current) {
            return;
        }

        /* Print debug information. */
        setDebugType(handleMouseMove.name);

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
    };

    /**
     * "mouseup" and "mouseleave" event.
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

        const target = event.target as SVGElement;

        /* Allow "svg path" to bubble touch events. */
        if (target.tagName === 'path') {

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
    const handleTouchStartPanning = (
        event:
            React.TouchEvent<SVGSVGElement> | SVGSVGElementEventMap["touchstart"]
    ) => {

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
    const handleTouchStartPinchToZoom = (
        event:
            React.TouchEvent<SVGSVGElement> | SVGSVGElementEventMap["touchstart"]
    ) => {

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
        if (distance > 10000) {
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
        if (distance > 2) {
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

        if (!event.ctrlKey) {
            /* Show scroll hint. */
            showScrollHint();

            /* Set timer to hide the hint. */
            worldMapScrollHintTimeoutId = setTimeout(() => {
                hideScrollHint();
            }, delayShowWorldMapScrollHint);

            return;
        }

        /* Print debug information. */
        setDebugType(handleWheel.name);

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
            debugContent["view dimensions"] = 'n/a';
        }

        if (width && height) {
            const ratio = width / height;
            debugContent["given dimensions"] = width.toFixed(2) + ' x ' + height.toFixed(2) + ' (' + ratio.toFixed(2) + ')';
        } else {
            debugContent["given dimensions"] = 'n/a';
        }

        if (lastEvent.current !== null) {
            const target = lastEvent.current.target as SVGPathElement;
            debugContent['last element'] = target.tagName;
        } else {
            debugContent['last element'] = 'n/a';
        }

        if (scale !== null) {
            debugContent["scale"] = scale;
        } else {
            debugContent["scale"] = 'n/a';
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
        const element = document.getElementById('debug-map-content');

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
        const element = getSvgElementFromSvg(svgRef.current, svgPoint);

        /* No element found. */
        if (element === null) {
            return;
        }

        /* Only handle path.country. */
        if (element.tagName !== 'path' || !element.classList.contains('country')) {
            return;
        }

        /* Handle country clicked. */
        handleCountryClick(element, point, svgPoint);
    };

    /**
     * Handle country click.
     *
     * @param element
     * @param point
     * @param svgPoint
     */
    const handleCountryClick = (
        element: SVGElement,
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

        const id = element.id;

        /* No countryMap found. */
        if (!(id in countryMap)) {
            onClickCountry({
                id: id
            });

            return;
        }

        const countryData = countryMap[id];

        const data = {
            id: id,
            name: countryData[getLanguageName(languageGlobal)]
        } as ClickCountryData;

        /* Add point (screen position). */
        if (point !== null) {
            data.screenPosition = {
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
            data.svgPosition = {
                x: svgPoint.x,
                y: -svgPoint.y
            };
            data.latitude = pointWgs84[1];
            data.longitude = pointWgs84[0];
        }

        /* Return date from clicked map. */
        onClickCountry(data);
    };



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
        document.addEventListener('mousedown', hideScrollHint);

        return () => {
            document.removeEventListener('mousedown', hideScrollHint);
        };
    }, []);

    /**
     * Handle zoom in trigger actions.
     */
    useEffect(() => {
        if (stateZoomIn > 0) {
            handleZoomIn();
        }
    }, [stateZoomIn]);

    /**
     * Handle zoom out trigger actions.
     */
    useEffect(() => {
        if (stateZoomOut > 0) {
            handleZoomOut();
        }
    }, [stateZoomOut]);

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
        eventTouchStartAsEventListener && svgElement.addEventListener('touchstart', handleTouchStart, { passive: false });
        /* svgElement.addEventListener('touchmove') vs. svg.onTouchMove */
        eventTouchMoveAsEventListener && svgElement.addEventListener('touchmove', handleTouchMove, { passive: false });
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
            /* svgElement.addEventListener('mousedown') vs. svg.onMouseDown */
            eventMouseDownAsEventListener && svgElement.removeEventListener('mousedown', handleMouseDown);
            /* svgElement.addEventListener('mousemove') vs. svg.onMouseMove */
            eventMouseMoveAsEventListener && svgElement.removeEventListener('mousemove', handleMouseMove);
            /* svgElement.addEventListener('mouseup') vs. svg.onMouseUp */
            eventMouseUpAsEventListener && svgElement.removeEventListener('mouseup', handleMouseUp);
            /* svgElement.addEventListener('mouseleave') vs. svg.onMouseLeave */
            //eventMouseLeaveAsEventListener && svgElement.removeEventListener('mouseleave', handleMouseUp);

            /**
             * ================
             * B) Touch Events.
             * ================
             */
            /* svgElement.addEventListener('touchstart') vs. svg.onTouchStart */
            eventTouchStartAsEventListener && svgElement.removeEventListener('touchstart', handleTouchStart);
            /* svgElement.addEventListener('touchmove') vs. svg.onTouchMove */
            eventTouchMoveAsEventListener && svgElement.removeEventListener('touchmove', handleTouchMove);
            /* svgElement.addEventListener('touchend') vs. svg.onTouchEnd */
            eventTouchEndAsEventListener && svgElement.removeEventListener('touchend', handleTouchEnd);

            /**
             * =========================
             * C) Wheel and Zoom Events.
             * =========================
             */
            /* svgElement.addEventListener('wheel') vs. svg.onWheel */
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
    ]); /* Run this effect whenever the svgContent or country changes. */



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
            onMouseDown={!eventMouseDownAsEventListener ? handleMouseDown : undefined}
            onMouseMove={!eventMouseMoveAsEventListener ? handleMouseMove : undefined}
            onMouseUp={!eventMouseUpAsEventListener ? handleMouseUp : undefined}
            //onMouseLeave={!eventMouseLeaveAsEventListener ? handleMouseUp : undefined}

            /**
             * ================
             * B) Touch Events.
             * ================
             */
            onTouchStart={!eventTouchStartAsEventListener ? handleTouchStart : undefined}
            onTouchMove={!eventTouchMoveAsEventListener ? handleTouchMove : undefined}
            onTouchEnd={!eventTouchEndAsEventListener ? handleTouchEnd : undefined}

            /**
             * =========================
             * C) Wheel and Zoom Events.
             * =========================
             */
            onWheel={!eventWheelAsEventListener ? handleWheel : undefined}
        />
    );
};

export default SVGRenderer;
