package refresh

import (
	"log"

	"github.com/JacobPotter/poke-db/api/models"
	"github.com/JacobPotter/pokeapi-go"
	"gorm.io/gorm/clause"
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
		if len(clientMove.LearnedByPokemon) > 0 {
			names := make([]string, len(clientMove.LearnedByPokemon))
			for i, p := range clientMove.LearnedByPokemon {
				names[i] = p.Name
			}
			if tx := r.DB.Where("name IN ?", names).Find(&pokemon); tx.Error != nil {
				log.Printf("Error getting learned pokemon from db: %s", tx.Error)
			}
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
