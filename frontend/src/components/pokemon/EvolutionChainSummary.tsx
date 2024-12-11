import {PokemonSpecies} from "../../models/pokemon.ts";
import useAxios from "axios-hooks";
import {EvolutionChainLink, EvolutionDetails} from "../../models/evolution.ts";
import {ReactElement, useCallback, useEffect, useState} from "react";
import {EvolutionChainItem} from "./EvolutionChainItem.tsx";
import {LineTo} from "react-lineto-hooks";
import {EEVEE_EVOLUTIONS} from "../../constants/evolutions.ts";
import {useOutletContext} from "react-router-dom";

export const EvolutionChainSummary = () => {

    const {pokemonSpecies: pokemon} = useOutletContext<{ pokemonSpecies: PokemonSpecies | null }>()

    const [{data, loading, error, response}] = useAxios<EvolutionChainLink>({
        url: pokemon ? `/api/v1/evolution/chain/${EEVEE_EVOLUTIONS.includes(pokemon.id) ? 133 : pokemon.id}` : undefined,
        method: 'GET',
    });

    const [evolutionChain, setEvolutionChain] = useState<Array<Partial<EvolutionChainLink>[]>>([]);
    const [showError, setShowError] = useState(false);

    const walkEvolvesToChain = useCallback((chains: Partial<EvolutionChainLink>[]) => {
        const addToEvolutionChain = (chainElement: Partial<EvolutionChainLink>[]) => {
            setEvolutionChain(prevState => [...prevState, chainElement]);
        };

        const processChains = (chains: Partial<EvolutionChainLink>[]) => {
            if (chains.length === 0) return;

            let nextStageChains: Partial<EvolutionChainLink>[] = [];
            addToEvolutionChain(chains);

            for (const link of chains) {
                if (link.evolvesTo) {
                    nextStageChains = [...nextStageChains, ...link.evolvesTo];
                }
            }

            if (nextStageChains.length > 0) {
                processChains(nextStageChains);
            }
        };

        processChains(chains);
    }, []);

    const walkEvolvesFromChain = useCallback((chain: EvolutionChainLink, visited: Set<number> = new Set()) => {
        if (!chain || visited.has(chain.pokemonSpeciesId)) return;
        visited.add(chain.pokemonSpeciesId);


        const siblings = chain.evolvesFrom && chain.evolvesFrom.evolvesTo ? chain.evolvesFrom.evolvesTo.filter((sibling) => sibling.pokemonSpeciesId !== chain.pokemonSpeciesId) : [];


        if (chain.evolvesFrom) {
            walkEvolvesFromChain(chain.evolvesFrom, visited);
        }

        // Add all siblings to the evolution chain
        if (siblings && siblings.length > 0) {
            setEvolutionChain(prevState => [...prevState, [chain, ...siblings]]);
        } else {
            setEvolutionChain(prevState => [...prevState, [chain]]);
        }


    }, []);

    useEffect(() => {
        if (loading) return;
        if (error) {
            setShowError(true);
            return;
        }
        if (response?.status === 404) {
            setShowError(true);
            return;
        }
        if (data) {
            setEvolutionChain([])
            const visited = new Set<number>();
            if (data.evolvesFrom && !data.evolvesTo) {
                walkEvolvesFromChain(data, visited);
            } else if (data.evolvesFrom && data.evolvesTo) {
                walkEvolvesFromChain(data, visited);
                walkEvolvesToChain(data.evolvesTo);
            } else {
                walkEvolvesToChain([data]);
            }

        }
    }, [loading, data, response, error, walkEvolvesFromChain, walkEvolvesToChain]);

    useEffect(() => {
        if (showError || error) console.error(error);
    }, [showError, error]);

    function getBorderColor(details: EvolutionDetails[] | undefined) {
        if (!details || details.length === 0) return "rgb(148 163 184)"
        else if (details.length > 1) {
            return "rgb(164, 66, 245)"
        } else {
            switch (details[0]?.trigger?.name) {
                case "level-up":
                    return "rgb(148 163 184)"
                case "trade":
                    return "rgb(62, 222, 51)"
                case "use-item":
                    return "rgb(250, 175, 110)"
                case "shed":
                    return "rgb(255, 99, 71)" // tomato
                case "spin":
                    return "rgb(255, 215, 0)" // gold
                case "tower-of-darkness":
                    return "rgb(75, 0, 130)" // indigo
                case "tower-of-waters":
                    return "rgb(30, 144, 255)" // dodgerblue
                case "three-critical-hits":
                    return "rgb(255, 105, 180)" // hotpink
                case "take-damage":
                    return "rgb(220, 20, 60)" // crimson
                case "other":
                    return "rgb(128, 128, 128)" // gray
                case "agile-style-move":
                    return "rgb(144, 238, 144)" // lightgreen
                case "strong-style-move":
                    return "rgb(255, 69, 0)" // orangered
                case "recoil-damage":
                    return "rgb(72, 61, 139)" // darkslateblue
                default:
                    return "rgb(148 163 184)";
            }
        }

    }

    const getChain = useCallback(() => {
        if (!pokemon || !evolutionChain || evolutionChain.length === 0) return null;

        let defaultChain: ReactElement[] | ReactElement;

        if (pokemon && EEVEE_EVOLUTIONS.includes(pokemon.id) && evolutionChain[0] && evolutionChain[0].length > 0 && evolutionChain[0][0].pokemonSpeciesId === 133) {
            defaultChain = (
                <div className="grid grid-cols-3 grid-rows-3 gap-7">
                    <EvolutionChainItem key={evolutionChain[0][0].pokemonSpeciesId}
                                        className="eevee col-start-2 row-start-2"
                                        chainLink={evolutionChain[0][0]}/>
                    {evolutionChain[1].map(link => (
                        <EvolutionChainItem key={link.pokemonSpeciesId}
                                            className={`eevee-${link.pokemonSpeciesId}`}
                                            chainLink={link}/>
                    ))}
                    {evolutionChain[1].map(link => (
                        <LineTo from={"eevee"} to={`eevee-${link.pokemonSpeciesId}`} zIndex={0}
                                borderColor={getBorderColor(link.evolutionDetails)}
                                borderWidth={4}
                                delay={0}/>))}
                </div>
            );
        } else {
            // Building the stages and lines
            const stages = evolutionChain.map((stage, stageIndex) => (
                <div key={`stage_${stageIndex}`} data-testid={"evolution-stage"}
                     className={`flex items-center ${stage.length > 1 ? "justify-evenly" : "justify-center"} w-full`}>
                    {stage.map((link) => (
                        <EvolutionChainItem
                            key={link.pokemonSpeciesId}
                            className={`stage_${stageIndex}_${link.pokemonSpeciesId}`}
                            chainLink={link as EvolutionChainLink}
                        />
                    ))}
                </div>
            ));

            const lines = evolutionChain.flatMap((stage, stageIndex) => {
                if (stageIndex >= evolutionChain.length - 1) {
                    return [];
                }

                return stage.flatMap((link) => {
                    if (!link.evolvesTo) return
                    return link.evolvesTo.map((nextLink, nextLinkIndex) => (
                        <LineTo
                            key={`stage_${nextLinkIndex}_${link.pokemonSpeciesId}_${nextLink.pokemonSpeciesId}`}
                            from={`stage_${stageIndex}_${link.pokemonSpeciesId}`}
                            to={`stage_${stageIndex + 1}_${nextLink.pokemonSpeciesId}`}
                            zIndex={0} borderColor={getBorderColor(nextLink.evolutionDetails)}
                            borderWidth={4}
                            fromAnchor={"bottom center"}
                            toAnchor={"top center"}
                            delay={0}
                            orientation={"v"}
                            stepped
                        />
                    ));
                });
            });

            defaultChain = (
                <>
                    {stages}
                    {lines}
                </>
            );
        }

        return defaultChain;
    }, [pokemon, evolutionChain]);


    return (
        <div className={"flex flex-col items-center justify-evenly gap-6 h-full evolution-container"}>
            {
                getChain()
            }
        </div>
    );
};


