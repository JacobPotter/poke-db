import {MoveType} from "@/models/pokemon.ts";
import {useQuery} from "@tanstack/react-query";

import {MOVE_TYPE_DEFAULT_QUERY_OPTIONS} from "@/query/keyFactories.ts";

export const useMoveTypes = () => {
    const fallback: MoveType[] = []

    const {data = fallback} = useQuery(MOVE_TYPE_DEFAULT_QUERY_OPTIONS)

    return data
}
