package jobs

import (
	"github.com/JacobPotter/pokeapi-go"
	"github.com/WebWizardsDev/poke-db/api/models"
	"gorm.io/gorm/clause"
	"log"
)

func (r RefreshDB) refreshLocations() {

	var count int

	if r.Test {
		count = 2
	} else {
		count = 100
	}

	resources, err := pokeapi.Resource("region", 0, count)

	if err != nil {
		log.Printf("Error: %v", err)
		return
	}
	log.Printf("Found %v regions", len(resources.Results))

	regions := make([]*models.Region, len(resources.Results))

	for i, result := range resources.Results {
		clientRegion, err := pokeapi.Region(result.Name)

		if err != nil {
			log.Printf("Error: %v", err)
			continue
		}

		locations := make([]models.Location, len(clientRegion.Locations))

		for j, location := range clientRegion.Locations {

			clientLocation, err := pokeapi.Location(location.Name)

			if err != nil {
				log.Printf("Error: %v", err)
				continue
			}

			locations[j] = models.Location{
				ID:   uint(clientLocation.ID),
				Name: clientLocation.Name,
			}
		}
		regions[i] = &models.Region{
			ID:        uint(clientRegion.ID),
			Name:      clientRegion.Name,
			Locations: locations,
		}
	}

	tx := r.DB.Clauses(clause.OnConflict{
		UpdateAll: true,
	}).Create(regions)

	if tx.Error != nil {
		log.Printf("Error with creating regions: %v", tx.Error)
	}

	log.Printf("Created # of new regions: %v", tx.RowsAffected)
}
