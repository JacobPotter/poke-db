import {PokemonSpecies, PokemonVariety} from "../../models/pokemon.ts";
import {SummaryItem} from "../ui/SummaryItem.tsx";
import {capitalize} from "lodash";
import {useCallback, useEffect, useRef, useState} from "react";
import {PlayIcon} from "@heroicons/react/24/solid";
import {isSafari} from 'react-device-detect';
import {ChevronLeftIcon, ChevronRightIcon} from "@heroicons/react/24/outline";

interface PokemonSummaryProps {
    pokemonSpecies: PokemonSpecies | null
}

export const PokemonSummary = ({pokemonSpecies}: PokemonSummaryProps) => {

    const [selectedPokemonVariety, setSelectedPokemonVariety] = useState<PokemonVariety>();
    const [varietyIndex, setVarietyIndex] = useState(0);

    const audioRef = useRef<HTMLAudioElement>(null);
    const [progress, setProgress] = useState(0);


    const handlePlay = () => {
        audioRef.current && audioRef?.current.play();
    };

    useEffect(() => {
        setVarietyIndex(0)
    }, [pokemonSpecies]);


    useEffect(() => {
        if (!selectedPokemonVariety) {
            return
        }

        setProgress(0)

        const handleTimeUpdate = () => {
            if (audioRef?.current)
                setProgress((audioRef.current.currentTime / audioRef.current.duration) * 100);
        };

        if (audioRef.current) {
            audioRef.current.addEventListener("timeupdate", handleTimeUpdate);
        }

        const to = setTimeout(handlePlay, 400);

        return () => {
            audioRef.current && audioRef.current.removeEventListener("timeupdate", handleTimeUpdate);
            clearTimeout(to)
        }

    }, [selectedPokemonVariety?.cry]);


    useEffect(() => {
        if (!pokemonSpecies) return;
        setSelectedPokemonVariety(pokemonSpecies?.varieties[varietyIndex]);
    }, [pokemonSpecies, varietyIndex]);


    useEffect(() => {
        let timeout: NodeJS.Timeout;
        if (progress === 100) {
            timeout = setTimeout(() => setProgress(0), 200)
        }

        return () => {
            clearTimeout(timeout)
        }

    }, [progress]);


    const showVariety = useCallback(() => {
        return pokemonSpecies && pokemonSpecies?.varieties.length > 1 && selectedPokemonVariety && selectedPokemonVariety?.name?.split("-").length > 2;
    }, [pokemonSpecies, selectedPokemonVariety]);

    return (
        <section className={'relative flex flex-col items-center justify-center font-mono h-full'}>
            <div className={'max-w-md flex flex-col flex-grow w-full justify-between'}>
                <h1 className="sm:text-lg md:text-3xl lg:text-4xl z-10">{pokemonSpecies && pokemonSpecies.name?.split("-").length > 1 ? `${capitalize(pokemonSpecies?.varieties[0]?.name.split("-")[0])} ${capitalize(pokemonSpecies?.varieties[0]?.name.split("-")[1])}` : capitalize(pokemonSpecies?.varieties[0]?.name)} #{pokemonSpecies?.varieties[0]?.id} {varietyIndex > 0 ? showVariety() ? capitalize(`${selectedPokemonVariety?.name.split("-")[1]}-${capitalize(selectedPokemonVariety?.name.split("-")[2])}`) : capitalize(selectedPokemonVariety?.name.split("-")[1]) : <></>}</h1>
                <div className="translate-y-[10%] flex items-center justify-end sm:justify-center">
                    <img src={selectedPokemonVariety?.sprite_url} alt={selectedPokemonVariety?.name}
                         className={'h-auto w-2/5 md:w-3/4 animate-bounce'}/>
                </div>
            </div>
            <div className={'grid grid-cols-2 gap-2 w-full'}>
                {!isSafari && <div className={'col-span-2'}>
                    <div className="flex items-center justify-between">
                        <button
                            className={'rounded-full bg-sky-800 p-2'} onClick={handlePlay}>
                            <PlayIcon className={'text-sky-50 h-6 w-6 xs:h-8 xs:w-8 sm:h-12 sm:w-12'}/>
                        </button>
                        <div className="rounded-xl p-1.5 sm:p-3 bg-sky-600 w-3/4 ">
                            <div
                                className="border-2 rounded-lg h-4 xs:h-6 overflow-hidden">
                                <div style={{transform: `translateX(${progress - 100}%)`}}
                                     className={`h-full transition-all duration-75 bg-sky-500`}></div>
                            </div>
                        </div>
                    </div>
                    <audio ref={audioRef} src={selectedPokemonVariety?.cry}/>
                </div>}
                <SummaryItem><img className={'w-16 xs:w-20 sm:w-auto mx-auto'}
                                  src={selectedPokemonVariety?.primary_type.img_url}
                                  alt={selectedPokemonVariety?.primary_type.name}/></SummaryItem>
                <SummaryItem>{selectedPokemonVariety?.secondary_type?.name ?
                    <img className={'w-16 xs:w-20 sm:w-auto mx-auto'}
                         src={selectedPokemonVariety.secondary_type.img_url}
                         alt={selectedPokemonVariety.secondary_type.img_url}/> : 'None'}</SummaryItem>
                <SummaryItem>Weight: {(selectedPokemonVariety?.weight ?? 0) / 10}kg</SummaryItem>
                <SummaryItem>Height: {(selectedPokemonVariety?.height ?? 0) / 10}m</SummaryItem>
            </div>

            {pokemonSpecies && pokemonSpecies?.varieties.length > 1 && <>
                <button disabled={!pokemonSpecies?.varieties[varietyIndex - 1]}
                        className={`absolute top-1/4 -left-3 md:top-1/3`}
                        onClick={() => setVarietyIndex(varietyIndex - 1)}>
                    <ChevronLeftIcon
                        className={'w-5 h-5'}/></button>
                <button disabled={!pokemonSpecies?.varieties[varietyIndex + 1]}
                        className={'absolute top-1/4 -right-3 md:top-1/3'}
                        onClick={() => setVarietyIndex(varietyIndex + 1)}>
                    <ChevronRightIcon
                        className={'w-5 h-5'}/></button>
            </>}


        </section>
    )
};