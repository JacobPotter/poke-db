package controllers

import (
	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
	"net/http"
	"poke-db/models"
)

// EvolutionHandler represents a handler for managing evolutions in the application.
type EvolutionHandler struct {
	db *gorm.DB
}

func NewEvolutionHandler(db *gorm.DB) *EvolutionHandler {
	return &EvolutionHandler{
		db: db,
	}
}

func (h *EvolutionHandler) CreateEvolution(c *gin.Context) {
	var evolution models.Evolution
	if err := c.ShouldBindJSON(&evolution); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	h.db.Create(&evolution)
	c.JSON(http.StatusCreated, gin.H{"data": evolution})
}

func (h *EvolutionHandler) GetEvolution(c *gin.Context) {
	id := c.Param("id")
	var evolution models.Evolution
	if err := h.db.First(&evolution, id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Evolution not found"})
		return
	}
	c.JSON(http.StatusOK, gin.H{"data": evolution})
}

func (h *EvolutionHandler) ListEvolution(c *gin.Context) {
	var evolutions []models.Evolution
	if err := h.db.Find(&evolutions).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch Evolutions"})
		return
	}
	c.JSON(http.StatusOK, gin.H{"data": evolutions})
}

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

	h.db.Model(&evolution).Updates(updatedEvolution)
	c.JSON(http.StatusOK, gin.H{"data": evolution})
}

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

	c.JSON(http.StatusOK, gin.H{"data": "Evolution deleted successfully"})
}
