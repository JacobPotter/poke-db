package jobs

import (
	"github.com/JacobPotter/poke-db/api/models"
	"github.com/JacobPotter/pokeapi-go"
	"github.com/JacobPotter/pokeapi-go/structs"
	"github.com/lib/pq"
	"gorm.io/gorm"
	"gorm.io/gorm/clause"
	"log"
	"reflect"
)

type RefreshDB struct {
	DB *gorm.DB
}

type DamageLink struct {
	Name string `json:"name"`
	URL  string `json:"url"`
}

func (r RefreshDB) Run() {
	// Get moveTypes
	r.refreshTypes()
	r.refreshPokemon()

}

func (r RefreshDB) refreshTypes() {
	types, err := pokeapi.Resource("type", 0, 100)
	if err != nil {
		log.Printf("Error with getting moveTypes: %v", err)
		return
	}

	moveTypes := make([]*models.MoveType, len(types.Results))
	clientTypes := make([]*structs.Type, len(types.Results))

	for i, result := range types.Results {
		clientType, err := pokeapi.Type(result.Name)
		if err != nil {
			log.Printf("Error with getting type: %v", err)
		}

		log.Printf("Getting type: %v", clientType.Name)

		clientTypes[i] = &clientType

		moveTypes[i] = &models.MoveType{
			Name:   clientType.Name,
			ImgUrl: clientType.Sprites.GenerationViii.LegendsArceus.NameIcon,
		}
	}

	log.Print("Creating moveTypes")

	tx := r.DB.Clauses(clause.OnConflict{DoNothing: true}).Create(moveTypes)

	if tx.Error != nil {
		log.Printf("Error with creating moveTypes: %v", tx.Error)
	}

	log.Printf("Created # of new moveTypes: %v", tx.RowsAffected)

	for _, clientType := range clientTypes {

		doubleDamageTo := r.linkDamage(clientType.DamageRelations.DoubleDamageTo)
		halfDamageTo := r.linkDamage(clientType.DamageRelations.HalfDamageTo)
		noDamageTo := r.linkDamage(clientType.DamageRelations.NoDamageTo)
		doubleDamageFrom := r.linkDamage(clientType.DamageRelations.DoubleDamageFrom)
		halfDamageFrom := r.linkDamage(clientType.DamageRelations.HalfDamageFrom)
		noDamageFrom := r.linkDamage(clientType.DamageRelations.NoDamageFrom)

		if len(doubleDamageTo) > 0 {
			tx = r.DB.Model(&models.MoveType{}).Where("name = ?", clientType.Name).Update("double_damage_to", pq.Int64Array(doubleDamageTo))
			if tx.Error != nil {
				log.Printf("Error with updating damage modifiers: %v", tx.Error)
			}
		}
		if len(halfDamageTo) > 0 {
			tx = r.DB.Model(&models.MoveType{}).Where("name = ?", clientType.Name).Update("half_damage_to", pq.Int64Array(halfDamageTo))
			if tx.Error != nil {
				log.Printf("Error with updating damage modifiers: %v", tx.Error)
			}
		}
		if len(noDamageTo) > 0 {
			tx = r.DB.Model(&models.MoveType{}).Where("name = ?", clientType.Name).Update("no_damage_to", pq.Int64Array(noDamageTo))
			if tx.Error != nil {
				log.Printf("Error with updating damage modifiers: %v", tx.Error)
			}
		}
		if len(doubleDamageFrom) > 0 {
			tx = r.DB.Model(&models.MoveType{}).Where("name = ?", clientType.Name).Update("double_damage_from", pq.Int64Array(doubleDamageFrom))
			if tx.Error != nil {
				log.Printf("Error with updating damage modifiers: %v", tx.Error)
			}
		}
		if len(halfDamageFrom) > 0 {
			tx = r.DB.Model(&models.MoveType{}).Where("name = ?", clientType.Name).Update("half_damage_from", pq.Int64Array(halfDamageFrom))
			if tx.Error != nil {
				log.Printf("Error with updating damage modifiers: %v", tx.Error)
			}
		}
		if len(noDamageFrom) > 0 {
			tx = r.DB.Model(&models.MoveType{}).Where("name = ?", clientType.Name).Update("no_damage_from", pq.Int64Array(noDamageFrom))
			if tx.Error != nil {
				log.Printf("Error with updating damage modifiers: %v", tx.Error)
			}
		}
		log.Printf("Updated type damage modifiers for: %v", clientType.Name)
	}
}

