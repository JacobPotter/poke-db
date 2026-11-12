import React, {PropsWithChildren} from "react";
import {LeftScreenContainer, RightScreenContainer} from "./PokedexScreens.tsx";
import {TabButton, TabButtonContainer} from "./TabButton.tsx";
import {DualPillVents, KeyboardButton, KeyboardButtonContainer} from "./KeyboardButton.tsx";
import {BlackButton, DPad, LeftHardwareControls, PillButton, StatusDisplay} from "./LeftHardwareControls.tsx";
import {DarkModeButton} from "../DarkModeButton.tsx";

function hasDisplayName(type: unknown, name: string): boolean {
    return typeof type === "function" && "displayName" in type && (type as {
        displayName?: string
    }).displayName === name;
}

export const PokedexRoot: React.FC<PropsWithChildren> = ({children}) => {
    const childrenArray = React.Children.toArray(children) as React.ReactElement[];

    const leftScreen = childrenArray.find(
        c => React.isValidElement(c) && (c.type === LeftScreenContainer || hasDisplayName(c.type, "LeftScreenContainer"))
    );
    const leftControls = childrenArray.find(
        c => React.isValidElement(c) && (c.type === LeftHardwareControls || hasDisplayName(c.type, "LeftHardwareControls"))
    );
    const rightScreen = childrenArray.find(
        c => React.isValidElement(c) && (c.type === RightScreenContainer || hasDisplayName(c.type, "RightScreenContainer"))
    );
    const tabButtons = childrenArray.find(
        c => React.isValidElement(c) && (c.type === TabButtonContainer || hasDisplayName(c.type, "TabButtonContainer"))
    );
    const keyboardButtons = childrenArray.find(
        c => React.isValidElement(c) && (c.type === KeyboardButtonContainer || hasDisplayName(c.type, "KeyboardButtonContainer"))
    );

    const otherChildren = childrenArray.filter(
        c => c !== leftScreen && c !== leftControls && c !== rightScreen && c !== tabButtons && c !== keyboardButtons
    );

    const hasStructuredLayout = Boolean(leftScreen || rightScreen);

    return (
        <div
            className="relative w-full max-w-screen-xl lg:max-w-6xl xl:max-w-7xl 2xl:max-w-[1650px] mx-auto px-1 sm:px-2 md:px-0">
            {/* Mobile Johto Top Antenna / Carabiner Loop Handle (< md) */}
            <div className="md:hidden flex justify-center -mb-3 z-30 relative">
                <div
                    className="w-16 sm:w-20 h-6 sm:h-7 bg-gradient-to-b from-slate-800 to-slate-950 rounded-t-2xl border-2 border-slate-700 shadow-md flex items-center justify-center">
                    <div
                        className="w-9 sm:w-11 h-2 sm:h-2.5 rounded-full bg-slate-100 dark:bg-slate-950 border border-slate-700 shadow-inner"></div>
                </div>
            </div>

            {/* Main Pokédex Chassis Body */}
            <div
                className="relative bg-gradient-to-b from-red-600 via-red-600 to-red-700 dark:from-red-900 dark:via-red-950 dark:to-red-950 border-2 sm:border-4 border-red-800 dark:border-red-950 px-3 sm:px-6 md:px-7 lg:px-9 rounded-3xl md:rounded-3xl pt-3 sm:pt-4 md:pt-5 pb-4 sm:pb-6 min-h-[calc(100vh-2rem)] sm:min-h-[calc(100vh-3rem)] md:min-h-[640px] lg:min-h-[680px] xl:min-h-[720px] shadow-2xl dark:shadow-black/80 transition-colors flex flex-col justify-between">

                {/* Desktop Top Stepped Chassis Header & Sensor Array (>= md) */}
                <div className="hidden md:flex items-center justify-between w-full mb-3 px-1">
                    {/* Left Stepped Array: Glowing Blue Sensor Lens + LED Trio */}
                    <div className="flex items-center gap-3 lg:gap-4">
                        {/* Large Glowing Blue Sensor Lens */}
                        <div
                            className="relative w-12 h-12 lg:w-14 lg:h-14 rounded-full bg-gradient-to-br from-slate-100 via-slate-300 to-slate-500 border-2 border-slate-700 shadow-xl p-1 flex items-center justify-center">
                            <div
                                className="relative w-full h-full rounded-full bg-gradient-to-br from-sky-400 via-blue-600 to-indigo-900 shadow-[inset_0_0_12px_rgba(255,255,255,0.7),0_0_14px_rgba(59,130,246,0.7)] overflow-hidden animate-pulse">
                                {/* Specular White Highlight */}
                                <div
                                    className="absolute top-1 left-1.5 w-3 h-3 rounded-full bg-white/90 blur-[0.5px]"></div>
                                <div className="absolute top-1.5 left-2 w-1.5 h-1.5 rounded-full bg-white"></div>
                            </div>
                        </div>

                        {/* Indicator LED Trio: Red, Yellow, Green */}
                        <div className="flex items-center gap-2 lg:gap-2.5">
                            <div
                                className="relative w-4 h-4 rounded-full bg-gradient-to-br from-red-400 to-red-600 border border-red-900 shadow-[0_0_8px_rgba(239,68,68,0.9)] animate-pulse flex items-center justify-center">
                                <div className="w-1 h-1 rounded-full bg-white/80 absolute top-0.5 left-0.5"></div>
                            </div>
                            <div
                                className="relative w-4 h-4 rounded-full bg-gradient-to-br from-amber-300 to-amber-500 border border-amber-800 shadow-[0_0_8px_rgba(245,158,11,0.9)] flex items-center justify-center">
                                <div className="w-1 h-1 rounded-full bg-white/80 absolute top-0.5 left-0.5"></div>
                            </div>
                            <div
                                className="relative w-4 h-4 rounded-full bg-gradient-to-br from-emerald-300 to-emerald-500 border border-emerald-800 shadow-[0_0_8px_rgba(16,185,129,0.9)] flex items-center justify-center">
                                <div className="w-1 h-1 rounded-full bg-white/80 absolute top-0.5 left-0.5"></div>
                            </div>
                        </div>
                    </div>

                    {/* Stepped Seam Line */}
                    <div className="flex-grow mx-4 lg:mx-8 flex items-center">
                        <div className="h-1 bg-red-800/80 dark:bg-red-950 rounded-full w-full shadow-inner"></div>
                    </div>

                    {/* Right Header: Power Label & Hardware Dark Mode Toggle Switch */}
                    <div className="flex items-center gap-2">
                        <span
                            className="text-[10px] font-mono font-bold tracking-wider text-red-100 dark:text-red-300 uppercase">
                            Power
                        </span>
                        <DarkModeButton/>
                    </div>
                </div>

                {/* Mobile Johto Header (< md) */}
                <div className="md:hidden flex items-center justify-between px-1 mb-1">
                    <div className="flex items-center gap-1.5">
                        <div
                            className="w-3.5 h-3.5 rounded-full bg-gradient-to-br from-emerald-300 to-emerald-500 border border-emerald-700 shadow-sm animate-pulse"></div>
                        <div className="w-2.5 h-2.5 rounded-full bg-red-500 border border-red-700 shadow-sm"></div>
                        <div className="w-2.5 h-2.5 rounded-full bg-amber-400 border border-amber-700 shadow-sm"></div>
                    </div>
                    <div className="flex items-center gap-2">
                        <span
                            className="text-[10px] font-mono tracking-wider font-bold text-red-200 dark:text-red-400 uppercase">
                            Johto
                        </span>
                        <DarkModeButton/>
                    </div>
                </div>

                {/* Mobile Johto Docked Stylus Accent (Right Chassis Rail, < md) */}
                <div
                    className="md:hidden absolute right-1 top-1/2 translate-y-12 w-2 h-28 sm:h-36 rounded-full bg-gradient-to-b from-amber-300 via-amber-500 to-amber-700 border border-amber-900/80 shadow-md pointer-events-none z-20 flex flex-col justify-between py-1 items-center">
                    <div className="w-1.5 h-1.5 rounded-full bg-amber-200 shadow-sm"></div>
                    <div className="w-1 h-8 rounded-full bg-amber-600/60"></div>
                    <div className="w-1.5 h-1.5 rounded-full bg-amber-900 shadow-sm"></div>
                </div>

                {/* Structured Screen & Hardware Content */}
                {hasStructuredLayout ? (
                    <>
                        {/* Desktop Dual-Panel Layout (>= md) */}
                        <div
                            className="hidden md:grid md:grid-cols-[1fr_auto_1fr] gap-3 lg:gap-4 items-stretch flex-grow">
                            {/* Left Panel: White Screen Frame + Left Lower Hardware Controls */}
                            <div className="flex flex-col gap-3 justify-between h-full">
                                {leftScreen}
                                {leftControls || <LeftHardwareControls/>}
                            </div>

                            {/* Central Vertical Cylindrical Hinge Spine */}
                            <div
                                className="flex flex-col justify-between items-center w-5 lg:w-6 h-full min-h-[440px] md:min-h-[460px] lg:min-h-[500px] bg-gradient-to-r from-slate-900 via-slate-700 to-slate-900 border-x-2 border-slate-950 shadow-2xl rounded-sm py-2">
                                <div
                                    className="w-full h-8 bg-gradient-to-r from-slate-600 via-slate-400 to-slate-600 border-y border-slate-900 shadow"></div>
                                <div className="flex flex-col gap-8 lg:gap-10 w-full px-0.5">
                                    <div className="h-0.5 w-full bg-slate-950"></div>
                                    <div className="h-0.5 w-full bg-slate-950"></div>
                                    <div className="h-0.5 w-full bg-slate-950"></div>
                                    <div className="h-0.5 w-full bg-slate-950"></div>
                                </div>
                                <div
                                    className="w-full h-8 bg-gradient-to-r from-slate-600 via-slate-400 to-slate-600 border-y border-slate-900 shadow"></div>
                            </div>

                            {/* Right Panel: Right Screen Viewport + 2x5 Keypad + Keyboard Controls */}
                            <div className="flex flex-col gap-3 justify-between h-full">
                                {rightScreen}
                                {tabButtons}
                                {keyboardButtons}
                                {otherChildren}
                            </div>
                        </div>

                        {/* Mobile Clamshell Flow (< md) */}
                        <div className="md:hidden flex flex-col gap-2 w-full">
                            {leftScreen}
                            {leftControls}
                            {rightScreen}
                            {tabButtons}
                            {keyboardButtons}
                            {otherChildren}
                        </div>
                    </>
                ) : (
                    <div className="w-full flex-grow flex flex-col justify-between">
                        {children}
                    </div>
                )}

                {/* Mobile Johto Bottom Chin Flap with Embossed Pokéball Arc Pattern (< md) */}
                <div
                    className="md:hidden mt-2 pt-2 pb-1 flex flex-col items-center justify-center border-t border-red-800/60 dark:border-red-950/80">
                    <div
                        className="relative w-12 h-12 rounded-full border-2 border-red-800/80 dark:border-red-950/80 flex items-center justify-center bg-red-800/30 dark:bg-red-950/40 shadow-inner">
                        <div className="w-full h-0.5 bg-red-900/80 dark:bg-red-950 absolute"></div>
                        <div
                            className="relative z-10 w-4 h-4 rounded-full bg-white dark:bg-slate-300 border-2 border-slate-800 shadow flex items-center justify-center">
                            <div className="w-1.5 h-1.5 rounded-full bg-slate-700"></div>
                        </div>
                    </div>
                </div>

                {/* Desktop Chassis Divider Line (>= md) */}
                <div
                    className="hidden md:block h-1 rounded-full bg-red-900/40 dark:bg-red-950/80 w-full mx-auto self-end mt-2"></div>
            </div>
        </div>
    );
};

