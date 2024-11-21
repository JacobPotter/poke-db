import {afterEach, beforeAll, describe, expect, it} from "vitest";
import {PokemonSpecies} from "../../../models/pokemon.ts";
import {EvolutionChainSummary} from "../EvolutionChainSummary.tsx";
import {cleanup, render} from "vitest-browser-react";
import mockIvysaurChain from "../../../../test/fixtures/ivysaur_chain.json"
import mockEeveeChain from "../../../../test/fixtures/eevee_chain.json"
import mockPokemonResponse from '../../../../test/fixtures/pokemon_page_1.json'
import Pokedex from "../../ui/pokedex/Pokedex.tsx";
import {RenderRouteWithOutletContext} from "../../../../test/helpers.tsx";
import {mockUseAxios} from "../../../../test/mocks/mockUseAxios.ts";


describe("EvolutionChainSummary", () => {
    // Common setup for all tests
    beforeAll(() => {
        mockUseAxios.configure?.({cache: false});
    });

    afterEach(() => {
        mockUseAxios.mockReset()
        cleanup()
    })

    const mockSpecies: PokemonSpecies = mockPokemonResponse.pokemon[1];

    const wrappedComponent = <RenderRouteWithOutletContext context={{pokemonSpecies: mockSpecies}}>
        <EvolutionChainSummary
        /></RenderRouteWithOutletContext>;
    it("should render correctly", () => {

        mockUseAxios.mockReturnValue([{
            loading: false,
            error: null,
            data: mockIvysaurChain,
        }]);

        const {getByRole, getByTestId} = render(wrappedComponent, {wrapper: Pokedex.LeftScreen});
        // Add assertions here
        const images = getByRole("img", {});

        const stages = getByTestId("evolution-stage");


        expect(images.all()).toHaveLength(3);
        expect(images.getByAltText("bulbasaur_icon")).toBeTruthy()
        expect(images.getByAltText("ivysaur_icon")).toBeTruthy()
        expect(images.getByAltText("venusaur_icon")).toBeTruthy()

        expect(stages.all()).toHaveLength(3)


    });

    it("should render with multiple evolutions on one stage", () => {

        mockUseAxios.mockReturnValue([{
            loading: false,
            error: null,
            data: mockEeveeChain,
        }]);

        const {getByRole, getByTestId} = render(wrappedComponent, {wrapper: Pokedex.LeftScreen});
        // Add assertions here
        const images = getByRole("img");

        const stages = getByTestId("evolution-stage");


        expect(images.all()).toHaveLength(9);
        expect(stages.all()).toHaveLength(2)


    });
});
