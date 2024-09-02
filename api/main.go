package main

import (
	"github.com/JacobPotter/poke-db/api/docs"
	"github.com/JacobPotter/poke-db/api/models"
	"github.com/JacobPotter/poke-db/api/routes"
	"github.com/joho/godotenv"
	swaggerfiles "github.com/swaggo/files"
	ginSwagger "github.com/swaggo/gin-swagger"
	"log"
)

// @title           PokeDB API
// @version         1.0
// @description     Pokemon Database API.

// @contact.name   Jacob Potter
// @contact.email  pttr.jcb@gmail.com

// @license.name  Apache 2.0
// @license.url   http://www.apache.org/licenses/LICENSE-2.0.html

// @host      localhost:8080
// @BasePath  /api/v1

// main is the entry point of the application.
// It connects to the database, sets up the router, and starts the server.
// If an error occurs during the connection or server startup, a fatal log is generated.
func main() {

	err := godotenv.Load()
	if err != nil {
		log.Print("Error loading .env file")
	}

	docs.SwaggerInfo.BasePath = "/api/v1"
	models.ConnectDatabase()

	router := routes.SetupRouter(models.DB)

	router.GET("/swagger/*any", ginSwagger.WrapHandler(swaggerfiles.Handler))
	err = router.Run()

	if err != nil {
		log.Fatalf("router err: %v", err)
	}
}
