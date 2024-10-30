import React, {FC, PropsWithChildren, ReactElement} from "react";
import {Sizeable} from "../../models/general.ts";
import {
    ArrowPathRoundedSquareIcon,
    ChartPieIcon,
    DocumentTextIcon,
    InformationCircleIcon
} from '@heroicons/react/24/outline'
import {CubeIcon} from "@heroicons/react/16/solid";

interface RoundedButtonProps {
    onClick?: () => void;
    type?: "info" | "details" | "other" | "refresh";
    pulse?: boolean;
}


const TabButton: FC<RoundedButtonProps> = ({onClick, type, pulse}) => {
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
        className={`${buttonColor} border-2 md:border-4 rounded-full p-2 h-8 w-8 md:h-16 md:w-16`}
        onClick={onClick}>
        <div className={pulse ? 'animate-pulse' : ''}>
            {content}
        </div>
    </button>
};

interface KeyboardButtonProps {
    onClick?: () => void;
    disabled?: boolean;
    prefixIcon?: ReactElement;
    suffixIcon?: ReactElement;
    className?: string;
}

export const KeyboardButton: FC<PropsWithChildren<KeyboardButtonProps & Sizeable>> = ({
                                                                                          children,
                                                                                          onClick,
                                                                                          disabled,
                                                                                          prefixIcon,
                                                                                          suffixIcon,
                                                                                          className,
                                                                                          size = 'small'
                                                                                      }) =>
    <div
        className={`group ${className}`}>
        <button
            onClick={onClick}
            disabled={disabled}
            className={'w-full text-center font-semibold uppercase transition-all duration-100 bg-slate-700 text-slate-50 border-b-8 border-b-slate-700 rounded-lg group-hover:border-t-8 group-hover:border-b-0 group-hover:bg-slate-700 group-hover:border-t-slate-700 group-hover:shadow-lg'}>
            <div
                className={`flex items-center ${prefixIcon || suffixIcon ? 'justify-between' : 'justify-center'} ${size == 'small' ? 'px-2 py-1 md:px-4 md:py-2 lg:px-6 lg:py-3 text-xs md:text-sm lg:text-base' : 'px-3 py-2 md:px-6 md:py-3 lg:px-8 lg:py-4 text-sm md:text-base lg:text-lg'} transition-all duration-100 bg-slate-500 rounded-lg group-hover:bg-slate-700 `}>
                {prefixIcon && <div className="w-7 h-7">
                    {prefixIcon}
                </div>}
                {children}
                {suffixIcon && <div className="w-7 h-7">
                    {suffixIcon}
                </div>}
            </div>
        </button>
    </div>;

export const TabButtonContainer: FC<PropsWithChildren> = ({children}) => {

    return <div
        className="absolute top-10 left-1 h-1/3 md:h-auto px-1 md:px-3 md:py-2 md:static flex flex-col md:flex-row gap-6 lg:gap-12 xl:gap-16 bg-red-600 rounded-full items-center justify-center">
        {children}
    </div>;
};

interface Loadable {
    loading?: boolean
}

function SkeletonText({thick}: { thick?: boolean }) {
    return <div className={`px-3 py-2 w-full ${thick ? "h-12" : "h-8"} rounded-xl bg-sky-600 opacity-80`}></div>;
}

function SkeletonBlock({thick, withIcon}: { thick?: boolean, withIcon?: boolean }) {
    return <div className={`px-3 py-2 w-full ${thick ? "h-20" : "h-12"} rounded-xl bg-sky-800 opacity-80`}>
        {withIcon && <div className={'flex items-center justify-between gap-2'}>
            <div className={'px-3 py-2 w-1/2 h-2 rounded-xl bg-sky-600 opacity-80'}></div>
            <div className={`rounded-full bg-sky-600 ${thick ? "h-12 w-12" : "h-4 w-4"} `}></div>
        </div>}
    </div>;
}

function SkeletonIcon() {
    return <div className="rounded-full h-32 w-32 bg-sky-600 opacity-80"></div>;
}

