import {vi} from "vitest";
import useAxios from "axios-hooks";

export const mockUseAxios = vi.mocked(useAxios, {partial: true, deep: true});
