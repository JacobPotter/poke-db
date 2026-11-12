import {describe, expect, it, vi} from "vitest";
import {DualPillVents, KeyboardButton, KeyboardButtonContainer} from "../KeyboardButton.tsx";
import {render} from "vitest-browser-react";

describe("KeyboardButton", () => {
    it("should render correctly with default and silver variants", async () => {
        const mockOnClick = vi.fn();
        const {getByRole, getByTestId} = render(
            <KeyboardButtonContainer>
                <DualPillVents/>
                <KeyboardButton onClick={mockOnClick} variant="silver" ariaLabel="Previous Page">
                    Prev
                </KeyboardButton>
            </KeyboardButtonContainer>
        );

        expect(getByTestId("dual-pill-vents")).not.toBeNull();
        const button = getByRole("button", {name: "Previous Page"});
        expect(button).not.toBeNull();
        await button.click();
        expect(mockOnClick).toHaveBeenCalled();
    });

    it("should render yellow dial variant and disabled state", () => {
        const {container} = render(
            <KeyboardButton variant="dial" ariaLabel="Filter Toggle" disabled>
                Filter
            </KeyboardButton>
        );

        const button = container.querySelector("button");
        expect(button).not.toBeNull();
        expect(button?.disabled).toBe(true);
        expect(button?.className).toContain("rounded-full");
    });
});
