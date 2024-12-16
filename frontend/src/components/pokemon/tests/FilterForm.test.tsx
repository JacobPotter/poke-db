import {describe, expect, it, vi} from "vitest";
import {render} from "@/test/utils";
import {FilterForm} from "../FilterForm.tsx";


describe("FilterForm", () => {
    const mockSubmit = vi.fn()


    it('should invoke onSubmit when button clicked', async () => {
        const {getByRole} = render(
            <FilterForm onSubmit={mockSubmit}/>
        )

        const button = getByRole("button")

        await button.click()

        expect(mockSubmit).toHaveBeenCalled()

    })
    
})
