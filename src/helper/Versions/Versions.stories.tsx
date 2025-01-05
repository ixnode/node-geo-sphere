import type {Meta, StoryObj} from '@storybook/react';

/* Import classes. */
import {Versions} from './Versions';

// @ts-ignore
const meta: Meta<typeof Versions> = {
    title: 'Helper/Versions',
    component: Versions,
    parameters: {
        layout: 'padded',
    },
    tags: ['autodocs'],
    argTypes: {},
};

export default meta;
type Story = StoryObj<typeof Versions>;

export const Default: Story = {
    args: {},
};