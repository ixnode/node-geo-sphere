import type { Meta, StoryObj } from '@storybook/react';

/* Import configurations. */
import {ClickCountryData} from "./config/interfaces";
import {countryMap} from "./config/countries";
import {
    defaultCountry,
    defaultDataSource,
    defaultDebug,
    defaultLanguage, defaultLogo,
    defaultMapHeight,
    defaultMapWidth
} from "./config/config";

/* Import classes. */
import {WorldMap} from './WorldMap';

/* Import tools. */
import {getLanguageName} from "./tools/language";

/* Overwrite the options definition from any[] to Record<string, string>. */
type ArgTypesWithOptions = {
    country: {
        control: { type: 'select' };
        options: Record<string, string>;
    };
    language: {
        control: { type: 'select' };
        options: Record<string, string>;
    };
};

/* Priority keys and language. */
const priorityKeys = [null, 'all', 'eu', 'de', 'at', 'ch'];
const language = 'en'; /* Supported languages: cz, de, en, es, fr, hr, it, pl, sv */

/* Build options for countries. */
const countryOptions: Record<string, string|null> = Object.fromEntries(
    Object.entries({
        ...Object.fromEntries(Object.values(countryMap).map((country) => [
            country[getLanguageName(language)],
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
    'Czech': 'cz',
    'English': 'en',
    'French': 'fr',
    'German': 'de',
    'Italian': 'it',
    'Polish': 'pl',
    'Spanish': 'es',
    'Swedish': 'sv',
};

// @ts-ignore
const meta: Meta<typeof WorldMap & ArgTypesWithOptions> = {
    title: 'Components/WorldMap',
    component: WorldMap,
    parameters: {
        layout: 'padded',
    },
    tags: ['autodocs'],
    argTypes: {
        country: {
            control: {type: 'select'},
            // @ts-ignore
            options: countryOptions
        },
        language: {
            control: {type: 'select'},
            // @ts-ignore
            options: languageOptions
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
        onClickCountry: (data: ClickCountryData) => {
            console.log(data);
        },
        language: defaultLanguage,
        debug: defaultDebug,
        logo: defaultLogo,
    },
};