package controllers

import (
	"github.com/WebWizardsDev/poke-db/api/models"
	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
	"log"
	"net/http"
)

// @BasePath /api/v1

// TypeHandler represents a handler for managing moveTypes in the application.
type TypeHandler struct {
	db *gorm.DB
}

// NewTypeHandler creates a new instance of TypeHandler with the given *gorm.DB.
// It returns a pointer to the created TypeHandler.
//
// @param db *gorm.DB - The database object to be used by TypeHandler.
//
// @returns *TypeHandler - A pointer to the created TypeHandler object.
//
// Example Usage:
//
//	handler := NewTypeHandler(db)
//
//	router.POST("/type", handler.CreateType)
//	router.GET("/type/:id", handler.GetType)
//	router.GET("/type", handler.ListType)
//	router.PUT("/type/:id", handler.UpdateType)
//	router.DELETE("/type/:id", handler.DeleteType)
//
// Implementation Example:
//
//		func RegisterRoutes(router *gin.RouterGroup, db *gorm.DB) {
//	 	   handler := NewTypeHandler(db)
//	    	...
//		}
func NewTypeHandler(db *gorm.DB) *TypeHandler {
	return &TypeHandler{
		db: db,
	}
}

// CreateType creates a new type in the application.
// It binds the JSON data from the request body to a MoveType object.
// If there is an error in binding the JSON data, it returns a bad request error.
// It then creates the type in the database using the Model's Create method.
// If there is an error in creating the type, it returns an internal server error.
// Finally, it returns the created type in the response body with a status code of 201.
//
// @Summary Creates MoveType
//
// @Description create a new type
//
// @Tags type
//
// @Accept json
//
// @Produce json
//
// @Param data body models.MoveType true "The new type"
//
// @Success 201 {object} models.MoveType
//
//// @Router /type [post]
//func (h *TypeHandler) CreateType(c *gin.Context) {
//	var pokeType models.MoveType
//	if err := c.ShouldBindJSON(&pokeType); err != nil {
//		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
//		return
//	}
//	if err := h.db.Model(&pokeType).Create(&pokeType).Error; err != nil {
//		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create MoveType"})
//		return
//	}
//	c.JSON(http.StatusCreated, gin.H{"data": pokeType})
//}

// GetType retrieves a type from the database based on the given GenericId.
// It expects the GenericId to be passed as a URL parameter.
// If the type is found, it will return the type data in the response body with a status code of 200.
// If the type is not found, it will return a JSON error message with a status code of 404.
//
// @Summary Get MoveType
//
// @Description Get type by GenericId
//
// @Tags type
//
// @Accept json
//
// @Param id  path int true "MoveType GenericId"
//
// @Produce json
//
// @Success 200 {object} models.MoveType
//
// @Router /type/{id} [get]
func (h *TypeHandler) GetType(c *gin.Context) {
	id := c.Param("id")
	var pokeType models.MoveType
	if err := h.db.Where("id = ?", id).First(&pokeType).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "MoveType not found"})
		return
	}
	c.JSON(http.StatusOK, gin.H{"data": pokeType})
}

// ListType retrieves a list of all moveTypes from the database.
// It queries the database using the Model's Find method.
// If there is an error in fetching the moveTypes, it returns an internal server error.
// Otherwise, it returns the list of moveTypes in the response body
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
// @Success 200 {object}
//
// @Router /type [get]
func (h *TypeHandler) ListType(c *gin.Context) {
	var types []models.MoveType
	page, pageSize := models.GetPaginationQueryParams(c)
	tx := h.db.Model(models.MoveType{}).Scopes(models.Paginate(page, pageSize)).Find(&types)
	if tx.Error != nil {
		log.Printf("Error getting moveTypes: %v", tx.Error)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch Types"})
		return
	}
	c.JSON(http.StatusOK, gin.H{"data": types, "page": page, "pageSize": pageSize, "total": tx.RowsAffected})
}

// UpdateType updates a type in the application with the specified GenericId.
// It retrieves the type from the database based on the GenericId provided in the URL parameter.
// If the type is not found, it returns a JSON error message with a status code of 404.
// It then binds the JSON data from the request body to an updatedType object.
// If there is an error in binding the JSON data, it returns a bad request error.
// It updates the retrieved type in the database using the Model's Updates method.
// Finally, it returns the updated type in the response body with a status code of 200.
//
// @Summary Update MoveType
//
// @Description Update type by GenericId
//
// @Tags type
//
// @Accept json
//
// @Produce json
//
// @Param id  path int true "MoveType GenericId"
//
// @Param data body models.MoveType true "The updated type"
//
// @Success 200 {object} models.MoveType
//
// @Router /type/{id} [put]
//func (h *TypeHandler) UpdateType(c *gin.Context) {
//	id := c.Param("id")
//	var pokeType models.MoveType
//	if err := h.db.First(&pokeType, id).Error; err != nil {
//		c.JSON(http.StatusNotFound, gin.H{"error": "MoveType not found"})
//		return
//	}
//
//	var updatedType models.MoveType
//	if err := c.ShouldBindJSON(&updatedType); err != nil {
//		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
//		return
//	}
//
//	h.db.Model(&pokeType).Updates(updatedType)
//	c.JSON(http.StatusOK, gin.H{"data": pokeType})
//}

// DeleteType deletes a type from the application.
// It expects the type GenericId to be passed as a URL parameter.
// If the type is found, it will be deleted from the database.
// If the type is not found, it will return a JSON error message with a status code of 404.
// If there is an error in deleting the type, it will return an internal server error.
// @Summary Delete MoveType
//
// @Description Delete type by GenericId
//
// @Tags type
//
// @Accept json
//
// @Produce json
//
// @Param id  path int true "MoveType GenericId"
//
// @Success 200 {string} string "deleted"
//
// @Router /type/{id} [delete]
//func (h *TypeHandler) DeleteType(c *gin.Context) {
//	id := c.Param("id")
//	var pokeType models.MoveType
//	if err := h.db.First(&pokeType, id).Error; err != nil {
//		c.JSON(http.StatusNotFound, gin.H{"error": "MoveType not found"})
//		return
//	}
//
//	if err := h.db.Delete(&pokeType).Error; err != nil {
//		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to delete MoveType"})
//		return
//	}
//
//	c.JSON(http.StatusOK, gin.H{"data": "MoveType deleted successfully"})
//}