const Pokedex = PokedexRoot as typeof PokedexRoot & {
    RightScreen: typeof RightScreenContainer;
    LeftScreen: typeof LeftScreenContainer;
    KeyboardButtons: typeof KeyboardButtonContainer;
    KeyboardButton: typeof KeyboardButton;
    DualPillVents: typeof DualPillVents;
    PillVents: typeof DualPillVents;
    TabButtons: typeof TabButtonContainer;
    TabButton: typeof TabButton;
    LeftControls: typeof LeftHardwareControls;
    DPad: typeof DPad;
    StatusDisplay: typeof StatusDisplay;
    PillButton: typeof PillButton;
    BlackButton: typeof BlackButton;
};

Pokedex.RightScreen = RightScreenContainer;
Pokedex.LeftScreen = LeftScreenContainer;
Pokedex.KeyboardButtons = KeyboardButtonContainer;
Pokedex.KeyboardButton = KeyboardButton;
Pokedex.DualPillVents = DualPillVents;
Pokedex.PillVents = DualPillVents;
Pokedex.TabButtons = TabButtonContainer;
Pokedex.TabButton = TabButton;
Pokedex.LeftControls = LeftHardwareControls;
Pokedex.DPad = DPad;
Pokedex.StatusDisplay = StatusDisplay;
Pokedex.PillButton = PillButton;
Pokedex.BlackButton = BlackButton;

export default Pokedex;



