import {describe, expect, it, vi} from "vitest";
import {PokemonSpecies} from "@/models/pokemon.ts";
import {EvolutionChainSummary} from "../EvolutionChainSummary.tsx";
import {render} from "@/test/utils";
import mockPokemonResponse from "@/test/fixtures/pokemon_page_1.json";
import Pokedex from "@/components/ui/pokedex/Pokedex.tsx";
import {loader} from "@/loaders/evolutionChain.ts";
import {worker} from "@/test/mocks/worker.ts";

describe("EvolutionChainSummary", async () => {
    await worker.start();

    const mockSpecies: PokemonSpecies = mockPokemonResponse.pokemon[1];

    it("should render correctly in horizontal stage flow with sprites", async () => {
        const renderedComponent = render(
            <EvolutionChainSummary/>,
            {wrapper: Pokedex.RightScreen},
            loader,
            {},
            {pokemonSpecies: mockSpecies}
        );

        const {getByRole, getByTestId} = renderedComponent;
        const images = getByRole("img", {});
        const stages = getByTestId("evolution-stage");

        await vi.waitFor(() => {
            expect(stages.elements()).toBeTruthy();
            expect(stages.elements()).toHaveLength(3);
            expect(images.elements()).toHaveLength(3);
        });

        expect(images.getByAltText("bulbasaur_icon")).toBeTruthy();
        expect(images.getByAltText("ivysaur_icon")).toBeTruthy();
        expect(images.getByAltText("venusaur_icon")).toBeTruthy();
    });

    it("should render with multiple evolutions in multi-branch matrix for Eevee", async () => {
        const eevee: PokemonSpecies = {...mockSpecies, id: 133};

        const renderedComponent = render(
            <EvolutionChainSummary/>,
            {wrapper: Pokedex.RightScreen},
            loader,
            {pokemonId: "133"},
            {pokemonSpecies: eevee}
        );

        const {getByRole} = renderedComponent;
        const images = getByRole("img");

        await vi.waitFor(() => {
            expect(images.all()).toHaveLength(9);
        });
    });

    it("should trigger onPokemonSelect when clicking a pokemon in the chain", async () => {
        const mockSelect = vi.fn();
        const renderedComponent = render(
            <EvolutionChainSummary onPokemonSelect={mockSelect}/>,
            {wrapper: Pokedex.RightScreen},
            loader,
            {},
            {pokemonSpecies: mockSpecies}
        );

        const {getByRole} = renderedComponent;
        const images = getByRole("img", {});

        await vi.waitFor(() => {
            expect(images.elements()).toHaveLength(3);
        });

        const venusaurBtn = getByRole("button", {name: /Venusaur/i});
        await venusaurBtn.click();

        expect(mockSelect).toHaveBeenCalledWith(3);
    });
});
