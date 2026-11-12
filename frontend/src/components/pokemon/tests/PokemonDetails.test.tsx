import {describe, expect, it} from "vitest";
import {PokemonDetails} from "../PokemonDetails.tsx";
import pokemon_page_1 from "@/test/fixtures/pokemon_page_1.json";
import {loader} from "@/loaders/pokemon.ts";
import Pokedex from "@/components/ui/pokedex/Pokedex.tsx";
import {PokemonSpecies} from "@/models/pokemon.ts";

describe("PokemonDetails", () => {
    it("should render base stats and traits for selected pokemon", () => {
        const mockSpecies = pokemon_page_1.pokemon[0] as PokemonSpecies;

        const {getByText} = render(
            <PokemonDetails/>,
            {wrapper: Pokedex.LeftScreen},
            loader,
            {},
            {pokemonSpecies: mockSpecies}
        );

        expect(getByText("Bulbasaur")).toBeTruthy();
        expect(getByText("Base Stats")).toBeTruthy();
        expect(getByText("HP")).toBeTruthy();
        expect(getByText("Attack")).toBeTruthy();
        expect(getByText("Defense")).toBeTruthy();
        expect(getByText("Sp. Atk")).toBeTruthy();
        expect(getByText("Sp. Def")).toBeTruthy();
        expect(getByText("Speed")).toBeTruthy();
    });

    it("should display empty state when no pokemon is selected", () => {
        const {getByText} = render(
            <PokemonDetails pokemon={null}/>,
            {wrapper: Pokedex.LeftScreen},
            loader,
            {},
            {pokemonSpecies: null}
        );

        expect(getByText("No Pokemon Selected")).toBeTruthy();
    });
});
