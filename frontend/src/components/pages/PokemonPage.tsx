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

    const handlePrevPokemon = useCallback(() => {
        if (pokemon && pokemon.length > 0) {
            const currentIndex = pokemon.findIndex(p => p.id === currentPokemon?.id);
            if (currentIndex > 0) {
                handlePokemonSelect(pokemon[currentIndex - 1].id);
            } else if (currentPage > 1) {
                handlePrevious();
            }
        }
    }, [pokemon, currentPokemon, currentPage, handlePokemonSelect, handlePrevious]);

    const handleNextPokemon = useCallback(() => {
        if (pokemon && pokemon.length > 0) {
            const currentIndex = pokemon.findIndex(p => p.id === currentPokemon?.id);
            if (currentIndex >= 0 && currentIndex < pokemon.length - 1) {
                handlePokemonSelect(pokemon[currentIndex + 1].id);
            } else if (currentPage < totalPages) {
                handleNext();
            }
        }
    }, [pokemon, currentPokemon, currentPage, totalPages, handlePokemonSelect, handleNext]);

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

            <Pokedex.LeftControls
                dpad={{
                    onLeft: handlePrevPokemon,
                    onRight: handleNextPokemon,
                    onUp: handlePrevious,
                    onDown: handleNext,
                    disabled: loading
                }}
                statusText={currentPokemon?.id ? `#${String(currentPokemon.id).padStart(3, '0')} ${currentPokemon.name?.toUpperCase()}` : "READY"}
                statusLabel="Active Pokemon"
                onBlackButtonClick={() => {
                    const audio = document.querySelector('audio');
                    if (audio) {
                        audio.currentTime = 0;
                        audio.play().catch(() => {
                        });
                    } else {
                        refresh();
                    }
                }}
                blackButtonLabel="Play Cry"
                onRedPillClick={resetFilters}
                redPillLabel="Reset Filters"
                onCyanPillClick={toggleFilter}
                cyanPillLabel={editForm ? "Close Filter" : "Open Filter"}
            />

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
                <div className="flex items-center justify-between gap-1.5 sm:gap-2.5 w-full">
                    {/* Dual Horizontal Dark Pill Vents */}
                    <Pokedex.DualPillVents className="hidden sm:flex flex-shrink-0"/>

                    {/* Previous Page Button (Silver Square) */}
                    <Pokedex.KeyboardButton
                        onClick={handlePrevious}
                        disabled={currentPage <= 1}
                        ariaLabel="Previous Page"
                        variant="silver"
                        className={'flex-1 max-w-[64px] sm:max-w-[72px]'}
                    >
                        <ArrowLeftIcon className={'w-4 h-4 sm:w-5 sm:h-5'}/>
                    </Pokedex.KeyboardButton>

                    {/* Page Readout LCD Matrix Indicator */}
                    <div
                        className={'px-2 py-1 rounded bg-slate-950 border border-slate-700/80 shadow-inner text-xs sm:text-sm font-mono font-bold text-center flex items-center justify-center gap-1 text-slate-100 min-w-[50px] select-none'}>
                        <span>{currentPage}</span>
                        <span className="text-slate-400">/</span>
                        <span>{totalPages}</span>
                    </div>

                    {/* Next Page Button (Silver Square) */}
                    <Pokedex.KeyboardButton
                        onClick={handleNext}
                        disabled={currentPage >= totalPages}
                        ariaLabel="Next Page"
                        variant="silver"
                        className={'flex-1 max-w-[64px] sm:max-w-[72px]'}
                    >
                        <ArrowRightIcon className={'w-4 h-4 sm:w-5 sm:h-5'}/>
                    </Pokedex.KeyboardButton>

                    {/* Circular Yellow Action / Filter Dial */}
                    <Pokedex.KeyboardButton
                        onClick={toggleFilter}
                        ariaLabel={editForm ? "Close Filter" : "Open Filter"}
                        variant="dial"
                        className="flex-shrink-0"
                    >
                        <div className="relative flex items-center justify-center">
                            <FunnelIcon className={'w-4 h-4 sm:w-5 sm:h-5'}/>
                            {hasActiveFilters && (
                                <span
                                    className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-red-600 ring-1 ring-slate-900 animate-pulse"></span>
                            )}
                        </div>
                    </Pokedex.KeyboardButton>

                    {/* Reset Filter Button (Silver Square) */}
                    <Pokedex.KeyboardButton
                        onClick={resetFilters}
                        disabled={!hasActiveFilters}
                        ariaLabel="Reset Filters"
                        variant="silver"
                        className="flex-1 max-w-[64px] sm:max-w-[72px]"
                    >
                        <ArrowUturnLeftIcon className={'w-4 h-4 sm:w-5 sm:h-5'}/>
                    </Pokedex.KeyboardButton>
                </div>
            </Pokedex.KeyboardButtons>
        </Pokedex>
    );
};
