import {afterEach, describe, expect, it, vi} from "vitest";
import {render} from "vitest-browser-react";
import {DarkModeContext} from "../../../context/DarkModeContext.tsx";
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

        // Check the presence of components within the layout
        expect(getByTestId("navbar")).not.toBeNull();
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

        // Check the presence of components within the layout
        expect(getByTestId("navbar")).not.toBeNull();
        expect(getByTestId("outlet")).not.toBeNull();
    });
});
