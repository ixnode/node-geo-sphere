/**
 * Open single place: https://de.wikipedia.org/wiki/Sevilla
 *
 * Or search for a single city:
 * - cz: https://de.wikipedia.org/wiki/Verwaltungsgliederung_Tschechiens#Auflistung_der_Regionen
 * - pl: https://de.wikipedia.org/wiki/Woiwodschaft#Liste_der_Woiwodschaften
 * - us: https://de.wikipedia.org/wiki/Liste_der_Bundesstaaten_der_Vereinigten_Staaten#Bundesstaaten
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
const state = null;

/**
 * Function to convert DMS coordinate to decimal coordinate
 *
 * @param coordinate
 */
function convertCoordinateDmsToCoordinateDecimal(coordinate) {

    const regex = /(\d+)°\s*(\d+)?′?\s*(\d+)?″?\s*([NSEWO])?/;
    const match = regex.exec(coordinate);

    if (!match) return null;

    let [ , degrees, minutes = 0, seconds = 0, direction ] = match;

    degrees = parseFloat(degrees);
    minutes = parseFloat(minutes.toString());
    seconds = parseFloat(seconds.toString());

    let decimal = degrees + minutes / 60 + seconds / 3600;

    /* Consider direction. */
    if (direction === 'S' || direction === 'W') {
        decimal = -decimal;
    }

    return Math.round(decimal * 10000) / 10000;
}

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
    const englishLinkElement = document.evaluate(
        `//div[contains(@class, "vector-menu-content")]//a[@lang="${language}"]`,
        document,
        null,
        XPathResult.FIRST_ORDERED_NODE_TYPE,
        null
    ).singleNodeValue;
    const englishLink = englishLinkElement ? englishLinkElement.getAttribute('href') : null;
    return fetchPageAndExtractText(englishLink, selector);
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
 * Gets coordinate.
 *
 * @param type
 * @returns {number|null}
 */
function getCoordinate(type) {
    const element = document.evaluate(
        `//*[@id="text_coordinates"]/span/a/span[@title="${type}"]`,
        document,
        null,
        XPathResult.FIRST_ORDERED_NODE_TYPE,
        null
    ).singleNodeValue;
    const text = element ? element.textContent.trim() : null;
    return text ? convertCoordinateDmsToCoordinateDecimal(text) : null;
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
 * Gets the sea level.
 *
 * @returns {number|null}
 */
function getSeaLevel() {

    const elementSeaLevel = document.evaluate(
        '//table//tr[td[1][contains(text(), "Höhe")] or td[1]/b[contains(text(), "Höhe")] or td[1]/a[contains(text(), "Höhe")]]',
        document,
        null,
        XPathResult.FIRST_ORDERED_NODE_TYPE,
        null
    ).singleNodeValue;

    const cellSeaLevel = elementSeaLevel ? elementSeaLevel.querySelector('td:nth-of-type(2)') : null;

    /* No sea level information found. */
    if (!cellSeaLevel) {
        return null;
    }

    /* Convert german number into english one. */
    const textSeaLevel = cellSeaLevel.textContent.trim().replace('.', '').replace(',', '.');

    return parseInt(textSeaLevel.replace(/\D/g, ''), 10);
}

/**
 * Gets country.
 *
 * @returns {string|null}
 */
function getCountry() {
    const element = document.evaluate(
        '//table//tr[td/a[@title="Staat"]]',
        document,
        null,
        XPathResult.FIRST_ORDERED_NODE_TYPE,
        null
    ).singleNodeValue;
    const cell = element ? element.querySelector('td:nth-of-type(2)') : null;

    if (!cell) {
        return null;
    }

    const hiddenSpan = cell.querySelector('span[style="display:none"]');
    const visibleLink = cell.querySelector('a[title]');

    const country = hiddenSpan ? hiddenSpan.textContent.trim() :
        visibleLink ? visibleLink.textContent.trim() :
            null;

    switch (country) {
        /* America. */
        case 'Vereinigte Staaten':
            return 'us';

        /* Europe. */
        case 'Polen':
            return 'pl';
        case 'Spanien':
            return 'es';
        case 'Tschechien':
            return 'cz';

        default:
            return null;
    }
}

/* Gets titles. */
const nameDeText = getText(queryTitle);
const nameCsText = await fetchText('cs', queryTitle);
const nameEnText = await fetchText('en', queryTitle);
const nameEsText = await fetchText('es', queryTitle);
const nameFrText = await fetchText('fr', queryTitle);
const nameHrText = await fetchText('hr', queryTitle);
const nameItText = await fetchText('it', queryTitle);
const namePlText = await fetchText('pl', queryTitle);
const nameSvText = await fetchText('sv', queryTitle);

/* Gets coordinates. */
const latitudeDecimal = getCoordinate('Breitengrad');
const longitudeDecimal = getCoordinate('Längengrad');

/* Gets properties. */
const populationNumber = getPopulation();
const areaNumber = getArea();
const seaLevelNumber = getSeaLevel();
const country = getCountry();

/* Build the result. */
const jsonResult = JSON.stringify({
    "name": nameEnText,
    "state": state,
    "priority": priority,
    "size": size,
    "coordinate": {
        "longitude": longitudeDecimal,
        "latitude": latitudeDecimal
    },
    "country": country,
    "type": type,
    "population": populationNumber,
    "area": areaNumber,
    "altitude": seaLevelNumber,
    "translation": {
        "cs": nameCsText,
        "de": nameDeText,
        "en": nameEnText,
        "es": nameEsText,
        "fr": nameFrText,
        "hr": nameHrText,
        "it": nameItText,
        "pl": namePlText,
        "sv": nameSvText
    }
}, null, 2);

/* Print the result. */
console.log(jsonResult);
