import {MoveType, PokemonSpecies} from "./pokemon.ts";
import {Item} from "./item.ts";
import {Move} from "./move.ts";

export interface EvolutionChain {
    id?: number;
    babyTriggerItem?: Item;
    babyTriggerItemId?: number;
    chainLink?: EvolutionChainLink;
    chainLinkId?: number;
}

export interface EvolutionChainLink {
    id?: number;
    isBaby?: boolean;
    pokemonSpecies: Partial<PokemonSpecies>;
    pokemonSpeciesId: number;
    evolutionDetails?: EvolutionDetails[];
    evolvesTo?: EvolutionChainLink[];
    evolvesFrom?: EvolutionChainLink;
    evolvesFromId?: number;
}

export interface EvolutionDetails {
    item?: Item;
    itemId?: number;
    trigger?: EvolutionTrigger;
    triggerId?: number;
    genderId?: number;
    heldItem?: Item;
    heldItemId?: number;
    knownMove?: Move;
    knownMoveId?: number;
    knownMoveType?: MoveType;
    knownMoveTypeId?: number;
    location?: Location;
    locationId?: number;
    minLevel?: number;
    minHappiness?: number;
    minBeauty?: number;
    minAffection?: number;
    needsOverworldRain?: boolean;
    partySpecies?: PokemonSpecies;
    partySpeciesId?: number;
    partyType?: MoveType;
    partyTypeId?: number;
    relativePhysicalStats?: number;
    timeOfDay?: string;
    tradeSpecies?: PokemonSpecies;
    tradeSpeciesId?: number;
    turnUpsideDown?: boolean;
    chainLinkId?: number;
}

interface EvolutionTrigger {
    id?: number;
    name?: string;
}

