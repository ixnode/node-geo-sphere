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

/**
 * Formats the given number.
 *
 * @param value
 * @param locale
 * @param currency
 */
export const formatNumber = (value: number, locale: string, currency?: string): string => {

    if (locale === 'cs') {
        locale = 'cs-CZ';
    }
    if (locale === 'de') {
        locale = 'de-DE';
    }
    if (locale === 'en') {
        locale = 'en-US';
    }
    if (locale === 'es') {
        locale = 'es-ES';
    }
    if (locale === 'fr') {
        locale = 'fr-FR';
    }
    if (locale === 'hr') {
        locale = 'hr-HR';
    }
    if (locale === 'it') {
        locale = 'it-IT';
    }
    if (locale === 'pl') {
        locale = 'pl-PL';
    }
    if (locale === 'sv') {
        locale = 'sv-SE';
    }

    return new Intl.NumberFormat(locale, {
        style: currency ? "currency" : "decimal",
        currency: currency,
        minimumFractionDigits: 0,
        maximumFractionDigits: 2
    }).format(value);
};
