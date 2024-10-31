import Pokedex from "../layout/Pokedex.tsx";
import {useState} from "react";
import {MoveTypeResp} from "../../models/pokemon.ts";
import useAxios from "axios-hooks";
import {TypeList} from "../moveTypes/TypesList.tsx";
import {TypesSummary} from "../moveTypes/TypesSummary.tsx";
import {TypeDetails} from "../moveTypes/TypeDetails.tsx";
import {TypesChart} from "../moveTypes/TypesChart.tsx";
import {ArrowLeftIcon, ArrowRightIcon} from "@heroicons/react/24/outline";
import environment from "../../../environments/environment.ts";

export function TypesPage() {

    const [listIndex, setListIndex] = useState(0);
    const [tabIndex, setTabIndex] = useState(0);

    const [{data, loading}, refetch] = useAxios<MoveTypeResp>(
        `${environment.host}/api/v1/type`
    )

    const handlePrev = () => {
        if (listIndex > 0) {
            setListIndex(prevState => prevState - 1)
        }
    }

    const handleNext = () => {
        if (data?.data && listIndex < data?.data.length - 1) {
            setListIndex(prevState => prevState + 1)
        }
    }

    const handleTypeSelect = (index: number) => {
        setListIndex(index);
    }

    return <Pokedex>
        <Pokedex.LeftScreen loading={loading}>
            {tabIndex === 0 ? <TypesSummary moveType={data?.data[listIndex]}/> : tabIndex === 1 ?
                <TypeDetails/> : <TypesChart/>}
        </Pokedex.LeftScreen>
        <Pokedex.RightScreen size={'large'} loading={loading}>
            <TypeList onTypeSelect={handleTypeSelect} moveTypes={data?.data} listIndex={listIndex}/>
        </Pokedex.RightScreen>
        <Pokedex.TabButtons>
            <Pokedex.TabButton pulse={tabIndex === 0} onClick={() => setTabIndex(0)} type={'info'}/>
            <Pokedex.TabButton pulse={tabIndex === 1} onClick={() => setTabIndex(1)} type={'details'}/>
            <Pokedex.TabButton pulse={tabIndex === 2} onClick={() => setTabIndex(2)} type={'other'}/>
            <Pokedex.TabButton onClick={refetch} type={'refresh'}/>
        </Pokedex.TabButtons>
        <Pokedex.KeyboardButtons>
            <Pokedex.KeyboardButton prefixIcon={<ArrowLeftIcon/>} disabled={listIndex < 1}
                                    onClick={handlePrev}>Previous</Pokedex.KeyboardButton>
            <Pokedex.KeyboardButton suffixIcon={<ArrowRightIcon/>}
                                    disabled={data?.data && listIndex >= data?.data.length}
                                    onClick={handleNext}>Next</Pokedex.KeyboardButton>
        </Pokedex.KeyboardButtons>

    </Pokedex>;
}