import {test} from "vitest";
import {render} from "vitest-browser-react";
import Pokedex from "./Pokedex.tsx";


test("Pokedex should render", async () => {

    render(<Pokedex>
        <Pokedex.LeftScreen></Pokedex.LeftScreen>
        <Pokedex.RightScreen></Pokedex.RightScreen>
        <Pokedex.KeyboardButtons></Pokedex.KeyboardButtons>
        <Pokedex.TabButtons></Pokedex.TabButtons>
    </Pokedex>);

})