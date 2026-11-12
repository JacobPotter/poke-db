import {useContext} from "react";
import {DarkModeContext} from "../../context/DarkModeContext.tsx";

interface DarkModeButtonProps {
    className?: string;
}

/**
 * DarkModeButton component provides a tactile physical toggle switch
 * integrated directly into the Pokédex hardware chassis.
 */
export function DarkModeButton({className = ""}: DarkModeButtonProps) {
    const {dark, toggleDarkMode} = useContext(DarkModeContext);
    return (
        <button
            type="button"
            role="switch"
            aria-checked={dark}
            aria-label={dark ? "Switch to light mode" : "Switch to dark mode"}
            title={dark ? "Switch to light mode" : "Switch to dark mode"}
            className={`group relative inline-flex items-center h-6 w-11 sm:h-7 sm:w-14 rounded-full p-0.5 sm:p-1 cursor-pointer transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-amber-400 focus:ring-offset-1 shadow-inner select-none ${
                dark
                    ? "bg-slate-950/90 border border-slate-700/80"
                    : "bg-red-950/90 border border-red-900/80"
            } ${className}`}
            onClick={toggleDarkMode}
        >
            {/* Sliding rocker knob */}
            <span
                className={`inline-flex items-center justify-center h-5 w-5 rounded-full transform transition-transform duration-300 shadow-md ${
                    dark
                        ? "translate-x-5 sm:translate-x-7 bg-gradient-to-b from-amber-300 to-amber-500 text-slate-950"
                        : "translate-x-0 bg-gradient-to-b from-slate-200 to-slate-400 text-slate-800"
                }`}
            >
                {dark ? (
                    <svg
                        id="theme-toggle-light-icon"
                        className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-slate-950"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                        xmlns="http://www.w3.org/2000/svg"
                    >
                        <path
                            d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z"
                            fillRule="evenodd"
                            clipRule="evenodd"
                        />
                    </svg>
                ) : (
                    <svg
                        id="theme-toggle-dark-icon"
                        className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-slate-900"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                        xmlns="http://www.w3.org/2000/svg"
                    >
                        <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z"/>
                    </svg>
                )}
            </span>
        </button>
    );
}
