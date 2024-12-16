import {PokemonSpecies} from "../../models/pokemon.ts";
import {capitalize} from "lodash";
import {MouseEventHandler, useState} from "react";
import {SkeletonIcon} from "@/components/ui/Skeletons.tsx";

interface PokemonListItemProps {
    pokemonSpecies: PokemonSpecies,
    active?: boolean,
    onPokemonSelect: (pokemonId: number) => void
}

export const PokemonListItem = ({
                                    pokemonSpecies,
                                    onPokemonSelect,
                                    active,

                                }: PokemonListItemProps) => {


    const pokemon = pokemonSpecies.varieties[0];

    const [loading, setLoading] = useState(false);


    const handleSelect: MouseEventHandler<HTMLButtonElement> = (e) => {
        e.preventDefault();
        if (pokemon) {
            onPokemonSelect(pokemon.id!)
        } else {
            console.error("No default variety found")
        }

    }

    return (<button
        onClick={handleSelect}
        className={`flex items-center justify-between lg:space-x-3 bg-sky-500 sm:px-2 sm:py-1 md:px-3 rounded-lg shadow-lg ${!active ? "opacity-70" : ''}`}>
        <h2 className={'hidden md:block text-xs lg:text-md xl:text-lg font-bold'}>{capitalize(pokemon?.name)}</h2>
        <SkeletonIcon
            className={`h-12 w-12 sm:h-16 sm:w-16 md:h-20 md:w-20 lg:w-24 xl:w-28 ${loading ? "block" : "hidden"}`}/>
        <img src={pokemon?.sprite_url} alt={pokemon?.name}
             className={`h-auto w-12 sm:w-16 md:w-20 lg:w-24 xl:w-28 mx-auto ${loading ? "hidden" : "inline"}`}
             onLoad={() => setLoading(false)}
        />
    </button>)
}