const LeftScreenLoading: React.FC = () => {
    return <div className="flex flex-col space-y-3 md:space-y-16 items-center justify-center animate-pulse">
        <SkeletonText thick/>
        <SkeletonIcon/>
        <div className="grid grid-cols-2 gap-1 md:gap-6 w-full justify-stretch">
            <SkeletonText/>
            <SkeletonText/>
            <SkeletonText/>
            <SkeletonText/>
            <SkeletonText/>
            <SkeletonText/>
            <SkeletonText/>
            <SkeletonText/>
        </div>
    </div>
}
const RightScreenLoading: React.FC = () => {
    return <div className="hidden md:grid grid-cols-2 gap-6 animate-pulse items-center justify-center">
        <SkeletonBlock thick withIcon/>
        <SkeletonBlock thick withIcon/>
        <SkeletonBlock thick withIcon/>
        <SkeletonBlock thick withIcon/>
        <SkeletonBlock thick withIcon/>
        <SkeletonBlock thick withIcon/>
        <SkeletonBlock thick withIcon/>
        <SkeletonBlock thick withIcon/>
        <SkeletonBlock thick withIcon/>
        <SkeletonBlock thick withIcon/>
    </div>
}

export const LeftScreenContainer: React.FC<PropsWithChildren<Loadable>> = ({children, loading}) => <div
    className={`min-h-72 md:max-h-[570px] md:min-h-96 border-slate-400 border-2 md:border-4 bg-sky-700 text-sky-50 rounded-lg rounded-b-none md:rounded-b-lg p-4 md:row-span-5`}>
    {loading ? <LeftScreenLoading/> : children}
</div>;
export const RightScreenContainer: React.FC<PropsWithChildren<Sizeable & Loadable>> = ({
                                                                                           children,
                                                                                           loading = false,
                                                                                           size = 'small'
                                                                                       }) => <div
    className={`min-h-56 max-h-64 md:max-h-[570px]  md:min-h-96  border-slate-400 border-2 md:border-4 bg-sky-700 text-sky-50 rounded-lg rounded-t-none md:rounded-t-lg p-4 overflow-scroll ${size === 'small' ? "md:row-span-4" : 'md:row-span-5'}`}>
    {loading ? <RightScreenLoading/> : children}
</div>;

export const PokedexRoot: React.FC<PropsWithChildren> = ({children}) => (
    <div
        className={"relative grid grid-cols-1 md:grid-cols-2 md:grid-rows-6 md:gap-x-6 md:gap-y-3 bg-red-700 px-12 md:px-6 rounded-xl max-w-lg md:max-w-4xl lg:max-w-5xl xl:max-w-6xl mx-auto pt-8 pb-6 min-h-[726px] max-h-screen"}>
        {children}
        <div className="h-1 rounded-full bg-slate-700 w-full md:col-span-2 mx-auto self-end mt-1.5"></div>
    </div>
);


export const KeyboardButtonContainer: FC<PropsWithChildren<Sizeable>> = ({children, size = 'small'}) => <section
    className={`${size == 'small' ? "row-span-1" : 'row-span-2'} grid grid-cols-2 gap-3  p-3 bg-slate-600 rounded-lg items-center justify-center mt-3 md:mt-0`}>
    {children}
</section>;


const Pokedex = PokedexRoot as typeof PokedexRoot & {
    RightScreen: typeof RightScreenContainer;
    LeftScreen: typeof LeftScreenContainer;
    KeyboardButtons: typeof KeyboardButtonContainer;
    KeyboardButton: typeof KeyboardButton
    TabButtons: typeof TabButtonContainer;
    TabButton: typeof TabButton
}

Pokedex.RightScreen = RightScreenContainer
Pokedex.LeftScreen = LeftScreenContainer;
Pokedex.KeyboardButtons = KeyboardButtonContainer;
Pokedex.KeyboardButton = KeyboardButton
Pokedex.TabButtons = TabButtonContainer;
Pokedex.TabButton = TabButton;


export default Pokedex;



