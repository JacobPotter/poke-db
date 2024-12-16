import {useLoaderData, useSearchParams} from "react-router-dom";
import {loader} from "@/loaders/evolutionChain.ts";
import {useQuery, useQueryClient} from "@tanstack/react-query";
import {getEvolutionChainQueryOptions} from "@/query/keyFactories.ts";
import {useCallback, useEffect, useState} from "react";
import {EvolutionChainLink} from "@/models/evolution.ts";
import {EEVEE_EVOLUTIONS} from "@/constants/evolutions.ts";

export const useEvolutions = () => {

    const [searchParams] = useSearchParams()

    let pokemonId = searchParams.get("pokemonId") ?? "1"

    if (EEVEE_EVOLUTIONS.includes(parseInt(pokemonId))) {
        pokemonId = "133"
    }

    const initialData = useLoaderData() as Awaited<
        ReturnType<ReturnType<typeof loader>>>


    const [evolutionChain, setEvolutionChain] = useState<Array<Partial<EvolutionChainLink>[]>>([]);

    const queryClient = useQueryClient()

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

    const {data} = useQuery({
        ...getEvolutionChainQueryOptions(parseInt(pokemonId)),
        initialData: initialData,
    })

    useEffect(() => {
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

            if (data.evolvesTo && data.evolvesTo.length > 0) {
                data.evolvesTo.forEach(e =>
                    queryClient.prefetchQuery(getEvolutionChainQueryOptions(e.pokemonSpeciesId))
                )
            }

            if (data.evolvesFrom) {
                queryClient.prefetchQuery(getEvolutionChainQueryOptions(data.evolvesFrom.pokemonSpeciesId))
            }

        }
    }, [data, queryClient, walkEvolvesFromChain, walkEvolvesToChain]);


    return evolutionChain

}
