import {describe, expect, it, vi} from "vitest";
import ivysaurChain from "@/test/fixtures/ivysaur_chain.json";
import {render} from "vitest-browser-react";
import {EvolutionChainItem} from "../EvolutionChainItem.tsx";

describe("EvolutionChainItem", () => {
    it("should render correctly with national ID, species name, and trigger badge", () => {
        const {getByRole, getByText} = render(
            <div className="flex items-center justify-center">
                <EvolutionChainItem chainLink={ivysaurChain}/>
            </div>
        );

        expect(getByRole("img")).toBeTruthy();
        expect(getByText("#002")).toBeTruthy();
        expect(getByText("Ivysaur")).toBeTruthy();
        expect(getByText("Lv. 16")).toBeTruthy();
    });

    it("should display tooltip of evolution details when hovering", async () => {
        const {getByText, getByTestId} = render(
            <div className="flex items-center justify-center">
                <EvolutionChainItem chainLink={ivysaurChain}/>
            </div>
        );

        const item = getByTestId("chain-item");
        expect(item).toBeTruthy();

        await item.hover();

        expect(getByText("Level to Evolve: 16").element()).toBeVisible();
    });

    it("should not display tooltip of evolution details when not hovering", async () => {
        const {getByText} = render(
            <div className="flex items-center justify-center">
                <EvolutionChainItem chainLink={ivysaurChain}/>
            </div>
        );

        expect(getByText("Level to Evolve: 16").element()).not.toBeVisible();
    });

    it("should apply active ring highlight when isActive is true", () => {
        const {getByTestId} = render(
            <div className="flex items-center justify-center">
                <EvolutionChainItem chainLink={ivysaurChain} isActive={true}/>
            </div>
        );

        const item = getByTestId("chain-item").element();
        expect(item.className).toContain("ring-amber-400");
    });

    it("should trigger onSelect callback with species ID when clicked", async () => {
        const mockSelect = vi.fn();
        const {getByTestId} = render(
            <div className="flex items-center justify-center">
                <EvolutionChainItem chainLink={ivysaurChain} onSelect={mockSelect}/>
            </div>
        );

        const item = getByTestId("chain-item");
        await item.click();

        expect(mockSelect).toHaveBeenCalledWith(2);
    });
});
