export interface Pokemon {
    name: string;
    id: number;
    primary_type: MoveType
    secondary_type: MoveType | null
    sprite_url: string;
    cry: string
    weight: number;
    height: number
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
