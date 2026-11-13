import {PokemonSpecies} from "@/models/pokemon.ts";
import {EvolutionChainLink} from "@/models/evolution.ts";
import {ReactElement, useCallback} from "react";
import {EvolutionChainItem} from "./EvolutionChainItem.tsx";
import {EEVEE_EVOLUTIONS} from "@/constants/evolutions.ts";
import {useOutletContext} from "react-router-dom";
import {useEvolutions} from "@/query/hooks/useEvolutions.ts";

export interface EvolutionChainSummaryProps {
    pokemonSpecies?: PokemonSpecies | null;
    onPokemonSelect?: (pokemonId: number) => void;
}

export const EvolutionChainSummary = ({
                                          pokemonSpecies: propPokemon,
                                          onPokemonSelect
                                      }: EvolutionChainSummaryProps = {}) => {
    const context = useOutletContext<{ pokemonSpecies: PokemonSpecies | null } | undefined>();
    const pokemon = propPokemon !== undefined ? propPokemon : context?.pokemonSpecies;
    const evolutionChain = useEvolutions();

    const getChain = useCallback(() => {
        if (!pokemon || !evolutionChain || evolutionChain.length === 0) {
            return (
                <div className="flex flex-col items-center justify-center h-full text-center p-4">
                    <p className="text-sky-200 font-mono text-xs">No evolution data available</p>
                </div>
            );
        }

        let defaultChain: ReactElement;

        // Multi-branch special case: Eevee and its 8 evolutions
        if (
            pokemon &&
            EEVEE_EVOLUTIONS.includes(pokemon.id) &&
            evolutionChain[0] &&
            evolutionChain[0].length > 0 &&
            evolutionChain[0][0].pokemonSpeciesId === 133
        ) {
            const eeveeBase = evolutionChain[0][0];
            const eeveeBranches = evolutionChain[1] ?? [];

            defaultChain = (
                <div className="flex flex-col items-center justify-between w-full h-full gap-2 p-1">
                    {/* Eevee Base Form Stage */}
                    <div
                        data-testid="evolution-stage"
                        className="flex flex-col items-center justify-center w-full"
                    >
                        <span className="text-[10px] font-mono font-bold text-amber-300 uppercase tracking-wider mb-1">
                            Base Stage
                        </span>
                        <EvolutionChainItem
                            key={eeveeBase.pokemonSpeciesId}
                            className={`eevee ${
                                pokemon.id === eeveeBase.pokemonSpeciesId
                                    ? "ring-2 ring-amber-400 shadow-[0_0_12px_rgba(251,191,36,0.6)]"
                                    : ""
                            }`}
                            chainLink={eeveeBase}
                            isActive={pokemon.id === eeveeBase.pokemonSpeciesId}
                            onSelect={onPokemonSelect}
                            compact={true}
                        />
                    </div>

                    {/* Downward Branching Chevrons Indicator */}
                    <div className="flex items-center justify-center gap-1 text-sky-400/80 my-0.5">
                        <span className="text-[10px] font-mono font-bold tracking-widest uppercase text-sky-300">
                            ▼ 8 Evolution Branches ▼
                        </span>
                    </div>

                    {/* Eevee 8-Branch Matrix Grid (4 columns x 2 rows) */}
                    <div
                        data-testid="evolution-stage"
                        className="grid grid-cols-4 gap-1.5 sm:gap-2 w-full max-w-md items-center justify-items-center"
                    >
                        {eeveeBranches.map((link) => (
                            <EvolutionChainItem
                                key={link.pokemonSpeciesId}
                                className={`eevee-${link.pokemonSpeciesId} w-full`}
                                chainLink={link}
                                isActive={pokemon.id === link.pokemonSpeciesId}
                                onSelect={onPokemonSelect}
                                compact={true}
                            />
                        ))}
                    </div>
                </div>
            );
        } else {
            // Standard 1, 2, or 3-Stage Evolution Pipeline (Horizontal Left-to-Right Flow)
            defaultChain = (
                <div
                    className="flex flex-row items-center justify-evenly gap-1.5 sm:gap-2 md:gap-3 w-full h-full py-2 px-1 overflow-x-auto min-h-0">
                    {evolutionChain.map((stage, stageIndex) => (
                        <div
                            key={`stage_group_${stageIndex}`}
                            className="flex flex-row items-center justify-center gap-1.5 sm:gap-2 md:gap-3 shrink-0"
                        >
                            {/* Horizontal Neon Stage Connector Chevrons */}
                            {stageIndex > 0 && (
                                <div className="flex flex-col items-center justify-center px-0.5 text-sky-300">
                                    <svg
                                        aria-hidden="true"
                                        role="presentation"
                                        className="w-5 h-5 sm:w-6 sm:h-6 animate-pulse text-amber-400 drop-shadow-[0_0_6px_rgba(251,191,36,0.6)]"
                                        viewBox="0 0 24 24"
                                        fill="none"
                                        stroke="currentColor"
                                        strokeWidth="3"
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                    >
                                        <polyline points="9 18 15 12 9 6"></polyline>
                                    </svg>
                                </div>
                            )}

                            {/* Stage Container */}
                            <div
                                data-testid="evolution-stage"
                                className={`flex ${
                                    stage.length > 1
                                        ? "flex-col justify-center gap-2"
                                        : "flex-col items-center justify-center"
                                }`}
                            >
                                <span
                                    className="text-[9px] sm:text-[10px] font-mono font-bold text-sky-300/80 uppercase tracking-wider mb-1 text-center">
                                    Stage {stageIndex + 1}
                                </span>
                                <div
                                    className={`flex ${
                                        stage.length > 1
                                            ? "flex-col gap-2 items-center"
                                            : "items-center justify-center"
                                    }`}
                                >
                                    {stage.map((link) => {
                                        const isCurrent =
                                            pokemon.id === link.pokemonSpeciesId ||
                                            pokemon.id === link.pokemonSpecies?.id;
                                        return (
                                            <EvolutionChainItem
                                                key={link.pokemonSpeciesId}
                                                className={`stage_${stageIndex}_${link.pokemonSpeciesId}`}
                                                chainLink={link as EvolutionChainLink}
                                                isActive={isCurrent}
                                                onSelect={onPokemonSelect}
                                                compact={stage.length > 1}
                                            />
                                        );
                                    })}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            );
        }

        return defaultChain;
    }, [pokemon, evolutionChain, onPokemonSelect]);

    return (
        <section
            className="flex flex-col justify-between h-full w-full font-mono text-sky-50 p-1 sm:p-2 min-h-0 evolution-container">
            {/* Screen Header */}
            <div className="border-b border-sky-600/50 pb-1.5 mb-1.5 flex items-center justify-between shrink-0">
                <div className="flex items-center gap-2">
                    <div
                        className="w-2.5 h-2.5 rounded-full bg-cyan-400 border border-cyan-200 shadow-[0_0_8px_rgba(34,211,238,0.8)] animate-pulse"></div>
                    <h1 className="text-sm sm:text-base font-extrabold uppercase tracking-wider text-white">
                        Evolution Line
                    </h1>
                </div>
                {evolutionChain && evolutionChain.length > 0 && (
                    <span
                        className="text-[10px] sm:text-[11px] font-mono text-sky-300 font-semibold px-2 py-0.5 rounded-full bg-sky-900/60 border border-sky-700/50">
                        {evolutionChain.reduce((sum, stage) => sum + stage.length, 0)} Species
                    </span>
                )}
            </div>

            {/* Evolution Flow Canvas */}
            <div
                className="flex-grow flex items-center justify-center min-h-0 overflow-y-auto overflow-x-hidden w-full">
                {getChain()}
            </div>
        </section>
    );
};
