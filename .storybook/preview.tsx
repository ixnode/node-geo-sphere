import React, { ReactElement } from 'react'; // React importieren
import type { Preview } from "@storybook/react";
import { I18nextProvider } from 'react-i18next';
import i18n from '../src/config/i18n';
import '../src/assets/styles/global.scss';

const preview: Preview = {
  parameters: {
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
  },
  tags: ["autodocs"],
};

export const decorators = [
  (Story: () => ReactElement) => (
      <I18nextProvider i18n={i18n}>
        <Story />
      </I18nextProvider>
  ),
];

export default preview;