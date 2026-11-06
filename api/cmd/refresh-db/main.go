// Command refresh-db ingests PokeAPI data into the database and exits.
// It runs as a Kubernetes CronJob (nightly refresh) and as an Argo CD
// PostSync hook with -if-empty (initial seed of a fresh environment).
package main

import (
	"flag"
	"log"
	"os"

	"github.com/JacobPotter/poke-db/api/models"
	"github.com/JacobPotter/poke-db/api/refresh"
)

func main() {
	ifEmpty := flag.Bool("if-empty", false, "skip the refresh if the database is already seeded")
	flag.Parse()

	// ConnectDatabase loads .env (if present) and runs the core migrations.
	models.ConnectDatabase()

	if err := models.MigrateAll(models.DB); err != nil {
		log.Fatalf("refresh-db: migrating database: %v", err)
	}

	if *ifEmpty {
		var count int64
		if err := models.DB.Model(&models.MoveType{}).Count(&count).Error; err != nil {
			log.Fatalf("refresh-db: checking existing data: %v", err)
		}
		if count > 0 {
			log.Printf("refresh-db: already seeded (%d move types), skipping", count)
			return
		}
	}

	r := refresh.RefreshDB{DB: models.DB, Test: os.Getenv("REFRESH_TEST_MODE") == "true"}
	if err := r.Run(); err != nil {
		log.Fatalf("refresh-db: %v", err)
	}

	log.Print("refresh-db: completed")
}
