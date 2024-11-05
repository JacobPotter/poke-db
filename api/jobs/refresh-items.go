package jobs

import (
	"github.com/JacobPotter/pokeapi-go"
	"github.com/WebWizardsDev/poke-db/api/models"
	"gorm.io/gorm/clause"
	"log"
)

func (r RefreshDB) refreshItems() {

	var count int

	if r.Test {
		count = 50
	} else {
		count = 3000
	}

	resources, err := pokeapi.Resource("item", 0, count)
	if err != nil {
		log.Printf("Error getting resources: %v", err)
		return
	}

	items := make([]*models.Item, len(resources.Results))

	log.Printf("Found %v items", len(resources.Results))

	log.Print("Processing items")

	for i, result := range resources.Results {
		clientItem, err := pokeapi.Item(result.Name)

		if err != nil {
			log.Printf("Error getting item: %v", err)
			continue
		}
		items[i] = &models.Item{
			GenericId: models.GenericId(uint(clientItem.ID)),
			Name:      clientItem.Name,
			SpriteUrl: clientItem.Sprites.Default,
		}

	}

	items = models.FilterDuplicates(items)

	tx := r.DB.Clauses(clause.OnConflict{
		UpdateAll: true,
	}).CreateInBatches(items, 50)

	if tx.Error != nil {
		log.Printf("Error with creating items: %v", tx.Error)
	}

	log.Printf("Created # of new items: %v", tx.RowsAffected)

}
