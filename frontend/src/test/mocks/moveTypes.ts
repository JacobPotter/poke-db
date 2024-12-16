import {MoveTypeResp} from "@/models/pokemon.ts";

export const mockMoveTypeResponse: MoveTypeResp = {
    data: [
        {name: "fire", id: 1},
        {name: "water", id: 2},
        {name: "stellar", id: 999} // This should be filtered out
    ],
    page: 1,
    pageSize: 3,
    total: 3
};
