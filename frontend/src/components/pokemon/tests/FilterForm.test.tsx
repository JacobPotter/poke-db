import {describe, expect, it, vi} from "vitest";
import {render} from "@/test/utils";
import {FilterForm} from "../FilterForm.tsx";

describe("FilterForm", () => {
    it("should invoke onSubmit when Apply Filter button is clicked", async () => {
        const mockSubmit = vi.fn();
        const {getByRole} = render(
            <FilterForm onSubmit={mockSubmit}/>
        );

        const button = getByRole("button", {name: "Apply Filter"});
        await button.click();

        expect(mockSubmit).toHaveBeenCalledTimes(1);
    });

    it("should invoke onSubmit when Cancel button is clicked", async () => {
        const mockSubmit = vi.fn();
        const {getByRole} = render(
            <FilterForm onSubmit={mockSubmit}/>
        );

        const cancelButton = getByRole("button", {name: "Cancel"});
        await cancelButton.click();

        expect(mockSubmit).toHaveBeenCalledTimes(1);
    });
});
