package models

type ListPokemonResponse struct {
	Pokemon  []PokemonSpecies  `json:"pokemon"`
	Page     int               `json:"page"`
	PageSize int               `json:"pageSize"`
	Total    int               `json:"total"`
	Params   ListPokemonParams `json:"params"`
	NextPage string            `json:"nextPage,omitempty"`
	PrevPage string            `json:"prevPage,omitempty"`
}

type Pokemon struct {
	ID               uint            `gorm:"primary_key" json:"id"`
	Name             string          `gorm:"unique" json:"name"`
	PrimaryType      MoveType        `gorm:"foreignKey:PrimaryTypeId" json:"primary_type"`
	PrimaryTypeId    *uint           `json:"primary_type_id"`
	SecondaryType    MoveType        `gorm:"foreignKey:SecondaryTypeId;" json:"secondary_type,omitempty"`
	SecondaryTypeId  *uint           `json:"secondary_type_id"`
	PokemonSpecies   *PokemonSpecies `gorm:"foreignKey:PokemonSpeciesId" json:"pokemon_species,omitempty"`
	PokemonSpeciesId uint            `json:"pokemon_species_id"`
	SpriteUrl        string          `json:"sprite_url"`
	Cry              string          `json:"cry"`
	Weight           int             `json:"weight"`
	Height           int             `json:"height"`
	IsDefault        bool            `json:"is_default"`
}

//TODO: add species JSONb column to table

type Sprites struct {
	BackDefault      string `json:"back_default"`
	BackFemale       string `json:"back_female,omitempty"`
	BackShiny        string `json:"back_shiny"`
	BackShinyFemale  string `json:"back_shiny_female,omitempty"`
	FrontDefault     string `json:"front_default"`
	FrontFemale      string `json:"front_female,omitempty"`
	FrontShiny       string `json:"front_shiny"`
	FrontShinyFemale string `json:"front_shiny_female,omitempty"`
}

type PokemonSpecies struct {
	ID                   uint      `gorm:"primary_key" json:"id"`
	HasGenderDifferences bool      `json:"has_gender_differences"`
	HatchCounter         int       `json:"hatch_counter"`
	IsBaby               bool      `json:"is_baby"`
	IsLegendary          bool      `json:"is_legendary"`
	IsMythical           bool      `json:"is_mythical"`
	Name                 string    `json:"name"`
	Varieties            []Pokemon `json:"varieties"`
}

type ListPokemonParams struct {
	PokemonName   string `form:"pokemonName" json:"pokemonName,omitempty"`
	PokemonTypeId int64  `form:"pokemonTypeId" json:"pokemonTypeId,omitempty"`
}
