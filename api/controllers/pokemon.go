package controllers

import (
	"github.com/JacobPotter/poke-db/api/models"
	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
	"net/http"
)

// PokemonHandler represents a handler for Pokemon-related operations.
type PokemonHandler struct {
	db *gorm.DB
}

// NewPokemonHandler creates a new PokemonHandler instance with the provided *gorm.DB as the database connection.
// This function is used to initialize a PokemonHandler object and return its pointer.
// The returned PokemonHandler instance can be used to handle Pokemon-related operations like creating, retrieving, updating, and deleting Pokemon.
// The *gorm.DB parameter is used to establish a connection with the database and perform database operations.
// It should be a valid pointer to a *gorm.DB object.
// Example usage:
//
//	handler := NewPokemonHandler(db)
//	router.POST("/pokemon", handler.CreatePokemon)
//	router.GET("/pokemon/:id", handler.GetPokemon)
//	router.GET("/pokemon", handler.ListPokemon)
//	router.PUT("/pokemon/:id", handler.UpdatePokemon)
//	router.DELETE("/pokemon/:id", handler.DeletePokemon)
func NewPokemonHandler(db *gorm.DB) *PokemonHandler {
	return &PokemonHandler{
		db: db,
	}
}

// CreatePokemon creates a new Pokemon by parsing the JSON payload from the request body.
// If the JSON payload is invalid, it returns a 400 Bad Request response.
// After successfully creating the Pokemon, it returns a 201 Created response with the created data.
// This method is a handler for the "/pokemon" POST route.
//
// @Summary Creates Pokemon
//
// @Description create a new pokemon
//
// @Tags pokemon
//
// @Accept json
//
// @Produce json
//
// @Param data body models.Pokemon true "The new pokemon"
//
// @Success 201 {object} models.Pokemon
//
// @Router /pokemon [post]
func (h *PokemonHandler) CreatePokemon(c *gin.Context) {
	var pokemon models.Pokemon

	if err := c.ShouldBindJSON(&pokemon); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	h.db.Create(&pokemon)
	c.JSON(http.StatusCreated, pokemon)
}

// GetPokemon retrieves the details of a Pokemon based on the given ID.
// It first retrieves the Pokemon from the database using the provided ID.
// If the Pokemon is not found, it returns a 404 Not Found response.
// If the Pokemon is found, it returns a 200 OK response with the Pokemon data.
//
// @Summary Get Pokemon
//
// @Description Get pokemon by ID
//
// @Tags pokemon
//
// @Accept json
//
// @Param id  path int true "Pokemon ID"
//
// @Produce json
//
// @Success 200 {object} models.Pokemon
//
// @Router /pokemon/{id} [get]
func (h *PokemonHandler) GetPokemon(c *gin.Context) {
	id := c.Param("id")
	var pokemon models.Pokemon
	if err := h.db.First(&pokemon, id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Pokemon not found"})
		return
	}
	c.JSON(http.StatusOK, pokemon)
}

// ListPokemon fetches all Pokemon from the database and returns them as JSON data in the HTTP response.
// If there is an error fetching the Pokemon, it returns a 500 Internal Server Error response.
// This method is a handler for the "/pokemon" GET route.
//
// @Summary List Pokemon
//
// @Description List Pokemon
//
// @Tags pokemon
//
// @Accept json
//
// @Produce json
//
// @Success 200 {object} models.Pokemons
//
// @Router /pokemon [get]
func (h *PokemonHandler) ListPokemon(c *gin.Context) {
	var pokemon []models.Pokemon
	page, pageSize := models.GetPaginationQueryParams(c)
	if err := h.db.Scopes(models.Paginate(page, pageSize)).Find(&pokemon).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch Pokemon"})
		return
	}
	c.JSON(http.StatusOK, gin.H{"pokemon": pokemon})
}

// UpdatePokemon updates the details of a Pokemon based on the provided ID.
// It first retrieves the Pokemon from the database using the provided ID.
// If the Pokemon is not found, it returns a 404 Not Found response with an error message.
// If the JSON payload is invalid, it returns a 400 Bad Request response with the error details.
// If the update is successful, it updates the Pokemon in the database and returns a 200 OK response with the updated Pokemon data.
//
// @Summary Update Pokemon
//
// @Description Update pokemon by ID
//
// @Tags pokemon
//
// @Accept json
//
// @Produce json
//
// @Param id  path int true "Pokemon ID"
//
// @Param data body models.Pokemon true "The updated pokemon"
//
// @Success 200 {object} models.Pokemon
//
// @Router /pokemon/{id} [put]
func (h *PokemonHandler) UpdatePokemon(c *gin.Context) {
	id := c.Param("id")
	var pokemon models.Pokemon
	if err := h.db.Model(&pokemon).Where("id = ?", id).First(&pokemon).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Pokemon not found"})
		return
	}

	var updatedPokemon models.Pokemon
	if err := c.ShouldBindJSON(&updatedPokemon); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	h.db.Model(&pokemon).Updates(updatedPokemon)
	c.JSON(http.StatusOK, updatedPokemon)
}

// DeletePokemon deletes a Pokemon from the database based on the provided ID.
// It first retrieves the Pokemon from the database using the provided ID.
// If the Pokemon is not found, it returns a 404 Not Found response with an error message.
// If the delete operation encounters an error, it returns a 500 Internal Server Error response with an error message.
// If the delete operation is successful, it returns a 200 OK response with a success message.
//
// @Summary Delete Pokemon
//
// @Description Delete pokemon by ID
//
// @Tags pokemon
//
// @Accept json
//
// @Produce json
//
// @Param id  path int true "Pokemon ID"
//
// @Success 200 {string} string "deleted"
//
// @Router /pokemon/{id} [delete]
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
