import Pokedex from "../layout/Pokedex.tsx";
import {PokemonList} from "../pokemon/PokemonList.tsx";
import {ChangeEventHandler, useCallback, useEffect, useState} from "react";
import {PokemonSummary} from "../pokemon/PokemonSummary.tsx";
import {PokemonDetails} from "../pokemon/PokemonDetails.tsx";
import {EvolutionChain} from "../pokemon/EvolutionChain.tsx";
import {UnknownTab} from "../ui/UnknownTab.tsx";
import {ArrowLeftIcon, ArrowRightIcon, ArrowUturnLeftIcon, FunnelIcon} from "@heroicons/react/24/outline";
import useAxios from "axios-hooks";
import {Pokemon} from "../../models/pokemon.ts";
import {useNavigate, useParams} from "react-router-dom";
import {useDebounce} from "use-debounce";
import {ListPokemonParams, PokemonResponse} from "../../models/interfaces.ts";
import {FilterForm} from "../pokemon/FilterForm.tsx";


export function PokemonPage() {


    const {id} = useParams();
    const navigate = useNavigate();

    const [searchParams, setSearchParams] = useState<ListPokemonParams | null>(null);
    const [editForm, setEditForm] = useState<boolean>(false);


    const [page, setPage] = useState<number>(1);
    const [pageInput, setPageInput] = useState<number>(1);
    const [pageSize,] = useState<number>(12);

    const [debouncedPage] = useDebounce(pageInput, 500)


    const [tabIndex, setTabIndex] = useState(0);

    const [{data, loading}, refetch] = useAxios<PokemonResponse>(
        {
            url: '/api/v1/pokemon',
            params: {
                page: page,
                pageSize: pageSize,
                ...searchParams,
            }
        }
    )

    const [currentPokemon, setCurrentPokemon] = useState<Pokemon | null>(null);

    const handlePrev = useCallback(() => {

        if (page > 1) {
            refetch({
                url: '/api/v1/pokemon',
                params: {
                    page: page - 1,
                    pageSize: pageSize,
                    ...searchParams,
                }
            })
            setPage(page - 1);
        }

    }, [page, refetch, searchParams])

    const handleNext = useCallback(() => {

        if (data && page < Math.floor(data.total / data.pageSize)) {
            let params = {
                url: '/api/v1/pokemon',
                params: {
                    page: page + 1,
                    pageSize: pageSize,
                    ...searchParams,
                }
            };

            refetch(params)

            setPage(page + 1);
        }

    }, [data, page, searchParams, refetch])


    const handlePokemonSelect = (pokemonId: number) => {
        navigate((pokemonId).toString())
    }

    const handlePageChange: ChangeEventHandler<HTMLInputElement> = e => {
        e.preventDefault()
        setPageInput(parseInt(e.target.value))
    };

    const handleFilterUpdate = (params: ListPokemonParams) => {
        setSearchParams(params)
        setEditForm(false)
    };

    useEffect(() => {
        if (data?.pokemon && id) {
            const pokemonById = data.pokemon.find(pokemon => pokemon.id === parseInt(id))
            if (pokemonById) {
                setCurrentPokemon(pokemonById)
            } else {
                navigate(data.pokemon[0].id.toString())
            }
        }

    }, [data?.pokemon, id]);


    useEffect(() => {
        setPageInput(page)
    }, [page]);

    useEffect(() => {
        setPage(debouncedPage)
    }, [debouncedPage]);

    useEffect(() => {
        if (!searchParams) {
            return
        }

        refetch({
            url: '/api/v1/pokemon',
            params: {
                page: page,
                pageSize: pageSize,
                ...searchParams,
            }
        })

    }, [searchParams, pageSize, page]);


    function toggleFilter() {
        setEditForm(prevState => !prevState);
    }

    const handleReset = () => {
        setPage(1)
        setSearchParams(null)
    };

    return <Pokedex>
        <Pokedex.LeftScreen loading={loading}>
            {tabIndex === 0 ? <PokemonSummary pokemon={currentPokemon}/> : tabIndex === 1 ?
                <PokemonDetails pokemon={currentPokemon}/> : tabIndex === 2 ?
                    <EvolutionChain pokemon={currentPokemon}/> : <UnknownTab/>}
        </Pokedex.LeftScreen>
        <Pokedex.RightScreen size={'large'} loading={loading}>
            {!editForm ? <PokemonList onPokemonSelect={handlePokemonSelect} pokemon={data?.pokemon ?? []}
                                      pokemonId={id}/> : <FilterForm onSubmit={handleFilterUpdate}/>}
        </Pokedex.RightScreen>


        <Pokedex.TabButtons>
            <Pokedex.TabButton pulse={tabIndex === 0} onClick={() => setTabIndex(0)} type={'info'}/>
            <Pokedex.TabButton pulse={tabIndex === 1} onClick={() => setTabIndex(1)} type={'details'}/>
            <Pokedex.TabButton pulse={tabIndex === 2} onClick={() => setTabIndex(2)} type={'other'}/>
            <Pokedex.TabButton onClick={refetch} type={'refresh'}/>
        </Pokedex.TabButtons>

        <Pokedex.KeyboardButtons>
            <div className="grid grid-cols-5 gap-2 items-center justify-center w-full">
                <Pokedex.KeyboardButton onClick={handlePrev} className={'justify-self-end'}><ArrowLeftIcon
                    className={'w-5'}/></Pokedex.KeyboardButton>
                <div
                    className={'text-xs md:text-base lg:text-lg text-center flex items-center justify-center gap-1.5 text-slate-50'}>
                                         <span className={'w-1/3'}><input type={'number'}
                                                                          className={'bg-slate-700 w-full text-center'}
                                                                          value={pageInput}
                                                                          onChange={handlePageChange}/></span> of {Math.floor((data?.total ?? 1) / (data?.pageSize ?? 1))}
                </div>
                <Pokedex.KeyboardButton onClick={handleNext} className={'justify-self-start'}>
                    <ArrowRightIcon className={'w-5'}/>
                </Pokedex.KeyboardButton>
                <Pokedex.KeyboardButton onClick={toggleFilter}>
                    <FunnelIcon className={'w-5'}/>
                </Pokedex.KeyboardButton>
                <Pokedex.KeyboardButton onClick={handleReset}>
                    <ArrowUturnLeftIcon className={'w-5'}/>
                </Pokedex.KeyboardButton>
            </div>

        </Pokedex.KeyboardButtons>


    </Pokedex>;
}