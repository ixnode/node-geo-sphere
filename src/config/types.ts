/* Import i18n. */
import {defaultLanguageOptions} from "./i18n";

export type TypeLanguagesSupported = typeof defaultLanguageOptions[keyof typeof defaultLanguageOptions];

export type TypeLanguagesSupportedStorybook = keyof typeof defaultLanguageOptions;