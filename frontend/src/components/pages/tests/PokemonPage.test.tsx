import {describe, expect, it, vi} from "vitest";
import {PokemonPage} from "@/components/pages/PokemonPage.tsx";
import {loader} from "@/loaders/pokemon.ts";
import {render} from "@/test/utils";

describe('PokemonPage', () => {
    it("should render properly with active pokemon and pagination indicators", async () => {
        const {container} = render(<PokemonPage/>, {}, loader);

        // Wait until loaded data renders in container (12 items / 6 per page = 2 pages)
        await vi.waitFor(() => {
            expect(container.textContent).toContain("Active Pokemon");
            expect(container.textContent).toContain("1/2");
        });

        const cards = container.querySelectorAll(".hidden.md\\:grid button[aria-label*='#']");
        expect(cards.length).toBe(6);
    });

    it("should clamp invalid pageSize query parameters to default 6 items per page", async () => {
        const {container} = render(
            <PokemonPage/>,
            {},
            loader,
            {pageSize: "invalid_param_999"}
        );

        // 12 total pokemon with clamped 6 items/page equals 2 pages
        await vi.waitFor(() => {
            expect(container.textContent).toContain("1/2");
        });

        const cards = container.querySelectorAll(".hidden.md\\:grid button[aria-label*='#']");
        expect(cards.length).toBe(6);
    });

    it("should navigate to next page and update page indicator when clicking Next Page", async () => {
        const {getByRole, container} = render(<PokemonPage/>, {}, loader);

        await vi.waitFor(() => {
            expect(container.textContent).toContain("Active Pokemon");
            expect(container.textContent).toContain("1/2");
        });

        const nextButtons = getByRole("button", {name: "Next Page"}).elements();
        expect(nextButtons.length).toBeGreaterThan(0);

        (nextButtons[0] as HTMLButtonElement).click();

        await vi.waitFor(() => {
            expect(container.textContent).toContain("2/2");
            expect(container.textContent).toContain("#007 SQUIRTLE");
        });
    });
});
