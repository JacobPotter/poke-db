import Pokedex from "../ui/pokedex/Pokedex.tsx";
import {useState} from "react";
import {TypeList} from "../moveTypes/TypesList.tsx";
import {TypesSummary} from "../moveTypes/TypesSummary.tsx";
import {TypeDetails} from "../moveTypes/TypeDetails.tsx";
import {TypesChart} from "../moveTypes/TypesChart.tsx";
import {ArrowLeftIcon, ArrowRightIcon} from "@heroicons/react/24/outline";
import {useMoveTypes} from "@/query/hooks/useMoveTypes.ts";
import {useQueryClient} from "@tanstack/react-query";
import {MOVE_TYPE_DEFAULT_QUERY_OPTIONS} from "@/query/keyFactories.ts";

export function TypesPage() {
    const [listIndex, setListIndex] = useState(0);
    const [tabIndex, setTabIndex] = useState(0);

    const moveTypes = useMoveTypes();
    const queryClient = useQueryClient();

    const handlePrev = () => {
        if (listIndex > 0) {
            setListIndex(prevState => prevState - 1);
        }
    };

    const handleNext = () => {
        if (moveTypes && listIndex < moveTypes.length - 1) {
            setListIndex(prevState => prevState + 1);
        }
    };

    const handleTypeSelect = (index: number) => {
        setListIndex(index);
    };

    const handleRefresh = () => {
        queryClient.invalidateQueries(MOVE_TYPE_DEFAULT_QUERY_OPTIONS);
    };

    const selectedType = moveTypes?.[listIndex];

    return (
        <Pokedex>
            <Pokedex.LeftScreen>
                {tabIndex === 0 ? (
                    <TypesSummary moveType={selectedType}/>
                ) : tabIndex === 1 ? (
                    <TypeDetails moveType={selectedType}/>
                ) : (
                    <TypesChart/>
                )}
            </Pokedex.LeftScreen>

            <Pokedex.RightScreen size={'large'}>
                <TypeList onTypeSelect={handleTypeSelect} moveTypes={moveTypes} listIndex={listIndex}/>
            </Pokedex.RightScreen>

            <Pokedex.TabButtons>
                <Pokedex.TabButton
                    pulse={tabIndex === 0}
                    onClick={() => setTabIndex(0)}
                    type={'info'}
                    label="Type Summary"
                />
                <Pokedex.TabButton
                    pulse={tabIndex === 1}
                    onClick={() => setTabIndex(1)}
                    type={'details'}
                    label="Type Matchups"
                />
                <Pokedex.TabButton
                    pulse={tabIndex === 2}
                    onClick={() => setTabIndex(2)}
                    type={'other'}
                    label="Effectiveness Matrix"
                />
                <Pokedex.TabButton
                    type={'refresh'}
                    onClick={handleRefresh}
                    label="Refresh Move Types"
                />
            </Pokedex.TabButtons>

            <Pokedex.KeyboardButtons>
                <div className="flex justify-evenly items-center w-full">
                    <Pokedex.KeyboardButton
                        disabled={listIndex <= 0}
                        onClick={handlePrev}
                        ariaLabel="Previous Type"
                        className="w-1/3"
                    >
                        <ArrowLeftIcon className={'w-4 h-4 sm:w-6 sm:h-6'}/>
                    </Pokedex.KeyboardButton>
                    <div className="text-xs sm:text-sm font-mono font-bold text-slate-100">
                        {listIndex + 1} / {moveTypes?.length || 1}
                    </div>
                    <Pokedex.KeyboardButton
                        disabled={!moveTypes || listIndex >= moveTypes.length - 1}
                        onClick={handleNext}
                        ariaLabel="Next Type"
                        className="w-1/3"
                    >
                        <ArrowRightIcon className={'w-4 h-4 sm:w-6 sm:h-6'}/>
                    </Pokedex.KeyboardButton>
                </div>
            </Pokedex.KeyboardButtons>
        </Pokedex>
    );
}
