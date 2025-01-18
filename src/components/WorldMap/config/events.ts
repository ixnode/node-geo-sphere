/**
 * =================================
 * A) Mouse Events (enabled status).
 * =================================
 */
export const eventMouseDownEnabled: boolean = true;
export const eventMouseMoveEnabled: boolean = true;
export const eventMouseUpEnabled: boolean = true;
export const eventMouseLeaveEnabled: boolean = true;
export const eventMouseEnterEnabled: boolean = false;
export const eventMouseOverEnabled: boolean = false;

/**
 * =================================
 * B) Touch Events (enabled status).
 * =================================
 */
export const eventTouchStartEnabled: boolean = true;
export const eventTouchMoveEnabled: boolean = true;
export const eventTouchEndEnabled: boolean = true;

/**
 * ==========================================
 * C) Wheel and Zoom Events (enabled status).
 * ==========================================
 */
export const eventWheelEnabled: boolean = true;


/**
 * =============================
 * A) Mouse Events (event type).
 * =============================
 */
export const eventMouseDownAsEventListener: boolean = false;
export const eventMouseMoveAsEventListener: boolean = false;
export const eventMouseUpAsEventListener: boolean = false;
export const eventMouseLeaveAsEventListener: boolean = false;
export const eventMouseEnterAsEventListener: boolean = false;
export const eventMouseOverAsEventListener: boolean = false;

/**
 * =============================
 * B) Touch Events (event type).
 * =============================
 */
export const eventTouchStartAsEventListener: boolean = true; /* To allow passive event listener invocation: Stop scrolling. */
export const eventTouchMoveAsEventListener: boolean = true; /* To allow passive event listener invocation: Stop scrolling. */
export const eventTouchEndAsEventListener: boolean = true; /* To allow passive event listener invocation: Stop scrolling. */

/**
 * ======================================
 * C) Wheel and Zoom Events (event type).
 * ======================================
 */
export const eventWheelAsEventListener: boolean = true;
