package controllers

import (
	"net/http"

	"github.com/JacobPotter/poke-db/api/models"
	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

// @BasePath /api/v1

// HealthHandler represents a handler for health-related operations.
type HealthHandler struct {
	db *gorm.DB
}

// NewHealthHandler creates a new HealthHandler instance with the provided *gorm.DB.
func NewHealthHandler(db *gorm.DB) *HealthHandler {
	return &HealthHandler{
		db: db,
	}
}

// Healthz checks the health of the API service.
//
// @Summary Health check
// @Description Returns the health status of the API service
// @Tags health
// @Accept json
// @Produce json
// @Success 200 {object} models.HealthResponse
// @Router /healthz [get]
func (h *HealthHandler) Healthz(c *gin.Context) {
	c.JSON(http.StatusOK, models.HealthResponse{
		Status: "ok",
	})
}
