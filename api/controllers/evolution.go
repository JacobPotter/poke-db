package controllers

import (
	"github.com/JacobPotter/poke-db/api/models"
	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
	"log"
	"net/http"
)

// @BasePath /api/v1

// EvolutionHandler represents a handler for managing evolutions in the application.
type EvolutionHandler struct {
	db *gorm.DB
}

// NewEvolutionHandler creates a new EvolutionHandler instance with the given *gorm.DB.
// The EvolutionHandler is used for managing evolutions in the application.
// It contains methods for creating, retrieving, updating, and deleting evolutions.
//
// Usage example:
//
//	   handler := NewEvolutionHandler(db)
//	   // Define routes
//		  router.POST("/evolution", handler.CreateEvolution)
//		  router.GET("/evolution/:id", handler.GetEvolution)
//		  router.GET("/evolution", handler.ListEvolution)
//		  router.PUT("/evolution/:id", handler.UpdateEvolution)
//		  router.DELETE("/evolution/:id", handler.DeleteEvolution)
func NewEvolutionHandler(db *gorm.DB) *EvolutionHandler {
	return &EvolutionHandler{
		db: db,
	}
}

// CreateEvolution creates a new evolution in the application. It parses the JSON data from the request,
// binds it to the Evolution model, and saves it to the database using the Create method of the gorm.DB instance.
// If the JSON data is invalid or there is an error during the creation process, it returns a JSON response with an error message.
// Otherwise, it returns a JSON response with the created evolution data.
//
// @Summary Creates Evolution
//
// @Description create a new evolution
//
// @Tags evolution
//
// @Accept json
//
// @Produce json
//
// @Param data body models.Evolution true "The new evolution"
//
// @Success 201 {object} models.Evolution
//
// @Router /evolution [post]
func (h *EvolutionHandler) CreateEvolution(c *gin.Context) {
	var evolution models.Evolution
	if err := c.ShouldBindJSON(&evolution); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	h.db.Create(&evolution)
	c.JSON(http.StatusCreated, gin.H{"data": evolution})
}

// GetEvolution retrieves the evolution with the specified ID from the database.
// If the evolution is found, it returns a JSON response with the evolution data.
// If the evolution is not found, it returns a JSON response with an error message.
// The ID of the evolution is obtained from the URL parameter.
// This method is used in the EvolutionHandler to handle the GET request for retrieving a specific evolution.
//
// @Summary Get Evolution
//
// @Description Get evolution by ID
//
// @Tags evolution
//
// @Accept json
//
// @Param id  path int true "Evolution ID"
//
// @Produce json
//
// @Success 200 {object} models.Evolution
//
// @Router /evolution/{id} [get]
func (h *EvolutionHandler) GetEvolution(c *gin.Context) {
	id := c.Param("id")
	var evolution models.Evolution
	if err := h.db.First(&evolution, id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Evolution not found"})
		return
	}
	c.JSON(http.StatusOK, gin.H{"data": evolution})
}

// ListEvolution retrieves a list of evolutions from the database.
// It queries all the evolution records using the Find method of the gorm.DB instance.
// If there is an error during the query process, it returns a JSON response with an error message.
// Otherwise, it returns a JSON response with the list of evolution data.
//
// @Summary List Evolutions
//
// @Description List Evolutions
//
// @Tags evolution
//
// @Accept json
//
// @Produce json
//
// @Success 200 {object} models.Evolutions
//
// @Router /evolution [get]
func (h *EvolutionHandler) ListEvolution(c *gin.Context) {
	var evolutions []models.Evolution

	page, pageSize := models.GetPaginationQueryParams(c)
	if err := h.db.Scopes(models.Paginate(page, pageSize)).Find(&evolutions).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch Evolutions"})
		return
	}
	c.JSON(http.StatusOK, gin.H{"evolutions": evolutions})
}

// UpdateEvolution updates the evolution with the specified ID.
// It first retrieves the evolution from the database using the provided ID.
// If the evolution is not found, it returns a JSON response with an error message.
// Then, it parses the JSON data from the request and binds it to the updatedEvolution variable.
// If the JSON data is invalid, it returns a JSON response with the error message.
// Next, it updates the evolution in the database with the new data using the Updates method.
// Finally, it returns a JSON response with the updated evolution data.
//
// @Summary Update Evolution
//
// @Description Update evolution by ID
//
// @Tags evolution
//
// @Accept json
//
// @Produce json
//
// @Param id  path int true "Evolution ID"
//
// @Param data body models.Evolution true "The updated evolution"
//
// @Success 200 {object} models.Evolution
//
// @Router /evolution/{id} [put]
func (h *EvolutionHandler) UpdateEvolution(c *gin.Context) {
	id := c.Param("id")
	var evolution models.Evolution
	if err := h.db.First(&evolution, id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Evolution not found"})
		return
	}

	var updatedEvolution models.Evolution
	if err := c.ShouldBindJSON(&updatedEvolution); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	if err := h.db.Model(&updatedEvolution).Updates(updatedEvolution).Error; err != nil {
		log.Printf("Failed to update Evolution: %s", err.Error())
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update Evolution"})
		return
	}
	c.JSON(http.StatusOK, updatedEvolution)
}

// DeleteEvolution deletes an evolution from the database based on the provided ID.
// It first retrieves the evolution with the specified ID from the database.
// If the evolution is not found, it returns a JSON response with an error message.
// Then, it removes the evolution from the database using the Delete method.
// If there is an error during the deletion process, it returns a JSON response with an error message.
// Finally, it returns a JSON response indicating that the evolution was deleted successfully.
//
// @Summary Delete Evolution
//
// @Description Delete evolution by ID
//
// @Tags evolution
//
// @Accept json
//
// @Produce json
//
// @Param id  path int true "Evolution ID"
//
// @Success 200 {string} string "deleted"
//
// @Router /evolution/{id} [delete]
func (h *EvolutionHandler) DeleteEvolution(c *gin.Context) {
	id := c.Param("id")
	var evolution models.Evolution
	if err := h.db.First(&evolution, id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Evolution not found"})
		return
	}

	if err := h.db.Delete(&evolution).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to delete Evolution"})
		return
	}

	c.JSON(http.StatusOK, "deleted")
}
