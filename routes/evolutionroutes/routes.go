package evolutionroutes

import (
	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
	"poke-db/controllers"
)

func RegisterRoutes(router *gin.Engine, db *gorm.DB) {
	handler := controllers.NewEvolutionHandler(db)
	// Define routes
	router.POST("/evolution", handler.CreateEvolution)
	router.GET("/evolution/:id", handler.GetEvolution)
	router.GET("/evolution", handler.ListEvolution)
	router.PUT("/evolution/:id", handler.UpdateEvolution)
	router.DELETE("/evolution/:id", handler.DeleteEvolution)
}
