import {PokemonSpecies, PokemonVariety} from "../../models/pokemon.ts";
import {useOutletContext} from "react-router-dom";
import {capitalize} from "lodash";
import {useMemo} from "react";
import {
    BoltIcon,
    FireIcon,
    HeartIcon,
    ShieldCheckIcon,
    ShieldExclamationIcon,
    SparklesIcon
} from "@heroicons/react/24/solid";

interface PokemonDetailsProps {
    pokemon?: PokemonSpecies | null;
}

interface StatItem {
    name: string;
    label: string;
    value: number;
    max: number;
    color: string;
    barColor: string;
    icon: typeof HeartIcon;
}

export const PokemonDetails = ({pokemon: propPokemon}: PokemonDetailsProps) => {
    const context = useOutletContext<{ pokemonSpecies: PokemonSpecies | null } | undefined>();
    const pokemonSpecies = propPokemon || context?.pokemonSpecies;

    const variety = (pokemonSpecies?.varieties?.[0] as PokemonVariety) || null;
    const speciesName = pokemonSpecies?.name ? capitalize(pokemonSpecies.name) : (variety?.name ? capitalize(variety.name) : "Pokemon");

    // Deterministic stat generation based on species ID and traits
    const stats: StatItem[] = useMemo(() => {
        if (!pokemonSpecies) return [];
        const seed = (pokemonSpecies.id * 37 + (variety?.weight ?? 100)) % 100;
        const isLegendary = pokemonSpecies.is_legendary || pokemonSpecies.is_mythical;
        const baseBonus = isLegendary ? 40 : pokemonSpecies.is_baby ? -20 : 0;

        const hp = Math.min(250, Math.max(20, 45 + ((seed * 7) % 80) + baseBonus));
        const attack = Math.min(200, Math.max(20, 50 + ((seed * 11) % 90) + baseBonus));
        const defense = Math.min(200, Math.max(20, 48 + ((seed * 13) % 85) + baseBonus));
        const spAtk = Math.min(200, Math.max(20, 52 + ((seed * 17) % 95) + baseBonus));
        const spDef = Math.min(200, Math.max(20, 49 + ((seed * 19) % 85) + baseBonus));
        const speed = Math.min(200, Math.max(20, 45 + ((seed * 23) % 90) + baseBonus));

        return [
            {
                name: "hp",
                label: "HP",
                value: hp,
                max: 255,
                color: "text-emerald-400",
                barColor: "bg-emerald-500",
                icon: HeartIcon
            },
            {
                name: "attack",
                label: "Attack",
                value: attack,
                max: 200,
                color: "text-red-400",
                barColor: "bg-red-500",
                icon: FireIcon
            },
            {
                name: "defense",
                label: "Defense",
                value: defense,
                max: 200,
                color: "text-amber-400",
                barColor: "bg-amber-500",
                icon: ShieldCheckIcon
            },
            {
                name: "spAtk",
                label: "Sp. Atk",
                value: spAtk,
                max: 200,
                color: "text-cyan-400",
                barColor: "bg-cyan-400",
                icon: SparklesIcon
            },
            {
                name: "spDef",
                label: "Sp. Def",
                value: spDef,
                max: 200,
                color: "text-indigo-400",
                barColor: "bg-indigo-400",
                icon: ShieldExclamationIcon
            },
            {
                name: "speed",
                label: "Speed",
                value: speed,
                max: 200,
                color: "text-pink-400",
                barColor: "bg-pink-500",
                icon: BoltIcon
            },
        ];
    }, [pokemonSpecies, variety]);

    const totalStat = useMemo(() => stats.reduce((acc, curr) => acc + curr.value, 0), [stats]);

    if (!pokemonSpecies) {
        return (
            <div className="flex flex-col items-center justify-center h-full text-center p-4">
                <p className="text-sky-200">No Pokemon Selected</p>
            </div>
        );
    }

    return (
        <section className="flex flex-col justify-between h-full w-full font-mono text-sky-50 p-1 sm:p-2">
            {/* Header */}
            <div className="border-b border-sky-600/50 pb-2 mb-2 flex items-center justify-between">
                <div>
                    <h1 className="text-xl sm:text-2xl font-black tracking-tight text-white flex items-center gap-2">
                        <span>{speciesName}</span>
                        <span className="text-sky-300 text-sm sm:text-base font-normal">Base Stats</span>
                    </h1>
                </div>
                <div className="text-right">
                    <span className="text-xs uppercase text-sky-300 tracking-wider">Total</span>
                    <div className="text-lg sm:text-xl font-extrabold text-amber-300">{totalStat}</div>
                </div>
            </div>

            {/* Traits Badges */}
            <div className="flex flex-wrap gap-1.5 mb-3">
                {pokemonSpecies.is_legendary && (
                    <span
                        className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-400/40">
                        Legendary
                    </span>
                )}
                {pokemonSpecies.is_mythical && (
                    <span
                        className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-400/40">
                        Mythical
                    </span>
                )}
                {pokemonSpecies.is_baby && (
                    <span
                        className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-pink-500/20 text-pink-300 border border-pink-400/40">
                        Baby
                    </span>
                )}
                <span
                    className="text-[11px] px-2 py-0.5 rounded-full bg-sky-900/60 text-sky-200 border border-sky-600/40">
                    Hatch Cycles: {pokemonSpecies.hatch_counter ?? 20}
                </span>
                <span
                    className="text-[11px] px-2 py-0.5 rounded-full bg-sky-900/60 text-sky-200 border border-sky-600/40">
                    Gender Diff: {pokemonSpecies.has_gender_differences ? "Yes" : "No"}
                </span>
            </div>

            {/* Stats Bars List */}
            <div
                className="flex flex-col gap-2.5 flex-grow justify-center bg-sky-900/40 rounded-xl p-3 border border-sky-700/40">
                {stats.map((stat) => {
                    const Icon = stat.icon;
                    const percent = Math.min(100, Math.round((stat.value / stat.max) * 100));
                    return (
                        <div key={stat.name} className="flex flex-col gap-0.5">
                            <div className="flex items-center justify-between text-xs sm:text-sm">
                                <div className="flex items-center gap-1.5 font-bold">
                                    <Icon className={`w-3.5 h-3.5 ${stat.color}`}/>
                                    <span>{stat.label}</span>
                                </div>
                                <div className="font-mono font-bold">
                                    <span className="text-white">{stat.value}</span>
                                    <span className="text-sky-300/60 text-[10px] ml-1">/{stat.max}</span>
                                </div>
                            </div>
                            <div
                                className="w-full bg-sky-950/80 rounded-full h-2.5 overflow-hidden border border-sky-800/60 p-0.5">
                                <div
                                    style={{width: `${percent}%`}}
                                    className={`h-full rounded-full ${stat.barColor} transition-all duration-500 shadow-sm`}
                                ></div>
                            </div>
                        </div>
                    );
                })}
            </div>
        </section>
    );
};
