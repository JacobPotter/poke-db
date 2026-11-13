import React from "react";
import {PokemonSpecies} from "@/models/pokemon.ts";
import {PokemonListItem} from "./PokemonListItem.tsx";

export interface PokemonListProps {
    pokemon: PokemonSpecies[];
    pokemonId: string | undefined;
    onPokemonSelect: (pokemonId: number) => void;
    className?: string;
}

export const PokemonList: React.FC<PokemonListProps> = ({pokemon, pokemonId, onPokemonSelect, className = ""}) => {
    return (
        <div
            className={`grid grid-cols-3 md:grid-cols-6 lg:grid-cols-6 gap-1 sm:gap-1.5 md:gap-1.5 p-0.5 sm:p-1 w-full h-full items-stretch content-center ${className}`}>
            {pokemon.map((p, index) => {
                const isActive = pokemonId ? p.id === parseInt(pokemonId, 10) : index === 0;
                return (
                    <PokemonListItem
                        onPokemonSelect={onPokemonSelect}
                        key={`${p.name}_${p.id}_list_item`}
                        active={isActive}
                        pokemonSpecies={p}
                    />
                );
            })}
        </div>
    );
};
