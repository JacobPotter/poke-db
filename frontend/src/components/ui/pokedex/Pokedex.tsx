import React, {PropsWithChildren} from "react";
import {LeftScreenContainer, RightScreenContainer} from "./PokedexScreens.tsx";
import {TabButton, TabButtonContainer} from "./TabButton.tsx";
import {DualPillVents, KeyboardButton, KeyboardButtonContainer} from "./KeyboardButton.tsx";
import {BlackButton, DPad, LeftHardwareControls, PillButton, StatusDisplay} from "./LeftHardwareControls.tsx";
import {DarkModeButton} from "../DarkModeButton.tsx";
import {RefreshButton} from "../RefreshButton.tsx";

export interface PokedexProps extends PropsWithChildren {
    onRefresh?: () => void;
    refreshLabel?: string;
}

function hasDisplayName(type: unknown, name: string): boolean {
    return typeof type === "function" && "displayName" in type && (type as {
        displayName?: string
    }).displayName === name;
}

export const PokedexRoot: React.FC<PokedexProps> = ({children, onRefresh, refreshLabel = "Refresh data"}) => {
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
            className="relative w-full h-full max-w-full flex flex-col justify-center items-center mx-auto px-0.5 sm:px-1 min-h-0 md:max-h-full">
            {/* Mobile Johto Top Antenna / Carabiner Loop Handle (< md) */}
            <div className="md:hidden flex justify-center -mb-2 sm:-mb-2.5 z-30 relative shrink-0">
                <div
                    className="w-14 sm:w-18 h-4.5 sm:h-5.5 bg-gradient-to-b from-slate-800 to-slate-950 rounded-t-xl border-2 border-slate-700 shadow-md flex items-center justify-center">
                    <div
                        className="w-8 sm:w-10 h-1.5 sm:h-2 rounded-full bg-slate-100 dark:bg-slate-950 border border-slate-700 shadow-inner"></div>
                </div>
            </div>

            {/* Main Pokédex Chassis Body */}
            <div
                data-testid="pokedex-chassis"
                className="relative bg-gradient-to-b from-red-600 via-red-600 to-red-700 dark:from-red-900 dark:via-red-950 dark:to-red-950 border-2 sm:border-4 border-red-800 dark:border-red-950 px-2 sm:px-3 md:px-5 lg:px-6 rounded-2xl md:rounded-3xl pt-1.5 sm:pt-2 md:pt-2.5 lg:pt-3 pb-1.5 sm:pb-2 md:pb-2.5 lg:pb-3 shadow-2xl dark:shadow-black/80 transition-colors flex flex-col justify-between w-full h-full flex-grow min-h-0 max-h-full overflow-hidden">

                {/* Desktop Top Stepped Chassis Header & Sensor Array (>= md) */}
                <div className="hidden md:flex items-center justify-between w-full mb-2 md:mb-2.5 px-1 shrink-0">
                    {/* Left Stepped Array: Glowing Blue Sensor Lens + LED Trio */}
                    <div className="flex items-center gap-2.5 lg:gap-3.5">
                        {/* Large Glowing Blue Sensor Lens */}
                        <div
                            className="relative w-11 h-11 lg:w-12 lg:h-12 rounded-full bg-gradient-to-br from-slate-100 via-slate-300 to-slate-500 border-2 border-slate-700 shadow-xl p-1 flex items-center justify-center">
                            <div
                                className="relative w-full h-full rounded-full bg-gradient-to-br from-sky-400 via-blue-600 to-indigo-900 shadow-[inset_0_0_12px_rgba(255,255,255,0.7),0_0_14px_rgba(59,130,246,0.7)] overflow-hidden animate-pulse">
                                {/* Specular White Highlight */}
                                <div
                                    className="absolute top-1 left-1.5 w-2.5 h-2.5 rounded-full bg-white/90 blur-[0.5px]"></div>
                                <div className="absolute top-1.5 left-2 w-1.5 h-1.5 rounded-full bg-white"></div>
                            </div>
                        </div>

                        {/* Indicator LED Trio: Red, Yellow, Green */}
                        <div className="flex items-center gap-1.5 lg:gap-2">
                            <div
                                className="relative w-3 h-3 md:w-3.5 md:h-3.5 rounded-full bg-gradient-to-br from-red-400 to-red-600 border border-red-900 shadow-[0_0_8px_rgba(239,68,68,0.9)] animate-pulse flex items-center justify-center">
                                <div className="w-1 h-1 rounded-full bg-white/80 absolute top-0.5 left-0.5"></div>
                            </div>
                            <div
                                className="relative w-3 h-3 md:w-3.5 md:h-3.5 rounded-full bg-gradient-to-br from-amber-300 to-amber-500 border border-amber-800 shadow-[0_0_8px_rgba(245,158,11,0.9)] flex items-center justify-center">
                                <div className="w-1 h-1 rounded-full bg-white/80 absolute top-0.5 left-0.5"></div>
                            </div>
                            <div
                                className="relative w-3 h-3 md:w-3.5 md:h-3.5 rounded-full bg-gradient-to-br from-emerald-300 to-emerald-500 border border-emerald-800 shadow-[0_0_8px_rgba(16,185,129,0.9)] flex items-center justify-center">
                                <div className="w-1 h-1 rounded-full bg-white/80 absolute top-0.5 left-0.5"></div>
                            </div>
                        </div>
                    </div>

                    {/* Stepped Seam Line */}
                    <div className="flex-grow mx-4 lg:mx-8 flex items-center">
                        <div className="h-1 bg-red-800/80 dark:bg-red-950 rounded-full w-full shadow-inner"></div>
                    </div>

                    {/* Right Header: Hardware Refresh & Dark Mode Controls */}
                    <div className="flex items-center gap-1.5 sm:gap-2">
                        {onRefresh && (
                            <RefreshButton onClick={onRefresh} ariaLabel={refreshLabel} title={refreshLabel}/>
                        )}
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
                    <div className="flex items-center gap-1.5">
                        {onRefresh && (
                            <RefreshButton onClick={onRefresh} ariaLabel={refreshLabel} title={refreshLabel}/>
                        )}
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
                        {/* Desktop Full-Height Central Vertical Cylindrical Hinge Spine (>= md) */}
                        <div
                            data-testid="desktop-hinge"
                            className="hidden md:flex flex-col justify-between items-center absolute top-0 bottom-0 left-1/2 -translate-x-1/2 z-10 w-5 lg:w-6 bg-gradient-to-r from-slate-900 via-slate-700 to-slate-900 border-x-2 border-slate-950 shadow-2xl pointer-events-none">
                            {/* Top Metallic End-Cap */}
                            <div
                                className="w-full h-8 lg:h-10 bg-gradient-to-r from-slate-600 via-slate-400 to-slate-600 border-b border-slate-900 shadow shrink-0"></div>

                            {/* Central Vertical Grooves */}
                            <div className="flex flex-col gap-6 lg:gap-8 w-full px-0.5 py-4 flex-grow justify-around">
                                <div className="h-0.5 w-full bg-slate-950"></div>
                                <div className="h-0.5 w-full bg-slate-950"></div>
                                <div className="h-0.5 w-full bg-slate-950"></div>
                                <div className="h-0.5 w-full bg-slate-950"></div>
                                <div className="h-0.5 w-full bg-slate-950"></div>
                                <div className="h-0.5 w-full bg-slate-950"></div>
                            </div>

                            {/* Bottom Metallic End-Cap */}
                            <div
                                className="w-full h-8 lg:h-10 bg-gradient-to-r from-slate-600 via-slate-400 to-slate-600 border-t border-slate-900 shadow shrink-0"></div>
                        </div>

                        {/* Desktop Dual-Panel Layout (>= md) */}
                        <div
                            className="hidden md:grid md:grid-cols-[1fr_auto_1fr] md:grid-rows-[1fr] gap-2 sm:gap-2.5 md:gap-2.5 lg:gap-3 items-stretch flex-grow h-full min-h-0 max-h-full">
                            {/* Left Panel: White Screen Frame + Left Lower Hardware Controls */}
                            <div
                                className="flex flex-col gap-2 sm:gap-2.5 md:gap-2.5 lg:gap-3 justify-between h-full min-h-0 flex-1 flex-grow overflow-hidden">
                                {leftScreen}
                                {leftControls || <LeftHardwareControls/>}
                            </div>

                            {/* Center Spine Column Spacer (reserves horizontal grid space for the full-height hinge) */}
                            <div aria-hidden="true" className="w-5 lg:w-6 shrink-0"/>

                            {/* Right Panel: Right Screen Viewport + 2x5 Keypad + Keyboard Controls */}
                            <div
                                className="flex flex-col gap-2 sm:gap-2.5 md:gap-2.5 lg:gap-3 justify-between h-full min-h-0 flex-1 flex-grow overflow-hidden">
                                {rightScreen}
                                {tabButtons}
                                {keyboardButtons}
                                {otherChildren}
                            </div>
                        </div>

                        {/* Mobile Clamshell Flow (< md) */}
                        <div data-testid="pokedex-mobile-clamshell"
                             className="md:hidden flex flex-col gap-1 sm:gap-1.5 w-full flex-1 min-h-0 justify-between">
                            {leftScreen}

                            {/* Mobile Johto Central Horizontal Cylindrical Hinge Bar (< md) */}
                            <div
                                data-testid="mobile-hinge"
                                className="my-0.5 sm:my-1 -mx-2 sm:-mx-3 w-[calc(100%+1rem)] sm:w-[calc(100%+1.5rem)] flex items-center justify-center shrink-0">
                                <div
                                    className="relative w-full h-4 sm:h-5 rounded-none bg-gradient-to-b from-slate-700 via-slate-900 to-slate-800 border-y-2 border-slate-950 shadow-inner flex items-center justify-between px-2 sm:px-3">
                                    <div
                                        className="w-5 h-2.5 sm:w-6 sm:h-3 rounded-sm bg-gradient-to-r from-slate-600 via-slate-400 to-slate-600 border border-slate-900 shadow"></div>
                                    <div className="flex gap-1.5 sm:gap-2">
                                        <div className="w-1.5 h-1.5 rounded-full bg-slate-400 shadow-inner"></div>
                                        <div className="w-1.5 h-1.5 rounded-full bg-slate-400 shadow-inner"></div>
                                        <div className="w-1.5 h-1.5 rounded-full bg-slate-400 shadow-inner"></div>
                                    </div>
                                    <div
                                        className="w-5 h-2.5 sm:w-6 sm:h-3 rounded-sm bg-gradient-to-r from-slate-600 via-slate-400 to-slate-600 border border-slate-900 shadow"></div>
                                </div>
                            </div>

                            {rightScreen}
                            {keyboardButtons}
                            {leftControls}
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
                    className="md:hidden mt-1 pt-1 pb-0.5 flex flex-col items-center justify-center border-t border-red-800/60 dark:border-red-950/80 shrink-0">
                    <div
                        className="relative w-6 h-6 sm:w-7 sm:h-7 rounded-full border-2 border-red-800/80 dark:border-red-950/80 flex items-center justify-center bg-red-800/30 dark:bg-red-950/40 shadow-inner">
                        <div className="w-full h-0.5 bg-red-900/80 dark:bg-red-950 absolute"></div>
                        <div
                            className="relative z-10 w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full bg-white dark:bg-slate-300 border border-slate-800 shadow flex items-center justify-center">
                            <div className="w-1 h-1 rounded-full bg-slate-700"></div>
                        </div>
                    </div>
                </div>

                {/* Desktop Chassis Divider Line (>= md) */}
                <div
                    className="hidden md:block h-1 rounded-full bg-red-900/40 dark:bg-red-950/80 w-full mx-auto self-end mt-1 md:mt-1.5 shrink-0"></div>
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
    RefreshButton: typeof RefreshButton;
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
Pokedex.RefreshButton = RefreshButton;

export default Pokedex;



