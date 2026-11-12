import Pokedex from "../ui/pokedex/Pokedex.tsx";
import {ComingSoon} from "../ui/ComingSoon.tsx";
import {ArrowLeftIcon, ArrowRightIcon} from "@heroicons/react/24/outline";

export function EvolutionsPage() {
    return (
        <Pokedex>
            <Pokedex.LeftScreen><ComingSoon/></Pokedex.LeftScreen>
            <Pokedex.LeftControls
                statusText="EVOLUTIONS"
                statusLabel="Mode"
            />
            <Pokedex.RightScreen size={'large'}><ComingSoon/></Pokedex.RightScreen>
            <Pokedex.TabButtons>
                <Pokedex.TabButton type={'info'} label="Summary"/>
                <Pokedex.TabButton type={'details'} label="Details"/>
                <Pokedex.TabButton type={'other'} label="Evolutions"/>
                <Pokedex.TabButton type={'refresh'} label="Refresh"/>
            </Pokedex.TabButtons>
            <Pokedex.KeyboardButtons size={"small"}>
                <div className="flex items-center justify-between w-full gap-2">
                    <Pokedex.DualPillVents className="hidden sm:flex flex-shrink-0"/>
                    <Pokedex.KeyboardButton
                        prefixIcon={<ArrowLeftIcon className="w-4 h-4"/>}
                        variant="silver"
                        className="flex-1"
                    >
                        Previous
                    </Pokedex.KeyboardButton>
                    <Pokedex.KeyboardButton
                        suffixIcon={<ArrowRightIcon className="w-4 h-4"/>}
                        variant="silver"
                        className="flex-1"
                    >
                        Next
                    </Pokedex.KeyboardButton>
                </div>
            </Pokedex.KeyboardButtons>
        </Pokedex>
    );
}
