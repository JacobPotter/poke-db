import {Pokemon} from "../../models/pokemon.ts";
import {SummaryItem} from "../ui/SummaryItem.tsx";
import {capitalize} from "lodash";
import {useEffect, useRef, useState} from "react";
import {PlayIcon} from "@heroicons/react/24/solid";
import {isSafari} from 'react-device-detect';

export const PokemonSummary = ({pokemon}: { pokemon: Pokemon | undefined }) => {
    const audioRef = useRef<HTMLAudioElement>(null);
    const [progress, setProgress] = useState(0);


    const handlePlay = () => {
        audioRef.current && audioRef?.current.play();
    };


    useEffect(() => {
        if (!pokemon) {
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

    }, [pokemon?.cry]);

    useEffect(() => {
        let timeout: NodeJS.Timeout;
        if (progress === 100) {
            timeout = setTimeout(() => setProgress(0), 200)
        }

        return () => {
            clearTimeout(timeout)
        }

    }, [progress]);

    return (
        <section className={'flex flex-col items-center justify-center font-mono h-full'}>
            <div className={'max-w-md flex flex-col flex-grow w-full justify-between'}>
                <h1 className="text-lg md:text-3xl lg:text-4xl">{capitalize(pokemon?.name)} #{pokemon?.id}</h1>
                <div className="translate-y-[10%]">
                    <img src={pokemon?.sprite_url} alt={pokemon?.name}
                         className={'h-auto w-2/5 md:w-3/4 mx-auto animate-bounce'}/>
                </div>
            </div>
            <div className={'grid grid-cols-2 gap-2 w-full'}>
                {!isSafari && <div className={'col-span-2'}>
                    <div className="flex items-center justify-between">
                        <button
                            className={'rounded-full bg-sky-800 p-2'} onClick={handlePlay}>
                            <PlayIcon className={'text-sky-50 h-12 w-12'}/>
                        </button>
                        <div className="rounded-xl p-3 bg-sky-600 w-3/4 ">
                            <div
                                className="border-2 rounded-lg h-6 overflow-hidden">
                                <div style={{transform: `translateX(${progress - 100}%)`}}
                                     className={`h-full transition-all duration-75 bg-sky-500`}></div>
                            </div>
                        </div>
                    </div>
                    <audio ref={audioRef} src={pokemon?.cry}/>
                </div>}
                <SummaryItem><img className={'mx-auto'} src={pokemon?.primary_type.img_url}
                                  alt={pokemon?.primary_type.name}/></SummaryItem>
                <SummaryItem>{pokemon?.secondary_type?.name ?
                    <img className={'mx-auto'} src={pokemon.secondary_type.img_url}
                         alt={pokemon.secondary_type.img_url}/> : 'None'}</SummaryItem>
                <SummaryItem>Weight: {(pokemon?.weight ?? 0) / 10}kg</SummaryItem>
                <SummaryItem>Height: {(pokemon?.height ?? 0) / 10}m</SummaryItem>
            </div>
        </section>
    )
};