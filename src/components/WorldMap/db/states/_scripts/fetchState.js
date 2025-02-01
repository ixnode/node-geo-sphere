/**
 * Open single state: https://de.wikipedia.org/wiki/St%C5%99edo%C4%8Desk%C3%BD_kraj
 *
 * Or search for a single state:
 * - cz: https://de.wikipedia.org/wiki/Verwaltungsgliederung_Tschechiens#Auflistung_der_Regionen
 * - es: https://de.wikipedia.org/wiki/Autonome_Gemeinschaften_Spaniens
 * - pl: https://de.wikipedia.org/wiki/Woiwodschaft#Liste_der_Woiwodschaften
 * - us: https://de.wikipedia.org/wiki/Liste_der_Bundesstaaten_der_Vereinigten_Staaten#Bundesstaaten
 *
 * Open browser without web security (cmd):
 *
 * "C:\Program Files\Google\Chrome\Application\chrome.exe" --disable-web-security --user-data-dir="C:\chrome_dev"
 *
 * Returns:
 *
 * {
 *   "name": "Seville",
 *   "state": null,
 *   "priority": 2,
 *   "size": "standard",
 *   "coordinate": {
 *     "longitude": -6,
 *     "latitude": 37.4
 *   },
 *   "country": "es",
 *   "type": "state-capital",
 *   "population": 681998,
 *   "area": 141.31,
 *   "translation": {
 *     "cs": "Sevilla",
 *     "de": "Sevilla",
 *     "en": "Seville",
 *     "es": "Sevilla",
 *     "fr": "Séville",
 *     "hr": "Sevilla",
 *     "it": "Siviglia",
 *     "pl": "Sewilla",
 *     "sv": "Sevilla"
 *   }
 * }
 */

/**
 * Some configurations.
 */
const queryTitle = '//*[@id="firstHeading"]/span';
const priority = 2;
const size = "standard";
const type = "state-capital";

/**
 * Fetch document function
 *
 * @param url
 * @param query
 */
async function fetchPageAndExtractText(url, query) {

    if (!url) {
        return null;
    }

    try {
        // Fetch the page as plain text
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }

        const htmlText = await response.text();

        // Create a DOMParser to parse the HTML string
        const parser = new DOMParser();
        const doc = parser.parseFromString(htmlText, 'text/html');

        // Extract the text from the element
        const headingElement = doc.evaluate(
            query,
            doc,
            null,
            XPathResult.FIRST_ORDERED_NODE_TYPE,
            null
        ).singleNodeValue;

        return headingElement ? headingElement.textContent.trim() : null;
    } catch (error) {
        console.error('Error fetching or parsing the page:', error);
    }
}

/**
 * Fetch text function
 *
 * @param language
 * @param selector
 */
async function fetchText(language, selector) {

    /* Locate the link with lang="cs|de|en|..." within div.vector-menu-content */
    const linkElement = document.evaluate(
        `//div[contains(@class, "vector-menu-content")]//a[@lang="${language}"]`,
        document,
        null,
        XPathResult.FIRST_ORDERED_NODE_TYPE,
        null
    ).singleNodeValue;
    const link = linkElement ? linkElement.getAttribute('href') : null;

    if (!link) {
        return null;
    }

    return fetchPageAndExtractText(link, selector);
}

/**
 * Gets text within page.
 *
 * @param selector
 * @returns {string|null}
 */
function getText(selector) {
    const element = document.evaluate(
        selector,
        document,
        null,
        XPathResult.FIRST_ORDERED_NODE_TYPE,
        null
    ).singleNodeValue;
    return element ? element.textContent.trim() : null;
}

/**
 * Gets population.
 *
 * @returns {number|null}
 */
