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
			ID:                 uint(clientChain.ID),
			BabyTriggerItem:    babyTriggerItem,
			InitPokemonSpecies: chainLink.PokemonSpecies,
			ChainLink:          chainLink,
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
		PokemonSpecies:   species,
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
			PokemonSpecies:   species,
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

	var partyPokemon *models.PokemonSpecies
	var tradePokemon *models.PokemonSpecies

	for _, detail := range clientDetails {

		if detail.PartySpecies != nil {

			switch pokemonSpecies := detail.PartySpecies.(type) {
			case structs.Result:
				partyPokemon = r.getPokemonSpeciesFromName(pokemonSpecies.Name)
			case map[string]interface{}:
				partyPokemon = r.getPokemonSpeciesFromName(pokemonSpecies["name"].(string))
			default:
				log.Printf("Unknown type for party species: %s", pokemonSpecies)
			}

		}

		if detail.TradeSpecies != nil {
			switch pokemonSpecies := detail.TradeSpecies.(type) {
			case structs.Result:
				partyPokemon = r.getPokemonSpeciesFromName(pokemonSpecies.Name)
			case map[string]interface{}:
				partyPokemon = r.getPokemonSpeciesFromName(pokemonSpecies["name"].(string))
			default:
				log.Printf("Unknown type for party species: %s", pokemonSpecies)
			}
		}
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
			PartySpecies:          partyPokemon,
			PartyType:             r.getMoveTypeFromClientDetails(detail.PartyType),
			RelativePhysicalStats: r.getIntFieldFromInterface(detail.RelativePhysicalStats),
			TimeOfDay:             &detail.TimeOfDay,
			TradeSpecies:          tradePokemon,
			TurnUpsideDown:        &detail.TurnUpsideDown,
		})
	}
	return evolutionDetails
}

func (r RefreshDB) getItemFromClientDetails(clientItem interface{}) (item *models.Item) {
	if itemResult, ok := clientItem.(structs.Result); ok {
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
	if moveResult, ok := moveApi.(structs.Result); ok {
		tx := r.DB.Model(models.Move{}).Where("name = ?", moveResult.Name).Find(&move)
		if tx.Error != nil {
			log.Printf("Error getting move from db %s", tx.Error)
			return nil
		}
		return move
	} else {
		return nil
	}
}

func (r RefreshDB) getMoveTypeFromClientDetails(moveTypeApi interface{}) (moveType *models.MoveType) {

	if moveTypeResult, ok := moveTypeApi.(structs.Result); ok {
		tx := r.DB.Model(models.MoveType{}).Where("name = ?", moveTypeResult.Name).Find(&moveType)
		if tx.Error != nil {
			log.Printf("Error getting move type from db %s", tx.Error)
			return nil
		}
		return moveType
	} else {
		return nil
	}

}

func (r RefreshDB) getLocationFromClientDetails(locationApi interface{}) (location *models.Location) {

	if result, ok := locationApi.(structs.Result); ok {
		tx := r.DB.Model(models.Location{}).Where("name = ?", result.Name).Find(&location)
		if tx.Error != nil {
			log.Printf("Error getting location from db %s", tx.Error)
			return nil
		}
		return location
	} else {
		return nil
	}

}
