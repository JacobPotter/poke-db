import {describe, expect, it, vi} from "vitest";
import {render} from "vitest-browser-react";
import {page} from "@vitest/browser/context";
import Pokedex from "../Pokedex.tsx";
import {DarkModeProvider} from "@/context/DarkModeContext.tsx";

describe("Pokedex", () => {
    it("should render full Pokédex chassis with screens and hardware controls", async () => {
        const mockUp = vi.fn();
        const mockDown = vi.fn();
        const mockLeft = vi.fn();
        const mockRight = vi.fn();
        const mockBlackButton = vi.fn();

        const {getByRole, getByText, getByTestId} = render(
            <DarkModeProvider>
                <Pokedex>
                    <Pokedex.LeftScreen>
                        <div data-testid="left-content">Pokemon Summary</div>
                    </Pokedex.LeftScreen>
                    <Pokedex.LeftControls
                        dpad={{
                            onUp: mockUp,
                            onDown: mockDown,
                            onLeft: mockLeft,
                            onRight: mockRight
                        }}
                        statusText="#001 BULBASAUR"
                        statusLabel="Active Pokemon"
                        onBlackButtonClick={mockBlackButton}
                        blackButtonLabel="Play Cry"
                    />
                    <Pokedex.RightScreen>
                        <div data-testid="right-content">Pokemon List</div>
                    </Pokedex.RightScreen>
                    <Pokedex.TabButtons>
                        <Pokedex.TabButton type="info" label="Summary"/>
                        <Pokedex.TabButton type="details" label="Details"/>
                    </Pokedex.TabButtons>
                    <Pokedex.KeyboardButtons>
                        <Pokedex.DualPillVents/>
                        <Pokedex.KeyboardButton variant="silver">Prev</Pokedex.KeyboardButton>
                        <Pokedex.KeyboardButton variant="dial" ariaLabel="Filter Toggle">Action</Pokedex.KeyboardButton>
                        <Pokedex.KeyboardButton variant="silver">Next</Pokedex.KeyboardButton>
                    </Pokedex.KeyboardButtons>
                </Pokedex>
            </DarkModeProvider>
        );

        expect(getByTestId("left-content")).not.toBeNull();
        expect(getByTestId("right-content")).not.toBeNull();
        expect(getByTestId("left-hardware-controls")).not.toBeNull();
        expect(getByTestId("dual-pill-vents")).not.toBeNull();
        expect(getByText("#001 BULBASAUR")).not.toBeNull();

        // Test D-pad buttons
        const upButton = getByRole("button", {name: "D-Pad Up"});
        await upButton.click();
        expect(mockUp).toHaveBeenCalled();

        const leftButton = getByRole("button", {name: "D-Pad Left"});
        await leftButton.click();
        expect(mockLeft).toHaveBeenCalled();

        // Test Black Action Button
        const blackBtn = getByRole("button", {name: "Play Cry"});
        await blackBtn.click();
        expect(mockBlackButton).toHaveBeenCalled();
    });

    it("should render screen containers with trimmed height classes and scroll bounds", () => {
        const {container} = render(
            <DarkModeProvider>
                <Pokedex>
                    <Pokedex.LeftScreen>
                        <div>Left Child</div>
                    </Pokedex.LeftScreen>
                    <Pokedex.RightScreen size="large">
                        <div>Right Child</div>
                    </Pokedex.RightScreen>
                </Pokedex>
            </DarkModeProvider>
        );

        const chassis = container.querySelector(".bg-gradient-to-b.from-red-600");
        expect(chassis).not.toBeNull();
        expect(chassis?.className).toContain("md:min-h-[640px]");
        expect(chassis?.className).toContain("lg:min-h-[680px]");
        expect(chassis?.className).toContain("xl:min-h-[720px]");

        // Verify LeftScreen housing height constraints
        const leftScreenHousing = container.querySelector(".min-h-\\[300px\\]");
        expect(leftScreenHousing).not.toBeNull();
        expect(leftScreenHousing?.className).toContain("sm:min-h-[340px]");
        expect(leftScreenHousing?.className).toContain("md:min-h-[360px]");
        expect(leftScreenHousing?.className).toContain("lg:min-h-[400px]");
        expect(leftScreenHousing?.className).toContain("max-h-[380px]");
        expect(leftScreenHousing?.className).toContain("lg:max-h-[480px]");

        // Verify RightScreen height & scroll constraints
        const rightScreenContainer = container.querySelector(".min-h-\\[240px\\]");
        expect(rightScreenContainer).not.toBeNull();
        expect(rightScreenContainer?.className).toContain("sm:min-h-[280px]");
        expect(rightScreenContainer?.className).toContain("md:min-h-[300px]");
        expect(rightScreenContainer?.className).toContain("lg:min-h-[340px]");
        expect(rightScreenContainer?.className).toContain("max-h-[380px]");
        expect(rightScreenContainer?.className).toContain("lg:max-h-[420px]");
        expect(rightScreenContainer?.className).toContain("overflow-y-auto");
    });

    it("should constrain height and enable internal scrolling when rendering tall content", () => {
        const {container} = render(
            <DarkModeProvider>
                <Pokedex>
                    <Pokedex.LeftScreen>
                        <div data-testid="tall-left-content" className="min-h-[1200px]">
                            Tall Left Content
                        </div>
                    </Pokedex.LeftScreen>
                    <Pokedex.RightScreen size="large">
                        <div data-testid="tall-right-content" className="min-h-[1200px]">
                            Tall Right Content
                        </div>
                    </Pokedex.RightScreen>
                </Pokedex>
            </DarkModeProvider>
        );

        // Find visible left housing (accounting for desktop/mobile responsive DOM branches)
        const leftHousings = Array.from(container.querySelectorAll<HTMLElement>(".min-h-\\[300px\\]"));
        const leftHousing = leftHousings.find(el => el.offsetParent !== null) || leftHousings[0];
        expect(leftHousing).not.toBeNull();
        const leftHousingRect = leftHousing.getBoundingClientRect();
        expect(leftHousingRect.height).toBeLessThanOrEqual(481);

        const leftInnerViewport = leftHousing.querySelector("div.overflow-y-auto") as HTMLElement;
        expect(leftInnerViewport).not.toBeNull();
        expect(leftInnerViewport.scrollHeight).toBeGreaterThan(leftInnerViewport.clientHeight);

        const rightScreens = Array.from(container.querySelectorAll<HTMLElement>(".min-h-\\[240px\\]"));
        const rightScreen = rightScreens.find(el => el.offsetParent !== null) || rightScreens[0];
        expect(rightScreen).not.toBeNull();
        const rightScreenRect = rightScreen.getBoundingClientRect();
        expect(rightScreenRect.height).toBeLessThanOrEqual(421);
        expect(rightScreen.scrollHeight).toBeGreaterThan(rightScreen.clientHeight);
    });

    it("should keep the left housing at its declared minimum height on mobile with short content", async () => {
        const originalWidth = window.innerWidth;
        const originalHeight = window.innerHeight;
        await page.viewport(390, 844);
        try {
            const {container} = render(
                <DarkModeProvider>
                    <Pokedex>
                        <Pokedex.LeftScreen>
                            <div data-testid="short-left-content">Short Left Content</div>
                        </Pokedex.LeftScreen>
                        <Pokedex.RightScreen>
                            <div>Short Right Content</div>
                        </Pokedex.RightScreen>
                    </Pokedex>
                </DarkModeProvider>
            );

            const leftHousings = Array.from(container.querySelectorAll<HTMLElement>(".min-h-\\[300px\\]"));
            const leftHousing = leftHousings.find(el => el.offsetParent !== null);
            expect(leftHousing).not.toBeUndefined();
            expect(getComputedStyle(leftHousing!).minHeight).toBe("300px");
            expect(leftHousing!.getBoundingClientRect().height).toBeGreaterThanOrEqual(300);
        } finally {
            await page.viewport(originalWidth, originalHeight);
        }
    });

    it("should render loading state placeholders in trimmed screen containers", () => {
        const {container} = render(
            <DarkModeProvider>
                <Pokedex>
                    <Pokedex.LeftScreen loading={true}/>
                    <Pokedex.RightScreen loading={true}/>
                </Pokedex>
            </DarkModeProvider>
        );

        expect(container.querySelectorAll(".animate-pulse").length).toBeGreaterThanOrEqual(2);
    });
});
