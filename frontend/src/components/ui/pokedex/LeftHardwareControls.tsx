import {FC, ReactNode, forwardRef} from "react";
import {ChevronDownIcon, ChevronLeftIcon, ChevronRightIcon, ChevronUpIcon} from "@heroicons/react/24/solid";
import {
    ArrowPathIcon,
    ChartPieIcon,
    DocumentTextIcon,
    FunnelIcon,
    InformationCircleIcon
} from "@heroicons/react/24/outline";

export interface DPadProps {
    onUp?: () => void;
    onDown?: () => void;
    onLeft?: () => void;
    onRight?: () => void;
    disabled?: boolean;
    className?: string;
    ariaLabel?: string;
}

export const DPad: FC<DPadProps> = ({
                                        onUp,
                                        onDown,
                                        onLeft,
                                        onRight,
                                        disabled = false,
                                        className = "",
                                        ariaLabel = "Directional Pad"
                                    }) => {
    return (
        <div
            role="group"
            aria-label={ariaLabel}
            className={`relative grid grid-cols-3 grid-rows-3 w-16 h-16 sm:w-18 sm:h-18 md:w-24 md:h-24 bg-transparent select-none ${className}`}
        >
            {/* Unified Solid Matte Molded Cross Background */}
            <div
                className="absolute inset-x-1/3 inset-y-0 bg-slate-900 border-2 border-slate-950 rounded-md shadow-inner pointer-events-none"/>
            <div
                className="absolute inset-y-1/3 inset-x-0 bg-slate-900 border-2 border-slate-950 rounded-md shadow-inner pointer-events-none"/>
            <div className="absolute inset-1/3 bg-slate-900 pointer-events-none"/>

            {/* Up Button */}
            <button
                type="button"
                aria-label="D-Pad Up"
                disabled={disabled || !onUp}
                onClick={onUp}
                className="col-start-2 row-start-1 z-10 w-full h-full flex items-center justify-center text-slate-400 hover:text-amber-300 active:text-amber-400 focus:outline-none focus:ring-1 focus:ring-amber-400 rounded-t-md active:bg-slate-950/40 transition-colors disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
            >
                <ChevronUpIcon className="w-3.5 h-3.5 sm:w-4 sm:h-4 md:w-5 md:h-5 drop-shadow"/>
            </button>

            {/* Left Button */}
            <button
                type="button"
                aria-label="D-Pad Left"
                disabled={disabled || !onLeft}
                onClick={onLeft}
                className="col-start-1 row-start-2 z-10 w-full h-full flex items-center justify-center text-slate-400 hover:text-amber-300 active:text-amber-400 focus:outline-none focus:ring-1 focus:ring-amber-400 rounded-l-md active:bg-slate-950/40 transition-colors disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
            >
                <ChevronLeftIcon className="w-3.5 h-3.5 sm:w-4 sm:h-4 md:w-5 md:h-5 drop-shadow"/>
            </button>

            {/* Center Pivot Indicator */}
            <div
                className="col-start-2 row-start-2 z-10 w-2.5 h-2.5 sm:w-3 sm:h-3 md:w-4 md:h-4 m-auto rounded-full bg-slate-900 border-2 border-slate-950 shadow-inner flex items-center justify-center pointer-events-none">
                <div className="w-1 h-1 sm:w-1.5 sm:h-1.5 rounded-full bg-slate-700 shadow-sm"/>
            </div>

            {/* Right Button */}
            <button
                type="button"
                aria-label="D-Pad Right"
                disabled={disabled || !onRight}
                onClick={onRight}
                className="col-start-3 row-start-2 z-10 w-full h-full flex items-center justify-center text-slate-400 hover:text-amber-300 active:text-amber-400 focus:outline-none focus:ring-1 focus:ring-amber-400 rounded-r-md active:bg-slate-950/40 transition-colors disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
            >
                <ChevronRightIcon className="w-3.5 h-3.5 sm:w-4 sm:h-4 md:w-5 md:h-5 drop-shadow"/>
            </button>

            {/* Down Button */}
            <button
                type="button"
                aria-label="D-Pad Down"
                disabled={disabled || !onDown}
                onClick={onDown}
                className="col-start-2 row-start-3 z-10 w-full h-full flex items-center justify-center text-slate-400 hover:text-amber-300 active:text-amber-400 focus:outline-none focus:ring-1 focus:ring-amber-400 rounded-b-md active:bg-slate-950/40 transition-colors disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
            >
                <ChevronDownIcon className="w-3.5 h-3.5 sm:w-4 sm:h-4 md:w-5 md:h-5 drop-shadow"/>
            </button>
        </div>
    );
};

