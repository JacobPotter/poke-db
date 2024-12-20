package jobs

import (
	"fmt"
	"github.com/JacobPotter/pokeapi-go"
	"github.com/JacobPotter/pokeapi-go/structs"
	"github.com/WebWizardsDev/poke-db/api/models"
	"gorm.io/gorm/clause"
	"log"
	"strings"
)

func (r RefreshDB) refreshEvolutionTriggers() {
	resources, err := pokeapi.Resource("evolution-trigger", 0, 1500)

	if err != nil {
		log.Printf("Error getting evolution triggers: %s", err)
		return
	}

	log.Printf("Found %d evolution triggers", len(resources.Results))

	evolutionTriggers := make([]*models.EvolutionTrigger, len(resources.Results))

	for i, result := range resources.Results {
		clientTrigger, err := pokeapi.EvolutionTrigger(result.Name)
		if err != nil {
			log.Printf("Error getting evolution trigger: %s", err)
			continue
		}

		evolutionTriggers[i] = &models.EvolutionTrigger{
			ID:   uint(clientTrigger.ID),
			Name: clientTrigger.Name,
		}

	}

	tx := r.DB.Clauses(clause.OnConflict{UpdateAll: true}).CreateInBatches(evolutionTriggers, 25)

	if tx.Error != nil {
		log.Printf("Error creating evolution triggers: %s", tx.Error)
	}

	log.Printf("Created %d evolution triggers", len(evolutionTriggers))

}

func (r RefreshDB) refreshEvolutionsChains() {
	var count int

	if r.Test {
		count = 10
	} else {
		count = 1500
	}

	resources, err := pokeapi.Resource("evolution-chain", 0, count)

	if err != nil {
		log.Printf("Error getting evolution chain: %s", err)
		return
	}

	log.Printf("Found %d evolution chains", len(resources.Results))

	evolutionChains := make([]*models.EvolutionChain, len(resources.Results))

	for i, result := range resources.Results {
		split := strings.Split(result.URL, "/")
		id := fmt.Sprintf(split[len(split)-2])
		clientChain, err := pokeapi.EvolutionChain(id)
		if err != nil {
			log.Printf("Error getting evolution chain: %s", err)
		}

		clientChainLink := clientChain.Chain

		var chainLink = r.getChainLinkModelFromApi(clientChainLink)

		var babyTriggerItem *models.Item

		if babyTriggerResult, ok := clientChain.BabyTriggerItem.(structs.Result); ok {
			splitUrl := strings.Split(babyTriggerResult.URL, "/")
			id := splitUrl[len(splitUrl)-2]
			tx := r.DB.Model(models.Item{}).Where("id = ?", id).Find(&babyTriggerItem)
			if tx.Error != nil {
				log.Printf("Error getting item from db: %s", tx.Error)
			}
		} else {
			babyTriggerItem = nil
		}

		evolutionChains[i] = &models.EvolutionChain{
			ID:              uint(clientChain.ID),
			BabyTriggerItem: babyTriggerItem,
			ChainLink:       chainLink,
		}
	}

	tx := r.DB.Clauses(clause.OnConflict{UpdateAll: true}).Create(evolutionChains)

	if tx.Error != nil {
		log.Printf("Error creating evolution chains: %s", tx.Error)
	}

	log.Printf("Created %d evolution chains", len(evolutionChains))

}

func (r RefreshDB) getChainLinkModelFromApi(clientChainLink *structs.ChainLink) (chainLink models.EvolutionChainLink) {

	if clientChainLink == nil {
		return
	}

	species := *r.getPokemonSpeciesFromName(clientChainLink.Species.Name)
	chainLink = models.EvolutionChainLink{
		ID:               species.ID,
		IsBaby:           clientChainLink.IsBaby,
		PokemonSpeciesId: species.ID,
		EvolutionDetails: r.getEvolutionDetailsModelFromApi(clientChainLink.EvolutionDetails),
		EvolvesTo:        r.getEvolvesToFromApi(clientChainLink.EvolvesTo, species.ID),
	}

	return chainLink
}

