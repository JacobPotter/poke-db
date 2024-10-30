package controllers

import (
	"github.com/JacobPotter/poke-db/api/models"
	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
	"net/http"
)

// @BasePath /api/v1

// EvolutionRequirementHandler represents a handler for evolution requirements.
// It contains a database connection object.
type EvolutionRequirementHandler struct {
	db *gorm.DB
}

// NewEvolutionRequirementHandler creates a new instance of EvolutionRequirementHandler.
// It takes a *gorm.DB as an argument and returns a pointer to EvolutionRequirementHandler.
// The EvolutionRequirementHandler struct contains a reference to the database connection object.
func NewEvolutionRequirementHandler(db *gorm.DB) *EvolutionRequirementHandler {
	return &EvolutionRequirementHandler{
		db: db,
	}
}

// ListEvolutionRequirements retrieves a list of evolution requirements from the database and
// returns them as JSON. It uses pagination parameters from the request query string to determine
// which page of results to retrieve. If an error occurs during the database query, it returns
// an HTTP 500 Internal Server Error response with the error message. Otherwise, it returns
// an HTTP 200 OK response with the list of evolution requirements in the "evolution_requirements" field of the JSON response body.
//
// @Summary List Evolution Requirements
//
// @Description List Evolution Requirements
//
// @Tags evolution_requirements
//
// @Accept json
//
// @Produce json
//
// @Success 200 {object} models.EvolutionRequirement
//
// @Router /evolution_requirements [get]
func (h *EvolutionRequirementHandler) ListEvolutionRequirements(c *gin.Context) {
	var evolutionRequirements []models.EvolutionRequirement

	page, pageSize := models.GetPaginationQueryParams(c)

	if err := h.db.Scopes(models.Paginate(page, pageSize)).Find(&evolutionRequirements).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err, "message": "Failed to fetch Evolution Requirements"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"evolution_requirements": evolutionRequirements})

}

// GetEvolutionRequirement retrieves an evolution requirement from the database based on the provided ID.
// It takes the ID parameter from the request URL and queries the database for the corresponding evolution requirement.
// If the evolution requirement is found, it returns an HTTP 200 OK response with the evolution requirement in the "evolution_requirement" field of the JSON response body.
// If the evolution requirement is not found, it returns an HTTP 500 Internal Server Error response with an error message.
//
// @Summary Get Evolution Requirement
//
// @Description Get evolution requirement by ID
//
// @Tags evolution_requirements
//
// @Accept json
//
// @Param id  path int true "Evolution Requirement ID"
//
// @Produce json
//
// @Success 200 {object} models.EvolutionRequirement
//
// @Router /evolution_requirements/{id} [get]
func (h *EvolutionRequirementHandler) GetEvolutionRequirement(c *gin.Context) {
	id := c.Param("id")
	var evolutionRequirement models.EvolutionRequirement
	if err := h.db.Where("id = ?", id).First(&evolutionRequirement).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err, "message": "Failed to fetch Evolution Requirement"})
		return
	}
	c.JSON(http.StatusOK, gin.H{"evolution_requirement": evolutionRequirement})
}

// CreateEvolutionRequirement creates a new evolution requirement in the database based on the provided JSON data.
// It binds the JSON data to a models.EvolutionRequirement struct and validates the input. If the input is invalid,
// it returns an HTTP 400 Bad Request response with the error message. Otherwise, it inserts the new evolution requirement
// into the database, and returns an HTTP 200 OK response with the created evolution requirement in the "evolution_requirement" field
// of the JSON response body.
//
// @Summary Creates Evolution Requirement
//
// @Description create a new evolution requirement
//
// @Tags evolution_requirements
//
// @Accept json
//
// @Produce json
//
// @Param data body models.EvolutionRequirement true "The new evolution requirement"
//
// @Success 201 {object} models.EvolutionRequirement
//
// @Router /evolution_requirements [post]
func (h *EvolutionRequirementHandler) CreateEvolutionRequirement(c *gin.Context) {
	var evolutionRequirement models.EvolutionRequirement
	if err := c.ShouldBindJSON(&evolutionRequirement); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err})
		return
	}
	h.db.Create(&evolutionRequirement)
	c.JSON(http.StatusCreated, gin.H{"evolution_requirement": evolutionRequirement})
}

// UpdateEvolutionRequirement updates an evolution requirement in the database based on the provided ID.
// It takes the ID parameter from the request URL and queries the database for the corresponding evolution requirement.
// If the evolution requirement is found, it binds the JSON data from the request body to a models.EvolutionRequirement struct and validates the input.
// If the input is valid, it updates the corresponding fields of the evolution requirement in the database with the new values and returns an HTTP 200 OK response with the updated evolution requirement in the "evolution_requirement" field of the JSON response body.
// If the evolution requirement is not found, it returns an HTTP 500 Internal Server Error response with an error message.
// If the input is invalid, it returns an HTTP 400 Bad Request response with the error message.
//
// @Summary Update Evolution Requirement
//
// @Description Update evolution requirement by ID
//
// @Tags evolution_requirements
//
// @Accept json
//
// @Produce json
//
// @Param id  path int true "Evolution Requirement ID"
//
// @Param data body models.EvolutionRequirement true "The updated evolution requirement"
//
// @Success 200 {object} models.EvolutionRequirement
//
// @Router /evolution_requirements/{id} [put]
func (h *EvolutionRequirementHandler) UpdateEvolutionRequirement(c *gin.Context) {
	id := c.Param("id")
	var evolutionRequirement models.EvolutionRequirement
	if err := h.db.Where("id = ?", id).First(&evolutionRequirement).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err, "message": "Failed to fetch Evolution Requirement"})
		return
	}

	var evolutionRequirementUpdated models.EvolutionRequirement
	if err := c.ShouldBindJSON(&evolutionRequirementUpdated); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err})
		return
	}

	if err := h.db.Model(&evolutionRequirement).Updates(&evolutionRequirementUpdated).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err, "message": "Failed to update Evolution Requirement"})
		return
	}
	c.JSON(http.StatusOK, gin.H{"evolution_requirement": evolutionRequirement})
}

// DeleteEvolutionRequirement deletes an evolution requirement from the database based on the provided ID.
// It takes the ID parameter from the request URL and queries the database for the corresponding evolution requirement.
// If the evolution requirement is found, it deletes it from the database and returns an HTTP 200 OK response with the "deleted" message in the response body.
// If the evolution requirement is not found, it returns an HTTP 500 Internal Server Error response with an error message.
// It uses the gin.Context parameter to access the HTTP request and write the response.
//
// @Summary Delete Evolution Requirement
//
// @Description Delete evolution requirement by ID
//
// @Tags evolution_requirements
//
// @Accept json
//
// @Produce json
//
// @Param id  path int true "Evolution Requirement ID"
//
// @Success 200 {string} string "deleted"
//
// @Router /evolution_requirements/{id} [delete]
func (h *EvolutionRequirementHandler) DeleteEvolutionRequirement(c *gin.Context) {
	id := c.Param("id")
	var evolutionRequirement models.EvolutionRequirement
	if err := h.db.Where("id = ?", id).First(&evolutionRequirement).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err, "message": "Failed to fetch Evolution Requirement"})
		return
	}

	if err := h.db.Delete(&evolutionRequirement).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err, "message": "Failed to delete Evolution Requirement"})
		return
	}

	c.JSON(http.StatusOK, "deleted")
}
