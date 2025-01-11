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
        size: 'medium',
        type: 'svg'
    },
};

export const SvgSmall: Story = {
    name: 'SVG (small)',
    args: {
        size: 'small',
        type: 'svg'
    },
};

export const SvgMedium: Story = {
    name: 'SVG (medium)',
    args: {
        size: 'medium',
        type: 'svg'
    },
};

export const SvgLarge: Story = {
    name: 'SVG (large)',
    args: {
        size: 'large',
        type: 'svg'
    },
};

export const IconSmall: Story = {
    name: 'Icon (small)',
    args: {
        size: 'small',
        type: 'icon'
    },
};

export const IconMedium: Story = {
    name: 'Icon (medium)',
    args: {
        size: 'medium',
        type: 'icon'
    },
};

export const IconLarge: Story = {
    name: 'Icon (large)',
    args: {
        size: 'large',
        type: 'icon'
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
    name: 'CSS (large)',
    args: {
        size: 'large',
        type: 'css'
    },
};
