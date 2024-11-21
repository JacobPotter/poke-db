import {describe, expect, it} from "vitest";
import {TabButton} from "../TabButton.tsx";
import {render} from "vitest-browser-react";

describe("TabButton", () => {

    it("should render correctly", () => {
        const {getByTestId} = render(<TabButton type={"info"}/>);

        expect(getByTestId("info-icon"))

    })

})
