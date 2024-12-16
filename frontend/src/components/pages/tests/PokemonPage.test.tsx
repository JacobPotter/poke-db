import {describe, expect, it} from "vitest";
import {render} from "@/test/utils";
import {PokemonPage} from "@/components/pages/PokemonPage.tsx";
import {loader} from "@/loaders/pokemon.ts";


describe('PokemonPage', () => {
    it("should render properly", async () => {
        const {getByRole} = render(<PokemonPage/>, {}, loader)

        expect(getByRole("img")).toBeTruthy()

    })
})
