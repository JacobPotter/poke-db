import {createContext, FC, PropsWithChildren} from "react";
import {MoveType, MoveTypeResp} from "../models/pokemon.ts";
import useAxios from "axios-hooks";

export const MoveTypeContext = createContext<{ moveTypes: MoveType[], refresh: VoidFunction, loading: boolean }>({
    moveTypes: [],
    refresh: () => {
    },
    loading: false,
})


export const MoveTypeProvider: FC<PropsWithChildren> = ({children}) => {
    const [{data, loading}, refetch] = useAxios<MoveTypeResp>(
        `/api/v1/type`
    )

    const refresh = () => {
        refetch()
    }

    const filteredData = data?.data.filter(m => m.name !== 'stellar')

    return <MoveTypeContext.Provider
        value={{
            moveTypes: filteredData ?? [],
            loading: loading,
            refresh: refresh
        }}>{children}</MoveTypeContext.Provider>
}