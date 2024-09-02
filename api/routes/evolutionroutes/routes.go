package evolutionroutes

import (
	"github.com/JacobPotter/poke-db/api/controllers"
	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

func RegisterRoutes(router *gin.RouterGroup, db *gorm.DB) {
	handler := controllers.NewEvolutionHandler(db)
	// Define routes
	router.POST("/evolution", handler.CreateEvolution)
	router.GET("/evolution/:id", handler.GetEvolution)
	router.GET("/evolution", handler.ListEvolution)
	router.PUT("/evolution/:id", handler.UpdateEvolution)
	router.DELETE("/evolution/:id", handler.DeleteEvolution)
}
