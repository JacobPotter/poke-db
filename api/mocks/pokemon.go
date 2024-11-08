package mocks

import "github.com/WebWizardsDev/poke-db/api/models"

var MockPokemonSpeciesBulbasaur = models.PokemonSpecies{
	ID:                   1,
	HasGenderDifferences: false,
	HatchCounter:         20,
	IsBaby:               false,
	IsLegendary:          false,
	IsMythical:           false,
	Name:                 "bulbasaur",
	Varieties:            MockPokemonVarietiesBulbasaur,
}

var MockPrimaryTypeId uint = 1
var MockPSecondaryTypeId uint = 2

var MockPokemonVarietiesBulbasaur = []models.Pokemon{{
	ID:               1,
	Name:             "bulbasaur",
	PrimaryType:      &MockTypesGrass,
	PrimaryTypeId:    &MockPrimaryTypeId,
	SecondaryType:    &MockTypesPoison,
	SecondaryTypeId:  &MockPSecondaryTypeId,
	PokemonSpeciesId: 1,
	SpriteUrl:        "https://example.com/pokemon.png",
	Cry:              "https://example.com/pokemon.ogg",
	Weight:           20,
	Height:           5,
	IsDefault:        false,
}}

var MockTypesGrass = models.MoveType{}
var MockTypesPoison = models.MoveType{}

var MockListPokemonResponse = models.ListPokemonResponse{
	Pokemon:  []models.PokemonSpecies{MockPokemonSpeciesBulbasaur},
	Page:     1,
	PageSize: 100,
	Total:    1,
	Params:   models.ListPokemonParams{},
	NextPage: "",
	PrevPage: "",
}
