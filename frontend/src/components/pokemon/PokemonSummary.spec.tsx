import {describe, expect, it} from "vitest";
import {render} from "vitest-browser-react";
import {PokemonSummary} from "./PokemonSummary.tsx";
import pokemon_page_1 from '../../fixtures/pokemon_page_1.json'

describe("PokemonSummary", () => {
    it("Should render correctly", () => {
        const {getByText} = render(<PokemonSummary pokemonSpecies={pokemon_page_1.pokemon[0]}/>);

        expect(getByText('Bulbasaur')).toBeTruthy
    })
})