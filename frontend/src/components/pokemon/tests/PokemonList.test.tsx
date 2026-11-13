import {describe, expect, it, vi} from "vitest";
import {PokemonList} from "../PokemonList.tsx";
import {render} from "vitest-browser-react";
import pokemon_page_1 from '@/test/fixtures/pokemon_page_1.json';

describe("PokemonList", () => {
    it("renders responsive 6-card grid with responsive grid classes (grid-cols-3, md:grid-cols-6, lg:grid-cols-6)", () => {
        const mockPokemonSelect = vi.fn();
        const items = pokemon_page_1.pokemon.slice(0, 6);
        const {getByRole, container} = render(
            <PokemonList
                pokemon={items}
                pokemonId={"3"}
                onPokemonSelect={mockPokemonSelect}
            />
        );

        const buttons = getByRole("button");
        expect(buttons.all()).toHaveLength(6);

        const grid = container.querySelector(".grid");
        expect(grid).toBeTruthy();
        expect(grid?.className).toContain("grid-cols-3");
        expect(grid?.className).toContain("md:grid-cols-6");
        expect(grid?.className).toContain("lg:grid-cols-6");
    });

    it("renders mobile single-row 3-card grid with 3 items", () => {
        const mockPokemonSelect = vi.fn();
        const items = pokemon_page_1.pokemon.slice(0, 3);
        const {getByRole, container} = render(
            <PokemonList
                pokemon={items}
                pokemonId={"1"}
                onPokemonSelect={mockPokemonSelect}
            />
        );

        const buttons = getByRole("button");
        expect(buttons.all()).toHaveLength(3);

        const grid = container.querySelector(".grid");
        expect(grid).toBeTruthy();
        expect(grid?.className).toContain("grid-cols-3");
    });

    it("highlights the active pokemon item", () => {
        const mockPokemonSelect = vi.fn();
        const items = pokemon_page_1.pokemon.slice(0, 6);
        const {getByRole} = render(
            <PokemonList
                pokemon={items}
                pokemonId={"1"}
                onPokemonSelect={mockPokemonSelect}
            />
        );

        const activeItem = getByRole("button", {name: "Bulbasaur #001"});
        expect(activeItem.element().className).toContain("ring-amber-400");
    });
});
