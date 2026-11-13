import {afterEach, describe, expect, it, vi} from "vitest";
import {render} from "vitest-browser-react";
import {DarkModeContext} from "@/context/DarkModeContext.tsx";
import Layout from "../Layout.tsx";
import {MemoryRouter, Route, Routes} from "react-router-dom";

describe("Layout", () => {
    afterEach(() => {
        vi.clearAllMocks();
    });

    it("should render the layout in light mode", () => {
        const darkModeContextValue = {
            dark: false, toggleDarkMode: () => {
            }
        };

        const TestComponent = () => (
            <DarkModeContext.Provider value={darkModeContextValue}>
                <MemoryRouter initialEntries={["/test"]}>
                    <Routes>
                        <Route path="/" element={<Layout/>}>
                            <Route path="test" element={<div data-testid="outlet">Mock Outlet</div>}/>
                        </Route>
                    </Routes>
                </MemoryRouter>
            </DarkModeContext.Provider>
        );

        const {container, getByTestId} = render(<TestComponent/>);

        // Check the layout is rendered correctly in light mode
        expect(container.firstChild).toHaveProperty("className", expect.not.stringContaining("dark"));

        // Check the presence of outlet within the layout
        expect(getByTestId("outlet")).not.toBeNull();
    });

    it("should render the layout in dark mode", () => {
        const darkModeContextValue = {
            dark: true, toggleDarkMode: () => {
            }
        };

        const TestComponent = () => (
            <DarkModeContext.Provider value={darkModeContextValue}>
                <MemoryRouter initialEntries={["/test"]}>
                    <Routes>
                        <Route path="/" element={<Layout/>}>
                            <Route path="test" element={<div data-testid="outlet">Mock Outlet</div>}/>
                        </Route>
                    </Routes>
                </MemoryRouter>
            </DarkModeContext.Provider>
        );

        const {container, getByTestId} = render(<TestComponent/>);

        expect(container.firstChild).toHaveProperty("className", expect.stringContaining("dark"));

        // Check the presence of outlet within the layout
        expect(getByTestId("outlet")).not.toBeNull();
    });

    it("should provide desktop height chain constraints with minimum height floor and overflow scrolling", () => {
        const darkModeContextValue = {
            dark: false, toggleDarkMode: () => {
            }
        };

        const TestComponent = () => (
            <DarkModeContext.Provider value={darkModeContextValue}>
                <MemoryRouter initialEntries={["/test"]}>
                    <Routes>
                        <Route path="/" element={<Layout/>}>
                            <Route path="test" element={<div data-testid="outlet">Mock Outlet</div>}/>
                        </Route>
                    </Routes>
                </MemoryRouter>
            </DarkModeContext.Provider>
        );

        const {container} = render(<TestComponent/>);

        const outerWrapper = container.firstChild as HTMLElement;
        expect(outerWrapper.className).toContain("w-full");
        expect(outerWrapper.className).toContain("h-full");
        expect(outerWrapper.className).toContain("min-h-screen");
        expect(outerWrapper.className).toContain("md:h-screen");
        expect(outerWrapper.className).toContain("md:max-h-screen");

        const contentContainer = container.querySelector(".min-h-screen.md\\:min-h-\\[580px\\]");
        expect(contentContainer).not.toBeNull();
        expect(contentContainer?.className).toContain("md:h-screen");
        expect(contentContainer?.className).toContain("md:max-h-screen");
        expect(contentContainer?.className).toContain("md:overflow-y-auto");

        const mainElement = container.querySelector("main");
        expect(mainElement).not.toBeNull();
        expect(mainElement?.className).toContain("w-full");
        expect(mainElement?.className).toContain("h-full");
        expect(mainElement?.className).toContain("flex-grow");
        expect(mainElement?.className).toContain("min-h-0");
        expect(mainElement?.className).toContain("md:max-h-full");
    });
});
