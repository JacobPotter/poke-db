package main

import (
	"github.com/gin-gonic/gin"
	"log"
	"poke-db/models"
	"poke-db/routes/evolutionroutes"
	"poke-db/routes/moveroutes"
	"poke-db/routes/pokemonroutes"
	"poke-db/routes/typeroutes"
)

func main() {

	router := gin.Default()

	models.ConnectDatabase()

	pokemonroutes.RegisterRoutes(router, models.DB)
	evolutionroutes.RegisterRoutes(router, models.DB)
	moveroutes.RegisterRoutes(router, models.DB)
	typeroutes.RegisterRoutes(router, models.DB)

	err := router.Run()
	if err != nil {
		log.Fatalf("router err: %v", err)
	}
}
