import Pokedex from "../ui/pokedex/Pokedex.tsx";
import {PokemonList} from "../pokemon/PokemonList.tsx";
import {FC, useCallback, useEffect, useState} from "react";
import {ArrowLeftIcon, ArrowRightIcon, ArrowUturnLeftIcon, FunnelIcon} from "@heroicons/react/24/outline";
import useAxios from "axios-hooks";
import {ListPokemonParams, ListPokemonResponse, PokemonSpecies} from "../../models/pokemon.ts";
import {Outlet, useLocation, useNavigate, useParams} from "react-router-dom";
import {FilterForm} from "../pokemon/FilterForm.tsx";
import {ErrorScreen} from "../ui/ErrorScreen.tsx";
import DebouncedInput from "../ui/DebouncedInput.tsx";

type TabName = "summary" | "stats" | "evolutions";

const DEFAULT_PAGE_SIZE = 12;

export const PokemonPage: FC = () => {


    const {id: pokemonId} = useParams();
    const {pathname} = useLocation();


    const [leftScreenOutletName, setLeftScreenOutletName] = useState<TabName>(pathname.split("/")[3] as TabName);
    const navigate = useNavigate();

    const [searchParams, setSearchParams] = useState<ListPokemonParams | null>(null);
    const [editForm, setEditForm] = useState<boolean>(false);


    const [page, setPage] = useState<number>(1);

    const [pageSize,] = useState<number>(DEFAULT_PAGE_SIZE);


    const [{data, loading, error}, refetch] = useAxios<ListPokemonResponse>(
        {
            url: '/api/v1/pokemon',
            params: {
                page: page,
                pageSize: pageSize,
                ...searchParams,
            }
        }
    )

    const [displayedError, setDisplayedError] = useState<Error | null>(error ?? null);

    const [currentPokemon, setCurrentPokemon] = useState<PokemonSpecies | null>(null);


    const handlePrev = useCallback(() => {
        setPage(prevPage => Math.max(prevPage - 1, 1));
    }, []);

    const handleNext = useCallback(() => {
        if (data) {
            setPage(prevPage => Math.min(prevPage + 1, Math.ceil(data.total / data.pageSize)));
        }
    }, [data]);


    const handlePokemonSelect = useCallback((pokemonId: number) => {
        navigate(`${pokemonId}/${leftScreenOutletName ?? 'summary'}`, {relative: "path"});
    }, [leftScreenOutletName, navigate]);

    const handleTabChange = useCallback((tab: string) => {
        navigate(`${pokemonId}/${tab}`, {relative: "path"});
    }, [navigate, pokemonId]);

    const handlePageChange = useCallback((newPage: number) => {
        setPage(newPage);
    }, []);

    const handleFilterUpdate = (params: ListPokemonParams) => {
        setSearchParams(params)
        setEditForm(false)
    };

    const calculatePageFromId = useCallback((pokemonId: string | undefined) => {
        if (!pokemonId) return 1;
        const numericId = parseInt(pokemonId, 10);
        if (numericId < 1) {
            throw new Error(`pokemonId ${numericId} is out of range`);
        }

        return Math.ceil(numericId / (searchParams?.pageSize || DEFAULT_PAGE_SIZE));
    }, [searchParams?.pageSize])

    // Initial page setup based on pokemonId from URL
    useEffect(() => {
        if (pokemonId && !searchParams?.pokemonName && !searchParams?.pokemonTypeId) {
            const pageFromId = calculatePageFromId(pokemonId);
            setPage(pageFromId);

        } else {
            setPage(1)
        }

    }, [calculatePageFromId, pokemonId, searchParams]);

    // Synchronize selected Pokémon on data load
    useEffect(() => {
        if (data && data.pokemon.length > 0 && !loading) {
            const selectedPokemon = data.pokemon.find(pokemon => pokemon.id === parseInt(pokemonId || '', 10));
            if (selectedPokemon) {
                setCurrentPokemon(selectedPokemon);
            } else {
                // if no pokemonId in URL, default to the first Pokémon in the list
                setCurrentPokemon(data.pokemon[0]);
                handlePokemonSelect(data.pokemon[0].id);
            }
        }
    }, [data, pokemonId, loading, handlePokemonSelect]);


    useEffect(() => {
        if (error) setDisplayedError(error)
    }, [error]);


    function toggleFilter() {
        setEditForm(prevState => !prevState);
    }

    const handleReset = () => {
        setPage(1)
        setSearchParams(null)
    };


    return <Pokedex>
        <Pokedex.LeftScreen loading={loading}>
            {!displayedError ? <Outlet context={{pokemonSpecies: currentPokemon}}/> :
                <ErrorScreen error={displayedError}/>}
        </Pokedex.LeftScreen>
        <Pokedex.RightScreen size={'large'} loading={loading}>
            {!editForm ? <PokemonList onPokemonSelect={handlePokemonSelect} pokemon={data?.pokemon ?? []}
                                      pokemonId={pokemonId}/> : <FilterForm onSubmit={handleFilterUpdate}/>}
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
            <Pokedex.TabButton onClick={refetch} type={'refresh'}/>
        </Pokedex.TabButtons>

        <Pokedex.KeyboardButtons>
            <div className="grid grid-cols-5 gap-2 items-center justify-center w-full">
                <Pokedex.KeyboardButton onClick={handlePrev} className={'justify-self-end'}><ArrowLeftIcon
                    className={'w-4 xs:w-5'}/></Pokedex.KeyboardButton>
                <div
                    className={'text-xs xs:text-sm md:text-base lg:text-lg text-center flex items-center justify-center gap-1.5 text-slate-50'}>
                                         <span className={'w-1/3'}>
                                             <DebouncedInput
                                                 className={'bg-slate-700 w-full text-center'}
                                                 value={page}
                                                 onChange={handlePageChange}/>
                                         </span>/{Math.floor((data?.total ?? 1) / (data?.pageSize ?? 1))}
                </div>
                <Pokedex.KeyboardButton onClick={handleNext} className={'justify-self-start'}>
                    <ArrowRightIcon className={'w-4 xs:w-5'}/>
                </Pokedex.KeyboardButton>
                <Pokedex.KeyboardButton onClick={toggleFilter}>
                    <FunnelIcon className={'w-4 xs:w-5'}/>
                </Pokedex.KeyboardButton>
                <Pokedex.KeyboardButton onClick={handleReset}>
                    <ArrowUturnLeftIcon className={'w-4 xs:w-5'}/>
                </Pokedex.KeyboardButton>
            </div>

        </Pokedex.KeyboardButtons>


    </Pokedex>;
};
