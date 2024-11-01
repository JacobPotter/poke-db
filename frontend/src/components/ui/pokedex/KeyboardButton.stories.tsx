import type {Meta, StoryObj} from '@storybook/react';

import Pokedex from "./Pokedex.tsx";
import {KeyboardButton} from "./KeyboardButton.tsx";

const meta = {
    component: KeyboardButton,
    decorators: [(Story) => (
        <div className={'w-1/3'}>
            <Story/>
        </div>
    )]
} satisfies Meta<typeof KeyboardButton>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
    args: {
        children: 'Pokemon'
    }
};
export const InContainer: Story = {
    decorators: [(Story) => (
        <Pokedex.KeyboardButtons>
            <Story/>
            <Story/>
            <Story/>
            <Story/>
        </Pokedex.KeyboardButtons>
    )], args: {
        children: 'Pokemon'
    }
};