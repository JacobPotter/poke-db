import axios from "axios";
import {EvolutionChainLink} from "@/models/evolution.ts";

export const getEvolutionChain = async (pokemonId: number) => {
    const {data} = await axios.get<EvolutionChainLink>(`/api/v1/evolution/chain/${pokemonId}`);
    return data;
}
