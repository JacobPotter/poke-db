package controllers

import (
	"github.com/JacobPotter/poke-db/api/models"
	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
	"net/http"
)

// TypeHandler represents a handler for managing types in the application.
type TypeHandler struct {
	db *gorm.DB
}

// NewTypeHandler creates a new instance of the TypeHandler struct.
// It takes a pointer to a gorm.DB object as a parameter and returns a pointer to the TypeHandler object.
// The TypeHandler struct is used to manage types in the application.
// It has methods for creating, retrieving, updating, and deleting types.
// The db parameter is used to interact with the database.
// Example usage:
//
//	db, err := gorm.Open("postgres", "host=localhost port=5432 user=test dbname=test password=pass")
//	if err != nil {
//	    log.Fatal(err)
//	}
//	defer db.Close()
//	handler := NewTypeHandler(db)
func NewTypeHandler(db *gorm.DB) *TypeHandler {
	return &TypeHandler{
		db: db,
	}
}

// CreateType creates a new type in the application.
// It binds the JSON data from the request body to a Type object.
// If there is an error in binding the JSON data, it returns a bad request error.
// It then creates the type in the database using the Model's Create method.
// If there is an error in creating the type, it returns an internal server error.
// Finally, it returns the created type in the response body with a status code of 201.
//
// @Summary Creates Type
//
// @Description create a new type
//
// @Tags type
//
// @Accept json
//
// @Produce json
//
// @Param data body models.Type true "The new type"
//
// @Success 201 {object} models.Type
//
// @Router /type [post]
func (h *TypeHandler) CreateType(c *gin.Context) {
	var pokeType models.Type
	if err := c.ShouldBindJSON(&pokeType); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	if err := h.db.Model(&pokeType).Create(&pokeType).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create Type"})
		return
	}
	c.JSON(http.StatusCreated, gin.H{"data": pokeType})
}

// GetType retrieves a type from the database based on the given ID.
// It expects the ID to be passed as a URL parameter.
// If the type is found, it will return the type data in the response body with a status code of 200.
// If the type is not found, it will return a JSON error message with a status code of 404.
//
// @Summary Get Type
//
// @Description Get type by ID
//
// @Tags type
//
// @Accept json
//
// @Param id  path int true "Type ID"
//
// @Produce json
//
// @Success 200 {object} models.Type
//
// @Router /type/{id} [get]
func (h *TypeHandler) GetType(c *gin.Context) {
	id := c.Param("id")
	var pokeType models.Type
	if err := h.db.Where("id = ?", id).First(&pokeType).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Type not found"})
		return
	}
	c.JSON(http.StatusOK, gin.H{"data": pokeType})
}

// ListType retrieves a list of all types from the database.
// It queries the database using the Model's Find method.
// If there is an error in fetching the types, it returns an internal server error.
// Otherwise, it returns the list of types in the response body
// with a status code of 200.
//
// @Summary List Types
//
// @Description List Types
//
// @Tags type
//
// @Accept json
//
// @Produce json
//
// @Success 200 {object} models.Types
//
// @Router /type [get]
func (h *TypeHandler) ListType(c *gin.Context) {
	var types []models.Type
	page, pageSize := models.GetPaginationQueryParams(c)
	if err := h.db.Scopes(models.Paginate(page, pageSize)).Find(&types).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch Types"})
		return
	}
	c.JSON(http.StatusOK, gin.H{"data": types})
}

// UpdateType updates a type in the application with the specified ID.
// It retrieves the type from the database based on the ID provided in the URL parameter.
// If the type is not found, it returns a JSON error message with a status code of 404.
// It then binds the JSON data from the request body to an updatedType object.
// If there is an error in binding the JSON data, it returns a bad request error.
// It updates the retrieved type in the database using the Model's Updates method.
// Finally, it returns the updated type in the response body with a status code of 200.
//
// @Summary Update Type
//
// @Description Update type by ID
//
// @Tags type
//
// @Accept json
//
// @Produce json
//
// @Param id  path int true "Type ID"
//
// @Param data body models.Type true "The updated type"
//
// @Success 200 {object} models.Type
//
// @Router /type/{id} [put]
func (h *TypeHandler) UpdateType(c *gin.Context) {
	id := c.Param("id")
	var pokeType models.Type
	if err := h.db.First(&pokeType, id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Type not found"})
		return
	}

	var updatedType models.Type
	if err := c.ShouldBindJSON(&updatedType); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	h.db.Model(&pokeType).Updates(updatedType)
	c.JSON(http.StatusOK, gin.H{"data": pokeType})
}

// DeleteType deletes a type from the application.
// It expects the type ID to be passed as a URL parameter.
// If the type is found, it will be deleted from the database.
// If the type is not found, it will return a JSON error message with a status code of 404.
// If there is an error in deleting the type, it will return an internal server error.
// @Summary Delete Type
//
// @Description Delete type by ID
//
// @Tags type
//
// @Accept json
//
// @Produce json
//
// @Param id  path int true "Type ID"
//
// @Success 200 {string} string "deleted"
//
// @Router /type/{id} [delete]
func (h *TypeHandler) DeleteType(c *gin.Context) {
	id := c.Param("id")
	var pokeType models.Type
	if err := h.db.First(&pokeType, id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Type not found"})
		return
	}

	if err := h.db.Delete(&pokeType).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to delete Type"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"data": "Type deleted successfully"})
}
