package controllers

import (
	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
	"net/http"
	"poke-db/models"
)

// PokemonHandler represents a handler for Pokemon-related operations.
type PokemonHandler struct {
	db *gorm.DB
}

// NewPokemonHandler creates a new instance of PokemonHandler with the provided db.
func NewPokemonHandler(db *gorm.DB) *PokemonHandler {
	return &PokemonHandler{
		db: db,
	}
}

// CreatePokemon creates a new Pokemon by parsing the JSON payload from the request body.
// If the JSON payload is invalid, it returns a 400 Bad Request response.
// After successfully creating the Pokemon, it returns a 201 Created response with the created data.
// This method is a handler for the "/pokemonroutes" POST route.
func (h *PokemonHandler) CreatePokemon(c *gin.Context) {
	var pokemon models.Pokemon

	if err := c.ShouldBindJSON(&pokemon); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	h.db.Create(&pokemon)
	c.JSON(http.StatusCreated, gin.H{"data": pokemon})
}

// GetPokemon retrieves the details of a Pokemon based on the given ID.
// It first retrieves the Pokemon from the database using the provided ID.
// If the Pokemon is not found, it returns a 404 Not Found response.
// If the Pokemon is found, it returns a 200 OK response with the Pokemon data.
func (h *PokemonHandler) GetPokemon(c *gin.Context) {
	id := c.Param("id")
	var pokemon models.Pokemon
	if err := h.db.First(&pokemon, id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Pokemon not found"})
		return
	}
	c.JSON(http.StatusOK, gin.H{"data": pokemon})
}

// ListPokemon fetches all Pokemon from the database and returns them as JSON data in the HTTP response.
// If there is an error fetching the Pokemon, it returns a 500 Internal Server Error response.
// This method is a handler for the "/pokemonroutes" GET route.
func (h *PokemonHandler) ListPokemon(c *gin.Context) {
	var pokemon []models.Pokemon
	if err := h.db.Find(&pokemon).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch Pokemon"})
		return
	}
	c.JSON(http.StatusOK, gin.H{"data": pokemon})
}

// UpdatePokemon updates the details of a Pokemon based on the provided ID.
// It first retrieves the Pokemon from the database using the provided ID.
// If the Pokemon is not found, it returns a 404 Not Found response with an error message.
// If the JSON payload is invalid, it returns a 400 Bad Request response with the error details.
// If the update is successful, it updates the Pokemon in the database and returns a 200 OK response with the updated Pokemon data.
func (h *PokemonHandler) UpdatePokemon(c *gin.Context) {
	id := c.Param("id")
	var pokemon models.Pokemon
	if err := h.db.First(&pokemon, id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Pokemon not found"})
		return
	}

	var updatedPokemon models.Pokemon
	if err := c.ShouldBindJSON(&updatedPokemon); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	h.db.Model(&pokemon).Updates(updatedPokemon)
	c.JSON(http.StatusOK, gin.H{"data": pokemon})
}

// DeletePokemon deletes a Pokemon from the database based on the provided ID.
// It first retrieves the Pokemon from the database using the provided ID.
// If the Pokemon is not found, it returns a 404 Not Found response with an error message.
// If the delete operation encounters an error, it returns a 500 Internal Server Error response with an error message.
// If the delete operation is successful, it returns a 200 OK response with a success message.
func (h *PokemonHandler) DeletePokemon(c *gin.Context) {
	id := c.Param("id")
	var pokemon models.Pokemon
	if err := h.db.First(&pokemon, id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Pokemon not found"})
		return
	}

	if err := h.db.Delete(&pokemon).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to delete Pokemon"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"data": "Pokemon deleted successfully"})
}
