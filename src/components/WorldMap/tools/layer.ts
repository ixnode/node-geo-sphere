/* Class names. */
export const classWorldMapScrollHint = 'world-map__hints';
export const classWorldMapScrollHintVisible = 'world-map__hints--visible';

/* Timeout variables. */
export let worldMapScrollHintTimeoutId: number | null = null;



/**
 * Show scroll hint (WorldMap).
 */
export const showScrollHint = () => {
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
        clearTimeout(worldMapScrollHintTimeoutId);
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
