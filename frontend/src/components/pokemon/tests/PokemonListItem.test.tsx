import {describe, expect, it, vi} from "vitest";
import {render} from "vitest-browser-react";
import {PokemonListItem} from "../PokemonListItem.tsx";
import pokemon_page_1 from '@/test/fixtures/pokemon_page_1.json';
import {PokemonSpecies} from "@/models/pokemon.ts";

describe("PokemonListItem", () => {
    const mockPokemonSelect = vi.fn();

    it("should render square sprite-only card with accessible tooltip attributes", () => {
        const {getByRole} = render(
            <PokemonListItem
                pokemonSpecies={pokemon_page_1.pokemon[0]}
                onPokemonSelect={mockPokemonSelect}
            />
        );

        const button = getByRole("button", {name: "Bulbasaur #001"});
        expect(button).toBeTruthy();
        expect(button.element().getAttribute("title")).toBe("Bulbasaur #001");
        expect(button.element().className).toContain("aspect-square");

        const img = getByRole("img");
        expect(img).toBeTruthy();
        expect(img.element().getAttribute("alt")).toBe("Bulbasaur");
    });

    it("should apply active ring and glowing highlight with active prop", () => {
        const {getByRole} = render(
            <PokemonListItem
                pokemonSpecies={pokemon_page_1.pokemon[0]}
                active={true}
                onPokemonSelect={mockPokemonSelect}
            />
        );

        const button = getByRole("button");
        expect(button.element().className).toContain("ring-amber-400");
        expect(button.element().className).toContain("bg-sky-700/80");
    });

    it("should pass pokemon id when clicked", async () => {
        const {getByRole} = render(
            <PokemonListItem
                pokemonSpecies={pokemon_page_1.pokemon[0]}
                onPokemonSelect={mockPokemonSelect}
            />
        );

        const button = getByRole("button");
        await button.click();

        expect(mockPokemonSelect).toHaveBeenCalledWith(1);
    });

    it("should render accessible fallback without visible text when sprite URL is missing", () => {
        const noSpriteSpecies: PokemonSpecies = {
            ...pokemon_page_1.pokemon[0],
            id: 999,
            name: "missingno",
            varieties: [
                {
                    ...pokemon_page_1.pokemon[0].varieties[0],
                    id: 999,
                    name: "missingno",
                    sprite_url: ""
                }
            ]
        };

        const {getByRole, getByTestId, container} = render(
            <PokemonListItem
                pokemonSpecies={noSpriteSpecies}
                onPokemonSelect={mockPokemonSelect}
            />
        );

        const button = getByRole("button", {name: "Missingno #999"});
        expect(button).toBeTruthy();
        expect(button.element().getAttribute("title")).toBe("Missingno #999");
        expect(getByTestId("pokemon-fallback-icon")).toBeTruthy();
        expect(container.textContent).not.toContain("#999");
        expect(container.textContent).not.toContain("Missingno");
        expect(button.element().textContent?.trim()).toBe("");
    });

    it("should display fallback icon with no visible text when img triggers onError", () => {
        const {getByRole, getByTestId, container} = render(
            <PokemonListItem
                pokemonSpecies={pokemon_page_1.pokemon[0]}
                onPokemonSelect={mockPokemonSelect}
            />
        );

        const img = getByRole("img");
        expect(img).toBeTruthy();

        // Trigger onError event on the image
        img.element().dispatchEvent(new Event("error"));

        expect(getByTestId("pokemon-fallback-icon")).toBeTruthy();
        expect(container.textContent).not.toContain("#001");
        expect(container.textContent).not.toContain("Bulbasaur");
        const button = getByRole("button", {name: "Bulbasaur #001"});
        expect(button.element().textContent?.trim()).toBe("");
    });
});
