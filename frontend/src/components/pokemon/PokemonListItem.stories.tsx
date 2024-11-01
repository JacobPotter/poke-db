import type {Meta, StoryObj} from '@storybook/react';
import pokemon_page_1 from '../../fixtures/pokemon_page_1.json'

import {PokemonListItem} from './PokemonListItem.tsx';

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
        pokemonSpecies: pokemon_page_1.pokemon[0],
        active: true,
        onPokemonSelect: () => {
        }
    },
};