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
    defaultCountryStorybook,
    defaultLanguageStorybook
} from "../../config/config";

/* Import classes. */
import {WorldMap, WorldMapStorybook} from './WorldMap';

/* Import tools. */
import {getTranslatedName} from "./tools/language";

/* Import db data. */
import {getCountryMap} from "./db/countries";

/* Import db data. */
import {defaultLanguageOptions} from "../../config/i18n";

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
            options: Object.keys(defaultLanguageOptions), /* Labels to show. */
            mapping: defaultLanguageOptions /* Translate labels into internal keys. */
        }
    },
};

export default meta;
type Story = StoryObj<typeof WorldMapStorybook>;

export const Default: Story = {
    args: {
        dataSource: defaultDataSource,
        country: defaultCountryStorybook,
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
        language: defaultLanguageStorybook,
        debug: defaultDebug,
        logo: defaultLogo,
    },
};