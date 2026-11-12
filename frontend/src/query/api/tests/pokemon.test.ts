import {describe, expect, it, vi} from "vitest";
import {normalizePageSize} from "@/query/api/pokemon.ts";
import {getPokemonQueryOptions} from "@/query/keyFactories.ts";
import {prefetchPokemonHelper} from "@/query/helpers/prefetchPokemonHelper.ts";
import {QueryClient} from "@tanstack/react-query";

describe("normalizePageSize and query helpers", () => {
    it("should return DEFAULT_PAGE_SIZE (6) for undefined, null, or empty string", () => {
        expect(normalizePageSize()).toBe(6);
        expect(normalizePageSize(undefined)).toBe(6);
        expect(normalizePageSize(null)).toBe(6);
        expect(normalizePageSize("")).toBe(6);
    });

    it("should accept valid page sizes between 6 and 8", () => {
        expect(normalizePageSize(6)).toBe(6);
        expect(normalizePageSize(7)).toBe(7);
        expect(normalizePageSize(8)).toBe(8);
        expect(normalizePageSize("6")).toBe(6);
        expect(normalizePageSize("7")).toBe(7);
        expect(normalizePageSize("8")).toBe(8);
    });

    it("should clamp / fallback to 6 for invalid or out-of-range inputs", () => {
        expect(normalizePageSize("abc")).toBe(6);
        expect(normalizePageSize("0")).toBe(6);
        expect(normalizePageSize(0)).toBe(6);
        expect(normalizePageSize(-5)).toBe(6);
        expect(normalizePageSize("100")).toBe(6);
        expect(normalizePageSize(100)).toBe(6);
        expect(normalizePageSize(NaN)).toBe(6);
        expect(normalizePageSize("8abc")).toBe(6);
        expect(normalizePageSize(5)).toBe(6);
        expect(normalizePageSize(9)).toBe(6);
    });

    it("should produce identical queryKey in getPokemonQueryOptions regardless of input format", () => {
        const keyDefault = getPokemonQueryOptions(1).queryKey;
        const keyWithInvalidString = getPokemonQueryOptions(1, undefined, undefined, normalizePageSize("invalid")).queryKey;
        const keyWithZero = getPokemonQueryOptions(1, undefined, undefined, normalizePageSize("0")).queryKey;
        const keyWithExplicitSix = getPokemonQueryOptions(1, undefined, undefined, 6).queryKey;

        expect(keyDefault).toEqual(keyWithInvalidString);
        expect(keyDefault).toEqual(keyWithZero);
        expect(keyDefault).toEqual(keyWithExplicitSix);
    });

    it("should call queryClient.fetchQuery with normalized page size in prefetchPokemonHelper", () => {
        const queryClient = new QueryClient();
        const fetchQuerySpy = vi.spyOn(queryClient, "fetchQuery").mockResolvedValue({
            pokemon: [],
            total: 0,
            pageSize: 6
        });

        prefetchPokemonHelper(queryClient, 2, undefined, undefined, normalizePageSize("invalid"));

        expect(fetchQuerySpy).toHaveBeenCalled();
        const calledOptions = fetchQuerySpy.mock.calls[0][0];
        expect(calledOptions.queryKey).toEqual([
            "pokemon",
            {page: 2, pokemonName: undefined, pokemonTypeId: undefined, pageSize: 6}
        ]);
    });
});
