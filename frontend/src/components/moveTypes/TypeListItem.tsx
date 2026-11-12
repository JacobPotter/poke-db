import {MoveType} from "../../models/pokemon.ts";
import {capitalize} from "lodash";
import {MouseEventHandler, useState} from "react";
import {QuestionMarkCircleIcon, SparklesIcon} from "@heroicons/react/24/solid";

interface TypeListItemProps {
    type: MoveType;
    active?: boolean;
    index: number;
    onTypeSelect: (index: number) => void;
}

export const TypeListItem = ({
                                 type,
                                 active,
                                 index,
                                 onTypeSelect
                             }: TypeListItemProps) => {
    const [imageError, setImageError] = useState(false);

    const handleClick: MouseEventHandler<HTMLButtonElement> = (e) => {
        e.preventDefault();
        onTypeSelect(index);
    };

    const typeName = capitalize(type.name);

    const renderTypeIcon = () => {
        if (!type.img_url || imageError) {
            if (type.name.toLowerCase() === "stellar") {
                return (
                    <div
                        className="flex items-center justify-center w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-gradient-to-r from-pink-500 via-amber-400 to-cyan-400 p-1 shadow-inner">
                        <SparklesIcon className="w-5 h-5 text-white animate-spin"/>
                    </div>
                );
            }
            if (type.name.toLowerCase() === "shadow") {
                return (
                    <div
                        className="flex items-center justify-center w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-gradient-to-br from-purple-900 to-indigo-950 border border-purple-500/50 shadow-inner">
                        <div className="w-4 h-4 rounded-full bg-purple-400/80 blur-[1px]"></div>
                    </div>
                );
            }
            return (
                <div
                    className="flex items-center justify-center w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-slate-700 border border-slate-500">
                    <QuestionMarkCircleIcon className="w-5 h-5 text-slate-300"/>
                </div>
            );
        }

        return (
            <img
                src={type.img_url}
                alt={type.name}
                className="h-auto max-h-7 sm:max-h-8 w-10 sm:w-14 object-contain drop-shadow"
                onError={() => setImageError(true)}
            />
        );
    };

    return (
        <button
            onClick={handleClick}
            aria-label={`Select ${typeName} type`}
            className={`flex items-center justify-between p-2 sm:px-3 sm:py-2.5 rounded-xl font-mono transition-colors text-left w-full ${
                active
                    ? "bg-sky-600 ring-2 ring-amber-400 shadow-[0_0_12px_rgba(251,191,36,0.6)] text-white font-bold"
                    : "bg-sky-700/80 hover:bg-sky-600/90 border border-sky-500/30 text-sky-100 hover:text-white"
            }`}
        >
            <h2 className="text-xs sm:text-sm font-bold truncate max-w-[80px] sm:max-w-none">{typeName}</h2>
            <div className="flex-shrink-0 flex items-center justify-center">
                {renderTypeIcon()}
            </div>
        </button>
    );
};
