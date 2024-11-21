import type {Meta, StoryObj} from '@storybook/react';

import {DarkModeButton} from '../DarkModeButton.tsx';

const meta = {
    component: DarkModeButton,
} satisfies Meta<typeof DarkModeButton>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};
