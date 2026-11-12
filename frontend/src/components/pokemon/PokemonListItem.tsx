import {PokemonSpecies, PokemonVariety} from "@/models/pokemon.ts";
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

    const pokemon = (pokemonSpecies?.varieties?.[0] as PokemonVariety) || null;
    const [loading, setLoading] = useState(false);
    const [imageError, setImageError] = useState(false);

    const handleSelect: MouseEventHandler<HTMLButtonElement> = (e) => {
        e.preventDefault();
        if (pokemonSpecies?.id) {
            onPokemonSelect(pokemonSpecies.id);
        } else if (pokemon?.id) {
            onPokemonSelect(pokemon.id);
        } else {
            console.error("No default variety found");
        }
    };

    const formattedId = `#${String(pokemonSpecies?.id || pokemon?.id || "").padStart(3, "0")}`;
    const displayName = capitalize(pokemonSpecies?.name || pokemon?.name || "");
    const titleAndAria = `${displayName} ${formattedId}`.trim();

    return (
        <button
            type="button"
            onClick={handleSelect}
            aria-label={titleAndAria}
            title={titleAndAria}
            className={`group relative aspect-square p-2 sm:p-2.5 rounded-xl transition-colors duration-150 flex items-center justify-center cursor-pointer min-w-[48px] min-h-[48px] focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-300 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-900 overflow-hidden ${
                active
                    ? "ring-2 ring-amber-400 bg-sky-700/80 shadow-[0_0_12px_rgba(251,191,36,0.6)] text-white"
                    : "bg-sky-800/60 hover:bg-sky-700/70 border border-sky-500/30 text-sky-100 hover:shadow-md hover:border-sky-400/50"
            }`}
        >
            <div className="relative w-full h-full flex items-center justify-center">
                {loading && (
                    <SkeletonIcon
                        className="w-full h-full rounded-lg"
                    />
                )}
                {(!pokemon?.sprite_url || imageError) ? (
                    <div
                        data-testid="pokemon-fallback-icon"
                        className="flex items-center justify-center w-full h-full text-sky-300/80 p-1 select-none"
                    >
                        <svg
                            className="w-7 h-7 sm:w-8 sm:h-8 drop-shadow text-sky-300/70"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="1.5"
                            aria-hidden="true"
                        >
                            <circle cx="12" cy="12" r="9"/>
                            <path d="M3 12h6m6 0h6"/>
                            <circle cx="12" cy="12" r="3"/>
                        </svg>
                    </div>
                ) : (
                    <img
                        src={pokemon.sprite_url}
                        alt={displayName}
                        className={`w-full h-full object-contain mx-auto drop-shadow [image-rendering:pixelated] select-none ${
                            loading ? "hidden" : "inline"
                        }`}
                        onLoad={() => setLoading(false)}
                        onError={() => {
                            setLoading(false);
                            setImageError(true);
                        }}
                    />
                )}
            </div>
        </button>
    );
};
