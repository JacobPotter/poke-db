import {PokemonSpecies, PokemonVariety} from "../../models/pokemon.ts";
import {capitalize} from "lodash";
import {MouseEventHandler, useState} from "react";
import {SkeletonIcon} from "@/components/ui/Skeletons.tsx";

interface PokemonListItemProps {
    pokemonSpecies: PokemonSpecies;
    active?: boolean;
    onPokemonSelect: (pokemonId: number) => void;
}

export const PokemonListItem = ({
                                    pokemonSpecies,
                                    onPokemonSelect,
                                    active,
                                }: PokemonListItemProps) => {

    const pokemon = (pokemonSpecies.varieties?.[0] as PokemonVariety) || null;
    const [loading, setLoading] = useState(false);

    const handleSelect: MouseEventHandler<HTMLButtonElement> = (e) => {
        e.preventDefault();
        if (pokemonSpecies.id) {
            onPokemonSelect(pokemonSpecies.id);
        } else if (pokemon?.id) {
            onPokemonSelect(pokemon.id);
        } else {
            console.error("No default variety found");
        }
    };

    const formattedId = `#${String(pokemonSpecies.id || pokemon?.id || "").padStart(3, "0")}`;
    const displayName = capitalize(pokemonSpecies.name || pokemon?.name || "");

    return (
        <button
            onClick={handleSelect}
            aria-label={`${displayName} ${formattedId}`}
            className={`group relative flex items-center justify-between p-1.5 sm:p-2 md:p-2.5 rounded-xl transition-colors text-left font-mono w-full ${
                active
                    ? "bg-sky-600 ring-2 ring-amber-400 shadow-[0_0_12px_rgba(251,191,36,0.6)] text-white font-bold"
                    : "bg-sky-700/80 hover:bg-sky-600/90 border border-sky-500/30 text-sky-100 hover:text-white"
            }`}
        >
            <div className="flex flex-col min-w-0 pr-1">
                <span className={`text-[10px] sm:text-xs font-bold ${active ? "text-amber-300" : "text-sky-300"}`}>
                    {formattedId}
                </span>
                <h2 className="text-xs sm:text-sm md:text-base font-bold truncate max-w-[75px] xs:max-w-[100px] sm:max-w-none">
                    {displayName}
                </h2>
            </div>
            <div
                className="relative flex-shrink-0 w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 lg:w-20 lg:h-20 flex items-center justify-center">
                <SkeletonIcon
                    className={`w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 lg:w-20 lg:h-20 ${loading ? "block" : "hidden"}`}
                />
                <img
                    src={pokemon?.sprite_url}
                    alt={displayName}
                    className={`h-full w-full object-contain mx-auto drop-shadow [image-rendering:pixelated] ${
                        loading ? "hidden" : "inline"
                    }`}
                    onLoad={() => setLoading(false)}
                />
            </div>
        </button>
    );
};
