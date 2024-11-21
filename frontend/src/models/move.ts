import {MoveType, PokemonVariety} from "./pokemon.ts";


export interface Move {
    id: number;
    name: string;
    accuracy: number;
    pp: number;
    priority: number;
    power: number;
    moveType: MoveType;
    moveTypeID: number;
    learnedByPokemon: PokemonVariety[];
}