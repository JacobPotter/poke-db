import {describe, expect, it, vi} from "vitest";
import {TabButton, TabButtonContainer} from "../TabButton.tsx";
import {render} from "vitest-browser-react";

describe("TabButton", () => {
    it("should render correctly and handle clicks", async () => {
        const handleClick = vi.fn();
        const {getByTestId, getByRole} = render(
            <TabButton type="info" label="Summary" onClick={handleClick} pulse/>
        );

        expect(getByTestId("info-icon")).not.toBeNull();
        const button = getByRole("button", {name: "Summary"});
        expect(button.element().className).toContain("ring-2");
        await button.click();
        expect(handleClick).toHaveBeenCalled();
    });

    it("should render 2x5 Keypad container on desktop and touch bar on mobile", () => {
        const {getByText, getByTestId} = render(
            <TabButtonContainer>
                <TabButton type="info" label="Summary"/>
                <TabButton type="details" label="Details"/>
                <TabButton type="other" label="Evolutions"/>
                <TabButton type="refresh" label="Refresh"/>
            </TabButtonContainer>
        );

        expect(getByTestId("tab-button-keypad-grid")).not.toBeNull();
        expect(getByTestId("tab-button-mobile-touch-bar")).not.toBeNull();
        expect(getByText("5")).not.toBeNull();
        expect(getByText("0")).not.toBeNull();
    });
});