export interface StatusDisplayProps {
    text?: string;
    label?: string;
    className?: string;
}

export const StatusDisplay: FC<StatusDisplayProps> = ({
                                                          text = "READY",
                                                          label = "Status",
                                                          className = ""
                                                      }) => {
    return (
        <div className={`flex flex-col items-start w-full ${className}`}>
            {label && (
                <span
                    className="text-[9px] sm:text-[10px] md:text-xs font-mono font-extrabold tracking-wider text-emerald-300 dark:text-emerald-300 uppercase mb-0.5 sm:mb-1 drop-shadow-sm">
                    {label}
                </span>
            )}
            <div
                role="status"
                aria-label={`Status: ${text}`}
                className="w-full min-w-[110px] sm:min-w-[140px] md:min-w-[165px] max-w-[250px] h-7 sm:h-8 md:h-10 px-2 sm:px-2.5 md:px-3.5 py-0.5 sm:py-1 md:py-1.5 bg-gradient-to-b from-emerald-400 to-emerald-500 dark:from-emerald-500 dark:to-emerald-600 border-2 border-emerald-800 dark:border-emerald-950 rounded-lg shadow-inner flex items-center justify-center select-none"
            >
                <span
                    className="font-mono font-bold text-xs sm:text-sm md:text-base text-slate-950 tracking-wider truncate drop-shadow-sm">
                    {text}
                </span>
            </div>
        </div>
    );
};

export interface PillButtonProps {
    color?: "red" | "cyan" | "slate" | "amber";
    size?: "small" | "medium" | "large";
    selected?: boolean;
    role?: string;
    ariaChecked?: boolean | "true" | "false";
    tabIndex?: number;
    onClick?: () => void;
    onKeyDown?: (e: React.KeyboardEvent<HTMLButtonElement>) => void;
    disabled?: boolean;
    ariaLabel?: string;
    label?: string;
    title?: string;
    className?: string;
    id?: string;
    children?: ReactNode;
}

