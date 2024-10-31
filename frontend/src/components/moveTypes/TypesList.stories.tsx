import type {Meta, StoryObj} from '@storybook/react';
import types from '../../fixtures/types.json'

import {TypeList} from './TypesList.tsx';
import {MoveType} from "../../models/pokemon.ts";

const meta = {
    component: TypeList,
    decorators: [(Story) => (
        <div className={'bg-sky-600 p-6 max-w-sm md:max-w-md h-96 overflow-scroll'}>
            <Story/>
        </div>
    )]
} satisfies Meta<typeof TypeList>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
    args: {
        moveTypes: types.data as unknown as MoveType[],
        listIndex: 0,
        onTypeSelect: () => {
        }
    }
};