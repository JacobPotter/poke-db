import {describe, expect, it} from "vitest";
import ivysaurChain from '@/test/fixtures/ivysaur_chain.json'
import {render} from "vitest-browser-react";
import {EvolutionChainItem} from "../EvolutionChainItem.tsx";


describe("EvolutionChainItem", () => {


    it("should render correctly", () => {
        const {getByRole} = render(
            <div className={"flex items-center justify-center"}>
                <EvolutionChainItem chainLink={ivysaurChain}/>
            </div>
        )

        expect(getByRole("img")).toBeTruthy()

    })

    it("should display tooltip of evolution details when hovering", async () => {
        const {getByText, getByTestId} = render(
            <div className={"flex items-center justify-center"}>
                <EvolutionChainItem chainLink={ivysaurChain}/>
            </div>
        )

        const item = getByTestId("chain-item");
        expect(item).toBeTruthy()

        await item.hover()

        expect(getByText("Level to Evolve: 16").element()).toBeVisible()

    })
    it("should not display tooltip of evolution details when not hovering", async () => {
        const {getByText} = render(
            <div className={"flex items-center justify-center"}>
                <EvolutionChainItem chainLink={ivysaurChain}/>
            </div>
        )

        expect(getByText("Level to Evolve: 16").element()).not.toBeVisible()

    })
})
