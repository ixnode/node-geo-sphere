/* Class names. */
export const classWorldMapScrollHint = 'world-map__hints';
export const classWorldMapScrollHintVisible = 'world-map__hints--visible';

/* Timeout variables. */
export let worldMapScrollHintTimeoutId: number|ReturnType<typeof setTimeout>|null = null;
export const delayShowWorldMapScrollHint = 3000; /* unit in ms */



/**
 * Show scroll hint (WorldMap).
 */
export const showScrollHint = () => {

    /* Clear timer if this is still in use. */
    if (worldMapScrollHintTimeoutId !== null) {
        return;
    }

    const hintsElement = document.querySelector('.' + classWorldMapScrollHint) as HTMLElement;

    /* Hint element not found. */
    if (!hintsElement) {
        return;
    }

    /* Class already set. */
    if (hintsElement.classList.contains(classWorldMapScrollHintVisible)) {
        return;
    }

    /* Show scroll hint. */
    hintsElement.classList.add(classWorldMapScrollHintVisible);
}

/**
 * Hide scroll hint (WorldMap).
 */
export const hideScrollHint = () => {

    /* Clear timer if this is still in use. */
    if (worldMapScrollHintTimeoutId !== null) {
        clearTimeout(worldMapScrollHintTimeoutId as number);
        worldMapScrollHintTimeoutId = null;
    }

    const hintsElement = document.querySelector('.' + classWorldMapScrollHint) as HTMLElement;

    /* Hint element not found. */
    if (!hintsElement) {
        return;
    }

    /* Visible class not set. */
    if (!hintsElement.classList.contains(classWorldMapScrollHintVisible)) {
        return;
    }

    /* Hide scroll hint. */
    hintsElement.classList.remove(classWorldMapScrollHintVisible);
}

/**
 * Hide scroll hint (WorldMap).
 */
export const hideScrollHintDelayed = (delay: number|null = null) => {
    worldMapScrollHintTimeoutId = setTimeout(() => {
        hideScrollHint();
    }, delay ?? delayShowWorldMapScrollHint);
}
