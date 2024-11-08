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
	ID               uint            `gorm:"primary_key" json:"id,omitempty"`
	Name             string          `gorm:"unique" json:"name,omitempty"`
	PrimaryType      *MoveType       `gorm:"foreignKey:PrimaryTypeId" json:"primary_type,omitempty"`
	PrimaryTypeId    *uint           `json:"primary_type_id,omitempty"`
	SecondaryType    *MoveType       `gorm:"foreignKey:SecondaryTypeId;" json:"secondary_type,omitempty"`
	SecondaryTypeId  *uint           `json:"secondary_type_id,omitempty"`
	PokemonSpecies   *PokemonSpecies `gorm:"foreignKey:PokemonSpeciesId" json:"pokemon_species,omitempty"`
	PokemonSpeciesId uint            `json:"pokemon_species_id,omitempty"`
	SpriteUrl        string          `json:"sprite_url,omitempty"`
	Cry              string          `json:"cry,omitempty"`
	Weight           int             `json:"weight,omitempty"`
	Height           int             `json:"height,omitempty"`
	IsDefault        bool            `json:"is_default,omitempty"`
	LearnableMoves   []Move          `gorm:"many2many:pokemon_move_sets;" json:"learnable_moves,omitempty"`
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
	ID                   uint      `gorm:"primary_key" json:"id,omitempty"`
	HasGenderDifferences bool      `json:"has_gender_differences,omitempty"`
	HatchCounter         int       `json:"hatch_counter,omitempty"`
	IsBaby               bool      `json:"is_baby,omitempty"`
	IsLegendary          bool      `json:"is_legendary,omitempty"`
	IsMythical           bool      `json:"is_mythical,omitempty"`
	Name                 string    `json:"name,omitempty"`
	Varieties            []Pokemon `json:"varieties,omitempty"`
}

type ListPokemonParams struct {
	PokemonName   string `form:"pokemonName" json:"pokemonName,omitempty"`
	PokemonTypeId int64  `form:"pokemonTypeId" json:"pokemonTypeId,omitempty"`
}
