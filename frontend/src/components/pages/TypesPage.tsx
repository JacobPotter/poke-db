import Pokedex from "../ui/pokedex/Pokedex.tsx";
import {useState} from "react";
import {TypeList} from "../moveTypes/TypesList.tsx";
import {TypesSummary} from "../moveTypes/TypesSummary.tsx";
import {TypeDetails} from "../moveTypes/TypeDetails.tsx";
import {TypesChart} from "../moveTypes/TypesChart.tsx";
import {ArrowLeftIcon, ArrowRightIcon} from "@heroicons/react/24/outline";
import {useMoveTypes} from "@/query/hooks/useMoveTypes.ts";

export function TypesPage() {

    const [listIndex, setListIndex] = useState(0);
    const [tabIndex, setTabIndex] = useState(0);

    const moveTypes = useMoveTypes()

    const handlePrev = () => {
        if (listIndex > 0) {
            setListIndex(prevState => prevState - 1)
        }
    }

    const handleNext = () => {
        if (moveTypes && listIndex < moveTypes.length - 1) {
            setListIndex(prevState => prevState + 1)
        }
    }

    const handleTypeSelect = (index: number) => {
        setListIndex(index);
    }

    return <Pokedex>
        <Pokedex.LeftScreen>
            {tabIndex === 0 ? <TypesSummary moveType={moveTypes[listIndex]}/> : tabIndex === 1 ?
                <TypeDetails/> : <TypesChart/>}
        </Pokedex.LeftScreen>
        <Pokedex.RightScreen size={'large'}>
            <TypeList onTypeSelect={handleTypeSelect} moveTypes={moveTypes} listIndex={listIndex}/>
        </Pokedex.RightScreen>
        <Pokedex.TabButtons>
            <Pokedex.TabButton pulse={tabIndex === 0} onClick={() => setTabIndex(0)} type={'info'}/>
            <Pokedex.TabButton pulse={tabIndex === 1} onClick={() => setTabIndex(1)} type={'details'}/>
            <Pokedex.TabButton pulse={tabIndex === 2} onClick={() => setTabIndex(2)} type={'other'}/>
            <Pokedex.TabButton type={'refresh'}/>
        </Pokedex.TabButtons>
        <Pokedex.KeyboardButtons>
            <div className="flex justify-evenly items-center">
                <Pokedex.KeyboardButton
                    disabled={listIndex < 1}
                    onClick={handlePrev}
                ><ArrowLeftIcon className={'w-4 h-4 sm:w-6 sm:h-6'}/></Pokedex.KeyboardButton>
                <Pokedex.KeyboardButton
                    disabled={moveTypes && listIndex >= moveTypes.length}
                    onClick={handleNext}
                ><ArrowRightIcon className={'w-4 h-4 sm:w-6 sm:h-6'}/></Pokedex.KeyboardButton>
            </div>
        </Pokedex.KeyboardButtons>

    </Pokedex>;
}
