import {afterEach, beforeEach, describe, expect, it, vi} from "vitest";
import {userEvent} from "@vitest/browser/context";
import {cleanup, render} from "vitest-browser-react";
import {FilterForm} from "../FilterForm.tsx";
import {MoveTypeProvider} from "../../../context/MoveTypeContext.tsx";
import {mockUseAxios} from "../../../../test/mocks/mockUseAxios.ts";
import mockMoveTypeResp from "../../../../test/fixtures/move_type.json"


describe("FilterForm", () => {
    const mockSubmit = vi.fn()

    beforeEach(() => {
        mockUseAxios.configure?.({cache: false});
        mockUseAxios.mockReturnValue([{
            loading: false,
            error: null,
            data: mockMoveTypeResp,
        }])
    })

    afterEach(() => {
        vi.clearAllMocks()
        mockUseAxios.mockReset()
        cleanup()
    })

    it('should invoke onSubmit when button clicked', async () => {
        const {getByRole} = render(
            <MoveTypeProvider>
                <FilterForm onSubmit={mockSubmit}/>
            </MoveTypeProvider>
        )

        const button = getByRole("button")

        await button.click()

        expect(mockSubmit).toHaveBeenCalled()

    })

    it('should pass pokemonName param through onSubmit', async () => {
        const {getByRole} = render(
            <MoveTypeProvider>
                <FilterForm onSubmit={mockSubmit}/>
            </MoveTypeProvider>
        )

        const input = getByRole("textbox")
        const button = getByRole("button")

        // const select = getByRole("combobox")

        await userEvent.fill(input, "char")

        await button.click()

        expect(mockSubmit).toHaveBeenCalled()
        expect(mockSubmit).toHaveBeenCalledWith({pokemonName: "char", pokemonTypeId: null})

    })

    it('should pass pokemonTypeId param through onSubmit', async () => {
        const {getByRole} = render(
            <MoveTypeProvider>
                <FilterForm onSubmit={mockSubmit}/>
            </MoveTypeProvider>
        )

        const button = getByRole("button")

        const select = getByRole("combobox")

        await select.selectOptions("Normal")

        expect(select.element()).toHaveValue("normal")


        await button.click()

        expect(mockSubmit).toHaveBeenCalled()
        expect(mockSubmit).toHaveBeenCalledWith({pokemonName: null, pokemonTypeId: 1})

    })
})
