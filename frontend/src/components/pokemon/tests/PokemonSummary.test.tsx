import {describe, expect, it} from "vitest";
import {PokemonSummary} from "../PokemonSummary.tsx";
import pokemon_page_1 from '@/test/fixtures/pokemon_page_1.json'
import {loader} from "@/loaders/pokemon.ts";
import Pokedex from "@/components/ui/pokedex/Pokedex.tsx";
import {render} from "@/test/utils";

describe("PokemonSummary", () => {
    it("Should render cleanly with species info, header type badges, and animated sprite without obsolete bottom details", async () => {
        const mockSpecies = pokemon_page_1.pokemon[0];

        const {getByText, getByAltText, container} = render(
            <PokemonSummary/>, {wrapper: Pokedex.LeftScreen}, loader, {}, {pokemonSpecies: mockSpecies});

        expect(getByText('Bulbasaur')).toBeTruthy();
        expect(getByText('#1')).toBeTruthy();
        expect(getByAltText('grass')).toBeTruthy();
        expect(getByAltText('poison')).toBeTruthy();

        const img = getByAltText('bulbasaur');
        expect(img).toBeTruthy();
        await expect.element(img).toHaveClass('animate-bounce');
        await expect.element(img).toHaveClass('h-full');
        await expect.element(img).toHaveClass('max-h-full');
        await expect.element(img).toHaveClass('max-w-[95%]');
        await expect.element(img).toHaveClass('object-contain');

        // Audio element is present for cry playback
        expect(container.querySelector('audio')).toBeTruthy();

        // Obsolete bottom panel items should not be present
        expect(container.textContent).not.toContain('Weight:');
        expect(container.textContent).not.toContain('Height:');
        expect(container.querySelector('button[aria-label*="Play Pokemon Cry"]')).toBeNull();
    });

    it("Should render variety navigation buttons when multiple varieties are available", () => {
        const venusaur = pokemon_page_1.pokemon[2]; // Venusaur has mega & gmax varieties

        const {getByRole, getByText} = render(
            <PokemonSummary/>, {wrapper: Pokedex.LeftScreen}, loader, {}, {pokemonSpecies: venusaur});

        expect(getByText('Venusaur')).toBeTruthy();
        expect(getByRole('button', {name: /Next variety/i})).toBeTruthy();
    });
})
