import type {Meta, StoryObj} from '@storybook/react';

import {PokemonList} from './PokemonList.tsx';
import mockPokemon from '../../fixtures/pokemon.json'
import Pokedex from "../ui/pokedex/Pokedex.tsx";
import {PokemonVariety} from "../../models/pokemon.ts";

const meta = {
    component: PokemonList,
    decorators: [(Story) => (
        <Pokedex>
            <Pokedex.RightScreen size={'large'}><Story/></Pokedex.RightScreen>
        </Pokedex>
    )]
} satisfies Meta<typeof PokemonList>;

export default meta;

type Story = StoryObj<typeof meta>;


export const Default: Story = {
    args: {
        pokemon: mockPokemon.pokemon as unknown as PokemonVariety[],
        pokemonId: '4',
        onPokemonSelect: () => {
        }
    }
};