func (r RefreshDB) getPokemonSpeciesFromName(name string) (species *models.PokemonSpecies) {
	tx := r.DB.Where("name = ?", name).Find(&species)

	if tx.Error != nil {
		log.Printf("Error getting species: %s", tx.Error)
		return nil
	}

	return species
}

func (r RefreshDB) getEvolvesToFromApi(evolvesToApi []structs.ChainLink, previousSpeciesId uint) (evolvesTo []models.EvolutionChainLink) {
	for _, link := range evolvesToApi {

		species := *r.getPokemonSpeciesFromName(link.Species.Name)
		evolvesTo = append(evolvesTo, models.EvolutionChainLink{
			ID:               species.ID,
			IsBaby:           link.IsBaby,
			PokemonSpeciesId: species.ID,
			EvolutionDetails: r.getEvolutionDetailsModelFromApi(link.EvolutionDetails),
			EvolvesTo:        r.getEvolvesToFromApi(link.EvolvesTo, species.ID),
			EvolvesFromId:    &previousSpeciesId,
		})
	}

	return evolvesTo

}

func (r RefreshDB) getEvolutionDetailsModelFromApi(clientDetails []structs.EvolutionDetail) (evolutionDetails []models.EvolutionDetails) {

	if len(clientDetails) == 0 {
		return evolutionDetails
	}

	for _, detail := range clientDetails {

		evolutionDetails = append(evolutionDetails, models.EvolutionDetails{
			Item:                  r.getItemFromClientDetails(detail.Item),
			EvolutionTrigger:      r.getEvolutionTriggerFromClientDetails(detail),
			GenderId:              r.getIntFieldFromInterface(detail.Gender),
			HeldItem:              r.getItemFromClientDetails(detail.HeldItem),
			KnownMove:             r.getMoveFromClientDetails(detail.KnownMove),
			KnownMoveType:         r.getMoveTypeFromClientDetails(detail.KnownMoveType),
			Location:              r.getLocationFromClientDetails(detail.Location),
			MinLevel:              &detail.MinLevel,
			MinHappiness:          r.getIntFieldFromInterface(detail.MinHappiness),
			MinBeauty:             r.getIntFieldFromInterface(detail.MinBeauty),
			MinAffection:          r.getIntFieldFromInterface(detail.MinAffection),
			NeedsOverworldRain:    &detail.NeedsOverworldRain,
			PartySpecies:          r.getSpeciesFromApi(detail.PartySpecies),
			PartyType:             r.getMoveTypeFromClientDetails(detail.PartyType),
			RelativePhysicalStats: r.getIntFieldFromInterface(detail.RelativePhysicalStats),
			TimeOfDay:             &detail.TimeOfDay,
			TradeSpecies:          r.getSpeciesFromApi(detail.TradeSpecies),
			TurnUpsideDown:        &detail.TurnUpsideDown,
		})
	}

	evolutionDetails = removeDuplicateDetails(evolutionDetails)

	return evolutionDetails
}

func removeDuplicateDetails(details []models.EvolutionDetails) (newDetails []models.EvolutionDetails) {
	seen := make(map[models.EvolutionDetails]bool)

	for _, detail := range details {
		if !seen[detail] {
			seen[detail] = true
			newDetails = append(newDetails, detail)
		}
	}
	return newDetails
}

func (r RefreshDB) getSpeciesFromApi(species interface{}) (speciesModel *models.PokemonSpecies) {
	switch pokemonSpecies := species.(type) {
	case structs.Result:
		speciesModel = r.getPokemonSpeciesFromName(pokemonSpecies.Name)
	case map[string]interface{}:
		speciesModel = r.getPokemonSpeciesFromName(pokemonSpecies["name"].(string))
	default:
		log.Printf("Unknown type for party species: %T", pokemonSpecies)
	}
	return speciesModel
}

