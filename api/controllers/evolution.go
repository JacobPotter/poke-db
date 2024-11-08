package controllers

import (
	"github.com/WebWizardsDev/poke-db/api/models"
	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
	"gorm.io/gorm/clause"
	"net/http"
)

type EvolutionHandler struct {
	db *gorm.DB
}

func NewEvolutionHandler(db *gorm.DB) *EvolutionHandler {
	return &EvolutionHandler{db: db}
}

func (e *EvolutionHandler) GetEvolutionChain(c *gin.Context) {
	id := c.Param("id")
	var evolutionChain models.EvolutionChain
	if err := e.db.
		Preload(clause.Associations).
		Preload("ChainLink."+clause.Associations).
		Preload("ChainLink.EvolvesTo."+clause.Associations).
		Preload("ChainLink.EvolvesTo.EvolvesTo."+clause.Associations).
		Preload("ChainLink.EvolvesTo.EvolvesTo.EvolvesTo."+clause.Associations).
		First(&evolutionChain, id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Evolution Chain not found"})
		return
	}
	c.JSON(http.StatusOK, evolutionChain)
}

func selectFromVarieties(db *gorm.DB) *gorm.DB {
	return db.Select("name", "sprite_url", "pokemon_species_id")
}
func selectFromSpecies(db *gorm.DB) *gorm.DB {
	return db.Select("id", "name").Preload("Varieties", selectFromVarieties)
}

func (e *EvolutionHandler) GetEvolutionChainLink(c *gin.Context) {
	id := c.Param("id")
	var evolutionChain models.EvolutionChainLink
	if err := e.db.
		Preload(clause.Associations).
		Preload("EvolvesFrom.PokemonSpecies", selectFromSpecies).
		Preload("EvolvesFrom.PokemonSpecies", selectFromSpecies).
		Preload("EvolutionDetails."+clause.Associations).
		Preload("EvolvesTo.EvolutionDetails."+clause.Associations).
		Preload("EvolvesTo.EvolvesTo.PokemonSpecies", selectFromSpecies).
		Preload("EvolvesTo.EvolvesTo.EvolutionDetails."+clause.Associations).
		Preload("EvolvesTo.EvolvesTo.EvolvesTo.PokemonSpecies", selectFromSpecies).
		Preload("EvolvesTo.EvolvesTo.EvolvesTo.EvolutionDetails."+clause.Associations).
		First(&evolutionChain, id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Evolution Chain not found"})
		return
	}
	c.JSON(http.StatusOK, evolutionChain)
}

func (e *EvolutionHandler) ListEvolutionChains(c *gin.Context) {

	var evolutionChains []models.EvolutionChain

	if tx := e.db.
		Preload(clause.Associations).
		Preload("ChainLink." + clause.Associations).
		Preload("ChainLink.EvolvesTo." + clause.Associations).
		Preload("ChainLink.EvolvesTo.EvolutionDetails." + clause.Associations).
		Preload("ChainLink.EvolvesTo.EvolvesTo." + clause.Associations).
		Preload("ChainLink.EvolvesTo.EvolvesTo.EvolutionDetails." + clause.Associations).
		Preload("ChainLink.EvolvesTo.EvolvesTo.EvolvesTo." + clause.Associations).
		Preload("ChainLink.EvolvesTo.EvolvesTo.EvolvesTo.EvolutionDetails." + clause.Associations).
		Find(&evolutionChains); tx.Error != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Error while listing evolution chains"})
		return
	}
	c.JSON(http.StatusOK, gin.H{"evolutionChains": evolutionChains})

}
