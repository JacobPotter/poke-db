import {describe, expect, it} from "vitest";
import {render} from "@/test/utils";
import {MoveContextType, MoveTypeContext, MoveTypeProvider} from "../MoveTypeContext.tsx";
import {waitFor} from "@testing-library/react"


describe("MoveTypeProvider", () => {


    it("should provide move types and loading state", async () => {


        let contextValue: MoveContextType;
        const TestComponent = () => (
            <MoveTypeContext.Consumer>
                {value => {
                    contextValue = value;
                    return null;
                }}
            </MoveTypeContext.Consumer>
        );

        render(<MoveTypeProvider><TestComponent/></MoveTypeProvider>);

        await waitFor(() => {
            expect(contextValue).toEqual({
                moveTypes: [
                    {name: "fire", id: 1},
                    {name: "water", id: 2}
                ],
                loading: false,
                refresh: expect.any(Function)
            });
        })


    });

    it("should handle loading state correctly", () => {

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
