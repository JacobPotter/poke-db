import {describe, expect, it, vi} from "vitest";
import {PokemonList} from "./PokemonList.tsx";
import {render} from "vitest-browser-react";
import pokemon_page_1 from '../../fixtures/pokemon_page_1.json'


describe("PokemonList", () => {
    it("renders correctly", () => {
        const mockPokemonSelect = vi.fn();
        const {getByRole} = render(<PokemonList pokemon={pokemon_page_1.pokemon} pokemonId={"3"}
                                                onPokemonSelect={mockPokemonSelect}/>);

        const buttons = getByRole("button");

        expect(buttons.all()).toHaveLength(12)

    })

})