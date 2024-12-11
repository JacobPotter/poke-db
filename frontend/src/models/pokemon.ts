export interface ListPokemonResponse {
    nextPage: string;
    page: number;
    pageSize: number;
    params: ListPokemonParams;
    pokemon: PokemonSpecies[];
    prevPage: string;
    total: number;
}

export interface PokemonSpecies {
    id: number;
    has_gender_differences: boolean;
    hatch_counter: number;
    is_baby: boolean;
    is_legendary: boolean;
    is_mythical: boolean;
    name: string;
    varieties: Partial<PokemonVariety>[];
}

export interface PokemonVariety {
    id: number;
    name: string;
    primary_type: MoveType;
    primary_type_id: number;
    secondary_type: MoveType | null;
    secondary_type_id: number | null;
    pokemon_species_id: number;
    sprite_url: string;
    cry: string;
    weight: number;
    height: number;
    is_default: boolean;
}


export interface MoveTypeResp {
    data: MoveType[]
    page: number
    pageSize: number
    total: number
}

export interface MoveType {
    id: number
    name: string
    double_damage_to?: number[]
    half_damage_to?: number[]
    no_damage_to?: number[]
    double_damage_from?: number[]
    half_damage_from?: number[]
    img_url?: string
    no_damage_from?: number[]
}

export interface ListPokemonParams {
    page?: number;
    pageSize?: number;
    pokemonName?: string | null
    pokemonTypeId?: number | null
}
