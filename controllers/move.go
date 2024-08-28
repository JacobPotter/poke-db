package controllers

import (
	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
	"net/http"
	"poke-db/models"
)

// MoveHandler represents a handler for managing moves in the application.
type MoveHandler struct {
	db *gorm.DB
}

func NewMoveHandler(db *gorm.DB) *MoveHandler {
	return &MoveHandler{
		db: db,
	}
}

func (h *MoveHandler) CreateMove(c *gin.Context) {
	var move models.Move
	if err := c.ShouldBindJSON(&move); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	h.db.Create(&move)
	c.JSON(http.StatusCreated, gin.H{"data": move})
}

func (h *MoveHandler) GetMove(c *gin.Context) {
	id := c.Param("id")
	var move models.Move
	if err := h.db.First(&move, id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Move not found"})
		return
	}
	c.JSON(http.StatusOK, gin.H{"data": move})
}

func (h *MoveHandler) ListMove(c *gin.Context) {
	var moves []models.Move
	if err := h.db.Find(&moves).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch Moves"})
		return
	}
	c.JSON(http.StatusOK, gin.H{"data": moves})
}

func (h *MoveHandler) UpdateMove(c *gin.Context) {
	id := c.Param("id")
	var move models.Move
	if err := h.db.First(&move, id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Move not found"})
		return
	}

	var updatedMove models.Move
	if err := c.ShouldBindJSON(&updatedMove); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	h.db.Model(&move).Updates(updatedMove)
	c.JSON(http.StatusOK, gin.H{"data": move})
}

func (h *MoveHandler) DeleteMove(c *gin.Context) {
	id := c.Param("id")
	var move models.Move
	if err := h.db.First(&move, id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Move not found"})
		return
	}

	if err := h.db.Delete(&move).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to delete Move"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"data": "Move deleted successfully"})
}
