package evolutionrequirementroutes

import (
	"github.com/JacobPotter/poke-db/api/controllers"
	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

func RegisterRoutes(router *gin.RouterGroup, db *gorm.DB) {
	handler := controllers.NewEvolutionRequirementHandler(db)
	// Define routes
	router.POST("/evolution_requirements", handler.CreateEvolutionRequirement)
	router.GET("/evolution_requirements/:id", handler.GetEvolutionRequirement)
	router.GET("/evolution_requirements", handler.ListEvolutionRequirements)
	router.PUT("/evolution_requirements/:id", handler.UpdateEvolutionRequirement)
	router.DELETE("/evolution_requirements/:id", handler.DeleteEvolutionRequirement)
}
