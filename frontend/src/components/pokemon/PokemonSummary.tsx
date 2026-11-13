import {PokemonSpecies, PokemonVariety} from "../../models/pokemon.ts";
import {capitalize} from "lodash";
import {FC, useCallback, useEffect, useRef, useState} from "react";
import {ChevronLeftIcon, ChevronRightIcon} from "@heroicons/react/24/outline";
import {useOutletContext} from "react-router-dom";

export interface PokemonSummaryProps {
    pokemonSpecies?: PokemonSpecies | null;
}

export const PokemonSummary: FC<PokemonSummaryProps> = ({pokemonSpecies: propPokemonSpecies}) => {
    const context = useOutletContext<{ pokemonSpecies: PokemonSpecies | null } | undefined>();
    const pokemonSpecies = propPokemonSpecies !== undefined ? propPokemonSpecies : context?.pokemonSpecies;

    const [selectedPokemonVariety, setSelectedPokemonVariety] = useState<PokemonVariety>();
    const [varietyIndex, setVarietyIndex] = useState(0);

    const audioRef = useRef<HTMLAudioElement>(null);

    const handlePlay = () => {
        if (!audioRef.current || !selectedPokemonVariety?.cry) return;
        if (!audioRef.current.paused) {
            audioRef.current.pause();
            audioRef.current.currentTime = 0;
        } else {
            audioRef.current.currentTime = 0;
            audioRef.current.play().catch(() => {
            });
        }
    };

    useEffect(() => {
        setVarietyIndex(0);
    }, [pokemonSpecies]);

    useEffect(() => {
        if (!pokemonSpecies || !pokemonSpecies.varieties) return;
        setSelectedPokemonVariety(pokemonSpecies?.varieties[varietyIndex] as PokemonVariety);
    }, [pokemonSpecies, varietyIndex]);

    const formatVarietyName = useCallback((varietyName?: string) => {
        if (!varietyName) return "";
        const parts = varietyName.split("-");
        if (parts.length <= 1) return "";
        return parts.slice(1).map(capitalize).join(" ");
    }, []);

    const speciesName = pokemonSpecies?.name ? capitalize(pokemonSpecies.name) : (selectedPokemonVariety?.name ? capitalize(selectedPokemonVariety.name) : "");
    const varietyLabel = formatVarietyName(selectedPokemonVariety?.name);
    const primaryType = selectedPokemonVariety?.primary_type;
    const secondaryType = selectedPokemonVariety?.secondary_type;

    return (
        <section className={'relative flex flex-col items-center justify-between font-mono h-full w-full'}>
            {/* Header info */}
            <div className="w-full flex items-center justify-between border-b border-sky-600/50 pb-1.5 mb-1 shrink-0">
                <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
                    <h1 className="text-xl sm:text-2xl md:text-3xl font-extrabold tracking-tight text-white flex items-center gap-2">
                        <span>{speciesName}</span>
                        <span
                            className="text-sky-300 font-mono text-base sm:text-lg">#{pokemonSpecies?.id ?? selectedPokemonVariety?.id}</span>
                    </h1>
                    {varietyLabel && (
                        <span
                            className="text-xs px-2 py-0.5 rounded-full bg-amber-400 text-slate-900 font-bold uppercase tracking-wider shadow-sm">
                            {varietyLabel}
                        </span>
                    )}
                    {/* Elemental Type Badges */}
                    <div className="flex items-center gap-1.5" data-testid="pokemon-summary-types">
                        {primaryType && (
                            primaryType.img_url ? (
                                <img
                                    src={primaryType.img_url}
                                    alt={primaryType.name}
                                    title={capitalize(primaryType.name)}
                                    className="h-5 sm:h-6 w-auto object-contain drop-shadow"
                                />
                            ) : (
                                <span
                                    className="text-[11px] sm:text-xs uppercase font-bold px-1.5 py-0.5 rounded bg-sky-900/60 text-sky-200 border border-sky-600/40">
                                    {primaryType.name}
                                </span>
                            )
                        )}
                        {secondaryType && (
                            secondaryType.img_url ? (
                                <img
                                    src={secondaryType.img_url}
                                    alt={secondaryType.name}
                                    title={capitalize(secondaryType.name)}
                                    className="h-5 sm:h-6 w-auto object-contain drop-shadow"
                                />
                            ) : (
                                <span
                                    className="text-[11px] sm:text-xs uppercase font-bold px-1.5 py-0.5 rounded bg-sky-900/60 text-sky-200 border border-sky-600/40">
                                    {secondaryType.name}
                                </span>
                            )
                        )}
                    </div>
                </div>
            </div>

            {/* Sprite display area */}
            <div
                className="relative flex-1 min-h-0 w-full flex items-center justify-center my-auto overflow-hidden">
                {pokemonSpecies && pokemonSpecies.varieties && pokemonSpecies.varieties.length > 1 && (
                    <button
                        type="button"
                        aria-label="Previous variety"
                        disabled={varietyIndex <= 0}
                        onClick={() => setVarietyIndex(prev => Math.max(0, prev - 1))}
                        className="absolute left-1 top-1/2 -translate-y-1/2 z-20 p-2 rounded-full bg-sky-900/80 hover:bg-sky-700 text-sky-100 disabled:opacity-20 disabled:pointer-events-none transition-all shadow-md border border-sky-500/40"
                    >
                        <ChevronLeftIcon className="w-5 h-5"/>
                    </button>
                )}

                <div
                    onClick={handlePlay}
                    title="Click to play cry"
                    className="group relative cursor-pointer flex items-center justify-center p-0.5 sm:p-1 h-full w-full rounded-2xl transition-transform duration-300 active:scale-95"
                >
                    <div
                        className="absolute inset-0 bg-radial from-sky-400/25 via-transparent to-transparent rounded-full filter blur-2xl scale-125 group-hover:from-sky-300/35 pointer-events-none"></div>
                    <img
                        src={selectedPokemonVariety?.sprite_url}
                        alt={selectedPokemonVariety?.name || speciesName}
                        className="relative animate-bounce h-full max-h-full w-auto max-w-[95%] object-contain [image-rendering:pixelated] drop-shadow-[0_12px_20px_rgba(0,0,0,0.5)]"
                    />
                </div>

                {pokemonSpecies && pokemonSpecies.varieties && pokemonSpecies.varieties.length > 1 && (
                    <button
                        type="button"
                        aria-label="Next variety"
                        disabled={varietyIndex >= pokemonSpecies.varieties.length - 1}
                        onClick={() => setVarietyIndex(prev => Math.min(pokemonSpecies.varieties.length - 1, prev + 1))}
                        className="absolute right-1 top-1/2 -translate-y-1/2 z-20 p-2 rounded-full bg-sky-900/80 hover:bg-sky-700 text-sky-100 disabled:opacity-20 disabled:pointer-events-none transition-all shadow-md border border-sky-500/40"
                    >
                        <ChevronRightIcon className="w-5 h-5"/>
                    </button>
                )}
            </div>

            {/* Hidden audio element for sprite clicks & chassis audio button trigger */}
            <audio ref={audioRef} src={selectedPokemonVariety?.cry} preload="metadata"/>
        </section>
    );
};
