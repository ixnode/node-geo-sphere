/**
 * UC first function
 *
 * @param text
 */
export const ucFirst = (text: string): string => {
    if (text.length <= 0) {
        return text;
    }

    return text.charAt(0).toUpperCase() + text.slice(1);
}