func (r RefreshDB) refreshPokemon() {
	pokemonResource, err := pokeapi.Resource("pokemon-species", 0, 1500)

	if err != nil {
		log.Printf("Failed to get pokemon: %s", err)
		return
	}

	var pokemon []*models.Pokemon

	log.Printf("Found %d pokemons", len(pokemonResource.Results))

	for _, result := range pokemonResource.Results {
		clientPokemon, err := pokeapi.Pokemon(result.Name)
		if err != nil {
			log.Printf("Failed to get pokemon: %s\nError:%s", result.Name, err)
			continue
		}

		var primaryType uint
		var secondaryType uint

		tx := r.DB.Model(models.MoveType{}).Select("id").Where("name = ?", clientPokemon.Types[0].Type.Name).First(&primaryType)

		if tx.Error != nil {
			log.Printf("Failed to get pokemon type: %s", tx.Error)
		}
		newPokemon := &models.Pokemon{
			ID:            uint(clientPokemon.ID),
			Name:          clientPokemon.Name,
			PrimaryTypeId: &primaryType,
			SpriteUrl:     clientPokemon.Sprites.FrontDefault,
			Cry:           clientPokemon.Cries.Latest,
			Weight:        clientPokemon.Weight,
			Height:        clientPokemon.Height,
		}

		if len(clientPokemon.Types) > 1 {
			tx = r.DB.Model(models.MoveType{}).Select("id").Where("name = ?", clientPokemon.Types[1].Type.Name).First(&secondaryType)

			if tx.Error != nil {
				log.Printf("Failed to get pokemon type: %s", tx.Error)
			}
			newPokemon.SecondaryTypeId = &secondaryType
		}

		pokemon = append(pokemon, newPokemon)

	}

	log.Print("Creating Pokemon")

	tx := r.DB.Clauses(clause.OnConflict{
		Columns:   []clause.Column{{Name: "id"}},
		UpdateAll: true,
	}).Create(pokemon)

	if tx.Error != nil {
		log.Printf("Error with creating pokemon: %v", tx.Error)
	}

	log.Printf("Created # of new Pokemon: %d", tx.RowsAffected)
}

func (r RefreshDB) linkDamage(damageModifiers interface{}) []int64 {

	var links []DamageLink

	switch damageModifiers.(type) {
	case []DamageLink:
		links = damageModifiers.([]DamageLink)
	case []struct {
		Name string `json:"name"`
		URL  string `json:"url"`
	}:
		for _, link := range damageModifiers.([]struct {
			Name string `json:"name"`
			URL  string `json:"url"`
		}) {
			links = append(links, DamageLink{
				Name: link.Name,
				URL:  link.URL,
			})
		}
	case []interface{}:
		for _, link := range damageModifiers.([]interface{}) {

			switch link.(type) {
			case DamageLink:
				links = append(links, link.(DamageLink))
			case struct {
				Name string `json:"name"`
				URL  string `json:"url"`
			}:
				links = append(links, DamageLink{
					Name: link.(struct {
						Name string `json:"name"`
						URL  string `json:"url"`
					}).Name,
					URL: link.(struct {
						Name string `json:"name"`
						URL  string `json:"url"`
					}).URL,
				})
			case map[string]interface{}:
				links = append(links, DamageLink{
					Name: link.(map[string]interface{})["name"].(string),
					URL:  link.(map[string]interface{})["url"].(string),
				})
			default:
				log.Printf("Unknown damage type: %v", reflect.TypeOf(link))
			}
		}
	default:
		log.Printf("Unknown damage type: %v", reflect.TypeOf(damageModifiers))
	}

	var damageColumn = make([]int64, len(links))

	for i, damageLink := range links {
		var linkType models.MoveType
		tx := r.DB.Model(models.MoveType{}).Where("name = ?", damageLink.Name).Select([]string{"id", "name"}).First(&linkType)

		if tx.Error != nil {
			log.Printf("Error with getting type: %v", tx.Error)
		}

		damageColumn[i] = int64(linkType.ID)
	}

	return damageColumn
}
