package routes

import (
	"github.com/JacobPotter/poke-db/api/routes/evolutionroutes"
	"github.com/JacobPotter/poke-db/api/routes/healthroutes"
	"github.com/JacobPotter/poke-db/api/routes/pokemonroutes"
	"github.com/JacobPotter/poke-db/api/routes/typeroutes"
	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

// SetupRouter initializes and configures a new gin.Engine instance with default middleware.
// It registers various routes for handling Pokemon, Evolution, Move, and Type related operations.
// The provided db parameter is used to create instances of the corresponding handlers.
// Returns the configured gin.Engine instance.
func SetupRouter(db *gorm.DB) *gin.Engine {

	router := gin.Default()

	healthroutes.RegisterRoutes(router, db)

	v1 := router.Group("/api/v1")
	{
		pokemonroutes.RegisterRoutes(v1, db)
		typeroutes.RegisterRoutes(v1, db)
		evolutionroutes.RegisterRoutes(v1, db)
		healthroutes.RegisterRoutes(v1, db)
	}
	return router
}
