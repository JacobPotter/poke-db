package jobs

import (
	"github.com/JacobPotter/pokeapi-go"
	"github.com/WebWizardsDev/poke-db/api/models"
	"gorm.io/gorm/clause"
	"log"
)

func (r RefreshDB) refreshPokemon() {

	var count int

	if r.Test {
		count = 50
	} else {
		count = 1500
	}

	pokemonResource, err := pokeapi.Resource("pokemon-species", 0, count)

	if err != nil {
		log.Printf("Failed to get pokemon: %s", err)
		return
	}

	pokemonSpecies := make([]*models.PokemonSpecies, len(pokemonResource.Results))

	log.Printf("Found %d pokemon species", len(pokemonResource.Results))

	for i, result := range pokemonResource.Results {

		clientSpecies, err := pokeapi.PokemonSpecies(result.Name)

		if err != nil {
			log.Printf("Failed to get pokemon species: %s", err)
			continue
		}

		varieties := make([]models.Pokemon, len(clientSpecies.Varieties))

		for i, v := range clientSpecies.Varieties {
			varieties[i] = r.getPokemonVariety(v.Pokemon.Name)
		}

		s := &models.PokemonSpecies{
			ID:                   uint(clientSpecies.ID),
			HasGenderDifferences: clientSpecies.HasGenderDifferences,
			HatchCounter:         clientSpecies.HatchCounter,
			IsBaby:               clientSpecies.IsBaby,
			IsLegendary:          clientSpecies.IsLegendary,
			IsMythical:           clientSpecies.IsMythical,
			Name:                 clientSpecies.Name,
			Varieties:            varieties,
		}

		pokemonSpecies[i] = s
	}

	log.Print("Creating Pokemon")

	tx := r.DB.Clauses(clause.OnConflict{
		UpdateAll: true,
	}).CreateInBatches(pokemonSpecies, 50)

	if tx.Error != nil {
		log.Printf("Error with creating pokemon species: %v", tx.Error)
	}

	log.Printf("Created # of new Pokemon species: %d", tx.RowsAffected)
}

func (r RefreshDB) getPokemonVariety(varietyName string) (pokemon models.Pokemon) {
	clientPokemon, err := pokeapi.Pokemon(varietyName)
	if err != nil {
		log.Printf("Failed to get pokemon: %s\nError:%s", varietyName, err)
		return pokemon
	}

	var primaryType uint
	var secondaryType uint

	tx := r.DB.Model(models.MoveType{}).Select("id").Where("name = ?", clientPokemon.Types[0].Type.Name).First(&primaryType)

	if tx.Error != nil {
		log.Printf("Failed to get pokemon type: %s", tx.Error)
	}
	pokemon = models.Pokemon{
		ID:            uint(clientPokemon.ID),
		Name:          clientPokemon.Name,
		PrimaryTypeId: &primaryType,
		SpriteUrl:     clientPokemon.Sprites.FrontDefault,
		Cry:           clientPokemon.Cries.Latest,
		Weight:        clientPokemon.Weight,
		Height:        clientPokemon.Height,
		IsDefault:     clientPokemon.IsDefault,
	}

	if len(clientPokemon.Types) > 1 {
		tx = r.DB.Model(models.MoveType{}).Select("id").Where("name = ?", clientPokemon.Types[1].Type.Name).First(&secondaryType)

		if tx.Error != nil {
			log.Printf("Failed to get pokemon type: %s", tx.Error)
		}
		pokemon.SecondaryTypeId = &secondaryType
	}

	return pokemon
}
