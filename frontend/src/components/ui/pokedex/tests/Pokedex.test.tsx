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

        const root = container.querySelector(".max-w-full");
        expect(root).not.toBeNull();
        expect(root?.className).toContain("w-full");
        expect(root?.className).toContain("h-full");

        const chassis = container.querySelector(".bg-gradient-to-b.from-red-600");
        expect(chassis).not.toBeNull();
        expect(chassis?.className).toContain("w-full");
        expect(chassis?.className).toContain("h-full");
        expect(chassis?.className).toContain("flex-grow");

        // Verify LeftScreen housing height constraints
        const leftScreenHousing = container.querySelector(".min-h-\\[140px\\]");
        expect(leftScreenHousing).not.toBeNull();
        expect(leftScreenHousing?.className).toContain("sm:min-h-[160px]");
        expect(leftScreenHousing?.className).toContain("md:min-h-0");
        expect(leftScreenHousing?.className).toContain("max-h-[280px]");
        expect(leftScreenHousing?.className).toContain("md:max-h-none");

        // Verify RightScreen height & scroll constraints
        const rightScreenContainer = container.querySelector(".min-h-\\[110px\\]");
        expect(rightScreenContainer).not.toBeNull();
        expect(rightScreenContainer?.className).toContain("sm:min-h-[130px]");
        expect(rightScreenContainer?.className).toContain("md:min-h-0");
        expect(rightScreenContainer?.className).toContain("max-h-[280px]");
        expect(rightScreenContainer?.className).toContain("md:max-h-none");
        expect(rightScreenContainer?.className).toContain("overflow-y-auto");
        expect(rightScreenContainer?.className).toContain("flex-1");
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
        const leftHousings = Array.from(container.querySelectorAll<HTMLElement>(".min-h-\\[140px\\]"));
        const leftHousing = leftHousings.find(el => el.offsetParent !== null) || leftHousings[0];
        expect(leftHousing).not.toBeNull();

        const leftInnerViewport = leftHousing.querySelector("div.overflow-y-auto") as HTMLElement;
        expect(leftInnerViewport).not.toBeNull();
        expect(leftInnerViewport.scrollHeight).toBeGreaterThan(leftInnerViewport.clientHeight);

        const rightScreens = Array.from(container.querySelectorAll<HTMLElement>(".min-h-\\[110px\\]"));
        const rightScreen = rightScreens.find(el => el.offsetParent !== null) || rightScreens[0];
        expect(rightScreen).not.toBeNull();
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

            const leftHousings = Array.from(container.querySelectorAll<HTMLElement>(".min-h-\\[140px\\]"));
            const leftHousing = leftHousings.find(el => el.offsetParent !== null);
            expect(leftHousing).not.toBeUndefined();
            expect(getComputedStyle(leftHousing!).minHeight).toBe("140px");
            expect(leftHousing!.getBoundingClientRect().height).toBeGreaterThanOrEqual(140);
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

    it("should render hardware refresh button when onRefresh is provided and trigger callback on click", async () => {
        const mockRefresh = vi.fn();
        const {getByRole} = render(
            <DarkModeProvider>
                <Pokedex onRefresh={mockRefresh} refreshLabel="Refresh Pokemon Data">
                    <Pokedex.LeftScreen>
                        <div>Left Screen</div>
                    </Pokedex.LeftScreen>
                </Pokedex>
            </DarkModeProvider>
        );

        const refreshBtns = getByRole("button", {name: "Refresh Pokemon Data"}).elements();
        expect(refreshBtns.length).toBeGreaterThanOrEqual(1);

        const refreshBtn = getByRole("button", {name: "Refresh Pokemon Data"});
        await refreshBtn.click();
        expect(mockRefresh).toHaveBeenCalled();
    });

    it("should position LeftScreen above mobile hinge, and RightScreen, KeyboardButtons, and LeftControls below hinge on mobile", () => {
        const {container} = render(
            <DarkModeProvider>
                <Pokedex>
                    <Pokedex.LeftScreen>
                        <div data-testid="left-content">Left Screen</div>
                    </Pokedex.LeftScreen>
                    <Pokedex.LeftControls
                        statusText="#001 BULBASAUR"
                        statusLabel="Active Pokemon"
                    />
                    <Pokedex.RightScreen>
                        <div data-testid="right-content">Right Screen</div>
                    </Pokedex.RightScreen>
                    <Pokedex.TabButtons>
                        <div data-testid="tab-buttons-content">Tab Buttons</div>
                    </Pokedex.TabButtons>
                    <Pokedex.KeyboardButtons>
                        <div data-testid="keyboard-buttons-content">Keyboard Buttons</div>
                    </Pokedex.KeyboardButtons>
                </Pokedex>
            </DarkModeProvider>
        );

        // Verify LeftScreenContainer does not internally contain the mobile hinge
        const leftScreenContainer = container.querySelector("[data-testid='left-screen-container']");
        expect(leftScreenContainer).not.toBeNull();
        expect(leftScreenContainer?.querySelector("[data-testid='mobile-hinge']")).toBeNull();

        // In mobile clamshell flow ([data-testid='pokedex-mobile-clamshell']), verify element sequence
        const mobileContainer = container.querySelector("[data-testid='pokedex-mobile-clamshell']");
        expect(mobileContainer).not.toBeNull();

        const mobileHinge = mobileContainer?.querySelector("[data-testid='mobile-hinge']");
        expect(mobileHinge).not.toBeNull();

        // Check DOM child indices within mobileContainer
        const children = Array.from(mobileContainer?.children || []);
        const leftScreen = mobileContainer?.querySelector("[data-testid='left-screen-container']");
        const hinge = mobileContainer?.querySelector("[data-testid='mobile-hinge']");
        const rightScreen = mobileContainer?.querySelector("[data-testid='right-screen-container']");
        const keyboardButtons = mobileContainer?.querySelector("[data-testid='keyboard-button-container']");
        const leftControls = mobileContainer?.querySelector("[data-testid='left-hardware-controls']");

        expect(leftScreen).not.toBeNull();
        expect(hinge).not.toBeNull();
        expect(rightScreen).not.toBeNull();
        expect(keyboardButtons).not.toBeNull();
        expect(leftControls).not.toBeNull();

        const leftScreenIdx = children.indexOf(leftScreen!);
        const hingeIdx = children.indexOf(hinge!);
        const rightScreenIdx = children.indexOf(rightScreen!);
        const keyboardButtonsIdx = children.indexOf(keyboardButtons!);
        const leftControlsIdx = children.indexOf(leftControls!);

        expect(leftScreenIdx).toBeGreaterThanOrEqual(0);
        expect(hingeIdx).toBeGreaterThan(leftScreenIdx);
        expect(rightScreenIdx).toBeGreaterThan(hingeIdx);
        expect(keyboardButtonsIdx).toBeGreaterThan(rightScreenIdx);
        expect(leftControlsIdx).toBeGreaterThan(keyboardButtonsIdx);

        // Verify TabButtons container is hidden on mobile via hidden md:flex
        const tabButtonGrid = container.querySelector("[data-testid='tab-button-keypad-grid']");
        expect(tabButtonGrid).not.toBeNull();
        expect(tabButtonGrid?.className).toContain("hidden");
        expect(tabButtonGrid?.className).toContain("md:flex");
    });

    it("should render full-height desktop hinge on >= md and full-width edge-to-edge mobile hinge on < md", () => {
        const {container} = render(
            <DarkModeProvider>
                <Pokedex>
                    <Pokedex.LeftScreen>
                        <div>Left Screen</div>
                    </Pokedex.LeftScreen>
                    <Pokedex.RightScreen>
                        <div>Right Screen</div>
                    </Pokedex.RightScreen>
                </Pokedex>
            </DarkModeProvider>
        );

        // Verify chassis body has overflow-hidden to cleanly clip full-width/height hinge extensions
        const chassis = container.querySelector("[data-testid='pokedex-chassis']");
        expect(chassis).not.toBeNull();
        expect(chassis?.className).toContain("overflow-hidden");

        // Verify Desktop full-height vertical hinge spine (>= md)
        const desktopHinge = container.querySelector("[data-testid='desktop-hinge']");
        expect(desktopHinge).not.toBeNull();
        expect(desktopHinge?.className).toContain("hidden");
        expect(desktopHinge?.className).toContain("md:flex");
        expect(desktopHinge?.className).toContain("absolute");
        expect(desktopHinge?.className).toContain("top-0");
        expect(desktopHinge?.className).toContain("bottom-0");
        expect(desktopHinge?.className).toContain("left-1/2");
        expect(desktopHinge?.className).toContain("-translate-x-1/2");
        expect(desktopHinge?.className).toContain("border-x-2");
        expect(desktopHinge?.className).toContain("border-slate-950");

        // Verify Desktop hinge has top & bottom metallic brackets and groove dividers
        const desktopHingeChildren = Array.from(desktopHinge?.children || []);
        expect(desktopHingeChildren.length).toBe(3);
        const topBracket = desktopHingeChildren[0];
        const grooves = desktopHingeChildren[1];
        const bottomBracket = desktopHingeChildren[2];

        expect(topBracket?.className).toContain("bg-gradient-to-r");
        expect(topBracket?.className).toContain("border-b");
        expect(bottomBracket?.className).toContain("bg-gradient-to-r");
        expect(bottomBracket?.className).toContain("border-t");
        expect(grooves?.querySelectorAll(".bg-slate-950").length).toBeGreaterThanOrEqual(4);

        // Verify Mobile full-width edge-to-edge horizontal hinge (< md)
        const mobileHinge = container.querySelector("[data-testid='mobile-hinge']");
        expect(mobileHinge).not.toBeNull();
        expect(mobileHinge?.className).toContain("-mx-2");
        expect(mobileHinge?.className).toContain("sm:-mx-3");
        expect(mobileHinge?.className).toContain("w-[calc(100%+1rem)]");
        expect(mobileHinge?.className).toContain("sm:w-[calc(100%+1.5rem)]");

        const innerMobileBar = mobileHinge?.firstElementChild;
        expect(innerMobileBar).not.toBeNull();
        expect(innerMobileBar?.className).toContain("rounded-none");
        expect(innerMobileBar?.className).toContain("border-y-2");
        expect(innerMobileBar?.className).toContain("border-slate-950");
    });
});
