import {useCallback, useEffect, useState} from "react";
import {useQuery, useQueryClient} from "@tanstack/react-query";
import {QUERY_KEYS} from "@/query/constants.ts";
import {useLoaderData, useSearchParams} from "react-router-dom";
import {loader} from "@/loaders/pokemon.ts";
import {PokemonSpecies} from "@/models/pokemon.ts";
import {getPokemonQueryOptions} from "@/query/keyFactories.ts";
import {prefetchPokemonHelper} from "@/query/helpers/prefetchPokemonHelper.ts";
import {DEFAULT_PAGE_SIZE, normalizePageSize} from "@/query/api/pokemon.ts";


export const usePokemon = () => {

    const [searchParams, setSearchParams] = useSearchParams();
    const currentPage = Math.max(1, parseInt(searchParams.get("page") ?? "1", 10) || 1);
    const pokemonName = searchParams.get("pokemonName") ?? undefined
    const pokemonTypeId = searchParams.get("pokemonTypeId") ?? undefined
    const pageSize = normalizePageSize(searchParams.get("pageSize"))
    const loaderData = useLoaderData() as Awaited<
        ReturnType<ReturnType<typeof loader>>> | undefined
    const initialData = loaderData?.pokemonData


    const queryClient = useQueryClient()


    const {data = {pokemon: [], total: 0, pageSize: DEFAULT_PAGE_SIZE}, isFetching} = useQuery({
        ...getPokemonQueryOptions(currentPage, pokemonName, pokemonTypeId, pageSize),
        initialData: initialData
    })

    const effectivePageSize = normalizePageSize(data.pageSize || pageSize);
    const totalPages = Math.max(1, Math.ceil((data.total || 0) / effectivePageSize));

    const [currentPokemon, setCurrentPokemon] = useState<PokemonSpecies | undefined>(data.pokemon[0])


    const handlePrevious = useCallback(() => {
        if (currentPage <= 1) return;
        setSearchParams((params) => {
            params.set("page", (currentPage - 1).toString())
            return params;
        })
    }, [currentPage, setSearchParams]);

    const handleNext = useCallback(() => {
        if (currentPage >= totalPages) return
        setSearchParams((params) => {
            params.set("page", (currentPage + 1).toString())
            return params;
        })
    }, [currentPage, totalPages, setSearchParams])

    const handlePokemonSelect = (pokemonId: number) => {
        const pokemon = data.pokemon.find(p => p.id === pokemonId) ?? data.pokemon[0]
        setCurrentPokemon(pokemon)
    };

    const resetFilters = () => {
        setSearchParams(params => {
            params.set("page", "1")
            params.delete("pokemonName")
            params.delete("pokemonTypeId")
            params.delete("pokemonId")
            return params;
        })
        queryClient.invalidateQueries({queryKey: [QUERY_KEYS.pokemon]})
    }


    const refresh = () => {
        queryClient.invalidateQueries({queryKey: [QUERY_KEYS.pokemon]})
    }

    useEffect(() => {
        if (currentPokemon && data.pokemon.find(p => p.id === currentPokemon.id)) {
            setSearchParams((params) => {
                params.set("pokemonId", currentPokemon.id.toString())
                return params
            })
        } else {
            setCurrentPokemon(data.pokemon[0])
        }

    }, [currentPokemon, data.pokemon, setSearchParams]);

    useEffect(() => {
        if (data.total === 0) return;
        if (data.total <= effectivePageSize) return;

        if (currentPage < totalPages) {
            prefetchPokemonHelper(queryClient, currentPage + 1, pokemonName, pokemonTypeId, effectivePageSize);
        }

        if (currentPage > 1) {
            prefetchPokemonHelper(queryClient, currentPage - 1, pokemonName, pokemonTypeId, effectivePageSize);
        }

    }, [queryClient, data.total, effectivePageSize, totalPages, currentPage, pokemonName, pokemonTypeId])

    return {
        pokemon: data.pokemon,
        handleNext,
        handlePrevious,
        currentPage,
        total: data.total,
        pageSize: effectivePageSize,
        totalPages,
        currentPokemon,
        handlePokemonSelect,
        setSearchParams,
        resetFilters,
        refresh,
        isFetching
    }
}