function getPopulation() {
    const element = document.evaluate(
        '//table//tr[td[1][contains(text(), "Einwohner")] or td[1]/b[contains(text(), "Einwohner")] or td[1]/a[contains(text(), "Einwohner")]]',
        document,
        null,
        XPathResult.FIRST_ORDERED_NODE_TYPE,
        null
    ).singleNodeValue;
    const cell = element ? element.querySelector('td:nth-of-type(2)') : null;
    const text = cell ? cell.textContent.trim().replaceAll('.', '').replaceAll(',', '.') : null;

    if (!text) {
        return null;
    }

    return text ? parseInt(text) : null;
}

/**
 * Gets area.
 *
 * @returns {number|null}
 */
function getArea() {

    const elementArea = document.evaluate(
        '//table//tr[td[1][contains(text(), "Fläche")] or td[1]/b[contains(text(), "Fläche")] or td[1]/a[contains(text(), "Fläche")]]',
        document,
        null,
        XPathResult.FIRST_ORDERED_NODE_TYPE,
        null
    ).singleNodeValue;

    const cellArea = elementArea ? elementArea.querySelector('td:nth-of-type(2)') : null;

    /* No area information found. */
    if (!cellArea) {
        return null;
    }

    /* Convert german number into english one. */
    const textArea = cellArea.textContent.trim().replaceAll('.', '').replaceAll(',', '.');

    /* Convert value if needed. */
    let area = null;
    switch (true) {
        /* Parses ha value. */
        case textArea.includes('ha'):
            const hectares = parseFloat(textArea.replace('ha', '').trim());
            area = hectares * 0.01;
            break;

        /* Parses km² value. */
        default:
            area = parseFloat(textArea);
            break;
    }

    return Math.round(area * 100) / 100;
}

/**
 * Gets country.
 *
 * @returns {string|null}
 */
function getCountry() {
    const isoCode = getIsoCode();

    if (isoCode === null) {
        return null;
    }

    const match = isoCode.match(/^([a-zA-Z]+)-/);
    return match ? match[1].toLowerCase() : null;
}

/**
 * Gets the ISO code.
 *
 * @returns {string|null}
 */
function getIsoCode() {

    const element = document.evaluate(
        '//table//tr[td[b[a[contains(text(), "ISO")]]] or td[a[contains(text(), "ISO")]] or td[contains(text(), "ISO")]]',
        document,
        null,
        XPathResult.FIRST_ORDERED_NODE_TYPE,
        null
    ).singleNodeValue;

    /* Get the second cell containing the ISO code. */
    const cell = element ? element.querySelector('td:nth-of-type(2)') : null;

    /* No ISO code information found. */
    if (!cell) {
        return null;
    }

    /* Extract and clean the ISO code. */
    const isoCode = cell ? cell.textContent.trim() : null;

    if (isoCode === null) {
        return null;
    }

    const isoCodeExtracted = isoCode.toLowerCase().match(/\b([a-z]{2}-[a-z0-9]{2,3})\b/);
    return isoCodeExtracted ? isoCodeExtracted[1] : null;
}

/* Gets titles. */
const nameDe = getText(queryTitle);
const nameCs = await fetchText('cs', queryTitle);
const nameEn = await fetchText('en', queryTitle);
const nameEs = await fetchText('es', queryTitle);
const nameFr = await fetchText('fr', queryTitle);
const nameHr = await fetchText('hr', queryTitle);
const nameIt = await fetchText('it', queryTitle);
const namePl = await fetchText('pl', queryTitle);
const nameSv = await fetchText('sv', queryTitle);

/* Gets properties. */
const population = getPopulation();
const area = getArea();
const country = getCountry();
const isoCode = getIsoCode();

/* Build the result. */
const jsonResult = JSON.stringify({
    "name": nameEn,
    "code": isoCode,
    "country": country,
    "population": population,
    "area": area,
    "translation": {
        "cs": nameCs,
        "de": nameDe,
        "en": nameEn,
        "es": nameEs,
        "fr": nameFr,
        "hr": nameHr,
        "it": nameIt,
        "pl": namePl,
        "sv": nameSv
    }
}, null, 4);

/* Print the result. */
console.log(jsonResult);
