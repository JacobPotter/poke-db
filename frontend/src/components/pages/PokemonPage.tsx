import Pokedex from "../layout/Pokedex.tsx";
import {PokemonList} from "../pokemon/PokemonList.tsx";
import {useState} from "react";
import {PokemonSummary} from "../pokemon/PokemonSummary.tsx";
import {PokemonDetails} from "../pokemon/PokemonDetails.tsx";
import {EvolutionChain} from "../pokemon/EvolutionChain.tsx";
import {UnknownTab} from "../ui/UnknownTab.tsx";
import {ArrowLeftIcon, ArrowRightIcon} from "@heroicons/react/24/outline";
import useAxios from "axios-hooks";
import {Pokemon} from "../../models/pokemon.ts";
import {useNavigate, useParams} from "react-router-dom";

export function PokemonPage() {


    const {id} = useParams();
    const navigate = useNavigate();

    const [tabIndex, setTabIndex] = useState(0);

    const [{data, loading}, refetch] = useAxios<{ pokemon: Pokemon[] }>(
        '/api/v1/pokemon?pageSize=1500'
    )

    const handlePrev = () => {
        if (id && (parseInt(id) - 1) > 0) {
            navigate((parseInt(id) - 1).toString())
        }
    }

    const handleNext = () => {
        if (data?.pokemon && id && (parseInt(id) - 1) < data?.pokemon.length - 1) {
            navigate((parseInt(id) + 1).toString())
        }
    }

    const handlePokemonSelect = (index: number) => {
        navigate((index + 1).toString())
    }


    return <Pokedex>
        <Pokedex.LeftScreen loading={loading}>
            {tabIndex === 0 ? <PokemonSummary pokemon={data?.pokemon[parseInt(id ?? '1') - 1]}/> : tabIndex === 1 ?
                <PokemonDetails pokemon={data?.pokemon[parseInt(id ?? '1') - 1]}/> : tabIndex === 2 ?
                    <EvolutionChain pokemon={data?.pokemon[parseInt(id ?? '1') - 1]}/> : <UnknownTab/>}
        </Pokedex.LeftScreen>
        <Pokedex.RightScreen size={'large'} loading={loading}>
            <PokemonList onPokemonSelect={handlePokemonSelect} pokemon={data?.pokemon ?? []}
                         listIndex={parseInt(id ?? '1') - 1}/>
        </Pokedex.RightScreen>

        <Pokedex.TabButtons>
            <Pokedex.TabButton pulse={tabIndex === 0} onClick={() => setTabIndex(0)} type={'info'}/>
            <Pokedex.TabButton pulse={tabIndex === 1} onClick={() => setTabIndex(1)} type={'details'}/>
            <Pokedex.TabButton pulse={tabIndex === 2} onClick={() => setTabIndex(2)} type={'other'}/>
            <Pokedex.TabButton onClick={refetch} type={'refresh'}/>
        </Pokedex.TabButtons>
        {/*Card Section*/}
        <Pokedex.KeyboardButtons>
            <Pokedex.KeyboardButton prefixIcon={<ArrowLeftIcon/>}
                                    onClick={handlePrev}>Previous</Pokedex.KeyboardButton>
            <Pokedex.KeyboardButton suffixIcon={<ArrowRightIcon/>} onClick={handleNext}>Next</Pokedex.KeyboardButton>
            {/*<Pokedex.KeyboardButton className={'col-span-2'}>Filter</Pokedex.KeyboardButton>*/}
        </Pokedex.KeyboardButtons>

    </Pokedex>;
}