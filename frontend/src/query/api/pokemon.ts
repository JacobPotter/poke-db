import axios from "axios";
import {ListPokemonResponse} from "@/models/pokemon.ts";

export const DEFAULT_PAGE_SIZE = 6;
export const MIN_PAGE_SIZE = 6;
export const MAX_PAGE_SIZE = 8;

/**
 * Normalizes/clamps page size from arbitrary query parameter strings or numbers.
 * Ensures invalid numbers, NaNs, <=0, or oversized values fall back safely to DEFAULT_PAGE_SIZE (or clamped to 6-8).
 */
export function normalizePageSize(pageSizeParam?: string | number | null): number {
    if (pageSizeParam === undefined || pageSizeParam === null || pageSizeParam === "") {
        return DEFAULT_PAGE_SIZE;
    }
    const num = typeof pageSizeParam === "number" ? pageSizeParam : Number(pageSizeParam);
    if (!Number.isInteger(num) || num < MIN_PAGE_SIZE || num > MAX_PAGE_SIZE) {
        return DEFAULT_PAGE_SIZE;
    }
    return num;
}

export const getPokemon = async (
    page: number,
    pokemonName?: string,
    pokemonTypeId?: string,
    pageSize: number = DEFAULT_PAGE_SIZE
) => {
    const validatedPageSize = normalizePageSize(pageSize);
    const {data} = await axios.get<ListPokemonResponse>(`/api/v1/pokemon`, {
        params: {
            page,
            pokemonName,
            pokemonTypeId,
            pageSize: validatedPageSize
        }
    });

    return {
        pokemon: data?.pokemon ?? [],
        total: (data?.total && data.total >= 0) ? data.total : 0,
        pageSize: (data?.pageSize && data.pageSize > 0) ? data.pageSize : validatedPageSize,
        pokemonName: data?.params?.pokemonName,
        pokemonTypeId: data?.params?.pokemonTypeId
    };
};