export const PillButton = forwardRef<HTMLButtonElement, PillButtonProps>(({
                                                                              color = "red",
                                                                              size = "small",
                                                                              selected = false,
                                                                              role,
                                                                              ariaChecked,
                                                                              tabIndex,
                                                                              onClick,
                                                                              onKeyDown,
                                                                              disabled = false,
                                                                              ariaLabel,
                                                                              label,
                                                                              title,
                                                                              className = "",
                                                                              id,
                                                                              children
                                                                          }, ref) => {
    let colorStyles = "";
    if (selected) {
        if (color === "red") {
            colorStyles = "bg-gradient-to-b from-red-400 via-red-500 to-red-600 border-red-300 text-white shadow-[0_0_16px_rgba(239,68,68,0.85),inset_0_1px_2px_rgba(255,255,255,0.7),inset_0_0_8px_rgba(254,202,202,0.6)] brightness-110";
        } else if (color === "cyan") {
            colorStyles = "bg-gradient-to-b from-sky-300 via-sky-400 to-sky-500 border-sky-200 text-white shadow-[0_0_16px_rgba(56,189,248,0.85),inset_0_1px_2px_rgba(255,255,255,0.8),inset_0_0_8px_rgba(186,230,253,0.6)] brightness-110";
        } else if (color === "amber") {
            colorStyles = "bg-gradient-to-b from-amber-300 via-amber-400 to-amber-500 border-amber-200 text-amber-950 shadow-[0_0_16px_rgba(245,158,11,0.85),inset_0_1px_2px_rgba(255,255,255,0.8),inset_0_0_8px_rgba(254,243,199,0.7)] brightness-110";
        } else if (color === "slate") {
            colorStyles = "bg-gradient-to-b from-slate-400 via-slate-500 to-slate-600 border-slate-300 text-white shadow-[0_0_14px_rgba(148,163,184,0.75),inset_0_1px_2px_rgba(255,255,255,0.6),inset_0_0_6px_rgba(241,245,249,0.5)] brightness-110";
        }
    } else {
        if (color === "red") {
            colorStyles = "bg-gradient-to-b from-red-600 via-red-700 to-red-900 border-red-950/80 text-red-100 shadow-[inset_0_1.5px_0_rgba(255,255,255,0.35),0_2px_4px_rgba(0,0,0,0.5)] hover:from-red-500 hover:via-red-600 hover:to-red-800 active:translate-y-0.5 active:shadow-[inset_0_2px_4px_rgba(0,0,0,0.7)]";
        } else if (color === "cyan") {
            colorStyles = "bg-gradient-to-b from-sky-500 via-sky-600 to-sky-800 border-sky-950/80 text-sky-100 shadow-[inset_0_1.5px_0_rgba(255,255,255,0.4),0_2px_4px_rgba(0,0,0,0.5)] hover:from-sky-400 hover:via-sky-500 hover:to-sky-700 active:translate-y-0.5 active:shadow-[inset_0_2px_4px_rgba(0,0,0,0.7)]";
        } else if (color === "amber") {
            colorStyles = "bg-gradient-to-b from-amber-500 via-amber-600 to-amber-800 border-amber-950/80 text-amber-950 shadow-[inset_0_1.5px_0_rgba(255,255,255,0.45),0_2px_4px_rgba(0,0,0,0.5)] hover:from-amber-400 hover:via-amber-500 hover:to-amber-700 active:translate-y-0.5 active:shadow-[inset_0_2px_4px_rgba(0,0,0,0.7)]";
        } else if (color === "slate") {
            colorStyles = "bg-gradient-to-b from-slate-600 via-slate-700 to-slate-800 border-slate-950/80 text-slate-100 shadow-[inset_0_1.5px_0_rgba(255,255,255,0.25),0_2px_4px_rgba(0,0,0,0.5)] hover:from-slate-500 hover:via-slate-600 hover:to-slate-700 active:translate-y-0.5 active:shadow-[inset_0_2px_4px_rgba(0,0,0,0.7)]";
        }
    }

    let sizeStyles = "w-10 h-3 sm:w-11 sm:h-3 md:w-12 md:h-3.5";
    if (size === "large") {
        sizeStyles = "w-full h-8 sm:h-9 md:h-9.5 lg:h-10";
    } else if (size === "medium") {
        sizeStyles = "w-14 sm:w-16 h-6 sm:h-7";
    }

    const buttonAria = ariaLabel || label || title || `${color} switch`;
    const checkedState = ariaChecked !== undefined ? ariaChecked : (role === "radio" ? selected : undefined);

    return (
        <button
            ref={ref}
            id={id}
            type="button"
            role={role}
            aria-checked={checkedState}
            tabIndex={tabIndex}
            aria-label={buttonAria}
            title={title || buttonAria}
            disabled={disabled}
            onClick={onClick}
            onKeyDown={onKeyDown}
            className={`${sizeStyles} rounded-full border-2 transition-all duration-150 select-none flex items-center justify-center cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed focus:outline-none focus-visible:ring-2 focus-visible:ring-white/90 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-900 ${colorStyles} ${className}`}
        >
            {children}
        </button>
    );
});

PillButton.displayName = "PillButton";

export interface BlackButtonProps {
    onClick?: () => void;
    disabled?: boolean;
    ariaLabel?: string;
    label?: string;
    className?: string;
    children?: ReactNode;
}

