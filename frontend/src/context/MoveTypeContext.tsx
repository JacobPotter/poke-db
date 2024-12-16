import {createContext, FC, PropsWithChildren, useCallback} from "react";
import {MoveType} from "../models/pokemon.ts";
import {useQuery} from "@tanstack/react-query";
import {MOVE_TYPE_DEFAULT_QUERY_OPTIONS} from "@/query/keyFactories.ts";

export interface MoveContextType {
    moveTypes: MoveType[],
    refresh: VoidFunction,
    loading: boolean
}

export const MoveTypeContext = createContext<MoveContextType>({
    moveTypes: [],
    refresh: () => {
    },
    loading: false,
})


export const MoveTypeProvider: FC<PropsWithChildren> = ({children}) => {
    const {data, isLoading: loading, refetch} = useQuery(MOVE_TYPE_DEFAULT_QUERY_OPTIONS)
    const refresh = useCallback(() => {
        refetch()
    }, [refetch])

    const filteredData = data?.filter(m => m.name.toLowerCase() !== 'stellar')

    return <MoveTypeContext.Provider
        value={{
            moveTypes: filteredData ?? [],
            loading: loading,
            refresh: refresh
        }}>{children}</MoveTypeContext.Provider>
}
