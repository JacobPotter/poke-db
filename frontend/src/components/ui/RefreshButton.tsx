import React, {useContext} from "react";
import {DarkModeContext} from "../../context/DarkModeContext.tsx";
import {ArrowPathIcon} from "@heroicons/react/24/outline";

export interface RefreshButtonProps {
    onClick?: () => void;
    ariaLabel?: string;
    title?: string;
    className?: string;
    disabled?: boolean;
}

/**
 * RefreshButton component provides a tactile physical push button
 * integrated directly into the Pokédex hardware chassis, styled to match
 * the DarkModeButton hardware toggle.
 */
export const RefreshButton: React.FC<RefreshButtonProps> = ({
                                                                onClick,
                                                                ariaLabel = "Refresh data",
                                                                title = "Refresh data",
                                                                className = "",
                                                                disabled = false
                                                            }) => {
    const {dark} = useContext(DarkModeContext);

    return (
        <button
            type="button"
            role="button"
            aria-label={ariaLabel}
            title={title}
            disabled={disabled}
            className={`group relative inline-flex items-center justify-center h-6 w-6 sm:h-7 sm:w-7 rounded-full p-0.5 sm:p-1 cursor-pointer transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-amber-400 focus:ring-offset-1 shadow-inner select-none disabled:opacity-50 disabled:cursor-not-allowed ${
                dark
                    ? "bg-slate-950/90 border border-slate-700/80 hover:border-slate-500"
                    : "bg-red-950/90 border border-red-900/80 hover:border-red-700"
            } ${className}`}
            onClick={onClick}
        >
            {/* Tactile push button knob */}
            <span
                className={`inline-flex items-center justify-center h-5 w-5 rounded-full transform transition-all duration-200 shadow-md active:scale-95 group-hover:scale-105 ${
                    dark
                        ? "bg-gradient-to-b from-amber-300 to-amber-500 text-slate-950"
                        : "bg-gradient-to-b from-slate-200 to-slate-400 text-slate-800"
                }`}
            >
                <ArrowPathIcon
                    className="w-3 h-3 sm:w-3.5 sm:h-3.5 transition-transform duration-300 group-hover:rotate-45 group-active:rotate-180"
                    aria-hidden="true"
                />
            </span>
        </button>
    );
};
