import {useLoaderData, useSearchParams} from "react-router-dom";
import {loader} from "@/loaders/evolutionChain.ts";
import {useQuery, useQueryClient} from "@tanstack/react-query";
import {getEvolutionChainQueryOptions} from "@/query/keyFactories.ts";
import {useEffect, useState} from "react";
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

    const {data} = useQuery({
        ...getEvolutionChainQueryOptions(parseInt(pokemonId)),
        initialData: initialData,
    })

    useEffect(() => {
        if (!data) return;

        const result: Array<Partial<EvolutionChainLink>[]> = [];

        // 1. Walk backwards to root ancestor
        const ancestors: EvolutionChainLink[] = [];
        let curr: EvolutionChainLink | undefined = data.evolvesFrom;
        const visitedAncestors = new Set<number>();
        while (curr && !visitedAncestors.has(curr.pokemonSpeciesId)) {
            visitedAncestors.add(curr.pokemonSpeciesId);
            ancestors.unshift(curr);
            curr = curr.evolvesFrom;
        }

        // Add each ancestor stage
        for (const ancestor of ancestors) {
            const siblings = ancestor.evolvesFrom?.evolvesTo?.filter(s => s.pokemonSpeciesId !== ancestor.pokemonSpeciesId) ?? [];
            if (siblings.length > 0) {
                result.push([ancestor, ...siblings]);
            } else {
                result.push([ancestor]);
            }
        }

        // Add current node and its siblings if any
        const currentSiblings = data.evolvesFrom?.evolvesTo?.filter(s => s.pokemonSpeciesId !== data.pokemonSpeciesId) ?? [];
        if (currentSiblings.length > 0) {
            result.push([data, ...currentSiblings]);
        } else {
            result.push([data]);
        }

        // 2. Walk forwards from evolvesTo
        const walkForward = (chains: Partial<EvolutionChainLink>[]) => {
            if (chains.length === 0) return;
            result.push(chains);
            let nextChains: Partial<EvolutionChainLink>[] = [];
            for (const link of chains) {
                if (link.evolvesTo && link.evolvesTo.length > 0) {
                    nextChains = [...nextChains, ...link.evolvesTo];
                }
            }
            if (nextChains.length > 0) {
                walkForward(nextChains);
            }
        };

        if (data.evolvesTo && data.evolvesTo.length > 0) {
            walkForward(data.evolvesTo);
        }

        setEvolutionChain(result);

        if (data.evolvesTo && data.evolvesTo.length > 0) {
            data.evolvesTo.forEach(e =>
                queryClient.prefetchQuery(getEvolutionChainQueryOptions(e.pokemonSpeciesId))
            );
        }

        if (data.evolvesFrom) {
            queryClient.prefetchQuery(getEvolutionChainQueryOptions(data.evolvesFrom.pokemonSpeciesId));
        }

    }, [data, queryClient]);

    return evolutionChain;
};
