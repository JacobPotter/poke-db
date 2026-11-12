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
            expect(dpad.className).toContain("lg:w-[104px]");
            expect(dpad.className).toContain("lg:h-[104px]");

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
        it("should render formatted text and label correctly", () => {
            const {getByText, getByRole} = render(
                <StatusDisplay text="#025 PIKACHU" label="Target Pokemon"/>
            );

            expect(getByText("Target Pokemon")).not.toBeNull();
            expect(getByText("#025 PIKACHU")).not.toBeNull();
            expect(getByRole("status")).not.toBeNull();
        });
    });

    describe("PillButton Component", () => {
        it("should render red and cyan pill buttons with click events", async () => {
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

            await redBtn.click();
            expect(onRed).toHaveBeenCalledTimes(1);

            await cyanBtn.click();
            expect(onCyan).toHaveBeenCalledTimes(1);
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
    });
});
