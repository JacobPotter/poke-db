import {describe, expect, it, vi} from "vitest";
import {render} from "vitest-browser-react";
import {PokemonListItem} from "../PokemonListItem.tsx";
import pokemon_page_1 from '@/test/fixtures/pokemon_page_1.json'


describe("PokemonListItem", () => {

    const mockPokemonSelect = vi.fn()

    it("should render correctly", () => {
        const {getByText, getByRole} = render(<PokemonListItem pokemonSpecies={pokemon_page_1.pokemon[0]}
                                                               onPokemonSelect={mockPokemonSelect}/>)


        expect(getByText("Bulbasaur")).toBeTruthy()
        expect(getByRole("img")).toBeTruthy
    })

    it("should change style with active prop", () => {
        const {getByRole} = render(<PokemonListItem pokemonSpecies={pokemon_page_1.pokemon[0]}
                                                    onPokemonSelect={mockPokemonSelect}/>)

        expect(getByRole("button").element().className.includes("active"))
    })

    it("should pass id when clicked", async () => {
        const {getByRole} = render(<PokemonListItem pokemonSpecies={pokemon_page_1.pokemon[0]}
                                                    onPokemonSelect={mockPokemonSelect}/>)

        const button = getByRole("button");

        await button.click()

        expect(mockPokemonSelect).toHaveBeenCalledWith(1)
    })
})
