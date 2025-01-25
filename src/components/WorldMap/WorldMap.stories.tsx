import type { Meta, StoryObj } from '@storybook/react';

/* Import configurations. */
import {CountryData, PlaceData} from "./config/interfaces";
import {
    defaultDataSource,
    defaultDebug,
    defaultLogo,
    defaultMapHeight,
    defaultMapWidth
} from "./config/config";

/* Import configurations (global). */
import {
    defaultCountry,
    defaultLanguage
} from "../../config/config";

/* Import classes. */
import {WorldMap} from './WorldMap';

/* Import tools. */
import {getTranslatedName} from "./tools/language";

/* Import db data. */
import {getCountryMap} from "./db/countries";

/* Priority keys and language. */
const priorityKeys = [null, 'all', 'eu', 'de', 'at', 'ch'];
const language = 'en'; /* Supported languages: cz, de, en, es, fr, hr, it, pl, sv */

/* Build options for countries. */
const countryOptions: Record<string, string|null> = Object.fromEntries(
    Object.entries({
        ...Object.fromEntries(Object.values(getCountryMap()).map((country) => [
            getTranslatedName(country, language),
            country.code
        ]))
    } as Record<string, string | null>)
    .sort(([codeA, nameA], [codeB, nameB]) => {
        const indexA = priorityKeys.indexOf(nameA);
        const indexB = priorityKeys.indexOf(nameB);

        /* Sort by priority order. */
        if (indexA !== -1 && indexB !== -1) {
            return indexA - indexB;
        }

        /* A has priority, B does not. */
        if (indexA !== -1) {
            return -1;
        }

        /* B has priority, A does not. */
        if (indexB !== -1) {
            return 1;
        }

        /* Order alphabetically by key (nameEn). */
        return codeA.localeCompare(codeB);
    })
);

/* Build options for languages. */
const languageOptions: Record<string, string> = {
    'Croatian': 'hr',
    'Czech': 'cs',
    'English': 'en',
    'French': 'fr',
    'German': 'de',
    'Italian': 'it',
    'Polish': 'pl',
    'Spanish': 'es',
    'Swedish': 'sv',
};

// @ts-ignore
const meta: Meta<typeof WorldMap> = {
    title: 'Components/WorldMap',
    component: WorldMap,
    parameters: {
        layout: 'padded',
    },
    tags: ['autodocs'],
    argTypes: {
        country: {
            control: {type: 'select'},
            options: Object.keys(countryOptions), /* Labels to show. */
            mapping: countryOptions /* Translate labels into internal keys. */
        },
        language: {
            control: {type: 'select'},
            options: Object.keys(languageOptions), /* Labels to show. */
            mapping: languageOptions /* Translate labels into internal keys. */
        }
    },
};

export default meta;
type Story = StoryObj<typeof WorldMap>;

export const Default: Story = {
    args: {
        dataSource: defaultDataSource,
        country: defaultCountry,
        width: defaultMapWidth,
        height: defaultMapHeight,
        onClickCountry: (data: CountryData) => {
            console.log('onClickCountry', data);
        },
        onClickPlace: (data: PlaceData) => {
            console.log('onClickPlace', data);
        },
        onHoverCountry: (data: CountryData) => {
            console.log('onHoverCountry', data);
        },
        onHoverPlace: (data: PlaceData) => {
            console.log('onHoverPlace', data);
        },
        language: defaultLanguage,
        debug: defaultDebug,
        logo: defaultLogo,
    },
};