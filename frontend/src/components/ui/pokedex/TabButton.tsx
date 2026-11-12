import {FC, PropsWithChildren, ReactElement} from "react";
import {
    ArrowPathRoundedSquareIcon,
    ChartPieIcon,
    DocumentTextIcon,
    InformationCircleIcon
} from "@heroicons/react/24/outline";
import {CubeIcon} from "@heroicons/react/16/solid";

interface TabButtonProps {
    onClick?: () => void;
    type?: "info" | "details" | "other" | "refresh";
    pulse?: boolean;
    label?: string;
    className?: string;
}

export const TabButton: FC<TabButtonProps> = ({onClick, type, pulse, label, className = ""}) => {
    let content: ReactElement | undefined;
    let buttonLabel = label;

    switch (type) {
        case "info":
            content = <InformationCircleIcon data-testid={"info-icon"} className={'text-sky-100 w-full h-full'}/>;
            buttonLabel = buttonLabel || "Summary";
            break;
        case "details":
            content = <DocumentTextIcon className={'text-emerald-100 w-full h-full'}/>;
            buttonLabel = buttonLabel || "Details";
            break;
        case "other":
            content = <ChartPieIcon className={'text-amber-100 w-full h-full'}/>;
            buttonLabel = buttonLabel || "Evolutions";
            break;
        case "refresh":
            content = <ArrowPathRoundedSquareIcon className={'text-violet-100 w-full h-full'}/>;
            buttonLabel = buttonLabel || "Refresh";
            break;
        default:
            content = <CubeIcon className={'text-slate-200 w-full h-full'}/>;
            buttonLabel = buttonLabel || "Tab";
            break;
    }

    // Classic Kanto 2x5 Keypad Mechanical Button Styling
    const baseColor = "bg-gradient-to-b from-sky-500 via-sky-600 to-sky-800 border border-sky-400/80 border-b-3 md:border-b-4 border-b-sky-950 hover:from-sky-400 hover:to-sky-700 text-white";

    return (
        <button
            type="button"
            aria-label={buttonLabel}
            title={buttonLabel}
            className={`${baseColor} rounded-md md:rounded-lg p-1 h-8 w-full sm:h-9 md:h-10 lg:h-11 transition-all duration-100 flex items-center justify-center focus:outline-none focus:ring-2 focus:ring-amber-300 shadow-md ${
                pulse
                    ? "ring-2 ring-amber-400 bg-sky-500 shadow-[0_0_12px_rgba(251,191,36,0.8)] scale-105 brightness-110"
                    : "opacity-90 hover:opacity-100 hover:brightness-105 active:border-b-1 active:translate-y-0.5 active:shadow-inner"
            } ${className}`}
            onClick={onClick}
        >
            <div className={`w-full h-full p-0.5 flex items-center justify-center ${pulse ? "animate-pulse" : ""}`}>
                {content}
            </div>
        </button>
    );
};

export const TabButtonContainer: FC<PropsWithChildren<{ className?: string }>> = ({children, className = ""}) => {
    return (
        <div className={`w-full flex justify-center items-center ${className}`}>
            {/* Desktop 2x5 Keypad Framing (>= md) */}
            <div
                data-testid="tab-button-keypad-grid"
                className="hidden md:grid grid-cols-5 gap-1.5 lg:gap-2 bg-slate-800/90 md:bg-slate-800/95 dark:bg-slate-950 p-2 sm:p-2.5 rounded-xl border-2 border-slate-700/80 dark:border-slate-800 shadow-inner w-full justify-items-center items-center"
            >
                {children}
                {/* Auxiliary keypad keys to complete classic 10-key 2x5 layout */}
                <div
                    aria-hidden="true"
                    className="w-full h-8 sm:h-9 md:h-10 lg:h-11 rounded-md md:rounded-lg bg-gradient-to-b from-sky-600 via-sky-700 to-sky-900 border border-sky-500/50 border-b-3 md:border-b-4 border-b-sky-950 flex items-center justify-center text-xs sm:text-sm font-mono font-bold text-sky-200/90 shadow-inner select-none"
                >
                    5
                </div>
                <div
                    aria-hidden="true"
                    className="w-full h-8 sm:h-9 md:h-10 lg:h-11 rounded-md md:rounded-lg bg-gradient-to-b from-sky-600 via-sky-700 to-sky-900 border border-sky-500/50 border-b-3 md:border-b-4 border-b-sky-950 flex items-center justify-center text-xs sm:text-sm font-mono font-bold text-sky-200/90 shadow-inner select-none"
                >
                    6
                </div>
                <div
                    aria-hidden="true"
                    className="w-full h-8 sm:h-9 md:h-10 lg:h-11 rounded-md md:rounded-lg bg-gradient-to-b from-sky-600 via-sky-700 to-sky-900 border border-sky-500/50 border-b-3 md:border-b-4 border-b-sky-950 flex items-center justify-center text-xs sm:text-sm font-mono font-bold text-sky-200/90 shadow-inner select-none"
                >
                    7
                </div>
                <div
                    aria-hidden="true"
                    className="w-full h-8 sm:h-9 md:h-10 lg:h-11 rounded-md md:rounded-lg bg-gradient-to-b from-sky-600 via-sky-700 to-sky-900 border border-sky-500/50 border-b-3 md:border-b-4 border-b-sky-950 flex items-center justify-center text-xs sm:text-sm font-mono font-bold text-sky-200/90 shadow-inner select-none"
                >
                    8
                </div>
                <div
                    aria-hidden="true"
                    className="w-full h-8 sm:h-9 md:h-10 lg:h-11 rounded-md md:rounded-lg bg-gradient-to-b from-sky-600 via-sky-700 to-sky-900 border border-sky-500/50 border-b-3 md:border-b-4 border-b-sky-950 flex items-center justify-center text-xs sm:text-sm font-mono font-bold text-sky-200/90 shadow-inner select-none"
                >
                    9
                </div>
                <div
                    aria-hidden="true"
                    className="w-full h-8 sm:h-9 md:h-10 lg:h-11 rounded-md md:rounded-lg bg-gradient-to-b from-sky-600 via-sky-700 to-sky-900 border border-sky-500/50 border-b-3 md:border-b-4 border-b-sky-950 flex items-center justify-center text-xs sm:text-sm font-mono font-bold text-sky-200/90 shadow-inner select-none"
                >
                    0
                </div>
            </div>

            {/* Mobile Touch Bar Framing (< md) */}
            <div
                data-testid="tab-button-mobile-touch-bar"
                className="md:hidden flex flex-row justify-around gap-2 bg-slate-800/90 dark:bg-slate-950/95 border border-slate-700/70 px-3 py-1.5 rounded-full shadow-inner w-full my-1"
            >
                {children}
            </div>
        </div>
    );
};

TabButtonContainer.displayName = "TabButtonContainer";
TabButton.displayName = "TabButton";
