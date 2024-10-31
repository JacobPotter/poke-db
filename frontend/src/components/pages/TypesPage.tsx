import Pokedex from "../layout/Pokedex.tsx";
import {useContext, useState} from "react";
import {TypeList} from "../moveTypes/TypesList.tsx";
import {TypesSummary} from "../moveTypes/TypesSummary.tsx";
import {TypeDetails} from "../moveTypes/TypeDetails.tsx";
import {TypesChart} from "../moveTypes/TypesChart.tsx";
import {ArrowLeftIcon, ArrowRightIcon} from "@heroicons/react/24/outline";
import {MoveTypeContext} from "../../context/MoveTypeContext.tsx";

export function TypesPage() {

    const [listIndex, setListIndex] = useState(0);
    const [tabIndex, setTabIndex] = useState(0);

    const {moveTypes, loading, refresh} = useContext(MoveTypeContext)

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
        <Pokedex.LeftScreen loading={loading}>
            {tabIndex === 0 ? <TypesSummary moveType={moveTypes[listIndex]}/> : tabIndex === 1 ?
                <TypeDetails/> : <TypesChart/>}
        </Pokedex.LeftScreen>
        <Pokedex.RightScreen size={'large'} loading={loading}>
            <TypeList onTypeSelect={handleTypeSelect} moveTypes={moveTypes} listIndex={listIndex}/>
        </Pokedex.RightScreen>
        <Pokedex.TabButtons>
            <Pokedex.TabButton pulse={tabIndex === 0} onClick={() => setTabIndex(0)} type={'info'}/>
            <Pokedex.TabButton pulse={tabIndex === 1} onClick={() => setTabIndex(1)} type={'details'}/>
            <Pokedex.TabButton pulse={tabIndex === 2} onClick={() => setTabIndex(2)} type={'other'}/>
            <Pokedex.TabButton onClick={refresh} type={'refresh'}/>
        </Pokedex.TabButtons>
        <Pokedex.KeyboardButtons>
            <div className="flex justify-evenly items-center">
                <Pokedex.KeyboardButton prefixIcon={<ArrowLeftIcon/>}
                                        disabled={listIndex < 1}
                                        onClick={handlePrev}
                                        className={'w-2/5'}>Previous</Pokedex.KeyboardButton>
                <Pokedex.KeyboardButton suffixIcon={<ArrowRightIcon/>}
                                        disabled={moveTypes && listIndex >= moveTypes.length}
                                        onClick={handleNext}
                                        className={'w-2/5'}>Next</Pokedex.KeyboardButton>
            </div>
        </Pokedex.KeyboardButtons>

    </Pokedex>;
}