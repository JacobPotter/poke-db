// jest-dom adds custom jest matchers for asserting on DOM nodes.
// allows you to do things like:
// expect(element).toHaveTextContent(/react/i)
// learn more: https://github.com/testing-library/jest-dom
import "./index.css"
import 'vitest-browser-react'
import '@testing-library/jest-dom/vitest';
import {beforeAll, afterAll, afterEach} from "vitest";
// import 'vitest-canvas-mock'

// https://www.npmjs.com/package/@testing-library/jest-dom#with-another-jest-compatible-expect
import * as matchers from "@testing-library/jest-dom/matchers";
import {expect} from "vitest";

// for msw
import {worker} from "./test/mocks/worker.ts";

// add jest-dom matchers
expect.extend(matchers);


// msw setup and teardown below
// Establish API mocking before all tests.
beforeAll(() => worker.start());

// Reset any request handlers that we may add during the tests,
// so they don't affect other tests.
afterEach(() => worker.resetHandlers());

// Clean up after the tests are finished.
afterAll(() => worker.stop());
