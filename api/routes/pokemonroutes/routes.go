package pokemonroutes

import (
	"github.com/WebWizardsDev/poke-db/api/controllers"
	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

func RegisterRoutes(router *gin.RouterGroup, db *gorm.DB) {
	handler := controllers.NewPokemonHandler(db)
	// Define routes
	router.GET("/pokemon/:id", handler.GetPokemon)
	router.GET("/pokemon", handler.ListPokemon)
}
