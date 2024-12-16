import {describe, expect, it, vi} from "vitest";
import {PokemonSpecies} from "@/models/pokemon.ts";
import {EvolutionChainSummary} from "../EvolutionChainSummary.tsx";
import {render} from "@/test/utils";
import mockPokemonResponse from '@/test/fixtures/pokemon_page_1.json'
import Pokedex from "@/components/ui/pokedex/Pokedex.tsx";
import {loader} from "@/loaders/evolutionChain.ts"
import {worker} from "@/test/mocks/worker.ts";


describe("EvolutionChainSummary", async () => {
    // Common setup for all tests

    await worker.start()


    const mockSpecies: PokemonSpecies = mockPokemonResponse.pokemon[1];


    it("should render correctly", async () => {

        const renderedComponent = render(
            <EvolutionChainSummary/>, {wrapper: Pokedex.LeftScreen}, loader, {}, {pokemonSpecies: mockSpecies});

        const {getByRole, getByTestId} = renderedComponent;
        // Add assertions here
        const images = getByRole("img", {});

        const stages = getByTestId("evolution-stage");


        await vi.waitFor(() => {
            expect(stages.elements()).toBeTruthy()
            expect(stages.elements()).toHaveLength(3)
            expect(images.elements()).toHaveLength(3);
        })

        expect(images.getByAltText("bulbasaur_icon")).toBeTruthy()
        expect(images.getByAltText("ivysaur_icon")).toBeTruthy()
        expect(images.getByAltText("venusaur_icon")).toBeTruthy()


    });

    it("should render with multiple evolutions on one stage", async () => {

        const eevee: PokemonSpecies = {...mockSpecies, id: 133}

        const renderedComponent = render(
            <EvolutionChainSummary/>, {wrapper: Pokedex.LeftScreen}, loader, {pokemonId: "133"}, {pokemonSpecies: eevee});

        const {getByRole} = renderedComponent
        // Add assertions here
        const images = getByRole("img");


        await vi.waitFor(() => {

            expect(images.all()).toHaveLength(9);
        })


    });
});
