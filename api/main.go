package main

import (
	"fmt"
	"github.com/WebWizardsDev/poke-db/api/docs"
	"github.com/WebWizardsDev/poke-db/api/models"
	"github.com/WebWizardsDev/poke-db/api/routes"
	"github.com/bamzi/jobrunner"
	"github.com/gin-gonic/gin"
	"github.com/joho/godotenv"
	cors "github.com/rs/cors/wrapper/gin"
	swaggerfiles "github.com/swaggo/files"
	ginSwagger "github.com/swaggo/gin-swagger"
	"log"
	"os"
)

//

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

	// Resource to return the JSON data

	router := routes.SetupRouter(models.DB)

	//initJobs := os.Getenv("INIT_JOBS")

	//jobrunner.Start()
	//if initJobs == "true" {
	//	jobrunner.In(5*time.Second, jobs.RefreshDB{DB: models.DB})
	//}
	//err = jobrunner.Schedule("0 0 * * *", jobs.RefreshDB{DB: models.DB})

	router.GET("/swagger/*any", ginSwagger.WrapHandler(swaggerfiles.Handler))

	router.GET("/jobrunner/json", JobJson)

	// Returns html page at given endpoint based on the loaded
	// template from above
	router.GET("/jobrunner/html", JobHtml)

	router.Use(cors.Default())
	port := os.Getenv("PORT")

	if port == "" {
		port = "8080"
	}

	err = router.Run(fmt.Sprintf(":%s", port))

	if err != nil {
		log.Fatalf("router err: %v", err)
	}
}

func JobJson(c *gin.Context) {
	// returns a map[string]interface{} that can be marshalled as JSON
	c.JSON(200, jobrunner.StatusJson())
}

func JobHtml(c *gin.Context) {
	// Returns the template data pre-parsed
	c.HTML(200, "", jobrunner.StatusPage())

}
