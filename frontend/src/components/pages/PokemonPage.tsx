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
    const [searchParams] = useSearchParams();
    const queryClient = useQueryClient();

    const currentTab: TabName = (pathname.split("/")[2] as TabName) || 'summary';
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
    } = usePokemon();

    const totalPages = Math.max(1, Math.ceil((total ?? 1) / (pageSize ?? 1)));
    const hasActiveFilters = Boolean(searchParams.get("pokemonName") || searchParams.get("pokemonTypeId"));

    const handleTabChange = useCallback((tabName: string) => {
        navigate({pathname: `/pokemon/${tabName}`, search: `?${searchParams.toString()}`});
    }, [navigate, searchParams]);

    function toggleFilter() {
        setEditForm(prevState => !prevState);
    }

    useEffect(() => {
        if (currentPokemon?.id) {
            queryClient.prefetchQuery(getEvolutionChainQueryOptions(currentPokemon.id));
        }
    }, [currentPokemon, queryClient]);

    return (
        <Pokedex>
            <Pokedex.LeftScreen loading={loading}>
                <Outlet context={{pokemonSpecies: currentPokemon}}/>
            </Pokedex.LeftScreen>

            <Pokedex.RightScreen size={'large'} loading={loading}>
                {!editForm ? (
                    <PokemonList
                        onPokemonSelect={handlePokemonSelect}
                        pokemon={pokemon ?? []}
                        pokemonId={currentPokemon && currentPokemon.id ? currentPokemon.id.toString() : "1"}
                    />
                ) : (
                    <FilterForm onSubmit={() => setEditForm(false)}/>
                )}
            </Pokedex.RightScreen>

            <Pokedex.TabButtons>
                <Pokedex.TabButton
                    pulse={currentTab === 'summary'}
                    onClick={() => handleTabChange('summary')}
                    type={'info'}
                    label="Pokemon Summary"
                />
                <Pokedex.TabButton
                    pulse={currentTab === 'stats'}
                    onClick={() => handleTabChange('stats')}
                    type={'details'}
                    label="Pokemon Base Stats"
                />
                <Pokedex.TabButton
                    pulse={currentTab === 'evolutions'}
                    onClick={() => handleTabChange('evolutions')}
                    type={'other'}
                    label="Evolution Chain"
                />
                <Pokedex.TabButton
                    type={'refresh'}
                    onClick={() => refresh()}
                    label="Refresh Pokemon Data"
                />
            </Pokedex.TabButtons>

            <Pokedex.KeyboardButtons>
                <div className="grid grid-cols-5 gap-1.5 sm:gap-2 items-center justify-center w-full">
                    <Pokedex.KeyboardButton
                        onClick={handlePrevious}
                        disabled={currentPage <= 1}
                        ariaLabel="Previous Page"
                        className={'justify-self-end w-full'}
                    >
                        <ArrowLeftIcon className={'w-4 h-4 sm:w-5 sm:h-5'}/>
                    </Pokedex.KeyboardButton>

                    <div
                        className={'text-xs sm:text-sm md:text-base font-mono font-bold text-center flex items-center justify-center gap-1 text-slate-100 select-none'}>
                        <span>{currentPage}</span>
                        <span className="text-slate-400">/</span>
                        <span>{totalPages}</span>
                    </div>

                    <Pokedex.KeyboardButton
                        onClick={handleNext}
                        disabled={currentPage >= totalPages}
                        ariaLabel="Next Page"
                        className={'justify-self-start w-full'}
                    >
                        <ArrowRightIcon className={'w-4 h-4 sm:w-5 sm:h-5'}/>
                    </Pokedex.KeyboardButton>

                    <Pokedex.KeyboardButton
                        onClick={toggleFilter}
                        ariaLabel={editForm ? "Close Filter" : "Open Filter"}
                        className="w-full relative"
                    >
                        <div className="relative flex items-center justify-center">
                            <FunnelIcon className={'w-4 h-4 sm:w-5 sm:h-5'}/>
                            {hasActiveFilters && (
                                <span
                                    className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-amber-400 ring-1 ring-slate-900"></span>
                            )}
                        </div>
                    </Pokedex.KeyboardButton>

                    <Pokedex.KeyboardButton
                        onClick={resetFilters}
                        disabled={!hasActiveFilters}
                        ariaLabel="Reset Filters"
                        className="w-full"
                    >
                        <ArrowUturnLeftIcon className={'w-4 h-4 sm:w-5 sm:h-5'}/>
                    </Pokedex.KeyboardButton>
                </div>
            </Pokedex.KeyboardButtons>
        </Pokedex>
    );
};
