import {describe, expect, it} from "vitest";
import {render} from "@/test/utils";
import {PokemonSummary} from "../PokemonSummary.tsx";
import pokemon_page_1 from '@/test/fixtures/pokemon_page_1.json'
import {loader} from "@/loaders/pokemon.ts";

import Pokedex from "@/components/ui/pokedex/Pokedex.tsx";

describe("PokemonSummary", () => {
    it("Should render correctly", () => {

        const mockSpecies = pokemon_page_1.pokemon[0];

        const {getByText} = render(
            <PokemonSummary/>, {wrapper: Pokedex.LeftScreen}, loader, {}, {pokemonSpecies: mockSpecies});

        expect(getByText('Bulbasaur')).toBeTruthy()
    })
})
