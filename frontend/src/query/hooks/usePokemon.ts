import {useCallback, useEffect, useState} from "react";
import {useQuery, useQueryClient} from "@tanstack/react-query";
import {QUERY_KEYS} from "@/query/constants.ts";
import {useLoaderData, useSearchParams} from "react-router-dom";
import {loader} from "@/loaders/pokemon.ts";
import {PokemonSpecies} from "@/models/pokemon.ts";
import {getPokemonQueryOptions} from "@/query/keyFactories.ts";
import {prefetchPokemonHelper} from "@/query/helpers/prefetchPokemonHelper.ts";


export const usePokemon = () => {

    const [searchParams, setSearchParams] = useSearchParams();
    const currentPage = Number(searchParams.get("page") ?? "1")
    const pokemonName = searchParams.get("pokemonName") ?? undefined
    const pokemonTypeId = searchParams.get("pokemonTypeId") ?? undefined
    const {pokemonData: initialData} = useLoaderData() as Awaited<
        ReturnType<ReturnType<typeof loader>>>


    const queryClient = useQueryClient()


    const {data = {pokemon: [], total: 0, pageSize: 12}, isFetching} = useQuery({
        ...getPokemonQueryOptions(currentPage, pokemonName, pokemonTypeId),
        initialData: initialData
    })

    const [currentPokemon, setCurrentPokemon] = useState<PokemonSpecies | undefined>(data.pokemon[0])


    const handlePrevious = useCallback(() => {
        if (currentPage === 1) return;
        setSearchParams((params) => {
            params.set("page", (currentPage - 1).toString())
            return params;
        })
    }, [currentPage, setSearchParams]);

    const handleNext = useCallback(() => {
        if (currentPage === Math.ceil(data.total / data.pageSize)) return
        setSearchParams((params) => {
            params.set("page", (currentPage + 1).toString())
            return params;
        })
    }, [currentPage, data.total, data.pageSize, setSearchParams])

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
        if (data.total <= data.pageSize) return;

        if (currentPage < Math.ceil(data.total / data.pageSize)) {
            prefetchPokemonHelper(queryClient, currentPage + 1, pokemonName, pokemonTypeId);
        }


        if (currentPage > 1) {
            prefetchPokemonHelper(queryClient, currentPage - 1, pokemonName, pokemonTypeId);
        }

    }, [queryClient, data.total, data.pageSize, currentPage, pokemonName, pokemonTypeId])

    return {
        pokemon: data.pokemon,
        handleNext,
        handlePrevious,
        currentPage,
        total: data.total,
        pageSize: data.pageSize,
        currentPokemon,
        handlePokemonSelect,
        setSearchParams,
        resetFilters,
        refresh,
        isFetching
    }
}