export const BlackButton: FC<BlackButtonProps> = ({
                                                      onClick,
                                                      disabled = false,
                                                      ariaLabel = "Action Button",
                                                      label,
                                                      className = "",
                                                      children
                                                  }) => {
    const accessibleLabel = ariaLabel || label;
    return (
        <button
            type="button"
            aria-label={accessibleLabel}
            title={accessibleLabel}
            disabled={disabled}
            onClick={onClick}
            className={`w-7 h-7 sm:w-8 sm:h-8 md:w-10 md:h-10 rounded-full bg-gradient-to-b from-slate-700 via-slate-800 to-slate-950 border-2 border-slate-950 shadow-lg active:scale-95 active:shadow-inner hover:brightness-110 focus:outline-none focus:ring-2 focus:ring-amber-400 transition-all flex items-center justify-center text-slate-200 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer ${className}`}
        >
            {children || <div className="w-2 h-2 sm:w-2.5 sm:h-2.5 rounded-full bg-slate-600 shadow-inner"></div>}
        </button>
    );
};

export interface LeftHardwareControlsProps {
    dpad?: DPadProps;
    statusText?: string;
    statusLabel?: string;
    onBlackButtonClick?: () => void;
    blackButtonLabel?: string;
    onSummaryClick?: () => void;
    summaryLabel?: string;
    onStatsClick?: () => void;
    statsLabel?: string;
    onEvolutionsClick?: () => void;
    evolutionsLabel?: string;
    currentTab?: "summary" | "stats" | "evolutions" | string;
    onFilterClick?: () => void;
    filterLabel?: string;
    isFilterActive?: boolean;
    onRefreshClick?: () => void;
    refreshLabel?: string;
    onRedPillClick?: () => void;
    redPillLabel?: string;
    onCyanPillClick?: () => void;
    cyanPillLabel?: string;
    className?: string;
    children?: ReactNode;
}

