import Pokedex from "../ui/pokedex/Pokedex.tsx";
import {ComingSoon} from "../ui/ComingSoon.tsx";
import {ArrowLeftIcon, ArrowRightIcon} from "@heroicons/react/24/outline";

export function MovesPage() {
    return <Pokedex>
        <Pokedex.LeftScreen><ComingSoon/></Pokedex.LeftScreen>
        <Pokedex.RightScreen size={'large'}><ComingSoon/></Pokedex.RightScreen>
        <Pokedex.TabButtons>
            <Pokedex.TabButton type={'info'}/>
            <Pokedex.TabButton type={'details'}/>
            <Pokedex.TabButton type={'other'}/>
            <Pokedex.TabButton type={'refresh'}/>
        </Pokedex.TabButtons>
        <Pokedex.KeyboardButtons size={"large"}>
            <Pokedex.KeyboardButton prefixIcon={<ArrowLeftIcon/>}
            >Previous</Pokedex.KeyboardButton>
            <Pokedex.KeyboardButton suffixIcon={<ArrowRightIcon/>}>Next</Pokedex.KeyboardButton>
        </Pokedex.KeyboardButtons>
    </Pokedex>;
}