package jobs

import (
	"github.com/JacobPotter/pokeapi-go"
	"github.com/WebWizardsDev/poke-db/api/models"
	"gorm.io/gorm/clause"
	"log"
)

func (r RefreshDB) refreshMoves() {
	var count int

	if r.Test {
		count = 50
	} else {
		count = 1500
	}

	resources, err := pokeapi.Resource("move", 0, count)

	if err != nil {
		log.Printf("Error: %s", err)
		return
	}

	log.Printf("Got %v moves", len(resources.Results))

	var moves []*models.Move

	for _, result := range resources.Results {
		clientMove, err := pokeapi.Move(result.Name)
		if err != nil {
			log.Printf("Error: %s", err)
			continue
		}

		var pokemon []models.Pokemon

		for _, pokemonNamedResource := range clientMove.LearnedByPokemon {
			var tempPokemon models.Pokemon
			tx := r.DB.Where("name = ?", pokemonNamedResource.Name).First(&tempPokemon)
			if tx.Error != nil {
				log.Printf("Error getting from db: %s", tx.Error)
				continue
			}
			pokemon = append(pokemon, tempPokemon)
		}

		var moveType models.MoveType

		tx := r.DB.Where("name = ?", clientMove.Type.Name).First(&moveType)

		if tx.Error != nil {
			log.Printf("Error getting from db trying api: %s", tx.Error)
			continue
		}

		moves = append(moves, &models.Move{
			Id:               clientMove.ID,
			Name:             clientMove.Name,
			Accuracy:         clientMove.Accuracy,
			Pp:               clientMove.Pp,
			Priority:         clientMove.Priority,
			Power:            clientMove.Power,
			MoveType:         moveType,
			LearnedByPokemon: pokemon,
		})
	}

	tx := r.DB.Clauses(clause.OnConflict{UpdateAll: true}).CreateInBatches(moves, 25)

	if tx.Error != nil {
		log.Printf("Error with creating moves: %v", tx.Error)
	}

	log.Printf("Created # of new moves: %v", tx.RowsAffected)
}