export const LeftHardwareControls: FC<LeftHardwareControlsProps> = ({
                                                                        dpad,
                                                                        statusText = "READY",
                                                                        statusLabel,
                                                                        onBlackButtonClick,
                                                                        blackButtonLabel = "Action",
                                                                        onSummaryClick,
                                                                        summaryLabel = "Summary",
                                                                        onStatsClick,
                                                                        statsLabel,
                                                                        onEvolutionsClick,
                                                                        evolutionsLabel,
                                                                        currentTab,
                                                                        onFilterClick,
                                                                        filterLabel = "Filter",
                                                                        isFilterActive = false,
                                                                        onRefreshClick,
                                                                        refreshLabel = "Refresh",
                                                                        onRedPillClick,
                                                                        redPillLabel = "Option A",
                                                                        onCyanPillClick,
                                                                        cyanPillLabel = "Option B",
                                                                        className = "",
                                                                        children
                                                                    }) => {
    const hasCustomPills = Boolean(
        onSummaryClick || onStatsClick || onEvolutionsClick || onFilterClick || onRefreshClick
    );

    return (
        <div
            data-testid="left-hardware-controls"
            className={`w-full shrink-0 bg-slate-800/90 md:bg-slate-800/95 dark:bg-slate-900/90 dark:md:bg-slate-950 p-1 sm:p-1.5 md:p-2 rounded-xl border-2 border-slate-700/80 dark:border-slate-800 shadow-inner flex items-center justify-between gap-1.5 sm:gap-2 md:gap-3 ${className}`}
        >
            {children || (
                <>
                    {/* Left Section: Circular Black Button (Audio) */}
                    <div className="flex flex-col items-center gap-1 shrink-0">
                        <BlackButton
                            onClick={onBlackButtonClick}
                            ariaLabel={blackButtonLabel}
                        />
                        <span
                            className="text-[9px] font-mono font-bold text-slate-400 dark:text-slate-400 uppercase tracking-wider">
                            Audio
                        </span>
                    </div>

                    {/* Middle Section: Grouped Pill Controls + Green LCD Readout */}
                    <div
                        className="flex flex-col items-center gap-1 flex-grow max-w-[250px] sm:max-w-[290px] md:max-w-[325px]">
                        {hasCustomPills ? (
                            <div className="flex items-center justify-center flex-wrap gap-1 sm:gap-1.5">
                                {/* Summary View Pill */}
                                {onSummaryClick && (
                                    <PillButton
                                        color="slate"
                                        onClick={onSummaryClick}
                                        selected={currentTab === 'summary'}
                                        ariaLabel={summaryLabel}
                                        title={summaryLabel}
                                        className="!w-7 !h-4.5 sm:!w-8 sm:!h-5"
                                    >
                                        <InformationCircleIcon className="w-3 h-3 text-sky-200 drop-shadow-sm"/>
                                    </PillButton>
                                )}

                                {/* Base Stats View Pill */}
                                {(onStatsClick || (!onFilterClick && onRedPillClick)) && (
                                    <PillButton
                                        color="red"
                                        onClick={onStatsClick || onRedPillClick}
                                        selected={currentTab === 'stats'}
                                        ariaLabel={statsLabel || redPillLabel || "View Base Stats"}
                                        title={statsLabel || redPillLabel || "View Base Stats"}
                                        className="!w-7 !h-4.5 sm:!w-8 sm:!h-5"
                                    >
                                        <DocumentTextIcon className="w-3 h-3 text-white drop-shadow-sm"/>
                                    </PillButton>
                                )}

                                {/* Evolution Chain View Pill */}
                                {(onEvolutionsClick || (!onRefreshClick && onCyanPillClick)) && (
                                    <PillButton
                                        color="cyan"
                                        onClick={onEvolutionsClick || onCyanPillClick}
                                        selected={currentTab === 'evolutions'}
                                        ariaLabel={evolutionsLabel || cyanPillLabel || "View Evolution Chain"}
                                        title={evolutionsLabel || cyanPillLabel || "View Evolution Chain"}
                                        className="!w-7 !h-4.5 sm:!w-8 sm:!h-5"
                                    >
                                        <ChartPieIcon className="w-3 h-3 text-white drop-shadow-sm"/>
                                    </PillButton>
                                )}

                                {/* Filter Pill Button */}
                                {onFilterClick && (
                                    <PillButton
                                        color={isFilterActive ? "amber" : "slate"}
                                        onClick={onFilterClick}
                                        ariaLabel={filterLabel}
                                        title={filterLabel}
                                        className="!w-7 !h-4.5 sm:!w-8 sm:!h-5 relative"
                                    >
                                        <FunnelIcon className="w-3 h-3 text-white drop-shadow-sm"/>
                                        {isFilterActive && (
                                            <span
                                                className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-red-500 ring-1 ring-slate-900 animate-pulse"/>
                                        )}
                                    </PillButton>
                                )}

                                {/* Refresh Pill Button */}
                                {onRefreshClick && (
                                    <PillButton
                                        color="slate"
                                        onClick={onRefreshClick}
                                        ariaLabel={refreshLabel}
                                        title={refreshLabel}
                                        className="!w-7 !h-4.5 sm:!w-8 sm:!h-5"
                                    >
                                        <ArrowPathIcon className="w-3 h-3 text-white drop-shadow-sm"/>
                                    </PillButton>
                                )}
                            </div>
                        ) : (onRedPillClick || onCyanPillClick) ? (
                            <div className="flex items-center justify-center gap-2 sm:gap-3">
                                <PillButton
                                    color="red"
                                    onClick={onRedPillClick}
                                    ariaLabel={redPillLabel}
                                    title={redPillLabel}
                                />
                                <PillButton
                                    color="cyan"
                                    onClick={onCyanPillClick}
                                    ariaLabel={cyanPillLabel}
                                    title={cyanPillLabel}
                                />
                            </div>
                        ) : null}
                        <StatusDisplay text={statusText} label={statusLabel}/>
                    </div>

                    {/* Right Section: Tactile Black D-Pad */}
                    <div className="flex items-center justify-center shrink-0">
                        <DPad {...dpad} />
                    </div>
                </>
            )}
        </div>
    );
};
