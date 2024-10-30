import type {Meta, StoryObj} from '@storybook/react';

import {HamburgerButton} from './HamburgerButton.tsx';

const meta = {
    component: HamburgerButton,
    parameters: {
        viewport: {defaultViewport: 'mobile1'}
    }

} satisfies Meta<typeof HamburgerButton>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
    args: {
        onClick: () => {
        },

    }
};