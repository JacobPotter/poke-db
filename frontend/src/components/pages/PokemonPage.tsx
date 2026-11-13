import Pokedex from "../ui/pokedex/Pokedex.tsx";
import {PokemonList} from "../pokemon/PokemonList.tsx";
import {PokemonSummary} from "../pokemon/PokemonSummary.tsx";
import {PokemonDetails} from "../pokemon/PokemonDetails.tsx";
import {EvolutionChainSummary} from "../pokemon/EvolutionChainSummary.tsx";
import {FC, useCallback, useEffect, useState} from "react";
import {useLocation, useNavigate, useSearchParams} from "react-router-dom";
import {FilterForm} from "../pokemon/FilterForm.tsx";
import {useQueryClient} from "@tanstack/react-query";
import {usePokemon} from "@/query/hooks/usePokemon.ts";
import {getEvolutionChainQueryOptions} from "@/query/keyFactories.ts";
import {
    ChartPieIcon,
    DocumentTextIcon,
    FunnelIcon
} from "@heroicons/react/24/outline";

type TabName = "summary" | "stats" | "evolutions";
type RadioView = 'stats' | 'evolutions' | 'filter';

const RADIO_VIEWS: RadioView[] = ['stats', 'evolutions', 'filter'];

export const PokemonPage: FC = () => {
    const {pathname} = useLocation();
    const [searchParams] = useSearchParams();
    const queryClient = useQueryClient();

    const currentTab: TabName = (pathname.split("/")[2] as TabName) || 'stats';
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
        refresh,
        isFetching: loading
    } = usePokemon();

    const totalPages = Math.max(1, Math.ceil((total ?? 1) / (pageSize ?? 1)));
    const hasActiveFilters = Boolean(searchParams.get("pokemonName") || searchParams.get("pokemonTypeId"));

    const activeVariety = currentPokemon?.varieties?.[0];

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

    const handleSelectStats = useCallback(() => {
        setEditForm(false);
        if (currentTab !== "stats") {
            handleTabChange("stats");
        }
    }, [currentTab, handleTabChange]);

    const handleSelectEvolutions = useCallback(() => {
        setEditForm(false);
        if (currentTab !== "evolutions") {
            handleTabChange("evolutions");
        }
    }, [currentTab, handleTabChange]);

    const handleSelectFilter = useCallback(() => {
        setEditForm(true);
    }, []);

    const handleRadioKeyDown = useCallback((e: React.KeyboardEvent<HTMLButtonElement>, view: RadioView) => {
        let step = 0;
        if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
            step = 1;
        } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
            step = -1;
        } else {
            return;
        }
        e.preventDefault();

        const nextView = RADIO_VIEWS[(RADIO_VIEWS.indexOf(view) + step + RADIO_VIEWS.length) % RADIO_VIEWS.length];
        if (nextView === 'stats') {
            handleSelectStats();
        } else if (nextView === 'evolutions') {
            handleSelectEvolutions();
        } else {
            setEditForm(true);
        }

        // Focus the radio within the same group so the duplicated responsive trays don't steal focus
        e.currentTarget.closest('[role="radiogroup"]')
            ?.querySelectorAll<HTMLButtonElement>('[role="radio"]')[RADIO_VIEWS.indexOf(nextView)]
            ?.focus();
    }, [handleSelectStats, handleSelectEvolutions]);

    const isFilterSelected = editForm;
    const isStatsSelected = currentTab === "stats" && !editForm;
    const isEvolutionsSelected = currentTab === "evolutions" && !editForm;

    useEffect(() => {
        if (currentPokemon?.id) {
            queryClient.prefetchQuery(getEvolutionChainQueryOptions(currentPokemon.id));
        }
    }, [currentPokemon, queryClient]);

    return (
        <Pokedex onRefresh={refresh} refreshLabel="Refresh Pokemon Data">
            <Pokedex.LeftScreen loading={loading}>
                <PokemonSummary pokemonSpecies={currentPokemon}/>
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
                    if (audio && audio.src) {
                        audio.currentTime = 0;
                        audio.play().catch(() => {
                        });
                    } else if (activeVariety?.cry) {
                        const tempAudio = new Audio(activeVariety.cry);
                        tempAudio.play().catch(() => {
                        });
                    } else {
                        refresh();
                    }
                }}
                blackButtonLabel="Play Cry"
            />

            <Pokedex.RightScreen size={'large'} loading={loading}>
                {!editForm ? (
                    currentTab === 'evolutions' ? (
                        <EvolutionChainSummary
                            pokemonSpecies={currentPokemon}
                            onPokemonSelect={handlePokemonSelect}
                        />
                    ) : (
                        <PokemonDetails pokemon={currentPokemon}/>
                    )
                ) : (
                    <FilterForm onSubmit={() => setEditForm(false)}/>
                )}
            </Pokedex.RightScreen>

            <Pokedex.TabButtons>
                <PokemonList
                    onPokemonSelect={handlePokemonSelect}
                    pokemon={pokemon ?? []}
                    pokemonId={currentPokemon && currentPokemon.id ? currentPokemon.id.toString() : "1"}
                />
            </Pokedex.TabButtons>

            <Pokedex.KeyboardButtons>
                <div className="flex items-center justify-between gap-2 sm:gap-3 md:gap-4 w-full">
                    {/* Left Dual Pill Vents */}
                    <Pokedex.DualPillVents className="hidden sm:flex flex-shrink-0"/>

                    <div
                        role="radiogroup"
                        aria-label="Right screen view selection"
                        className="grid grid-cols-3 gap-1.5 sm:gap-2 md:gap-2.5 flex-1 w-full items-center"
                    >
                        {/* Base Stats View Pill */}
                        <Pokedex.PillButton
                            color="red"
                            size="large"
                            role="radio"
                            selected={isStatsSelected}
                            tabIndex={isStatsSelected ? 0 : -1}
                            onClick={handleSelectStats}
                            onKeyDown={(e) => handleRadioKeyDown(e, 'stats')}
                            ariaLabel="View Base Stats"
                            title="View Base Stats"
                        >
                            <DocumentTextIcon
                                className="w-4 h-4 sm:w-5 sm:h-5 md:w-5.5 md:h-5.5 text-white drop-shadow-sm"/>
                        </Pokedex.PillButton>

                        {/* Evolution Chain View Pill */}
                        <Pokedex.PillButton
                            color="cyan"
                            size="large"
                            role="radio"
                            selected={isEvolutionsSelected}
                            tabIndex={isEvolutionsSelected ? 0 : -1}
                            onClick={handleSelectEvolutions}
                            onKeyDown={(e) => handleRadioKeyDown(e, 'evolutions')}
                            ariaLabel="View Evolution Chain"
                            title="View Evolution Chain"
                        >
                            <ChartPieIcon
                                className="w-4 h-4 sm:w-5 sm:h-5 md:w-5.5 md:h-5.5 text-white drop-shadow-sm"/>
                        </Pokedex.PillButton>

                        {/* Filter Pill Button */}
                        <Pokedex.PillButton
                            color={hasActiveFilters || editForm ? "amber" : "slate"}
                            size="large"
                            role="radio"
                            selected={isFilterSelected}
                            tabIndex={isFilterSelected ? 0 : -1}
                            onClick={handleSelectFilter}
                            onKeyDown={(e) => handleRadioKeyDown(e, 'filter')}
                            ariaLabel="Filter"
                            title="Filter Pokemon"
                            className="relative"
                        >
                            <FunnelIcon
                                className={`w-4 h-4 sm:w-5 sm:h-5 md:w-5.5 md:h-5.5 ${hasActiveFilters || editForm ? 'text-amber-950' : 'text-white'} drop-shadow-sm`}/>
                            {hasActiveFilters && !editForm && (
                                <span
                                    className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-red-500 ring-2 ring-slate-900 animate-pulse"/>
                            )}
                        </Pokedex.PillButton>
                    </div>

                    {/* Right Dual Pill Vents */}
                    <Pokedex.DualPillVents className="hidden sm:flex flex-shrink-0"/>
                </div>
            </Pokedex.KeyboardButtons>
        </Pokedex>
    );
};
