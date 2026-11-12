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
}

export const TabButton: FC<TabButtonProps> = ({onClick, type, pulse, label}) => {
    let content: ReactElement | undefined;
    let buttonLabel = label;

    switch (type) {
        case "info":
            content = <InformationCircleIcon data-testid={"info-icon"} className={'text-blue-200 w-full h-full'}/>;
            buttonLabel = buttonLabel || "Summary";
            break;
        case "details":
            content = <DocumentTextIcon className={'text-green-200 w-full h-full'}/>;
            buttonLabel = buttonLabel || "Details";
            break;
        case "other":
            content = <ChartPieIcon className={'text-yellow-200 w-full h-full'}/>;
            buttonLabel = buttonLabel || "Evolutions";
            break;
        case "refresh":
            content = <ArrowPathRoundedSquareIcon className={'text-violet-200 w-full h-full'}/>;
            buttonLabel = buttonLabel || "Refresh";
            break;
        default:
            content = <CubeIcon className={'text-slate-200 w-full h-full'}/>;
            buttonLabel = buttonLabel || "Tab";
            break;
    }

    let buttonColor: string;

    switch (type) {
        case "info":
            buttonColor = "bg-blue-600 border-blue-400 hover:bg-blue-500";
            break;
        case "details":
            buttonColor = "bg-emerald-600 border-emerald-400 hover:bg-emerald-500";
            break;
        case "other":
            buttonColor = "bg-amber-500 border-amber-300 hover:bg-amber-400";
            break;
        case "refresh":
            buttonColor = "bg-violet-600 border-violet-400 hover:bg-violet-500";
            break;
        default:
            buttonColor = "bg-slate-700 border-slate-500 hover:bg-slate-600";
            break;
    }

    return (
        <button
            aria-label={buttonLabel}
            title={buttonLabel}
            className={`${buttonColor} border-2 md:border-3 rounded-full p-1 h-7 w-7 sm:h-8 sm:w-8 md:h-12 md:w-12 lg:h-14 lg:w-14 transition-all duration-200 flex items-center justify-center focus:outline-none focus:ring-2 focus:ring-amber-300 ${
                pulse ? "ring-2 ring-amber-400 shadow-[0_0_12px_rgba(251,191,36,0.7)] scale-105" : "opacity-90 hover:opacity-100 hover:scale-105"
            }`}
            onClick={onClick}
        >
            <div className={`w-full h-full p-0.5 flex items-center justify-center ${pulse ? "animate-pulse" : ""}`}>
                {content}
            </div>
        </button>
    );
};

export const TabButtonContainer: FC<PropsWithChildren> = ({children}) => {
    return (
        <div
            className="absolute top-2.5 right-3 sm:top-3 sm:right-6 md:static flex flex-row gap-2 sm:gap-3 md:gap-5 lg:gap-8 bg-red-800/80 dark:bg-red-950/90 border border-red-900/50 dark:border-red-900/60 px-2 py-1 sm:px-3 sm:py-1.5 rounded-full items-center justify-center shadow-inner z-20">
            {children}
        </div>
    );
};
