import "./index.css"
import 'vitest-browser-react'
import '@testing-library/jest-dom/vitest';
import {beforeEach, vi} from "vitest";
// import 'vitest-canvas-mock'

beforeEach(() => {
    // Mocking the axios-hooks
    vi.mock("axios-hooks", () => ({
        __esModule: true,
        default: vi.fn(),
    }));
})