func (r RefreshDB) getItemFromClientDetails(clientItem interface{}) (item *models.Item) {
	switch itemResult := clientItem.(type) {
	case structs.Result:
		tx := r.DB.Model(models.Item{}).Where("name = ?", itemResult.Name).Find(&item)
		if tx.Error != nil {
			log.Printf("Error getting item from db, trying api: %s", tx.Error)
			clientItem, err := pokeapi.Item(itemResult.Name)
			if err != nil {
				log.Printf("Error getting item from api: %s", err)
			} else {
				item = &models.Item{
					GenericId: models.GenericId(uint(clientItem.ID)),
					Name:      clientItem.Name,
					SpriteUrl: clientItem.Sprites.Default,
				}
			}

		}
	case map[string]interface{}:
		tx := r.DB.Model(models.Item{}).Where("name = ?", itemResult["name"].(string)).Find(&item)
		if tx.Error != nil {
			log.Printf("Error getting item from db, trying api: %s", tx.Error)
			clientItem, err := pokeapi.Item(itemResult["name"].(string))
			if err != nil {
				log.Printf("Error getting item from api: %s", err)
			} else {
				item = &models.Item{
					GenericId: models.GenericId(uint(clientItem.ID)),
					Name:      clientItem.Name,
					SpriteUrl: clientItem.Sprites.Default,
				}
			}
		}

	}
	return item
}

func (r RefreshDB) getEvolutionTriggerFromClientDetails(details structs.EvolutionDetail) (trigger models.EvolutionTrigger) {

	tx := r.DB.Where("name = ?", details.Trigger.Name).Find(&trigger)

	if tx.Error != nil {
		log.Printf("Error getting evolution trigger: %s. Trying API", tx.Error)
		clientTrigger, err := pokeapi.EvolutionTrigger(details.Trigger.Name)
		if err != nil {
			log.Printf("Error getting evolution trigger: %s", err)
		}

		trigger = models.EvolutionTrigger{
			ID:   uint(clientTrigger.ID),
			Name: clientTrigger.Name,
		}
	}

	return trigger
}

func (r RefreshDB) getIntFieldFromInterface(apiValue interface{}) *int {
	switch number := apiValue.(type) {
	case int:
		return &number
	case int8:
	case int16:
	case int32:
	case int64:
		i := int(number)
		return &i
	case float64:
		i := int(number)
		return &i
	case nil:
		return nil
	default:
		log.Printf("Unknown number type: %T", number)
		return nil
	}
	return nil
}

func (r RefreshDB) getMoveFromClientDetails(moveApi interface{}) (move *models.Move) {
	switch moveResult := moveApi.(type) {
	case structs.Result:
		tx := r.DB.Model(models.Move{}).Where("name = ?", moveResult.Name).Find(&move)
		if tx.Error != nil {
			log.Printf("Error getting move from db %s", tx.Error)
			return nil
		}
		return move
	case map[string]interface{}:
		tx := r.DB.Model(models.Move{}).Where("name = ?", moveResult["name"].(string)).Find(&move)
		if tx.Error != nil {
			log.Printf("Error getting move from db %s", tx.Error)
			return nil
		}
		return move
	default:
		return nil
	}

}

func (r RefreshDB) getMoveTypeFromClientDetails(moveTypeApi interface{}) (moveType *models.MoveType) {

	switch moveTypeResult := moveTypeApi.(type) {
	case structs.Result:
		tx := r.DB.Model(models.MoveType{}).Where("name = ?", moveTypeResult.Name).Find(&moveType)
		if tx.Error != nil {
			log.Printf("Error getting move type from db %s", tx.Error)
			return nil
		}
		return moveType
	case map[string]interface{}:
		tx := r.DB.Model(models.MoveType{}).Where("name = ?", moveTypeResult["name"].(string)).Find(&moveType)
		if tx.Error != nil {
			log.Printf("Error getting move type from db %s", tx.Error)
			return nil
		}
		return moveType
	default:
		return nil
	}

}

func (r RefreshDB) getLocationFromClientDetails(locationApi interface{}) (location *models.Location) {

	switch result := locationApi.(type) {
	case structs.Result:
		tx := r.DB.Model(models.Location{}).Where("name = ?", result.Name).Find(&location)
		if tx.Error != nil {
			log.Printf("Error getting location from db %s", tx.Error)
			return nil
		}
		return location
	case map[string]interface{}:
		tx := r.DB.Model(models.Location{}).Where("name = ?", result["name"].(string)).Find(&location)
		if tx.Error != nil {
			log.Printf("Error getting location from db %s", tx.Error)
			return nil
		}
		return location
	default:
		return nil
	}

}
