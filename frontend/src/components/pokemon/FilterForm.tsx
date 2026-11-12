import {FormEventHandler, useState} from "react";
import {capitalize} from "lodash";
import {useMoveTypes} from "@/query/hooks/useMoveTypes.ts";
import {Form, useSearchParams} from "react-router-dom";
import {FunnelIcon, XMarkIcon} from "@heroicons/react/24/outline";

export const FilterForm = ({onSubmit}: { onSubmit?: VoidFunction }) => {
    const [searchParams, setSearchParams] = useSearchParams();
    const moveTypes = useMoveTypes();

    const currentNameParam = searchParams.get("pokemonName") || "";
    const currentTypeIdParam = searchParams.get("pokemonTypeId") || "";

    const [pokemonName, setPokemonName] = useState(currentNameParam);
    const [pokemonType, setPokemonType] = useState(() => {
        if (!currentTypeIdParam) return "-";
        const matched = moveTypes.find(t => t.id === parseInt(currentTypeIdParam));
        return matched ? matched.name : "-";
    });

    const handleSubmit: FormEventHandler<HTMLFormElement> = (e) => {
        e.preventDefault();

        const cleanPokemonName = pokemonName.trim() !== "" ? pokemonName.trim().toLowerCase() : null;
        let selectedTypeName: string | null = pokemonType;
        if (selectedTypeName === "-") {
            selectedTypeName = null;
        }

        const pokemonTypeId = moveTypes.find(
            m => m.name.toLowerCase() === selectedTypeName?.toLowerCase()
        )?.id ?? null;

        setSearchParams((params) => {
            if (cleanPokemonName) {
                params.set("pokemonName", cleanPokemonName);
            } else {
                params.delete("pokemonName");
            }

            if (pokemonTypeId) {
                params.set("pokemonTypeId", pokemonTypeId.toString());
            } else {
                params.delete("pokemonTypeId");
            }

            params.delete("pokemonId");
            params.delete("page");

            return params;
        });

        if (onSubmit) onSubmit();
    };

    const handleReset = () => {
        setPokemonName("");
        setPokemonType("-");
        setSearchParams((params) => {
            params.delete("pokemonName");
            params.delete("pokemonTypeId");
            params.delete("pokemonId");
            params.delete("page");
            return params;
        });
        if (onSubmit) onSubmit();
    };

    const handleCancel = () => {
        if (onSubmit) onSubmit();
    };

    const hasActiveFilters = Boolean(currentNameParam || currentTypeIdParam);

    return (
        <Form onSubmit={handleSubmit} className="flex flex-col justify-between h-full font-mono text-sky-50 p-2 sm:p-4">
            <div className="flex flex-col gap-3">
                <div className="flex items-center justify-between border-b border-sky-600/50 pb-2">
                    <h1 className="text-xl sm:text-2xl font-bold flex items-center gap-2">
                        <FunnelIcon className="w-5 h-5 text-amber-400"/>
                        <span>Filter Pokemon</span>
                    </h1>
                    {hasActiveFilters && (
                        <span
                            className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-amber-400 text-slate-900 uppercase">
                            Filtered
                        </span>
                    )}
                </div>

                {/* Name Filter */}
                <div className="flex flex-col gap-1">
                    <label htmlFor="pokemonName" className="text-xs sm:text-sm font-semibold text-sky-200">
                        Pokemon Name
                    </label>
                    <div className="relative flex items-center">
                        <input
                            id="pokemonName"
                            name="pokemonName"
                            type="text"
                            placeholder="e.g. pikachu, charizard..."
                            value={pokemonName}
                            onChange={(e) => setPokemonName(e.target.value)}
                            className="w-full bg-sky-900/80 border border-sky-600/60 focus:border-amber-400 focus:ring-2 focus:ring-amber-400/40 text-white placeholder-sky-400/50 p-2 sm:p-2.5 rounded-xl text-sm font-mono shadow-inner outline-none transition-all"
                        />
                        {pokemonName && (
                            <button
                                type="button"
                                aria-label="Clear name"
                                onClick={() => setPokemonName("")}
                                className="absolute right-2 text-sky-300 hover:text-white p-1"
                            >
                                <XMarkIcon className="w-4 h-4"/>
                            </button>
                        )}
                    </div>
                </div>

                {/* Type Filter */}
                <div className="flex flex-col gap-1">
                    <label htmlFor="pokemonType" className="text-xs sm:text-sm font-semibold text-sky-200">
                        Element Type
                    </label>
                    <select
                        id="pokemonType"
                        name="pokemonType"
                        value={pokemonType}
                        onChange={(e) => setPokemonType(e.target.value)}
                        className="w-full bg-sky-900/80 border border-sky-600/60 focus:border-amber-400 focus:ring-2 focus:ring-amber-400/40 text-white p-2 sm:p-2.5 rounded-xl text-sm font-mono shadow-inner outline-none transition-all"
                    >
                        <option value="-">All Types</option>
                        {moveTypes.map((moveType) => (
                            <option key={`${moveType.id}_option`} value={moveType.name}>
                                {capitalize(moveType.name)}
                            </option>
                        ))}
                    </select>
                </div>
            </div>

            {/* Action Buttons */}
            <div className="grid grid-cols-2 gap-2 pt-4 border-t border-sky-600/40 mt-4">
                <button
                    type="submit"
                    aria-label="Apply Filter"
                    className="col-span-2 py-2.5 px-4 bg-amber-400 hover:bg-amber-300 active:scale-98 text-slate-950 font-bold uppercase tracking-wider rounded-xl shadow-md transition-all text-xs sm:text-sm"
                >
                    Apply Filter
                </button>
                <button
                    type="button"
                    aria-label="Reset"
                    onClick={handleReset}
                    className="py-2 px-3 bg-sky-900/80 hover:bg-sky-800 text-sky-200 font-semibold uppercase tracking-wider rounded-xl border border-sky-600/50 transition-all text-xs"
                >
                    Reset
                </button>
                <button
                    type="button"
                    aria-label="Cancel"
                    onClick={handleCancel}
                    className="py-2 px-3 bg-slate-700 hover:bg-slate-600 text-slate-200 font-semibold uppercase tracking-wider rounded-xl border border-slate-600 transition-all text-xs"
                >
                    Cancel
                </button>
            </div>
        </Form>
    );
};
