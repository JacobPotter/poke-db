import {describe, expect, it} from "vitest";
import {render} from "vitest-browser-react";
import {Tooltip} from "../Tooltip.tsx";
import {PokemonListItem} from "@/components/pokemon/PokemonListItem.tsx";
import mockPokemonResponse from "@/test/fixtures/pokemon_page_1.json"
import {FC, PropsWithChildren} from "react";

const ToolTipWrapper: FC<PropsWithChildren> = ({children}) => (
    <div className={"mx-40 mt-32"}>{children}</div>
)

describe("Tooltip", () => {
    it("should render tooltip", () => {
        const {getByText} = render(<Tooltip body={<div>Hello</div>}/>, {wrapper: ToolTipWrapper})

        expect(getByText("Hello").element()).not.toBeVisible()

    })

    it("should render with child components", () => {
        const {getByRole} = render(<Tooltip body={<div>Hello</div>}><PokemonListItem
            pokemonSpecies={mockPokemonResponse.pokemon[0]} onPokemonSelect={() => {
        }}/></Tooltip>, {wrapper: ToolTipWrapper})

        const imgElement = getByRole("img");


        expect(imgElement.element()).toBeVisible()
    })

    it("should render with child components and show body when hovering", async () => {
        const {getByRole, getByText} = render(<Tooltip body={<div>Hello</div>}><PokemonListItem
            pokemonSpecies={mockPokemonResponse.pokemon[0]} onPokemonSelect={() => {
        }}/></Tooltip>, {wrapper: ToolTipWrapper})

        const imgElement = getByRole("img");

        expect(imgElement.element()).toBeVisible()

        await imgElement.hover()

        expect(getByText("Hello").element()).toBeVisible()


    })

    it("should render with position prop top", async () => {
        const {getByRole, getByText} = render(<Tooltip position={"top"} body={<div>Hello</div>}><PokemonListItem
            pokemonSpecies={mockPokemonResponse.pokemon[0]} onPokemonSelect={() => {
        }}/></Tooltip>, {wrapper: ToolTipWrapper})

        const imgElement = getByRole("img");

        expect(imgElement.element()).toBeVisible()

        await imgElement.hover()

        expect(getByText("Hello").element()).toBeVisible()

    })
    it("should render with position prop bottom", async () => {
        const {getByRole, getByText} = render(<Tooltip position={"bottom"} body={<div>Hello</div>}><PokemonListItem
            pokemonSpecies={mockPokemonResponse.pokemon[0]} onPokemonSelect={() => {
        }}/></Tooltip>, {wrapper: ToolTipWrapper})

        const imgElement = getByRole("img");

        expect(imgElement.element()).toBeVisible()

        await imgElement.hover()

        expect(getByText("Hello").element()).toBeVisible()

    })
    it("should render with position prop right", async () => {
        const {getByRole, getByText} = render(<Tooltip position={"right"} body={<div>Hello</div>}><PokemonListItem
            pokemonSpecies={mockPokemonResponse.pokemon[0]} onPokemonSelect={() => {
        }}/></Tooltip>, {wrapper: ToolTipWrapper})

        const imgElement = getByRole("img");

        expect(imgElement.element()).toBeVisible()

        await imgElement.hover()

        expect(getByText("Hello").element()).toBeVisible()

    })
    it("should render with position prop left", async () => {
        const {getByRole, getByText} = render(<Tooltip position={"left"} body={<div>Hello</div>}><PokemonListItem
            pokemonSpecies={mockPokemonResponse.pokemon[0]} onPokemonSelect={() => {
        }}/></Tooltip>, {wrapper: ToolTipWrapper})

        const imgElement = getByRole("img");

        expect(imgElement.element()).toBeVisible()

        await imgElement.hover()

        expect(getByText("Hello").element()).toBeVisible()

    })
})
