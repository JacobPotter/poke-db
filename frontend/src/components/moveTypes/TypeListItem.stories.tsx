import type {Meta, StoryObj} from '@storybook/react';
import types from '../../fixtures/types.json'

import {TypeListItem} from './TypeListItem.tsx';
import {MoveType} from "../../models/pokemon.ts";

const meta = {
    component: TypeListItem,
    decorators: [(Story) => (
        <div className={'bg-sky-600 p-6 md:w-1/3 text-sky-50'}>
            <Story/>
        </div>
    )]
} satisfies Meta<typeof TypeListItem>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
    args: {
        type: types.data[1] as unknown as MoveType
    }
};