import {PokemonSpecies, PokemonVariety} from "../../models/pokemon.ts";
import {SummaryItem} from "../ui/SummaryItem.tsx";
import {capitalize} from "lodash";
import {useCallback, useEffect, useRef, useState} from "react";
import {PauseIcon, PlayIcon, SpeakerWaveIcon} from "@heroicons/react/24/solid";
import {ChevronLeftIcon, ChevronRightIcon} from "@heroicons/react/24/outline";
import {useOutletContext} from "react-router-dom";


export const PokemonSummary = () => {

    const {pokemonSpecies} = useOutletContext<{ pokemonSpecies: PokemonSpecies | null }>()

    const [selectedPokemonVariety, setSelectedPokemonVariety] = useState<PokemonVariety>();
    const [varietyIndex, setVarietyIndex] = useState(0);

    const audioRef = useRef<HTMLAudioElement>(null);
    const [progress, setProgress] = useState(0);
    const [isPlaying, setIsPlaying] = useState(false);
    const [currentTime, setCurrentTime] = useState(0);
    const [duration, setDuration] = useState(0);

    const handlePlay = () => {
        if (!audioRef.current || !selectedPokemonVariety?.cry) return;
        if (isPlaying) {
            audioRef.current.pause();
            audioRef.current.currentTime = 0;
            setIsPlaying(false);
            setProgress(0);
        } else {
            audioRef.current.play().then(() => {
                setIsPlaying(true);
            }).catch(() => {
                setIsPlaying(false);
            });
        }
    };

    useEffect(() => {
        setVarietyIndex(0);
        setIsPlaying(false);
        setProgress(0);
    }, [pokemonSpecies]);


    useEffect(() => {
        if (!selectedPokemonVariety) {
            return;
        }

        setProgress(0);
        setIsPlaying(false);

        const audio = audioRef.current;
        if (!audio) return;

        const handleTimeUpdate = () => {
            if (audio && audio.duration) {
                setCurrentTime(audio.currentTime);
                setProgress((audio.currentTime / audio.duration) * 100);
            }
        };

        const handleLoadedMetadata = () => {
            if (audio) {
                setDuration(audio.duration || 0);
            }
        };

        const handleEnded = () => {
            setIsPlaying(false);
            setProgress(0);
            setCurrentTime(0);
        };

        audio.addEventListener("timeupdate", handleTimeUpdate);
        audio.addEventListener("loadedmetadata", handleLoadedMetadata);
        audio.addEventListener("ended", handleEnded);

        return () => {
            audio.removeEventListener("timeupdate", handleTimeUpdate);
            audio.removeEventListener("loadedmetadata", handleLoadedMetadata);
            audio.removeEventListener("ended", handleEnded);
        };

    }, [selectedPokemonVariety]);


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

    return (
        <section className={'relative flex flex-col items-center justify-between font-mono h-full w-full'}>
            {/* Header info */}
            <div className="w-full flex items-center justify-between border-b border-sky-600/50 pb-2 mb-1">
                <div className="flex items-center gap-2 flex-wrap">
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
                </div>
            </div>

            {/* Sprite display area */}
            <div
                className="relative flex-grow flex items-center justify-center w-full my-1 sm:my-2 min-h-[220px] sm:min-h-[260px] md:min-h-[300px] lg:min-h-[340px]">
                {pokemonSpecies && pokemonSpecies.varieties && pokemonSpecies.varieties.length > 1 && (
                    <button
                        type="button"
                        aria-label="Previous variety"
                        disabled={varietyIndex <= 0}
                        onClick={() => setVarietyIndex(prev => Math.max(0, prev - 1))}
                        className="absolute left-0 top-1/2 -translate-y-1/2 z-20 p-2 rounded-full bg-sky-900/80 hover:bg-sky-700 text-sky-100 disabled:opacity-20 disabled:pointer-events-none transition-all shadow-md border border-sky-500/40"
                    >
                        <ChevronLeftIcon className="w-5 h-5"/>
                    </button>
                )}

                <div
                    onClick={handlePlay}
                    title="Click to play cry"
                    className="group relative cursor-pointer flex items-center justify-center p-2 rounded-2xl transition-transform duration-300"
                >
                    <div
                        className="absolute inset-0 bg-radial from-sky-400/20 via-transparent to-transparent rounded-full filter blur-xl group-hover:from-sky-300/30"></div>
                    <img
                        src={selectedPokemonVariety?.sprite_url}
                        alt={selectedPokemonVariety?.name || speciesName}
                        className="relative animate-bounce h-40 sm:h-48 md:h-60 lg:h-72 xl:h-80 max-h-80 w-auto object-contain [image-rendering:pixelated] drop-shadow-[0_10px_14px_rgba(0,0,0,0.4)]"
                    />
                </div>

                {pokemonSpecies && pokemonSpecies.varieties && pokemonSpecies.varieties.length > 1 && (
                    <button
                        type="button"
                        aria-label="Next variety"
                        disabled={varietyIndex >= pokemonSpecies.varieties.length - 1}
                        onClick={() => setVarietyIndex(prev => Math.min(pokemonSpecies.varieties.length - 1, prev + 1))}
                        className="absolute right-0 top-1/2 -translate-y-1/2 z-20 p-2 rounded-full bg-sky-900/80 hover:bg-sky-700 text-sky-100 disabled:opacity-20 disabled:pointer-events-none transition-all shadow-md border border-sky-500/40"
                    >
                        <ChevronRightIcon className="w-5 h-5"/>
                    </button>
                )}
            </div>

            {/* Bottom details & cry player */}
            <div className="grid grid-cols-2 gap-2 w-full pt-1">
                {/* Audio Cry Player Bar */}
                <div
                    className="col-span-2 bg-sky-900/70 border border-sky-600/60 rounded-xl p-2 sm:p-2.5 flex items-center gap-3 shadow-inner">
                    <button
                        type="button"
                        aria-label={isPlaying ? "Pause Pokemon Cry" : "Play Pokemon Cry"}
                        title={isPlaying ? "Pause Cry" : "Play Cry"}
                        disabled={!selectedPokemonVariety?.cry}
                        className={`rounded-full p-2 text-white shadow transition-all flex-shrink-0 ${
                            isPlaying
                                ? "bg-amber-500 hover:bg-amber-400 ring-2 ring-amber-300 scale-105"
                                : "bg-sky-600 hover:bg-sky-500 active:scale-95 disabled:opacity-40"
                        }`}
                        onClick={handlePlay}
                    >
                        {isPlaying ? (
                            <PauseIcon className="h-5 w-5 sm:h-6 sm:w-6"/>
                        ) : (
                            <PlayIcon className="h-5 w-5 sm:h-6 sm:w-6 text-sky-50"/>
                        )}
                    </button>

                    <div className="flex-grow flex flex-col justify-center gap-1 min-w-0">
                        <div
                            className="flex items-center justify-between text-[11px] sm:text-xs text-sky-200 uppercase font-mono tracking-wider">
                            <span className="flex items-center gap-1 truncate">
                                <SpeakerWaveIcon
                                    className={`w-3.5 h-3.5 ${isPlaying ? "text-amber-300 animate-pulse" : "text-sky-300"}`}/>
                                Cry Audio
                            </span>
                            <span>
                                {selectedPokemonVariety?.cry
                                    ? (duration > 0 ? `${currentTime.toFixed(1)}s / ${duration.toFixed(1)}s` : "Ready")
                                    : "Unavailable"}
                            </span>
                        </div>
                        <div
                            className="w-full bg-sky-950/80 border border-sky-700/60 rounded-full h-2.5 overflow-hidden p-0.5">
                            <div
                                style={{width: `${Math.min(100, Math.max(0, progress))}%`}}
                                className="h-full bg-gradient-to-r from-sky-400 to-amber-300 rounded-full transition-all duration-75"
                            ></div>
                        </div>
                    </div>
                    <audio ref={audioRef} src={selectedPokemonVariety?.cry} preload="metadata"/>
                </div>

                {/* Primary Type */}
                <SummaryItem className="flex items-center justify-center p-1.5">
                    {selectedPokemonVariety?.primary_type?.img_url ? (
                        <img
                            className="h-6 sm:h-7 w-auto max-w-full object-contain mx-auto"
                            src={selectedPokemonVariety.primary_type.img_url}
                            alt={selectedPokemonVariety.primary_type.name}
                        />
                    ) : (
                        <span
                            className="text-xs uppercase font-bold text-sky-100">{selectedPokemonVariety?.primary_type?.name ?? "-"}</span>
                    )}
                </SummaryItem>

                {/* Secondary Type */}
                <SummaryItem className="flex items-center justify-center p-1.5">
                    {selectedPokemonVariety?.secondary_type?.img_url ? (
                        <img
                            className="h-6 sm:h-7 w-auto max-w-full object-contain mx-auto"
                            src={selectedPokemonVariety.secondary_type.img_url}
                            alt={selectedPokemonVariety.secondary_type.name}
                        />
                    ) : (
                        <span className="text-xs uppercase font-bold text-sky-300/70">None</span>
                    )}
                </SummaryItem>

                {/* Weight */}
                <SummaryItem className="text-xs sm:text-sm font-semibold flex items-center justify-center">
                    Weight: {((selectedPokemonVariety?.weight ?? 0) / 10).toFixed(1)} kg
                </SummaryItem>

                {/* Height */}
                <SummaryItem className="text-xs sm:text-sm font-semibold flex items-center justify-center">
                    Height: {((selectedPokemonVariety?.height ?? 0) / 10).toFixed(1)} m
                </SummaryItem>
            </div>
        </section>
    );
};
