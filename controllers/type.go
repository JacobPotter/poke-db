package controllers

import (
	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
	"net/http"
	"poke-db/models"
)

// Move this code to the end of the controllers package file

// TypeHandler represents a handler for managing types in the application.
type TypeHandler struct {
	db *gorm.DB
}

func NewTypeHandler(db *gorm.DB) *TypeHandler {
	return &TypeHandler{
		db: db,
	}
}

func (h *TypeHandler) CreateType(c *gin.Context) {
	var pokeType models.Type
	if err := c.ShouldBindJSON(&pokeType); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	h.db.Create(&pokeType)
	c.JSON(http.StatusCreated, gin.H{"data": pokeType})
}

func (h *TypeHandler) GetType(c *gin.Context) {
	id := c.Param("id")
	var pokeType models.Type
	if err := h.db.First(&pokeType, id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Type not found"})
		return
	}
	c.JSON(http.StatusOK, gin.H{"data": pokeType})
}

func (h *TypeHandler) ListType(c *gin.Context) {
	var types []models.Type
	if err := h.db.Find(&types).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch Types"})
		return
	}
	c.JSON(http.StatusOK, gin.H{"data": types})
}

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
