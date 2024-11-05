package evolutionroutes

import (
	"github.com/WebWizardsDev/poke-db/api/controllers"
	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

func RegisterRoutes(router *gin.RouterGroup, db *gorm.DB) {
	handler := controllers.NewEvolutionHandler(db)
	// Define routes
	router.GET("/evolution/:id", handler.GetEvolutionChain)
	router.GET("/evolution", handler.ListEvolutionChains)
}
