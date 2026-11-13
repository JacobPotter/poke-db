import {describe, expect, it, vi} from "vitest";
import {render} from "vitest-browser-react";
import {BlackButton, DPad, LeftHardwareControls, PillButton, StatusDisplay} from "../LeftHardwareControls.tsx";

describe("LeftHardwareControls", () => {
    describe("DPad Component", () => {
        it("should render 4 directional buttons and trigger callbacks on click", async () => {
            const onUp = vi.fn();
            const onDown = vi.fn();
            const onLeft = vi.fn();
            const onRight = vi.fn();

            const {getByRole} = render(
                <DPad
                    onUp={onUp}
                    onDown={onDown}
                    onLeft={onLeft}
                    onRight={onRight}
                />
            );

            const upBtn = getByRole("button", {name: "D-Pad Up"});
            const downBtn = getByRole("button", {name: "D-Pad Down"});
            const leftBtn = getByRole("button", {name: "D-Pad Left"});
            const rightBtn = getByRole("button", {name: "D-Pad Right"});

            expect(upBtn).not.toBeNull();
            expect(downBtn).not.toBeNull();
            expect(leftBtn).not.toBeNull();
            expect(rightBtn).not.toBeNull();

            await upBtn.click();
            expect(onUp).toHaveBeenCalledTimes(1);

            await downBtn.click();
            expect(onDown).toHaveBeenCalledTimes(1);

            await leftBtn.click();
            expect(onLeft).toHaveBeenCalledTimes(1);

            await rightBtn.click();
            expect(onRight).toHaveBeenCalledTimes(1);
        });

        it("should use uniform matte molding and the intended desktop size", () => {
            const {getByRole} = render(
                <DPad
                    onUp={vi.fn()}
                    onDown={vi.fn()}
                    onLeft={vi.fn()}
                    onRight={vi.fn()}
                />
            );

            const dpad = getByRole("group", {name: "Directional Pad"}).element();
            expect(dpad.className).toContain("md:w-24");
            expect(dpad.className).toContain("md:h-24");

            const molding = dpad.querySelectorAll(":scope > div.absolute");
            expect(molding.length).toBe(3);
            molding.forEach(part => {
                expect(part.classList.contains("bg-slate-900")).toBe(true);
            });
            Array.from(molding).slice(0, 2).forEach(arm => {
                expect(arm.classList.contains("border-2")).toBe(true);
                expect(arm.classList.contains("border-slate-950")).toBe(true);
                expect(arm.classList.contains("shadow-inner")).toBe(true);
            });

            const pivot = dpad.querySelector("div.rounded-full");
            expect(pivot?.classList.contains("bg-slate-900")).toBe(true);
            expect(pivot?.classList.contains("border-2")).toBe(true);
            expect(pivot?.classList.contains("border-slate-950")).toBe(true);
            expect(pivot?.classList.contains("shadow-inner")).toBe(true);
        });

        it("should disable all buttons when disabled prop is true", () => {
            const onUp = vi.fn();
            const onDown = vi.fn();
            const onLeft = vi.fn();
            const onRight = vi.fn();

            const {container} = render(
                <DPad
                    disabled={true}
                    onUp={onUp}
                    onDown={onDown}
                    onLeft={onLeft}
                    onRight={onRight}
                />
            );

            const buttons = container.querySelectorAll("button");
            expect(buttons.length).toBe(4);
            buttons.forEach(btn => {
                expect(btn.disabled).toBe(true);
                expect(btn.classList.contains("disabled:opacity-40")).toBe(true);
            });

            const molding = container.querySelectorAll("div.absolute");
            molding.forEach(part => {
                expect(part.classList.contains("bg-slate-900")).toBe(true);
            });
        });

        it("should disable individual directions when their handlers are missing", () => {
            const onLeft = vi.fn();
            const onRight = vi.fn();

            const {container} = render(
                <DPad onLeft={onLeft} onRight={onRight}/>
            );

            const upBtn = container.querySelector<HTMLButtonElement>("button[aria-label='D-Pad Up']");
            const downBtn = container.querySelector<HTMLButtonElement>("button[aria-label='D-Pad Down']");
            const leftBtn = container.querySelector<HTMLButtonElement>("button[aria-label='D-Pad Left']");
            const rightBtn = container.querySelector<HTMLButtonElement>("button[aria-label='D-Pad Right']");

            expect(upBtn?.disabled).toBe(true);
            expect(downBtn?.disabled).toBe(true);
            expect(leftBtn?.disabled).toBe(false);
            expect(rightBtn?.disabled).toBe(false);
        });
    });

    describe("StatusDisplay Component", () => {
        it("should render formatted text and label correctly with high-contrast styling", () => {
            const {getByText, getByRole} = render(
                <StatusDisplay text="#025 PIKACHU" label="Target Pokemon"/>
            );

            const labelEl = getByText("Target Pokemon").element();
            expect(labelEl).not.toBeNull();
            expect(labelEl.className).toContain("text-emerald-300");
            expect(labelEl.className).toContain("font-extrabold");
            expect(getByText("#025 PIKACHU")).not.toBeNull();
            expect(getByRole("status")).not.toBeNull();
        });
    });

    describe("PillButton Component", () => {
        it("should render red and cyan pill buttons with click events and 3D physical styling", async () => {
            const onRed = vi.fn();
            const onCyan = vi.fn();

            const {getByRole} = render(
                <div className="flex gap-2">
                    <PillButton color="red" ariaLabel="Option Red" onClick={onRed}/>
                    <PillButton color="cyan" ariaLabel="Option Cyan" onClick={onCyan}/>
                </div>
            );

            const redBtn = getByRole("button", {name: "Option Red"});
            const cyanBtn = getByRole("button", {name: "Option Cyan"});

            expect(redBtn.element().className).toContain("shadow-[inset_0_1.5px_0_rgba(255,255,255,0.35),0_2px_4px_rgba(0,0,0,0.5)]");
            expect(cyanBtn.element().className).toContain("shadow-[inset_0_1.5px_0_rgba(255,255,255,0.4),0_2px_4px_rgba(0,0,0,0.5)]");
            expect(redBtn.element().className).not.toContain("ring-amber-400");

            await redBtn.click();
            expect(onRed).toHaveBeenCalledTimes(1);

            await cyanBtn.click();
            expect(onCyan).toHaveBeenCalledTimes(1);
        });

        it("should render backlit LED glow without yellow outline ring when selected across colors", () => {
            const {getByRole} = render(
                <div className="flex gap-2">
                    <PillButton color="red" selected={true} ariaLabel="Selected Red"/>
                    <PillButton color="cyan" selected={true} ariaLabel="Selected Cyan"/>
                    <PillButton color="amber" selected={true} ariaLabel="Selected Amber"/>
                    <PillButton color="slate" selected={true} ariaLabel="Selected Slate"/>
                </div>
            );

            const redBtn = getByRole("button", {name: "Selected Red"});
            const cyanBtn = getByRole("button", {name: "Selected Cyan"});
            const amberBtn = getByRole("button", {name: "Selected Amber"});
            const slateBtn = getByRole("button", {name: "Selected Slate"});

            // Red LED glow
            expect(redBtn.element().className).toContain("shadow-[0_0_16px_rgba(239,68,68,0.85)");
            expect(redBtn.element().className).not.toContain("ring-amber-400");

            // Cyan LED glow
            expect(cyanBtn.element().className).toContain("shadow-[0_0_16px_rgba(56,189,248,0.85)");
            expect(cyanBtn.element().className).not.toContain("ring-amber-400");

            // Amber LED glow
            expect(amberBtn.element().className).toContain("shadow-[0_0_16px_rgba(245,158,11,0.85)");
            expect(amberBtn.element().className).not.toContain("ring-amber-400");

            // Slate LED glow
            expect(slateBtn.element().className).toContain("shadow-[0_0_14px_rgba(148,163,184,0.75)");
            expect(slateBtn.element().className).not.toContain("ring-amber-400");
        });

        it("should support radio role, aria-checked, tabIndex, and keyboard events", () => {
            const onKeyDown = vi.fn();

            const {getByRole} = render(
                <div role="radiogroup" aria-label="Controls">
                    <PillButton
                        role="radio"
                        color="red"
                        selected={true}
                        tabIndex={0}
                        ariaLabel="Radio 1"
                        onKeyDown={onKeyDown}
                    />
                    <PillButton
                        role="radio"
                        color="cyan"
                        selected={false}
                        tabIndex={-1}
                        ariaLabel="Radio 2"
                    />
                </div>
            );

            const radio1 = getByRole("radio", {name: "Radio 1"});
            const radio2 = getByRole("radio", {name: "Radio 2"});

            expect(radio1.element().getAttribute("aria-checked")).toBe("true");
            expect(radio1.element().getAttribute("tabindex")).toBe("0");
            expect(radio2.element().getAttribute("aria-checked")).toBe("false");
            expect(radio2.element().getAttribute("tabindex")).toBe("-1");

            radio1.element().dispatchEvent(new KeyboardEvent("keydown", {key: "ArrowRight", bubbles: true}));
            expect(onKeyDown).toHaveBeenCalledTimes(1);
        });

        it("should have distinct high-contrast keyboard focus styling separate from selection glow", () => {
            const {getByRole} = render(
                <PillButton color="red" ariaLabel="Focusable Button"/>
            );

            const btn = getByRole("button", {name: "Focusable Button"});
            expect(btn.element().className).toContain("focus-visible:ring-2");
            expect(btn.element().className).toContain("focus-visible:ring-white/90");
            expect(btn.element().className).toContain("focus-visible:ring-offset-2");
        });
    });

    describe("BlackButton Component", () => {
        it("should render circular black action button and handle click", async () => {
            const onClick = vi.fn();

            const {getByRole} = render(
                <BlackButton ariaLabel="Cry Audio" onClick={onClick}/>
            );

            const btn = getByRole("button", {name: "Cry Audio"});
            await btn.click();
            expect(onClick).toHaveBeenCalledTimes(1);
        });
    });

    describe("Full LeftHardwareControls Tray", () => {
        it("should render all controls within the tray and route events properly", async () => {
            const onBlackBtn = vi.fn();
            const onRed = vi.fn();
            const onCyan = vi.fn();
            const onLeft = vi.fn();
            const onRight = vi.fn();

            const {getByRole, getByText, getByTestId} = render(
                <LeftHardwareControls
                    statusText="#004 CHARMANDER"
                    statusLabel="Active"
                    onBlackButtonClick={onBlackBtn}
                    blackButtonLabel="Play Cry"
                    onRedPillClick={onRed}
                    redPillLabel="Toggle Shiny"
                    onCyanPillClick={onCyan}
                    cyanPillLabel="Toggle Female"
                    dpad={{
                        onLeft,
                        onRight
                    }}
                />
            );

            const tray = getByTestId("left-hardware-controls").element();
            expect(tray).not.toBeNull();
            expect(tray.className).toContain("bg-slate-800/90");
            expect(tray.className).toContain("dark:bg-slate-900");
            expect(getByText("#004 CHARMANDER")).not.toBeNull();
            expect(getByText("Active")).not.toBeNull();
            expect(getByText("Audio")).not.toBeNull();

            const cryBtn = getByRole("button", {name: "Play Cry"});
            await cryBtn.click();
            expect(onBlackBtn).toHaveBeenCalledTimes(1);

            const redBtn = getByRole("button", {name: "Toggle Shiny"});
            await redBtn.click();
            expect(onRed).toHaveBeenCalledTimes(1);

            const cyanBtn = getByRole("button", {name: "Toggle Female"});
            await cyanBtn.click();
            expect(onCyan).toHaveBeenCalledTimes(1);

            const leftBtn = getByRole("button", {name: "D-Pad Left"});
            await leftBtn.click();
            expect(onLeft).toHaveBeenCalledTimes(1);

            const rightBtn = getByRole("button", {name: "D-Pad Right"});
            await rightBtn.click();
            expect(onRight).toHaveBeenCalledTimes(1);
        });

        it("should render filter and refresh buttons with active filter state indicator", async () => {
            const onFilter = vi.fn();
            const onRefresh = vi.fn();

            const {getByRole} = render(
                <LeftHardwareControls
                    statusText="#025 PIKACHU"
                    onFilterClick={onFilter}
                    filterLabel="Open Filter"
                    isFilterActive={true}
                    onRefreshClick={onRefresh}
                    refreshLabel="Refresh Pokemon"
                />
            );

            const filterBtn = getByRole("button", {name: "Open Filter"});
            const refreshBtn = getByRole("button", {name: "Refresh Pokemon"});

            expect(filterBtn).not.toBeNull();
            expect(refreshBtn).not.toBeNull();

            // Verify active pulse indicator dot on filter button
            const pulseDot = filterBtn.element().querySelector("span.animate-pulse");
            expect(pulseDot).not.toBeNull();

            await filterBtn.click();
            expect(onFilter).toHaveBeenCalledTimes(1);

            await refreshBtn.click();
            expect(onRefresh).toHaveBeenCalledTimes(1);
        });
    });
});
