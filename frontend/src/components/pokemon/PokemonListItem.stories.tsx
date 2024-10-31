import type {Meta, StoryObj} from '@storybook/react';
import pokemon from '../../fixtures/pokemon.json'

import {PokemonListItem} from './PokemonListItem.tsx';
import {Pokemon} from "../../models/pokemon.ts";

const meta = {
    component: PokemonListItem,
    decorators: [(Story) => (
        <div className={'bg-sky-600 p-6 max-w-3xl'}>
            <Story/>
        </div>
    )]
} satisfies Meta<typeof PokemonListItem>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
    args: {
        pokemon: pokemon.pokemon[0] as unknown as Pokemon,
        active: true,
        index: 0,
        onPokemonSelect: () => {
        }
    },
};