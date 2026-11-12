import {describe, expect, it} from "vitest";
import {PokemonSummary} from "../PokemonSummary.tsx";
import pokemon_page_1 from '@/test/fixtures/pokemon_page_1.json'
import {loader} from "@/loaders/pokemon.ts";
import Pokedex from "@/components/ui/pokedex/Pokedex.tsx";
import {render} from "@/test/utils";

describe("PokemonSummary", () => {
    it("Should render correctly with species info and cry player", async () => {
        const mockSpecies = pokemon_page_1.pokemon[0];

        const {getByText, getByRole, getByAltText} = render(
            <PokemonSummary/>, {wrapper: Pokedex.LeftScreen}, loader, {}, {pokemonSpecies: mockSpecies});

        expect(getByText('Bulbasaur')).toBeTruthy();
        expect(getByText(/Weight:/i)).toBeTruthy();
        expect(getByText(/Height:/i)).toBeTruthy();
        const img = getByAltText('bulbasaur');
        expect(img).toBeTruthy();
        await expect.element(img).toHaveClass('animate-bounce');
        expect(getByRole('button', {name: /Play Pokemon Cry/i})).toBeTruthy();
    });

    it("Should render variety navigation buttons when multiple varieties are available", () => {
        const venusaur = pokemon_page_1.pokemon[2]; // Venusaur has mega & gmax varieties

        const {getByRole, getByText} = render(
            <PokemonSummary/>, {wrapper: Pokedex.LeftScreen}, loader, {}, {pokemonSpecies: venusaur});

        expect(getByText('Venusaur')).toBeTruthy();
        expect(getByRole('button', {name: /Next variety/i})).toBeTruthy();
    });
})
