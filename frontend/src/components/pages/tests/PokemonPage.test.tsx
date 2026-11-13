import {afterEach, beforeEach, describe, expect, it, vi} from "vitest";
import {page, userEvent} from "@vitest/browser/context";
import {PokemonPage} from "@/components/pages/PokemonPage.tsx";
import {loader} from "@/loaders/pokemon.ts";
import {render} from "@/test/utils";
import {createMemoryRouter, RouterProvider} from "react-router-dom";
import {QueryClientProvider} from "@tanstack/react-query";
import {generateQueryClient} from "@/test/utils/client.tsx";
import {render as VBRRender} from "vitest-browser-react";
import Layout from "@/components/layout/Layout.tsx";
import {DarkModeProvider} from "@/context/DarkModeContext.tsx";
import {PokemonDetails} from "@/components/pokemon/PokemonDetails.tsx";
import {EvolutionChainSummary} from "@/components/pokemon/EvolutionChainSummary.tsx";
import {loader as evolutionChainLoader} from "@/loaders/evolutionChain.ts";

describe('PokemonPage', () => {
    let originalWidth = 1280;
    let originalHeight = 800;

    beforeEach(async () => {
        originalWidth = window.innerWidth;
        originalHeight = window.innerHeight;
        await page.viewport(1280, 800);
    });

    afterEach(async () => {
        await page.viewport(originalWidth, originalHeight);
    });

    it("should render properly with active pokemon on desktop", async () => {
        const {container} = render(<PokemonPage/>, {}, loader);

        // Wait until loaded data renders in container
        await vi.waitFor(() => {
            expect(container.textContent).toContain("Active Pokemon");
            expect(container.textContent).toContain("#001 BULBASAUR");
            expect(container.textContent).toContain("Bulbasaur");
            expect(container.textContent).toContain("Base Stats");
        });

        const cards = container.querySelectorAll(".hidden.md\\:grid button[aria-label*='#']");
        expect(cards.length).toBe(6);
    });

    it("should clamp invalid pageSize query parameters to default 6 items per page on desktop", async () => {
        const {container} = render(
            <PokemonPage/>,
            {},
            loader,
            {pageSize: "invalid_param_999"}
        );

        // 12 total pokemon with clamped 6 items/page equals 6 cards on desktop
        await vi.waitFor(() => {
            expect(container.textContent).toContain("Active Pokemon");
            expect(container.textContent).toContain("#001 BULBASAUR");
        });

        const cards = container.querySelectorAll(".hidden.md\\:grid button[aria-label*='#']");
        expect(cards.length).toBe(6);
    });

    it("should paginate with 3 items per page on mobile viewports using D-Pad", async () => {
        await page.viewport(390, 844);
        const {getByRole, container} = render(
            <PokemonPage/>,
            {},
            loader
        );

        // Wait for initial pokemon to load on mobile
        await vi.waitFor(() => {
            expect(container.textContent).toContain("Active Pokemon");
            expect(container.textContent).toContain("#001 BULBASAUR");
        });

        const dpadDown = getByRole("button", {name: "D-Pad Down"});
        expect(dpadDown).toBeTruthy();

        await dpadDown.click();

        await vi.waitFor(() => {
            expect(container.textContent).toContain("#004 CHARMANDER");
        });
    });

    it("should hide sprite selector buttons on mobile viewports and support full navigation via D-Pad at bottom below hinge", async () => {
        await page.viewport(390, 844);
        const {getByRole, container} = render(
            <PokemonPage/>,
            {},
            loader
        );

        await vi.waitFor(() => {
            expect(container.textContent).toContain("Active Pokemon");
            expect(container.textContent).toContain("#001 BULBASAUR");
        });

        // Verify TabButtonContainer is hidden on mobile
        const tabButtonGrid = container.querySelector("[data-testid='tab-button-keypad-grid']");
        expect(tabButtonGrid).not.toBeNull();
        expect(tabButtonGrid?.className).toContain("hidden");
        expect(tabButtonGrid?.className).toContain("md:flex");

        // Verify mobile hinge placement: LeftControls is positioned in lower base below hinge
        const mobileContainer = container.querySelector("[data-testid='pokedex-mobile-clamshell']");
        expect(mobileContainer).not.toBeNull();
        const hinge = mobileContainer?.querySelector("[data-testid='mobile-hinge']");
        expect(hinge).not.toBeNull();

        const children = Array.from(mobileContainer?.children || []);
        const leftControls = mobileContainer?.querySelector("[data-testid='left-hardware-controls']");
        expect(leftControls).not.toBeNull();
        const controlsIdx = children.indexOf(leftControls!);
        const hingeIdx = children.findIndex(el => el === hinge);
        expect(controlsIdx).toBeGreaterThan(hingeIdx);

        // Test D-Pad Right to switch to next Pokémon (Bulbasaur -> Ivysaur)
        const dpadRight = getByRole("button", {name: "D-Pad Right"});
        await dpadRight.click();
        await vi.waitFor(() => {
            expect(container.textContent).toContain("#002 IVYSAUR");
        });

        // Test D-Pad Left to switch to previous Pokémon (Ivysaur -> Bulbasaur)
        const dpadLeft = getByRole("button", {name: "D-Pad Left"});
        await dpadLeft.click();
        await vi.waitFor(() => {
            expect(container.textContent).toContain("#001 BULBASAUR");
        });

        // Test D-Pad Down to navigate to next page (Bulbasaur #1 -> Charmander #4)
        const dpadDown = getByRole("button", {name: "D-Pad Down"});
        await dpadDown.click();
        await vi.waitFor(() => {
            expect(container.textContent).toContain("#004 CHARMANDER");
        });

        // Test D-Pad Up to navigate back to previous page (Charmander #4 -> Bulbasaur #1)
        const dpadUp = getByRole("button", {name: "D-Pad Up"});
        await dpadUp.click();
        await vi.waitFor(() => {
            expect(container.textContent).toContain("#001 BULBASAUR");
        });
    });

    it("should navigate to next page and update active pokemon when clicking D-Pad down on desktop", async () => {
        const {getByRole, container} = render(<PokemonPage/>, {}, loader);

        await vi.waitFor(() => {
            expect(container.textContent).toContain("Active Pokemon");
            expect(container.textContent).toContain("#001 BULBASAUR");
        });

        const dpadDown = getByRole("button", {name: "D-Pad Down"});
        expect(dpadDown).toBeTruthy();

        await dpadDown.click();

        await vi.waitFor(() => {
            expect(container.textContent).toContain("#007 SQUIRTLE");
        });
    });

    it("should select pokemon and highlight active button when clicking a sprite button in TabButtons", async () => {
        const {getByRole, container} = render(<PokemonPage/>, {}, loader);

        await vi.waitFor(() => {
            expect(container.textContent).toContain("Active Pokemon");
            expect(container.textContent).toContain("#001 BULBASAUR");
        });

        const ivysaurBtn = getByRole("button", {name: "Ivysaur #002"});
        expect(ivysaurBtn).toBeTruthy();

        await ivysaurBtn.click();

        await vi.waitFor(() => {
            expect(container.textContent).toContain("#002 IVYSAUR");
            expect(ivysaurBtn.element().className).toContain("ring-amber-400");
        });
    });

    it("should render 3 tactile hardware pill radio buttons with backlit LED glow, radiogroup semantics, and top header refresh button", async () => {
        const {getByRole, container} = render(<PokemonPage/>, {}, loader);

        await vi.waitFor(() => {
            expect(container.textContent).toContain("Active Pokemon");
        });

        const radiogroup = getByRole("radiogroup", {name: "Right screen view selection"});
        expect(radiogroup).toBeTruthy();

        const statsBtn = getByRole("radio", {name: "View Base Stats"});
        const evolutionsBtn = getByRole("radio", {name: "View Evolution Chain"});
        const filterBtn = getByRole("radio", {name: "Filter"});
        const refreshBtn = getByRole("button", {name: "Refresh Pokemon Data"});

        expect(statsBtn).toBeTruthy();
        expect(evolutionsBtn).toBeTruthy();
        expect(filterBtn).toBeTruthy();
        expect(refreshBtn).toBeTruthy();

        // Check active stats tab has aria-checked="true", glowing red LED shadow, and NO yellow outline ring
        expect(statsBtn.element().getAttribute("aria-checked")).toBe("true");
        expect(statsBtn.element().getAttribute("tabindex")).toBe("0");
        expect(statsBtn.element().className).toContain("shadow-[0_0_16px_rgba(239,68,68,0.85)");
        expect(statsBtn.element().className).not.toContain("ring-amber-400");

        // Other radios are not selected
        expect(evolutionsBtn.element().getAttribute("aria-checked")).toBe("false");
        expect(evolutionsBtn.element().getAttribute("tabindex")).toBe("-1");
        expect(filterBtn.element().getAttribute("aria-checked")).toBe("false");
        expect(filterBtn.element().getAttribute("tabindex")).toBe("-1");

        // Verify DualPillVents are rendered on both sides of pill buttons in desktop and mobile layouts
        const desktopVents = container.querySelectorAll(".hidden.md\\:grid [data-testid='dual-pill-vents']");
        expect(desktopVents.length).toBe(2);
        const allVents = container.querySelectorAll("[data-testid='dual-pill-vents']");
        expect(allVents.length).toBe(4);

        await evolutionsBtn.click();
        await vi.waitFor(() => {
            expect(evolutionsBtn.element().getAttribute("aria-checked")).toBe("true");
            expect(statsBtn.element().getAttribute("aria-checked")).toBe("false");
            expect(evolutionsBtn.element().className).toContain("shadow-[0_0_16px_rgba(56,189,248,0.85)");
            expect(evolutionsBtn.element().className).not.toContain("ring-amber-400");
        });

        await refreshBtn.click();
    });

    it("should toggle filter form and manage mutually exclusive radio selection", async () => {
        const {getByRole, container} = render(<PokemonPage/>, {}, loader);

        await vi.waitFor(() => {
            expect(container.textContent).toContain("Active Pokemon");
        });

        const filterBtn = getByRole("radio", {name: "Filter"});
        const statsBtn = getByRole("radio", {name: "View Base Stats"});
        expect(filterBtn).toBeTruthy();

        await filterBtn.click();

        await vi.waitFor(() => {
            expect(container.textContent).toContain("Filter Pokemon");
        });

        const activeFilterBtn = getByRole("radio", {name: "Filter"});
        expect(activeFilterBtn.element().getAttribute("aria-checked")).toBe("true");
        expect(statsBtn.element().getAttribute("aria-checked")).toBe("false");
        expect(activeFilterBtn.element().className).toContain("shadow-[0_0_16px_rgba(245,158,11,0.85)");
        expect(activeFilterBtn.element().className).not.toContain("ring-amber-400");

        // Activating the already checked Filter radio must not toggle it off
        await activeFilterBtn.click();
        expect(activeFilterBtn.element().getAttribute("aria-checked")).toBe("true");
        expect(container.textContent).toContain("Filter Pokemon");

        // Selecting another radio closes the filter and selects that view
        await statsBtn.click();

        await vi.waitFor(() => {
            expect(statsBtn.element().getAttribute("aria-checked")).toBe("true");
            expect(activeFilterBtn.element().getAttribute("aria-checked")).toBe("false");
        });
    });

    it("should select base stats when clicking red pill button and not toggle away when already selected", async () => {
        const {getByRole, container} = render(<PokemonPage/>, {}, loader);

        await vi.waitFor(() => {
            expect(container.textContent).toContain("Active Pokemon");
        });

        const redBtn = getByRole("radio", {name: "View Base Stats"});
        const cyanBtn = getByRole("radio", {name: "View Evolution Chain"});
        expect(redBtn).toBeTruthy();

        // Clicking Base Stats while already selected keeps it selected
        await redBtn.click();
        expect(redBtn.element().getAttribute("aria-checked")).toBe("true");
        expect(cyanBtn.element().getAttribute("aria-checked")).toBe("false");

        // Switch to Evolutions first
        await cyanBtn.click();
        await vi.waitFor(() => {
            expect(cyanBtn.element().getAttribute("aria-checked")).toBe("true");
            expect(redBtn.element().getAttribute("aria-checked")).toBe("false");
        });

        // Click Base Stats to switch back
        await redBtn.click();
        await vi.waitFor(() => {
            expect(redBtn.element().getAttribute("aria-checked")).toBe("true");
            expect(cyanBtn.element().getAttribute("aria-checked")).toBe("false");
        });
    });

    it("should select evolution chain when clicking cyan pill button and not toggle away when already selected", async () => {
        const {getByRole, container} = render(<PokemonPage/>, {}, loader);

        await vi.waitFor(() => {
            expect(container.textContent).toContain("Active Pokemon");
        });

        const cyanBtn = getByRole("radio", {name: "View Evolution Chain"});
        const redBtn = getByRole("radio", {name: "View Base Stats"});
        expect(cyanBtn).toBeTruthy();

        await cyanBtn.click();

        await vi.waitFor(() => {
            expect(cyanBtn.element().getAttribute("aria-checked")).toBe("true");
            expect(redBtn.element().getAttribute("aria-checked")).toBe("false");
        });

        // Clicking Evolution Chain while already selected keeps it selected
        await cyanBtn.click();
        expect(cyanBtn.element().getAttribute("aria-checked")).toBe("true");
        expect(redBtn.element().getAttribute("aria-checked")).toBe("false");
    });

    it("should support arrow key navigation across the radiogroup", async () => {
        const {getByRole, container} = render(<PokemonPage/>, {}, loader);

        await vi.waitFor(() => {
            expect(container.textContent).toContain("Active Pokemon");
        });

        const statsBtn = getByRole("radio", {name: "View Base Stats"});
        const evolutionsBtn = getByRole("radio", {name: "View Evolution Chain"});

        expect(statsBtn.element().getAttribute("aria-checked")).toBe("true");

        // Dispatch ArrowRight from stats -> evolutions
        statsBtn.element().dispatchEvent(new KeyboardEvent("keydown", {key: "ArrowRight", bubbles: true}));

        await vi.waitFor(() => {
            expect(evolutionsBtn.element().getAttribute("aria-checked")).toBe("true");
            expect(statsBtn.element().getAttribute("aria-checked")).toBe("false");
        });

        // Dispatch ArrowRight from evolutions -> filter
        evolutionsBtn.element().dispatchEvent(new KeyboardEvent("keydown", {key: "ArrowRight", bubbles: true}));

        await vi.waitFor(() => {
            const filterBtn = getByRole("radio", {name: "Filter"});
            expect(filterBtn.element().getAttribute("aria-checked")).toBe("true");
            expect(evolutionsBtn.element().getAttribute("aria-checked")).toBe("false");
        });

        // Dispatch ArrowLeft from filter -> evolutions
        const activeFilterBtn = getByRole("radio", {name: "Filter"});
        activeFilterBtn.element().dispatchEvent(new KeyboardEvent("keydown", {key: "ArrowLeft", bubbles: true}));

        await vi.waitFor(() => {
            expect(evolutionsBtn.element().getAttribute("aria-checked")).toBe("true");
        });
    });

    it("should move focus and roving tabIndex with arrow keys in both wrap directions", async () => {
        const {getByRole, container} = render(<PokemonPage/>, {}, loader);

        await vi.waitFor(() => {
            expect(container.textContent).toContain("Active Pokemon");
        });

        const statsBtn = getByRole("radio", {name: "View Base Stats"});
        const evolutionsBtn = getByRole("radio", {name: "View Evolution Chain"});
        const filterBtn = getByRole("radio", {name: "Filter"});

        await statsBtn.click();
        await userEvent.keyboard("{ArrowRight}");

        await vi.waitFor(() => {
            expect(document.activeElement?.getAttribute("aria-label")).toBe("View Evolution Chain");
            expect(evolutionsBtn.element().getAttribute("aria-checked")).toBe("true");
            expect(evolutionsBtn.element().getAttribute("tabindex")).toBe("0");
            expect(statsBtn.element().getAttribute("tabindex")).toBe("-1");
        });

        await userEvent.keyboard("{ArrowRight}");

        await vi.waitFor(() => {
            expect(document.activeElement?.getAttribute("aria-label")).toBe("Filter");
            expect(filterBtn.element().getAttribute("aria-checked")).toBe("true");
            expect(filterBtn.element().getAttribute("tabindex")).toBe("0");
            expect(evolutionsBtn.element().getAttribute("tabindex")).toBe("-1");
        });

        // Wrap forward: Filter -> Base Stats
        await userEvent.keyboard("{ArrowRight}");

        await vi.waitFor(() => {
            expect(document.activeElement?.getAttribute("aria-label")).toBe("View Base Stats");
            expect(statsBtn.element().getAttribute("aria-checked")).toBe("true");
            expect(statsBtn.element().getAttribute("tabindex")).toBe("0");
            expect(filterBtn.element().getAttribute("aria-checked")).toBe("false");
        });

        // Wrap backward: Base Stats -> Filter
        await userEvent.keyboard("{ArrowLeft}");

        await vi.waitFor(() => {
            expect(document.activeElement?.getAttribute("aria-label")).toBe("Filter");
            expect(filterBtn.element().getAttribute("aria-checked")).toBe("true");
            expect(statsBtn.element().getAttribute("aria-checked")).toBe("false");
            expect(container.textContent).toContain("Filter Pokemon");
        });
    });

    it("should keep the checked radio selected when pressing Enter or Space on it", async () => {
        const {getByRole, container} = render(<PokemonPage/>, {}, loader);

        await vi.waitFor(() => {
            expect(container.textContent).toContain("Active Pokemon");
        });

        const statsBtn = getByRole("radio", {name: "View Base Stats"});
        const evolutionsBtn = getByRole("radio", {name: "View Evolution Chain"});
        const filterBtn = getByRole("radio", {name: "Filter"});

        await statsBtn.click();
        await userEvent.keyboard("{Enter}");
        await userEvent.keyboard(" ");
        expect(statsBtn.element().getAttribute("aria-checked")).toBe("true");
        expect(evolutionsBtn.element().getAttribute("aria-checked")).toBe("false");

        await filterBtn.click();
        await vi.waitFor(() => {
            expect(container.textContent).toContain("Filter Pokemon");
            expect(filterBtn.element().getAttribute("aria-checked")).toBe("true");
        });

        await filterBtn.click();
        await userEvent.keyboard("{Enter}");
        await userEvent.keyboard(" ");
        expect(filterBtn.element().getAttribute("aria-checked")).toBe("true");
        expect(statsBtn.element().getAttribute("aria-checked")).toBe("false");
        expect(container.textContent).toContain("Filter Pokemon");
    });

    it("should restore Evolution Chain selection when Filter is closed from Evolutions", async () => {
        const {getByRole, container} = render(<PokemonPage/>, {}, loader);

        await vi.waitFor(() => {
            expect(container.textContent).toContain("Active Pokemon");
        });

        const evolutionsBtn = getByRole("radio", {name: "View Evolution Chain"});
        const filterBtn = getByRole("radio", {name: "Filter"});

        await evolutionsBtn.click();
        await vi.waitFor(() => {
            expect(evolutionsBtn.element().getAttribute("aria-checked")).toBe("true");
            expect(container.textContent).toContain("Evolution Line");
        });

        await filterBtn.click();
        await vi.waitFor(() => {
            expect(container.textContent).toContain("Filter Pokemon");
            expect(filterBtn.element().getAttribute("aria-checked")).toBe("true");
            expect(evolutionsBtn.element().getAttribute("aria-checked")).toBe("false");
        });

        // Closing by selecting the Evolution Chain radio restores Evolutions
        await evolutionsBtn.click();
        await vi.waitFor(() => {
            expect(evolutionsBtn.element().getAttribute("aria-checked")).toBe("true");
            expect(filterBtn.element().getAttribute("aria-checked")).toBe("false");
            expect(container.textContent).toContain("Evolution Line");
            expect(container.textContent).not.toContain("Filter Pokemon");
        });
    });

    it("should select pokemon when clicking on an evolution item in the Evolution Chain view", async () => {
        const {getByRole, container} = render(<PokemonPage/>, {}, loader);

        await vi.waitFor(() => {
            expect(container.textContent).toContain("Active Pokemon");
            expect(container.textContent).toContain("#001 BULBASAUR");
        });

        // Switch to Evolution Chain view
        const evolutionsBtn = getByRole("radio", {name: "View Evolution Chain"});
        await evolutionsBtn.click();

        await vi.waitFor(() => {
            expect(container.textContent).toContain("Evolution Line");
        });

        const ivysaurEvolutionItem = getByRole("button", {name: "Ivysaur (ID: #2)"});
        await ivysaurEvolutionItem.click();

        await vi.waitFor(() => {
            expect(container.textContent).toContain("#002 IVYSAUR");
        });
    });

    describe("Desktop Layout & Chassis Height Invariance (Layout-wrapped)", () => {
        function renderPokemonPageWithLayout(initialPath = "/pokemon/stats") {
            const queryClient = generateQueryClient();
            const router = createMemoryRouter([
                {
                    path: "/",
                    element: <Layout/>,
                    children: [
                        {
                            path: "pokemon",
                            element: <PokemonPage/>,
                            loader: loader(queryClient),
                            children: [
                                {
                                    path: "stats",
                                    element: <PokemonDetails/>
                                },
                                {
                                    path: "evolutions",
                                    loader: evolutionChainLoader(queryClient),
                                    element: <EvolutionChainSummary/>
                                }
                            ]
                        }
                    ]
                }
            ], {initialEntries: [initialPath]});

            return VBRRender(
                <DarkModeProvider>
                    <QueryClientProvider client={queryClient}>
                        <RouterProvider router={router}/>
                    </QueryClientProvider>
                </DarkModeProvider>
            );
        }

        it("should maintain constant chassis and right screen height when toggling stats, evolutions, and filter at 1280x800", async () => {
            await page.viewport(1280, 800);
            const {getByRole, container} = renderPokemonPageWithLayout("/pokemon/stats");

            await vi.waitFor(() => {
                expect(container.textContent).toContain("Active Pokemon");
                expect(container.textContent).toContain("Base Stats");
            });

            const chassis = container.querySelector("[data-testid='pokedex-chassis']") as HTMLElement;
            const rightScreen = container.querySelector("[data-testid='right-screen-container']") as HTMLElement;
            expect(chassis).not.toBeNull();
            expect(rightScreen).not.toBeNull();

            // 1. Measure Base Stats view dimensions
            const statsChassisRect = chassis.getBoundingClientRect();
            const statsRightScreenRect = rightScreen.getBoundingClientRect();

            expect(statsChassisRect.height).toBeGreaterThan(500);
            expect(statsRightScreenRect.height).toBeGreaterThan(200);

            // 2. Switch to Evolution Chain view
            const evolutionsBtn = getByRole("radio", {name: "View Evolution Chain"});
            await evolutionsBtn.click();

            await vi.waitFor(() => {
                expect(container.textContent).toContain("Evolution Line");
            });

            const evolutionsChassisRect = chassis.getBoundingClientRect();
            const evolutionsRightScreenRect = rightScreen.getBoundingClientRect();

            // Height must remain invariant across view switch
            expect(evolutionsChassisRect.height).toBeCloseTo(statsChassisRect.height, 1);
            expect(evolutionsRightScreenRect.height).toBeCloseTo(statsRightScreenRect.height, 1);

            // 3. Switch to Filter view
            const filterBtn = getByRole("radio", {name: /Filter/});
            await filterBtn.click();

            await vi.waitFor(() => {
                expect(container.textContent).toContain("Filter Pokemon");
            });

            const filterChassisRect = chassis.getBoundingClientRect();
            const filterRightScreenRect = rightScreen.getBoundingClientRect();

            // Height must remain invariant across filter view switch
            expect(filterChassisRect.height).toBeCloseTo(statsChassisRect.height, 1);
            expect(filterRightScreenRect.height).toBeCloseTo(statsRightScreenRect.height, 1);
        });

        it("should maintain constant chassis and right screen height when switching views at 1024x700", async () => {
            await page.viewport(1024, 700);
            const {getByRole, container} = renderPokemonPageWithLayout("/pokemon/stats");

            await vi.waitFor(() => {
                expect(container.textContent).toContain("Active Pokemon");
                expect(container.textContent).toContain("Base Stats");
            });

            const chassis = container.querySelector("[data-testid='pokedex-chassis']") as HTMLElement;
            const rightScreen = container.querySelector("[data-testid='right-screen-container']") as HTMLElement;
            expect(chassis).not.toBeNull();
            expect(rightScreen).not.toBeNull();

            const statsChassisHeight = chassis.getBoundingClientRect().height;
            const statsRightScreenHeight = rightScreen.getBoundingClientRect().height;

            // Switch to Evolution Chain view
            const evolutionsBtn = getByRole("radio", {name: "View Evolution Chain"});
            await evolutionsBtn.click();

            await vi.waitFor(() => {
                expect(container.textContent).toContain("Evolution Line");
            });

            const evolutionsChassisHeight = chassis.getBoundingClientRect().height;
            const evolutionsRightScreenHeight = rightScreen.getBoundingClientRect().height;

            expect(evolutionsChassisHeight).toBeCloseTo(statsChassisHeight, 1);
            expect(evolutionsRightScreenHeight).toBeCloseTo(statsRightScreenHeight, 1);

            // Switch to Filter view
            const filterBtn = getByRole("radio", {name: /Filter/});
            await filterBtn.click();

            await vi.waitFor(() => {
                expect(container.textContent).toContain("Filter Pokemon");
            });

            const filterChassisHeight = chassis.getBoundingClientRect().height;
            const filterRightScreenHeight = rightScreen.getBoundingClientRect().height;

            expect(filterChassisHeight).toBeCloseTo(statsChassisHeight, 1);
            expect(filterRightScreenHeight).toBeCloseTo(statsRightScreenHeight, 1);
        });

        it("should safeguard short desktop windows (1024x640, 1280x600) with minimum height floor and accessible controls", async () => {
            await page.viewport(1024, 640);
            const {getByRole, container} = renderPokemonPageWithLayout("/pokemon/stats");

            await vi.waitFor(() => {
                expect(container.textContent).toContain("Active Pokemon");
            });

            const chassis = container.querySelector("[data-testid='pokedex-chassis']") as HTMLElement;
            expect(chassis).not.toBeNull();
            expect(chassis.getBoundingClientRect().height).toBeGreaterThanOrEqual(500);

            // Controls must be visible and accessible
            const dpad = getByRole("button", {name: "D-Pad Up"});
            expect(dpad).toBeTruthy();

            const statsBtn = getByRole("button", {name: "Close Base Stats"});
            expect(statsBtn).toBeTruthy();
        });

        it("should fit Pokédex chassis within mobile viewports without vertical page scrolling across standard dimensions", async () => {
            const mobileViewports = [
                {width: 375, height: 667, name: "iPhone SE"},
                {width: 390, height: 844, name: "iPhone 12/13/14/15"},
                {width: 412, height: 915, name: "Android Pixel/Galaxy"}
            ];

            for (const vp of mobileViewports) {
                await page.viewport(vp.width, vp.height);
                const {container} = renderPokemonPageWithLayout("/pokemon/stats");

                await vi.waitFor(() => {
                    expect(container.textContent).toContain("Active Pokemon");
                });

                const chassis = container.querySelector("[data-testid='pokedex-chassis']") as HTMLElement;
                expect(chassis).not.toBeNull();

                const layoutRoot = container.firstElementChild as HTMLElement;
                expect(layoutRoot).not.toBeNull();

                // The chassis bounding height must fit within the viewport height
                const chassisRect = chassis.getBoundingClientRect();
                expect(chassisRect.height).toBeLessThanOrEqual(vp.height);

                // Layout root scroll height must not exceed viewport height (no page scrollbar)
                expect(layoutRoot.scrollHeight).toBeLessThanOrEqual(vp.height + 1);
            }
        });
    });
});
