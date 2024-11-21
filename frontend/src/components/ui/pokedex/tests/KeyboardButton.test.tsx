import {describe, expect, it, vi} from "vitest";
import {KeyboardButton} from "../KeyboardButton.tsx";
import {render} from "vitest-browser-react";

describe("KeyboardButton", () => {

    const mockOnClick = vi.fn()

    it("should render correctly", async () => {
        const {getByRole} = render(<KeyboardButton onClick={mockOnClick}>Click Me</KeyboardButton>);

        await getByRole("button").click()

        expect(mockOnClick).toHaveBeenCalled()
    })
})
