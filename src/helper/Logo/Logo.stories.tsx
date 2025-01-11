import type {Meta, StoryObj} from '@storybook/react';

/* Import classes. */
import {Logo} from './Logo';

// @ts-ignore
const meta: Meta<typeof Logo> = {
    title: 'Helper/Logo',
    component: Logo,
    parameters: {
        layout: 'padded',
    },
    tags: ['autodocs'],
    argTypes: {},
};

export default meta;
type Story = StoryObj<typeof Logo>;

export const Default: Story = {
    name: 'Default (small, css)',
    args: {
        // size: 'small',
        // type: 'css'
        size: 'large',
        type: 'svg'
    },
};

export const CssSmall: Story = {
    name: 'CSS (small)',
    args: {
        size: 'small',
        type: 'css'
    },
};

export const CssMedium: Story = {
    name: 'CSS (medium)',
    args: {
        size: 'medium',
        type: 'css'
    },
};

export const CssLarge: Story = {
    args: {
        size: 'large',
        type: 'css'
    },
};

export const SvgSmall: Story = {
    name: 'CSS (small)',
    args: {
        size: 'small',
        type: 'svg'
    },
};

export const SvgMedium: Story = {
    name: 'CSS (medium)',
    args: {
        size: 'medium',
        type: 'svg'
    },
};

export const SvgLarge: Story = {
    args: {
        size: 'large',
        type: 'svg'
    },
};