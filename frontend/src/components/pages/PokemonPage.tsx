import Pokedex from "../ui/pokedex/Pokedex.tsx";
import {PokemonList} from "../pokemon/PokemonList.tsx";
import {FC, useCallback, useEffect, useState} from "react";
import {ArrowLeftIcon, ArrowRightIcon, ArrowUturnLeftIcon, FunnelIcon} from "@heroicons/react/24/outline";
import {Outlet, useLocation, useNavigate, useSearchParams} from "react-router-dom";
import {FilterForm} from "../pokemon/FilterForm.tsx";
import {useQueryClient} from "@tanstack/react-query";
import {usePokemon} from "@/query/hooks/usePokemon.ts";
import {getEvolutionChainQueryOptions} from "@/query/keyFactories.ts";


type TabName = "summary" | "stats" | "evolutions";


export const PokemonPage: FC = () => {

    const {pathname} = useLocation();

    const [searchParams] = useSearchParams()

    const queryClient = useQueryClient()


    const [leftScreenOutletName, setLeftScreenOutletName] = useState<TabName>(pathname.split("/")[3] as TabName);
    const navigate = useNavigate();


    const [editForm, setEditForm] = useState<boolean>(false);

    const {
        pokemon,
        currentPokemon,
        currentPage,
        handleNext,
        handlePrevious,
        handlePokemonSelect,
        total,
        pageSize,
        resetFilters,
        refresh,
        isFetching: loading
    } = usePokemon()


    const handleTabChange = useCallback((tabName: string) => {
        navigate({pathname: `/pokemon/${tabName}`, search: `?${searchParams.toString()}`}, {relative: "path"});
    }, [navigate, searchParams]);


    function toggleFilter() {
        setEditForm(prevState => !prevState);
    }

    useEffect(() => {
        if (currentPokemon?.id) {
            queryClient.prefetchQuery(getEvolutionChainQueryOptions(currentPokemon.id))
        }
    }, [currentPokemon, queryClient]);


    return <Pokedex>
        <Pokedex.LeftScreen loading={loading}>
            <Outlet context={{pokemonSpecies: currentPokemon}}/>
        </Pokedex.LeftScreen>
        <Pokedex.RightScreen size={'large'} loading={loading}>
            {!editForm ? <PokemonList onPokemonSelect={handlePokemonSelect} pokemon={pokemon ?? []}
                                      pokemonId={currentPokemon && currentPokemon.id ? currentPokemon?.id.toString() : "1"}/> :
                <FilterForm onSubmit={() => setEditForm(false)}/>}
        </Pokedex.RightScreen>


        <Pokedex.TabButtons>

            <Pokedex.TabButton pulse={leftScreenOutletName === 'summary'}
                               onClick={() => {
                                   setLeftScreenOutletName('summary');
                                   handleTabChange('summary')
                               }} type={'info'}/>
            <Pokedex.TabButton pulse={leftScreenOutletName === 'evolutions'}
                               onClick={() => {
                                   setLeftScreenOutletName('evolutions');
                                   handleTabChange('evolutions')
                               }} type={'other'}/>
            <Pokedex.TabButton pulse={leftScreenOutletName === 'stats'} onClick={() => {
                setLeftScreenOutletName('stats');
                handleTabChange('stats');
            }}
                               type={'details'}/>
            <Pokedex.TabButton type={'refresh'}
                               onClick={() => refresh()}/>
        </Pokedex.TabButtons>

        <Pokedex.KeyboardButtons>
            <div className="grid grid-cols-5 gap-2 items-center justify-center w-full">
                <Pokedex.KeyboardButton onClick={handlePrevious} className={'justify-self-end'}><ArrowLeftIcon
                    className={'w-4 xs:w-5'}/></Pokedex.KeyboardButton>
                <div
                    className={'text-xs xs:text-sm md:text-base lg:text-lg text-center flex items-center justify-center gap-1.5 text-slate-50'}>
                    {currentPage}/{Math.ceil((total ?? 1) / (pageSize ?? 1))}
                </div>
                <Pokedex.KeyboardButton onClick={handleNext} className={'justify-self-start'}>
                    <ArrowRightIcon className={'w-4 xs:w-5'}/>
                </Pokedex.KeyboardButton>
                <Pokedex.KeyboardButton onClick={toggleFilter}>
                    <FunnelIcon className={'w-4 xs:w-5'}/>
                </Pokedex.KeyboardButton>
                <Pokedex.KeyboardButton onClick={resetFilters}>
                    <ArrowUturnLeftIcon className={'w-4 xs:w-5'}/>
                </Pokedex.KeyboardButton>
            </div>

        </Pokedex.KeyboardButtons>


    </Pokedex>;
};
