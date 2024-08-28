package pokemonroutes

import (
	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
	"poke-db/controllers"
)

func RegisterRoutes(router *gin.Engine, db *gorm.DB) {
	handler := controllers.NewPokemonHandler(db)
	// Define routes
	router.POST("/pokemon", handler.CreatePokemon)
	router.GET("/pokemon/:id", handler.GetPokemon)
	router.GET("/pokemon", handler.ListPokemon)
	router.PUT("/pokemon/:id", handler.UpdatePokemon)
	router.DELETE("/pokemon/:id", handler.DeletePokemon)
}
