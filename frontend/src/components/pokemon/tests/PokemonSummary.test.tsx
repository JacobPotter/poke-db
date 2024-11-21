import {describe, expect, it} from "vitest";
import {render} from "vitest-browser-react";
import {PokemonSummary} from "../PokemonSummary.tsx";
import pokemon_page_1 from '../../../../test/fixtures/pokemon_page_1.json'
import {RenderRouteWithOutletContext} from "../../../../test/helpers.tsx";

describe("PokemonSummary", () => {
    it("Should render correctly", () => {
        const wrappedComponent = <RenderRouteWithOutletContext context={{pokemonSpecies: pokemon_page_1.pokemon[0]}}>
            <PokemonSummary/>
        </RenderRouteWithOutletContext>;
        const {getByText} = render(wrappedComponent);

        expect(getByText('Bulbasaur')).toBeTruthy()
    })
})
