import {PokemonSpecies} from "@/models/pokemon.ts";
import {EvolutionChainLink} from "@/models/evolution.ts";
import {ReactElement, useCallback} from "react";
import {EvolutionChainItem} from "./EvolutionChainItem.tsx";
import {EEVEE_EVOLUTIONS} from "@/constants/evolutions.ts";
import {useOutletContext} from "react-router-dom";
import {useEvolutions} from "@/query/hooks/useEvolutions.ts";

export const EvolutionChainSummary = () => {
    const {pokemonSpecies: pokemon} = useOutletContext<{ pokemonSpecies: PokemonSpecies | null }>();
    const evolutionChain = useEvolutions();

    const getChain = useCallback(() => {
        if (!pokemon || !evolutionChain || evolutionChain.length === 0) return null;

        let defaultChain: ReactElement;

        if (pokemon && EEVEE_EVOLUTIONS.includes(pokemon.id) && evolutionChain[0] && evolutionChain[0].length > 0 && evolutionChain[0][0].pokemonSpeciesId === 133) {
            defaultChain = (
                <div
                    className="relative grid grid-cols-3 grid-rows-3 gap-3 sm:gap-5 p-2 items-center justify-items-center w-full max-w-sm mx-auto">
                    {/* SVG Connector Lines */}
                    <svg aria-hidden="true" role="presentation"
                         className="absolute inset-0 w-full h-full pointer-events-none z-0 stroke-sky-400/60"
                         viewBox="0 0 300 300">
                        <line x1="150" y1="150" x2="50" y2="50" strokeWidth="3" strokeDasharray="4 2"/>
                        <line x1="150" y1="150" x2="150" y2="40" strokeWidth="3" strokeDasharray="4 2"/>
                        <line x1="150" y1="150" x2="250" y2="50" strokeWidth="3" strokeDasharray="4 2"/>
                        <line x1="150" y1="150" x2="40" y2="150" strokeWidth="3" strokeDasharray="4 2"/>
                        <line x1="150" y1="150" x2="260" y2="150" strokeWidth="3" strokeDasharray="4 2"/>
                        <line x1="150" y1="150" x2="50" y2="250" strokeWidth="3" strokeDasharray="4 2"/>
                        <line x1="150" y1="150" x2="150" y2="260" strokeWidth="3" strokeDasharray="4 2"/>
                        <line x1="150" y1="150" x2="250" y2="250" strokeWidth="3" strokeDasharray="4 2"/>
                    </svg>

                    <EvolutionChainItem
                        key={evolutionChain[0][0].pokemonSpeciesId}
                        className="eevee col-start-2 row-start-2 ring-2 ring-amber-400 shadow-lg scale-110"
                        chainLink={evolutionChain[0][0]}
                    />
                    {evolutionChain[1]?.map(link => (
                        <EvolutionChainItem
                            key={link.pokemonSpeciesId}
                            className={`eevee-${link.pokemonSpeciesId}`}
                            chainLink={link}
                        />
                    ))}
                </div>
            );
        } else {
            defaultChain = (
                <div className="flex flex-col items-center justify-center gap-2 sm:gap-4 w-full h-full py-2">
                    {evolutionChain.map((stage, stageIndex) => (
                        <div key={`stage_group_${stageIndex}`} className="flex flex-col items-center w-full">
                            {stageIndex > 0 && (
                                <div className="flex items-center justify-center my-1 text-sky-300">
                                    <svg aria-hidden="true" role="presentation" className="w-6 h-6 animate-pulse"
                                         viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"
                                         strokeLinecap="round" strokeLinejoin="round">
                                        <line x1="12" y1="5" x2="12" y2="19"></line>
                                        <polyline points="19 12 12 19 5 12"></polyline>
                                    </svg>
                                </div>
                            )}
                            <div
                                data-testid={"evolution-stage"}
                                className={`flex items-center ${stage.length > 1 ? "justify-evenly gap-4" : "justify-center"} w-full`}
                            >
                                {stage.map((link) => (
                                    <EvolutionChainItem
                                        key={link.pokemonSpeciesId}
                                        className={`stage_${stageIndex}_${link.pokemonSpeciesId}`}
                                        chainLink={link as EvolutionChainLink}
                                    />
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            );
        }

        return defaultChain;
    }, [pokemon, evolutionChain]);

    return (
        <div className={"flex flex-col items-center justify-center gap-4 h-full w-full evolution-container p-2"}>
            <div className="w-full text-center border-b border-sky-600/40 pb-1 mb-1">
                <span className="text-xs uppercase font-mono tracking-widest text-sky-200">Evolution Line</span>
            </div>
            {getChain()}
        </div>
    );
};


