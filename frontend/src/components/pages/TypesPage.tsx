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

            <Pokedex.LeftControls
                dpad={{
                    onLeft: handlePrev,
                    onRight: handleNext,
                    onUp: handlePrev,
                    onDown: handleNext,
                    disabled: !moveTypes || moveTypes.length === 0
                }}
                statusText={selectedType?.name ? `TYPE: ${selectedType.name.toUpperCase()}` : "READY"}
                statusLabel="Active Type"
                onBlackButtonClick={handleRefresh}
                blackButtonLabel="Refresh Types"
                onRedPillClick={() => setTabIndex(0)}
                redPillLabel="Type Summary"
                onCyanPillClick={() => setTabIndex(1)}
                cyanPillLabel="Type Matchups"
            />

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
                <div className="flex items-center justify-between gap-2 sm:gap-3 w-full">
                    {/* Dual Horizontal Dark Pill Vents */}
                    <Pokedex.DualPillVents className="hidden sm:flex flex-shrink-0"/>

                    <Pokedex.KeyboardButton
                        disabled={listIndex <= 0}
                        onClick={handlePrev}
                        ariaLabel="Previous Type"
                        variant="silver"
                        className="flex-1 max-w-[120px]"
                    >
                        <ArrowLeftIcon className={'w-4 h-4 sm:w-5 sm:h-5'}/>
                    </Pokedex.KeyboardButton>

                    <div
                        className="px-3 py-1 rounded bg-slate-950 border border-slate-700/80 shadow-inner text-xs sm:text-sm font-mono font-bold text-center text-slate-100 select-none">
                        <span>{listIndex + 1}</span>
                        <span className="text-slate-400 mx-1">/</span>
                        <span>{moveTypes?.length || 1}</span>
                    </div>

                    <Pokedex.KeyboardButton
                        disabled={!moveTypes || listIndex >= moveTypes.length - 1}
                        onClick={handleNext}
                        ariaLabel="Next Type"
                        variant="silver"
                        className="flex-1 max-w-[120px]"
                    >
                        <ArrowRightIcon className={'w-4 h-4 sm:w-5 sm:h-5'}/>
                    </Pokedex.KeyboardButton>
                </div>
            </Pokedex.KeyboardButtons>
        </Pokedex>
    );
}
