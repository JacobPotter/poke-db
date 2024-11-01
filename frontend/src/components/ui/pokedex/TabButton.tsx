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
}

export const TabButton: FC<TabButtonProps> = ({onClick, type, pulse}) => {
    let content: ReactElement | undefined;

    switch (type) {
        case "info":
            content = <InformationCircleIcon className={'text-blue-200'}/>
            break;
        case "details":
            content = <DocumentTextIcon className={'text-green-200'}/>
            break
        case "other":
            content = <ChartPieIcon className={'text-yellow-200'}/>
            break;
        case "refresh":
            content = <ArrowPathRoundedSquareIcon className={'text-violet-200'}/>
            break;
        default:
            content = <CubeIcon className={'text-slate-200'}/>
            break;

    }

    let buttonColor: string;

    switch (type) {
        case "info":
            buttonColor = "bg-blue-600 border-blue-500";
            break
        case "details":
            buttonColor = "bg-green-700 border-green-600";
            break;
        case "other":
            buttonColor = "bg-yellow-500 border-yellow-400";
            break;
        case "refresh":
            buttonColor = "bg-violet-700 border-violet-600";
            break;
        default:
            buttonColor = "bg-slate-700 border-slate-600";
            break;
    }


    return <button
        className={`${buttonColor} border-2 md:border-4 rounded-full p-1 h-7 w-7 md:p-2 sm:h-8 sm:w-8 md:h-16 md:w-16`}
        onClick={onClick}>
        <div className={pulse ? 'animate-pulse' : ''}>
            {content}
        </div>
    </button>
};
export const TabButtonContainer: FC<PropsWithChildren> = ({children}) => {

    return <div
        className="absolute top-1.5 left-3 sm:top-8 sm:left-1 sm:h-1/3 md:h-auto px-1 py-1 md:px-3 md:py-2 md:static flex flex-row sm:flex-col md:flex-row gap-6 lg:gap-12 xl:gap-16 bg-red-600 rounded-full items-center justify-center">
        {children}
    </div>;
};