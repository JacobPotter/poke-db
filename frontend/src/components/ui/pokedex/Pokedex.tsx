import React, {PropsWithChildren} from "react";
import {LeftScreenContainer, RightScreenContainer} from "./PokedexScreens.tsx";
import {TabButton, TabButtonContainer} from "./TabButton.tsx";
import {KeyboardButton, KeyboardButtonContainer} from "./KeyboardButton.tsx";


export const PokedexRoot: React.FC<PropsWithChildren> = ({children}) => (
    <div
        className={"relative grid grid-cols-1 gap-1.5 sm:gap-2 md:grid-cols-2 md:grid-rows-7 md:gap-x-6 lg:gap-x-8 bg-red-700 dark:bg-red-900 border-2 sm:border-4 border-red-800 dark:border-red-950 px-3 sm:px-6 md:px-8 lg:px-10 rounded-2xl w-full max-w-screen-xl lg:max-w-6xl xl:max-w-7xl 2xl:max-w-[1650px] mx-auto pt-14 sm:pt-14 md:pt-12 pb-6 min-h-[calc(100vh-2rem)] sm:min-h-[calc(100vh-3rem)] md:min-h-[800px] lg:min-h-[840px] xl:min-h-[880px] shadow-2xl dark:shadow-black/80 transition-colors"}>
        {/* Top Hardware Sensors / Bezel LEDs */}
        <div className="absolute top-3 left-4 sm:top-3.5 sm:left-6 flex items-center gap-2 z-10 pointer-events-none">
            <div
                className="relative w-7 h-7 sm:w-9 sm:h-9 rounded-full bg-gradient-to-br from-cyan-300 via-sky-500 to-blue-700 border-2 border-white/90 shadow-md ring-2 ring-black/20 flex items-center justify-center">
                <div className="absolute top-1 left-1 w-2 h-2 rounded-full bg-white/80 blur-[0.5px]"></div>
            </div>
            <div className="flex items-center gap-1.5 ml-1">
                <div
                    className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full bg-red-500 border border-black/30 shadow-inner"></div>
                <div
                    className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full bg-amber-400 border border-black/30 shadow-inner"></div>
                <div
                    className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full bg-emerald-400 border border-black/30 shadow-inner"></div>
            </div>
        </div>
        {children}
        <div
            className="h-1 rounded-full bg-red-900/40 dark:bg-red-950/80 w-full md:col-span-2 mx-auto self-end mt-2"></div>
    </div>
);


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



