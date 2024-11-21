import {afterEach, beforeAll, describe, expect, it, vi} from "vitest";
import {render} from "vitest-browser-react";
import {MoveTypeContext, MoveTypeProvider} from "../MoveTypeContext.tsx"; // Replace [THIS_FILE_NAME] with the actual file name
import {MoveTypeResp} from "../../models/pokemon.ts";
import {mockUseAxios} from "../../../test/mocks/mockUseAxios.ts"; // Ensure correct path to the model


describe("MoveTypeProvider", () => {
    beforeAll(() => {
        mockUseAxios.configure?.({cache: false});
    });

    afterEach(() => {
        mockUseAxios.mockReset();
    });

    it("should provide move types and loading state", () => {
        const mockMoveTypeResponse: MoveTypeResp = {
            data: [
                {name: "fire", id: 1},
                {name: "water", id: 2},
                {name: "stellar", id: 999} // This should be filtered out
            ],
            page: 1,
            pageSize: 3,
            total: 3
        };

        mockUseAxios.mockReturnValue([{
            loading: false,
            error: null,
            data: mockMoveTypeResponse
        }, vi.fn()]);

        let contextValue;
        const TestComponent = () => (
            <MoveTypeContext.Consumer>
                {value => {
                    contextValue = value;
                    return null;
                }}
            </MoveTypeContext.Consumer>
        );

        render(<MoveTypeProvider><TestComponent/></MoveTypeProvider>);

        expect(contextValue).toEqual({
            moveTypes: [
                {name: "fire", id: 1},
                {name: "water", id: 2}
            ],
            loading: false,
            refresh: expect.any(Function)
        });
    });

    it("should handle loading state correctly", () => {
        mockUseAxios.mockReturnValue([{
            loading: true,
            error: null,
            data: null
        }, vi.fn()]);

        let contextValue;
        const TestComponent = () => (
            <MoveTypeContext.Consumer>
                {value => {
                    contextValue = value;
                    return null;
                }}
            </MoveTypeContext.Consumer>
        );

        render(<MoveTypeProvider><TestComponent/></MoveTypeProvider>);

        expect(contextValue).toEqual({
            moveTypes: [],
            loading: true,
            refresh: expect.any(Function)
        });
    });
});
